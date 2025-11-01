"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Package, Truck, Sparkles } from "lucide-react";

const OrderConfirmationPage = () => {
  // Get orderId from URL query parameters
  const getOrderIdFromURL = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get("orderId") || params.get("id");
  };

  const [orderId, setOrderId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(5);
  const [showContent, setShowContent] = useState(false);
  const [showCheckmark, setShowCheckmark] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);

  useEffect(() => {
    // Get orderId from URL
    const id = getOrderIdFromURL();
    setOrderId(id);
    
    // Animate content entrance
    setTimeout(() => setShowContent(true), 100);
    setTimeout(() => setShowCheckmark(true), 300);
    setTimeout(() => setShowSparkles(true), 500);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#0a0a0a] to-[#1a0a0a] flex items-center justify-center relative overflow-hidden py-8 px-4">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-[#b90e0a] opacity-20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 md:w-96 md:h-96 bg-[#b90e0a] opacity-10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Sparkles Animation - Reduced on mobile */}
      {showSparkles && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <Sparkles
              key={i}
              className="absolute text-[#b90e0a] animate-ping sparkle-icon"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
                opacity: 0.2,
              }}
            />
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
            <div className="absolute inset-0 bg-[#b90e0a] rounded-full blur-2xl opacity-50 animate-ping" />
            <div className="absolute inset-0 bg-[#b90e0a] rounded-full blur-xl opacity-30 animate-pulse" />
            <div className="relative bg-gradient-to-br from-[#b90e0a] via-[#d90f0c] to-[#8a0a08] rounded-full p-4 md:p-8 shadow-2xl transform transition-transform hover:scale-105">
              <CheckCircle2 className="w-16 h-16 md:w-28 md:h-28 text-white animate-scale-in drop-shadow-lg" strokeWidth={3} />
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
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 md:mb-4 animate-fade-in bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent px-2">
            Order Confirmed! 🎉
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 mb-6 md:mb-8 animate-fade-in-delay leading-relaxed px-2">
            Your payment was successful and your order has been placed
          </p>

          {/* Order Info Card */}
          {orderId && (
            <div className="bg-gradient-to-br from-[#1a1a1a] via-[#151515] to-[#0a0a0a] border border-[#b90e0a]/30 rounded-xl md:rounded-2xl p-4 md:p-6 lg:p-8 mb-6 md:mb-8 shadow-2xl backdrop-blur-sm relative overflow-hidden mx-2 md:mx-0">
              <div className="absolute inset-0 bg-gradient-to-r from-[#b90e0a]/5 via-transparent to-[#b90e0a]/5" />
              <div className="relative">
                <div className="flex items-center justify-center gap-2 md:gap-3 text-gray-300 mb-2 md:mb-3">
                  <Package className="w-5 h-5 md:w-6 md:h-6 text-[#b90e0a] animate-pulse" />
                  <span className="text-xs md:text-sm uppercase tracking-wider font-semibold">Order ID</span>
                </div>
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-mono font-bold text-white tracking-wider bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent break-all px-2">
                  {orderId}
                </p>
              </div>
            </div>
          )}

          {/* Status Steps */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 mb-6 md:mb-8 px-2">
            {/* Payment Step */}
            <div className="flex flex-col items-center gap-2 md:gap-3 transform transition-all hover:scale-105 md:hover:scale-110">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-[#b90e0a] to-[#8a0a08] flex items-center justify-center shadow-lg shadow-[#b90e0a]/50 animate-bounce-delay">
                <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <span className="text-xs md:text-sm text-gray-300 font-medium">Payment</span>
              <span className="text-xs text-[#b90e0a] font-semibold">✓ Complete</span>
            </div>
            
            {/* Connector Line - Hidden on mobile, shown on tablet+ */}
            <div className="hidden md:block w-8 lg:w-12 h-1 bg-gradient-to-r from-[#b90e0a] via-[#b90e0a] to-[#4a4a4a] animate-expand relative">
              <div className="absolute inset-0 bg-[#b90e0a] animate-pulse" style={{ width: '100%' }} />
            </div>
            
            {/* Processing Step */}
            <div className="flex flex-col items-center gap-2 md:gap-3 transform transition-all hover:scale-105 md:hover:scale-110">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-[#2a2a2a] flex items-center justify-center border-2 border-[#b90e0a] shadow-lg shadow-[#b90e0a]/30 relative">
                <Package className="w-6 h-6 md:w-8 md:h-8 text-[#b90e0a] animate-pulse-slow" />
                <div className="absolute inset-0 rounded-full border-2 border-[#b90e0a] animate-ping opacity-20" />
              </div>
              <span className="text-xs md:text-sm text-gray-300 font-medium">Processing</span>
              <span className="text-xs text-[#b90e0a] font-semibold animate-pulse">In Progress</span>
            </div>
            
            {/* Connector Line */}
            <div className="hidden md:block w-8 lg:w-12 h-1 bg-[#4a4a4a]" />
            
            {/* Shipping Step */}
            <div className="flex flex-col items-center gap-2 md:gap-3">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-[#2a2a2a] flex items-center justify-center border-2 border-[#4a4a4a]">
                <Truck className="w-6 h-6 md:w-8 md:h-8 text-gray-600" />
              </div>
              <span className="text-xs md:text-sm text-gray-400 font-medium">Shipping</span>
              <span className="text-xs text-gray-500">Pending</span>
            </div>
          </div>

          {/* Message */}
          <div className="bg-gradient-to-br from-[#1a1a1a]/80 to-[#0a0a0a]/80 backdrop-blur-sm border border-[#b90e0a]/20 rounded-xl md:rounded-2xl p-5 md:p-6 lg:p-8 mb-6 md:mb-8 shadow-xl relative overflow-hidden mx-2 md:mx-0">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#b90e0a] via-[#d90f0c] to-[#b90e0a] animate-shimmer" />
            <p className="text-gray-200 leading-relaxed text-sm sm:text-base md:text-lg relative z-10">
              🎊 <strong className="text-white">Thank you for your purchase!</strong> 🎊
              <br className="hidden sm:block" />
              <span className="sm:hidden"> </span>
              <br className="hidden sm:block" />
              <br />
              You will receive a confirmation email shortly with all the details.
              <br className="hidden sm:block" />
              <span className="sm:hidden"> </span>
              Our team will start processing your order right away!
            </p>
          </div>

          {/* Auto-redirect Countdown */}
          <div className="text-gray-400 text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2">
            <span>Redirecting to orders page in</span>
            <span className="text-[#b90e0a] font-bold text-lg sm:text-xl bg-[#1a1a1a] px-2 sm:px-3 py-1 rounded-lg border border-[#b90e0a]/30 animate-pulse">
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
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes expand {
          0% {
            width: 0;
          }
          100% {
            width: 2rem;
          }
        }

        @media (min-width: 1024px) {
          @keyframes expand {
            0% {
              width: 0;
            }
            100% {
              width: 3rem;
            }
          }
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

        .animate-expand {
          animation: expand 1s ease-out 0.5s both;
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.6;
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -100% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }

        .animate-shimmer {
          background-size: 200% 100%;
          animation: shimmer 2s linear infinite;
        }

        .delay-1000 {
          animation-delay: 1s;
        }

        .sparkle-icon {
          width: 12px;
          height: 12px;
        }

        @media (min-width: 768px) {
          .sparkle-icon {
            width: 16px;
            height: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default OrderConfirmationPage;

