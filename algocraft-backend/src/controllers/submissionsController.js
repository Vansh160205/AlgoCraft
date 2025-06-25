const express = require('express');
const axios = require('axios');
const router = express.Router();
const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();

// Define your local Judge0 API URL
const LOCAL_JUDGE0_API_URL = 'http://localhost:2358';

const languageMap = {
    python: 10, // Check your local Judge0 languages endpoint for actual IDs
    cpp: 2,     // Check your local Judge0 languages endpoint for actual IDs
    java: 4     // Check your local Judge0 languages endpoint for actual IDs
};
const { getBoilerplateAndFullCode, generateFullCode, generateBoilerplate } = require('../utils/boilerplateGenerator');
const { parseInputFormat } = require('../utils/parseIOFormats');

// Helper function to simulate polling with a delay
async function pollForJudge0Result(token, retries = 20, delay = 1000) {
    for (let i = 0; i < retries; i++) {
        await new Promise(resolve => setTimeout(resolve, delay)); // Wait for 'delay' ms

        try {
            const response = await axios.get(`${LOCAL_JUDGE0_API_URL}/submissions/${token}?base64_encoded=false`);
            const statusId = response.data.status.id;

            // Judge0 status IDs:
            // 1: In Queue
            // 2: Processing
            // 3: Accepted
            // 4: Wrong Answer
            // 5: Time Limit Exceeded
            // 6: Compilation Error
            // 7: Runtime Error (SIGSEGV)
            // 8: Runtime Error (SIGXFSZ)
            // 9: Runtime Error (SIGFPE)
            // 10: Runtime Error (SIGABRT)
            // 11: Runtime Error (NZEC)
            // 12: Runtime Error (Other)
            // 13: Internal Error
            // 14: Exec Format Error

            if (statusId > 2) { // Status is 3 (Accepted) or greater (meaning finished)
                return response.data;
            }
        } catch (error) {
            console.error(`Error polling Judge0 for token ${token}:`, error.response?.data || error.message);
            // Decide if you want to retry on error or immediately throw
            throw error; // Or return null if you want to handle it differently
        }
    }
    throw new Error(`Judge0 result for token ${token} not available after ${retries * delay / 1000} seconds.`);
}


