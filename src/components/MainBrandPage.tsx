"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { InstagramEmbed } from "react-social-media-embed";
import { useAuth } from "../contexts/AuthContext";
import { Menu, X, LogOut } from "lucide-react";

interface Props {
  onViewProduct: () => void;
  onViewProductMenu: () => void;
  onViewHoodie: () => void;
  onViewTshirt: () => void;
  onViewHoodie2?: () => void;
  onViewTshirt2?: () => void;
  onNavigateToLogin: () => void;
  onNavigateToSignup: () => void;
  onNavigateToAbout?: () => void;
  onNavigateToContact?: () => void;
  onBackToMain?: () => void;
  onNavigateToShop?: () => void;
  onNavigateToOrders?: () => void;
  onNavigateToSizeGuide?: () => void;
  onNavigateToShipping?: () => void;
  onNavigateToReturns?: () => void;
  onNavigateToFAQ?: () => void;
  onNavigateToPrivacyPolicy?: () => void;
  onNavigateToTermsOfService?: () => void;
  skipAnimations?: boolean;
}

export default function MainBrandPage({
  onViewProduct,
  onViewProductMenu,
  onViewHoodie,
  onViewTshirt,
  onViewHoodie2,
  onViewTshirt2,
  onNavigateToLogin,
  onNavigateToSignup,
  onNavigateToAbout,
  onNavigateToContact,
  onBackToMain,
  onNavigateToOrders,
  onNavigateToSizeGuide,
  onNavigateToShipping,
  onNavigateToReturns,
  onNavigateToFAQ,
  onNavigateToPrivacyPolicy,
  onNavigateToTermsOfService,
  skipAnimations = false,
}: Props) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState({});
  const { user, logout } = useAuth();

  const onNavigateToShop = () => {
    onViewProductMenu();
  };

  const handleUnavailablePage = (pageName: string) => {
    toast({
      title: "Under Development",
      description: `The ${pageName} page is currently being developed. Check back soon!`,
      duration: 3000,
    });
  };

  // Helper function to format user display name
  const formatDisplayName = (fullName: string): string => {
    if (!fullName) return "";
    const nameParts = fullName.trim().split(/\s+/);
    const firstName = nameParts[0];
    if (firstName.length <= 10) {
      return firstName.toUpperCase();
    }
    const initials = nameParts
      .slice(0, 3)
      .map((part) => part[0])
      .join("")
      .toUpperCase();

    return initials;
  };

  useEffect(() => {
    // If animations should be skipped (e.g., browser back), show all content immediately
    if (skipAnimations) {
      const elements = document.querySelectorAll('[id^="animate-"]');
      const allVisible: Record<string, boolean> = {};
      elements.forEach((el) => {
        allVisible[el.id] = true;
      });
      setIsVisible(allVisible);
      return;
    }

    // Otherwise, use IntersectionObserver for scroll-based animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({
              ...prev,
              [entry.target.id]: true,
            }));
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('[id^="animate-"]');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [skipAnimations]);

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <div className="fixed inset-0 pointer-events-none opacity-20">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float-slow"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${8 + Math.random() * 4}s`,
            }}
          >
            <div className="w-8 h-8 border-2 border-white/10 transform rotate-45" />
          </div>
        ))}

        <div className="absolute top-1/4 w-full h-px bg-gradient-to-r from-transparent via-[#b90e0a]/30 to-transparent animate-slide-horizontal" />
        <div className="absolute bottom-1/3 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent animate-slide-horizontal-reverse" />

        <svg
          className="absolute top-10 left-10 w-32 h-32 animate-pulse"
          viewBox="0 0 100 100"
        >
          <polygon
            points="50,5 75,25 75,75 25,75 25,25"
            stroke="white"
            strokeWidth="1"
            fill="none"
            opacity="0.1"
          />
          <circle
            cx="50"
            cy="50"
            r="20"
            stroke="#b90e0a"
            strokeWidth="1"
            fill="none"
            opacity="0.2"
          />
        </svg>

        <svg
          className="absolute top-10 right-10 w-24 h-24 animate-spin-slow"
          viewBox="0 0 100 100"
        >
          <rect
            x="25"
            y="25"
            width="50"
            height="50"
            stroke="white"
            strokeWidth="1"
            fill="none"
            opacity="0.1"
            transform="rotate(45 50 50)"
          />
        </svg>

        <svg
          className="absolute bottom-10 left-10 w-40 h-40 animate-bounce-slow"
          viewBox="0 0 100 100"
        >
          <path
            d="M20,80 Q50,20 80,80"
            stroke="#b90e0a"
            strokeWidth="2"
            fill="none"
            opacity="0.2"
          />
        </svg>

        <svg
          className="absolute bottom-10 right-10 w-28 h-28 animate-pulse"
          viewBox="0 0 100 100"
        >
          <polygon
            points="50,10 90,90 10,90"
            stroke="white"
            strokeWidth="1"
            fill="none"
            opacity="0.1"
          />
        </svg>
      </div>

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/90 backdrop-blur-md">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-3 lg:py-4">
          <div className="flex items-center justify-between relative">
            {/* LEFT: Text Logo (Responsive sizing) */}
            <div className="flex-shrink-0 z-10">
              <h1
                className="text-xl sm:text-2xl lg:text-3xl font-black tracking-wider hover:text-[#b90e0a] transition-colors duration-300 cursor-pointer font-akira"
                onClick={onBackToMain}
              >
                KALLKEYY
              </h1>
            </div>

            {/* CENTER: Brand Logo Image (Hidden on mobile/tablet, visible on large desktop only to prevent overlap) */}
            <div className="hidden xl:block absolute left-1/2 transform -translate-x-1/2 z-10">
              <img
                src="/navbar-logo.png"
                alt="KALLKEYY Logo"
                onClick={onBackToMain}
                className="h-10 w-auto sm:h-12 lg:h-14 object-contain opacity-90 hover:opacity-100 transition-opacity cursor-pointer"
              />
            </div>

            {/* RIGHT: Navigation + Auth */}
            <div className="flex items-center z-10">
              {/* Desktop Navigation Links */}
              <div className="hidden lg:flex gap-2 text-sm lg:text-base font-bold">
                <button
                  onClick={() => onBackToMain()}
                  className="hover:text-[#b90e0a] transition-colors duration-300 px-2 lg:px-3 py-2 hover:bg-white/5 rounded-lg whitespace-nowrap"
                >
                  HOME
                </button>
                <button
                  onClick={() =>
                    onNavigateToShop
                      ? onNavigateToShop()
                      : handleUnavailablePage("Shop")
                  }
                  className="hover:text-[#b90e0a] transition-colors duration-300 px-2 lg:px-3 py-2 hover:bg-white/5 rounded-lg whitespace-nowrap"
                >
                  SHOP
                </button>
                {user && (
                  <button
                    onClick={() =>
                      onNavigateToOrders
                        ? onNavigateToOrders()
                        : handleUnavailablePage("Orders")
                    }
                    className="hover:text-[#b90e0a] transition-colors duration-300 px-2 lg:px-3 py-2 hover:bg-white/5 rounded-lg whitespace-nowrap"
                  >
                    ORDERS
                  </button>
                )}
                <button
                  onClick={() =>
                    onNavigateToAbout
                      ? onNavigateToAbout()
                      : handleUnavailablePage("About")
                  }
                  className="hover:text-[#b90e0a] transition-colors duration-300 px-2 lg:px-3 py-2 hover:bg-white/5 rounded-lg whitespace-nowrap"
                >
                  ABOUT
                </button>
                <button
                  onClick={() =>
                    onNavigateToContact
                      ? onNavigateToContact()
                      : handleUnavailablePage("Contact")
                  }
                  className="hover:text-[#b90e0a] transition-colors duration-300 px-2 lg:px-3 py-2 hover:bg-white/5 rounded-lg whitespace-nowrap"
                >
                  CONTACT
                </button>

                {/* AUTH BUTTONS - Desktop */}
                {user ? (
                  <>
                    <span className="text-white px-2 lg:px-3 py-2 flex items-center text-xs lg:text-sm whitespace-nowrap">
                      HEY,{" "}
                      <span className="text-[#b90e0a] ml-1">
                        {formatDisplayName(user.name)}
                      </span>
                    </span>
                    <button
                      onClick={logout}
                      className="hover:text-[#b90e0a] transition-colors duration-300 px-2 lg:px-3 py-2 hover:bg-white/5 rounded-lg flex items-center gap-1 whitespace-nowrap"
                    >
                      <LogOut size={14} className="lg:w-4 lg:h-4" />
                      <span className="text-xs lg:text-sm">LOGOUT</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => onNavigateToLogin()}
                      className="hover:text-[#b90e0a] transition-colors duration-300 px-2 lg:px-3 py-2 hover:bg-white/5 rounded-lg whitespace-nowrap text-xs lg:text-sm"
                    >
                      LOGIN
                    </button>
                    <button
                      onClick={() => onNavigateToSignup()}
                      className="bg-[#b90e0a] hover:bg-[#b90e0a]/80 transition-colors duration-300 px-3 lg:px-4 py-2 rounded-lg ml-1 whitespace-nowrap text-xs lg:text-sm"
                    >
                      SIGN UP
                    </button>
                  </>
                )}
              </div>

              {/* Hamburger Menu Button (Mobile/Tablet) */}
              <button
                className="lg:hidden text-white hover:text-[#b90e0a] transition-colors p-2 -mr-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X size={24} className="sm:w-7 sm:h-7" />
                ) : (
                  <Menu size={24} className="sm:w-7 sm:h-7" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu (Animated) */}
          {mobileMenuOpen && (
            <div className="lg:hidden mt-4 pb-4 space-y-2 border-t border-white/10 pt-4 animate-fadeIn">
              <button
                onClick={() => {
                  onBackToMain();
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left hover:text-[#b90e0a] transition-colors duration-300 px-4 py-2.5 hover:bg-white/5 rounded-lg text-base font-semibold"
              >
                HOME
              </button>
              <button
                onClick={() => {
                  if (onNavigateToShop) {
                    onNavigateToShop();
                  } else {
                    handleUnavailablePage("Shop");
                  }
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left hover:text-[#b90e0a] transition-colors duration-300 px-4 py-2.5 hover:bg-white/5 rounded-lg text-base font-semibold"
              >
                SHOP
              </button>
              {user && (
                <button
                  onClick={() => {
                    if (onNavigateToOrders) {
                      onNavigateToOrders();
                    } else {
                      handleUnavailablePage("Orders");
                    }
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left hover:text-[#b90e0a] transition-colors duration-300 px-4 py-2.5 hover:bg-white/5 rounded-lg text-base font-semibold"
                >
                  ORDERS
                </button>
              )}
              <button
                onClick={() => {
                  if (onNavigateToAbout) {
                    onNavigateToAbout();
                  } else {
                    handleUnavailablePage("About");
                  }
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left hover:text-[#b90e0a] transition-colors duration-300 px-4 py-2.5 hover:bg-white/5 rounded-lg text-base font-semibold"
              >
                ABOUT
              </button>
              <button
                onClick={() => {
                  if (onNavigateToContact) {
                    onNavigateToContact();
                  } else {
                    handleUnavailablePage("Contact");
                  }
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left hover:text-[#b90e0a] transition-colors duration-300 px-4 py-2.5 hover:bg-white/5 rounded-lg text-base font-semibold"
              >
                CONTACT
              </button>

              {/* AUTH SECTION - Mobile */}
              <div className="border-t border-white/10 pt-3 mt-3">
                {user ? (
                  <>
                    <div className="text-white px-4 py-2 mb-2 text-sm">
                      HEY,{" "}
                      <span className="text-[#b90e0a]">
                        {formatDisplayName(user.name)}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="block w-full text-left hover:text-[#b90e0a] transition-colors duration-300 px-4 py-2.5 hover:bg-white/5 rounded-lg flex items-center gap-2 text-base font-semibold"
                    >
                      <LogOut size={18} />
                      LOGOUT
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        onNavigateToLogin();
                        setMobileMenuOpen(false);
                      }}
                      className="block w-full text-left hover:text-[#b90e0a] transition-colors duration-300 px-4 py-2.5 hover:bg-white/5 rounded-lg text-base font-semibold"
                    >
                      LOGIN
                    </button>
                    <button
                      onClick={() => {
                        onNavigateToSignup();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full bg-[#b90e0a] hover:bg-[#b90e0a]/80 transition-colors duration-300 px-4 py-2.5 rounded-lg text-center mt-2 text-base font-semibold"
                    >
                      SIGN UP
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section
        id="animate-hero"
        className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden"
      >
        {/* CHANGE: Removed orange decorations, kept only white and red */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 w-20 h-20 border-2 border-[#b90e0a] rotate-45 animate-pulse-glow"></div>
          <div className="absolute top-20 right-20 w-16 h-16 border border-white rotate-12 animate-float"></div>
          <div className="absolute bottom-20 left-20 w-12 h-12 bg-[#b90e0a] rotate-45 animate-bounce-subtle"></div>
          <div className="absolute bottom-10 right-10 w-24 h-24 border-2 border-white rotate-12 animate-spin-slow"></div>
          <div className="absolute top-1/2 left-1/4 w-8 h-8 bg-white rotate-45 animate-pulse-glow"></div>
          <div className="absolute top-1/3 right-1/3 w-14 h-14 border border-[#b90e0a] rotate-45 animate-float"></div>
        </div>

        <div
          className={`text-center relative z-10 max-w-4xl transition-all duration-1000 ${
            isVisible["animate-hero"]
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
          }`}
        >
          <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black mb-6 font-akira px-4 w-full flex flex-col items-center">
            <span className="block">BORN FROM THE</span>
            <span className="text-[#b90e0a] block">UNDERGROUND</span>
          </h1>
          <div className="w-32 h-1 bg-[#B20404] mx-auto mb-8"></div>
          <p className="text-xl md:text-2xl text-[#808088] max-w-2xl mx-auto mb-12 leading-relaxed">
            KALLKEYY redefines streetwear with authentic design, premium
            materials, and unapologetic style. This is more than clothing—this
            is culture.
          </p>
          <Button
            onClick={onViewProductMenu}
            className="bg-[#b90e0a] hover:bg-[#b90e0a]/80 text-white font-bold px-12 py-4 text-xl shadow-2xl hover:shadow-[#b90e0a]/20 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
          >
            SHOP THE DROP
          </Button>
        </div>
      </section>

      {/* CHANGE: Changed background from grey to light red shade */}
      <section
        id="animate-featured"
        className="py-20 px-4 bg-[#1a0a0a] relative"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-1/4 w-32 h-32 border border-[#b90e0a]/30 rotate-45 animate-spin-very-slow"></div>
          <div className="absolute bottom-20 right-1/4 w-24 h-24 border border-white/20 rotate-12 animate-float-slow"></div>
        </div>

        <div className="max-w-6xl mx-auto">
          <div
            className={`text-center mb-16 transition-all duration-1000 ${
              isVisible["animate-featured"]
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-20"
            }`}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-6 font-akira">
              FEATURED <span className="text-[#b90e0a]">DROPS</span>
            </h2>
            <div className="w-20 h-1 bg-[#b90e0a] mx-auto mb-6 animate-expand-width"></div>
            <p className="text-lg text-[#808088] max-w-2xl mx-auto">
              Our signature pieces that define the KALLKEYY aesthetic. Limited
              quantities, maximum impact.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
            {/* 1. Kaal-Drishta (Hoodie) */}
            <div className="group relative bg-black rounded-xl overflow-hidden border-2 border-[#808088]/20 hover:border-[#b90e0a] transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-[#b90e0a]/20 flex flex-col">
              <div className="aspect-square bg-[#808088]/10 relative overflow-hidden">
                <img
                  src="/KaalDrishta-1.png"
                  alt="KAAL-DRISHTA"
                  className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                  onError={(e) =>
                    ((e.currentTarget as HTMLImageElement).style.opacity = "0")
                  }
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                <div className="absolute top-4 left-4">
                  <span className="bg-[#b90e0a] text-white px-3 py-1 text-xs font-bold rounded-full">
                    FLAGSHIP
                  </span>
                </div>
              </div>
              <div className="p-3 md:p-4 lg:p-6 flex flex-col flex-grow">
                <h3 className="text-base md:text-xl lg:text-2xl font-black group-hover:text-[#b90e0a] transition-colors duration-300 min-h-[2.5rem] md:min-h-[3rem] flex items-center">
                  KAAL-DRISHTA
                </h3>
                <p className="text-xs md:text-sm lg:text-base text-[#808088] line-clamp-2 my-2 md:my-3 flex-grow min-h-[2.5rem] md:min-h-[3rem]">
                  The blazing eye that never blinks. Oversized premium hoodie
                  with divine graphics.
                </p>
                <div className="flex gap-2 md:gap-3 mt-auto">
                  <Button
                    onClick={onViewHoodie}
                    className="flex-1 bg-[#b90e0a] hover:bg-[#b90e0a]/80 text-white font-bold transition-all duration-300 hover:scale-105 text-xs md:text-sm py-2 md:py-3"
                  >
                    VIEW DETAILS
                  </Button>
                </div>
              </div>
            </div>

            {/* 2. Smara-Jivitam (T-Shirt) */}
            <div className="group relative bg-black rounded-xl overflow-hidden border-2 border-[#808088]/20 hover:border-[#b90e0a] transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-[#b90e0a]/20 flex flex-col">
              <div className="aspect-square bg-[#808088]/10 relative overflow-hidden">
                <img
                  src="/Smarajivitam-1.png"
                  alt="SMARA-JIVITAM"
                  className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                  onError={(e) =>
                    ((e.currentTarget as HTMLImageElement).style.opacity = "0")
                  }
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                <div className="absolute top-4 left-4">
                  <span className="bg-[#b90e0a] text-white px-3 py-1 text-xs font-bold rounded-full">
                    NEW DROP
                  </span>
                </div>
              </div>
              <div className="p-3 md:p-4 lg:p-6 flex flex-col flex-grow">
                <h3 className="text-base md:text-xl lg:text-2xl font-black group-hover:text-[#b90e0a] transition-colors duration-300 min-h-[2.5rem] md:min-h-[3rem] flex items-center">
                  SMARA-JIVITAM
                </h3>
                <p className="text-xs md:text-sm lg:text-base text-[#808088] line-clamp-2 my-2 md:my-3 flex-grow min-h-[2.5rem] md:min-h-[3rem]">
                  The Ascension. Wings erupt from chaos, forged in will and
                  fire.
                </p>
                <div className="flex gap-2 md:gap-3 mt-auto">
                  <Button
                    onClick={onViewTshirt}
                    className="flex-1 bg-[#b90e0a] hover:bg-[#b90e0a]/80 text-white font-bold transition-all duration-300 hover:scale-105 text-xs md:text-sm py-2 md:py-3"
                  >
                    VIEW DETAILS
                  </Button>
                </div>
              </div>
            </div>

            {/* 3. Antaha-Yugaysa (Hoodie) */}
            <div className="group relative bg-black rounded-xl overflow-hidden border-2 border-[#808088]/20 hover:border-[#b90e0a] transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-[#b90e0a]/20 flex flex-col">
              <div className="aspect-square bg-[#808088]/10 relative overflow-hidden">
                <img
                  src="/Antahayugasya-1.png"
                  alt="ANTAHA-YUGAYSA"
                  className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                  onError={(e) =>
                    ((e.currentTarget as HTMLImageElement).style.opacity = "0")
                  }
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                <div className="absolute top-4 left-4">
                  <span className="bg-[#b90e0a] text-white px-3 py-1 text-xs font-bold rounded-full">
                    NEW LAUNCH
                  </span>
                </div>
              </div>
              <div className="p-3 md:p-4 lg:p-6 flex flex-col flex-grow">
                <h3 className="text-base md:text-xl lg:text-2xl font-black group-hover:text-[#b90e0a] transition-colors duration-300 min-h-[2.5rem] md:min-h-[3rem] flex items-center">
                  ANTAHA-YUGAYSA
                </h3>
                <p className="text-xs md:text-sm lg:text-base text-[#808088] line-clamp-2 my-2 md:my-3 flex-grow min-h-[2.5rem] md:min-h-[3rem]">
                  Hands of God. Premium oversized hoodie where endings wear
                  eternity.
                </p>
                <div className="flex gap-2 md:gap-3 mt-auto">
                  <Button
                    onClick={onViewHoodie2}
                    className="flex-1 bg-[#b90e0a] hover:bg-[#b90e0a]/80 text-white font-bold transition-all duration-300 hover:scale-105 text-xs md:text-sm py-2 md:py-3"
                  >
                    VIEW DETAILS
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="animate-about" className="py-20 px-4 relative">
        {/* Background decorations */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-1/4 w-32 h-32 border border-[#b90e0a]/30 rotate-45 animate-spin-very-slow"></div>
          <div className="absolute bottom-20 right-1/4 w-24 h-24 border border-white/20 rotate-12 animate-float-slow"></div>
        </div>

        <div className="max-w-6xl mx-auto">
          <div
            className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center transition-all duration-1000 ${
              isVisible["animate-about"]
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-20"
            }`}
          >
            <div className="space-y-6">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-6 font-akira">
                OUR STORY
              </h2>
              <div className="w-20 h-1 bg-[#b90e0a] mb-6"></div>
              <p className="text-lg text-[#808088] mb-6 leading-relaxed">
                Streetwear has always made noise — but it never spoke our voice.
                Born from the pulse of urban life, KALLKEYY creates pieces for
                those who don't fit in — and never want to. For the ones who
                wear their truth, not just their clothes.
                <br />
                <br />
                KALLKEYY was built to bridge a gap — to give you streetwear
                that's more than style, more than hype. It's identity. It's
                defiance. It's a statement.
                <br />
                <br />
                Rooted in the rhythm of the streets, every KALLKEYY piece is a
                blend of precision and passion — designed with care, crafted
                with the finest materials, and built to merge heritage with
                modern edge.
              </p>
              <Button
                onClick={onViewProductMenu}
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-black transition-all duration-300 px-8 py-3 hover:scale-105 hover:shadow-lg bg-transparent"
              >
                EXPLORE COLLECTION
              </Button>
            </div>
            <div className="relative">
              <div className="aspect-square bg-[#28282B] rounded-lg shadow-2xl relative overflow-hidden group hover:scale-105 transition-transform duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-[#b90e0a]/20 to-transparent"></div>
                <div className="absolute bottom-4 left-4 text-2xl font-black group-hover:text-[#b90e0a] transition-colors duration-300">
                  KALLKEYY
                </div>
                {/* Placeholder for image */}
                <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-30">
                  🔥
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-[#b90e0a] rotate-45 opacity-80 animate-bounce-subtle"></div>
            </div>
          </div>
        </div>
      </section>

      {/* CHANGE: Changed background from grey to dark red shade */}
      <section
        id="animate-values"
        className="py-20 px-4 bg-[#1a0a0a] relative overflow-hidden"
      >
        {/* Animated background patterns */}
        <div className="absolute inset-0 opacity-5">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white animate-twinkle"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            />
          ))}
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <h2
            className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-center mb-16 font-akira transition-all duration-1000 ${
              isVisible["animate-values"]
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-20"
            }`}
          >
            WHAT WE STAND FOR
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "AUTHENTICITY",
                desc: "Real designs for real people. No compromise on genuine street culture and artistic expression.",
                delay: "0s",
              },
              {
                title: "QUALITY",
                desc: "Premium materials meet expert craftsmanship. Every stitch tells a story of excellence.",
                delay: "0.2s",
              },
              {
                title: "COMMUNITY",
                desc: "Building a movement of individuals who express themselves through bold, fearless fashion.",
                delay: "0.4s",
              },
            ].map((item, i) => (
              <div
                key={i}
                className={`bg-black p-8 rounded-lg shadow-xl border-l-4 border-[#b90e0a] hover:transform hover:scale-105 transition-all duration-500 hover:shadow-2xl hover:shadow-[#b90e0a]/10 group ${
                  isVisible["animate-values"]
                    ? "animate-bounce-in"
                    : "opacity-0"
                }`}
                style={{ animationDelay: item.delay }}
              >
                <h3 className="text-2xl font-bold mb-4 text-[#b90e0a] group-hover:glow transition-all duration-300">
                  {item.title}
                </h3>
                <p className="text-[#808088] leading-relaxed group-hover:text-white transition-colors duration-300">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section id="animate-process" className="py-20 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <div
            className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center transition-all duration-1000 ${
              isVisible["animate-process"]
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-20"
            }`}
          >
            <div className="relative order-2 lg:order-1">
              <div className="aspect-video bg-[#28282B] rounded-lg shadow-2xl relative overflow-hidden group hover:scale-105 transition-transform duration-300">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#b90e0a]/30 to-transparent"></div>
                <div className="absolute bottom-4 right-4 text-xl font-bold group-hover:text-[#b90e0a] transition-colors duration-300">
                  CRAFTSMANSHIP
                </div>
                {/* Placeholder for image */}
                <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-30">
                  ✂️
                </div>
              </div>
              <div className="absolute -top-4 -left-4 w-16 h-16 border-2 border-[#b90e0a] rotate-45 animate-spin-slow"></div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-6 font-akira">
                DESIGN PROCESS
              </h2>
              <div className="w-20 h-1 bg-[#b90e0a] mb-6"></div>
              <p className="text-lg text-[#808088] mb-6 leading-relaxed">
                From concept sketches to final production, every KALLKEYY piece
                undergoes rigorous design iterations and quality checks to
                ensure it meets our uncompromising standards.
              </p>
              <div className="space-y-4 mb-8">
                {[
                  "Conceptualization",
                  "Material Selection",
                  "Pattern Making",
                  "Quality Control",
                ].map((step, i) => (
                  <div
                    key={i}
                    className="flex items-center space-x-4 hover:translate-x-2 transition-transform duration-300"
                  >
                    <div className="w-8 h-8 bg-[#b90e0a] rounded-full flex items-center justify-center text-black font-bold hover:scale-110 transition-transform duration-300">
                      {i + 1}
                    </div>
                    <span className="text-lg hover:text-[#b90e0a] transition-colors duration-300">
                      {step}
                    </span>
                  </div>
                ))}
              </div>
              <Button
                onClick={onViewHoodie}
                className="bg-white text-black hover:bg-[#b90e0a] hover:text-white font-bold px-8 py-3 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                VIEW FLAGSHIP PIECE
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Social Media Section - WITH SCALE DOWN ON MOBILE */}
      {/* Social Media Section - OPTIMIZED FOR TABLETS */}
      <section
        id="animate-social"
        className="py-12 md:py-20 px-4 bg-[#1a0a0a] relative"
      >
        <div className="max-w-6xl mx-auto">
          <div
            className={`text-center mb-12 md:mb-16 transition-all duration-1000 ${
              isVisible["animate-social"]
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-20"
            }`}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-4 md:mb-6 font-akira">
              FOLLOW <span className="text-[#b90e0a]">OUR JOURNEY</span>
            </h2>
            <div className="w-20 h-1 bg-[#b90e0a] mx-auto mb-4 md:mb-6 animate-expand-width" />
            <p className="text-base md:text-lg text-[#808088] max-w-2xl mx-auto px-4">
              Get an inside look at our latest drops, behind-the-scenes content,
              and street culture inspiration
            </p>
          </div>

          {/* Mobile: Horizontal Scroll | Tablet: Horizontal Scroll | Desktop: Grid */}
          <div className="w-full overflow-x-auto lg:overflow-x-visible pb-4 mb-8 scrollbar-hide">
            <div className="flex lg:grid lg:grid-cols-3 gap-4 lg:gap-6 justify-start lg:justify-center px-2 lg:px-0">
              {[
                "https://www.instagram.com/p/DPWokNfAVAm/",
                "https://www.instagram.com/p/DNn6WNjBf-T/",
                "https://www.instagram.com/p/DQHhLP3AT1G/",
              ].map((url, i) => (
                <div
                  key={i}
                  className={`flex-shrink-0 bg-black rounded-xl overflow-hidden border border-white/10 hover:border-[#b90e0a]/30 transition-all duration-300 hover:scale-105 ${
                    isVisible["animate-social"]
                      ? "animate-bounce-in"
                      : "opacity-0"
                  }`}
                  style={{
                    animationDelay: `${i * 0.1}s`,
                    width: "320px",
                    maxWidth: "320px",
                    minWidth: "320px",
                  }}
                >
                  <div className="aspect-[9/16] bg-[#28282B] relative">
                    <InstagramEmbed
                      url={url}
                      width={320}
                      captioned={false}
                      placeholderSpinner={
                        <div className="flex items-center justify-center h-full">
                          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#b90e0a]" />
                        </div>
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <Button
              onClick={() =>
                window.open("https://www.instagram.com/kall.keyy/", "_blank")
              }
              className="bg-[#b90e0a] hover:bg-[#b90e0a]/80 text-white font-bold px-6 py-3 md:px-8 md:py-3 text-base md:text-lg transition-all duration-300 hover:scale-105"
            >
              VIEW MORE ON INSTAGRAM
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        id="animate-cta"
        className="py-20 px-4 bg-[#b90e0a] text-white relative overflow-hidden"
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-20">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-black/10 rounded-full animate-float-random"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        <div
          className={`max-w-4xl mx-auto text-center relative z-10 transition-all duration-1000 ${
            isVisible["animate-cta"]
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-20"
          }`}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-6 font-akira">
            READY TO JOIN THE MOVEMENT?
          </h2>
          <p className="text-xl md:text-2xl mb-8 font-semibold">
            Limited quantities. Unlimited attitude. Get yours before they're
            gone.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={onViewProductMenu}
              className="bg-black text-white hover:bg-[#28282B] font-bold px-12 py-4 text-xl shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
            >
              SHOP NOW
            </Button>
            <Button
              onClick={onViewHoodie}
              variant="outline"
              className="border-black text-black hover:bg-black hover:text-white font-bold px-12 py-4 text-xl transition-all duration-300 hover:scale-105 bg-transparent"
            >
              SHOP EXCLUSIVE
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-12 px-4 border-t border-[#808088]/20 relative">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2 animate-fade-in-up">
              <h3 className="text-2xl sm:text-3xl font-black mb-4 font-akira">
                KALLKEYY
              </h3>
              <p className="text-[#808088] mb-4 max-w-md">
                Authentic streetwear for the next generation. Born from the
                underground, crafted for tomorrow.
              </p>
              <div className="flex space-x-4">
                <a
                  href="https://www.instagram.com/kall.keyy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-[#28282B] rounded-full flex items-center justify-center hover:bg-[#b90e0a] transition-all duration-300 cursor-pointer hover:scale-110 hover:rotate-12 animate-bounce-in text-white no-underline"
                  aria-label="Follow us on Instagram"
                >
                  IG
                </a>
              </div>
            </div>
            <div
              className="animate-fade-in-up"
              style={{ animationDelay: "0.2s" }}
            >
              <h4 className="text-lg font-bold mb-4">QUICK LINKS</h4>
              <ul className="space-y-2 text-[#808088]">
                <li
                  onClick={() =>
                    onNavigateToAbout
                      ? onNavigateToAbout()
                      : handleUnavailablePage("About Us")
                  }
                  className="hover:text-white cursor-pointer hover:translate-x-2 transition-all duration-300"
                >
                  About Us
                </li>
                <li
                  onClick={() =>
                    onNavigateToSizeGuide
                      ? onNavigateToSizeGuide()
                      : handleUnavailablePage("Size Guide")
                  }
                  className="hover:text-white cursor-pointer hover:translate-x-2 transition-all duration-300"
                >
                  Size Guide
                </li>
                <li
                  onClick={() =>
                    onNavigateToShipping
                      ? onNavigateToShipping()
                      : handleUnavailablePage("Shipping")
                  }
                  className="hover:text-white cursor-pointer hover:translate-x-2 transition-all duration-300"
                >
                  Shipping
                </li>
                <li
                  onClick={() =>
                    onNavigateToReturns
                      ? onNavigateToReturns()
                      : handleUnavailablePage("Returns")
                  }
                  className="hover:text-white cursor-pointer hover:translate-x-2 transition-all duration-300"
                >
                  Returns
                </li>
              </ul>
            </div>
            <div
              className="animate-fade-in-up"
              style={{ animationDelay: "0.4s" }}
            >
              <h4 className="text-lg font-bold mb-4">SUPPORT</h4>
              <ul className="space-y-2 text-[#808088]">
                <li
                  onClick={() =>
                    onNavigateToContact
                      ? onNavigateToContact()
                      : handleUnavailablePage("Contact")
                  }
                  className="hover:text-white cursor-pointer hover:translate-x-2 transition-all duration-300"
                >
                  Contact
                </li>
                <li
                  onClick={() =>
                    onNavigateToFAQ
                      ? onNavigateToFAQ()
                      : handleUnavailablePage("FAQ")
                  }
                  className="hover:text-white cursor-pointer hover:translate-x-2 transition-all duration-300"
                >
                  FAQ
                </li>
                <li
                  onClick={() =>
                    onNavigateToPrivacyPolicy
                      ? onNavigateToPrivacyPolicy()
                      : handleUnavailablePage("Privacy Policy")
                  }
                  className="hover:text-white cursor-pointer hover:translate-x-2 transition-all duration-300"
                >
                  Privacy Policy
                </li>
                <li
                  onClick={() =>
                    onNavigateToTermsOfService
                      ? onNavigateToTermsOfService()
                      : handleUnavailablePage("Terms of Service")
                  }
                  className="hover:text-white cursor-pointer hover:translate-x-2 transition-all duration-300"
                >
                  Terms of Service
                </li>
              </ul>
            </div>
          </div>
          <div
            className="border-t border-[#808088]/20 mt-8 pt-8 text-center text-[#808088] animate-fade-in-up"
            style={{ animationDelay: "0.6s" }}
          >
            <p>
              &copy; 2025 KALLKEYY. All rights reserved. Made with passion for
              street culture.
            </p>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes float-slow {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-15px) rotate(180deg);
          }
        }

        @keyframes slide-horizontal {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes slide-horizontal-reverse {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }

        @keyframes color-pulse {
          0%,
          100% {
            color: #b90e0a;
          }
          50% {
            color: #ff1a1a;
          }
        }

        @keyframes expand-width {
          0% {
            width: 0;
          }
          100% {
            width: 8rem;
          }
        }

        @keyframes bounce-in {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes fade-in-delayed {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-in-left {
          0% {
            opacity: 0;
            transform: translateX(-50px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slide-in-right {
          0% {
            opacity: 0;
            transform: translateX(50px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes spin-slow {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes spin-very-slow {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes bounce-slow {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes bounce-subtle {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        @keyframes pulse-glow {
          0%,
          100% {
            box-shadow: 0 0 5px rgba(221, 0, 4, 0.5);
          }
          50% {
            box-shadow: 0 0 20px rgba(221, 0, 4, 0.8),
              0 0 30px rgba(221, 0, 4, 0.3);
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes twinkle {
          0%,
          100% {
            opacity: 0.2;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes float-random {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          25% {
            transform: translateY(-10px) rotate(90deg);
          }
          50% {
            transform: translateY(-5px) rotate(180deg);
          }
          75% {
            transform: translateY(-15px) rotate(270deg);
          }
        }

        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }
        .animate-slide-horizontal {
          animation: slide-horizontal 12s linear infinite;
        }
        .animate-slide-horizontal-reverse {
          animation: slide-horizontal-reverse 15s linear infinite;
        }

        .animate-color-pulse {
          animation: color-pulse 3s ease-in-out infinite;
        }
        .animate-expand-width {
          animation: expand-width 1.2s ease-out forwards;
        }
        .animate-bounce-in {
          animation: bounce-in 1s ease-out forwards;
        }
        .animate-fade-in-delayed {
          animation: fade-in-delayed 1s ease-out forwards 0.8s;
        }
        .animate-slide-in-left {
          animation: slide-in-left 1s ease-out forwards;
        }
        .animate-slide-in-right {
          animation: slide-in-right 1s ease-out forwards;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        .animate-spin-very-slow {
          animation: spin-very-slow 20s linear infinite;
        }
        .animate-bounce-slow {
          animation: bounce-slow 4s ease-in-out infinite;
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 3s ease-in-out infinite;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-twinkle {
          animation: twinkle 2s ease-in-out infinite;
        }
        .animate-float-random {
          animation: float-random 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
