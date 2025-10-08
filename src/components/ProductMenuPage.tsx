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
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface HeroSlide {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  description: string;
  tag: string;
  price: string;
  isUpcoming: boolean;
}

interface InstagramReel {
  id: string;
  thumbnail: string;
  title: string;
  views: string;
  link: string;
  likes: string;
}

interface Product {
  id: string;
  name: string;
  image: string;
  price: string;
  tag: string;
  description: string;
  features: string[];
}

interface FeatureCard {
  icon: JSX.Element;
  title: string;
  description: string;
  highlight: string;
}

const heroSlides: HeroSlide[] = [
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
  },
  {
    id: "tshirt",
    image: "/hoodie-front.png",
    title: "SIGNATURE TEE",
    subtitle: "Your everyday statement",
    description: "Ultra-soft 260 GSM cotton with bold brand lock-up.",
    tag: "NEW DROP",
    price: "₹1,499",
    isUpcoming: false,
  },
  {
    id: "vest",
    image: "/hero-vest.jpg",
    title: "PUFFER VEST",
    subtitle: "Winter '25 preview",
    description:
      "Lightweight but lethal. Quilted nylon shell stuffed with recycled fill.",
    tag: "UPCOMING",
    price: "₹4,999",
    isUpcoming: true,
  },
];

