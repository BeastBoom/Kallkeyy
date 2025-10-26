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
  // Slide 1: Product (Hoodie)
  {
    id: "hoodie",
    image: "/product-hoodie.jpg",
    title: "ESSENTIAL HOODIE",
    subtitle: "Classic comfort re-imagined",
    description:
      "Premium heavyweight French-terry, oversized fit tuned for the street.",
    tag: "FLAGSHIP",
    price: "₹2,999",
    isUpcoming: false,
    buttonText: "SHOP NOW",
    buttonAction: "product", // Will redirect to hoodie product page
  },
  // Slide 2: Sales Banner
  {
    id: "sale",
    image: "/sale-banner.jpg", // Add your sale banner image
    title: "SEASON SALE",
    subtitle: "Up to 30% OFF",
    description:
      "Limited time offer on selected streetwear essentials. Don't miss out!",
    tag: "SALE",
    price: "",
    isUpcoming: false,
    buttonText: "SHOP SALE",
    buttonAction: "scroll", // Will scroll to products section
  },
  // Slide 3: Product (T-Shirt)
  {
    id: "tshirt",
    image: "/hoodie-front.png",
    title: "SIGNATURE TEE",
    subtitle: "Bold statement piece",
    description:
      "The perfect everyday tee. Soft, bold, and unmistakably KALLKEYY.",
    tag: "NEW DROP",
    price: "₹1,499",
    isUpcoming: false,
    buttonText: "SHOP NOW",
    buttonAction: "product", // Will redirect to tshirt product page
  },
  // Slide 4: Brand Story
  {
    id: "brand",
    image: "/brand-story.jpg", // Add your brand story image
    title: "BORN FROM THE STREETS",
    subtitle: "Our Story",
    description:
      "Inspired by urban culture. Every piece tells a story of rebellion and authenticity.",
    tag: "ABOUT",
    price: "",
    isUpcoming: false,
    buttonText: "LEARN MORE",
    buttonAction: "scroll", // Will scroll to brand story section
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
    id: "hoodie",
    name: "ESSENTIAL HOODIE",
    image: "/product-hoodie.jpg",
    price: "₹2,999",
    tag: "FLAGSHIP",
    description:
      "Our signature piece. Heavyweight cotton blend with oversized fit.",
    features: [
      "Premium 400 GSM fabric",
      "Oversized fit",
      "Embroidered logo",
      "Reinforced stitching",
    ],
    category: "Hoodies",
  },
  {
    id: "hoodie2",
    name: "OVERSIZED HOODIE",
    image: "/hoodie2-main.jpg",
    price: "₹3,299",
    tag: "NEW LAUNCH",
    description:
      "Premium oversized hoodie with dropped shoulders and bold graphics.",
    features: [
      "Heavy 450 GSM fabric",
      "Oversized drop-shoulder fit",
      "Screen-printed graphics",
      "Kangaroo pocket",
    ],
    category: "Hoodies",
  },
  {
    id: "tshirt",
    name: "SIGNATURE TEE",
    image: "/hoodie-front.png",
    price: "₹1,499",
    tag: "NEW DROP",
    description:
      "The perfect everyday tee. Soft, bold, and unmistakably KALLKEYY.",
    features: [
      "260 GSM cotton",
      "Screen-printed graphics",
      "Pre-shrunk",
      "Relaxed fit",
    ],
    category: "T-Shirts",
  },
  {
    id: "tshirt2",
    name: "GRAPHIC TEE PRO",
    image: "/tshirt2-front.jpg",
    price: "₹1,699",
    tag: "TRENDING",
    description:
      "Premium graphic tee with exclusive artwork for bold statements.",
    features: [
      "280 GSM premium cotton",
      "Oversized boxy fit",
      "High-quality screen print",
      "Pre-shrunk fabric",
    ],
    category: "T-Shirts",
  },
];

