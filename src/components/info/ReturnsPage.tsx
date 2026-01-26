"use client";

import { useState } from "react";
import { RotateCcw, XCircle, CheckCircle, AlertTriangle, Clock, Menu, X, LogOut } from "lucide-react";
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

export default function ReturnsPage({
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
          <span className="text-[#b90e0a] font-medium">Returns & Exchanges</span>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black mb-4 font-akira text-[#0a0a0a]">
            RETURNS & <span className="text-[#b90e0a]">EXCHANGES</span>
          </h1>
          <div className="w-20 h-1 bg-[#b90e0a] mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">We want you to love your KALLKEYY purchase</p>
        </div>

        {/* Return Window */}
        <div className="bg-gradient-to-r from-[#b90e0a]/10 to-[#b90e0a]/5 border-2 border-[#b90e0a] rounded-2xl p-8 mb-12 text-center">
          <Clock className="w-16 h-16 text-[#b90e0a] mx-auto mb-4" />
          <h2 className="text-3xl font-black mb-2 text-[#0a0a0a]">3-DAY RETURN WINDOW</h2>
          <p className="text-xl text-gray-700">Returns are accepted within <span className="text-[#b90e0a] font-bold">3 days</span> after delivery</p>
        </div>

        {/* Eligibility Criteria */}
        <div className="bg-white border border-black/5 rounded-2xl p-6 md:p-8 mb-12 shadow-sm">
          <h2 className="text-2xl font-black mb-6 flex items-center gap-3 text-[#0a0a0a]">
            <CheckCircle className="w-8 h-8 text-green-500" />
            RETURN ELIGIBILITY
          </h2>
          <div className="space-y-4">
            {[
              { title: "Item is Unworn", desc: "Products must be unworn, unwashed, and in original condition with all tags attached." },
              { title: "Original Packaging", desc: "Item must be returned in original packaging along with all accessories and invoices." },
              { title: "Within Return Window", desc: "Return request must be initiated within 3 days of delivery." },
              { title: "No Signs of Damage", desc: "Items should not have any stains, odors, pet hair, or damage caused by the customer." }
            ].map((item, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm">✓</span>
                </div>
                <div>
                  <h3 className="font-bold text-[#0a0a0a] mb-1">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Non-Returnable Items */}
        <div className="bg-white border border-red-200 rounded-2xl p-6 md:p-8 mb-12 shadow-sm">
          <h2 className="text-2xl font-black mb-6 flex items-center gap-3 text-[#0a0a0a]">
            <XCircle className="w-8 h-8 text-red-500" />
            NON-RETURNABLE ITEMS
          </h2>
          <div className="space-y-3 text-gray-700">
            {[
              "Items with removed or tampered tags",
              "Worn, washed, or altered products",
              "Products returned after the 3-day window",
              "Items damaged due to misuse or improper care",
              "Sale or clearance items (unless defective)"
            ].map((item, i) => (
              <div key={i} className="flex gap-2">
                <span className="text-red-500">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Return Process */}
        <div className="bg-white border border-black/5 rounded-2xl p-6 md:p-8 mb-12 shadow-sm">
          <h2 className="text-2xl font-black mb-6 flex items-center gap-3 text-[#0a0a0a]">
            <RotateCcw className="w-8 h-8 text-[#b90e0a]" />
            HOW TO RETURN
          </h2>
          <div className="space-y-6">
            {[
              { title: "Initiate Return Request", desc: <>Log in to your account, go to <span className="text-[#b90e0a] font-bold">Orders</span>, select the order, and click "Request Return". Provide reason for return.</> },
              { title: "Approval & Pickup", desc: "Once approved, we'll schedule a pickup from your address. Keep the item ready in its original packaging." },
              { title: "Quality Check", desc: "Returned items undergo a quality check to ensure they meet return eligibility criteria." },
              { title: "Refund Processing", desc: "Once approved, refund will be processed within 5-7 business days to your original payment method." }
            ].map((item, i) => (
              <div key={i} className="flex gap-4">
                <span className="flex-shrink-0 w-10 h-10 bg-[#b90e0a] rounded-full flex items-center justify-center font-bold text-white">{i + 1}</span>
                <div>
                  <h3 className="font-bold text-[#0a0a0a] mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Exchange Policy */}
        <div className="bg-white border border-black/5 rounded-2xl p-6 md:p-8 mb-12 shadow-sm">
          <h2 className="text-2xl font-black mb-6 text-[#0a0a0a]">EXCHANGE POLICY</h2>
          <div className="space-y-4 text-gray-700">
            <p>We currently do not offer direct exchanges. If you need a different size or product, please return the original item and place a new order.</p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
              <strong className="text-blue-700">Pro Tip:</strong> To ensure you get the size you want, check our <span className="text-[#b90e0a] font-bold">Size Guide</span> before ordering.
            </div>
          </div>
        </div>

        {/* Important Information */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 md:p-8">
          <h2 className="text-2xl font-black mb-4 flex items-center gap-3 text-[#0a0a0a]">
            <AlertTriangle className="w-8 h-8 text-amber-600" />
            IMPORTANT INFORMATION
          </h2>
          <ul className="space-y-3 text-gray-700">
            {[
              "Return shipping is free for defective items or wrong products sent. For other returns, shipping charges may apply.",
              "Refunds will be initiated only after the returned item passes quality inspection.",
              "The 3-day return window starts from the date of delivery, not the date of order.",
              <>For any return-related queries, contact us at <a href="mailto:support@kallkeyy.com" className="text-[#b90e0a] hover:underline">support@kallkeyy.com</a></>
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
