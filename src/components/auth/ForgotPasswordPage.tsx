import { useState } from 'react';
import { ArrowLeft, Mail, Lock, Key, KeyRound, CheckCircle2, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useToast } from '../ui/use-toast';
import { API_BASE_URL } from '../../lib/apiConfig';

interface ForgotPasswordPageProps {
  onNavigateToLogin: () => void;
}

type Step = 'email' | 'verify' | 'reset' | 'success';

// Animated doodle shapes component - Larger on laptops
const DoodleBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Floating circles - larger and more spread on lg screens */}
      <div className="absolute top-16 left-10 lg:top-20 lg:left-24 w-10 h-10 lg:w-20 lg:h-20 border-2 border-[#b90e0a]/15 rounded-full animate-float-slow" />
      <div className="absolute top-32 right-8 lg:top-40 lg:right-28 w-7 h-7 lg:w-16 lg:h-16 bg-[#b90e0a]/10 rounded-full animate-float-medium" />
      <div className="absolute bottom-24 left-16 lg:bottom-32 lg:left-28 w-12 h-12 lg:w-24 lg:h-24 border-2 border-dashed border-[#b90e0a]/20 rounded-full animate-float-fast" />
      <div className="hidden lg:block absolute top-1/2 right-20 w-14 h-14 border-2 border-[#b90e0a]/10 rounded-full animate-float-slow" />
      
      {/* Key shape - larger on lg */}
      <svg className="absolute top-24 right-16 lg:top-28 lg:right-36 w-12 h-12 lg:w-24 lg:h-24 text-[#b90e0a]/15 animate-float-slow" viewBox="0 0 100 100">
        <circle cx="30" cy="30" r="20" fill="none" stroke="currentColor" strokeWidth="3" />
        <line x1="45" y1="45" x2="85" y2="85" stroke="currentColor" strokeWidth="3" />
        <line x1="70" y1="70" x2="85" y2="55" stroke="currentColor" strokeWidth="3" />
        <line x1="60" y1="60" x2="75" y2="45" stroke="currentColor" strokeWidth="3" />
      </svg>
      
      {/* Lock shape - larger on lg */}
      <svg className="absolute bottom-24 right-12 lg:bottom-32 lg:right-28 w-10 h-10 lg:w-20 lg:h-24 text-[#b90e0a]/15 animate-float-medium" viewBox="0 0 50 60">
        <rect x="5" y="25" width="40" height="30" rx="3" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M15 25 V15 Q15 5 25 5 Q35 5 35 15 V25" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="25" cy="40" r="4" fill="currentColor" />
      </svg>
      
      {/* Stars - larger on lg */}
      <div className="absolute top-1/3 left-1/4 lg:left-1/5 text-[#b90e0a]/20 animate-pulse-slow">
        <Sparkles className="w-5 h-5 lg:w-8 lg:h-8" />
      </div>
      <div className="absolute bottom-1/4 right-1/3 lg:right-1/4 text-[#b90e0a]/15 animate-pulse-medium">
        <Sparkles className="w-4 h-4 lg:w-7 lg:h-7" />
      </div>
      
      {/* Extra for lg */}
      <div className="hidden lg:block absolute top-1/4 right-1/6 text-[#b90e0a]/15 animate-pulse-slow">
        <Sparkles className="w-6 h-6" />
      </div>
      
      {/* Dotted arc - larger on lg */}
      <svg className="absolute top-40 left-6 lg:top-48 lg:left-16 w-16 h-16 lg:w-32 lg:h-32 text-[#b90e0a]/15 animate-float-slow" viewBox="0 0 100 100">
        <path d="M10 80 Q 50 10 90 80" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="5 5" />
      </svg>
      
      {/* Email icon shape - larger on lg */}
      <svg className="absolute bottom-32 left-8 lg:bottom-40 lg:left-20 w-10 h-8 lg:w-20 lg:h-16 text-[#b90e0a]/15 animate-float-fast" viewBox="0 0 60 40">
        <rect x="2" y="2" width="56" height="36" rx="3" fill="none" stroke="currentColor" strokeWidth="2" />
        <polyline points="2,2 30,22 58,2" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
      
      {/* Shield shape - larger on lg */}
      <svg className="absolute top-28 left-14 lg:top-36 lg:left-32 w-8 h-10 lg:w-16 lg:h-20 text-[#b90e0a]/10 animate-float-medium" viewBox="0 0 40 50">
        <path d="M20 5 L35 12 L35 28 Q35 42 20 48 Q5 42 5 28 L5 12 Z" fill="none" stroke="currentColor" strokeWidth="2" />
        <polyline points="13 26 18 31 28 21" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
      
      {/* Extra shapes for lg */}
      <div className="hidden lg:block absolute bottom-1/3 left-16 w-14 h-14 border-2 border-[#b90e0a]/10 rounded-lg rotate-45 animate-float-medium" />
      <svg className="hidden lg:block absolute top-1/2 left-1/4 w-16 h-16 text-[#b90e0a]/10 animate-float-slow" viewBox="0 0 50 50">
        <polygon points="25,5 45,45 5,45" fill="none" stroke="currentColor" strokeWidth="2" />
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
        .animate-float-slow { animation: float-slow 6s ease-in-out infinite; }
        .animate-float-medium { animation: float-medium 4s ease-in-out infinite; }
        .animate-float-fast { animation: float-fast 3s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        .animate-pulse-medium { animation: pulse-medium 3s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

// Step indicator component
const StepIndicator = ({ currentStep }: { currentStep: Step }) => {
  const steps = ['email', 'verify', 'reset', 'success'];
  const currentIndex = steps.indexOf(currentStep);
  
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {steps.slice(0, -1).map((step, index) => (
        <div key={step} className="flex items-center">
          <div 
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ${
              index < currentIndex 
                ? 'bg-green-500 text-white' 
                : index === currentIndex 
                  ? 'bg-[#b90e0a] text-white shadow-lg shadow-[#b90e0a]/30' 
                  : 'bg-gray-100 text-gray-400'
            }`}
          >
            {index < currentIndex ? '✓' : index + 1}
          </div>
          {index < steps.length - 2 && (
            <div 
              className={`w-12 h-0.5 mx-1.5 transition-all duration-500 ${
                index < currentIndex ? 'bg-green-500' : 'bg-gray-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default function ForgotPasswordPage({ onNavigateToLogin }: ForgotPasswordPageProps) {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send code');
      }

      toast({
        title: 'Code Sent!',
        description: 'Check your email for the verification code'
      });

      setStep('verify');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send code'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-reset-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid code');
      }

      toast({
        title: 'Code Verified!',
        description: 'Now create your new password'
      });

      setStep('reset');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Invalid or expired code'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Passwords do not match'
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Password must be at least 6 characters'
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }

      toast({
        title: 'Success!',
        description: 'Your password has been reset'
      });

      setStep('success');

      setTimeout(() => {
        onNavigateToLogin();
      }, 2000);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to reset password'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStepIcon = () => {
    switch (step) {
      case 'email': return <Mail className="w-7 h-7 text-white" />;
      case 'verify': return <Key className="w-7 h-7 text-white" />;
      case 'reset': return <KeyRound className="w-7 h-7 text-white" />;
      case 'success': return <CheckCircle2 className="w-7 h-7 text-white" />;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 'email': return 'Forgot Password';
      case 'verify': return 'Verify Code';
      case 'reset': return 'Reset Password';
      case 'success': return 'All Set!';
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 'email': return "Enter your email to receive a code";
      case 'verify': return "Enter the 6-digit code from your email";
      case 'reset': return "Create a new password";
      case 'success': return "Password reset successfully";
    }
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

        {/* Card */}
        <div className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-6 lg:p-8 shadow-[0_8px_40px_rgba(0,0,0,0.08)] hover:shadow-[0_16px_60px_rgba(185,14,10,0.1)] transition-all duration-500">
          {/* Step Indicator */}
          <StepIndicator currentStep={step} />

          {/* Header */}
          <div className="text-center mb-6">
            <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl mb-4 shadow-lg transition-all duration-500 ${
              step === 'success' 
                ? 'bg-gradient-to-br from-green-500 to-green-600 shadow-green-500/20' 
                : 'bg-gradient-to-br from-[#b90e0a] to-[#ff3333] shadow-[#b90e0a]/20'
            }`}>
              {getStepIcon()}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">
              {getStepTitle()}
            </h1>
            <p className="text-gray-500">
              {getStepDescription()}
            </p>
          </div>

          {/* Step 1: Email */}
          {step === 'email' && (
            <form onSubmit={handleSendCode} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
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
                    Sending...
                  </span>
                ) : 'Send Code'}
              </Button>
            </form>
          )}

          {/* Step 2: Verify Code */}
          {step === 'verify' && (
            <form onSubmit={handleVerifyCode} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Verification Code
                </label>
                <div className="relative group">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#b90e0a] transition-colors duration-300" size={20} />
                  <Input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="pl-12 h-12 bg-gray-50/50 border-gray-200 text-gray-900 placeholder:text-gray-400 rounded-xl text-center text-2xl tracking-[0.5em] font-mono focus:border-[#b90e0a] focus:ring-[#b90e0a]/20 focus:ring-4 transition-all duration-300"
                    maxLength={6}
                    required
                  />
                </div>
                <p className="text-sm text-gray-400 mt-3 text-center">
                  Code sent to <span className="font-medium text-gray-600">{email}</span>
                </p>
              </div>

              <Button
                type="submit"
                disabled={loading || code.length !== 6}
                className="w-full h-12 bg-gradient-to-r from-[#b90e0a] to-[#d91410] hover:from-[#a00d09] hover:to-[#b90e0a] text-white font-bold rounded-xl shadow-lg shadow-[#b90e0a]/25 hover:shadow-xl hover:shadow-[#b90e0a]/30 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Verifying...
                  </span>
                ) : 'Verify Code'}
              </Button>

              <button
                type="button"
                onClick={() => setStep('email')}
                className="w-full text-gray-500 hover:text-[#b90e0a] text-sm font-medium transition-colors duration-300"
              >
                Didn't receive code? Try again
              </button>
            </form>
          )}

          {/* Step 3: Reset Password */}
          {step === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#b90e0a] transition-colors duration-300" size={20} />
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="pl-12 h-12 bg-gray-50/50 border-gray-200 text-gray-900 placeholder:text-gray-400 rounded-xl focus:border-[#b90e0a] focus:ring-[#b90e0a]/20 focus:ring-4 transition-all duration-300"
                    minLength={6}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#b90e0a] transition-colors duration-300" size={20} />
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="pl-12 h-12 bg-gray-50/50 border-gray-200 text-gray-900 placeholder:text-gray-400 rounded-xl focus:border-[#b90e0a] focus:ring-[#b90e0a]/20 focus:ring-4 transition-all duration-300"
                    minLength={6}
                    required
                  />
                </div>
                {confirmPassword && (
                  <p className={`mt-2 text-sm flex items-center gap-2 ${newPassword === confirmPassword ? 'text-green-600' : 'text-red-500'}`}>
                    {newPassword === confirmPassword ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="font-medium">Passwords match</span>
                      </>
                    ) : (
                      <>
                        <span>✗</span>
                        <span>Passwords do not match</span>
                      </>
                    )}
                  </p>
                )}
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
                    Resetting...
                  </span>
                ) : 'Reset Password'}
              </Button>
            </form>
          )}

          {/* Step 4: Success */}
          {step === 'success' && (
            <div className="text-center space-y-5">
              <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-50 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-green-500/10">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <div className="space-y-2">
                <p className="text-gray-700 font-medium">
                  Password reset successfully!
                </p>
                <p className="text-gray-500 text-sm">
                  Redirecting to login...
                </p>
              </div>
              <div className="flex items-center justify-center gap-1.5">
                <div className="w-2 h-2 bg-[#b90e0a] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-[#b90e0a] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-[#b90e0a] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          {/* Back to login link */}
          {step !== 'success' && (
            <p className="text-center text-gray-500 mt-6">
              Remember your password?{' '}
              <button
                onClick={onNavigateToLogin}
                className="text-[#b90e0a] hover:text-[#8a0b08] font-bold transition-colors duration-300"
              >
                Back to Login
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
