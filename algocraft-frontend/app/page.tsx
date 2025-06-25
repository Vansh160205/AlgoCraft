// src/app/page.tsx
'use client'; // This page needs to be a client component to use the AuthContext

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import Link from "next/link"; // Import Link for navigation
import { useAuth } from '../context/AuthContext'; // Import your AuthContext hook
import { useEffect, useState } from "react";
import api from "@/lib/axios";

type Difficulty = 'easy' | 'medium' | 'hard';

const difficultyColorMap: Record<Difficulty, string> = {
  easy: 'green',
  medium: 'yellow',
  hard: 'red',
};

export default function HomePage() {
  const auth = useAuth(); // Use your auth context
  const user = auth?.user;
  const isAuthenticated = auth?.isAuthenticated;
  const loading = auth?.loading;

  const [problems, setProblems] = useState<
    {
      id: number;
      title: string;
      slug: string;
      description: string;
      difficulty: Difficulty;
    }[]
  >([]);

  const truncate = (text: string, maxLength = 100) =>
    text.length > maxLength ? text.slice(0, maxLength) + '...' : text;

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const res = await api.get('/problems'); // 🔁 adjust to your backend route
        console.log(res.data);
        setProblems(res.data.slice(0,3)); // assuming data is an array of problems
      } catch (err) {
        console.error('Error fetching problems:', err);
      }
    };
      fetchProblems();
  }, []);

  // Helper function for placeholder user
  const getDisplayName = () => {
    if (isAuthenticated && user) {
      return user.name || user.email.split('@')[0] || 'Authenticated User';
    }
    return 'Guest';
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-gray-800 text-gray-200">
        <div>Loading authentication status...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-gray-200 flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 text-center py-20 md:py-32">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Welcome {isAuthenticated ? getDisplayName() : ''} to <span className="text-indigo-400">AlgoCraft</span>
        </h1>
        <p className="max-w-3xl text-lg md:text-xl text-gray-400 mb-10">
          Practice coding problems, enhance your skills, and prepare for coding interviews with real-time code execution.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          {isAuthenticated ? (
            <Link href="/dashboard"> {/* Assuming a dashboard for authenticated users */}
              <Button className="text-base px-8 py-4 bg-indigo-600 hover:bg-indigo-700 transition-colors">
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <Link href="/problems"> {/* Direct unauthenticated users to problems */}
              <Button className="text-base px-8 py-4 bg-sky-600 hover:bg-sky-500 transition-colors">
                Start Solving Problems
              </Button>
            </Link>
          )}
          <Link href="/about"> {/* A generic "Learn More" could go to an About Us page */}
            <Button variant="outline" className="text-base px-6 py-3 border-gray-500 text-gray-800 hover:text-white hover:bg-gray-800 transition-colors">
              Learn More
            </Button>
          </Link>
        </div>

        {/* Feature Cards (Original) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 w-full max-w-5xl">
          {["Practice", "Compete", "Learn"].map((title, index) => (
            <Card
              key={index}
              className="bg-gray-900 border-gray-700 hover:border-indigo-400 hover:scale-[1.02] transition-transform duration-300"
            >
              <CardContent className="p-6 text-zinc-50">
                <h2 className="text-2xl font-semibold mb-2">{title}</h2>
                <p className="text-gray-400">
                  {title === "Practice" && "Solve algorithmic challenges across multiple domains."}
                  {title === "Compete" && "Participate in coding contests and improve your rank."}
                  {title === "Learn" && "Access tutorials, guides, and learning paths."}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Problem Showcase / Trending Problems Section */}
      <section className="w-full py-20 bg-gray-900 text-center px-4">
      <h2 className="text-4xl font-bold mb-12 text-indigo-400">
        {isAuthenticated ? "Your Next Challenge" : "Popular Problems to Get Started"}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {problems.map((problem) => {
          const difficultyColor = {
            easy: 'green',
            medium: 'yellow',
            hard: 'red',
          }[problem.difficulty] || 'indigo';

          return (
            <Card key={problem.id} className={`bg-gray-800 border-gray-700 hover:border-${difficultyColor}-400 hover:shadow-lg transition-all`}>
              <CardContent className="p-6">
                <h3 className={`text-xl font-semibold text-${difficultyColor}-400 mb-2`}>
                  {problem.title} ({problem.difficulty})
                </h3>
                <p className="text-gray-400 mb-4">{truncate(problem.description, 100)}</p>
                <Link href={`/problems/${problem.slug}`}>
                  <Button variant="outline" className={`border-${difficultyColor}-500 text-${difficultyColor}-400 hover:bg-${difficultyColor}-900/20`}>
                    {isAuthenticated ? "Solve Now" : "View Problem"}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>
        <div className="mt-12">
          <Link href="/problems">
            <Button className="text-base px-8 py-4 bg-indigo-600 text-amber-50 hover:bg-indigo-500 transition-colors">
              Explore All Problems
            </Button>
          </Link>
        </div>
      </section>

      {/* How It Works / Getting Started Guide */}
      <section className="w-full py-20 bg-black text-center px-4">
        <h2 className="text-4xl font-bold mb-12 text-blue-400">How AlgoCraft Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          <div className="flex flex-col items-center p-6 bg-gray-900 rounded-lg shadow-lg border border-gray-700">
            <span className="text-5xl mb-4 text-blue-400">1️⃣</span>
            <h3 className="text-2xl font-semibold mb-2">Sign Up (or Log In)</h3>
            <p className="text-gray-400 text-center">Create your free account in minutes to unlock full features.</p>
          </div>
          <div className="flex flex-col items-center p-6 bg-gray-900 rounded-lg shadow-lg border border-gray-700">
            <span className="text-5xl mb-4 text-purple-400">2️⃣</span>
            <h3 className="text-2xl font-semibold mb-2">Choose Your Challenge</h3>
            <p className="text-gray-400 text-center">Select from a vast library of problems by difficulty, topic, or company.</p>
          </div>
          <div className="flex flex-col items-center p-6 bg-gray-900 rounded-lg shadow-lg border border-gray-700">
            <span className="text-5xl mb-4 text-green-400">3️⃣</span>
            <h3 className="text-2xl font-semibold mb-2">Code, Test, & Learn</h3>
            <p className="text-gray-400 text-center">Write your solution in our editor, run tests, and learn from detailed explanations.</p>
          </div>
        </div>
        {!isAuthenticated && (
          <div className="mt-12">
            <Link href="/register">
              <Button className="text-lg px-10 py-5 bg-purple-600 text-white hover:bg-purple-500 transition-colors">
                Join AlgoCraft Today!
              </Button>
            </Link>
          </div>
        )}
      </section>

      {/* Testimonials / Success Stories */}
      <section className="w-full py-20 bg-gradient-to-br from-black via-gray-900 to-gray-800 text-center px-4">
        <h2 className="text-4xl font-bold mb-12 text-green-400">What Our Users Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="bg-gray-900 border-gray-700 p-6 rounded-lg shadow-md">
            <CardContent className="p-0">
              <p className="italic text-gray-300 mb-4">
                &quot;AlgoCraft helped me land my dream job at Google! The problem variety and detailed solutions are unmatched.&quot;
              </p>
              <p className="font-semibold text-indigo-400">- Jane Doe, Software Engineer at Google</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-700 p-6 rounded-lg shadow-md">
            <CardContent className="p-0">
              <p className="italic text-gray-300 mb-4">
                &quot;I used to struggle with algorithms, but AlgoCraft's learning paths made it so much clearer. Highly recommend!&quot;
              </p>
              <p className="font-semibold text-indigo-400">- John Smith, Student</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Call to Action (Reiteration) */}
      <section className="w-full py-16 bg-gray-900 text-center px-4">
        {isAuthenticated ? (
          <>
            <h2 className="text-3xl font-bold mb-6 text-white">Continue Your Coding Journey</h2>
            <Link href="/problems">
              <Button className="text-lg px-10 py-5 bg-sky-600 text-amber-50 hover:bg-sky-500 transition-colors">
                Explore More Problems
              </Button>
            </Link>
          </>
        ) : (
          <>
            <h2 className="text-3xl font-bold mb-6 text-white">Ready to Elevate Your Coding Skills?</h2>
            <Link href="/register">
              <Button className="text-lg px-10 py-5 bg-indigo-600 text-white hover:bg-indigo-500 transition-colors">
                Sign Up for Free
              </Button>
            </Link>
          </>
        )}
      </section>

      <Footer />
    </main>
  );
}