 function parseInputFormat(inputFormat) {
  const lines = inputFormat.trim().split('\n').filter(Boolean);
  if (lines.length === 0) {
    throw new Error("Input format is empty.");
  }

  const functionNameLine = lines.shift();
  const functionNameMatch = functionNameLine.match(/function\s*name\s*:\s*(\w+)/i);

  if (!functionNameMatch) {
    console.error("Function name line not in expected format:", functionNameLine);
    throw new Error('Invalid input format. Missing or incorrect "function name" line.');
  }

  const functionName = functionNameMatch[1];

  const params = lines.map(line => {
    const [name, type] = line.split(':').map(s => s.trim());
    if (!name || !type) {
      console.warn("Skipping invalid parameter line:", line);
      return null;
    }
    return { name, type };
  }).filter(Boolean); // remove nulls from invalid lines

  return { functionName, params };
}



function parseOutputFormat(outputFormat) {
  const [_, returnType] = outputFormat.split(':').map(s => s.trim());
  return {returnType};
}



module.exports = {
  parseInputFormat,
  parseOutputFormat,
};