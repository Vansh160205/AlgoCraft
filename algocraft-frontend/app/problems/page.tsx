// src/app/problems/page.tsx
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { XIcon } from 'lucide-react';

interface Problem {
  id: number;
  title: string;
  slug: string;
  description: string;
  difficulty: string;
  companyTags: string[];
  topicTags: string[];
}

export default function ProblemsPage() {
  const [allProblems, setAllProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  // Unique lists for filter options
  const [uniqueCompanies, setUniqueCompanies] = useState<string[]>([]);
  const [uniqueTopics, setUniqueTopics] = useState<string[]>([]);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get<Problem[]>('/problems');
        setAllProblems(response.data);

        const companies = new Set<string>();
        const topics = new Set<string>();
        response.data.forEach(problem => {
          problem.companyTags.forEach(tag => companies.add(tag));
          problem.topicTags.forEach(tag => topics.add(tag));
        });
        setUniqueCompanies(Array.from(companies).sort());
        setUniqueTopics(Array.from(topics).sort());

      } catch (err: any) {
        console.error('Failed to fetch problems:', err);
        setError(err.response?.data?.message || 'Failed to load problems. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, []);

  // Handler for toggling company selection
  const handleToggleCompany = useCallback((company: string) => {
    setSelectedCompanies(prev =>
      prev.includes(company)
        ? prev.filter(c => c !== company)
        : [...prev, company]
    );
  }, []);

  // Handler for toggling topic selection
  const handleToggleTopic = useCallback((topic: string) => {
    setSelectedTopics(prev =>
      prev.includes(topic)
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    );
  }, []);

  // Filtered Problems Logic using useMemo for performance
  const filteredProblems = useMemo(() => {
    let currentProblems = [...allProblems];

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      currentProblems = currentProblems.filter(
        (problem) =>
          problem.title.toLowerCase().includes(lowerCaseSearchTerm) ||
          problem.slug.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    if (selectedDifficulty !== 'All') {
      currentProblems = currentProblems.filter(
        (problem) => problem.difficulty.toLowerCase() === selectedDifficulty.toLowerCase()
      );
    }

    if (selectedCompanies.length > 0) {
      currentProblems = currentProblems.filter(problem =>
        selectedCompanies.every(selectedTag => problem.companyTags.includes(selectedTag))
      );
    }

    if (selectedTopics.length > 0) {
      currentProblems = currentProblems.filter(problem =>
        selectedTopics.every(selectedTag => problem.topicTags.includes(selectedTag))
      );
    }

    currentProblems.sort((a, b) => a.id - b.id);

    return currentProblems;
  }, [allProblems, searchTerm, selectedDifficulty, selectedCompanies, selectedTopics]);


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

  const getTagDisplayColor = (type: 'topic' | 'company', isSelected: boolean) => {
    if (type === 'topic') {
      return isSelected ? 'bg-indigo-600 text-white' : 'bg-indigo-400/20 text-indigo-300 hover:bg-indigo-400/40';
    }
    // type === 'company'
    return isSelected ? 'bg-purple-600 text-white' : 'bg-purple-400/20 text-purple-300 hover:bg-purple-400/40';
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-gray-200 flex flex-col">
      <Navbar />

      <div className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <h1 className="text-4xl md:text-5xl font-bold text-center text-indigo-400 mb-8">
          AlgoCraft Problems
        </h1>
        <p className="text-lg text-center text-gray-400 mb-12 max-w-2xl mx-auto">
          Sharpen your coding skills with our curated collection of algorithmic challenges.
        </p>

        <div className="flex flex-col md:flex-row gap-8 max-w-7xl mx-auto">
          {/* Left Sidebar for Filters */}
          <aside className="md:w-64 w-full flex-shrink-0 bg-gray-900 p-6 rounded-lg shadow-xl border border-gray-700 space-y-6">
            {/* Topics Filter Section */}
            <div>
              <h3 className="text-xl font-bold text-indigo-400 mb-3">Topics</h3>
              
              <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto custom-scrollbar border border-gray-800 p-2 rounded-md">
                {uniqueTopics.map((topic) => {
                  const isSelected = selectedTopics.includes(topic);
                  return (
                    <Badge
                      key={topic}
                      className={`${getTagDisplayColor('topic', isSelected)} px-3 py-1 rounded-full text-sm font-medium cursor-pointer shrink-0`}
                      onClick={() => handleToggleTopic(topic)}
                    >
                      {topic}
                    </Badge>
                  );
                })}
              </div>
            </div>

            {/* Companies Filter Section */}
            <div>
              <h3 className="text-xl font-bold text-purple-400 mb-3">Companies</h3>
              
              <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto custom-scrollbar border border-gray-800 p-2 rounded-md">
                {uniqueCompanies.map((company) => {
                  const isSelected = selectedCompanies.includes(company);
                  return (
                    <Badge
                      key={company}
                      className={`${getTagDisplayColor('company', isSelected)} px-3 py-1 rounded-full text-sm font-medium cursor-pointer shrink-0`}
                      onClick={() => handleToggleCompany(company)}
                    >
                      {company}
                    </Badge>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Right Main Content Area */}
          <div className="flex-1 space-y-6">
            {/* Search and Difficulty Filter */}
            <div className="flex flex-col sm:flex-row gap-4 w-full items-center bg-gray-900 p-4 rounded-lg shadow-xl border border-gray-700">
              <Input
                type="text"
                placeholder="Search by title or slug..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-500 focus:border-indigo-500 focus:ring-indigo-500"
              />

              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700 text-gray-200 focus:ring-indigo-500">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-gray-200">
                  <SelectItem value="All" className="hover:bg-gray-700">All Difficulties</SelectItem>
                  <SelectItem value="Easy" className="text-green-500 hover:bg-gray-700">Easy</SelectItem>
                  <SelectItem value="Medium" className="text-yellow-500 hover:bg-gray-700">Medium</SelectItem>
                  <SelectItem value="Hard" className="text-red-500 hover:bg-gray-700">Hard</SelectItem>
                </SelectContent>
              </Select>

              {(searchTerm || selectedDifficulty !== 'All' || selectedCompanies.length > 0 || selectedTopics.length > 0) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedDifficulty('All');
                    setSelectedCompanies([]);
                    setSelectedTopics([]);
                  }}
                  className="w-full sm:w-auto bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700"
                >
                  Clear All Filters <XIcon className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Problem Table */}
            {loading && (
              <div className="text-center text-lg text-gray-400 mt-10">Loading problems...</div>
            )}

            {error && (
              <div className="text-center text-lg text-red-500 mt-10">Error: {error}</div>
            )}

            {!loading && !error && filteredProblems.length === 0 && (
              <div className="text-center text-lg text-gray-400 mt-10">No problems found matching your criteria.</div>
            )}

            {!loading && !error && filteredProblems.length > 0 && (
              <div className="w-full bg-gray-900 rounded-lg shadow-xl border border-gray-700 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-800">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        #
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Title
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Difficulty
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Topics
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Companies
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">View</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {filteredProblems.map((problem) => (
                      <tr key={problem.id} className="hover:bg-gray-800 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-300">
                          {problem.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                          <Link href={`/problems/${problem.slug}`} className="hover:text-indigo-400 transition-colors">
                            {problem.title}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`${getDifficultyColor(problem.difficulty)} font-semibold`}>
                            {problem.difficulty}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">
                          <div className="flex flex-wrap gap-1">
                            {problem.topicTags.map((tag, i) => (
                              <span key={i} className="bg-blue-900/40 text-blue-300 px-2 py-0.5 rounded-full text-xs font-medium">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">
                          <div className="flex flex-wrap gap-1">
                            {problem.companyTags.map((tag, i) => (
                              <span key={i} className="bg-purple-900/40 text-purple-300 px-2 py-0.5 rounded-full text-xs font-medium">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link href={`/problems/${problem.slug}`}>
                            <Button variant="outline" size="sm" className="border-gray-600 text-gray-800 hover:text-white hover:bg-gray-800 hover:border-indigo-400 transition-colors">
                              View
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}