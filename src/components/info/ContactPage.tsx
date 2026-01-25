"use client";

import { useState } from "react";
import { Menu, X, LogOut, Mail, Instagram, MapPin, Clock } from "lucide-react";
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
    return nameParts[0].toUpperCase();
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
    <div className={`min-h-screen bg-gradient-to-b from-[#f8f8f8] via-[#f0f0f0] to-[#e8e8e8] text-black ${skipAnimations ? '[&_*]:!animate-none' : ''}`}>
      {/* Announcement Bar */}
      <div className="bg-[#333333] text-white text-center py-1.5 px-4 text-[10px] sm:text-xs font-bold tracking-widest uppercase z-[60] relative">
        Free Shipping on all pan-India orders · Code <span className="text-[#4CAF50]">KALLKEYY10</span> for 10% Off
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/95 backdrop-blur-md text-white">
        <div className="w-full px-5 sm:px-8 lg:px-24 py-3 lg:py-4">
          <div className="flex items-center justify-between max-w-[1600px] mx-auto">
            <div className="flex-shrink-0 z-10">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-wider hover:text-[#b90e0a] transition-colors duration-300 cursor-pointer font-akira" onClick={onBackToMain}>KALLKEYY</h1>
            </div>
            <div className="hidden lg:flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2">
              <button onClick={onBackToMain} className="text-sm font-bold tracking-wide hover:text-[#b90e0a] transition-colors duration-300 uppercase">Home</button>
              <button onClick={() => onNavigateToShop ? onNavigateToShop() : handleUnavailablePage("Shop")} className="text-sm font-bold tracking-wide hover:text-[#b90e0a] transition-colors duration-300 uppercase">Shop</button>
              {user && <button onClick={() => onNavigateToOrders ? onNavigateToOrders() : handleUnavailablePage("Orders")} className="text-sm font-bold tracking-wide hover:text-[#b90e0a] transition-colors duration-300 uppercase">Orders</button>}
              <button onClick={() => onNavigateToAbout ? onNavigateToAbout() : handleUnavailablePage("About")} className="text-sm font-bold tracking-wide hover:text-[#b90e0a] transition-colors duration-300 uppercase">About</button>
              <button className="text-sm font-bold tracking-wide text-[#b90e0a] transition-colors duration-300 uppercase">Contact</button>
            </div>
            <div className="flex items-center gap-3 z-10">
              <div className="hidden lg:flex items-center gap-6">
                {user ? (
                  <>
                    <span className="text-white text-base font-medium">Hey, <span className="text-[#b90e0a] font-bold">{formatDisplayName(user.name)}</span></span>
                    <button onClick={logout} className="text-white hover:text-[#b90e0a] transition-colors duration-300 flex items-center gap-2 text-base font-medium"><LogOut size={18} /><span>Logout</span></button>
                  </>
                ) : (
                  <>
                    <button onClick={onNavigateToLogin} className="text-white hover:text-[#b90e0a] transition-colors duration-300 text-base font-bold">Login</button>
                    <button onClick={onNavigateToSignup} className="bg-[#b90e0a] hover:bg-[#8a0a08] transition-colors duration-300 px-5 py-2.5 rounded-full text-base font-bold text-white">Sign Up</button>
                  </>
                )}
              </div>
              <button className="lg:hidden text-white hover:text-[#b90e0a] transition-colors p-1.5" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[100] animate-fadeIn">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative h-full flex flex-col pt-16 px-5 pb-6 overflow-y-auto">
            <button className="absolute top-4 right-4 text-white hover:text-[#b90e0a] transition-colors p-1.5" onClick={() => setMobileMenuOpen(false)}><X size={24} /></button>
            <div className="space-y-1">
              <button onClick={() => { onBackToMain(); setMobileMenuOpen(false); }} className="block w-full text-left text-white hover:text-[#b90e0a] transition-colors duration-300 px-3 py-3 hover:bg-white/5 rounded-lg text-base font-bold">Home</button>
              <button onClick={() => { onNavigateToShop?.(); setMobileMenuOpen(false); }} className="block w-full text-left text-white hover:text-[#b90e0a] transition-colors duration-300 px-3 py-3 hover:bg-white/5 rounded-lg text-base font-bold">Shop</button>
              {user && <button onClick={() => { onNavigateToOrders?.(); setMobileMenuOpen(false); }} className="block w-full text-left text-white hover:text-[#b90e0a] transition-colors duration-300 px-3 py-3 hover:bg-white/5 rounded-lg text-base font-bold">Orders</button>}
              <button onClick={() => { onNavigateToAbout?.(); setMobileMenuOpen(false); }} className="block w-full text-left text-white hover:text-[#b90e0a] transition-colors duration-300 px-3 py-3 hover:bg-white/5 rounded-lg text-base font-bold">About</button>
              <button className="block w-full text-left text-[#b90e0a] transition-colors duration-300 px-3 py-3 bg-white/5 rounded-lg text-base font-bold">Contact</button>
            </div>
            <div className="border-t border-white/20 pt-4 mt-4">
              {user ? (
                <>
                  <div className="text-white px-3 py-2 mb-1 text-sm font-medium">Hey, <span className="text-[#b90e0a] font-bold">{formatDisplayName(user.name)}</span></div>
                  <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="block w-full text-left text-white hover:text-[#b90e0a] transition-colors duration-300 px-3 py-3 hover:bg-white/5 rounded-lg flex items-center gap-2 text-base font-bold"><LogOut size={18} />Logout</button>
                </>
              ) : (
                <div className="space-y-2 px-3">
                  <button onClick={() => { onNavigateToLogin(); setMobileMenuOpen(false); }} className="block w-full text-center text-white hover:text-[#b90e0a] transition-colors duration-300 py-3 border border-white/20 rounded-full text-sm font-bold">Login</button>
                  <button onClick={() => { onNavigateToSignup(); setMobileMenuOpen(false); }} className="w-full bg-[#b90e0a] hover:bg-[#8a0a08] transition-colors duration-300 py-3 rounded-full text-center text-sm font-bold text-white">Sign Up</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <button onClick={onBackToMain} className="hover:text-[#b90e0a] transition-colors">Home</button>
          <span>/</span>
          <span className="text-[#b90e0a] font-medium">Contact</span>
        </div>

        {/* Hero Section */}
        <div className="mb-16 text-center">
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight font-akira text-[#0a0a0a]">
            GET IN <span className="text-[#b90e0a]">TOUCH</span>
          </h1>
          <div className="w-24 h-1 bg-[#b90e0a] mx-auto mb-8"></div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Have questions? Want to collaborate? We'd love to hear from you.
          </p>
        </div>

        {/* Contact Methods */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {contactMethods.map((method, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 transition-all duration-300 hover:scale-105 shadow-sm border border-black/5"
            >
              <method.icon className="w-12 h-12 text-[#b90e0a] mb-4" />
              <h3 className="text-2xl font-black mb-2 text-[#0a0a0a]">{method.title}</h3>
              <p className="text-[#b90e0a] font-bold mb-3">{method.detail}</p>
              <p className="text-sm mb-6 text-gray-600">{method.description}</p>
              {method.action ? (
                <a
                  href={method.action}
                  target={method.icon === Instagram ? "_blank" : undefined}
                  rel={method.icon === Instagram ? "noopener noreferrer" : undefined}
                  className="block w-full"
                >
                  <button className="w-full py-3 px-6 rounded-full bg-[#c41e1a] hover:bg-[#8a0a08] text-white font-bold transition-all duration-300 hover:shadow-lg">
                    {method.actionText}
                  </button>
                </a>
              ) : (
                <button disabled className="w-full py-3 px-6 rounded-full bg-neutral-700 text-neutral-300 cursor-not-allowed font-bold">
                  {method.actionText}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Business Info */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {businessInfo.map((info, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 flex items-center gap-4 shadow-sm border border-black/5"
            >
              <info.icon className="w-10 h-10 text-[#b90e0a]" />
              <div>
                <h3 className="font-bold text-lg mb-1 text-[#0a0a0a]">{info.title}</h3>
                <p className="text-gray-600">{info.detail}</p>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Notice */}
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-black/5">
          <h2 className="text-2xl md:text-3xl font-black mb-4 font-akira text-[#0a0a0a]">
            HAVE A QUESTION?
          </h2>
          <p className="text-gray-600 mb-6">
            Check out our FAQ section for quick answers to common questions about orders, shipping, returns, and more.
          </p>
          <button
            onClick={() => onNavigateToFAQ ? onNavigateToFAQ() : handleUnavailablePage("FAQ")}
            className="bg-[#c41e1a] hover:bg-[#8a0a08] text-white font-bold px-8 py-3 transition-all duration-300 hover:shadow-lg"
          >
            VIEW FAQ
          </button>
        </div>
      </div>

    </div>
  );
}