exports.createSubmission = async (req, res) => {
    const { language, source_code, slug } = req.body;
    if (!language || !source_code || !slug) {
        return res.status(400).json({ error: 'language, source_code, and slug are required' });
    }
    const language_id = languageMap[language.toLowerCase()];
    if (!language_id) {
        return res.status(400).json({ error: 'Unsupported language' });
    }

    try {
        const problem = await prisma.problem.findUnique({
            where: { slug },
            include: { testCases: true },
        });

        if (!problem) {
            return res.status(404).json({ error: 'Problem not found' });
        }

        const testCases = problem.testCases;
        if (!testCases || testCases.length === 0) {
            return res.status(404).json({ error: 'No test cases found for this problem' });
        }

        // 1️⃣ Generate full code by injecting user's code into the boilerplate
        // const { functionName, params } = parseInputFormat(problem.inputFormat); // functionName and params not directly used here
        const fullCode = generateFullCode(language, problem.inputFormat, problem.outputFormat, source_code);
        console.log("Full Code being sent to Judge0:\n", fullCode); // Log the full code for debugging

        const submissionPromises = []; // To store promises for initial submissions

        // 2️⃣ Submit the *wrapped* full code to Judge0 for each test case (asynchronously)
        for (const testCase of testCases) {
            submissionPromises.push(
                axios.post(
                    `${LOCAL_JUDGE0_API_URL}/submissions?base64_encoded=false&wait=false`, // IMPORTANT: wait=false
                    {
                        language_id,
                        source_code: fullCode,
                        stdin: testCase.input,
                        // You can uncomment these if your problem model has them
                        // cpu_time_limit: problem.cpuTimeLimit,
                        // memory_limit: problem.memoryLimit,
                        // wall_time_limit: problem.wallTimeLimit,
                        // enable_network: false, // Default to false unless explicitly needed
                    }
                ).then(response => ({
                    token: response.data.token,
                    testCaseId: testCase.id,
                    input: testCase.input,
                    expected_output: testCase.output, // Keep original expected_output for comparison
                }))
            );
        }

        // Wait for all initial submissions to get their tokens
        const submissionTokens = await Promise.all(submissionPromises);

        // 3️⃣ Poll for results for each token and determine final status for each test case
        const pollingPromises = submissionTokens.map(async ({ token, testCaseId, input, expected_output }) => {
            const judge0Result = await pollForJudge0Result(token); // Wait for the result

            let finalStatusDescription = judge0Result.status.description;
            let finalStatusId = judge0Result.status.id;

            // Only compare output if Judge0's status indicates successful execution (Accepted by Judge0)
            if (judge0Result.status.id === 3) { // Judge0's "Accepted" means ran without errors
                const normalizedStdout = (judge0Result.stdout || '').trim();
                const normalizedExpectedOutput = (expected_output || '').trim(); // Use the expected_output from the test case

                if (normalizedStdout !== normalizedExpectedOutput) {
                    finalStatusDescription = 'Wrong Answer';
                    finalStatusId = 4; // Judge0's ID for Wrong Answer
                }
                
            }
            // If judge0Result.status.id is not 3 (e.g., Compilation Error, TLE, RTE),
            // finalStatusDescription and finalStatusId will retain Judge0's original status.

            return {
                testCaseId,
                input,
                expected_output,
                stdout: judge0Result.stdout,
                stderr: judge0Result.stderr,
                compile_output: judge0Result.compile_output,
                status: {
                    id: finalStatusId,
                    description: finalStatusDescription
                },
                time: parseFloat(judge0Result.time), // Ensure float for DB
                memory: parseInt(judge0Result.memory), // Ensure int for DB
            };
        });

        // Wait for all polling and grading to complete for all test cases
        const finalResults = await Promise.all(pollingPromises);
        console.log("Final Judge0 Results (with grading):", finalResults);

        // 4️⃣ Determine overall submission status, runtime, and memory
        let overallStatus = 'Accepted'; // Optimistic default
        let overallRuntime = 0;
        let overallMemory = 0;
        let overallError = null; // To store error for the submission if any
        let overallOutput = null; // To store output of the first test case (or all combined if desired)

        for (const result of finalResults) {
            // If any test case is not Accepted, the overall status is that status.
            // Priority for overall status: Compile Error > Runtime Error > Time Limit Exceeded > Wrong Answer > Accepted
            if (result.status.id !== 3) { // If not Accepted (id 3)
                if (result.status.id === 6) { // Compilation Error
                    overallStatus = 'Compilation Error';
                    overallError = result.compile_output || 'Compilation failed.';
                    break; // Critical error, no need to check further test cases
                } else if (result.status.id === 5) { // Time Limit Exceeded
                    if (overallStatus !== 'Compilation Error' && overallStatus !== 'Runtime Error') {
                        overallStatus = 'Time Limit Exceeded';
                        overallError = result.stderr || 'Execution time limit exceeded.';
                    }
                } else if (result.status.id >= 7 && result.status.id <= 12) { // Runtime Errors
                    if (overallStatus !== 'Compilation Error') { // RTE overrides TLE/WA
                        overallStatus = 'Runtime Error';
                        overallError = result.stderr || 'Runtime error occurred.';
                    }
                } else if (result.status.id === 4) { // Wrong Answer
                    if (overallStatus === 'Accepted') { // WA only if no other major error
                        overallStatus = 'Wrong Answer';
                        overallError = result.stderr || 'One or more test cases produced incorrect output.';
                    }
                }
            }

            // Aggregate runtime and memory (e.g., take the maximum)
            overallRuntime = Math.max(overallRuntime, result.time || 0);
            overallMemory = Math.max(overallMemory, result.memory || 0);

            // Capture output of the first test case or the first failing one
            if (!overallOutput) {
                overallOutput = result.stdout;
            }
        }

        // If overallStatus is still 'Accepted' but there was a non-Accepted status,
        // it means a lower priority failure was missed or compile_output was primary.
        // This check ensures 'Accepted' is only set if ALL results are Accepted.
        const allAccepted = finalResults.every(result => result.status.id === 3);
        if (!allAccepted && overallStatus === 'Accepted') {
            // This case should ideally not happen if the priority logic above is solid,
            // but acts as a safeguard.
            overallStatus = finalResults.find(result => result.status.id !== 3)?.status.description || 'Unknown Error';
            overallError = finalResults.find(result => result.status.id !== 3)?.stderr || 'Submission failed on one or more test cases.';
        }


        // 5️⃣ Create a single submission record in the database
        const submission = await prisma.submission.create({
            data: {
                problemId: problem.id,
                code: source_code,
                language: language,
                status: overallStatus, // Use the determined overall status
                output: overallOutput, // Use aggregated or first test case output
                error: overallError, // Use aggregated error
                runtime: overallRuntime, // Use aggregated runtime
                memory: overallMemory, // Use aggregated memory
                userId: req.user.id // Assuming req.user.id is available from middleware
            }
        });

        // 6️⃣ Respond to the client with the overall status and individual test case results
        return res.status(200).json({
            problem: {
                title: problem.title,
                slug: problem.slug,
            },
            overallStatus: overallStatus, // New field for overall status
            totalCases: finalResults.length,
            results: finalResults, // Still return individual results for detailed view on frontend
            submissionId: submission.id // Return the ID of the created submission record
        });

    } catch (err) {
        console.error("Error in createSubmission: ", err.response?.data || err.message);
        return res.status(500).json({
            error: 'Something went wrong while submitting code',
            details: err.response?.data || err.message,
            judge0Error: err.response?.data, // Include Judge0's specific error if available
        });
    }
}