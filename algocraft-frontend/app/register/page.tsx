"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import axios from "axios";

export default function RegisterPage() {
  const [email, setEmail] = useState<string>(""); // Added type annotation
  const [name, setName] = useState<string>(""); // Added type annotation
  const [password, setPassword] = useState<string>(""); // Added type annotation
  const [confirmPassword, setConfirmPassword] = useState<string>(""); // Added type annotation

  const router = useRouter();

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => { // Changed type annotation for 'e'
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }
    try {
      // TODO: Replace this with your actual registration API call
      console.log({ email, name, password });

      const res = await axios.post("http://localhost:5000/api/users/register", {
        email,
        name,
        password,
      });
      console.log(res.data)
      if (res.status === 201) { // Changed == to ===
        localStorage.setItem("user", JSON.stringify(res.data.user));
        localStorage.setItem("token", res.data.token);
        console.log("User created successfully:", localStorage.getItem("user"));
        console.log("User created successfully:", localStorage.getItem("token"));

        alert("User created successfully");
        router.push(`/`); // ✅ Pass email in query
      } else {
        alert(res.data.message || "Error in registering.");
      }
    } catch (error: any) { // Added type annotation for error
      console.error("Registration failed:", error);
      alert("Registration failed. Try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-gray-800 text-gray-200 px-4">
      <div className="w-full max-w-md bg-gray-900 p-8 rounded-2xl shadow-xl border border-gray-700">
        <h1 className="text-3xl font-bold mb-6 text-center">Register</h1>

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <Input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} // Added type annotation
            className="bg-gray-800 border-gray-700 text-gray-200"
          />
          <Input
            type="text"
            placeholder="Name"
            required
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)} // Added type annotation
            className="bg-gray-800 border-gray-700 text-gray-200"
          />
          <Input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} // Added type annotation
            className="bg-gray-800 border-gray-700 text-gray-200"
          />
          <Input
            type="password"
            placeholder="Confirm Password"
            required
            value={confirmPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)} // Added type annotation
            className="bg-gray-800 border-gray-700 text-gray-200"
          />

          <Button type="submit" className="w-full text-base bg-sky-600 text-amber-50 hover:bg-sky-500 transition-colors">
            Register
          </Button>

          <p className="text-sm text-center text-gray-400">
            Already have an account?{" "}
            <Link href="/login" className="text-indigo-400 hover:underline">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}