const featureCards: FeatureCard[] = [
  {
    icon: <Shield className="w-8 h-8" />,
    title: "PREMIUM QUALITY",
    description: "Only the finest materials make it into our pieces",
    highlight: "Heavyweight fabrics & reinforced stitching",
  },
  {
    icon: <Zap className="w-8 h-8" />,
    title: "LIMITED DROPS",
    description: "Exclusive releases that sell out fast",
    highlight: "Small batches, high demand",
  },
  {
    icon: <Star className="w-8 h-8" />,
    title: "AUTHENTIC DESIGN",
    description: "True street culture, no compromises",
    highlight: "Born from the streets",
  },
  {
    icon: <Heart className="w-8 h-8" />,
    title: "COMMUNITY FIRST",
    description: "Built by and for the culture",
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
}

export default function ProductMenuPage({
  onSelectProduct,
  onBackToMain,
  onNavigateToShop,
  onNavigateToAbout,
  onNavigateToContact,
  onNavigateToLogin,
  onNavigateToSignup,
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
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleSlideClick = (slide: HeroSlide) => {
    if (slide.isUpcoming) {
      toast({
        title: "Coming Soon! 🔥",
        description: "Stay tuned and hit us on IG for the drop alerts.",
        duration: 3000,
      });
    } else {
      onSelectProduct(slide.id);
    }
  };

  const handleUnavailablePage = (pageName: string) => {
    toast({
      title: "Coming Soon",
      description: `Sorry, the ${pageName} page is not available yet. Stay tuned!`,
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
    } catch (error: any) {
      console.error("Subscription error:", error);
      sonnerToast.error(
        error.message || "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDisplayName = (fullName: string): string => {
    if (!fullName) return '';
    const nameParts = fullName.trim().split(/\s+/);
    const firstName = nameParts[0];
    if (firstName.length <= 10) {
      return firstName.toUpperCase();
    }
    const initials = nameParts
      .slice(0, 3)
      .map(part => part[0])
      .join('')
      .toUpperCase();
    
    return initials;
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-x-hidden">
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
                className="text-xl sm:text-2xl lg:text-3xl font-black tracking-wider hover:text-[#DD0004] transition-colors duration-300 cursor-pointer"
                onClick={onBackToMain}
              >
                KALLKEYY
              </h1>
            </div>

            {/* CENTER: Brand Logo Image (Hidden on small mobile, visible tablet+) */}
            <div className="hidden sm:block absolute left-1/2 transform -translate-x-1/2 z-10">
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
                  className="hover:text-[#DD0004] transition-colors duration-300 px-2 lg:px-3 py-2 hover:bg-white/5 rounded-lg whitespace-nowrap"
                >
                  HOME
                </button>
                <button
                  onClick={() =>
                    onNavigateToShop
                      ? onNavigateToShop()
                      : handleUnavailablePage("Shop")
                  }
                  className="hover:text-[#DD0004] transition-colors duration-300 px-2 lg:px-3 py-2 hover:bg-white/5 rounded-lg whitespace-nowrap"
                >
                  SHOP
                </button>
                <button
                  onClick={() =>
                    onNavigateToAbout
                      ? onNavigateToAbout()
                      : handleUnavailablePage("About")
                  }
                  className="hover:text-[#DD0004] transition-colors duration-300 px-2 lg:px-3 py-2 hover:bg-white/5 rounded-lg whitespace-nowrap"
                >
                  ABOUT
                </button>
                <button
                  onClick={() =>
                    onNavigateToContact
                      ? onNavigateToContact()
                      : handleUnavailablePage("Contact")
                  }
                  className="hover:text-[#DD0004] transition-colors duration-300 px-2 lg:px-3 py-2 hover:bg-white/5 rounded-lg whitespace-nowrap"
                >
                  CONTACT
                </button>
                
                {/* AUTH BUTTONS - Desktop */}
                {user ? (
                  <>
                    <span className="text-white px-2 lg:px-3 py-2 flex items-center text-xs lg:text-sm whitespace-nowrap">
                      HEY, <span className="text-[#DD0004] ml-1">{formatDisplayName(user.name)}</span>
                    </span>
                    <button
                      onClick={logout}
                      className="hover:text-[#DD0004] transition-colors duration-300 px-2 lg:px-3 py-2 hover:bg-white/5 rounded-lg flex items-center gap-1 whitespace-nowrap"
                    >
                      <LogOut size={14} className="lg:w-4 lg:h-4" />
                      <span className="text-xs lg:text-sm">LOGOUT</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => onNavigateToLogin()}
                      className="hover:text-[#DD0004] transition-colors duration-300 px-2 lg:px-3 py-2 hover:bg-white/5 rounded-lg whitespace-nowrap text-xs lg:text-sm"
                    >
                      LOGIN
                    </button>
                    <button
                      onClick={() => onNavigateToSignup()}
                      className="bg-[#DD0004] hover:bg-[#DD0004]/80 transition-colors duration-300 px-3 lg:px-4 py-2 rounded-lg ml-1 whitespace-nowrap text-xs lg:text-sm"
                    >
                      SIGN UP
                    </button>
                  </>
                )}
              </div>

              {/* Hamburger Menu Button (Mobile/Tablet) */}
              <button
                className="lg:hidden text-white hover:text-[#DD0004] transition-colors p-2 -mr-2"
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
                className="block w-full text-left hover:text-[#DD0004] transition-colors duration-300 px-4 py-2.5 hover:bg-white/5 rounded-lg text-base font-semibold"
              >
                HOME
              </button>
              <button
                onClick={() => {
                  onNavigateToShop
                    ? onNavigateToShop()
                    : handleUnavailablePage("Shop");
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left hover:text-[#DD0004] transition-colors duration-300 px-4 py-2.5 hover:bg-white/5 rounded-lg text-base font-semibold"
              >
                SHOP
              </button>
              <button
                onClick={() => {
                  onNavigateToAbout
                    ? onNavigateToAbout()
                    : handleUnavailablePage("About");
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left hover:text-[#DD0004] transition-colors duration-300 px-4 py-2.5 hover:bg-white/5 rounded-lg text-base font-semibold"
              >
                ABOUT
              </button>
              <button
                onClick={() => {
                  onNavigateToContact
                    ? onNavigateToContact()
                    : handleUnavailablePage("Contact");
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left hover:text-[#DD0004] transition-colors duration-300 px-4 py-2.5 hover:bg-white/5 rounded-lg text-base font-semibold"
              >
                CONTACT
              </button>
              
              {/* AUTH SECTION - Mobile */}
              <div className="border-t border-white/10 pt-3 mt-3">
                {user ? (
                  <>
                    <div className="text-white px-4 py-2 mb-2 text-sm">
                      HEY, <span className="text-[#DD0004]">{formatDisplayName(user.name)}</span>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="block w-full text-left hover:text-[#DD0004] transition-colors duration-300 px-4 py-2.5 hover:bg-white/5 rounded-lg flex items-center gap-2 text-base font-semibold"
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
                      className="block w-full text-left hover:text-[#DD0004] transition-colors duration-300 px-4 py-2.5 hover:bg-white/5 rounded-lg text-base font-semibold"
                    >
                      LOGIN
                    </button>
                    <button
                      onClick={() => {
                        onNavigateToSignup();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full bg-[#DD0004] hover:bg-[#DD0004]/80 transition-colors duration-300 px-4 py-2.5 rounded-lg text-center mt-2 text-base font-semibold"
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
      <div className="relative h-[600px] md:h-[700px] overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-1000 ${
              index === currentSlide
                ? "opacity-100 scale-100"
                : "opacity-0 scale-105 pointer-events-none"
            }`}
          >
            {/* Background Image */}
            <div className="absolute inset-0 pointer-events-none">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
                onError={(e) =>
                  ((e.currentTarget as HTMLImageElement).style.opacity = "0")
                }
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
            </div>

            {/* Content - WITH PROPER Z-INDEX AND POINTER EVENTS */}
            <div className="relative h-full flex items-center z-10 pointer-events-none">
              <div className="container mx-auto px-4 md:px-8 max-w-7xl">
                <div className="max-w-2xl space-y-4 md:space-y-6">
                  {/* Tag */}
                  <span className="inline-block bg-[#DD0004] text-white px-4 py-2 text-sm font-bold rounded-full animate-pulse">
                    {slide.tag}
                  </span>

                  {/* Title */}
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-tight animate-slide-up">
                    {slide.title}
                  </h1>

                  {/* Subtitle */}
                  <p className="text-xl md:text-2xl text-[#DD0004] font-bold animate-slide-up animation-delay-200">
                    {slide.subtitle}
                  </p>

                  {/* Description */}
                  <p className="text-base md:text-lg text-[#808088] max-w-xl animate-slide-up animation-delay-400">
                    {slide.description}
                  </p>

                  {/* Price (if available) */}
                  {slide.price && (
                    <div className="text-3xl md:text-4xl font-black text-white animate-slide-up animation-delay-600">
                      {slide.price}
                    </div>
                  )}

                  {/* Dynamic Button - ENABLE POINTER EVENTS */}
                  <div className="flex gap-4 animate-slide-up animation-delay-800 pointer-events-auto">
                    <Button
                      onClick={() => {
                        if (slide.buttonAction === "product") {
                          onSelectProduct(slide.id);
                        } else if (slide.buttonAction === "scroll") {
                          document
                            .querySelector("#products-section")
                            ?.scrollIntoView({ behavior: "smooth" });
                        }
                      }}
                      className="bg-[#DD0004] hover:bg-[#DD0004]/80 text-white font-bold px-6 py-3 md:px-8 md:py-4 text-base md:text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl group cursor-pointer"
                    >
                      {slide.buttonText}
                      <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2 group-hover:translate-x-1 transition-transform inline" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Slide Indicators - WITH Z-INDEX */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
              {heroSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === currentSlide
                      ? "w-12 bg-[#DD0004]"
                      : "w-2 bg-white/30 hover:bg-white/50"
                  }`}
                />
              ))}
            </div>

            {/* Navigation Arrows - WITH Z-INDEX */}
            <button
              onClick={() =>
                setCurrentSlide((prev) =>
                  prev === 0 ? heroSlides.length - 1 : prev - 1
                )
              }
              className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-[#DD0004] p-3 rounded-full transition-all duration-300 hover:scale-110 z-20 cursor-pointer"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={() =>
                setCurrentSlide((prev) =>
                  prev === heroSlides.length - 1 ? 0 : prev + 1
                )
              }
              className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-[#DD0004] p-3 rounded-full transition-all duration-300 hover:scale-110 z-20 cursor-pointer"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          </div>
        ))}
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
                  STREET CULTURE
                </span>
                <span className="text-2xl md:text-4xl font-black text-[#DD0004]/30 mx-6">
                  ★
                </span>
                <span className="text-2xl md:text-4xl font-black text-white/10 mx-6">
                  AUTHENTIC STYLE
                </span>
                <span className="text-2xl md:text-4xl font-black text-[#DD0004]/30 mx-6">
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
                  STREET CULTURE
                </span>
                <span className="text-2xl md:text-4xl font-black text-[#DD0004]/30 mx-6">
                  ★
                </span>
                <span className="text-2xl md:text-4xl font-black text-white/10 mx-6">
                  AUTHENTIC STYLE
                </span>
                <span className="text-2xl md:text-4xl font-black text-[#DD0004]/30 mx-6">
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
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              OUR <span className="text-[#DD0004]">COLLECTION</span>
            </h2>
            <div className="w-32 h-1 bg-[#DD0004] mx-auto mb-6" />
            <p className="text-[#808088] text-lg max-w-2xl mx-auto leading-relaxed">
              Limited edition pieces crafted for those who dare to stand out. Each
              design tells a story of rebellion and authenticity.
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
                  ? "bg-[#DD0004] text-white scale-105 shadow-lg"
                  : "bg-[#28282B] text-white hover:bg-[#DD0004]/20 hover:scale-105"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* PRODUCT GRID - ENHANCED */}
        <div className="flex flex-wrap justify-center gap-3 md:gap-6 max-w-7xl mx-auto mb-24 px-4">
          {filteredProducts.map((product, index) => (
            <div
              key={product.id}
              className="w-[calc(50%-0.5rem)] md:w-[calc(50%-0.75rem)] lg:w-[calc(25%-1.125rem)] max-w-[280px] group relative bg-[#28282B] rounded-xl overflow-hidden border border-[#808088]/20 hover:border-[#DD0004] transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-[#DD0004]/20"
              onMouseEnter={() => setHoveredProduct(product.id)}
              onMouseLeave={() => setHoveredProduct(null)}
            >
              {/* Product Image */}
              <div className="aspect-square bg-[#1a1a1a] relative overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) =>
                    ((e.currentTarget as HTMLImageElement).style.opacity = "0")
                  }
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                
                {/* Tag Badge */}
                <div className="absolute top-3 left-3">
                  <span className="bg-[#DD0004] text-white px-2 py-1 text-xs font-bold rounded-full">
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
                    onClick={() => onSelectProduct(product.id)}
                    className="bg-[#DD0004] hover:bg-[#DD0004]/80 text-white font-bold px-4 py-2 text-sm transition-all duration-300 hover:scale-110"
                  >
                    VIEW DETAILS
                  </Button>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4 space-y-2">
                <h3 className="text-lg font-black group-hover:text-[#DD0004] transition-colors duration-300 line-clamp-1">
                  {product.name}
                </h3>
                <p className="text-[#808088] text-sm line-clamp-2">
                  {product.description}
                </p>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xl font-bold text-white">{product.price}</span>
                  <button
                    onClick={() => onSelectProduct(product.id)}
                    className="text-[#DD0004] hover:text-[#DD0004]/80 transition-colors duration-300"
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
            <h3 className="text-3xl md:text-5xl font-black mb-4">
              WHY <span className="text-[#DD0004]">KALLKEYY</span>
            </h3>
            <div className="w-24 h-1 bg-[#DD0004] mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featureCards.map((card, i) => (
              <div
                key={i}
                className="group relative bg-gradient-to-br from-[#28282B] to-[#1C1C21] rounded-xl p-8 border border-white/10 hover:border-[#DD0004]/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-[#DD0004]/10"
              >
                <div className="text-[#DD0004] mb-4 group-hover:scale-110 transition-transform duration-300">
                  {card.icon}
                </div>
                <h4 className="text-lg font-bold mb-2 group-hover:text-[#DD0004] transition-colors">
                  {card.title}
                </h4>
                <p className="text-[#808088] text-sm mb-3 leading-relaxed">
                  {card.description}
                </p>
                <div className="text-xs text-[#DD0004] font-semibold">
                  {card.highlight}
                </div>

                {/* Animated corner accent */}
                <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-[#DD0004]/0 group-hover:border-[#DD0004] transition-all duration-300" />
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
                <h3 className="text-3xl md:text-5xl font-black mb-4">
                  OUR <span className="text-[#DD0004]">STORY</span>
                </h3>
                <div className="w-24 h-1 bg-[#DD0004] mx-auto mb-6" />
              </div>

              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <p className="text-[#CCCCCC] text-lg leading-relaxed">
                    KALLKEYY was born from the streets, inspired by the raw
                    energy of urban culture. We create pieces that speak to
                    those who refuse to blend in, who wear their identity with
                    pride.
                  </p>
                  <p className="text-[#808088] text-base leading-relaxed">
                    Every stitch, every design choice is intentional. We're not
                    just making clothes – we're crafting statements, building a
                    movement, and redefining what streetwear means.
                  </p>
                  <div className="flex flex-wrap gap-4 pt-4">
                    <div className="bg-black/50 px-6 py-3 rounded-full border border-[#DD0004]/30">
                      <span className="text-[#DD0004] font-bold">
                        EST. 2024
                      </span>
                    </div>
                    <div className="bg-black/50 px-6 py-3 rounded-full border border-[#DD0004]/30">
                      <span className="text-white font-bold">
                        100% AUTHENTIC
                      </span>
                    </div>
                    <div className="bg-black/50 px-6 py-3 rounded-full border border-[#DD0004]/30">
                      <span className="text-white font-bold">
                        MADE FOR STREETS
                      </span>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="aspect-square rounded-2xl bg-gradient-to-br from-[#DD0004]/20 to-transparent border border-[#DD0004]/30 flex items-center justify-center">
                    <TrendingUp className="w-24 h-24 text-[#DD0004]/40" />
                  </div>
                  <div className="absolute -bottom-4 -right-4 bg-[#DD0004] text-white px-6 py-3 rounded-xl font-bold shadow-2xl">
                    10K+ COMMUNITY
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
            <h3 className="text-3xl md:text-5xl font-black mb-4">
              FOLLOW <span className="text-[#DD0004]">OUR JOURNEY</span>
            </h3>
            <div className="w-24 h-1 bg-[#DD0004] mx-auto mb-4" />
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
                          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#DD0004]" />
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
              className="bg-[#DD0004] hover:bg-[#BB0003] text-white font-bold px-6 py-3 md:px-8 md:py-4 text-base md:text-lg 
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
          <div className="relative bg-gradient-to-r from-[#DD0004]/10 via-[#28282B] to-[#DD0004]/10 rounded-3xl p-8 md:p-12 border border-[#DD0004]/30 overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(221,0,4,0.2)_50%,transparent_75%)] bg-[length:250%_250%] animate-gradient" />
            </div>

            <div className="relative z-10 text-center">
              <h3 className="text-3xl md:text-4xl font-black mb-4">
                STAY IN THE <span className="text-[#DD0004]">LOOP</span>
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
               focus:border-[#DD0004] transition-colors"
                  disabled={isSubmitting} // ADD THIS
                  required // ADD THIS
                />
                <button
                  type="submit"
                  disabled={isSubmitting} // ADD THIS
                  className="px-6 py-3 bg-[#DD0004] text-white rounded-lg font-bold 
               hover:bg-[#BB0003] transition-colors whitespace-nowrap
               disabled:opacity-50 disabled:cursor-not-allowed" // ADD disabled styles
                >
                  {isSubmitting ? "Subscribing..." : "Subscribe"}{" "}
                  {/* UPDATE TEXT */}
                </button>
              </form>

              <p className="text-xs text-[#808088] mt-4">
                Join 10,000+ streetwear enthusiasts getting exclusive updates
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black py-12 px-4 border-t border-[#808088]/20 relative">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2 animate-fade-in-up">
              <h3 className="text-3xl font-black mb-4">KALLKEYY</h3>
              <p className="text-[#808088] mb-4 max-w-md">
                Authentic streetwear for the next generation. Born from the
                underground, crafted for tomorrow.
              </p>
              <div className="flex space-x-4">
                {["IG", "TW", "FB"].map((social, i) => (
                  <div
                    key={social}
                    onClick={() => handleUnavailablePage(social)}
                    className="w-10 h-10 bg-[#28282B] rounded-full flex items-center justify-center hover:bg-[#DD0004] transition-all duration-300 cursor-pointer hover:scale-110 hover:rotate-12 animate-bounce-in"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    {social}
                  </div>
                ))}
              </div>
            </div>
            <div
              className="animate-fade-in-up"
              style={{ animationDelay: "0.2s" }}
            >
              <h4 className="text-lg font-bold mb-4">QUICK LINKS</h4>
              <ul className="space-y-2 text-[#808088]">
                {["About Us", "Size Guide", "Shipping", "Returns"].map(
                  (link) => (
                    <li
                      key={link}
                      onClick={() => handleUnavailablePage(link)}
                      className="hover:text-white cursor-pointer hover:translate-x-2 transition-all duration-300"
                    >
                      {link}
                    </li>
                  )
                )}
              </ul>
            </div>
            <div
              className="animate-fade-in-up"
              style={{ animationDelay: "0.4s" }}
            >
              <h4 className="text-lg font-bold mb-4">SUPPORT</h4>
              <ul className="space-y-2 text-[#808088]">
                {["Contact", "FAQ", "Track Order", "Help"].map((link) => (
                  <li
                    key={link}
                    onClick={() => handleUnavailablePage(link)}
                    className="hover:text-white cursor-pointer hover:translate-x-2 transition-all duration-300"
                  >
                    {link}
                  </li>
                ))}
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
