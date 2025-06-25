'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Plus, Trash } from 'lucide-react';

interface TestCase {
  input: string;
  output: string;
}

interface ProblemInput {
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  functionName: string;
  params: { name: string; type: string }[];
  returnType: string;
  returnName: string;
  testCases: TestCase[];
  companyTags: string[];
  topicTags: string[];
}

export default function AdminPage() {
  const { user, token, isAuthenticated } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);

  const [problem, setProblem] = useState<ProblemInput>({
    title: '',
    description: '',
    difficulty: 'Easy',
    functionName: '',
    params: [],
    returnType: '',
    returnName: '',
    testCases: [{ input: '', output: '' }],
    companyTags: [],
    topicTags: [],
  });

  useEffect(() => {
    if (!isAuthenticated || !user?.isAdmin) {
      router.push('/');
      return;
    }
    const fetchUsers = async () => {
      try {
        const res = await api.get('/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data);
      } catch (err) {
        console.error('Failed to fetch users:', err);
      }
    };
    fetchUsers();
  }, [token, isAuthenticated, user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setProblem({ ...problem, [e.target.name]: e.target.value });
  };

  const handleTagChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'companyTags' | 'topicTags') => {
    setProblem({ ...problem, [field]: e.target.value.split(',').map(tag => tag.trim()) });
  };

  const addParam = () => {
    setProblem({ ...problem, params: [...problem.params, { name: '', type: 'string' }] });
  };

  const removeParam = (index: number) => {
    const newParams = [...problem.params];
    newParams.splice(index, 1);
    setProblem({ ...problem, params: newParams });
  };

  const updateParam = (index: number, field: 'name' | 'type', value: string) => {
    const newParams = [...problem.params];
    newParams[index][field] = value;
    setProblem({ ...problem, params: newParams });
  };

  const handleTestCaseChange = (index: number, key: 'input' | 'output', value: string) => {
    const newTestCases = [...problem.testCases];
    newTestCases[index][key] = value;
    setProblem({ ...problem, testCases: newTestCases });
  };

  const addTestCase = () => {
    setProblem({ ...problem, testCases: [...problem.testCases, { input: '', output: '' }] });
  };

  const removeTestCase = (index: number) => {
    const updated = [...problem.testCases];
    updated.splice(index, 1);
    setProblem({ ...problem, testCases: updated });
  };

  const handleAddProblem = async () => {
    try {
      await api.post('/problems', problem, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Problem added successfully!');
    } catch (error) {
      console.error('Error adding problem:', error);
    }
  };

  return (
    <div className="p-8 text-white bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-indigo-400">Admin Dashboard</h1>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-800 text-white mb-6">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="formats">Formats</TabsTrigger>
          <TabsTrigger value="testcases">Test Cases</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <Input name="title" placeholder="Problem Title" value={problem.title} onChange={handleChange} />
          <Textarea name="description" placeholder="Problem Description" value={problem.description} onChange={handleChange} />
          <select
            name="difficulty"
            value={problem.difficulty}
            onChange={handleChange}
            className="bg-gray-800 text-white border border-gray-600 p-2 rounded w-full"
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
          <Input
            placeholder="Comma-separated Company Tags (e.g. Google, Amazon)"
            value={problem.companyTags.join(', ')}
            onChange={(e) => handleTagChange(e, 'companyTags')}
          />
          <Input
            placeholder="Comma-separated Topic Tags (e.g. String, Dynamic Programming)"
            value={problem.topicTags.join(', ')}
            onChange={(e) => handleTagChange(e, 'topicTags')}
          />
        </TabsContent>

        <TabsContent value="formats" className="space-y-4">
          <Input name="functionName" placeholder="Function Name" value={problem.functionName} onChange={handleChange} />
          <div className="space-y-2">
            <label className="text-sm">Parameters  </label>
            {problem.params.map((param, index) => (
              <div key={index} className="flex gap-2 items-center">
                <Input
                  placeholder="Name"
                  value={param.name}
                  onChange={(e) => updateParam(index, 'name', e.target.value)}
                />
                <select
                  value={param.type}
                  onChange={(e) => updateParam(index, 'type', e.target.value)}
                  className="bg-gray-800 text-white border border-gray-600 p-2 rounded"
                >
                  <option value="string">string</option>
                  <option value="int">int</option>
                  <option value="bool">bool</option>
                  <option value="float">float</option>
                </select>
                <Button variant="ghost" size="icon" onClick={() => removeParam(index)}>
                  <Trash className="h-4 w-4 text-red-400" />
                </Button>
              </div>
            ))}
            <Button onClick={addParam} variant="outline" className="text-white mt-2 bg-gray-900">
              <Plus className="w-4 h-4 mr-1" /> Add Param
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input name="returnType" placeholder="Return Type (e.g. string)" value={problem.returnType} onChange={handleChange} />
            <Input name="returnName" placeholder="Output Variable Name" value={problem.returnName} onChange={handleChange} />
          </div>
        </TabsContent>

        <TabsContent value="testcases" className="space-y-4">
          {problem.testCases.map((tc, index) => (
            <div key={index} className="space-y-2">
              <h4 className="text-white font-medium">Test Case {index + 1}</h4>
              <Textarea
                placeholder='Input (e.g. "babad")'
                value={tc.input}
                onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)}
              />
              <Textarea
                placeholder="Expected Output (e.g. \'bab\')"
                value={tc.output}
                onChange={(e) => handleTestCaseChange(index, 'output', e.target.value)}
              />
              <Button variant="ghost" size="sm" onClick={() => removeTestCase(index)} className="text-red-400">
                Remove Test Case
              </Button>
            </div>
          ))}
          <Button onClick={addTestCase} className="mt-2">
            + Add Test Case
          </Button>
          <Button onClick={handleAddProblem} className="mt-6 w-full">
            Submit Problem
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}