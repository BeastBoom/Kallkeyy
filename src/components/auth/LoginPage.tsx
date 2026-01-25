import { useEffect, useState } from 'react';
import { ArrowLeft, Mail, Lock, Sparkles } from 'lucide-react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../ui/use-toast';

interface LoginPageProps {
  onNavigateToHome: () => void;
  onNavigateToSignup: () => void;
  onNavigateToForgotPassword: () => void;
  onNavigateToPrivacyPolicy?: () => void;
  onNavigateToTermsOfService?: () => void;
}

// Animated doodle shapes component - Larger on laptops
const DoodleBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Floating circles - larger and more spread on lg screens */}
      <div className="absolute top-12 left-6 lg:top-16 lg:left-20 w-12 h-12 lg:w-24 lg:h-24 border-2 border-[#b90e0a]/20 rounded-full animate-float-slow" />
      <div className="absolute top-24 right-12 lg:top-32 lg:right-32 w-6 h-6 lg:w-14 lg:h-14 bg-[#b90e0a]/10 rounded-full animate-float-medium" />
      <div className="absolute bottom-24 left-12 lg:bottom-32 lg:left-32 w-10 h-10 lg:w-20 lg:h-20 border-2 border-dashed border-[#b90e0a]/15 rounded-full animate-float-fast" />
      <div className="hidden lg:block absolute top-1/2 left-12 w-16 h-16 border-2 border-[#b90e0a]/10 rounded-full animate-float-medium" />
      
      {/* Animated lines - larger on lg */}
      <svg className="absolute top-20 right-6 lg:top-24 lg:right-20 w-16 h-16 lg:w-32 lg:h-32 text-[#b90e0a]/15 animate-draw" viewBox="0 0 100 100">
        <path d="M10 50 Q 50 10 90 50 Q 50 90 10 50" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="200" strokeDashoffset="200" className="animate-dash" />
      </svg>
      
      {/* Squiggly line - larger on lg */}
      <svg className="absolute bottom-16 right-20 lg:bottom-24 lg:right-40 w-24 h-12 lg:w-48 lg:h-20 text-[#b90e0a]/20 animate-float-slow" viewBox="0 0 120 40">
        <path d="M0 20 Q 15 5 30 20 Q 45 35 60 20 Q 75 5 90 20 Q 105 35 120 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      
      {/* Stars - larger on lg */}
      <div className="absolute top-1/4 left-1/4 lg:left-1/5 text-[#b90e0a]/20 animate-pulse-slow">
        <Sparkles className="w-5 h-5 lg:w-8 lg:h-8" />
      </div>
      <div className="absolute bottom-1/3 right-1/4 lg:right-1/5 text-[#b90e0a]/15 animate-pulse-medium">
        <Sparkles className="w-4 h-4 lg:w-7 lg:h-7" />
      </div>
      
      {/* Extra sparkles for lg screens */}
      <div className="hidden lg:block absolute top-1/3 right-1/6 text-[#b90e0a]/15 animate-pulse-slow">
        <Sparkles className="w-6 h-6" />
      </div>
      
      {/* Dotted pattern - larger on lg */}
      <div className="absolute top-40 left-20 lg:top-48 lg:left-40 grid grid-cols-3 gap-1.5 lg:gap-3 animate-float-medium">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="w-1 h-1 lg:w-2.5 lg:h-2.5 bg-[#b90e0a]/20 rounded-full" />
        ))}
      </div>
      
      {/* Cross shapes - larger on lg */}
      <div className="absolute bottom-40 left-10 lg:bottom-48 lg:left-24 w-4 h-4 lg:w-10 lg:h-10 animate-spin-slow">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-[#b90e0a]/15 -translate-y-1/2" />
        <div className="absolute left-1/2 top-0 h-full w-0.5 bg-[#b90e0a]/15 -translate-x-1/2" />
      </div>
      
      {/* Triangle - larger on lg */}
      <svg className="absolute top-1/3 right-10 lg:right-24 w-8 h-8 lg:w-16 lg:h-16 text-[#b90e0a]/15 animate-float-fast" viewBox="0 0 50 50">
        <polygon points="25,5 45,45 5,45" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
      
      {/* Zigzag - larger on lg */}
      <svg className="absolute bottom-20 left-1/3 lg:left-1/4 w-16 h-6 lg:w-28 lg:h-10 text-[#b90e0a]/15 animate-float-medium" viewBox="0 0 80 30">
        <polyline points="0,15 20,5 40,25 60,5 80,15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      
      {/* Extra shapes for lg screens */}
      <div className="hidden lg:block absolute top-20 left-1/3 w-12 h-12 border-2 border-[#b90e0a]/10 rounded-lg rotate-45 animate-float-slow" />
      <svg className="hidden lg:block absolute bottom-1/3 left-16 w-20 h-20 text-[#b90e0a]/10 animate-float-medium" viewBox="0 0 100 100">
        <polygon points="50,10 90,90 10,90" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>

      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes float-medium {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-3deg); }
        }
        @keyframes float-fast {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.1); }
        }
        @keyframes pulse-medium {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.15); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes dash {
          to { stroke-dashoffset: 0; }
        }
        .animate-float-slow { animation: float-slow 6s ease-in-out infinite; }
        .animate-float-medium { animation: float-medium 4s ease-in-out infinite; }
        .animate-float-fast { animation: float-fast 3s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        .animate-pulse-medium { animation: pulse-medium 3s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 20s linear infinite; }
        .animate-dash { animation: dash 3s ease-in-out infinite alternate; }
      `}</style>
    </div>
  );
};

export default function LoginPage({ 
  onNavigateToHome, 
  onNavigateToSignup,
  onNavigateToForgotPassword,
  onNavigateToPrivacyPolicy,
  onNavigateToTermsOfService
}: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, googleLogin } = useAuth();
  const { toast } = useToast();

  function useWindowWidth() {
    const [width, setWidth] = useState(window.innerWidth);

    useEffect(() => {
      const handleResize = () => setWidth(window.innerWidth);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

    return width;
  }

  const windowWidth = useWindowWidth();
  const googleButtonWidth = Math.min(windowWidth - 64, 300);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password, rememberMe);
      toast({
        title: 'Welcome back!',
        description: rememberMe ? 'Login successful - You will stay signed in for a week' : 'Login successful'
      });
      onNavigateToHome();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error instanceof Error ? error.message : 'Invalid credentials'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      if (!credentialResponse.credential) {
        throw new Error('No credential received');
      }

      await googleLogin(credentialResponse.credential);
      
      toast({
        title: 'Welcome!',
        description: 'Google login successful'
      });
      
      onNavigateToHome();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Google Login Failed',
        description: error instanceof Error ? error.message : 'Failed to login with Google'
      });
    }
  };

  const handleGoogleError = () => {
    toast({
      variant: 'destructive',
      title: 'Google Login Failed',
      description: 'Something went wrong. Please try again.'
    });
  };

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center px-4 relative">
      <DoodleBackground />
      
      <div className="w-full max-w-sm relative z-10">
        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-[#b90e0a] transition-all duration-300 mb-4 group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform duration-300" />
          <span className="font-medium text-sm">Back</span>
        </button>

        {/* Login Card */}
        <div className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-6 lg:p-8 shadow-[0_8px_40px_rgba(0,0,0,0.08)] hover:shadow-[0_16px_60px_rgba(185,14,10,0.1)] transition-all duration-500">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-[#b90e0a] to-[#ff3333] rounded-xl mb-4 shadow-lg shadow-[#b90e0a]/20">
              <Lock className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1.5 tracking-tight">Welcome Back</h1>
            <p className="text-gray-500">Login to your account</p>
          </div>

          {/* Google Login */}
          <div className="w-full flex justify-center mb-5">
            <div style={{ width: googleButtonWidth }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="outline"
                size="large"
                text="signin_with"
                width={googleButtonWidth}
                shape="pill"
              />
            </div>
          </div>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-400 font-medium">Or continue with email</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#b90e0a] transition-colors duration-300" size={20} />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="pl-12 h-12 bg-gray-50/50 border-gray-200 text-gray-900 placeholder:text-gray-400 rounded-xl focus:border-[#b90e0a] focus:ring-[#b90e0a]/20 focus:ring-4 transition-all duration-300"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#b90e0a] transition-colors duration-300" size={20} />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-12 h-12 bg-gray-50/50 border-gray-200 text-gray-900 placeholder:text-gray-400 rounded-xl focus:border-[#b90e0a] focus:ring-[#b90e0a]/20 focus:ring-4 transition-all duration-300"
                  required
                />
              </div>
            </div>

            {/* Remember Me and Forgot Password */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 bg-gray-50 text-[#b90e0a] focus:ring-[#b90e0a] focus:ring-offset-0 cursor-pointer transition-all duration-300"
                />
                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors duration-300">
                  Remember me
                </span>
              </label>
              <button
                type="button"
                onClick={onNavigateToForgotPassword}
                className="text-sm text-[#b90e0a] hover:text-[#8a0b08] font-semibold transition-colors duration-300"
              >
                Forgot Password?
              </button>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-[#b90e0a] to-[#d91410] hover:from-[#a00d09] hover:to-[#b90e0a] text-white font-bold rounded-xl shadow-lg shadow-[#b90e0a]/25 hover:shadow-xl hover:shadow-[#b90e0a]/30 transition-all duration-300 hover:-translate-y-0.5"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Logging in...
                </span>
              ) : 'Login'}
            </Button>
          </form>

          {/* Sign Up Link */}
          <p className="text-center text-gray-500 mt-5">
            Don't have an account?{' '}
            <button
              onClick={onNavigateToSignup}
              className="text-[#b90e0a] hover:text-[#8a0b08] font-bold transition-colors duration-300"
            >
              Sign Up
            </button>
          </p>

          {/* Privacy Policy and Terms of Service Links */}
          <p className="text-center text-gray-400 text-xs mt-4 leading-relaxed">
            By logging in, you agree to our{" "}
            {onNavigateToTermsOfService ? (
              <button
                onClick={onNavigateToTermsOfService}
                className="text-[#b90e0a] hover:text-[#8a0b08] underline underline-offset-2 transition-colors duration-300"
              >
                Terms of Service
              </button>
            ) : (
              <a
                href="/terms-of-service"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#b90e0a] hover:text-[#8a0b08] underline underline-offset-2 transition-colors duration-300"
              >
                Terms of Service
              </a>
            )}{" "}
            and{" "}
            {onNavigateToPrivacyPolicy ? (
              <button
                onClick={onNavigateToPrivacyPolicy}
                className="text-[#b90e0a] hover:text-[#8a0b08] underline underline-offset-2 transition-colors duration-300"
              >
                Privacy Policy
              </button>
            ) : (
              <a
                href="/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#b90e0a] hover:text-[#8a0b08] underline underline-offset-2 transition-colors duration-300"
              >
                Privacy Policy
              </a>
            )}
            .
          </p>
        </div>
      </div>
    </div>
  );
}
