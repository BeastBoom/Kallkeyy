"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, Mail, Instagram, MapPin, Clock, Phone } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface Props {
  onBackToMain: () => void;
  onNavigateToShop?: () => void;
  onNavigateToOrders?: () => void;
  onNavigateToAbout?: () => void;
  onNavigateToFAQ?: () => void;
  onNavigateToLogin: () => void;
  onNavigateToSignup: () => void;
  skipAnimations?: boolean;
}

export default function ContactPage({
  onBackToMain,
  onNavigateToShop,
  onNavigateToOrders,
  onNavigateToAbout,
  onNavigateToFAQ,
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

  const contactMethods = [
    {
      icon: Mail,
      title: "Email Us",
      detail: "support@kallkeyy.com",
      description: "For inquiries, support, and collaborations",
      action: "mailto:support@kallkeyy.com",
      actionText: "Send Email"
    },
    {
      icon: Instagram,
      title: "Instagram",
      detail: "@kall.keyy",
      description: "DM us for quick responses and updates",
      action: "https://instagram.com/kall.keyy",
      actionText: "Follow Us"
    },
    {
      icon: Phone,
      title: "Customer Support",
      detail: "Coming Soon",
      description: "Phone support will be available soon",
      action: null,
      actionText: "Coming Soon"
    }
  ];

  const businessInfo = [
    {
      icon: MapPin,
      title: "Location",
      detail: "India"
    },
    {
      icon: Clock,
      title: "Response Time",
      detail: "24-48 hours"
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
                  className="text-[#b90e0a] transition-colors duration-300 px-2 lg:px-3 py-2 bg-white/5 rounded-lg whitespace-nowrap"
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
                className="block w-full text-left text-[#b90e0a] transition-colors duration-300 px-4 py-2.5 bg-white/5 rounded-lg text-base font-semibold"
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
        <div className="max-w-6xl mx-auto">
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
              GET IN <span className="text-[#b90e0a]">TOUCH</span>
            </h1>
            <div className="w-24 h-1 bg-[#b90e0a] mx-auto mb-8"></div>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Have questions? Want to collaborate? We'd love to hear from you.
            </p>
          </div>

          {/* Contact Methods */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {contactMethods.map((method, index) => (
              <div
                key={index}
                className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:border-[#b90e0a] transition-all duration-300 hover:scale-105"
              >
                <method.icon className="w-12 h-12 text-[#b90e0a] mb-4" />
                <h3 className="text-2xl font-black mb-2">{method.title}</h3>
                <p className="text-[#b90e0a] font-bold mb-3">{method.detail}</p>
                <p className="text-gray-400 text-sm mb-6">{method.description}</p>
                {method.action ? (
                  <a
                    href={method.action}
                    target={method.icon === Instagram ? "_blank" : undefined}
                    rel={method.icon === Instagram ? "noopener noreferrer" : undefined}
                    className="inline-block w-full"
                  >
                    <Button className="w-full bg-[#b90e0a] hover:bg-[#8a0a07] text-white font-bold">
                      {method.actionText}
                    </Button>
                  </a>
                ) : (
                  <Button disabled className="w-full bg-gray-600 text-gray-400 cursor-not-allowed">
                    {method.actionText}
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Business Info */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {businessInfo.map((info, index) => (
              <div
                key={index}
                className="bg-white/5 border border-white/10 rounded-xl p-6 flex items-center gap-4"
              >
                <info.icon className="w-10 h-10 text-[#b90e0a]" />
                <div>
                  <h3 className="font-bold text-lg mb-1">{info.title}</h3>
                  <p className="text-gray-400">{info.detail}</p>
                </div>
              </div>
            ))}
          </div>

          {/* FAQ Notice */}
          <div className="bg-gradient-to-r from-[#b90e0a]/10 to-transparent border border-[#b90e0a]/30 rounded-2xl p-8 text-center">
            <h2 className="text-2xl md:text-3xl font-black mb-4 font-akira">
              HAVE A QUESTION?
            </h2>
            <p className="text-gray-300 mb-6">
              Check out our FAQ section for quick answers to common questions about orders, shipping, returns, and more.
            </p>
            <Button
              onClick={() => onNavigateToFAQ ? onNavigateToFAQ() : handleUnavailablePage("FAQ")}
              className="bg-[#b90e0a] hover:bg-[#8a0a07] text-white font-bold px-8 py-3"
            >
              VIEW FAQ
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

