"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Truck,
  RotateCcw,
  Menu,
  X,
  LogOut,
  Star,
  Zap,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";
import { subscribeToNewsletter } from "@/services/subscriptionService";

// Import Product Data
import { KAAL_DRISHTA_DATA } from "./products/KaalDrishta";
import { SMARA_JIVITAM_DATA } from "./products/SmaraJivitam";
import { ANTAHA_YUGAYSA_DATA } from "./products/AntahaYugaysa";
import { MRITYO_BADDHA_DATA } from "./products/MrityoBaddha";

interface Props {
  onSelectProduct: (productId: string) => void;
  onBackToMain: () => void;
  onNavigateToShop?: () => void;
  onNavigateToAbout?: () => void;
  onNavigateToContact?: () => void;
  onNavigateToLogin: () => void;
  onNavigateToSignup: () => void;
  onNavigateToOrders?: () => void;
  onNavigateToSizeGuide?: () => void;
  onNavigateToShipping?: () => void;
  onNavigateToReturns?: () => void;
  onNavigateToFAQ?: () => void;
  onNavigateToPrivacyPolicy?: () => void;
  onNavigateToTermsOfService?: () => void;
  skipAnimations?: boolean;
}

const parsePrice = (priceStr: string) => {
  return parseInt(priceStr.replace(/[^0-9]/g, ""), 10);
};

const calculateDiscount = (price: string, originalPrice?: string) => {
  if (!originalPrice) return null;
  const p = parsePrice(price);
  const op = parsePrice(originalPrice);
  if (op <= p) return null;
  const discount = Math.round(((op - p) / op) * 100);
  return `${discount}% OFF`;
};

const productTeasers = [
  {
    id: "kaaldrishta",
    data: KAAL_DRISHTA_DATA,
    category: "Hoodies",
  },
  {
    id: "smarajivitam",
    data: SMARA_JIVITAM_DATA,
    category: "Tees",
  },
  {
    id: "antahayugaysa",
    data: ANTAHA_YUGAYSA_DATA,
    category: "Hoodies",
  },
  {
    id: "mrityobaddha",
    data: MRITYO_BADDHA_DATA,
    category: "Tees",
  },
];

// Featured products for carousel
const featuredProducts = [
  {
    id: "kaaldrishta",
    name: "KAAL-DRISHTA",
    tag: "Best Seller",
    price: "₹2,099",
    image: "/KaalDrishta-1.png",
  },
  {
    id: "smarajivitam",
    name: "SMARA-JIVITAM",
    tag: "Signature",
    price: "₹1,199",
    image: "/Smarajivitam-1.png",
  },
  {
    id: "antahayugaysa",
    name: "ANTAHA-YUGAYSA",
    tag: "New Drop",
    price: "₹1,999",
    image: "/Antahayugasya-1.png",
  },
  {
    id: "mrityobaddha",
    name: "MRITYO-BADDHA",
    tag: "Limited",
    price: "₹1,099",
    image: "/Mrityobaddha-1.png",
  },
];

const categories = [
  { id: "hoodies", name: "Premium Hoodies", image: "/KaalDrishta-2.png", count: "2 Items" },
  { id: "tees", name: "Oversized Tees", image: "/Smarajivitam-2.png", count: "2 Items" },
];

