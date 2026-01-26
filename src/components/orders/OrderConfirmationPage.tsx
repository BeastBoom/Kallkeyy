"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Package, Truck, PartyPopper, Heart, Star, Gift } from "lucide-react";

const OrderConfirmationPage = () => {
  // Get orderId from URL query parameters
  const getOrderIdFromURL = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get("orderId") || params.get("id");
  };

  const [orderId, setOrderId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(10);
  const [showContent, setShowContent] = useState(false);
  const [showCheckmark, setShowCheckmark] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Get orderId from URL
    const id = getOrderIdFromURL();
    setOrderId(id);
    
    // Animate content entrance
    setTimeout(() => setShowContent(true), 100);
    setTimeout(() => setShowCheckmark(true), 300);
    setTimeout(() => setShowConfetti(true), 500);
  }, []);

  // Listen for URL changes (in case navigation happens without full reload)
  useEffect(() => {
    const handleLocationChange = () => {
      const id = getOrderIdFromURL();
      if (id !== orderId) {
        setOrderId(id);
      }
    };

    // Check immediately
    handleLocationChange();

    // Also listen for popstate (though unlikely for this page)
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, [orderId]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      // Redirect to orders page using navigation (not window.location to avoid full reload)
      // We'll use window.location for now since we need to go to a different route
      window.location.href = "/orders";
    }
  }, [countdown]);

  // Generate confetti particles
  const confettiColors = ['#b90e0a', '#ff6b6b', '#feca57', '#1dd1a1', '#54a0ff', '#ff9ff3', '#5f27cd'];
  const confettiParticles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    color: confettiColors[i % confettiColors.length],
    left: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 2 + Math.random() * 3,
    size: 6 + Math.random() * 8,
    type: Math.random() > 0.5 ? 'circle' : 'square',
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white flex items-center justify-center relative overflow-hidden py-8 px-4">

      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {confettiParticles.map((particle) => (
            <div
              key={particle.id}
              className="absolute animate-confetti"
              style={{
                left: `${particle.left}%`,
                top: '-20px',
                animationDelay: `${particle.delay}s`,
                animationDuration: `${particle.duration}s`,
              }}
            >
              <div
                className={particle.type === 'circle' ? 'rounded-full' : 'rounded-sm'}
                style={{
                  width: particle.size,
                  height: particle.size,
                  backgroundColor: particle.color,
                }}
              />
            </div>
          ))}
        </div>
      )}


      <div className="relative z-10 w-full max-w-2xl mx-auto text-center">
        {/* Success Checkmark */}
        <div
          className={`mb-6 md:mb-8 transition-all duration-700 ${
            showCheckmark
              ? "scale-100 opacity-100 rotate-0"
              : "scale-0 opacity-0 rotate-180"
          }`}
        >
          <div className="relative inline-block">
            {/* Pulsing ring */}
            <div className="absolute inset-0 bg-emerald-400 rounded-full blur-2xl opacity-30 animate-ping" style={{ animationDuration: '2s' }} />
            <div className="absolute inset-0 bg-emerald-400 rounded-full blur-xl opacity-20 animate-pulse" />
            
            {/* Main checkmark circle */}
            <div className="relative bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 rounded-full p-5 md:p-8 shadow-2xl shadow-emerald-500/30 transform transition-transform hover:scale-105">
              <CheckCircle2 className="w-14 h-14 md:w-24 md:h-24 text-white animate-scale-in drop-shadow-lg" strokeWidth={2.5} />
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center shadow-lg animate-bounce-slow">
              <PartyPopper className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div
          className={`transition-all duration-700 ${
            showContent
              ? "translate-y-0 opacity-100"
              : "translate-y-10 opacity-0"
          }`}
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-3 md:mb-4 animate-fade-in px-2">
            Order Confirmed! 🎉
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 md:mb-8 animate-fade-in-delay leading-relaxed px-2">
            Your payment was successful and your order has been placed
          </p>

          {/* Order Info Card */}
          {orderId && (
            <div className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-5 md:p-6 lg:p-8 mb-6 md:mb-8 shadow-xl relative overflow-hidden mx-2 md:mx-0">
              {/* Gradient accent */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#b90e0a] via-emerald-500 to-[#b90e0a]" />
              
              <div className="relative">
                <div className="flex items-center justify-center gap-2 md:gap-3 text-gray-500 mb-2 md:mb-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-[#b90e0a]/10 rounded-lg flex items-center justify-center">
                    <Package className="w-4 h-4 md:w-5 md:h-5 text-[#b90e0a]" />
                  </div>
                  <span className="text-xs md:text-sm uppercase tracking-wider font-bold text-gray-600">Order ID</span>
                </div>
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-mono font-black text-gray-900 tracking-wider break-all px-2">
                  {orderId}
                </p>
              </div>
            </div>
          )}

          {/* Status Steps */}
          <div className="flex items-center justify-center gap-4 md:gap-6 mb-6 md:mb-8 px-2">
            {/* Payment Step */}
            <div className="flex flex-col items-center gap-2 md:gap-3">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-400/30">
                <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <span className="text-xs md:text-sm text-gray-700 font-semibold">Payment</span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">✓ Complete</span>
            </div>
            
            {/* Processing Step */}
            <div className="flex flex-col items-center gap-2 md:gap-3">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-lg shadow-amber-400/30">
                <Gift className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <span className="text-xs md:text-sm text-gray-700 font-semibold">Processing</span>
              <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">In Progress</span>
            </div>
          </div>

          {/* Message Card */}
          <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-4 md:p-6 mb-6 md:mb-8 shadow-lg relative overflow-hidden mx-2 md:mx-0">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#b90e0a] via-amber-400 to-emerald-400 animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
            <p className="text-gray-700 leading-relaxed text-sm md:text-base relative z-10">
              <span className="text-lg md:text-xl">🎊</span>{" "}
              <strong className="text-gray-900">Thank you!</strong>{" "}
              <span className="text-lg md:text-xl">🎊</span>
              <br />
              <span className="text-gray-600 text-xs md:text-sm">
                Confirmation email coming soon. Order processing started!
              </span>
            </p>
          </div>

          {/* Auto-redirect Countdown */}
          <div className="text-gray-500 text-sm flex flex-col sm:flex-row items-center justify-center gap-2 px-2">
            <span>Redirecting to orders page in</span>
            <span className="text-[#b90e0a] font-black text-2xl bg-white px-4 py-2 rounded-xl border-2 border-[#b90e0a]/20 shadow-lg shadow-[#b90e0a]/10 min-w-[48px] inline-block">
              {countdown}
            </span>
            <span>{countdown === 1 ? "second" : "seconds"}</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scale-in {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes fade-in {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce-delay {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-5px) scale(1.1); }
        }

        @keyframes confetti {
          0% {
            transform: translateY(-20px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(0.95); }
        }

        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        .animate-scale-in {
          animation: scale-in 0.6s ease-out;
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }

        .animate-fade-in-delay {
          animation: fade-in 0.8s ease-out 0.2s both;
        }

        .animate-bounce-delay {
          animation: bounce-delay 2s ease-in-out infinite;
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }

        .animate-confetti {
          animation: confetti linear forwards;
        }

        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }

        .animate-shimmer {
          animation: shimmer 3s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default OrderConfirmationPage;
