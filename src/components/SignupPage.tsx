import { useEffect, useState } from 'react';
import { ArrowLeft, Mail, Lock, User } from 'lucide-react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from './ui/use-toast';

interface SignupPageProps {
  onNavigateToHome: () => void;
  onNavigateToLogin: () => void;
}

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const passwordRequirements: PasswordRequirement[] = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'One lowercase letter', test: (p) => /[a-z]/.test(p) },
  { label: 'One number', test: (p) => /\d/.test(p) },
  { label: 'One special character (!_@#$%^&*)', test: (p) => /[!_@#$%^&*(),.?":{}|<>]/.test(p) }
];

export default function SignupPage({ onNavigateToHome, onNavigateToLogin }: SignupPageProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register, googleLogin } = useAuth();
  const { toast } = useToast();

  const windowWidth = useWindowWidth();
  const googleButtonWidth = Math.min(windowWidth - 32, 270); // 32px padding, max 340px

  // ADD THIS FUNCTION - Validate Password Strength
  const validatePasswordStrength = (pass: string): boolean => {
    return passwordRequirements.every(req => req.test(pass));
  };

  function useWindowWidth() {
    const [width, setWidth] = useState(window.innerWidth);

    useEffect(() => {
      const handleResize = () => setWidth(window.innerWidth);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

    return width;
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Passwords do not match'
      });
      return;
    }

    if (!validatePasswordStrength(password)) {
      toast({
        variant: 'destructive',
        title: 'Weak Password',
        description: 'Please meet all password requirements'
      });
      return;
    }

    setLoading(true);

    try {
      await register(name, email, password);
      toast({
        title: 'Welcome!',
        description: 'Account created successfully'
      });
      onNavigateToHome();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Signup Failed',
        description: error instanceof Error ? error.message : 'Failed to create account'
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
        description: 'Google signup successful'
      });
      
      onNavigateToHome();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Google Signup Failed',
        description: error instanceof Error ? error.message : 'Failed to signup with Google'
      });
    }
  };

  const handleGoogleError = () => {
    toast({
      variant: 'destructive',
      title: 'Google Signup Failed',
      description: 'Something went wrong. Please try again.'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={onNavigateToHome}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft size={20} />
          <span>Back to Home</span>
        </button>

        {/* Signup Card */}
        <div className="bg-zinc-900/50 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
            <p className="text-white/60">Join KALLKEYY today</p>
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
              <span className="px-4 bg-zinc-900/50 text-white/60">Or sign up with email</span>
            </div>
          </div>

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                <Input
                  id="name"
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => {
                    const value = e.target.value;
                    const sanitized = value.replace(/[^A-Za-z\s.]/g, '');
                    setName(sanitized);
                  }}
                  onKeyPress={(e) => {
                    if (!/[A-Za-z\s.]/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  required
                />
              </div>
            </div>

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
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-11 pr-10 bg-white/5 border-white/10 text-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              
              {/* ADD THIS - Password Requirements Checklist */}
              {password && (
                <div className="mt-3 space-y-2 p-3 bg-zinc-800/30 border border-white/5 rounded-lg">
                  <p className="text-xs text-white/60 font-medium mb-2">Password must contain:</p>
                  {passwordRequirements.map((req, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                      {req.test(password) ? (
                        <span className="text-green-500">✓</span>
                      ) : (
                        <span className="text-red-500">✗</span>
                      )}
                      <span className={req.test(password) ? 'text-green-500' : 'text-white/50'}>
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-11 bg-white/5 border-white/10 text-white"
                  minLength={6}
                  required
                />
              </div>
              {/* ADD THIS - Password Match Indicator */}
              {confirmPassword && password !== confirmPassword && (
                <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
                  <span>✗</span> Passwords do not match
                </p>
              )}
              {confirmPassword && password === confirmPassword && (
                <p className="mt-2 text-xs text-green-500 flex items-center gap-1">
                  <span>✓</span> Passwords match
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#b90e0a] to-[#FF0000] hover:from-[#FF0000] hover:to-[#b90e0a] text-white font-bold py-6"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </Button>
          </form>

          {/* Login Link */}
          <p className="text-center text-white/60 mt-6">
            Already have an account?{' '}
            <button
              onClick={onNavigateToLogin}
              className="text-[#b90e0a] hover:text-[#FF0000] font-semibold transition-colors"
            >
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
