import React, { useState, useEffect } from 'react';
// Assuming 'Button' is imported from somewhere, e.g.:
// import { Button } from './components/ui/button';

// Define the shape of a single complexity analysis (time or space)
interface ComplexityData {
  complexity: string; // e.g., "O(n)", "O(1)"
  reasoning: string; // The detailed explanation
}

// Define the shape of the parsed analysis state
interface ParsedAnalysis {
  time: ComplexityData | null;
  space: ComplexityData | null;
}

// Define the props for the AnalysisDialog component
interface AnalysisDialogProps {
  analysisResult: string | null; // The raw string from Gemini
  setShowAnalysisDialog: (show: boolean) => void; // Function to close the dialog
}

const AnalysisDialog: React.FC<AnalysisDialogProps> = ({ analysisResult, setShowAnalysisDialog }) => {
  const [parsedAnalysis, setParsedAnalysis] = useState<ParsedAnalysis | null>(null);

  useEffect(() => {
    if (analysisResult) {
      const parseComplexity = (text: string): ParsedAnalysis => {
        // Regex for Time Complexity section
        const timeComplexityRegex = /### Time Complexity: (O\(.*?\))\n\*\*Reasoning:\*\*([\s\S]*?)(?=\n### Space Complexity:|$)/;
        // Regex for Space Complexity section
        const spaceComplexityRegex = /### Space Complexity: (O\(.*?\))\n\*\*Reasoning:\*\*([\s\S]*?)(?=$)/;

        const timeMatch = text.match(timeComplexityRegex);
        const spaceMatch = text.match(spaceComplexityRegex);

        const timeData: ComplexityData | null = timeMatch ? {
          complexity: timeMatch[1].trim(),
          reasoning: timeMatch[2].trim()
        } : null;

        const spaceData: ComplexityData | null = spaceMatch ? {
          complexity: spaceMatch[1].trim(),
          reasoning: spaceMatch[2].trim()
        } : null;

        return {
          time: timeData,
          space: spaceData
        };
      };

      setParsedAnalysis(parseComplexity(analysisResult));
    }
  }, [analysisResult]);

  // Render null if no analysis result or if parsing hasn't completed yet
  // (though useEffect will typically run immediately if analysisResult is truthy)
  if (!analysisResult || !parsedAnalysis) {
    return null; // Or a loading spinner/placeholder if desired
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
      <div className="bg-gray-900 p-8 rounded-lg max-w-2xl w-full border border-gray-700 shadow-2xl animate-fade-in-up">
        <h2 className="text-3xl font-extrabold text-indigo-500 mb-6 tracking-wide text-center">Complexity Analysis</h2>
        <div className="space-y-6">
          {/* Time Complexity Block */}
          {parsedAnalysis.time && (
            <div className="bg-gray-850 rounded-xl p-5 border border-indigo-700/50 shadow-lg transition-all duration-300 hover:shadow-xl hover:border-indigo-600/70">
              <h3 className="text-xl font-bold text-green-400 mb-2 flex items-center">
                Time Complexity: <span className="ml-2 font-extrabold text-yellow-300 text-2xl">{parsedAnalysis.time.complexity}</span>
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                <span className="font-semibold text-gray-400 block mb-1">Reasoning:</span>
                {parsedAnalysis.time.reasoning}
              </p>
            </div>
          )}

          {/* Space Complexity Block */}
          {parsedAnalysis.space && (
            <div className="bg-gray-850 rounded-xl p-5 border border-purple-700/50 shadow-lg transition-all duration-300 hover:shadow-xl hover:border-purple-600/70">
              <h3 className="text-xl font-bold text-blue-400 mb-2 flex items-center">
                Space Complexity: <span className="ml-2 font-extrabold text-yellow-300 text-2xl">{parsedAnalysis.space.complexity}</span>
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                <span className="font-semibold text-gray-400 block mb-1">Reasoning:</span>
                {parsedAnalysis.space.reasoning}
              </p>
            </div>
          )}

          {/* Fallback for unparseable or missing analysis */}
          {(!parsedAnalysis.time && !parsedAnalysis.space) && (
            <p className="text-red-400 text-center text-lg">
              Could not parse complexity analysis. Displaying raw output:<br/>
              <pre className="bg-gray-800 text-gray-200 rounded p-3 overflow-x-auto whitespace-pre-wrap text-sm mt-2">
                {analysisResult}
              </pre>
            </p>
          )}
        </div>

        <div className="mt-8 text-right">
          <button
            onClick={() => setShowAnalysisDialog(false)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-7 rounded-lg text-lg font-medium transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75 shadow-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalysisDialog;