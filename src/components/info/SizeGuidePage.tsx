"use client";

import { useState } from "react";
import { Menu, X, LogOut } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface Props {
  onBackToMain: () => void;
  onNavigateToShop?: () => void;
  onNavigateToAbout?: () => void;
  onNavigateToContact?: () => void;
  onNavigateToOrders?: () => void;
  onNavigateToLogin: () => void;
  onNavigateToSignup: () => void;
  skipAnimations?: boolean;
}

export default function SizeGuidePage({
  onBackToMain,
  onNavigateToShop,
  onNavigateToAbout,
  onNavigateToContact,
  onNavigateToOrders,
  onNavigateToLogin,
  onNavigateToSignup,
  skipAnimations = false,
}: Props) {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<"hoodie" | "tshirt">("hoodie");

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

  const HOODIE_SIZE_CHART = {
    M: { chest: "38-40", garmentChest: "46", length: "27.5", shoulder: "24.5" },
    L: { chest: "40-42", garmentChest: "48", length: "28.5", shoulder: "25" },
    XL: { chest: "42-44", garmentChest: "50", length: "29.5", shoulder: "25.5" },
    XXL: { chest: "44-46", garmentChest: "52", length: "30", shoulder: "26" },
  };

  const TSHIRT_SIZE_CHART = {
    M: { chest: "38-40", garmentChest: "46", length: "27.5", shoulder: "24.5" },
    L: { chest: "40-42", garmentChest: "48", length: "28.5", shoulder: "25" },
    XL: { chest: "42-44", garmentChest: "50", length: "29.5", shoulder: "25.5" },
    XXL: { chest: "44-46", garmentChest: "52", length: "30", shoulder: "26" },
  };

  const SIZE_CHART = selectedType === "hoodie" ? HOODIE_SIZE_CHART : TSHIRT_SIZE_CHART;

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
              <button onClick={() => { onNavigateToAbout?.(); setMobileMenuOpen(false); }} className="block w-full text-left text-white hover:text-[#b90e0a] transition-colors duration-300 px-3 py-3 hover:bg-white/5 rounded-lg text-base font-bold">About</button>
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <button onClick={onBackToMain} className="hover:text-[#b90e0a] transition-colors">Home</button>
          <span>/</span>
          <span className="text-[#b90e0a] font-medium">Size Guide</span>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black mb-4 font-akira text-[#0a0a0a]">
            SIZE <span className="text-[#b90e0a]">GUIDE</span>
          </h1>
          <div className="w-20 h-1 bg-[#b90e0a] mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Find your perfect fit with our detailed size guide</p>
        </div>

        {/* Product Type Selector */}
        <div className="flex justify-center gap-4 mb-12">
          <button
            onClick={() => setSelectedType("hoodie")}
            className={`px-8 py-3 rounded-lg font-bold transition-all duration-300 ${
              selectedType === "hoodie"
                ? "bg-[#b90e0a] text-white scale-105"
                : "bg-white border border-black/10 hover:border-[#b90e0a] text-[#0a0a0a]"
            }`}
          >
            HOODIES
          </button>
          <button
            onClick={() => setSelectedType("tshirt")}
            className={`px-8 py-3 rounded-lg font-bold transition-all duration-300 ${
              selectedType === "tshirt"
                ? "bg-[#b90e0a] text-white scale-105"
                : "bg-white border border-black/10 hover:border-[#b90e0a] text-[#0a0a0a]"
            }`}
          >
            T-SHIRTS
          </button>
        </div>

        {/* Size Chart Table */}
        <div className="bg-white border border-black/5 rounded-2xl p-6 md:p-8 mb-12 shadow-sm">
          <h2 className="text-2xl font-black mb-6 text-[#0a0a0a]">
            {selectedType === "hoodie" ? "HOODIE" : "T-SHIRT"} SIZE CHART (inches)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-[#b90e0a]">
                  <th className="text-left p-4 font-black text-[#0a0a0a]">SIZE</th>
                  <th className="text-left p-4 font-black text-[#0a0a0a]">BODY CHEST</th>
                  <th className="text-left p-4 font-black text-[#0a0a0a]">GARMENT CHEST</th>
                  <th className="text-left p-4 font-black text-[#0a0a0a]">LENGTH</th>
                  <th className="text-left p-4 font-black text-[#0a0a0a]">SHOULDER</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(SIZE_CHART).map(([size, measurements], index) => (
                  <tr
                    key={size}
                    className={`border-b border-black/5 hover:bg-[#fafafa] transition-colors ${
                      index % 2 === 0 ? "bg-[#fafafa]" : "bg-white"
                    }`}
                  >
                    <td className="p-4 font-bold text-[#b90e0a] text-lg">{size}</td>
                    <td className="p-4 text-gray-700">{measurements.chest}"</td>
                    <td className="p-4 text-gray-700">{measurements.garmentChest}"</td>
                    <td className="p-4 text-gray-700">{measurements.length}"</td>
                    <td className="p-4 text-gray-700">{measurements.shoulder}"</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* How to Measure Section */}
        <div className="bg-white border border-black/5 rounded-2xl p-6 md:p-8 mb-12 shadow-sm">
          <h2 className="text-2xl font-black mb-6 text-[#0a0a0a]">HOW TO MEASURE</h2>
          <div className="space-y-4 text-gray-600">
            {[
              { title: "Body Chest", desc: "Measure around the fullest part of your chest, keeping the tape horizontal." },
              { title: "Length", desc: "Measure from the highest point of the shoulder to the bottom hem." },
              { title: "Shoulder", desc: "Measure from shoulder seam to shoulder seam across the back." }
            ].map((item, i) => (
              <div key={i} className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-[#b90e0a] rounded-full flex items-center justify-center font-bold text-sm text-white">{i + 1}</span>
                <div>
                  <h3 className="font-bold text-[#0a0a0a] mb-1">{item.title}</h3>
                  <p className="text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fit Guide */}
        <div className="bg-gradient-to-r from-[#b90e0a]/10 to-[#b90e0a]/5 border border-[#b90e0a]/20 rounded-2xl p-6 md:p-8">
          <h2 className="text-2xl font-black mb-4 text-[#0a0a0a]">FIT GUIDE</h2>
          <div className="space-y-3 text-gray-700">
            <p><span className="text-[#0a0a0a] font-bold">• Oversized Fit:</span> Our products are designed with an oversized, relaxed fit for maximum comfort and style.</p>
            <p><span className="text-[#0a0a0a] font-bold">• Between Sizes?</span> We recommend sizing down if you prefer a more fitted look, or stick with your regular size for the full oversized effect.</p>
            <p><span className="text-[#0a0a0a] font-bold">• Still Unsure?</span> Contact our support team at <a href="mailto:support@kallkeyy.com" className="text-[#b90e0a] hover:underline">support@kallkeyy.com</a> for personalized sizing advice.</p>
          </div>
        </div>
      </div>

    </div>
  );
}
