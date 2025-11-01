"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  ArrowRight,
  Star,
  Shield,
  Zap,
  Heart,
  TrendingUp,
  Instagram,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";
import { subscribeToNewsletter } from "@/services/subscriptionService";
import { InstagramEmbed } from "react-social-media-embed";
import { useAuth } from "../contexts/AuthContext";
import { LogOut } from "lucide-react";

interface HeroSlide {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  description: string;
  tag: string;
  price: string;
  isUpcoming: boolean;
  buttonText: string;
  buttonAction: "product" | "scroll";
}

interface InstagramReel {
  id: string;
  url: string;
}

interface Product {
  id: string;
  name: string;
  image: string;
  price: string;
  tag: string;
  description: string;
  features: string[];
  category: string;
}

interface FeatureCard {
  icon: JSX.Element;
  title: string;
  description: string;
  highlight: string;
}

const heroSlides: HeroSlide[] = [
  // Slide 1: Astitva Act I Collection - SCROLLS TO PRODUCTS
  {
    id: "collection",
    image: "/astitva.png",
    title: "ASTITVA ACT-I",
    subtitle: "The First Chapter of Existence",
    description:
      "A curated collection of 4 divine drops. Where streetwear meets mythology. Limited edition pieces that define your identity.",
    tag: "COLLECTION",
    price: "STARTING ₹1,299",
    isUpcoming: false,
    buttonText: "EXPLORE COLLECTION",
    buttonAction: "scroll",
  },
  // Slide 2: KaalDrishta Flagship Hoodie - NAVIGATES TO PRODUCT PAGE
  {
    id: "kaaldrishta",
    image: "/KaalDrishta-1.png",
    title: "KAAL-DRISHTA",
    subtitle: "The Blazing Eye That Never Blinks",
    description:
      "Born from the ashes of forgotten gods. Our flagship oversized premium hoodie with divine graphics. The crown jewel of Astitva Act-I.",
    tag: "FLAGSHIP",
    price: "₹2,499",
    isUpcoming: false,
    buttonText: "SHOP NOW",
    buttonAction: "product",
  },
  // Slide 3: LAUNCH SALE - SCROLLS TO PRODUCTS
  {
    id: "sale",
    image: "/Antahayugasya-1.png",
    title: "🔥 LAUNCH SALE 🔥",
    subtitle: "EXCLUSIVE LAUNCH PRICES!",
    description:
      "Premium hoodies starting at ₹2,499 | T-Shirts starting at ₹1,299. FREE SHIPPING on all orders! Use code KALLKEYY10 at checkout for an additional 10% discount. Don't Miss Out! 💥",
    tag: "LIVE NOW",
    price: "HOODIES ₹2,499 | T-SHIRTS ₹1,299",
    isUpcoming: false,
    buttonText: "SHOP NOW",
    buttonAction: "scroll",
  },
  // Slide 4: Smara-Jivitam Signature T-Shirt - NAVIGATES TO PRODUCT PAGE
  {
    id: "smarajivitam",
    image: "/Smarajivitam-1.png",
    title: "SMARA-JIVITAM",
    subtitle: "The Signature Tee of KALLKEYY",
    description:
      "Wings erupt from chaos, forged in will and fire. Our signature oversized tee that started it all. Premium 240gsm French Terry Cotton.",
    tag: "SIGNATURE",
    price: "₹1,299",
    isUpcoming: false,
    buttonText: "GET YOURS NOW",
    buttonAction: "product",
  },
];

const instagramReels: InstagramReel[] = [
  {
    id: "reel-1",
    url: "https://www.instagram.com/p/DPWokNfAVAm/", // Replace with actual URL
  },
  {
    id: "reel-2",
    url: "https://www.instagram.com/p/DNn6WNjBf-T/", // Replace with actual URL
  },
  {
    id: "reel-3",
    url: "https://www.instagram.com/p/DQHhLP3AT1G/", // Replace with actual URL
  },
  {
    id: "reel-4",
    url: "https://www.instagram.com/p/DPrIkFXkdKW/", // Replace with actual URL
  },
];

const products: Product[] = [
  {
    id: "kaaldrishta",
    name: "KAAL-DRISHTA",
    image: "/KaalDrishta-1.png",
    price: "₹2,499",
    tag: "FLAGSHIP",
    description:
      "The blazing eye that never blinks. Born from the ashes of forgotten gods.",
    features: [
      "Oversized unisex fit",
      "350gsm comfortable fabric",
      "Boxy fit with drop shoulders",
      "Premium screen-printed graphics",
    ],
    category: "Hoodies",
  },
  {
    id: "smarajivitam",
    name: "SMARA-JIVITAM",
    image: "/Smarajivitam-1.png",
    price: "₹1,299",
    tag: "NEW DROP",
    description:
      "The Ascension. Wings erupt from chaos, forged in will and fire.",
    features: [
      "Oversized unisex fit",
      "240gsm French Terry Cotton",
      "Boxy fit with drop shoulders",
      "Premium artwork",
    ],
    category: "T-Shirts",
  },
  {
    id: "antahayugaysa",
    name: "ANTAHA-YUGAYSA",
    image: "/Antahayugasya-1.png",
    price: "₹2,499",
    tag: "NEW LAUNCH",
    description:
      "Hands of God. Where endings wear eternity, and creation remembers its own destruction.",
    features: [
      "Oversized unisex fit",
      "350gsm comfortable fabric",
      "Boxy fit with drop shoulders",
      "Divine graphics",
    ],
    category: "Hoodies",
  },
  {
    id: "mrityobaddha",
    name: "MRITYO-BADDHA",
    image: "/Mrityobaddha-1.png",
    price: "₹1,299",
    tag: "TRENDING",
    description:
      "Bound by Death. A graphic tee that embodies the struggle against mortality.",
    features: [
      "Oversized unisex fit",
      "240gsm French Terry Cotton",
      "Boxy fit with drop shoulders",
      "Exclusive graphics",
    ],
    category: "T-Shirts",
  },
];

const featureCards: FeatureCard[] = [
  {
    icon: <Shield className="w-8 h-8" />,
    title: "PREMIUM QUALITY",
    description:
      "We don’t chase trends — we craft longevity. Every Kallkeyy piece is built to feel heavy, last longer, and age better with time. From reinforced stitching to custom fabrics, quality isn’t a feature — it’s our foundation.",
    highlight: "Heavyweight fabrics & reinforced stitching",
  },
  {
    icon: <Zap className="w-8 h-8" />,
    title: "LIMITED DROPS",
    description:
      "We believe exclusivity builds identity. Each drop is limited, deliberate, and designed to sell out, ensuring that what you wear stays rare and personal — not mass-produced noise.",
    highlight: "Small batches, high demand",
  },
  {
    icon: <Star className="w-8 h-8" />,
    title: "AUTHENTIC DESIGN",
    description:
      "No fake hype. No borrowed ideas. Kallkeyy represents real street culture, blending raw energy with clean design. Every silhouette, print, and stitch carries intent, attitude, and originality.",
    highlight: "Born from the streets",
  },
  {
    icon: <Heart className="w-8 h-8" />,
    title: "COMMUNITY FIRST",
    description:
      "Kallkeyy isn’t a brand — it’s a movement. We grow with the culture, not above it. From feedback to collabs, your voice defines the direction — because the streets decide what’s real.",
    highlight: "Your voice shapes our brand",
  },
];

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

