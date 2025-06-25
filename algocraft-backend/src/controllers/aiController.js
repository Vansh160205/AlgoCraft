const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');

dotenv.config(); // Load environment variables from .env file

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Or "gemini-1.5-pro", etc.

exports.generateCompleiety = async (req, res) => {
  try {
    const { language, code } = req.body;
    console.log(code);
    if (!language || !code) {
      return res.status(400).json({ error: 'Language and code are required.' });
    }

    // Construct the prompt for Gemini
    const complexityPrompt = `
      You are an expert at analyzing code for its time and space complexity.
      I will provide you with a code snippet. Your task is to determine the
      Big O notation for both its time complexity and space complexity.

      **Guidelines for your analysis:**

      1.  **Analyze the provided code only.** Do not make assumptions about external libraries unless explicitly stated or commonly known (e.g., standard library functions like \`sort()\`).
      2.  **Focus on the worst-case scenario** unless otherwise specified.
      3.  **Explain your reasoning clearly** for both time and space complexity.
      4.  **Identify key operations** or data structures that contribute to the complexity.
      5.  **Consider input size:** Let 'n' be the primary input size, but use other relevant variables (e.g., 'm' for a second dimension, 'k' for number of operations) if necessary.
      6.  **Provide the Big O notation** for both complexities.

      **Format your response as follows:**

      \`\`\`
      ### Time Complexity: O(Your_Time_Complexity)
      **Reasoning:**
      [Detailed explanation of how you arrived at the time complexity, referencing loops, recursive calls, function calls, etc.]

      ### Space Complexity: O(Your_Space_Complexity)
      **Reasoning:**
      [Detailed explanation of how you arrived at the space complexity, referencing auxiliary data structures, recursion stack space, input size if applicable, etc.]
      \`\`\`

      ---

      Here is the ${language} code snippet:

      \`\`\`${language}
      ${code}
      \`\`\`
    `;

    // Send the prompt to the Gemini model
    const result = await model.generateContent(complexityPrompt);
    const response = result.response;
    const text = response.text(); // Get the plain text response from Gemini

    // You might want to parse the 'text' response here to extract
    // Time Complexity and Space Complexity into separate fields
    // For now, we'll send the raw text, assuming the client can parse it.
    // A more robust solution would involve regex or a dedicated parser.

    console.log(text)

    res.status(200).json({
      language: language,
      code: code,
      complexityAnalysis: text,
      // You could add parsed complexities here if you implement parsing
      // timeComplexity: parsedTimeComplexity,
      // spaceComplexity: parsedSpaceComplexity,
    });

  } catch (error) {
    console.error("Error generating complexity:", error); // Log the full error
    res.status(500).json({
      error: "Failed to generate complexity analysis.",
      details: error.message,
      geminiError: error.response?.data, // If axios error from Gemini
    });
  }
};