import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

interface Props {
  onAccessGranted: () => void;
}

export default function EarlyAccessPage({ onAccessGranted }: Props) {
  const [form, setForm] = useState({ name: "", email: "" });
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);

  const request = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.name && form.email) {
      setSent(true);
      toast({
        title: "Access code sent",
        description: "Use: KALLKEYY2025",
      });
    }
  };

  const verify = (e: React.FormEvent) => {
    e.preventDefault();
    if (code === "KALLKEYY2025") {
      toast({ title: "Access approved", description: "Welcome to KALLKEYY" });
      setTimeout(onAccessGranted, 800);
    } else {
      toast({
        title: "Invalid code",
        description: "Please check and try again",
        variant: "destructive",
      });
    }
  };

  const handleCodeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCode(e.target.value.toUpperCase());
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated graffiti background */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        {/* Street art lines and shapes */}
        <svg className="absolute top-20 left-10 w-64 h-64 animate-pulse" viewBox="0 0 200 200">
          <path d="M10,50 Q50,10 90,50 T170,50" stroke="white" strokeWidth="3" fill="none" opacity="0.3" />
          <circle cx="40" cy="80" r="15" stroke="white" strokeWidth="2" fill="none" opacity="0.2" />
          <polygon points="120,60 140,40 160,60 140,80" stroke="white" strokeWidth="2" fill="none" opacity="0.2" />
        </svg>
        
        <svg className="absolute bottom-20 right-10 w-80 h-80 animate-bounce" style={{animationDuration: '4s'}} viewBox="0 0 300 300">
          <path d="M50,100 C70,50 130,50 150,100 C170,150 110,150 90,100Z" stroke="white" strokeWidth="2" fill="none" opacity="0.2" />
          <rect x="200" y="80" width="60" height="60" stroke="white" strokeWidth="2" fill="none" opacity="0.1" transform="rotate(45 230 110)" />
        </svg>

        {/* Floating geometric shapes */}
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${4 + Math.random() * 2}s`
            }}
          >
            {i % 3 === 0 && <div className="w-4 h-4 border border-white/20 rotate-45" />}
            {i % 3 === 1 && <div className="w-3 h-3 rounded-full bg-white/10" />}
            {i % 3 === 2 && <div className="w-6 h-1 bg-white/15" />}
          </div>
        ))}

        {/* Moving lines */}
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent animate-slide-right" />
        <div className="absolute bottom-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/15 to-transparent animate-slide-left" />
      </div>

      {/* Main content with enhanced animations */}
      <div className="max-w-md w-full space-y-8 text-center relative z-10 animate-fade-in-up">
        <div className="space-y-6">
          <div className="relative">
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-wider">
              KALLKEYY
            </h1>
            <div className="absolute inset-0 text-4xl md:text-6xl font-black text-orange-500/20 tracking-wider scale-110 animate-pulse">
              KALLKEYY
            </div>
          </div>
          
          <div className="w-20 h-1 bg-orange-500 mx-auto animate-expand" />
          
          <h2 className="text-2xl md:text-3xl font-bold text-white animate-slide-up" style={{animationDelay: '0.3s'}}>
            Exclusive Access
          </h2>
          
          <p className="text-gray-300 text-lg animate-slide-up" style={{animationDelay: '0.6s'}}>
            Request early access to the pre‑launch portal and be first to preorder the flagship drop.
          </p>
        </div>

        {!sent ? (
          <form onSubmit={request} className="space-y-6 animate-slide-up" style={{animationDelay: '0.9s'}}>
            <div className="space-y-4">
              <div className="relative">
                <Input
                  placeholder="Enter your name"
                  value={form.name}
                  onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                  className="bg-gray-900 border-gray-700 text-white placeholder-gray-400 h-12 text-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:shadow-lg focus:shadow-orange-500/10 transition-all duration-300 hover:border-gray-600"
                />
              </div>
              <div className="relative">
                <Input
                  placeholder="Enter your email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                  className="bg-gray-900 border-gray-700 text-white placeholder-gray-400 h-12 text-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:shadow-lg focus:shadow-orange-500/10 transition-all duration-300 hover:border-gray-600"
                />
              </div>
            </div>
            <Button 
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-black font-bold py-4 text-lg shadow-lg hover:shadow-xl hover:shadow-orange-500/20 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
            >
              Request Early Access
            </Button>
          </form>
        ) : (
          <form onSubmit={verify} className="space-y-6 animate-slide-up" style={{animationDelay: '0.3s'}}>
            <div className="space-y-4">
              <p className="text-gray-300 mb-4 animate-fade-in">Enter your access code</p>
              <div className="relative">
                <Input
                  placeholder="ACCESS CODE"
                  value={code}
                  onChange={handleCodeInput}
                  className="bg-gray-900 border-gray-700 text-white placeholder-gray-400 h-12 text-xl font-mono text-center tracking-widest focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:shadow-lg focus:shadow-orange-500/10 transition-all duration-300 uppercase hover:border-gray-600"
                  maxLength={12}
                  style={{ fontFamily: 'monospace' }}
                />
              </div>
            </div>
            <Button 
              type="submit"
              className="w-full bg-white text-black hover:bg-gray-200 font-bold py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
            >
              Unlock Access
            </Button>
          </form>
        )}

        <div className="mt-8 text-gray-400 text-sm animate-fade-in" style={{animationDelay: '1.2s'}}>
          <p className="animate-pulse">Limited spots available • Exclusive drop access</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }

        @keyframes slide-right {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        @keyframes slide-left {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }

        @keyframes glow-pulse {
          0%, 100% { text-shadow: 0 0 20px rgba(249, 115, 22, 0.5); }
          50% { text-shadow: 0 0 30px rgba(249, 115, 22, 0.8), 0 0 40px rgba(249, 115, 22, 0.3); }
        }

        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes slide-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes expand {
          0% { width: 0; }
          100% { width: 5rem; }
        }

        @keyframes typewriter {
          0%, 50% { border-color: transparent; }
          51%, 100% { border-color: rgb(249, 115, 22); }
        }

        .animate-float { animation: float 4s ease-in-out infinite; }
        .animate-slide-right { animation: slide-right 8s linear infinite; }
        .animate-slide-left { animation: slide-left 10s linear infinite; }
        .animate-glow-pulse { animation: glow-pulse 2s ease-in-out infinite; }
        .animate-fade-in-up { animation: fade-in-up 1s ease-out forwards; }
        .animate-slide-up { animation: slide-up 0.8s ease-out forwards; }
        .animate-expand { animation: expand 1s ease-out forwards; }
        .animate-typewriter { animation: typewriter 1s ease-in-out infinite; }
        .animate-fade-in { animation: fade-in-up 0.6s ease-out forwards; }
      `}</style>
    </div>
  );
}