export default function ProductMenuPage({
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const { user, logout } = useAuth();

  // Get unique categories
  const categories = [
    "All",
    ...Array.from(new Set(products.map((p) => p.category))),
  ];

  // Filter products by category
  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 8000); // Increased to 8 seconds for better readability
    return () => clearInterval(interval);
  }, []);

  const handleSlideClick = (slide: HeroSlide) => {
    if (slide.isUpcoming) {
      toast({
        title: "Drop Alert! 🔥",
        description:
          "This exclusive drop is launching soon. Follow us on Instagram for updates!",
        duration: 3000,
      });
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
      onSelectProduct(slide.id);
    }
  };

  const handleUnavailablePage = (pageName: string) => {
    toast({
      title: "Under Development",
      description: `The ${pageName} page is currently being developed. Check back soon!`,
      duration: 3000,
    });
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!emailInput) {
      sonnerToast.error("Please enter your email address");
      return;
    }

    // Basic email validation
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
          description:
            response.message || "You'll be the first to know about new drops.",
          duration: 3000,
        });
        setEmailInput(""); // Clear the input
      } else {
        sonnerToast.error(response.message || "Subscription failed");
      }
    } catch (error) {
      console.error("Subscription error:", error);
      sonnerToast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
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

  return (
    <div className={`min-h-screen bg-black text-white relative overflow-x-hidden ${skipAnimations ? '[&_*]:!animate-none' : ''}`}>
      {/* BACKGROUND DECORATIONS */}
      <div className="fixed inset-0 pointer-events-none opacity-10 z-0">
        {/* Chain links pattern */}
        {[...Array(8)].map((_, i) => (
          <div
            key={`chain-${i}`}
            className="absolute animate-float-chain"
            style={{
              top: `${(i * 15) % 100}%`,
              left: `${(i * 20) % 100}%`,
              animationDelay: `${i * 0.3}s`,
            }}
          >
            <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
              <circle cx="15" cy="30" r="12" stroke="white" strokeWidth="2" />
              <circle cx="45" cy="30" r="12" stroke="white" strokeWidth="2" />
              <line
                x1="27"
                y1="30"
                x2="33"
                y2="30"
                stroke="white"
                strokeWidth="2"
              />
            </svg>
          </div>
        ))}

        {/* Diagonal lines */}
        <div className="absolute top-0 left-0 w-full h-full">
          {[...Array(12)].map((_, i) => (
            <div
              key={`line-${i}`}
              className="absolute h-px bg-white/5"
              style={{
                top: `${i * 8}%`,
                left: 0,
                right: 0,
                transform: `rotate(${i * 3}deg)`,
              }}
            />
          ))}
        </div>
      </div>

      {/* NAVBAR - UNCHANGED */}
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

      {/* FULL-WIDTH HERO SLIDESHOW */}
      <div className="relative h-[500px] sm:h-[600px] md:h-[700px] lg:h-[750px] overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-1000 ${
              index === currentSlide
                ? "opacity-100 scale-100 z-10"
                : "opacity-0 scale-105 pointer-events-none z-0"
            }`}
          >
            {/* Background Image */}
            <div className="absolute inset-0 pointer-events-none bg-black">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-contain"
                style={{
                  objectPosition: "center center",
                }}
                onError={(e) =>
                  ((e.currentTarget as HTMLImageElement).style.opacity = "0")
                }
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/80 to-black/40 md:from-black md:via-black/70 md:to-transparent" />
            </div>

            {/* Content - WITH PROPER Z-INDEX AND POINTER EVENTS */}
            <div className="relative h-full flex items-center z-10 pointer-events-none">
              <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-7xl">
                <div className="max-w-3xl lg:max-w-4xl space-y-3 sm:space-y-4 md:space-y-6">
                  {/* Tag */}
                  <span className="inline-block bg-[#b90e0a] text-white px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold rounded-full animate-pulse">
                    {slide.tag}
                  </span>

                  {/* Title - Responsive with better sizing */}
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-white leading-tight animate-slide-up font-akira">
                    {slide.title}
                  </h1>

                  {/* Subtitle - Responsive with better sizing */}
                  <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-[#b90e0a] font-bold animate-slide-up animation-delay-200">
                    {slide.subtitle}
                  </p>

                  {/* Description */}
                  <p className="text-xs sm:text-sm md:text-base lg:text-lg text-[#CCCCCC] max-w-xl lg:max-w-3xl animate-slide-up animation-delay-400 leading-relaxed">
                    {slide.description}
                  </p>

                  {/* Price (if available) */}
                  {slide.price && (
                    <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-white animate-slide-up animation-delay-600">
                      {slide.price}
                    </div>
                  )}

                  {/* Dynamic Button - PROPERLY CONFIGURED FOR EACH SLIDE */}
                  <div className="flex gap-3 sm:gap-4 animate-slide-up animation-delay-800 pointer-events-auto pt-2">
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        if (slide.buttonAction === "product") {
                          window.scrollTo({ top: 0, behavior: 'instant' });
                          onSelectProduct(slide.id);
                        } else if (slide.buttonAction === "scroll") {
                          const productsSection = document.querySelector("#products-section");
                          if (productsSection) {
                            productsSection.scrollIntoView({
                              behavior: "smooth",
                              block: "start",
                            });
                          }
                        }
                      }}
                      className="bg-[#b90e0a] hover:bg-[#b90e0a]/80 text-white font-bold px-5 py-2.5 sm:px-6 sm:py-3 md:px-8 md:py-4 text-sm sm:text-base md:text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl group cursor-pointer"
                    >
                      {slide.buttonText}
                      <ArrowRight className="w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5 ml-1.5 sm:ml-2 group-hover:translate-x-1 transition-transform inline" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Slide Indicators - MOVED OUTSIDE THE LOOP */}
        <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 flex gap-2 sm:gap-3 z-30 pointer-events-auto">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCurrentSlide(idx);
              }}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-1.5 sm:h-2 rounded-full transition-all duration-500 cursor-pointer ${
                idx === currentSlide
                  ? "w-8 sm:w-12 bg-[#b90e0a] shadow-lg shadow-[#b90e0a]/50"
                  : "w-1.5 sm:w-2 bg-white/30 hover:bg-white/50"
              }`}
            />
          ))}
        </div>

        {/* Navigation Arrows - MOVED OUTSIDE THE LOOP */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setCurrentSlide(currentSlide === 0 ? heroSlides.length - 1 : currentSlide - 1);
          }}
          aria-label="Previous slide"
          className="absolute left-2 sm:left-4 md:left-8 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-[#b90e0a] p-2 sm:p-3 rounded-full transition-all duration-300 hover:scale-110 z-30 cursor-pointer backdrop-blur-sm pointer-events-auto"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setCurrentSlide(currentSlide === heroSlides.length - 1 ? 0 : currentSlide + 1);
          }}
          aria-label="Next slide"
          className="absolute right-2 sm:right-4 md:right-8 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-[#b90e0a] p-2 sm:p-3 rounded-full transition-all duration-300 hover:scale-110 z-30 cursor-pointer backdrop-blur-sm pointer-events-auto"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </button>
      </div>

      {/* HORIZONTAL SCROLLING MARQUEE */}
      <div className="relative z-10 w-full py-6 overflow-hidden border-y border-white/10 bg-black/50">
        <div className="flex">
          <div className="flex whitespace-nowrap animate-scroll-seamless">
            {[...Array(15)].map((_, i) => (
              <div
                key={`scroll-1-${i}`}
                className="flex items-center flex-shrink-0"
              >
                <span className="text-2xl md:text-4xl font-black text-white/10 mx-6">
                  DIVINITY IN DRIP
                </span>
                <span className="text-2xl md:text-4xl font-black text-[#b90e0a]/30 mx-6">
                  ★
                </span>
                <span className="text-2xl md:text-4xl font-black text-white/10 mx-6">
                  HEAVEN MISPLACED
                </span>
                <span className="text-2xl md:text-4xl font-black text-[#b90e0a]/30 mx-6">
                  ★
                </span>
              </div>
            ))}
          </div>
          <div
            className="flex whitespace-nowrap animate-scroll-seamless"
            aria-hidden="true"
          >
            {[...Array(15)].map((_, i) => (
              <div
                key={`scroll-2-${i}`}
                className="flex items-center flex-shrink-0"
              >
                <span className="text-2xl md:text-4xl font-black text-white/10 mx-6">
                  DIVINITY IN DRIP
                </span>
                <span className="text-2xl md:text-4xl font-black text-[#b90e0a]/30 mx-6">
                  ★
                </span>
                <span className="text-2xl md:text-4xl font-black text-white/10 mx-6">
                  HEAVEN MISPLACED
                </span>
                <span className="text-2xl md:text-4xl font-black text-[#b90e0a]/30 mx-6">
                  ★
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="relative z-10 w-full px-6 md:px-12 lg:px-24 py-16">
        {/* COLLECTION HEADER */}
        <section id="products-section" className="py-16 px-4 bg-black">
          <div className="max-w-7xl mx-auto text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 font-akira">
              <span className="text-[#b90e0a]">ASTITVA</span> ACT-I
            </h2>
            <div className="w-32 h-1 bg-[#b90e0a] mx-auto mb-6" />
            <p className="text-[#808088] text-lg max-w-2xl mx-auto leading-relaxed">
              Statement pieces crafted for those who dare to stand out. Each
              design tells a story of divinity and existence.
            </p>
          </div>
        </section>

        {/* CATEGORY FILTER */}
        <div className="flex justify-center gap-3 mb-12 flex-wrap px-4">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-3 rounded-full font-bold transition-all duration-300 ${
                selectedCategory === category
                  ? "bg-[#b90e0a] text-white scale-105 shadow-lg"
                  : "bg-[#28282B] text-white hover:bg-[#b90e0a]/20 hover:scale-105"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* PRODUCT GRID - ENHANCED */}
        <div className="flex flex-wrap justify-center gap-3 md:gap-4 lg:gap-6 max-w-7xl mx-auto mb-24 px-4">
          {filteredProducts.map((product, index) => (
            <div
              key={product.id}
              className="w-[calc(50%-0.375rem)] md:w-[calc(33.333%-0.67rem)] lg:w-[calc(25%-1.125rem)] max-w-[240px] md:max-w-[260px] lg:max-w-[280px] group relative bg-[#28282B] rounded-xl overflow-hidden border border-[#808088]/20 hover:border-[#b90e0a] transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-[#b90e0a]/20"
              onMouseEnter={() => setHoveredProduct(product.id)}
              onMouseLeave={() => setHoveredProduct(null)}
            >
              {/* Product Image */}
              <div className="aspect-square bg-[#1a1a1a] relative overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                  onError={(e) =>
                    ((e.currentTarget as HTMLImageElement).style.opacity = "0")
                  }
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />

                {/* Tag Badge */}
                <div className="absolute top-3 left-3">
                  <span className="bg-[#b90e0a] text-white px-2 py-1 text-xs font-bold rounded-full">
                    {product.tag}
                  </span>
                </div>

                {/* Hover Overlay */}
                <div
                  className={`absolute inset-0 bg-black/80 flex items-center justify-center transition-opacity duration-300 ${
                    hoveredProduct === product.id ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <Button
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: 'instant' });
                      onSelectProduct(product.id);
                    }}
                    className="bg-[#b90e0a] hover:bg-[#b90e0a]/80 text-white font-bold px-4 py-2 text-sm transition-all duration-300 hover:scale-110"
                  >
                    VIEW DETAILS
                  </Button>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-3 md:p-4 space-y-1 md:space-y-2">
                <h3 className="text-sm md:text-base lg:text-lg font-black group-hover:text-[#b90e0a] transition-colors duration-300 line-clamp-1">
                  {product.name}
                </h3>
                <p className="text-[#808088] text-xs md:text-sm line-clamp-2">
                  {product.description}
                </p>
                <div className="flex items-center justify-between pt-1 md:pt-2">
                  <span className="text-base md:text-lg lg:text-xl font-bold text-white">
                    {product.price}
                  </span>
                  <button
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: 'instant' });
                      onSelectProduct(product.id);
                    }}
                    className="text-[#b90e0a] hover:text-[#b90e0a]/80 transition-colors duration-300"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FEATURES SECTION - ENHANCED WITH 4 CARDS */}
        <div className="max-w-7xl mx-auto mb-24">
          <div className="text-center mb-12">
            <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-4 font-akira">
              WHY <span className="text-[#b90e0a]">KALLKEYY</span> ?
            </h3>
            <div className="w-24 h-1 bg-[#b90e0a] mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featureCards.map((card, i) => (
              <div
                key={i}
                className="group relative bg-gradient-to-br from-[#28282B] to-[#1C1C21] rounded-xl p-8 border border-white/10 hover:border-[#b90e0a]/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-[#b90e0a]/10"
              >
                <div className="text-[#b90e0a] mb-4 group-hover:scale-110 transition-transform duration-300">
                  {card.icon}
                </div>
                <h4 className="text-lg font-bold mb-2 group-hover:text-[#b90e0a] transition-colors">
                  {card.title}
                </h4>
                <p className="text-[#808088] text-sm mb-3 leading-relaxed">
                  {card.description}
                </p>
                <div className="text-xs text-[#b90e0a] font-semibold">
                  {card.highlight}
                </div>

                {/* Animated corner accent */}
                <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-[#b90e0a]/0 group-hover:border-[#b90e0a] transition-all duration-300" />
              </div>
            ))}
          </div>
        </div>

        {/* BRAND STORY SECTION - ENHANCED */}
        <div className="max-w-7xl mx-auto mb-24">
          <div className="relative bg-gradient-to-br from-[#28282B] via-[#1C1C21] to-[#28282B] rounded-3xl p-8 md:p-16 border border-white/10 overflow-hidden">
            {/* Decorative background pattern */}
            <div className="absolute inset-0 opacity-5">
              {[...Array(20)].map((_, i) => (
                <div
                  key={`bg-pattern-${i}`}
                  className="absolute w-32 h-32 border border-white/20 rounded-full"
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                  }}
                />
              ))}
            </div>

            <div className="relative z-10">
              <div className="text-center mb-12">
                <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-4 font-akira">
                  OUR <span className="text-[#b90e0a]">STORY</span>
                </h3>
                <div className="w-24 h-1 bg-[#b90e0a] mx-auto mb-6" />
              </div>

              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <p className="text-[#CCCCCC] text-lg leading-relaxed">
                    Streetwear has always been loud, but it never spoke our
                    language. Inspired by the raw energy of urban culture, we
                    create pieces that speak to those who refuse to blend in,
                    who wear their identity with pride.
                    <br />
                    <br />
                    We created KALLKEYY to fill a void – to bring you streetwear
                    that’s not just about fashion, but about making a statement.
                  </p>
                  <p className="text-[#808088] text-base leading-relaxed">
                    Every stitch, every design choice is intentional. We're not
                    just making clothes – we're crafting statements, building a
                    movement, and redefining what streetwear means.
                  </p>
                  <div className="flex flex-wrap gap-4 pt-4">
                    <div className="bg-black/50 px-6 py-3 rounded-full border border-[#b90e0a]/30">
                      <span className="text-[#b90e0a] font-bold">
                        EST. 2025
                      </span>
                    </div>
                    <div className="bg-black/50 px-6 py-3 rounded-full border border-[#b90e0a]/30">
                      <span className="text-white font-bold">
                        100% AUTHENTIC
                      </span>
                    </div>
                    <div className="bg-black/50 px-6 py-3 rounded-full border border-[#b90e0a]/30">
                      <span className="text-white font-bold">STREETWEAR</span>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="aspect-square rounded-2xl bg-gradient-to-br from-[#b90e0a]/20 to-transparent border border-[#b90e0a]/30 flex items-center justify-center">
                    <TrendingUp className="w-24 h-24 text-[#b90e0a]/40" />
                  </div>
                  <div className="absolute -bottom-4 -right-4 bg-[#b90e0a] text-white px-6 py-3 rounded-xl font-bold shadow-2xl">
                    GROWING COMMUNITY
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* INSTAGRAM REELS SECTION - ALL 4 IN ONE LINE + MOBILE RESPONSIVE */}
        {/* INSTAGRAM REELS - 320px DESKTOP, SCALED ON MOBILE */}
        <div className="w-full mx-auto mb-24 px-4">
          <div className="text-center mb-12">
            <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-4 font-akira">
              FOLLOW <span className="text-[#b90e0a]">OUR JOURNEY</span>
            </h3>
            <div className="w-24 h-1 bg-[#b90e0a] mx-auto mb-4" />
            <p className="text-[#808088] text-base md:text-lg">
              Check out our latest drops and behind-the-scenes content
            </p>
          </div>

          {/* Responsive with scale transform on mobile */}
          <div className="w-full overflow-x-auto pb-4">
            <div className="flex gap-1 lg:gap-2 justify-start lg:justify-center px-2 lg:px-0">
              {instagramReels.map((reel) => (
                <div
                  key={reel.id}
                  className="flex-shrink-0 scale-[0.88] md:scale-80 lg:scale-100 origin-left lg:origin-center"
                  style={{
                    width: "320px",
                    maxWidth: "320px",
                    minWidth: "320px",
                    height: "450px",
                    maxHeight: "450px",
                    overflow: "clip",
                    position: "relative",
                    backgroundColor: "#000",
                    borderRadius: "12px",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    isolation: "isolate",
                  }}
                >
                  <div
                    style={{
                      width: "320px",
                      height: "600px",
                      position: "absolute",
                      top: "0px",
                      left: 0,
                    }}
                  >
                    <InstagramEmbed
                      url={reel.url}
                      width={320}
                      captioned={false}
                      placeholderSpinner={
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            height: "450px",
                            marginTop: "10px",
                          }}
                        >
                          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#b90e0a]" />
                        </div>
                      }
                    />
                  </div>

                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: "50px",
                      background:
                        "linear-gradient(to top, #000 0%, #000 40%, transparent 100%)",
                      pointerEvents: "auto",
                      zIndex: 10,
                      cursor: "default",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-12">
            <Button
              onClick={() =>
                window.open("https://www.instagram.com/kall.keyy/", "_blank")
              }
              className="bg-[#b90e0a] hover:bg-[#BB0003] text-white font-bold px-6 py-3 md:px-8 md:py-4 text-base md:text-lg 
                 transition-all duration-300 hover:scale-105 hover:shadow-2xl group"
            >
              <Instagram className="w-4 h-4 md:w-5 md:h-5 mr-2" />
              FOLLOW US ON INSTAGRAM
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>

        {/* NEWSLETTER SECTION - ENHANCED */}
        <div className="max-w-4xl mx-auto mb-24">
          <div className="relative bg-gradient-to-r from-[#b90e0a]/10 via-[#28282B] to-[#b90e0a]/10 rounded-3xl p-8 md:p-12 border border-[#b90e0a]/30 overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(221,0,4,0.2)_50%,transparent_75%)] bg-[length:250%_250%] animate-gradient" />
            </div>

            <div className="relative z-10 text-center">
              <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-4 font-akira">
                STAY IN THE <span className="text-[#b90e0a]">LOOP</span>
              </h3>
              <p className="text-[#808088] mb-8 text-lg">
                Get early access to new drops, exclusive content, and special
                discounts
              </p>

              <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg 
               text-white placeholder:text-white/50 focus:outline-none 
               focus:border-[#b90e0a] transition-colors"
                  disabled={isSubmitting} // ADD THIS
                  required // ADD THIS
                />
                <button
                  type="submit"
                  disabled={isSubmitting} // ADD THIS
                  className="px-6 py-3 bg-[#b90e0a] text-white rounded-lg font-bold 
               hover:bg-[#BB0003] transition-colors whitespace-nowrap
               disabled:opacity-50 disabled:cursor-not-allowed" // ADD disabled styles
                >
                  {isSubmitting ? "Subscribing..." : "Subscribe"}{" "}
                  {/* UPDATE TEXT */}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black py-12 px-4 border-t border-[#808088]/20 relative">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2 animate-fade-in-up">
              <h3 className="text-2xl sm:text-3xl font-black mb-4 font-akira">
                KALLKEYY
              </h3>
              <p className="text-[#808088] mb-4 max-w-md">
                Based on a prophecy untold, KALLKEYY is more than just
                streetwear; it's a movement. Every Design has a story, every
                stitch a purpose.
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

      {/* STYLES */}
      <style>{`
        @keyframes scroll-seamless {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        @keyframes float-chain {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(10deg);
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

        @keyframes slide-in-up {
          0% {
            opacity: 0;
            transform: translateY(50px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .animate-scroll-seamless {
          animation: scroll-seamless 30s linear infinite;
        }
        .animate-float-chain {
          animation: float-chain 4s ease-in-out infinite;
        }
        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out forwards;
        }
        .animate-slide-in-up {
          animation: slide-in-up 0.8s ease-out forwards;
        }
        .animate-gradient {
          animation: gradient 8s ease infinite;
        }
      `}</style>
    </div>
  );
}