const instagramReels: InstagramReel[] = [
  {
    id: "reel-1",
    thumbnail: "/reel-thumb-1.jpg",
    title: "Behind the Scenes: Making of Essential Hoodie",
    views: "125K",
    likes: "8.2K",
    link: "https://instagram.com/kallkeyy/reel/1",
  },
  {
    id: "reel-2",
    thumbnail: "/reel-thumb-2.jpg",
    title: "Street Style: How to Rock KALLKEYY",
    views: "98K",
    likes: "6.5K",
    link: "https://instagram.com/kallkeyy/reel/2",
  },
  {
    id: "reel-3",
    thumbnail: "/reel-thumb-3.jpg",
    title: "New Drop Alert: Signature Tee Collection",
    views: "156K",
    likes: "12.1K",
    link: "https://instagram.com/kallkeyy/reel/3",
  },
  {
    id: "reel-4",
    thumbnail: "/reel-thumb-4.jpg",
    title: "Community Vibes: KALLKEYY in the Wild",
    views: "87K",
    likes: "5.8K",
    link: "https://instagram.com/kallkeyy/reel/4",
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
}

export default function ProductMenuPage({
  onSelectProduct,
  onBackToMain,
  onNavigateToShop,
  onNavigateToAbout,
  onNavigateToContact,
}: Props) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState("");

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

  const handleReelClick = (reel: InstagramReel) => {
    toast({
      title: "Opening Instagram...",
      description: `${reel.title} - ${reel.views} views`,
      duration: 2000,
    });
    // In production, this would open: window.open(reel.link, '_blank');
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput) {
      toast({
        title: "Welcome to the family! 🎉",
        description: "You'll be the first to know about new drops.",
        duration: 3000,
      });
      setEmailInput("");
    }
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
      <nav className="relative z-20 border-b border-white/10 bg-black/90 backdrop-blur-md sticky top-0">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1
                className="text-4xl font-black tracking-widest hover:text-[#DD0004] transition-colors duration-300 cursor-pointer"
                onClick={onBackToMain}
              >
                KALLKEYY
              </h1>
            </div>

            <div className="hidden md:flex gap-6 text-lg font-bold">
              <button
                onClick={() => onBackToMain()}
                className="hover:text-[#DD0004] transition-colors duration-300 px-6 py-3 hover:bg-white/5 rounded-lg"
              >
                HOME
              </button>
              <button
                onClick={() =>
                  onNavigateToShop
                    ? onNavigateToShop()
                    : handleUnavailablePage("Shop")
                }
                className="hover:text-[#DD0004] transition-colors duration-300 px-6 py-3 hover:bg-white/5 rounded-lg"
              >
                SHOP
              </button>
              <button
                onClick={() =>
                  onNavigateToAbout
                    ? onNavigateToAbout()
                    : handleUnavailablePage("About")
                }
                className="hover:text-[#DD0004] transition-colors duration-300 px-6 py-3 hover:bg-white/5 rounded-lg"
              >
                ABOUT
              </button>
              <button
                onClick={() =>
                  onNavigateToContact
                    ? onNavigateToContact()
                    : handleUnavailablePage("Contact")
                }
                className="hover:text-[#DD0004] transition-colors duration-300 px-6 py-3 hover:bg-white/5 rounded-lg"
              >
                CONTACT
              </button>
            </div>

            <button
              className="md:hidden text-white hover:text-[#DD0004] transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={32} /> : <Menu size={32} />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden mt-6 pb-4 space-y-4 text-lg font-bold border-t border-white/10 pt-4">
              <button
                onClick={() => {
                  onBackToMain();
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left hover:text-[#DD0004] transition-colors duration-300 px-4 py-3 hover:bg-white/5 rounded-lg"
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
                className="block w-full text-left hover:text-[#DD0004] transition-colors duration-300 px-4 py-3 hover:bg-white/5 rounded-lg"
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
                className="block w-full text-left hover:text-[#DD0004] transition-colors duration-300 px-4 py-3 hover:bg-white/5 rounded-lg"
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
                className="block w-full text-left hover:text-[#DD0004] transition-colors duration-300 px-4 py-3 hover:bg-white/5 rounded-lg"
              >
                CONTACT
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* FULL-WIDTH HERO SLIDESHOW */}
      <div className="relative z-10 w-full">
        <div className="relative h-[600px] md:h-[700px] lg:h-[800px] overflow-hidden">
          {heroSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                index === currentSlide
                  ? "opacity-100 translate-x-0"
                  : index < currentSlide
                  ? "opacity-0 -translate-x-full"
                  : "opacity-0 translate-x-full"
              }`}
            >
              <div className="relative h-full w-full">
                <div className="absolute inset-0">
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display =
                        "none";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/40" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                </div>

                <div className="relative z-10 h-full flex items-center">
                  <div className="w-full px-6 md:px-12 lg:px-24">
                    <div className="max-w-3xl">
                      <div className="mb-6">
                        <span
                          className={`inline-block px-4 py-2 rounded-full text-sm font-bold border-2 ${
                            slide.isUpcoming
                              ? "bg-[#FFA500]/20 border-[#FFA500] text-[#FFA500]"
                              : "bg-[#DD0004]/20 border-[#DD0004] text-[#DD0004]"
                          }`}
                        >
                          {slide.tag}
                        </span>
                      </div>

                      <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-4 tracking-tight leading-tight">
                        {slide.title}
                      </h2>

                      <p className="text-xl md:text-2xl text-[#CCCCCC] mb-6 font-medium">
                        {slide.subtitle}
                      </p>

                      <p className="text-base md:text-lg text-[#808088] mb-8 leading-relaxed max-w-xl">
                        {slide.description}
                      </p>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mb-8">
                        <div className="text-4xl font-black text-[#DD0004]">
                          {slide.price}
                        </div>
                        {slide.isUpcoming && (
                          <div className="text-sm text-[#808088] bg-[#1C1C21] px-4 py-2 rounded-full border border-white/10">
                            Expected Launch: Q1 2025
                          </div>
                        )}
                      </div>

                      <Button
                        onClick={() => handleSlideClick(slide)}
                        className={`group font-bold py-4 px-8 text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                          slide.isUpcoming
                            ? "bg-[#FFA500] hover:bg-[#FF8C00] text-white"
                            : "bg-[#DD0004] hover:bg-[#BB0003] text-white"
                        }`}
                      >
                        {slide.isUpcoming ? "NOTIFY ME" : "SHOP NOW"}
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3 z-20">
                  {heroSlides.map((_, idx) => (
                    <button
                      key={`indicator-${idx}`}
                      onClick={() => setCurrentSlide(idx)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        idx === currentSlide
                          ? "bg-[#DD0004] w-8"
                          : "bg-white/30 hover:bg-white/50"
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
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
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-6xl font-black mb-4">
            THE <span className="text-[#DD0004]">COLLECTION</span>
          </h2>
          <div className="w-32 h-1 bg-[#DD0004] mx-auto mb-6" />
          <p className="text-[#808088] text-lg max-w-2xl mx-auto leading-relaxed">
            Limited edition pieces crafted for those who dare to stand out. Each
            design tells a story of rebellion and authenticity.
          </p>
        </div>

        {/* PRODUCT GRID - ENHANCED */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto mb-24">
          {products.map((product, index) => (
            <div
              key={product.id}
              className="group relative bg-gradient-to-br from-[#28282B] to-[#1C1C21] backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:border-[#DD0004]/50 transition-all duration-500 animate-slide-in-up hover:shadow-2xl hover:shadow-[#DD0004]/20"
              style={{ animationDelay: `${index * 0.2}s` }}
              onMouseEnter={() => setHoveredProduct(product.id)}
              onMouseLeave={() => setHoveredProduct(null)}
            >
              {/* Chain decoration */}
              <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-40 transition-opacity duration-300 z-10">
                <svg width="40" height="40" viewBox="0 0 60 60" fill="none">
                  <circle
                    cx="15"
                    cy="30"
                    r="12"
                    stroke="#DD0004"
                    strokeWidth="2"
                  />
                  <circle
                    cx="45"
                    cy="30"
                    r="12"
                    stroke="#DD0004"
                    strokeWidth="2"
                  />
                  <line
                    x1="27"
                    y1="30"
                    x2="33"
                    y2="30"
                    stroke="#DD0004"
                    strokeWidth="2"
                  />
                </svg>
              </div>

              {/* Product tag */}
              <div className="absolute top-4 left-4 z-10">
                <span className="bg-[#DD0004] text-white px-3 py-1 text-xs font-bold rounded-full shadow-lg">
                  {product.tag}
                </span>
              </div>

              {/* Product image */}
              <div className="aspect-square bg-black/40 relative overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className={`w-full h-full object-cover transition-transform duration-700 ${
                    hoveredProduct === product.id ? "scale-110" : "scale-100"
                  }`}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.opacity = "0";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                <div
                  className={`absolute inset-0 transition-all duration-500 ${
                    hoveredProduct === product.id
                      ? "bg-[#DD0004]/10"
                      : "bg-transparent"
                  }`}
                />

                {/* Hover overlay with features */}
                <div
                  className={`absolute inset-0 bg-black/90 p-8 flex flex-col justify-center transition-all duration-500 ${
                    hoveredProduct === product.id
                      ? "opacity-100"
                      : "opacity-0 pointer-events-none"
                  }`}
                >
                  <h4 className="text-xl font-bold mb-4 text-[#DD0004]">
                    KEY FEATURES
                  </h4>
                  <ul className="space-y-2">
                    {product.features.map((feature, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-2 text-white/90"
                      >
                        <Star className="w-4 h-4 text-[#DD0004]" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Product info */}
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-2xl font-black group-hover:text-[#DD0004] transition-colors duration-300 mb-2">
                      {product.name}
                    </h3>
                    <p className="text-sm text-[#808088]">
                      {product.description}
                    </p>
                  </div>
                  <span className="text-2xl font-bold text-[#DD0004] whitespace-nowrap ml-4">
                    {product.price}
                  </span>
                </div>

                <button
                  onClick={() => onSelectProduct(product.id)}
                  className="w-full bg-[#FFFFFF] text-black hover:bg-[#BB0003] hover:text-white hover:shadow-xl font-bold py-4 px-8 text-base transition-all duration-300 rounded-2xl group-hover:scale-105 flex items-center justify-center gap-2"
                >
                  VIEW DETAILS
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-[#DD0004]/30 group-hover:border-[#DD0004] transition-colors duration-300" />
              <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-[#DD0004]/30 group-hover:border-[#DD0004] transition-colors duration-300" />
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

        {/* INSTAGRAM REELS SECTION - WITH THUMBNAILS */}
        <div className="max-w-7xl mx-auto mb-24">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-5xl font-black mb-4">
              FOLLOW <span className="text-[#DD0004]">OUR JOURNEY</span>
            </h3>
            <div className="w-24 h-1 bg-[#DD0004] mx-auto mb-4" />
            <p className="text-[#808088] text-lg">
              Check out our latest drops and behind-the-scenes content
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {instagramReels.map((reel) => (
              <div
                key={reel.id}
                className="group relative bg-[#28282B] rounded-xl overflow-hidden border border-white/10 hover:border-[#DD0004]/50 transition-all duration-300 hover:scale-105 cursor-pointer"
                onClick={() => handleReelClick(reel)}
              >
                <div className="aspect-[9/16] bg-black/40 relative overflow-hidden">
                  <img
                    src={reel.thumbnail}
                    alt={reel.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      target.style.display = "none";
                      target.parentElement!.classList.add(
                        "flex",
                        "items-center",
                        "justify-center"
                      );
                      target.parentElement!.innerHTML =
                        '<div class="text-6xl opacity-20">📱</div>';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                  {/* Play button overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-[#DD0004]/80 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Instagram className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  {/* Reel info */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-white font-bold text-sm mb-2 line-clamp-2">
                      {reel.title}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-white/80">
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {reel.likes}
                      </span>
                      <span>{reel.views} views</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Button
              onClick={() => handleUnavailablePage("Instagram")}
              className="bg-[#DD0004] hover:bg-[#BB0003] text-white font-bold px-8 py-4 text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl group"
            >
              <Instagram className="w-5 h-5 mr-2" />
              FOLLOW US ON INSTAGRAM
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
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

              <form
                onSubmit={handleNewsletterSubmit}
                className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto"
              >
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="flex-1 px-6 py-4 bg-black/50 border border-white/20 rounded-xl text-white placeholder:text-[#808088] focus:outline-none focus:border-[#DD0004] transition-colors"
                />
                <Button
                  type="submit"
                  className="bg-[#DD0004] hover:bg-[#BB0003] text-white font-bold px-8 py-4 text-base transition-all duration-300 hover:scale-105 whitespace-nowrap"
                >
                  SUBSCRIBE
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </form>

              <p className="text-xs text-[#808088] mt-4">
                Join 10,000+ streetwear enthusiasts getting exclusive updates
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER - UNCHANGED */}
      <footer className="relative z-10 w-full bg-[#1a1919] border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-8">
            <div className="animate-fade-in-up">
              <h4 className="text-lg font-bold mb-4">ABOUT KALLKEYY</h4>
              <p className="text-[#808088] text-sm leading-relaxed">
                Born from the streets, driven by passion. We craft premium
                streetwear that speaks to the authentic urban lifestyle.
              </p>
            </div>
            <div
              className="animate-fade-in-up"
              style={{ animationDelay: "0.2s" }}
            >
              <h4 className="text-lg font-bold mb-4">QUICK LINKS</h4>
              <ul className="space-y-2 text-[#808088]">
                {["Shop", "About", "Contact", "Size Guide"].map((link) => (
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
      <style jsx>{`
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
