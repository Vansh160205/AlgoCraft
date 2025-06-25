'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation'; // Correct hook for accessing route parameters
import Link from 'next/link';
import Navbar from '@/app/components/Navbar';
import ReactMarkdown from 'react-markdown';
import Footer from '@/app/components/Footer';
import api from '@/lib/axios'; // Assuming this axios instance is configured
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, CopyIcon, PlayIcon, XCircle } from 'lucide-react'; // Icons for copy code and run test cases
import Editor from '@monaco-editor/react'; // Import the Monaco Editor component
import Split from 'react-split'; // Import the Split component
import AnalysisDialog from '../../components/AnalysisDialog';

// Define TestCase interface based on the provided model
interface TestCase {
  id: number;
  input: string;
  output: string;
  explanation?: string; // Optional, based on common problem structures
}

// Define Problem interface based on the provided model
interface Problem {
  id: number;
  title: string;
  slug: string;
  description: string;
  difficulty: string;
  companyTags: string[];
  topicTags: string[];
  inputFormat: string;
  outputFormat: string;
  boilerplatePython: string;
  boilerplateCpp: string;
  boilerplateJava: string;
  createdAt: string;
  updatedAt: string;
  testCases: TestCase[];
}

export default function ProblemDetailPage() {
  const { slug } = useParams(); // Get the slug from the URL
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('java'); // Default to Java
  const [activeCaseOrResultTab, setActiveCaseOrResultTab] = useState<string>('testcases'); // Default to first test case
  
  const [activeTestCaseTab, setActiveTestCaseTab] = useState<string>('0'); // Default to first test case
const [analyzing, setAnalyzing] = useState(false);
const [analysisResult, setAnalysisResult] = useState<string | null>(null);
const [showAnalysisDialog, setShowAnalysisDialog] = useState(false);

  const [code, setCode] = useState<string>(''); // State to hold the code in the editor
  const [isLargeScreen, setIsLargeScreen] = useState(false); // State to track screen size
const [submissionResults, setSubmissionResults] = useState<any[] | null>(null);
const [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    const checkScreenSize = () => {
      // Consider 'md' breakpoint (768px) as the threshold for large screens
      setIsLargeScreen(window.innerWidth >= 768);
    };

    // Set initial screen size
    checkScreenSize();

    // Add event listener for window resize
    window.addEventListener('resize', checkScreenSize);

    // Clean up event listener on component unmount
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []); // Empty dependency array ensures this runs once on mount and cleans up on unmount

  useEffect(() => {
    const fetchProblem = async () => {
      if (!slug) return;

      try {
        setLoading(true);
        setError(null);
        const response = await api.get<Problem>(`/problems/${slug}`);
        setProblem(response.data);
        if (response.data.testCases && response.data.testCases.length > 0) {
          setActiveTestCaseTab(response.data.testCases[0].id.toString());
        }
      } catch (err: any) {
        console.error('Failed to fetch problem:', err);
        setError(err.response?.data?.message || 'Failed to load problem details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProblem();
  }, [slug]);

  useEffect(() => {
    if (problem) {
      setCode(getBoilerplateCode());
    }
  }, [problem, selectedLanguage]);

  const getBoilerplateCode = useCallback(() => {
    if (!problem) return '';
    switch (selectedLanguage) {
      case 'python':
        return problem.boilerplatePython;
      case 'cpp':
        return problem.boilerplateCpp;
      case 'java':
        return problem.boilerplateJava;
      default:
        return '';
    }
  }, [problem, selectedLanguage]);

  const handleRunCode = async () => {
  if (!problem) return;

  try {
    setSubmitting(true);
    setSubmissionResults(null);
    const token = localStorage.getItem('token');
    const response = await api.post('/submissions', {
      language: selectedLanguage,
      source_code: code,
      slug: problem.slug,
    },
    {
    headers: {
      Authorization: `Bearer ${token}`, // token from your auth context or localStorage
    },
    }
  );

    setSubmissionResults(response.data.results);
  } catch (err: any) {
    console.error("Submission failed:", err);
    alert(err.response?.data?.message || "Submission failed. Please try again.");
  } finally {
    setSubmitting(false);
  }
};


  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
    setCode(getBoilerplateCode());
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'text-green-500';
      case 'medium':
        return 'text-yellow-500';
      case 'hard':
        return 'text-red-500';
      default:
        return 'text-gray-400';
    }
  };

  const getTagDisplayColor = (type: 'topic' | 'company') => {
    if (type === 'topic') return 'bg-blue-900/40 text-blue-300';
    return 'bg-purple-900/40 text-purple-300';
  };

  const handleAnalyzeComplexity = async () => {
  if (!code || !selectedLanguage) return;
  try {
    setAnalyzing(true);
    setAnalysisResult(null);

    const response = await api.post('/ai/generateComplexiety', {
      language: selectedLanguage,
      code: code,
    });
    console.log(response.data.complexityAnalysis);

    setAnalysisResult(response.data.complexityAnalysis);
    setShowAnalysisDialog(true);
  } catch (err: any) {
    console.error("Analysis failed:", err);
    alert(err.response?.data?.message || "Analysis failed. Please try again.");
  } finally {
    setAnalyzing(false);
  }
};


  const copyCodeToClipboard = () => {
    if (code) {
      navigator.clipboard.writeText(code)
        .then(() => {
          alert('Code copied to clipboard!');
        })
        .catch(err => {
          console.error('Failed to copy text: ', err);
          alert('Failed to copy code.');
        });
    }
  };


  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-gray-200 flex flex-col items-center justify-center">
        <p className="text-xl text-gray-400">Loading problem details...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-gray-200 flex flex-col items-center justify-center">
        <p className="text-xl text-red-500">Error: {error}</p>
        <Link href="/problems">
          <Button variant="outline" className="mt-4 border-gray-600 text-gray-300 hover:text-white hover:border-indigo-400">
            Back to Problems
          </Button>
        </Link>
      </main>
    );
  }

  if (!problem) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-gray-200 flex flex-col items-center justify-center">
        <p className="text-xl text-gray-400">Problem not found.</p>
        <Link href="/problems">
          <Button variant="outline" className="mt-4 border-gray-600 text-gray-300 hover:text-white hover:border-indigo-400">
            Back to Problems
          </Button>
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-gray-200 flex flex-col">
      <Navbar />

      {isLargeScreen ? (
        // Large screen layout with Splits
        <Split
  sizes={[50, 50]}
  minSize={300}
  expandToMin={true}
  snapOffset={10} // smoother snapping
  dragInterval={1}
  direction="horizontal"
  gutterSize={6} // smaller for finer control
  gutterAlign="center"
  cursor="col-resize"
  
  className="flex-1 container mx-auto px-2 py-4 md:py-8 flex"
>
          {/* Left Column: Problem Description */}
          <section className="bg-gray-900 p-6 rounded-lg shadow-xl border border-gray-700 overflow-y-auto ">
            <h1 className="text-3xl md:text-4xl font-bold text-indigo-400 mb-4">
              {problem.id}. {problem.title}
            </h1>
            <div className="flex items-center gap-4 mb-6">
              <Badge className={`${getDifficultyColor(problem.difficulty)} text-md px-3 py-1 font-semibold border border-current`}>
                {problem.difficulty}
              </Badge>
              <div className="flex flex-wrap gap-2">
                {problem.topicTags.map((tag, i) => (
                  <Badge key={i} className={`${getTagDisplayColor('topic')} px-2 py-0.5 rounded-full text-xs font-medium`}>
                    {tag}
                  </Badge>
                ))}
                {problem.companyTags.map((tag, i) => (
                  <Badge key={i} className={`${getTagDisplayColor('company')} px-2 py-0.5 rounded-full text-xs font-medium`}>
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <article className="prose prose-invert max-w-full text-gray-300 break-words">
              <h2 className="text-2xl font-semibold text-gray-100 mb-3">Problem Description</h2>
              <div dangerouslySetInnerHTML={{ __html: problem.description }} />

              <h2 className="text-2xl font-semibold text-gray-100 mb-3 mt-6">Examples</h2>
{problem.testCases.map((testCase, index) => (
  <div key={testCase.id} className="mb-4">
    <h3 className="font-semibold text-gray-300 mb-1">Example {index + 1}:</h3>
    <div className="mb-2">
      <span className="block text-sm font-medium text-gray-400">Input:</span>
      <pre className="bg-gray-800 rounded p-2 text-sm whitespace-pre-wrap">{testCase.input}</pre>
    </div>
    <div className="mb-2">
      <span className="block text-sm font-medium text-gray-400">Output:</span>
      <pre className="bg-gray-800 rounded p-2 text-sm whitespace-pre-wrap">{testCase.output}</pre>
    </div>
    {/* {testCase.explanation && (
      <div>
        <span className="block text-sm font-medium text-gray-400">Explanation:</span>
        <pre className="bg-gray-800 rounded p-2 text-sm whitespace-pre-wrap">{testCase.explanation}</pre>
      </div>
    )} */}
  </div>
))}

            </article>
          </section>

          {/* Right Column: Code Editor and Test Cases Split */}
          <Split
  sizes={[40, 60]}
  minSize={[200, 250]} // reasonable minimums
  gutterSize={8}
  snapOffset={8}
  direction="vertical"
  className="flex-1 flex flex-col gap-4"
>
            {/* Top Pane: Code Editor */}
            <div className="bg-gray-900 p-4 rounded-lg shadow-xl border border-gray-700 flex flex-col relative min-h-[200px]">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-bold text-gray-200">Code</h2>
                <div className="flex items-center gap-2">
                  <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
                    <SelectTrigger className="w-[120px] bg-gray-800 border-gray-700 text-gray-200 focus:ring-indigo-500">
                      <SelectValue placeholder="Language" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 text-gray-200">
                      <SelectItem value="java" className="hover:bg-gray-700">Java</SelectItem>
                      <SelectItem value="python" className="hover:bg-gray-700">Python</SelectItem>
                      <SelectItem value="cpp" className="hover:bg-gray-700">C++</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white" onClick={copyCodeToClipboard}>
                    <CopyIcon className="h-4 w-4 mr-2" /> Copy
                  </Button>
                  <Button
  variant="default"
  size="sm"
  className="bg-indigo-600 text-white hover:bg-indigo-700"
  onClick={handleRunCode}
  disabled={submitting}
>
  <PlayIcon className="h-4 w-4 mr-2" />
  {submitting ? 'Running...' : 'Run'}
</Button>

<Button
  variant="outline"
  size="sm"
  className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"
  onClick={handleAnalyzeComplexity}
  disabled={analyzing}
>
  {analyzing ? "Analyzing..." : "Analyze Complexity"}
</Button>
                </div>
              </div>
              <div className="flex-1 w-full rounded-md overflow-hidden">
                <Editor
                  height="100%"
                  width="100%"
                  language={selectedLanguage}
                  theme="vs-dark"
                  value={code}
                  onChange={(value) => setCode(value || '')}
                  options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    accessibilitySupport: 'off',
                    wordWrap: 'on',
                    tabSize: 2,
                    lineNumbers: 'on',
                  }}
                />
              </div>
            </div>

            {/* Bottom Pane: Test Cases */}
            <div className="bg-gray-900 p-4 rounded-lg shadow-xl border border-gray-700 flex flex-col relative min-h-[250px]">
  <h2 className="text-xl font-bold text-gray-200 mb-3">Test Cases</h2>

  <Tabs value={activeCaseOrResultTab} onValueChange={setActiveCaseOrResultTab} className="flex-1 flex flex-col">
    <TabsList className="bg-gray-800 rounded-md p-2 gap-2 flex-wrap h-auto">
      <TabsTrigger
        value="testcases"
        className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=inactive]:bg-gray-700 data-[state=inactive]:text-gray-300 hover:data-[state=inactive]:bg-gray-600 rounded-md px-4 py-2"
        
      >
        Testcases
      </TabsTrigger>
      <TabsTrigger
        value="results"
        className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=inactive]:bg-gray-700 data-[state=inactive]:text-gray-300 hover:data-[state=inactive]:bg-gray-600 rounded-md px-4 py-2"
      >
        Results
      </TabsTrigger>
    </TabsList>

    <div className="flex-1 mt-4 overflow-y-auto custom-scrollbar">
      {/* ----- Test Cases Tabs ----- */}
      <TabsContent value="testcases" className="flex flex-col gap-4">
        <Tabs value={activeTestCaseTab} onValueChange={setActiveTestCaseTab} className="flex-1 flex flex-col">
          <TabsList className="flex flex-wrap gap-2">
            {problem.testCases.map((testCase, index) => {
              const result = submissionResults?.find((r) => r.testCaseId === testCase.id);
              const isPassed = result?.status.description === 'Accepted';

              return (
                <TabsTrigger
                  key={testCase.id}
                  value={testCase.id.toString()}
                  className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white data-[state=inactive]:bg-gray-700 data-[state=inactive]:text-gray-300 hover:data-[state=inactive]:bg-gray-600 rounded-md px-3 py-1 text-sm"
                >
                  Case {index + 1}
                  {result &&
                    (isPassed ? (
                      <CheckCircle className="h-4 w-4 text-green-400 ml-1" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-400 ml-1" />
                    ))}
                </TabsTrigger>
              );
            })}
          </TabsList>

          <div className="mt-4">
            {problem.testCases.map((testCase) => (
              <TabsContent key={testCase.id} value={testCase.id.toString()}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Input:</label>
                    <textarea
                      className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 font-mono text-sm text-gray-200 resize-y"
                      value={testCase.input}
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Expected Output:</label>
                    <textarea
                      className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 font-mono text-sm text-gray-200 resize-y"
                      value={testCase.output}
                      readOnly
                    />
                  </div>
                  {testCase.explanation && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Explanation:</label>
                      <textarea
                        className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 font-mono text-sm text-gray-200 resize-y"
                        value={testCase.explanation}
                        readOnly
                      />
                    </div>
                  )}
                </div>
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </TabsContent>

      {/* ----- Results Tab ----- */}
      <TabsContent value="results" className="h-full">
        {submissionResults ? (
          <div className="space-y-3">
            {submissionResults
              .filter((r) => r.status.description !== 'Accepted')
              .map((result) => (
                <div
                  key={result.testCaseId}
                  className="p-3 rounded bg-red-900/40 border border-red-700"
                >
                  <h4 className="font-semibold text-red-300 mb-1">Test Case ID: {result.testCaseId}</h4>
                  <p className="text-gray-300 text-sm"><strong>Expected:</strong> {result.expected_output}</p>
                  <p className="text-gray-300 text-sm"><strong>Got:</strong> {result.stdout || '<empty>'}</p>
                  <p className="text-gray-400 text-xs"><strong>Status:</strong> {result.status.description}</p>
                </div>
              ))}
            {submissionResults.filter((r) => r.status.description !== 'Accepted').length === 0 && (
              <div className="text-green-400 text-center py-2">All test cases passed 🎉</div>
            )}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-2">No results yet. Run your code to see results here.</p>
        )}
      </TabsContent>
    </div>
  </Tabs>
</div>

          </Split>
        </Split>
      ) : (
        // Small screen layout (stacked, no Split)
        <div className="flex-1 container mx-auto px-4 py-8 flex flex-col gap-8">
          {/* Problem Description */}
          <section className="bg-gray-900 p-6 rounded-lg shadow-xl border border-gray-700 overflow-y-auto custom-scrollbar">
            <h1 className="text-3xl md:text-4xl font-bold text-indigo-400 mb-4">
              {problem.id}. {problem.title}
            </h1>
            <div className="flex items-center gap-4 mb-6 flex-wrap"> {/* Added flex-wrap for small screens */}
              <Badge className={`${getDifficultyColor(problem.difficulty)} text-md px-3 py-1 font-semibold border border-current`}>
                {problem.difficulty}
              </Badge>
              <div className="flex flex-wrap gap-2">
                {problem.topicTags.map((tag, i) => (
                  <Badge key={i} className={`${getTagDisplayColor('topic')} px-2 py-0.5 rounded-full text-xs font-medium`}>
                    {tag}
                  </Badge>
                ))}
                {problem.companyTags.map((tag, i) => (
                  <Badge key={i} className={`${getTagDisplayColor('company')} px-2 py-0.5 rounded-full text-xs font-medium`}>
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <article className="prose prose-invert max-w-none text-gray-300">
              <h2 className="text-2xl font-semibold text-gray-100 mb-3">Problem Description</h2>
              <div dangerouslySetInnerHTML={{ __html: problem.description }} />

              <h2 className="text-2xl font-semibold text-gray-100 mb-3 mt-6">Input Format</h2>
              <p className="whitespace-pre-wrap">{problem.inputFormat}</p>

              <h2 className="text-2xl font-semibold text-gray-100 mb-3 mt-6">Output Format</h2>
              <p className="whitespace-pre-wrap">{problem.outputFormat}</p>
            </article>
          </section>

          {/* Code Editor */}
          <section className="bg-gray-900 p-4 rounded-lg shadow-xl border border-gray-700 flex flex-col relative min-h-[400px]">
            <div className="flex justify-between items-center mb-3 flex-wrap"> {/* Added flex-wrap for small screens */}
              <h2 className="text-xl font-bold text-gray-200">Code</h2>
              <div className="flex items-center gap-2 flex-wrap"> {/* Added flex-wrap for small screens */}
                <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="w-[120px] bg-gray-800 border-gray-700 text-gray-200 focus:ring-indigo-500">
                    <SelectValue placeholder="Language" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700 text-gray-200">
                    <SelectItem value="java" className="hover:bg-gray-700">Java</SelectItem>
                    <SelectItem value="python" className="hover:bg-gray-700">Python</SelectItem>
                    <SelectItem value="cpp" className="hover:bg-gray-700">C++</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white" onClick={copyCodeToClipboard}>
                  <CopyIcon className="h-4 w-4 mr-2" /> Copy
                </Button>
                <Button variant="default" size="sm" className="bg-indigo-600 text-white hover:bg-indigo-700">
                  <PlayIcon className="h-4 w-4 mr-2" /> Run
                </Button>
              </div>
            </div>
            <div className="flex-1 w-full rounded-md overflow-hidden">
              <Editor
                height="100%"
                language={selectedLanguage}
                theme="vs-dark"
                value={code}
                onChange={(value) => setCode(value || '')}
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  accessibilitySupport: 'off',
                  wordWrap: 'on',
                  tabSize: 2,
                  lineNumbers: 'on',
                }}
              />
            </div>
          </section>

          {/* Test Cases */}
          <section className="bg-gray-900 p-4 rounded-lg shadow-xl border border-gray-700 flex flex-col relative min-h-[300px]">
            <h2 className="text-xl font-bold text-gray-200 mb-3">Test Cases</h2>
            {problem.testCases.length > 0 ? (
              <Tabs value={activeTestCaseTab} onValueChange={setActiveTestCaseTab} className="flex-1 flex flex-col">
                <TabsList className="bg-gray-800 rounded-md p-1 flex-wrap h-auto">
                  {problem.testCases.map((testCase) => (
                    <TabsTrigger
                      key={testCase.id}
                      value={testCase.id.toString()}
                      className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=inactive]:bg-gray-700 data-[state=inactive]:text-gray-300 hover:data-[state=inactive]:bg-gray-600 rounded-md px-4 py-2 transition-colors duration-200"
                    >
                      Case {testCase.id}
                    </TabsTrigger>
                  ))}
                </TabsList>
                <div className="flex-1 mt-4 overflow-y-auto custom-scrollbar">
                  {problem.testCases.map((testCase) => (
                    <TabsContent key={testCase.id} value={testCase.id.toString()} className="h-full">
                      <div className="flex flex-col h-full space-y-4">
                        <div>
                          <label htmlFor={`input-${testCase.id}`} className="block text-sm font-medium text-gray-300 mb-1">
                            Input:
                          </label>
                          <textarea
                            id={`input-${testCase.id}`}
                            className="w-full bg-gray-800 border border-gray-700 rounded-md p-3 font-mono text-sm text-gray-200 min-h-[80px] resize-y overflow-y-auto custom-scrollbar"
                            value={testCase.input}
                            readOnly
                            spellCheck="false"
                          />
                        </div>
                        <div>
                          <label htmlFor={`expected-output-${testCase.id}`} className="block text-sm font-medium text-gray-300 mb-1">
                            Expected Output:
                          </label>
                          <textarea
                            id={`expected-output-${testCase.id}`}
                            className="w-full bg-gray-800 border border-gray-700 rounded-md p-3 font-mono text-sm text-gray-200 min-h-[60px] resize-y overflow-y-auto custom-scrollbar"
                            value={testCase.output}
                            readOnly
                            spellCheck="false"
                          />
                        </div>
                        {testCase.explanation && (
                          <div>
                            <label htmlFor={`explanation-${testCase.id}`} className="block text-sm font-medium text-gray-300 mb-1">
                              Explanation:
                            </label>
                            <textarea
                              id={`explanation-${testCase.id}`}
                              className="w-full bg-gray-800 border border-gray-700 rounded-md p-3 font-mono text-sm text-gray-200 min-h-[60px] resize-y overflow-y-auto custom-scrollbar"
                              value={testCase.explanation}
                              readOnly
                              spellCheck="false"
                            />
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  ))}
                </div>
              </Tabs>
            ) : (
              <p className="text-gray-400 text-center py-4">No test cases available for this problem.</p>
            )}
          </section>
        </div>
      )}
{showAnalysisDialog && (
  
  <AnalysisDialog analysisResult={analysisResult} setShowAnalysisDialog={setShowAnalysisDialog} />
)}

      
      <Footer />
    </main>
  );
}