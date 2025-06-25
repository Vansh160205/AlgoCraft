"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// axios is not directly used in LoginPage if AuthContext handles it, but good practice to keep if it was for other calls.
// import axios from "axios";
import { useAuth } from '../../context/AuthContext'; // Adjust path if necessary
import { useRouter } from "next/navigation"; // Correct import for Next.js 13+ App Router

import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const auth = useAuth(); // Destructure the entire context object
  if (!auth) {
    // This check ensures useAuth is called within AuthProvider.
    // In Next.js, this usually means wrapping your _app.tsx or layout.tsx
    // with <AuthProvider>.
    throw new Error("AuthContext is not available. Make sure you are within an AuthProvider.");
  }
  const { login, loading } = auth; // Destructure login and loading from the context

  // useRouter is correctly imported for client components in Next.js 13+
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent default form submission behavior

    try {
      // The login function from AuthContext will handle the API call,
      // token storage, and redirection to '/profile' upon success.
      await login(email, password);
      // If login succeeds, the AuthContext should handle redirection.
      // No explicit router.push here, as it's done in AuthContext's login.
      

    } catch (error: any) {
      console.error("Login failed:", error);
      // Display a user-friendly error message
      alert(error.response?.data?.message || "Login failed. Please check your credentials and try again.");
    }

    // console.log({ email, password }); // This will log after the async operation, good for debugging
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-gray-800 text-gray-200 px-4">
      <div className="w-full max-w-md bg-gray-900 p-8 rounded-2xl shadow-xl border border-gray-700">
        <h1 className="text-3xl font-bold mb-6 text-center text-white">Login</h1> {/* Added text-white for better contrast */}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <Input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            className="bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-500 focus:ring-indigo-500 focus:border-indigo-500" // Enhanced input styling
          />
          <Input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            className="bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-500 focus:ring-indigo-500 focus:border-indigo-500" // Enhanced input styling
          />

          <Button
            type="submit"
            className="w-full text-base bg-sky-600 text-amber-50 hover:bg-sky-500 transition-colors py-2 rounded-md" // Added py and rounded-md for button
            disabled={loading} // Button disabled when loading (e.g., during API call)
          >
            {loading ? "Logging In..." : "Login"}
          </Button>

          <p className="text-sm text-center text-gray-400">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-indigo-400 hover:underline hover:text-indigo-300">
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}