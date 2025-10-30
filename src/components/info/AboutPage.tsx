"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, Users, Target, Heart, Award } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface Props {
  onBackToMain: () => void;
  onNavigateToShop?: () => void;
  onNavigateToOrders?: () => void;
  onNavigateToContact?: () => void;
  onNavigateToLogin: () => void;
  onNavigateToSignup: () => void;
  skipAnimations?: boolean;
}

export default function AboutPage({
  onBackToMain,
  onNavigateToShop,
  onNavigateToOrders,
  onNavigateToContact,
  onNavigateToLogin,
  onNavigateToSignup,
  skipAnimations = false,
}: Props) {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleUnavailablePage = (pageName: string) => {
    toast({
      title: "Under Development",
      description: `The ${pageName} page is currently being developed. Check back soon!`,
      duration: 3000,
    });
  };

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

  const founders = [
    {
      name: "Founder 1",
      role: "Creative Director & Co-Founder",
      image: "/navbar-logo.png",
      description: "Visionary behind KALLKEYY's unique design philosophy, bringing street culture and artistic expression to life through every piece."
    },
    {
      name: "Founder 2",
      role: "Operations Director & Co-Founder",
      image: "/navbar-logo.png",
      description: "Ensures quality and precision in every stitch, managing production and maintaining the highest standards of craftsmanship."
    },
    {
      name: "Founder 3",
      role: "Brand Director & Co-Founder",
      image: "/navbar-logo.png",
      description: "Drives the brand's identity and community engagement, connecting with the underground culture that defines KALLKEYY."
    }
  ];

  const values = [
    {
      icon: Heart,
      title: "AUTHENTICITY",
      description: "We create genuine designs that represent real street culture. No imitations, no compromises—just pure, unapologetic expression."
    },
    {
      icon: Award,
      title: "QUALITY",
      description: "Premium materials meet expert craftsmanship. Every piece is built to last, ensuring you get the best streetwear experience."
    },
    {
      icon: Users,
      title: "COMMUNITY",
      description: "We're building a movement of individuals who express themselves fearlessly through bold, distinctive fashion."
    },
    {
      icon: Target,
      title: "INNOVATION",
      description: "Pushing boundaries with every collection. We merge traditional craftsmanship with modern design to create something extraordinary."
    }
  ];

  return (
    <div className={`min-h-screen bg-black text-white overflow-hidden ${skipAnimations ? '[&_*]:!animate-none' : ''}`}>
      {/* Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#b90e0a]/5 via-transparent to-transparent pointer-events-none" />
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-[#b90e0a]/10 rounded-full blur-3xl pointer-events-none opacity-20" />

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/90 backdrop-blur-md">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-3 lg:py-4">
          <div className="flex items-center justify-between relative">
            <div className="flex-shrink-0 z-10">
              <h1
                className="text-xl sm:text-2xl lg:text-3xl font-black tracking-wider hover:text-[#b90e0a] transition-colors duration-300 cursor-pointer font-akira"
                onClick={onBackToMain}
              >
                KALLKEYY
              </h1>
            </div>

            <div className="hidden xl:block absolute left-1/2 transform -translate-x-1/2 z-10">
              <img
                src="/navbar-logo.png"
                alt="KALLKEYY Logo"
                onClick={onBackToMain}
                className="h-10 w-auto sm:h-12 lg:h-14 object-contain opacity-90 hover:opacity-100 transition-opacity cursor-pointer"
              />
            </div>

            <div className="flex items-center z-10">
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
                  className="text-[#b90e0a] transition-colors duration-300 px-2 lg:px-3 py-2 bg-white/5 rounded-lg whitespace-nowrap"
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
                className="block w-full text-left text-[#b90e0a] transition-colors duration-300 px-4 py-2.5 bg-white/5 rounded-lg text-base font-semibold"
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

      {/* Main Content */}
      <div className="pt-32 pb-20 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => window.history.back()}
            className="mb-8 flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
          >
            <span className="text-2xl group-hover:-translate-x-1 transition-transform">←</span>
            <span className="font-semibold">Back</span>
          </button>

          {/* Hero Section */}
          <div className="mb-16 text-center">
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight font-akira">
              ABOUT <span className="text-[#b90e0a]">KALLKEYY</span>
            </h1>
            <div className="w-24 h-1 bg-[#b90e0a] mx-auto mb-8"></div>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Born from the underground, crafted for tomorrow. We're not just a brand—we're a movement.
            </p>
          </div>

          {/* Our Story */}
          <div className="mb-20 bg-white/5 border border-white/10 rounded-2xl p-8 md:p-12">
            <h2 className="text-3xl md:text-4xl font-black mb-6 font-akira">OUR STORY</h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                Streetwear has always made noise — but it never spoke our voice. Born from the pulse of urban life, 
                KALLKEYY creates pieces for those who don't fit in — and never want to. For the ones who wear their 
                truth, not just their clothes.
              </p>
              <p>
                KALLKEYY was built to bridge a gap — to give you streetwear that's more than style, more than hype. 
                It's identity. It's defiance. It's a statement.
              </p>
              <p>
                Rooted in the rhythm of the streets, every KALLKEYY piece is a blend of precision and passion — 
                designed with care, crafted with the finest materials, and built to merge heritage with modern edge.
              </p>
              <p className="text-[#b90e0a] font-bold text-lg mt-6">
                This is ASTITVA ACT-I — the first chapter of our journey.
              </p>
            </div>
          </div>

          {/* Our Values */}
          <div className="mb-20">
            <h2 className="text-3xl md:text-4xl font-black mb-12 text-center font-akira">
              WHAT WE STAND FOR
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <div
                  key={index}
                  className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-[#b90e0a] transition-all duration-300 hover:scale-105"
                >
                  <value.icon className="w-12 h-12 text-[#b90e0a] mb-4" />
                  <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{value.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Founders Section */}
          <div className="mb-20">
            <h2 className="text-3xl md:text-4xl font-black mb-12 text-center font-akira">
              MEET THE <span className="text-[#b90e0a]">FOUNDERS</span>
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {founders.map((founder, index) => (
                <div
                  key={index}
                  className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-[#b90e0a] transition-all duration-300 hover:scale-105"
                >
                  <div className="aspect-square bg-gradient-to-br from-[#b90e0a]/20 to-transparent relative overflow-hidden">
                    <img
                      src={founder.image}
                      alt={founder.name}
                      className="w-full h-full object-contain p-8 opacity-80"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-black mb-2">{founder.name}</h3>
                    <p className="text-[#b90e0a] font-bold mb-4 text-sm">{founder.role}</p>
                    <p className="text-gray-400 text-sm leading-relaxed">{founder.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-[#b90e0a] to-[#8a0a07] rounded-2xl p-12 text-center">
            <h2 className="text-3xl md:text-5xl font-black mb-6 font-akira">JOIN THE MOVEMENT</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Be part of something bigger. Wear your truth. Express yourself fearlessly.
            </p>
            <Button
              onClick={() => onNavigateToShop ? onNavigateToShop() : handleUnavailablePage("Shop")}
              className="bg-black hover:bg-white hover:text-black text-white font-bold px-12 py-4 text-lg transition-all duration-300 hover:scale-105"
            >
              EXPLORE COLLECTION
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

