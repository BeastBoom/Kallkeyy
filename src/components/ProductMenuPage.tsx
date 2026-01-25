"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Menu,
  X,
  ArrowRight,
  Star,
  Shield,
  Zap,
  Instagram,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
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
  originalPrice?: string;
  salePrice?: string;
  tag: string;
  description: string;
  features: string[];
  category: string;
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
    originalPrice: "₹4,499",
    salePrice: "₹2,499",
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
    originalPrice: "₹2,499",
    salePrice: "₹1,299",
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
    originalPrice: "₹4,499",
    salePrice: "₹2,499",
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
    originalPrice: "₹2,499",
    salePrice: "₹1,299",
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
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  
  // Refs for scroll animations
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

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

  // Intersection Observer for scroll animations
  useEffect(() => {
    if (skipAnimations) {
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
    <div className={`min-h-screen bg-[#f8f8f8] text-[#0a0a0a] font-grotesk selection:bg-[#b90e0a] selection:text-white ${skipAnimations ? '[&_*]:!animate-none' : ''}`}>
      {/* Announcement Bar */}
      <div className="bg-[#333333] text-white text-center py-1.5 px-4 text-[10px] sm:text-xs font-bold tracking-widest uppercase z-[60] relative">
        Free Shipping on all pan-India orders · Code <span className="text-[#4CAF50]">KALLKEYY10</span> for 10% Off
      </div>

      {/* Navigation */}
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

            {/* CENTER: Navigation Links */}
            <div className="hidden lg:flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2">
              <button
                onClick={onBackToMain}
                className="text-sm font-bold tracking-wide hover:text-[#b90e0a] transition-colors duration-300 whitespace-nowrap uppercase"
              >
                Home
              </button>
              <button
                onClick={() =>
                  onNavigateToShop
                    ? onNavigateToShop()
                    : handleUnavailablePage("Shop")
                }
                className="text-sm font-bold tracking-wide text-[#b90e0a] transition-colors duration-300 whitespace-nowrap uppercase"
              >
                Shop
              </button>
              {user && (
                <button
                  onClick={() =>
                    onNavigateToOrders
                      ? onNavigateToOrders()
                      : handleUnavailablePage("Orders")
                  }
                  className="text-sm font-bold tracking-wide hover:text-[#b90e0a] transition-colors duration-300 whitespace-nowrap uppercase"
                >
                  Orders
                </button>
              )}
              <button
                onClick={() =>
                  onNavigateToAbout
                    ? onNavigateToAbout()
                    : handleUnavailablePage("About")
                }
                className="text-sm font-bold tracking-wide hover:text-[#b90e0a] transition-colors duration-300 whitespace-nowrap uppercase"
              >
                About
              </button>
              <button
                onClick={() =>
                  onNavigateToContact
                    ? onNavigateToContact()
                    : handleUnavailablePage("Contact")
                }
                className="text-sm font-bold tracking-wide hover:text-[#b90e0a] transition-colors duration-300 whitespace-nowrap uppercase"
              >
                Contact
              </button>
            </div>

            {/* RIGHT: Auth + Cart */}
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
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
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
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[100] animate-fadeIn">
          <div 
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          <div className="relative h-full flex flex-col pt-16 px-5 pb-6 overflow-y-auto">
            <button
              className="absolute top-4 right-4 text-white hover:text-[#b90e0a] transition-colors p-1.5"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              <X size={24} />
            </button>

            <div className="space-y-1">
              <button
                onClick={() => {
                  onBackToMain();
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left text-white hover:text-[#b90e0a] transition-colors duration-300 px-3 py-3 hover:bg-white/5 rounded-lg text-base font-bold"
              >
                Home
              </button>
              <button
                onClick={() => {
                  if (onNavigateToShop) onNavigateToShop();
                  else handleUnavailablePage("Shop");
                  setMobileMenuOpen(false);
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
                    setMobileMenuOpen(false);
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
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left text-white hover:text-[#b90e0a] transition-colors duration-300 px-3 py-3 hover:bg-white/5 rounded-lg text-base font-bold"
              >
                About
              </button>
              <button
                onClick={() => {
                  if (onNavigateToContact) onNavigateToContact();
                  else handleUnavailablePage("Contact");
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left text-white hover:text-[#b90e0a] transition-colors duration-300 px-3 py-3 hover:bg-white/5 rounded-lg text-base font-bold"
              >
                Contact
              </button>
            </div>

            <div className="border-t border-white/20 pt-4 mt-4">
              {user ? (
                <>
                  <div className="text-white px-3 py-2 mb-1 text-sm font-medium">
                    Hey, <span className="text-[#b90e0a] font-bold">{formatDisplayName(user.name)}</span>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
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
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-center text-white hover:text-[#b90e0a] transition-colors duration-300 py-3 border border-white/20 rounded-full text-sm font-bold"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      onNavigateToSignup();
                      setMobileMenuOpen(false);
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

      {/* Hero Slideshow */}
      <section className="relative h-[260px] sm:h-[320px] md:h-[380px] lg:h-[440px] xl:h-[480px] overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-1000 ${
              index === currentSlide
                ? "opacity-100 scale-100 z-10"
                : "opacity-0 scale-105 pointer-events-none z-0"
            }`}
          >
            <div className="absolute inset-0 pointer-events-none bg-black">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-contain sm:object-cover"
                style={{ objectPosition: "center center" }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/50 md:from-black/85 md:via-black/60 md:to-transparent" />
            </div>

            <div className="relative h-full flex items-center z-10 pointer-events-none">
              <div className="w-full px-4 sm:px-6 lg:px-12 max-w-[1600px] mx-auto">
                <div className="max-w-[90%] sm:max-w-lg md:max-w-xl lg:max-w-2xl space-y-1.5 sm:space-y-2 md:space-y-3 lg:space-y-4 lg:ml-12 xl:ml-20">
                  <span className="inline-block bg-[#b90e0a] text-white px-2 py-1 sm:px-3 sm:py-1.5 text-[8px] sm:text-[10px] md:text-xs font-bold rounded-full">
                    {slide.tag}
                  </span>

                  <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-black text-white leading-tight font-akira whitespace-nowrap">
                    {slide.title}
                  </h1>

                  <p className="text-xs sm:text-sm md:text-base lg:text-lg text-[#b90e0a] font-semibold leading-snug">
                    {slide.subtitle}
                  </p>

                  <p className="hidden sm:block text-[10px] sm:text-xs md:text-sm lg:text-base text-white/90 max-w-sm lg:max-w-md leading-snug line-clamp-2 md:line-clamp-none font-medium">
                    {slide.description}
                  </p>

                  {slide.price && (
                    <div className="text-sm sm:text-base md:text-lg lg:text-xl font-black text-white">
                      {slide.price}
                    </div>
                  )}

                    <div className="flex gap-2 pointer-events-auto pt-1">
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
                              productsSection.scrollIntoView({ behavior: "smooth", block: "start" });
                            }
                          }
                        }}
                        className="bg-[#b90e0a] hover:bg-[#8a0a08] text-white font-bold px-3 py-2 sm:px-4 sm:py-2.5 md:px-6 md:py-3 text-[10px] sm:text-xs md:text-sm rounded-full transition-all duration-300 hover:scale-105 group"
                      >
                        {slide.buttonText}
                        <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 ml-1 sm:ml-1.5 group-hover:translate-x-1 transition-transform inline" />
                      </Button>
                    </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="absolute bottom-3 sm:bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex gap-1 sm:gap-1.5 z-30 pointer-events-auto">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCurrentSlide(idx);
              }}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-1 sm:h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
                idx === currentSlide
                  ? "w-5 sm:w-7 bg-[#b90e0a] shadow-lg shadow-[#b90e0a]/50"
                  : "w-1 sm:w-1.5 bg-white/30 hover:bg-white/50"
              }`}
            />
          ))}
        </div>

        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setCurrentSlide(currentSlide === 0 ? heroSlides.length - 1 : currentSlide - 1);
          }}
          aria-label="Previous slide"
          className="hidden sm:flex absolute left-2 sm:left-3 md:left-6 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-[#b90e0a] p-1.5 sm:p-2 rounded-full transition-all duration-300 hover:scale-110 z-30 cursor-pointer backdrop-blur-sm pointer-events-auto"
        >
          <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" />
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setCurrentSlide(currentSlide === heroSlides.length - 1 ? 0 : currentSlide + 1);
          }}
          aria-label="Next slide"
          className="hidden sm:flex absolute right-2 sm:right-3 md:right-6 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-[#b90e0a] p-1.5 sm:p-2 rounded-full transition-all duration-300 hover:scale-110 z-30 cursor-pointer backdrop-blur-sm pointer-events-auto"
        >
          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" />
        </button>
      </section>

      {/* Main Content */}
      <main className="relative z-10">
        {/* Collection Header */}
        <section 
          id="products-section"
          ref={(el) => { if (el) sectionRefs.current["products-section"] = el; }}
          className={`bg-[#fafafa] pt-10 sm:pt-12 lg:pt-16 pb-5 sm:pb-8 px-5 sm:px-8 lg:px-12 max-w-[1600px] mx-auto transition-all duration-1000 ${
            visibleSections.has("products-section") || skipAnimations
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          <div className="text-center mb-5 sm:mb-8">
            <span className="text-[#b90e0a] font-semibold tracking-[0.12em] text-[9px] sm:text-[10px] uppercase mb-2 block">The Collection</span>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black mb-2 sm:mb-3 font-akira text-[#0a0a0a] tracking-tight">
              ASTITVA <span className="text-[#b90e0a]">ACT-I</span>
            </h2>
            <p className="text-[#4a4a4a] text-[10px] sm:text-xs lg:text-sm max-w-md mx-auto leading-snug font-medium">
              Statement pieces crafted for those who dare to stand out.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex justify-center gap-2 sm:gap-2.5 flex-wrap">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full font-bold text-[10px] sm:text-xs tracking-wide transition-all duration-300 hover:scale-105 ${
                  selectedCategory === category
                    ? "bg-[#0a0a0a] text-white shadow-md"
                    : "bg-white text-[#3a3a3a] hover:bg-[#0a0a0a] hover:text-white border border-neutral-200 shadow-sm"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        {/* Product Grid */}
        <section 
          id="product-grid"
          ref={(el) => { if (el) sectionRefs.current["product-grid"] = el; }}
          className={`bg-[#fafafa] px-5 sm:px-8 lg:px-12 max-w-[1600px] mx-auto pb-10 sm:pb-14 lg:pb-20 transition-all duration-1000 delay-100 ${
            visibleSections.has("product-grid") || skipAnimations
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 lg:gap-5">
            {filteredProducts.map((product, index) => (
              <div
                key={product.id}
                className="group cursor-pointer bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border border-neutral-100 w-[calc(50%-6px)] sm:w-[calc(50%-8px)] lg:w-[calc(25%-15px)] max-w-[280px]"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'instant' });
                  onSelectProduct(product.id);
                }}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative bg-[#f5f5f5] aspect-square overflow-hidden">
                  <div className="absolute top-1.5 sm:top-2 left-1.5 sm:left-2 z-10 flex flex-col gap-1 sm:gap-1.5 items-start">
                    {product.originalPrice && product.salePrice && (
                      <Badge className="bg-gradient-to-r from-[#4CAF50] to-[#2E7D32] text-white border-none shadow-sm font-bold rounded-full uppercase text-[7px] sm:text-[9px] px-1.5 sm:px-2 py-0.5 sm:py-1 animate-pulse">
                        {Math.round(
                          ((parseFloat(product.originalPrice.replace(/[₹,]/g, "")) -
                            parseFloat(product.salePrice.replace(/[₹,]/g, ""))) /
                            parseFloat(product.originalPrice.replace(/[₹,]/g, ""))) *
                            100
                        )}% OFF
                      </Badge>
                    )}
                    <Badge className="bg-white/95 backdrop-blur-sm text-[#0a0a0a] hover:bg-white border-none shadow-sm font-bold tracking-wider rounded-full uppercase text-[6px] sm:text-[8px] px-1.5 sm:px-2 py-0.5">
                      {product.tag}
                    </Badge>
                  </div>
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                    <span className="text-white font-bold text-[10px] sm:text-xs tracking-wider uppercase bg-[#b90e0a] px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                      View Details
                    </span>
                  </div>
                </div>
                <div className="p-2.5 sm:p-3 bg-white">
                  <h4 className="text-[10px] sm:text-xs md:text-sm font-bold font-akira group-hover:text-[#b90e0a] transition-colors text-[#0a0a0a] truncate">
                    {product.name}
                  </h4>
                  <p className="text-[8px] sm:text-[10px] md:text-xs text-[#5a5a5a] font-medium mt-0.5 mb-1 sm:mb-1.5 line-clamp-1">{product.category}</p>
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-xs sm:text-sm md:text-base text-[#0a0a0a]">{product.salePrice || product.price}</span>
                    {product.originalPrice && (
                      <span className="text-[8px] sm:text-[10px] md:text-xs text-[#8a8a8a] line-through">{product.originalPrice}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Why KALLKEYY Section */}
        <section 
          id="why-kallkeyy"
          ref={(el) => { if (el) sectionRefs.current["why-kallkeyy"] = el; }}
          className={`bg-[#f0f0f0] py-10 sm:py-14 lg:py-20 transition-all duration-1000 delay-200 ${
            visibleSections.has("why-kallkeyy") || skipAnimations
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          <div className="px-5 sm:px-8 lg:px-12 max-w-[1400px] mx-auto">
            <div className="text-center mb-6 sm:mb-10 lg:mb-12">
              <span className="text-[#b90e0a] font-semibold tracking-[0.12em] text-[9px] sm:text-[10px] uppercase mb-2 block">The Difference</span>
              <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black font-akira mb-2 sm:mb-3 text-[#0a0a0a] tracking-tight">
                WHY <span className="text-[#b90e0a]">KALLKEYY</span>?
              </h3>
              <p className="text-[#4a4a4a] text-[10px] sm:text-xs lg:text-sm max-w-md mx-auto leading-snug font-medium">
                We don't chase trends — we craft identity.
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
              <div className="group bg-white rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-lg transition-all duration-500 hover:-translate-y-1 border border-neutral-100">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-[#b90e0a] to-[#8a0a08] rounded-lg flex items-center justify-center mb-3 text-white group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <h4 className="text-[11px] sm:text-xs md:text-sm font-semibold text-[#0a0a0a] mb-1 group-hover:text-[#b90e0a] transition-colors">Premium Quality</h4>
                <p className="text-[8px] sm:text-[9px] lg:text-[10px] text-[#5a5a5a] leading-snug font-medium">
                  350gsm French Terry cotton. Built to last.
                </p>
              </div>
              <div className="group bg-white rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-lg transition-all duration-500 hover:-translate-y-1 border border-neutral-100">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-[#b90e0a] to-[#8a0a08] rounded-lg flex items-center justify-center mb-3 text-white group-hover:scale-110 transition-transform duration-300">
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <h4 className="text-[11px] sm:text-xs md:text-sm font-semibold text-[#0a0a0a] mb-1 group-hover:text-[#b90e0a] transition-colors">Limited Drops</h4>
                <p className="text-[8px] sm:text-[9px] lg:text-[10px] text-[#5a5a5a] leading-snug font-medium">
                  Small batches. Rare and exclusive.
                </p>
              </div>
              <div className="group bg-white rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-lg transition-all duration-500 hover:-translate-y-1 border border-neutral-100">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-[#b90e0a] to-[#8a0a08] rounded-lg flex items-center justify-center mb-3 text-white group-hover:scale-110 transition-transform duration-300">
                  <Star className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <h4 className="text-[11px] sm:text-xs md:text-sm font-semibold text-[#0a0a0a] mb-1 group-hover:text-[#b90e0a] transition-colors">Authentic Design</h4>
                <p className="text-[8px] sm:text-[9px] lg:text-[10px] text-[#5a5a5a] leading-snug font-medium">
                  Street culture meets mythology.
                </p>
              </div>
              <div className="group bg-white rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-lg transition-all duration-500 hover:-translate-y-1 border border-neutral-100">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-[#b90e0a] to-[#8a0a08] rounded-lg flex items-center justify-center mb-3 text-white group-hover:scale-110 transition-transform duration-300">
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <h4 className="text-[11px] sm:text-xs md:text-sm font-semibold text-[#0a0a0a] mb-1 group-hover:text-[#b90e0a] transition-colors">Community First</h4>
                <p className="text-[8px] sm:text-[9px] lg:text-[10px] text-[#5a5a5a] leading-snug font-medium">
                  Your voice shapes our direction.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Design Process Section - Inspired by kallkeyy.com */}
        <section 
          id="design-process"
          ref={(el) => { if (el) sectionRefs.current["design-process"] = el; }}
          className={`bg-[#111111] text-white py-12 sm:py-16 lg:py-20 relative overflow-hidden transition-all duration-1000 delay-300 ${
            visibleSections.has("design-process") || skipAnimations
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(185,14,10,0.08),transparent_70%)]"></div>
          <div className="px-5 sm:px-8 lg:px-12 max-w-[1400px] mx-auto relative z-10">
            <div className="text-center mb-8 sm:mb-10 lg:mb-14">
              <span className="text-[#b90e0a] font-semibold tracking-[0.12em] text-[9px] sm:text-[10px] uppercase mb-2 block">How We Create</span>
              <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black font-akira mb-2 sm:mb-3 tracking-tight">
                THE <span className="text-[#b90e0a]">PROCESS</span>
              </h3>
              <p className="text-gray-400 text-[10px] sm:text-xs lg:text-sm max-w-md mx-auto leading-snug font-medium">
                From mythology to streetwear — every piece tells a story.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
              {/* Step 1 */}
              <div className="group bg-white/5 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-white/10 hover:border-[#b90e0a]/30 hover:bg-white/10 transition-all duration-500 hover:-translate-y-1">
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                  <span className="text-xl sm:text-2xl font-black text-[#b90e0a] font-akira">01</span>
                  <div className="h-px flex-1 bg-gradient-to-r from-[#b90e0a]/50 to-transparent"></div>
                </div>
                <h4 className="text-xs sm:text-sm font-semibold mb-1.5 group-hover:text-[#b90e0a] transition-colors">Mythology Research</h4>
                <p className="text-gray-400 text-[8px] sm:text-[9px] lg:text-[10px] leading-snug font-medium">
                  Deep dive into ancient tales that resonate with modern rebellion.
                </p>
              </div>
              {/* Step 2 */}
              <div className="group bg-white/5 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-white/10 hover:border-[#b90e0a]/30 hover:bg-white/10 transition-all duration-500 hover:-translate-y-1">
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                  <span className="text-xl sm:text-2xl font-black text-[#b90e0a] font-akira">02</span>
                  <div className="h-px flex-1 bg-gradient-to-r from-[#b90e0a]/50 to-transparent"></div>
                </div>
                <h4 className="text-xs sm:text-sm font-semibold mb-1.5 group-hover:text-[#b90e0a] transition-colors">Design & Sketch</h4>
                <p className="text-gray-400 text-[8px] sm:text-[9px] lg:text-[10px] leading-snug font-medium">
                  Hand-drawn artwork refined digitally. Every line carries intent.
                </p>
              </div>
              {/* Step 3 */}
              <div className="group bg-white/5 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-white/10 hover:border-[#b90e0a]/30 hover:bg-white/10 transition-all duration-500 hover:-translate-y-1">
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                  <span className="text-xl sm:text-2xl font-black text-[#b90e0a] font-akira">03</span>
                  <div className="h-px flex-1 bg-gradient-to-r from-[#b90e0a]/50 to-transparent"></div>
                </div>
                <h4 className="text-xs sm:text-sm font-semibold mb-1.5 group-hover:text-[#b90e0a] transition-colors">Premium Production</h4>
                <p className="text-gray-400 text-[8px] sm:text-[9px] lg:text-[10px] leading-snug font-medium">
                  350gsm cotton, screen-printed graphics, quality checks.
                </p>
              </div>
              {/* Step 4 */}
              <div className="group bg-white/5 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-white/10 hover:border-[#b90e0a]/30 hover:bg-white/10 transition-all duration-500 hover:-translate-y-1">
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                  <span className="text-xl sm:text-2xl font-black text-[#b90e0a] font-akira">04</span>
                  <div className="h-px flex-1 bg-gradient-to-r from-[#b90e0a]/50 to-transparent"></div>
                </div>
                <h4 className="text-xs sm:text-sm font-semibold mb-1.5 group-hover:text-[#b90e0a] transition-colors">Limited Drop</h4>
                <p className="text-gray-400 text-[8px] sm:text-[9px] lg:text-[10px] leading-snug font-medium">
                  Small batches ensure exclusivity. When it's gone, it's gone.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Our Story Section - Light Theme */}
        <section 
          id="our-story"
          ref={(el) => { if (el) sectionRefs.current["our-story"] = el; }}
          className={`bg-[#f5f5f5] py-12 sm:py-16 lg:py-24 transition-all duration-1000 delay-400 ${
            visibleSections.has("our-story") || skipAnimations
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          <div className="px-5 sm:px-8 lg:px-12 max-w-[1200px] mx-auto">
            {/* Card Container */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-10 lg:p-14 border border-neutral-200 shadow-sm">
              {/* Centered Heading */}
              <div className="text-center mb-8 sm:mb-10 lg:mb-12">
                <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black font-akira text-[#0a0a0a] tracking-tight">
                  OUR <span className="text-[#b90e0a]">STORY</span>
                </h3>
                <div className="w-16 sm:w-20 h-0.5 bg-[#b90e0a] mx-auto mt-3 sm:mt-4"></div>
              </div>

              {/* 50/50 Content Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 lg:gap-14 items-center">
                {/* Left - Text Content */}
                <div className="space-y-3 sm:space-y-4">
                  <p className="text-[#2a2a2a] text-xs sm:text-sm lg:text-base leading-snug font-medium">
                    Streetwear has always been loud, but it never spoke our language. Inspired by the raw energy of urban culture, we create pieces that speak to those who refuse to blend in.
                  </p>
                  <p className="text-[#3a3a3a] text-xs sm:text-sm lg:text-base leading-snug font-medium">
                    We created KALLKEYY to fill a void – streetwear that's not just fashion, but a statement.
                  </p>
                  <p className="text-[#5a5a5a] text-[11px] sm:text-xs lg:text-sm leading-snug font-medium">
                    Every stitch, every design choice is intentional. We're crafting statements, building a movement, and redefining streetwear.
                  </p>
                  
                  {/* Tags */}
                  <div className="flex flex-nowrap gap-1.5 sm:gap-3 pt-2 sm:pt-4">
                    <span className="border border-[#b90e0a] text-[#b90e0a] px-2.5 sm:px-5 py-1.5 sm:py-2.5 rounded-full text-[8px] sm:text-xs font-semibold tracking-wide hover:bg-[#b90e0a] hover:text-white transition-all duration-300 whitespace-nowrap">EST. 2025</span>
                    <span className="bg-[#b90e0a] text-white px-2.5 sm:px-5 py-1.5 sm:py-2.5 rounded-full text-[8px] sm:text-xs font-semibold tracking-wide hover:bg-[#8a0a08] transition-all duration-300 whitespace-nowrap">100% AUTHENTIC</span>
                    <span className="bg-[#b90e0a] text-white px-2.5 sm:px-5 py-1.5 sm:py-2.5 rounded-full text-[8px] sm:text-xs font-semibold tracking-wide hover:bg-[#8a0a08] transition-all duration-300 whitespace-nowrap">STREETWEAR</span>
                  </div>
                </div>

                {/* Right - Dark Card with Gradient */}
                <div className="relative">
                  <div className="aspect-[4/3] bg-gradient-to-br from-[#1a1a1a] via-[#0f0f0f] to-[#1a1a1a] rounded-xl sm:rounded-2xl border border-neutral-300 overflow-hidden relative group shadow-lg">
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#b90e0a]/5 via-transparent to-[#b90e0a]/10"></div>
                    
                    {/* Arrow Icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg 
                        className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 text-[#b90e0a]/60 group-hover:text-[#b90e0a] group-hover:scale-110 transition-all duration-500" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 17V7" />
                      </svg>
                    </div>
                    
                    {/* Growing Community Button */}
                    <div className="absolute bottom-4 right-4">
                      <button 
                        onClick={onBackToMain}
                        className="bg-[#b90e0a] hover:bg-[#8a0a08] text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-[10px] sm:text-xs font-bold tracking-wider uppercase transition-all duration-300 hover:scale-105 shadow-lg"
                      >
                        GROWING COMMUNITY
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Instagram Section */}
        <section 
          id="instagram"
          ref={(el) => { if (el) sectionRefs.current["instagram"] = el; }}
          className={`bg-white py-10 sm:py-14 lg:py-18 border-t border-neutral-100 transition-all duration-1000 delay-500 ${
            visibleSections.has("instagram") || skipAnimations
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          <div className="max-w-[1400px] mx-auto">
            <div className="text-center mb-6 sm:mb-8 lg:mb-10 px-5 sm:px-8 lg:px-12">
              <span className="text-[#b90e0a] font-semibold tracking-[0.12em] text-[9px] sm:text-[10px] uppercase mb-2 block">Social</span>
              <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black mb-2 font-akira text-[#0a0a0a] tracking-tight">
                FOLLOW OUR <span className="text-[#b90e0a]">JOURNEY</span>
              </h3>
              <p className="text-[#6a6a6a] text-[10px] sm:text-xs lg:text-sm font-normal">
                @kall.keyy on Instagram
              </p>
            </div>

            {/* Instagram Reels Container - Fixed width approach */}
            <div className="instagram-scroll-container overflow-x-auto pb-3">
              <div className="flex gap-3 sm:gap-4 px-5 sm:px-8 lg:px-12 lg:justify-center" style={{ minWidth: 'min-content' }}>
                {instagramReels.map((reel, index) => (
                  <div
                    key={reel.id}
                    className="instagram-reel-card flex-shrink-0 rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1 border border-neutral-200 bg-white overflow-hidden"
                    style={{ 
                      width: '328px',
                      height: '420px',
                      animationDelay: `${index * 100}ms`
                    }}
                  >
                    {/* Instagram Embed Container - Properly sized */}
                    <div 
                      className="relative w-full h-full overflow-hidden"
                    >
                      <div 
                        className="absolute top-0 left-1/2"
                        style={{ 
                          transform: 'translateX(-50%)',
                          width: '328px'
                        }}
                      >
                        <InstagramEmbed
                          url={reel.url}
                          width={328}
                          captioned={false}
                          placeholderSpinner={
                            <div className="flex items-center justify-center h-[420px] bg-[#fafafa]">
                              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#b90e0a]" />
                            </div>
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center mt-5 sm:mt-6 lg:mt-8 px-5 sm:px-8 lg:px-12">
              <Button
                onClick={() => window.open("https://www.instagram.com/kall.keyy/", "_blank")}
                className="bg-[#0a0a0a] hover:bg-[#b90e0a] text-white font-bold px-4 sm:px-5 py-2 sm:py-2.5 text-[10px] sm:text-xs rounded-full transition-all duration-300 group hover:scale-105"
              >
                <Instagram className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1.5" />
                Follow @kall.keyy
                <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-[#111] text-white py-8 sm:py-12 lg:py-16 px-5 sm:px-8 lg:px-12 border-t border-white/10">
        <div className="max-w-[1600px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 lg:gap-12">
          <div className="col-span-2 md:col-span-1 space-y-3 sm:space-y-4">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black font-akira tracking-wider cursor-pointer hover:text-[#b90e0a] transition-colors" onClick={onBackToMain}>KALLKEYY</h2>
            <p className="text-gray-400 text-[10px] sm:text-xs lg:text-sm leading-relaxed">
              Redefining streetwear with bold designs and premium quality. 
              Wear your identity.
            </p>
          </div>
          
          <div>
            <h3 className="font-bold text-xs sm:text-sm lg:text-base mb-3 sm:mb-4 lg:mb-5 tracking-wide">SHOP</h3>
            <ul className="space-y-1.5 sm:space-y-2 lg:space-y-3 text-gray-400 text-[10px] sm:text-xs lg:text-sm">
              <li><button onClick={() => onNavigateToShop ? onNavigateToShop() : handleUnavailablePage("Shop")} className="hover:text-[#b90e0a] transition-colors">All Products</button></li>
              <li><button onClick={() => onNavigateToShop ? onNavigateToShop() : handleUnavailablePage("Shop")} className="hover:text-[#b90e0a] transition-colors">New Arrivals</button></li>
              <li><button onClick={() => onNavigateToShop ? onNavigateToShop() : handleUnavailablePage("Shop")} className="hover:text-[#b90e0a] transition-colors">Best Sellers</button></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-xs sm:text-sm lg:text-base mb-3 sm:mb-4 lg:mb-5 tracking-wide">SUPPORT</h3>
            <ul className="space-y-1.5 sm:space-y-2 lg:space-y-3 text-gray-400 text-[10px] sm:text-xs lg:text-sm">
              <li><button onClick={() => onNavigateToOrders ? onNavigateToOrders() : handleUnavailablePage("Orders")} className="hover:text-[#b90e0a] transition-colors">Track Order</button></li>
              <li><button onClick={() => onNavigateToShipping ? onNavigateToShipping() : handleUnavailablePage("Shipping")} className="hover:text-[#b90e0a] transition-colors">Shipping Info</button></li>
              <li><button onClick={() => onNavigateToReturns ? onNavigateToReturns() : handleUnavailablePage("Returns")} className="hover:text-[#b90e0a] transition-colors">Returns</button></li>
              <li><button onClick={() => onNavigateToSizeGuide ? onNavigateToSizeGuide() : handleUnavailablePage("Size Guide")} className="hover:text-[#b90e0a] transition-colors">Size Guide</button></li>
              <li><button onClick={() => onNavigateToFAQ ? onNavigateToFAQ() : handleUnavailablePage("FAQ")} className="hover:text-[#b90e0a] transition-colors">FAQs</button></li>
              <li><button onClick={() => onNavigateToContact ? onNavigateToContact() : handleUnavailablePage("Contact")} className="hover:text-[#b90e0a] transition-colors">Contact Us</button></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-xs sm:text-sm lg:text-base mb-3 sm:mb-4 lg:mb-5 tracking-wide">LEGAL</h3>
            <ul className="space-y-1.5 sm:space-y-2 lg:space-y-3 text-gray-400 text-[10px] sm:text-xs lg:text-sm">
              <li><button onClick={() => onNavigateToPrivacyPolicy ? onNavigateToPrivacyPolicy() : handleUnavailablePage("Privacy Policy")} className="hover:text-[#b90e0a] transition-colors">Privacy Policy</button></li>
              <li><button onClick={() => onNavigateToTermsOfService ? onNavigateToTermsOfService() : handleUnavailablePage("Terms of Service")} className="hover:text-[#b90e0a] transition-colors">Terms of Service</button></li>
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

      {/* Styles */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.5s ease-out;
        }
        .animate-slideDown {
          animation: slideDown 0.4s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.4s ease-out;
        }
        
        /* Custom Instagram Scrollbar */
        .instagram-scroll-container {
          scrollbar-width: thin;
          scrollbar-color: #b90e0a #e8e8e8;
        }
        .instagram-scroll-container::-webkit-scrollbar {
          height: 4px;
        }
        .instagram-scroll-container::-webkit-scrollbar-track {
          background: #e8e8e8;
          border-radius: 10px;
        }
        .instagram-scroll-container::-webkit-scrollbar-thumb {
          background: linear-gradient(90deg, #b90e0a, #d41212, #b90e0a);
          border-radius: 10px;
        }
        .instagram-scroll-container::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(90deg, #8a0a08, #b90e0a, #8a0a08);
        }
        
        /* Instagram Reel Card Styling */
        .instagram-reel-card {
          position: relative;
        }
        .instagram-reel-card iframe {
          border-radius: 12px !important;
        }
        
        @media (min-width: 1024px) {
          .instagram-scroll-container::-webkit-scrollbar {
            height: 0;
            display: none;
          }
          .instagram-scroll-container {
            scrollbar-width: none;
          }
        }
        
        /* Subtle hover transitions */
        .hover-lift {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .hover-lift:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 40px rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
}
