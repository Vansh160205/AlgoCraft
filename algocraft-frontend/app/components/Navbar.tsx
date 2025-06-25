"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const auth = useAuth();
  console.log(auth);
  const user = auth?.user;
  const isAuthenticated = auth?.isAuthenticated;
  const loading = auth?.loading;
  const logout = auth?.logout;
  return (
    <nav className="w-full px-6 py-4 flex justify-between items-center bg-black/60 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
      <Link href="/" className="text-2xl font-bold text-indigo-400">
        AlgoCraft
      </Link>

      <div className="flex gap-4 items-center">
        {isAuthenticated ? (
                <>
                    <Link href="/profile">
                        <button>Profile</button>
                    </Link>
                    {console.log(user)}
                    {user?.isAdmin ?(
                      <Link href="/admin">
                        <button>Add Problem</button>
                      </Link>
                    ):(<></>)
                    }
                    <p>Hello, {user?.name || 'Authenticated User'}!</p>
                    <button onClick={logout}>Logout</button>
                    {/* Add links to other protected content if any */}
                </>
            ) : (
                <>
                    <p>You are not logged in.</p>
                    <Link href="/login">
                        <button>Login</button>
                    </Link>
                    <Link href="/register">
                        <button>Register</button>
                    </Link>
                </>
            )}
      </div>
    </nav>
  );
}
