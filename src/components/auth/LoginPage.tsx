import { useEffect, useState } from 'react';
import { ArrowLeft, Mail, Lock } from 'lucide-react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../ui/use-toast';

interface LoginPageProps {
  onNavigateToHome: () => void;
  onNavigateToSignup: () => void;
  onNavigateToForgotPassword: () => void;
}

export default function LoginPage({ 
  onNavigateToHome, 
  onNavigateToSignup,
  onNavigateToForgotPassword 
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
  const googleButtonWidth = Math.min(windowWidth - 32, 270);

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
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

        {/* Login Card */}
        <div className="bg-zinc-900/50 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-white/60">Login to your account</p>
          </div>

          {/* Google Signup */}
          <div className="w-full flex justify-center">
            <div style={{ width: googleButtonWidth }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="filled_black"
                size="large"
                text="signup_with"
                width={googleButtonWidth}
              />
            </div>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-zinc-900/50 text-white/60">Or continue with email</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="pl-11 bg-white/5 border-white/10 text-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-11 bg-white/5 border-white/10 text-white"
                  required
                />
              </div>
            </div>

            {/* Remember Me and Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-[#b90e0a] focus:ring-[#b90e0a] focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-sm text-white/70 group-hover:text-white transition-colors">
                  Remember me for 7 days
                </span>
              </label>
              <button
                type="button"
                onClick={onNavigateToForgotPassword}
                className="text-sm text-[#b90e0a] hover:text-[#FF0000] transition-colors"
              >
                Forgot Password?
              </button>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#b90e0a] to-[#FF0000] hover:from-[#FF0000] hover:to-[#b90e0a] text-white font-bold py-6"
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          {/* Sign Up Link */}
          <p className="text-center text-white/60 mt-6">
            Don't have an account?{' '}
            <button
              onClick={onNavigateToSignup}
              className="text-[#b90e0a] hover:text-[#FF0000] font-semibold transition-colors"
            >
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
