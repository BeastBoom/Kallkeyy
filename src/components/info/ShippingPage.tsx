"use client";

import { useState } from "react";
import { Truck, Package, MapPin, Clock, AlertCircle, Menu, X, LogOut } from "lucide-react";
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

export default function ShippingPage({
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  return (
    <div className={`min-h-screen bg-gradient-to-b from-[#f8f8f8] via-[#f0f0f0] to-[#e8e8e8] text-black ${skipAnimations ? '[&_*]:!animate-none' : ''}`}>
      {/* Announcement Bar */}
      <div className="bg-[#333333] text-white text-center py-1.5 px-4 text-[10px] sm:text-xs font-bold tracking-widest uppercase z-[60] relative">
        Free Shipping on all pan-India orders · Code <span className="text-[#4CAF50]">KALLKEYY100</span> for 10% Off
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
              <button className="lg:hidden text-white hover:text-[#b90e0a] transition-colors p-1.5" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[100] animate-fadeIn">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="relative h-full flex flex-col pt-16 px-5 pb-6 overflow-y-auto">
            <button className="absolute top-4 right-4 text-white hover:text-[#b90e0a] transition-colors p-1.5" onClick={() => setIsMobileMenuOpen(false)}><X size={24} /></button>
            <div className="space-y-1">
              <button onClick={() => { onBackToMain(); setIsMobileMenuOpen(false); }} className="block w-full text-left text-white hover:text-[#b90e0a] transition-colors duration-300 px-3 py-3 hover:bg-white/5 rounded-lg text-base font-bold">Home</button>
              <button onClick={() => { onNavigateToShop?.(); setIsMobileMenuOpen(false); }} className="block w-full text-left text-white hover:text-[#b90e0a] transition-colors duration-300 px-3 py-3 hover:bg-white/5 rounded-lg text-base font-bold">Shop</button>
              {user && <button onClick={() => { onNavigateToOrders?.(); setIsMobileMenuOpen(false); }} className="block w-full text-left text-white hover:text-[#b90e0a] transition-colors duration-300 px-3 py-3 hover:bg-white/5 rounded-lg text-base font-bold">Orders</button>}
              <button onClick={() => { onNavigateToAbout?.(); setIsMobileMenuOpen(false); }} className="block w-full text-left text-white hover:text-[#b90e0a] transition-colors duration-300 px-3 py-3 hover:bg-white/5 rounded-lg text-base font-bold">About</button>
              <button onClick={() => { onNavigateToContact?.(); setIsMobileMenuOpen(false); }} className="block w-full text-left text-white hover:text-[#b90e0a] transition-colors duration-300 px-3 py-3 hover:bg-white/5 rounded-lg text-base font-bold">Contact</button>
            </div>
            <div className="border-t border-white/20 pt-4 mt-4">
              {user ? (
                <>
                  <div className="text-white px-3 py-2 mb-1 text-sm font-medium">Hey, <span className="text-[#b90e0a] font-bold">{formatDisplayName(user.name)}</span></div>
                  <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="block w-full text-left text-white hover:text-[#b90e0a] transition-colors duration-300 px-3 py-3 hover:bg-white/5 rounded-lg flex items-center gap-2 text-base font-bold"><LogOut size={18} />Logout</button>
                </>
              ) : (
                <div className="space-y-2 px-3">
                  <button onClick={() => { onNavigateToLogin(); setIsMobileMenuOpen(false); }} className="block w-full text-center text-white hover:text-[#b90e0a] transition-colors duration-300 py-3 border border-white/20 rounded-full text-sm font-bold">Login</button>
                  <button onClick={() => { onNavigateToSignup(); setIsMobileMenuOpen(false); }} className="w-full bg-[#b90e0a] hover:bg-[#8a0a08] transition-colors duration-300 py-3 rounded-full text-center text-sm font-bold text-white">Sign Up</button>
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
          <span className="text-[#b90e0a] font-medium">Shipping</span>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black mb-4 font-akira text-[#0a0a0a]">
            SHIPPING <span className="text-[#b90e0a]">INFORMATION</span>
          </h1>
          <div className="w-20 h-1 bg-[#b90e0a] mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Fast, reliable shipping across India</p>
        </div>

        {/* Shipping Overview */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white border border-black/5 rounded-2xl p-6 hover:border-[#b90e0a]/30 transition-all duration-300 shadow-sm">
            <Clock className="w-12 h-12 text-[#b90e0a] mb-4" />
            <h3 className="text-xl font-black mb-2 text-[#0a0a0a]">DELIVERY TIME</h3>
            <p className="text-gray-700 font-bold">5-7 business days</p>
            <p className="text-sm text-gray-500 mt-2">Average delivery time after order confirmation</p>
          </div>
          <div className="bg-white border border-black/5 rounded-2xl p-6 hover:border-[#b90e0a]/30 transition-all duration-300 shadow-sm">
            <MapPin className="w-12 h-12 text-[#b90e0a] mb-4" />
            <h3 className="text-xl font-black mb-2 text-[#0a0a0a]">SHIPPING COVERAGE</h3>
            <p className="text-gray-700 font-bold">All India</p>
            <p className="text-sm text-gray-500 mt-2">We ship to all serviceable pincodes across India</p>
          </div>
        </div>

        {/* Shipping Details */}
        <div className="bg-white border border-black/5 rounded-2xl p-6 md:p-8 mb-12 shadow-sm">
          <h2 className="text-2xl font-black mb-6 flex items-center gap-3 text-[#0a0a0a]">
            <Truck className="w-8 h-8 text-[#b90e0a]" />
            SHIPPING DETAILS
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-lg mb-2 text-[#0a0a0a]">Processing Time</h3>
              <p className="text-gray-600">Orders are processed within 1-2 business days after payment confirmation. You'll receive a confirmation email with tracking details once your order is shipped.</p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2 text-[#0a0a0a]">Shipping Charges</h3>
              <p className="text-gray-600 mb-2">Shipping charges are calculated at checkout based on your location and order value.</p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
                <strong>FREE SHIPPING</strong> on orders above ₹1,999
              </div>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2 text-[#0a0a0a]">Tracking Your Order</h3>
              <p className="text-gray-600">Once shipped, you'll receive a tracking number via email and WhatsApp. You can track your order status in the <span className="text-[#b90e0a] font-bold">Orders</span> section of your account or directly on the courier partner's website.</p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2 text-[#0a0a0a]">Delivery Partners</h3>
              <p className="text-gray-600">We work with trusted courier partners including Delhivery, Bluedart, and Shiprocket to ensure safe and timely delivery of your orders.</p>
            </div>
          </div>
        </div>

        {/* Delivery Guidelines */}
        <div className="bg-white border border-black/5 rounded-2xl p-6 md:p-8 mb-12 shadow-sm">
          <h2 className="text-2xl font-black mb-6 flex items-center gap-3 text-[#0a0a0a]">
            <Package className="w-8 h-8 text-[#b90e0a]" />
            DELIVERY GUIDELINES
          </h2>
          <div className="space-y-4 text-gray-600">
            {[
              { title: "Provide Accurate Address", desc: "Ensure your shipping address is complete and accurate to avoid delivery delays." },
              { title: "Be Available for Delivery", desc: "Someone should be available to receive the package. If unavailable, the courier will attempt redelivery or hold the package at the nearest facility." },
              { title: "Inspect Upon Delivery", desc: "Check your package for any visible damage before accepting delivery. If damaged, refuse the delivery and contact us immediately." },
              { title: "Keep Tracking Number Handy", desc: "Save your tracking number to monitor delivery progress and address any issues quickly." }
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

        {/* Important Notes */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 md:p-8">
          <h2 className="text-2xl font-black mb-4 flex items-center gap-3 text-[#0a0a0a]">
            <AlertCircle className="w-8 h-8 text-amber-600" />
            IMPORTANT NOTES
          </h2>
          <ul className="space-y-3 text-gray-700">
            {[
              "Delivery times may vary during peak seasons, festivals, or due to unforeseen circumstances.",
              "Remote or restricted areas may require additional delivery time.",
              "We are not responsible for delays caused by incorrect address information provided by the customer.",
              <>For shipping-related queries, contact us at <a href="mailto:support@kallkeyy.com" className="text-[#b90e0a] hover:underline">support@kallkeyy.com</a></>
            ].map((item, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-amber-600">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

    </div>
  );
}
