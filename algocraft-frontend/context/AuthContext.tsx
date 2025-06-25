// src/context/AuthContext.tsx
'use client'
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation'; // Assuming Next.js App Router
import { ChevronsUp } from 'lucide-react';

// Define your backend API base URL
const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:5000/api'; // Use environment variable

// Define your User type if you have one
interface User {
  id: number;
  email: string;
  name: string;
  isAdmin:boolean;
  createdAt:Date;
  password:String;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean; // <-- NEW: Added isAuthenticated
  login: (email: string, password: string) => Promise<any>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // Initial loading for token check
  const router = useRouter();

  // On initial load, try to get token from localStorage
  useEffect(() => {
  const storedToken = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');

  if (storedToken) {
    setToken(storedToken);
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse stored user:', e);
      }
    }
  }

  setLoading(false);
}, []);


  // isAuthenticated is derived from token existence
  const isAuthenticated = !!token; // Simple boolean conversion of token


  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await axios.post(`${BACKEND_API_URL}/users/login`, {
        email,
        password,
      });

      const receivedToken = response.data.token;
      const receivedUser = response.data.user;

      localStorage.setItem('token', receivedToken);
      localStorage.setItem('user',JSON.stringify(receivedUser));
      setToken(receivedToken);
      setUser(receivedUser);
      console.log(user);
      if(receivedUser.isAdmin){
        console.log("hii")
        router.push('/admin');
      }
      else{
        router.push("/");
      }
      return response.data; // Return response data for handling in LoginPage
    } catch (error) {
      console.error("AuthContext Login Error:", error);
      localStorage.removeItem('authToken'); // Clear token on failed login
      setToken(null);
      setUser(null);
      throw error; // Re-throw to be caught by the LoginPage component
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    router.push('/login'); // Redirect to login page on logout
  };

  const contextValue: AuthContextType = {
    user,
    token,
    loading,
    isAuthenticated, // <-- NEW: Include in context value
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
;