"use client";

import { useState } from "react";
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
    return nameParts[0].toUpperCase();
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
              <button className="text-sm font-bold tracking-wide text-[#b90e0a] transition-colors duration-300 uppercase">About</button>
              <button onClick={() => onNavigateToContact ? onNavigateToContact() : handleUnavailablePage("Contact")} className="text-sm font-bold tracking-wide hover:text-[#b90e0a] transition-colors duration-300 uppercase">Contact</button>
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
              <button className="block w-full text-left text-[#b90e0a] transition-colors duration-300 px-3 py-3 bg-white/5 rounded-lg text-base font-bold">About</button>
              <button onClick={() => { onNavigateToContact?.(); setMobileMenuOpen(false); }} className="block w-full text-left text-white hover:text-[#b90e0a] transition-colors duration-300 px-3 py-3 hover:bg-white/5 rounded-lg text-base font-bold">Contact</button>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <button onClick={onBackToMain} className="hover:text-[#b90e0a] transition-colors">Home</button>
          <span>/</span>
          <span className="text-[#b90e0a] font-medium">About</span>
        </div>

        {/* Hero Section */}
        <div className="mb-16 text-center">
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight font-akira text-[#0a0a0a]">
            ABOUT <span className="text-[#b90e0a]">KALLKEYY</span>
          </h1>
          <div className="w-24 h-1 bg-[#b90e0a] mx-auto mb-8"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Born from the underground, crafted for tomorrow. We're not just a brand—we're a movement.
          </p>
        </div>

        {/* Our Story */}
        <div className="mb-20 bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-black/5">
          <h2 className="text-3xl md:text-4xl font-black mb-6 font-akira text-[#0a0a0a]">OUR STORY</h2>
          <div className="space-y-4 text-gray-600 leading-relaxed">
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
          <h2 className="text-3xl md:text-4xl font-black mb-12 text-center font-akira text-[#0a0a0a]">
            WHAT WE STAND FOR
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 transition-all duration-300 hover:scale-105 shadow-sm border border-black/5"
            >
                <value.icon className="w-12 h-12 text-[#b90e0a] mb-4" />
                <h3 className="text-xl font-bold mb-3 text-[#0a0a0a]">{value.title}</h3>
                <p className="text-sm leading-relaxed text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Founders Section */}
        <div className="mb-20">
          <h2 className="text-3xl md:text-4xl font-black mb-12 text-center font-akira text-[#0a0a0a]">
            MEET THE <span className="text-[#b90e0a]">FOUNDERS</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {founders.map((founder, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 shadow-sm border border-black/5"
            >
              <div className="aspect-square bg-[#f5f5f5] relative overflow-hidden">
                  <img
                    src={founder.image}
                    alt={founder.name}
                    className="w-full h-full object-contain p-8 opacity-80"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-black mb-2 text-[#0a0a0a]">{founder.name}</h3>
                  <p className="text-[#b90e0a] font-bold mb-4 text-sm">{founder.role}</p>
                  <p className="text-sm leading-relaxed text-gray-600">{founder.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-[#0a0a0a] text-white rounded-2xl p-12 text-center">
          <h2 className="text-3xl md:text-5xl font-black mb-6 font-akira">JOIN THE MOVEMENT</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-gray-300">
            Be part of something bigger. Wear your truth. Express yourself fearlessly.
          </p>
          <button
            onClick={() => onNavigateToShop ? onNavigateToShop() : handleUnavailablePage("Shop")}
            className="bg-[#b90e0a] hover:bg-[#8a0a08] text-white font-bold px-12 py-4 text-lg transition-all duration-300 hover:scale-105 rounded-full"
          >
            EXPLORE COLLECTION
          </button>
        </div>
      </div>

    </div>
  );
}
