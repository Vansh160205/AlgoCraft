const { parseInputFormat, parseOutputFormat } = require('./parseIOFormats');

function generateBoilerplate(language, inputFormat, outputFormat) {
    const { functionName, params } = parseInputFormat(inputFormat);
    const { returnType } = parseOutputFormat(outputFormat);

    switch (language.toLowerCase()) {
        case "python":
            return `class Solution:
    def ${functionName}(self, ${params.map(p => p.name).join(', ')}):
        """
${params.map(p => `        :type ${p.name}: ${mapTypePythonDoc(p.type)}`).join("\n")}
        :rtype: ${mapTypePythonDoc(returnType)}
        """
        # Write your code here
        return ${getDefaultReturnValue(language, returnType)}
            `.trim();

        case "cpp":
            return `
class Solution {
public:
    ${mapTypeCpp(returnType)} ${functionName}(${params.map(p => `${mapTypeCpp(p.type)} ${p.name}`).join(', ')}) {
        // Write your code here
        return ${getDefaultReturnValue(language, returnType)};
    }
};
            `.trim();

        case "java":
            return `
class Solution {
    public ${mapTypeJava(returnType)} ${functionName}(${params.map(p => `${mapTypeJava(p.type)} ${p.name}`).join(', ')}) {
        // Write your code here
        return ${getDefaultReturnValue(language, returnType)};
    }
}
            `.trim();

        default:
            throw new Error("Unsupported language");
    }
}

function generateFullCode(language, inputFormat, outputFormat, sourceCode) {
    const { functionName, params } = parseInputFormat(inputFormat);

    switch (language.toLowerCase()) {
        case 'python':
            // Check if the source code already contains the class Solution wrapper
            const needsClassWrapper = !sourceCode.trim().startsWith('class Solution:');
            const processedSource = needsClassWrapper
                ? indentSource(sourceCode.trim(), 1) // Indent if we're adding the class wrapper
                : removeOuterPythonClassWrapper(sourceCode); // Remove if it's already there

            // Dynamically create input parsing based on parameter types
            const pythonInputReads = params.map(p => {
                if (p.type === 'string') {
                    return `${p.name} = input()`;
                } else if (p.type === 'int') {
                    return `${p.name} = int(input())`;
                } else if (p.type === 'float') {
                    return `${p.name} = float(input())`;
                } else if (p.type === 'boolean') { // Added boolean input parsing
                    return `${p.name} = input().lower() == 'true'`;
                } else if (p.type.endsWith('[]')) {
                    // For lists, assume space-separated numbers/strings
                    const elementType = p.type.slice(0, -2);
                    if (elementType === 'int') return `${p.name} = list(map(int, input().split()))`;
                    if (elementType === 'float') return `${p.name} = list(map(float, input().split()))`;
                    if (elementType === 'string') return `${p.name} = input().split()`;
                    if (elementType === 'boolean') return `${p.name} = [s.lower() == 'true' for s in input().split()]`; // Array of booleans
                    return `${p.name} = input().split()`; // Default for unknown array types
                }
                return `${p.name} = input()`; // Default fallback
            }).join('\n    '); // Join with newline and indentation

            const functionCallParams = params.map(p => p.name).join(', '); // Parameters without 'self'
            const classInstantiationAndCall = `obj = Solution()\n    print(obj.${functionName}(${functionCallParams}))`;

            return `
${needsClassWrapper ? `class Solution:\n${processedSource}` : sourceCode}

if __name__ == "__main__":
    ${pythonInputReads}
    ${classInstantiationAndCall}
            `.trim();

        case 'cpp':
            return `
#include <bits/stdc++.h>
using namespace std;

class Solution {
public:
${indentSource(sourceCode, 1)}
};

int main() {
    ${cppTypeDecl(params)}
    ${readCppInput(params)}
    Solution obj;
    cout << obj.${functionName}(${params.map(p => p.name).join(", ")}) << endl;
    return 0;
}
            `.trim();

        case 'java':
            return `
import java.util.*;

class Solution {
${indentSource(removeDuplicateClassWrapper(sourceCode), 1)}
}

class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        ${javaTypeDecl(params)}
        ${readJavaInput(params)}
        Solution obj = new Solution();
        System.out.println(obj.${functionName}(${params.map(p => p.name).join(", ")}));
    }
}
            `.trim();

        default:
            throw new Error("Unsupported language for full code generation");
    }
}

// --- Helpers ---

function removeOuterPythonClassWrapper(code) {
    const match = code.match(/^(?:[\s\t]*?)class\s+Solution\s*:\s*([\s\S]*)$/m);
    if (match && match[1]) {
        const lines = match[1].split('\n');
        const minIndent = lines.reduce((min, line) => {
            if (line.trim().length === 0) return min;
            const currentIndent = line.match(/^(\s*)/)?.[1]?.length || 0;
            return Math.min(min, currentIndent);
        }, Infinity);

        if (minIndent === Infinity) return "";

        return lines.map(line => {
            return line.startsWith(' '.repeat(minIndent)) ? line.substring(minIndent) : line;
        }).join('\n').trim();
    }
    return code.trim();
}