export default function HomePage({
  onSelectProduct,
  onBackToMain,
  onNavigateToShop,
  onNavigateToAbout,
  onNavigateToContact,
  onNavigateToLogin,
  onNavigateToSignup,
  onNavigateToOrders,
  onNavigateToSizeGuide,
  onNavigateToShipping,
  onNavigateToReturns,
  onNavigateToFAQ,
  onNavigateToPrivacyPolicy,
  onNavigateToTermsOfService,
  skipAnimations = false,
}: Props) {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  
  // Refs for scroll animations
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  // Intersection Observer for scroll animations
  useEffect(() => {
    if (skipAnimations) {
      // If animations are skipped, mark all sections as visible
      const allSections = Object.keys(sectionRefs.current);
      setVisibleSections(new Set(allSections));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set(prev).add(entry.target.id));
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      Object.values(sectionRefs.current).forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, [skipAnimations]);

  // Helper for unavailable pages
  const handleUnavailablePage = (pageName: string) => {
    toast({
      title: "Under Development",
      description: `The ${pageName} page is currently being developed. Check back soon!`,
      duration: 3000,
    });
  };

  const handleShopNavigate = () => {
    if (onNavigateToShop) onNavigateToShop();
    else handleUnavailablePage("Shop");
  };

  const formatDisplayName = (fullName: string): string => {
    if (!fullName) return "";
    const nameParts = fullName.trim().split(/\s+/);
    return nameParts[0].toUpperCase();
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!emailInput) {
      sonnerToast.error("Please enter your email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput)) {
      sonnerToast.error("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await subscribeToNewsletter(emailInput);

      if (response.success) {
        toast({
          title: "Welcome to the family! 🎉",
          description: response.message || "You'll be the first to know about new drops.",
          duration: 3000,
        });
        setEmailInput("");
      } else {
        sonnerToast.error(response.message || "Subscription failed");
      }
    } catch (error) {
      console.error("Subscription error:", error);
      sonnerToast.error(
        error instanceof Error ? error.message : "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-neutral-900 font-sans selection:bg-[#b90e0a] selection:text-white">
      {/* Coupon Code Block */}
      <div className="bg-[#333333] text-white text-center py-1.5 px-4 text-[10px] sm:text-xs font-bold tracking-widest uppercase z-[60] relative">
        Free Shipping on all pan-India orders · Code <span className="text-[#4CAF50]">KALLKEYY100</span> for ₹100 Off on your first order only
      </div>

      {/* Navigation - Shopify Style with Centered Links */}
      <nav className="sticky top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/95 backdrop-blur-md text-white">
        <div className="w-full px-5 sm:px-8 lg:px-24 py-3 lg:py-4">
          <div className="flex items-center justify-between max-w-[1600px] mx-auto">
            {/* LEFT: Text Logo */}
            <div className="flex-shrink-0 z-10">
              <h1
                className="text-xl sm:text-2xl lg:text-3xl font-black tracking-wider hover:text-[#b90e0a] transition-colors duration-300 cursor-pointer font-akira"
                onClick={onBackToMain}
              >
                KALLKEYY
              </h1>
            </div>

            {/* CENTER: Navigation Links (Shopify Style) */}
            <div className="hidden lg:flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2">
              <button
                onClick={onBackToMain}
                className="text-sm font-bold tracking-wide hover:text-[#b90e0a] transition-colors duration-300 whitespace-nowrap uppercase"
              >
                Home
              </button>
              <button
                onClick={handleShopNavigate}
                className="text-sm font-bold tracking-wide hover:text-[#b90e0a] transition-colors duration-300 whitespace-nowrap uppercase"
              >
                Shop
              </button>
              {user && (
                <button
                  onClick={() =>
                    onNavigateToOrders ? onNavigateToOrders() : handleUnavailablePage("Orders")
                  }
                  className="text-sm font-bold tracking-wide hover:text-[#b90e0a] transition-colors duration-300 whitespace-nowrap uppercase"
                >
                  Orders
                </button>
              )}
              <button
                onClick={() =>
                  onNavigateToAbout ? onNavigateToAbout() : handleUnavailablePage("About")
                }
                className="text-sm font-bold tracking-wide hover:text-[#b90e0a] transition-colors duration-300 whitespace-nowrap uppercase"
              >
                About
              </button>
              <button
                onClick={() =>
                  onNavigateToContact ? onNavigateToContact() : handleUnavailablePage("Contact")
                }
                className="text-sm font-bold tracking-wide hover:text-[#b90e0a] transition-colors duration-300 whitespace-nowrap uppercase"
              >
                Contact
              </button>
            </div>

            {/* RIGHT: Auth */}
            <div className="flex items-center gap-3 z-10">
              {/* Desktop Auth Buttons */}
              <div className="hidden lg:flex items-center gap-6">
                {user ? (
                  <>
                    <span className="text-white text-base font-medium flex items-center">
                      Hey,{" "}
                      <span className="text-[#b90e0a] ml-1 font-bold">
                        {formatDisplayName(user.name)}
                      </span>
                    </span>
                    <button
                      onClick={logout}
                      className="text-white hover:text-[#b90e0a] transition-colors duration-300 flex items-center gap-2 text-base font-medium"
                    >
                      <LogOut size={18} />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => onNavigateToLogin()}
                      className="text-white hover:text-[#b90e0a] transition-colors duration-300 text-base font-bold"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => onNavigateToSignup()}
                      className="bg-[#b90e0a] hover:bg-[#8a0a08] transition-colors duration-300 px-5 py-2.5 rounded-full text-base font-bold text-white"
                    >
                      Sign Up
                    </button>
                  </>
                )}
              </div>

              {/* Hamburger Menu Button (Mobile/Tablet) */}
              <button
                className="lg:hidden text-white hover:text-[#b90e0a] transition-colors p-1.5"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X size={20} className="sm:w-6 sm:h-6" />
                ) : (
                  <Menu size={20} className="sm:w-6 sm:h-6" />
                )}
              </button>
            </div>
          </div>

        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[100] animate-fadeIn">
          {/* Dark overlay background */}
          <div 
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Menu content */}
          <div className="relative h-full flex flex-col pt-16 px-5 pb-6 overflow-y-auto">
            {/* Close button */}
            <button
              className="absolute top-4 right-4 text-white hover:text-[#b90e0a] transition-colors p-1.5"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              <X size={24} />
            </button>

            {/* Navigation Links */}
            <div className="space-y-1">
              <button
                onClick={() => {
                  onBackToMain();
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left text-white hover:text-[#b90e0a] transition-colors duration-300 px-3 py-3 hover:bg-white/5 rounded-lg text-base font-bold"
              >
                Home
              </button>
              <button
                onClick={() => {
                  handleShopNavigate();
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left text-white hover:text-[#b90e0a] transition-colors duration-300 px-3 py-3 hover:bg-white/5 rounded-lg text-base font-bold"
              >
                Shop
              </button>
              {user && (
                <button
                  onClick={() => {
                    if (onNavigateToOrders) onNavigateToOrders();
                    else handleUnavailablePage("Orders");
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left text-white hover:text-[#b90e0a] transition-colors duration-300 px-3 py-3 hover:bg-white/5 rounded-lg text-base font-bold"
                >
                  Orders
                </button>
              )}
              <button
                onClick={() => {
                  if (onNavigateToAbout) onNavigateToAbout();
                  else handleUnavailablePage("About");
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left text-white hover:text-[#b90e0a] transition-colors duration-300 px-3 py-3 hover:bg-white/5 rounded-lg text-base font-bold"
              >
                About
              </button>
              <button
                onClick={() => {
                  if (onNavigateToContact) onNavigateToContact();
                  else handleUnavailablePage("Contact");
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left text-white hover:text-[#b90e0a] transition-colors duration-300 px-3 py-3 hover:bg-white/5 rounded-lg text-base font-bold"
              >
                Contact
              </button>
            </div>

            {/* AUTH SECTION - Mobile */}
            <div className="border-t border-white/20 pt-4 mt-4">
              {user ? (
                <>
                  <div className="text-white px-3 py-2 mb-1 text-sm font-medium">
                    Hey, <span className="text-[#b90e0a] font-bold">{formatDisplayName(user.name)}</span>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-left text-white hover:text-[#b90e0a] transition-colors duration-300 px-3 py-3 hover:bg-white/5 rounded-lg flex items-center gap-2 text-base font-bold"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </>
              ) : (
                <div className="space-y-2 px-3">
                  <button
                    onClick={() => {
                      onNavigateToLogin();
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-center text-white hover:text-[#b90e0a] transition-colors duration-300 py-3 border border-white/20 rounded-full text-sm font-bold"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      onNavigateToSignup();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full bg-[#b90e0a] hover:bg-[#8a0a08] transition-colors duration-300 py-3 rounded-full text-center text-sm font-bold text-white"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <main>
        {/* Hero Section - Streetwear Redefined */}
        <section 
          id="hero"
          ref={(el) => {
            if (el) sectionRefs.current["hero"] = el;
          }}
          className={`relative px-5 sm:px-8 lg:px-12 max-w-[1600px] mx-auto mb-12 sm:mb-16 lg:mb-24 pt-8 sm:pt-12 lg:pt-16 transition-all duration-1000 ${
            visibleSections.has("hero") || skipAnimations
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
          }`}
        >
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 xl:gap-24 items-center">
            <div className="order-2 lg:order-1 space-y-3 sm:space-y-4 lg:space-y-6 lg:pl-12 xl:pl-20">
              <div className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 bg-white border-2 border-neutral-200 rounded-full text-[10px] sm:text-xs font-bold tracking-wider text-neutral-700 uppercase shadow-sm">
                <Sparkles size={12} className="text-[#b90e0a] sm:w-3.5 sm:h-3.5" />
                New Collection Live
              </div>
              <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-[0.92] tracking-tight font-akira text-[#0a0a0a]">
                STREETWEAR <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#b90e0a] to-[#8a0a08]">
                  REDEFINED.
                </span>
              </h2>
              <p className="text-xs sm:text-sm md:text-base lg:text-lg text-[#2a2a2a] max-w-xl leading-relaxed font-medium">
                Premium hoodies. Mythological roots. Modern silhouettes.
                Experience the first act of KALLKEYY.
              </p>
              <div className="flex flex-wrap gap-3 sm:gap-4">
                <Button
                  onClick={handleShopNavigate}
                  className="bg-[#0a0a0a] hover:bg-[#b90e0a] text-white px-5 sm:px-7 lg:px-8 py-3 sm:py-4 lg:py-5 text-xs sm:text-sm lg:text-base font-bold tracking-wider rounded-full transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  SHOP COLLECTION
                </Button>
                <Button
                  onClick={() => onSelectProduct("kaaldrishta")}
                  variant="outline"
                  className="border-2 border-[#0a0a0a] text-[#0a0a0a] hover:bg-[#0a0a0a] hover:text-white px-5 sm:px-7 lg:px-8 py-3 sm:py-4 lg:py-5 text-xs sm:text-sm lg:text-base font-bold tracking-wider rounded-full transition-all duration-300"
                >
                  VIEW LOOKBOOK
                </Button>
              </div>
              <div className="flex items-center gap-4 sm:gap-6 lg:gap-8 pt-2 sm:pt-4 text-[10px] sm:text-xs lg:text-sm font-bold text-[#4a4a4a] uppercase tracking-wider">
                <div className="flex items-center gap-1.5">
                  <Star size={12} className="text-[#b90e0a] sm:w-[14px] sm:h-[14px]" />
                  Premium Quality
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap size={12} className="text-[#b90e0a] sm:w-[14px] sm:h-[14px]" />
                  Limited Drops
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2 relative w-full max-w-[220px] sm:max-w-[300px] lg:max-w-[380px] mx-auto">
              {/* Carousel Container */}
              <div className="relative">
                {/* Background accent */}
                <div className="absolute inset-0 bg-[#b90e0a] rounded-xl sm:rounded-2xl rotate-3 opacity-10 transition-transform duration-500"></div>
                
                {/* Product Image Card */}
                <div 
                  className="relative bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-lg sm:shadow-xl border border-neutral-100 aspect-[4/5] cursor-pointer group"
                  onClick={() => onSelectProduct(featuredProducts[currentProductIndex].id)}
                >
                  {/* Product Image with transition */}
                  <div className="relative w-full h-full">
                    {featuredProducts.map((product, index) => (
                      <img
                        key={product.id}
                        src={product.image}
                        alt={product.name}
                        className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-500 lg:group-hover:scale-105 ${
                          index === currentProductIndex 
                            ? "opacity-100 scale-100" 
                            : "opacity-0 scale-105"
                        }`}
                        loading={index === 0 ? "eager" : "lazy"}
                      />
                    ))}
                  </div>
                  
                  {/* Product Info Overlay - Always visible on mobile, hover on desktop */}
                  <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 bg-white/95 backdrop-blur-sm p-3 sm:p-4 rounded-lg border border-white/20 shadow-lg transform translate-y-0 opacity-100 lg:translate-y-2 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 transition-all duration-300">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-[10px] sm:text-xs font-bold text-[#b90e0a] uppercase tracking-wider mb-0.5">
                          {featuredProducts[currentProductIndex].tag}
                        </p>
                        <h3 className="text-sm sm:text-lg font-black font-akira text-[#0a0a0a]">
                          {featuredProducts[currentProductIndex].name}
                        </h3>
                      </div>
                      <span className="text-sm sm:text-lg font-black text-[#0a0a0a]">
                        {featuredProducts[currentProductIndex].price}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Navigation Arrows */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentProductIndex(currentProductIndex === 0 ? featuredProducts.length - 1 : currentProductIndex - 1);
                  }}
                  aria-label="Previous product"
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 bg-white hover:bg-[#b90e0a] hover:text-white text-[#0a0a0a] p-2 sm:p-2.5 rounded-full transition-all duration-300 hover:scale-110 z-20 shadow-lg border border-neutral-100"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentProductIndex(currentProductIndex === featuredProducts.length - 1 ? 0 : currentProductIndex + 1);
                  }}
                  aria-label="Next product"
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 bg-white hover:bg-[#b90e0a] hover:text-white text-[#0a0a0a] p-2 sm:p-2.5 rounded-full transition-all duration-300 hover:scale-110 z-20 shadow-lg border border-neutral-100"
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
              
              {/* Carousel Indicators */}
              <div className="flex justify-center gap-1.5 mt-4">
                {featuredProducts.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentProductIndex(idx)}
                    aria-label={`Go to product ${idx + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      idx === currentProductIndex
                        ? "w-6 bg-[#b90e0a]"
                        : "w-1.5 bg-neutral-300 hover:bg-neutral-400"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section 
          id="categories"
          ref={(el) => {
            if (el) sectionRefs.current["categories"] = el;
          }}
          className={`px-5 sm:px-8 lg:px-12 max-w-[1600px] mx-auto mb-12 sm:mb-16 lg:mb-24 transition-all duration-1000 delay-200 ${
            visibleSections.has("categories") || skipAnimations
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
          }`}
        >
          <div className="flex items-end justify-between mb-5 sm:mb-8 lg:mb-12">
            <div>
              <h3 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-black font-akira mb-1 sm:mb-2 text-[#0a0a0a]">SHOP BY CATEGORY</h3>
              <p className="text-[#4a4a4a] text-xs sm:text-sm lg:text-base font-medium">Essentials for your rotation.</p>
            </div>
            <button
              onClick={handleShopNavigate}
              className="flex items-center gap-1.5 lg:gap-2 text-xs lg:text-sm font-bold text-[#0a0a0a] hover:text-[#b90e0a] transition-colors group"
            >
              VIEW ALL
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform lg:w-4 lg:h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="group relative h-[160px] sm:h-[280px] md:h-[340px] lg:h-[400px] overflow-hidden bg-white cursor-pointer rounded-lg sm:rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300"
                onClick={handleShopNavigate}
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent group-hover:from-black/80 transition-colors" />
                <div className="absolute inset-0 p-3 sm:p-4 lg:p-6 flex flex-col justify-end text-white">
                  <h4 className="text-base sm:text-xl md:text-2xl lg:text-3xl font-black font-akira uppercase tracking-wide mb-1 sm:mb-2 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    {cat.name}
                  </h4>
                  <p className="text-[10px] sm:text-sm lg:text-base font-semibold translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 delay-75">
                    {cat.count}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Collection */}
        <section 
          id="collection"
          ref={(el) => {
            if (el) sectionRefs.current["collection"] = el;
          }}
          className={`bg-white py-10 sm:py-16 lg:py-24 transition-all duration-1000 delay-300 ${
            visibleSections.has("collection") || skipAnimations
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
          }`}
        >
          <div className="px-5 sm:px-8 lg:px-12 max-w-[1600px] mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-10 lg:mb-14">
              <span className="text-[#b90e0a] font-bold tracking-[0.12em] sm:tracking-[0.15em] text-[10px] sm:text-xs uppercase mb-2 sm:mb-3 block">
                The Collection
              </span>
              <h3 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black font-akira mb-2 sm:mb-4 lg:mb-5 text-[#0a0a0a]">ASTITVA ACT-I</h3>
              <p className="text-xs sm:text-sm md:text-base lg:text-lg text-[#2a2a2a] leading-relaxed font-medium px-2">
                The debut drop. Inspired by the duality of existence. Crafted for those who walk the
                path less taken.
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
              {productTeasers.map((product) => {
                const discount = calculateDiscount(product.data.price, product.data.originalPrice);
                return (
                  <div key={product.id} className="group cursor-pointer bg-white rounded-lg sm:rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300" onClick={() => onSelectProduct(product.id)}>
                    {/* Product Image */}
                    <div className="relative bg-[#f5f5f5] aspect-square overflow-hidden">
                      <div className="absolute top-1.5 sm:top-2 left-1.5 sm:left-2 z-10 flex flex-col gap-1 sm:gap-1.5 items-start">
                        {discount && (
                          <Badge className="relative overflow-hidden bg-gradient-to-t from-[#2E7D32] via-[#4CAF50] to-[#66BB6A] text-white border-none shadow-md font-black tracking-wider rounded-full uppercase text-[7px] sm:text-[9px] px-1.5 sm:px-2 py-0.5 sm:py-1 transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg before:absolute before:inset-0 before:bg-gradient-to-t before:from-transparent before:via-white/30 before:to-transparent before:translate-y-full hover:before:translate-y-[-100%] before:transition-transform before:duration-700">
                            {discount}
                          </Badge>
                        )}
                        <Badge className="bg-white text-[#0a0a0a] hover:bg-white border-none shadow-sm font-bold tracking-wider rounded-full uppercase text-[6px] sm:text-[8px] px-1.5 sm:px-2 py-0.5">
                          {product.data.tag}
                        </Badge>
                      </div>
                      <img
                        src={product.data.images[0]}
                        alt={product.data.name}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      {/* Hover overlay for "View Details" */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <span className="text-white font-bold text-[10px] sm:text-xs tracking-wider uppercase bg-[#b90e0a] px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
                          View Details
                        </span>
                      </div>
                    </div>
                    {/* Product Info */}
                    <div className="p-2 sm:p-3">
                      <h4 className="text-[10px] sm:text-xs md:text-sm font-bold font-akira group-hover:text-[#b90e0a] transition-colors text-[#0a0a0a] truncate">
                        {product.data.name}
                      </h4>
                      <p className="text-[8px] sm:text-[10px] md:text-xs text-[#4a4a4a] font-semibold mt-0.5 mb-1 sm:mb-1.5">{product.category}</p>
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-xs sm:text-sm md:text-base text-[#0a0a0a]">{product.data.price}</span>
                        {product.data.originalPrice && (
                          <span className="text-[8px] sm:text-[10px] md:text-xs text-[#6a6a6a] line-through">{product.data.originalPrice}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Features / Pillars */}
        <section 
          id="features"
          ref={(el) => {
            if (el) sectionRefs.current["features"] = el;
          }}
          className={`px-5 sm:px-8 lg:px-12 max-w-[1600px] mx-auto py-10 sm:py-16 lg:py-24 border-t border-neutral-200 transition-all duration-1000 delay-400 ${
            visibleSections.has("features") || skipAnimations
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
          }`}
        >
          <div className="grid grid-cols-3 gap-3 sm:gap-6 lg:gap-12">
            <div className="text-center space-y-2 sm:space-y-3 lg:space-y-4 px-1 sm:px-3 lg:px-4">
              <div className="w-10 h-10 sm:w-14 sm:h-14 lg:w-18 lg:h-18 bg-white rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-4 lg:mb-6 shadow-md border-2 border-neutral-100 text-[#b90e0a]">
                <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
              </div>
              <h4 className="text-[9px] sm:text-sm md:text-base lg:text-lg font-black font-akira text-[#0a0a0a]">PREMIUM QUALITY</h4>
              <p className="text-[8px] sm:text-xs lg:text-sm text-[#2a2a2a] leading-relaxed font-medium">
                350gsm French Terry cotton. Double-stitched seams. Built to last.
              </p>
            </div>
            <div className="text-center space-y-2 sm:space-y-3 lg:space-y-4 px-1 sm:px-3 lg:px-4 border-l border-r border-neutral-200">
              <div className="w-10 h-10 sm:w-14 sm:h-14 lg:w-18 lg:h-18 bg-white rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-4 lg:mb-6 shadow-md border-2 border-neutral-100 text-[#b90e0a]">
                <Truck className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
              </div>
              <h4 className="text-[9px] sm:text-sm md:text-base lg:text-lg font-black font-akira text-[#0a0a0a]">FREE SHIPPING</h4>
              <p className="text-[8px] sm:text-xs lg:text-sm text-[#2a2a2a] leading-relaxed font-medium">
                Pan-India shipping on all orders. Track every step.
              </p>
            </div>
            <div className="text-center space-y-2 sm:space-y-3 lg:space-y-4 px-1 sm:px-3 lg:px-4">
              <div className="w-10 h-10 sm:w-14 sm:h-14 lg:w-18 lg:h-18 bg-white rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-4 lg:mb-6 shadow-md border-2 border-neutral-100 text-[#b90e0a]">
                <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
              </div>
              <h4 className="text-[9px] sm:text-sm md:text-base lg:text-lg font-black font-akira text-[#0a0a0a]">EASY RETURNS</h4>
              <p className="text-[8px] sm:text-xs lg:text-sm text-[#2a2a2a] leading-relaxed font-medium">
                3-day hassle-free returns. We'll make it right.
              </p>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section 
          id="newsletter"
          ref={(el) => {
            if (el) sectionRefs.current["newsletter"] = el;
          }}
          className={`bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a] text-white py-10 sm:py-16 lg:py-24 relative overflow-hidden border-t border-neutral-800 transition-all duration-1000 delay-500 ${
            visibleSections.has("newsletter") || skipAnimations
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
          }`}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(185,14,10,0.1),transparent_50%)]"></div>
          <div className="px-5 sm:px-8 lg:px-12 max-w-[1600px] mx-auto text-center relative z-10">
            <div className="max-w-2xl mx-auto">
              <h3 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black font-akira mb-2 sm:mb-4 lg:mb-6 leading-tight">
                JOIN THE <span className="text-[#b90e0a]">MOVEMENT</span>
              </h3>
              <p className="text-gray-300 max-w-xl mx-auto mb-5 sm:mb-8 lg:mb-10 text-xs sm:text-sm md:text-base lg:text-lg font-medium leading-relaxed px-2">
                Sign up for early access to drops, exclusive discounts, and behind-the-scenes content.
              </p>
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2 sm:gap-3 max-w-xl mx-auto px-2">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="flex-1 bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white placeholder:text-gray-400 px-4 sm:px-6 py-3 sm:py-4 lg:py-4 text-xs sm:text-sm lg:text-base outline-none focus:border-[#b90e0a] transition-all duration-300 rounded-full"
                />
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#b90e0a] hover:bg-[#8a0a08] text-white font-bold px-5 sm:px-8 py-3 sm:py-4 lg:py-4 tracking-wider transition-all duration-300 disabled:opacity-70 rounded-full text-xs sm:text-sm lg:text-base shadow-lg hover:shadow-xl"
                >
                  {isSubmitting ? "SUBSCRIBING..." : "SUBSCRIBE"}
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#111] text-white py-8 sm:py-12 lg:py-16 px-5 sm:px-8 lg:px-12 border-t border-white/10">
        <div className="max-w-[1600px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 lg:gap-12">
          <div className="col-span-2 md:col-span-1 space-y-3 sm:space-y-4">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black font-akira tracking-wider">KALLKEYY</h2>
            <p className="text-gray-400 text-[10px] sm:text-xs lg:text-sm leading-relaxed">
              Redefining streetwear with bold designs and premium quality. 
              Wear your identity.
            </p>
          </div>
          
          <div>
            <h3 className="font-bold text-xs sm:text-sm lg:text-base mb-3 sm:mb-4 lg:mb-5 tracking-wide">SHOP</h3>
            <ul className="space-y-1.5 sm:space-y-2 lg:space-y-3 text-gray-400 text-[10px] sm:text-xs lg:text-sm">
              <li><button onClick={handleShopNavigate} className="hover:text-[#b90e0a] transition-colors">All Products</button></li>
              <li><button onClick={handleShopNavigate} className="hover:text-[#b90e0a] transition-colors">New Arrivals</button></li>
              <li><button onClick={handleShopNavigate} className="hover:text-[#b90e0a] transition-colors">Best Sellers</button></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-xs sm:text-sm lg:text-base mb-3 sm:mb-4 lg:mb-5 tracking-wide">SUPPORT</h3>
            <ul className="space-y-1.5 sm:space-y-2 lg:space-y-3 text-gray-400 text-[10px] sm:text-xs lg:text-sm">
              <li><button onClick={() => onNavigateToOrders?.()} className="hover:text-[#b90e0a] transition-colors">Track Order</button></li>
              <li><button onClick={() => onNavigateToShipping?.()} className="hover:text-[#b90e0a] transition-colors">Shipping Info</button></li>
              <li><button onClick={() => onNavigateToReturns?.()} className="hover:text-[#b90e0a] transition-colors">Returns</button></li>
              <li><button onClick={() => onNavigateToSizeGuide?.()} className="hover:text-[#b90e0a] transition-colors">Size Guide</button></li>
              <li><button onClick={() => onNavigateToFAQ?.()} className="hover:text-[#b90e0a] transition-colors">FAQs</button></li>
              <li><button onClick={() => onNavigateToContact?.()} className="hover:text-[#b90e0a] transition-colors">Contact Us</button></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-xs sm:text-sm lg:text-base mb-3 sm:mb-4 lg:mb-5 tracking-wide">LEGAL</h3>
            <ul className="space-y-1.5 sm:space-y-2 lg:space-y-3 text-gray-400 text-[10px] sm:text-xs lg:text-sm">
              <li><button onClick={() => onNavigateToPrivacyPolicy?.()} className="hover:text-[#b90e0a] transition-colors">Privacy Policy</button></li>
              <li><button onClick={() => onNavigateToTermsOfService?.()} className="hover:text-[#b90e0a] transition-colors">Terms of Service</button></li>
            </ul>
          </div>
        </div>

        <div className="max-w-[1600px] mx-auto mt-6 sm:mt-8 lg:mt-12 pt-4 sm:pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-2 sm:gap-3">
          <p className="text-gray-400 text-[9px] sm:text-[10px] lg:text-xs">© {new Date().getFullYear()} KALLKEYY. All rights reserved.</p>
          <p className="text-gray-400 text-[9px] sm:text-[10px] lg:text-xs flex items-center gap-1">
            Designed in India. Built for the world.
          </p>
        </div>
      </footer>
    </div>
  );
}
