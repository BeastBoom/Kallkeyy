import { useEffect, useState } from "react";
import { ArrowLeft, Mail, Lock, User, UserPlus, Eye, EyeOff, Sparkles, Check, X } from "lucide-react";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../ui/use-toast";

interface SignupPageProps {
  onNavigateToHome: () => void;
  onNavigateToLogin: () => void;
  onNavigateToPrivacyPolicy?: () => void;
  onNavigateToTermsOfService?: () => void;
}

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const passwordRequirements: PasswordRequirement[] = [
  { label: "8+ characters", test: (p) => p.length >= 8 },
  { label: "Uppercase", test: (p) => /[A-Z]/.test(p) },
  { label: "Lowercase", test: (p) => /[a-z]/.test(p) },
  { label: "Number", test: (p) => /\d/.test(p) },
  { label: "Special char", test: (p) => /[!_@#$%^&*(),.?":{}|<>]/.test(p) },
];

// Animated doodle shapes component - Larger on laptops
const DoodleBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Floating circles - larger and more spread on lg screens */}
      <div className="absolute top-16 right-8 lg:top-20 lg:right-24 w-14 h-14 lg:w-28 lg:h-28 border-2 border-[#b90e0a]/15 rounded-full animate-float-slow" />
      <div className="absolute top-36 left-10 lg:top-40 lg:left-24 w-8 h-8 lg:w-16 lg:h-16 bg-[#b90e0a]/10 rounded-full animate-float-medium" />
      <div className="absolute bottom-20 right-16 lg:bottom-28 lg:right-36 w-10 h-10 lg:w-20 lg:h-20 border-2 border-dashed border-[#b90e0a]/20 rounded-full animate-float-fast" />
      <div className="hidden lg:block absolute top-1/3 right-16 w-12 h-12 border-2 border-[#b90e0a]/10 rounded-full animate-float-slow" />
      
      {/* Animated wave - larger on lg */}
      <svg className="absolute top-28 left-6 lg:top-32 lg:left-20 w-20 h-12 lg:w-40 lg:h-20 text-[#b90e0a]/15 animate-float-slow" viewBox="0 0 100 40">
        <path d="M0 20 Q 25 5 50 20 Q 75 35 100 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      
      {/* Spiral - larger on lg */}
      <svg className="absolute bottom-28 left-8 lg:bottom-36 lg:left-20 w-14 h-14 lg:w-28 lg:h-28 text-[#b90e0a]/15 animate-spin-slow" viewBox="0 0 100 100">
        <path d="M50 50 m-30 0 a30 30 0 1 1 60 0 a25 25 0 1 1 -50 0 a20 20 0 1 1 40 0 a15 15 0 1 1 -30 0" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
      
      {/* Stars - larger on lg */}
      <div className="absolute top-1/4 right-1/4 lg:right-1/5 text-[#b90e0a]/20 animate-pulse-slow">
        <Sparkles className="w-5 h-5 lg:w-9 lg:h-9" />
      </div>
      <div className="absolute bottom-1/4 left-1/3 lg:left-1/4 text-[#b90e0a]/15 animate-pulse-medium">
        <Sparkles className="w-4 h-4 lg:w-7 lg:h-7" />
      </div>
      
      {/* Extra elements for lg */}
      <div className="hidden lg:block absolute top-1/2 left-16 text-[#b90e0a]/15 animate-pulse-slow">
        <Sparkles className="w-6 h-6" />
      </div>
      
      {/* Dotted grid - larger on lg */}
      <div className="absolute top-48 right-12 lg:top-56 lg:right-28 grid grid-cols-4 gap-1 lg:gap-2.5 animate-float-medium">
        {[...Array(16)].map((_, i) => (
          <div key={i} className="w-1 h-1 lg:w-2 lg:h-2 bg-[#b90e0a]/15 rounded-full" />
        ))}
      </div>
      
      {/* Plus signs - larger on lg */}
      <div className="absolute bottom-32 right-10 lg:bottom-40 lg:right-24 text-[#b90e0a]/15 text-xl lg:text-4xl font-light animate-float-fast">+</div>
      <div className="absolute top-32 left-14 lg:top-40 lg:left-28 text-[#b90e0a]/10 text-2xl lg:text-5xl font-light animate-float-slow">+</div>
      
      {/* Diamond - larger on lg */}
      <svg className="absolute top-1/3 left-6 lg:left-16 w-6 h-6 lg:w-14 lg:h-14 text-[#b90e0a]/15 animate-float-medium" viewBox="0 0 50 50">
        <rect x="10" y="10" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2" transform="rotate(45 25 25)" />
      </svg>
      
      {/* Hexagon - larger on lg */}
      <svg className="absolute bottom-16 left-1/4 lg:bottom-24 lg:left-1/3 w-10 h-10 lg:w-20 lg:h-20 text-[#b90e0a]/10 animate-float-slow" viewBox="0 0 100 100">
        <polygon points="50,5 90,25 90,75 50,95 10,75 10,25" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
      
      {/* Extra shapes for lg */}
      <div className="hidden lg:block absolute bottom-1/3 right-20 w-16 h-16 border-2 border-[#b90e0a]/10 rounded-lg rotate-12 animate-float-medium" />

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
        .animate-float-slow { animation: float-slow 6s ease-in-out infinite; }
        .animate-float-medium { animation: float-medium 4s ease-in-out infinite; }
        .animate-float-fast { animation: float-fast 3s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        .animate-pulse-medium { animation: pulse-medium 3s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 25s linear infinite; }
      `}</style>
    </div>
  );
};

export default function SignupPage({
  onNavigateToHome,
  onNavigateToLogin,
  onNavigateToPrivacyPolicy,
  onNavigateToTermsOfService,
}: SignupPageProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register, googleLogin } = useAuth();
  const { toast } = useToast();

  const windowWidth = useWindowWidth();
  const googleButtonWidth = Math.min(windowWidth - 64, 300);

  const validatePasswordStrength = (pass: string): boolean => {
    return passwordRequirements.every((req) => req.test(pass));
  };

  function useWindowWidth() {
    const [width, setWidth] = useState(window.innerWidth);

    useEffect(() => {
      const handleResize = () => setWidth(window.innerWidth);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

    return width;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Passwords do not match",
      });
      return;
    }

    if (!validatePasswordStrength(password)) {
      toast({
        variant: "destructive",
        title: "Weak Password",
        description: "Please meet all password requirements",
      });
      return;
    }

    setLoading(true);

    try {
      await register(name, email, password);
      toast({
        title: "Welcome!",
        description: "Account created successfully",
      });
      onNavigateToHome();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Signup Failed",
        description:
          error instanceof Error ? error.message : "Failed to create account",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (
    credentialResponse: CredentialResponse
  ) => {
    try {
      if (!credentialResponse.credential) {
        throw new Error("No credential received");
      }

      await googleLogin(credentialResponse.credential);

      toast({
        title: "Welcome!",
        description: "Google signup successful",
      });

      onNavigateToHome();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Google Signup Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to signup with Google",
      });
    }
  };

  const handleGoogleError = () => {
    toast({
      variant: "destructive",
      title: "Google Signup Failed",
      description: "Something went wrong. Please try again.",
    });
  };

  const passedRequirements = passwordRequirements.filter(req => req.test(password)).length;
  const strengthPercentage = (passedRequirements / passwordRequirements.length) * 100;

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center px-4 relative">
      <DoodleBackground />
      
      <div className="w-full max-w-sm relative z-10">
        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-[#b90e0a] transition-all duration-300 mb-3 group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform duration-300" />
          <span className="font-medium text-sm">Back</span>
        </button>

        {/* Signup Card */}
        <div className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-5 lg:p-6 shadow-[0_8px_40px_rgba(0,0,0,0.08)] hover:shadow-[0_16px_60px_rgba(185,14,10,0.1)] transition-all duration-500">
          {/* Header */}
          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-[#b90e0a] to-[#ff3333] rounded-xl mb-2.5 shadow-lg shadow-[#b90e0a]/20">
              <UserPlus className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1 tracking-tight">
              Create Account
            </h1>
            <p className="text-gray-500 text-sm">Join KALLKEYY today</p>
          </div>

          {/* Google Signup */}
          <div className="w-full flex justify-center mb-4">
            <div style={{ width: googleButtonWidth }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="outline"
                size="large"
                text="signup_with"
                width={googleButtonWidth}
                shape="pill"
              />
            </div>
          </div>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-gray-400 font-medium">
                Or sign up with email
              </span>
            </div>
          </div>

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Full Name
              </label>
              <div className="relative group">
                <User
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#b90e0a] transition-colors duration-300"
                  size={18}
                />
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => {
                    const value = e.target.value;
                    const sanitized = value.replace(/[^A-Za-z\s.]/g, "");
                    setName(sanitized);
                  }}
                  onKeyPress={(e) => {
                    if (!/[A-Za-z\s.]/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  className="pl-11 h-11 bg-gray-50/50 border-gray-200 text-gray-900 placeholder:text-gray-400 rounded-xl focus:border-[#b90e0a] focus:ring-[#b90e0a]/20 focus:ring-2 transition-all duration-300"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email
              </label>
              <div className="relative group">
                <Mail
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#b90e0a] transition-colors duration-300"
                  size={18}
                />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="pl-11 h-11 bg-gray-50/50 border-gray-200 text-gray-900 placeholder:text-gray-400 rounded-xl focus:border-[#b90e0a] focus:ring-[#b90e0a]/20 focus:ring-2 transition-all duration-300"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative group">
                <Lock
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#b90e0a] transition-colors duration-300"
                  size={18}
                />
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-11 pr-11 h-11 bg-gray-50/50 border-gray-200 text-gray-900 placeholder:text-gray-400 rounded-xl focus:border-[#b90e0a] focus:ring-[#b90e0a]/20 focus:ring-2 transition-all duration-300"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#b90e0a] transition-colors duration-300"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Password Strength */}
              {password && (
                <div className="mt-2.5 space-y-2">
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full transition-all duration-500 ease-out rounded-full"
                      style={{ 
                        width: `${strengthPercentage}%`,
                        backgroundColor: strengthPercentage < 40 ? '#ef4444' : strengthPercentage < 80 ? '#f59e0b' : '#22c55e'
                      }}
                    />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {passwordRequirements.map((req, index) => (
                      <span
                        key={index}
                        className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full transition-colors duration-300 ${
                          req.test(password)
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {req.test(password) ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        {req.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Confirm Password
              </label>
              <div className="relative group">
                <Lock
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#b90e0a] transition-colors duration-300"
                  size={18}
                />
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-11 pr-11 h-11 bg-gray-50/50 border-gray-200 text-gray-900 placeholder:text-gray-400 rounded-xl focus:border-[#b90e0a] focus:ring-[#b90e0a]/20 focus:ring-2 transition-all duration-300"
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#b90e0a] transition-colors duration-300"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {confirmPassword && (
                <div className={`mt-1.5 flex items-center gap-1.5 text-xs ${password === confirmPassword ? 'text-green-600' : 'text-red-500'}`}>
                  {password === confirmPassword ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                  <span>{password === confirmPassword ? 'Passwords match' : 'Passwords do not match'}</span>
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-gradient-to-r from-[#b90e0a] to-[#d91410] hover:from-[#a00d09] hover:to-[#b90e0a] text-white font-bold rounded-xl shadow-lg shadow-[#b90e0a]/25 hover:shadow-xl hover:shadow-[#b90e0a]/30 transition-all duration-300 hover:-translate-y-0.5 mt-3"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating...
                </span>
              ) : "Sign Up"}
            </Button>
          </form>

          {/* Login Link */}
          <p className="text-center text-gray-500 mt-4 text-sm">
            Already have an account?{" "}
            <button
              onClick={onNavigateToLogin}
              className="text-[#b90e0a] hover:text-[#8a0b08] font-bold transition-colors duration-300"
            >
              Login
            </button>
          </p>

          {/* Privacy Policy and Terms */}
          <p className="text-center text-gray-400 text-xs mt-3 leading-relaxed">
            By signing up, you agree to our{" "}
            {onNavigateToTermsOfService ? (
              <button onClick={onNavigateToTermsOfService} className="text-[#b90e0a] hover:text-[#8a0b08] underline underline-offset-2">
                Terms
              </button>
            ) : (
              <a href="/terms-of-service" className="text-[#b90e0a] hover:text-[#8a0b08] underline underline-offset-2">
                Terms
              </a>
            )}{" "}
            and{" "}
            {onNavigateToPrivacyPolicy ? (
              <button onClick={onNavigateToPrivacyPolicy} className="text-[#b90e0a] hover:text-[#8a0b08] underline underline-offset-2">
                Privacy Policy
              </button>
            ) : (
              <a href="/privacy-policy" className="text-[#b90e0a] hover:text-[#8a0b08] underline underline-offset-2">
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
