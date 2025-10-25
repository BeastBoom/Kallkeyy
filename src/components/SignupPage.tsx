"use client";

import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft } from "lucide-react";

interface Props {
  onNavigateToHome: () => void;
  onNavigateToLogin: () => void;
}

export default function SignupPage({ onNavigateToHome, onNavigateToLogin }: Props) {
  const { signup } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      await signup(name, email, password);
      onNavigateToHome(); // Redirect to home after successful signup
    } catch (err: any) {
      setError(err.message || "Signup failed. Please try again.");
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

        {/* Signup Card */}
        <div className="bg-[#28282B] rounded-2xl p-8 border border-[#808088]/20">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
              JOIN <span className="text-[#DD0004]">KALLKEYY</span>
            </h1>
            <p className="text-[#808088]">Create your account to get started</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-[#DD0004]/10 border border-[#DD0004] text-[#DD0004] px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Input */}
            <div>
              <label className="block text-sm font-bold text-white mb-2">
                FULL NAME
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#808088]" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="John Doe"
                  className="w-full bg-black border border-[#808088]/30 rounded-lg py-3 px-12 text-white placeholder-[#808088] focus:outline-none focus:border-[#DD0004] transition-colors duration-300"
                />
              </div>
            </div>

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

            {/* Confirm Password Input */}
            <div>
              <label className="block text-sm font-bold text-white mb-2">
                CONFIRM PASSWORD
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#808088]" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-black border border-[#808088]/30 rounded-lg py-3 px-12 text-white placeholder-[#808088] focus:outline-none focus:border-[#DD0004] transition-colors duration-300"
                />
              </div>
            </div>

            {/* Signup Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#DD0004] hover:bg-[#DD0004]/80 text-white font-bold py-3 rounded-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? "CREATING ACCOUNT..." : "SIGN UP"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-[#808088]/30"></div>
            <span className="px-4 text-sm text-[#808088]">OR</span>
            <div className="flex-1 border-t border-[#808088]/30"></div>
          </div>

          {/* Login Link */}
          <p className="text-center text-[#808088]">
            Already have an account?{" "}
            <button
              onClick={onNavigateToLogin}
              className="text-[#DD0004] hover:underline font-bold"
            >
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
