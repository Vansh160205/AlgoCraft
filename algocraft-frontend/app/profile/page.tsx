'use client'
import React, { useState, useEffect } from 'react';
import axios from 'axios';

import AnalysisDialog from '../components/AnalysisDialog'; // Adjust path as needed
import { useRouter } from 'next/navigation'; // Import useRouter


// Define interfaces for data received from backend
interface Problem {
  id: number;
  title: string;
  slug: string;
}

interface Submission {
  id: number;
  status: string;
  language: string;
  runtime: number | null;
  memory: number | null;
  submittedAt: string; // ISO 8601 string
  problem: Problem;
}

interface UserProfile {
  id: number;
  email: string;
  name: string;
  submissions: Submission[];
}

const ProfilePage: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showAnalysisDialog, setShowAnalysisDialog] = useState<boolean>(false);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<number | null>(null);
  const [submissionDetailsAnalysis, setSubmissionDetailsAnalysis] = useState<string | null>(null); // To store the full analysis string for the dialog
  const router = useRouter();
  // Function to fetch submission details (e.g., full code, stdout, stderr, etc.)
  // You would need a separate backend endpoint for this, e.g., GET /api/submissions/:id/details
  const fetchSubmissionDetails = async (submissionId: number) => {
    setLoading(true);
    setError(null);
    try {
      // THIS IS A PLACEHOLDER. You need a backend endpoint for this.
      // For now, let's simulate a response that matches the Gemini output format.
      // In a real app, you'd fetch the actual stored analysis or full submission run details.
      const response = await axios.get(`/submissions/${submissionId}/details`); // <-- YOU NEED TO IMPLEMENT THIS BACKEND ENDPOINT
      setSubmissionDetailsAnalysis(response.data.fullAnalysisText || "No detailed analysis available.");
      setShowAnalysisDialog(true);
    } catch (err: any) {
      console.error('Error fetching submission details:', err);
      setError('Failed to fetch submission details.');
      setSubmissionDetailsAnalysis(`Error fetching details: ${err.message}`);
      setShowAnalysisDialog(true); // Still show dialog to report error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // You'll need to send an auth token with this request
        const token = localStorage.getItem('token'); // Example: get token from local storage
        if (!token) {
          setError('Authentication token not found. Please log in.');
          setLoading(false);
          return;
        }

        const response = await axios.get('http://localhost:5000/api/users/profile', {
          headers: {
            Authorization: `Bearer ${token}`, // Send JWT token
          },
        });
        console.log(response.data);
        setUserProfile(response.data);
      } catch (err: any) {
        console.error('Error fetching user profile:', err);
        setError('Failed to load user profile. ' + (err.response?.data?.error || err.message));
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Helper to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Accepted': return 'text-green-500 bg-green-900/20';
      case 'Wrong Answer': return 'text-red-500 bg-red-900/20';
      case 'Time Limit Exceeded':
      case 'Runtime Error': return 'text-yellow-500 bg-yellow-900/20';
      case 'Compilation Error': return 'text-blue-500 bg-blue-900/20';
      default: return 'text-gray-400 bg-gray-800/20';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900 text-white">
        <div className="text-xl">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900 text-red-500">
        <div className="text-xl">Error: {error}</div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900 text-gray-400">
        <div className="text-xl">No user data available.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-gray-850 rounded-lg shadow-xl p-8 border border-gray-700">

         <button
            onClick={() => router.push('/')} // Navigate to the root path
            className="flex items-center text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            {/* You'd typically use an icon here, e.g., from Material Icons or Lucide/Heroicons */}
            <span className="material-icons-outlined mr-2">arrow_back</span> {/* Requires Material Icons */}
            Back
          </button>

        <h1 className="text-4xl font-extrabold text-indigo-500 mb-6 text-center">
          {userProfile.name}'s Profile
        </h1>

        {/* Personal Details */}
        <div className="mb-8 p-6 bg-gray-800 rounded-lg border border-gray-700 shadow-md">
          <h2 className="text-2xl font-bold text-gray-200 mb-4 flex items-center">
            Personal Information
          </h2>
          <p className="text-lg mb-2"><span className="font-semibold text-gray-400">Email:</span> {userProfile.email}</p>
          <p className="text-lg mb-2"><span className="font-semibold text-gray-400">Name:</span> {userProfile.name}</p>
          
          {/* Add more personal details if available in your user model */}
        </div>

        {/* Submission Analysis */}
        <div className="p-6 bg-gray-800 rounded-lg border border-gray-700 shadow-md">
          <h2 className="text-2xl font-bold text-indigo-400 mb-4 flex items-center">
            Submission History
          </h2>

          {userProfile.submissions.length === 0 ? (
            <p className="text-gray-400 text-center text-lg py-4">You haven't made any submissions yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Problem
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Language
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Runtime
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Memory
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Submitted At
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {userProfile.submissions.map((submission) => (
                    <tr key={submission.id} className="hover:bg-gray-700 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <a href={`/problems/${submission.problem.slug}`} className="text-indigo-400 hover:text-indigo-300 hover:underline font-medium">
                          {submission.problem.title}
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(submission.status)}`}>
                          {submission.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {submission.language}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {submission.runtime !== null ? `${submission.runtime.toFixed(3)} s` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {submission.memory !== null ? `${submission.memory} KB` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300 text-sm">
                        {new Date(submission.submittedAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => {
                            setSelectedSubmissionId(submission.id);
                            fetchSubmissionDetails(submission.id);
                          }}
                          className="text-indigo-400 hover:text-indigo-300 hover:underline ml-2"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showAnalysisDialog && selectedSubmissionId && (
        <AnalysisDialog
          analysisResult={submissionDetailsAnalysis}
          setShowAnalysisDialog={setShowAnalysisDialog}
        />
      )}
    </div>
  );
};

export default ProfilePage;