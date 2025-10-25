"use client";

import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Eye, EyeOff, Mail, Lock, ArrowLeft } from "lucide-react";

interface Props {
  onNavigateToHome: () => void;
  onNavigateToSignup: () => void;
}

export default function LoginPage({ onNavigateToHome, onNavigateToSignup }: Props) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(email, password);
      onNavigateToHome(); // Redirect to home after successful login
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={onNavigateToHome}
          className="flex items-center text-[#808088] hover:text-white mb-8 transition-colors duration-300"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Home
        </button>

        {/* Login Card */}
        <div className="bg-[#28282B] rounded-2xl p-8 border border-[#808088]/20">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
              WELCOME <span className="text-[#DD0004]">BACK</span>
            </h1>
            <p className="text-[#808088]">Login to access your account</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-[#DD0004]/10 border border-[#DD0004] text-[#DD0004] px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-bold text-white mb-2">
                EMAIL
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#808088]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                  className="w-full bg-black border border-[#808088]/30 rounded-lg py-3 px-12 text-white placeholder-[#808088] focus:outline-none focus:border-[#DD0004] transition-colors duration-300"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-bold text-white mb-2">
                PASSWORD
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#808088]" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-black border border-[#808088]/30 rounded-lg py-3 px-12 text-white placeholder-[#808088] focus:outline-none focus:border-[#DD0004] transition-colors duration-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#808088] hover:text-white transition-colors duration-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#DD0004] hover:bg-[#DD0004]/80 text-white font-bold py-3 rounded-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? "LOGGING IN..." : "LOGIN"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-[#808088]/30"></div>
            <span className="px-4 text-sm text-[#808088]">OR</span>
            <div className="flex-1 border-t border-[#808088]/30"></div>
          </div>

          {/* Signup Link */}
          <p className="text-center text-[#808088]">
            Don't have an account?{" "}
            <button
              onClick={onNavigateToSignup}
              className="text-[#DD0004] hover:underline font-bold"
            >
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