function removeDuplicateClassWrapper(code) {
    const match = code.match(/class\s+Solution\s*\{([\s\S]*)\}/);
    if (match && match[1]) {
        const lines = match[1].split('\n');
        const minIndent = lines.reduce((min, line) => {
            if (line.trim().length === 0) return min;
            const currentIndent = line.match(/^(\s*)/)?.[1]?.length || 0;
            return Math.min(min, currentIndent);
        }, Infinity);

        if (minIndent === Infinity) return "";

        return lines.map(line => {
            return line.startsWith(' '.repeat(minIndent)) ? line.substring(minIndent) : line;
        }).join('\n').trim();
    }
    return code.trim();
}

function indentSource(source, level = 1) {
    const indent = '    '.repeat(level);
    return source
        .split('\n')
        .map(line => (line.trim() === '' ? '' : indent + line))
        .join('\n');
}

function mapTypePythonDoc(type) {
    if (!type) return "Any";
    if (type.endsWith("[]")) return `List[${mapTypePythonDoc(type.slice(0, -2))}]`;
    switch (type) {
        case "int": return "int";
        case "float": return "float";
        case "string": return "str";
        case "boolean": return "bool"; // Added boolean
        default: return "Any";
    }
}

function mapTypeCpp(type) {
    if (!type) return "auto";
    if (type.endsWith("[]")) return `vector<${mapTypeCpp(type.slice(0, -2))}>`; // Use vector for arrays
    switch (type) {
        case "int": return "int";
        case "float": return "double"; // Prefer double for float
        case "string": return "string";
        case "boolean": return "bool"; // Added boolean
        default: return "auto";
    }
}

function mapTypeJava(type) {
    if (!type) return "Object";
    if (type.endsWith("[]")) return `${mapTypeJava(type.slice(0, -2))}[]`;
    switch (type) {
        case "int": return "int";
        case "float": return "double"; // Prefer double for float
        case "string": return "String";
        case "boolean": return "boolean"; // Added boolean
        default: return "Object";
    }
}

function getDefaultReturnValue(language, type) {
    if (!type) return "null";
    if (type.endsWith("[]")) return getEmptyArray(language, type.slice(0, -2)); // Pass element type
    switch (type) {
        case "int": return 0;
        case "float": return 0.0;
        case "string": return '""';
        case "boolean": return "false"; // Added boolean default
        default: return "null";
    }
}

function getEmptyArray(language, elementType) {
    switch (language.toLowerCase()) {
        case "cpp": return "{}"; // For std::vector, {} is fine
        case "java":
            const javaElementType = mapTypeJava(elementType);
            if (javaElementType === "int") return "new int[]{}";
            if (javaElementType === "double") return "new double[]{}";
            if (javaElementType === "boolean") return "new boolean[]{}";
            if (javaElementType === "String") return "new String[]{}";
            return `new ${javaElementType}[]{} `;
        case "python": return "[]";
        default: return "null";
    }
}

// No longer needed after dynamic input generation
// function pythonTypeMap(params) {
//     return params.some(p => p.type === 'float') ? "float" : "int";
// }

function cppTypeDecl(params) {
    return params.map(p => `${mapTypeCpp(p.type)} ${p.name}`).join("; ") + ";";
}

function readCppInput(params) {
    return params.map(p => {
        if (p.type.endsWith('[]')) {
            // For vectors, a simple cin >> vector is not enough,
            // would need loop to read elements. This is a simplification.
            return `// NOTE: Reading for array/vector type '${p.type}' is complex and not fully implemented here.
    // You might need to read size first, then loop for elements. Example for int vector:
    // int size_${p.name}; cin >> size_${p.name};
    // ${p.name}.resize(size_${p.name});
    // for (int i = 0; i < size_${p.name}; ++i) cin >> ${p.name}[i];`;
        }
        return `cin >> ${p.name};`;
    }).join('\n    '); // Added indentation for C++ input reads
}

function javaTypeDecl(params) {
    return params.map(p => `${mapTypeJava(p.type)} ${p.name};`).join("\n    ");
}

function readJavaInput(params) {
    return params.map(p => {
        if (p.type.endsWith('[]')) {
            const elementType = mapTypeJava(p.type.slice(0, -2));
            // This is a placeholder; real array reading depends on input format (e.g., size then elements)
            return `// NOTE: Reading for array type '${p.type}' is complex and not fully implemented here.
    // Example for int array where size is given first:
    // int ${p.name}Size = sc.nextInt();
    // ${p.name} = new ${elementType}[${p.name}Size];
    // for (int i = 0; i < ${p.name}Size; i++) {
    //     ${p.name}[i] = sc.${mapJavaScannerFunc(elementType)}();
    // }
    ${p.name} = new ${elementType}[0]; // Default to empty array`; // Fallback to empty array
        }
        return `${p.name} = sc.${mapJavaScannerFunc(p.type)}();`;
    }).join("\n    ");
}

function mapJavaScannerFunc(type) {
    switch (type) {
        case 'int': return 'nextInt';
        case 'float': return 'nextDouble'; // Use nextDouble for float/double
        case 'string': return 'nextLine'; // For single word, use nextLine() for full line
        case 'boolean': return 'nextBoolean'; // Added boolean
        default: return 'next';
    }
}

module.exports = {
    generateBoilerplate,
    generateFullCode
};