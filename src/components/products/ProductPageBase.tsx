"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import { 
  Menu, 
  X, 
  ArrowLeft, 
  Star, 
  ShoppingBag, 
  Heart, 
  Share2, 
  Ruler, 
  Truck, 
  RotateCcw, 
  ChevronDown, 
  ChevronUp,
  TrendingUp  // THIS WAS MISSING
} from "lucide-react"
import { useAuth } from "../../contexts/AuthContext";
import { LogOut } from "lucide-react";
import { useCart } from "../../contexts/CartContext";

interface ProductData {
  name: string
  price: string
  tag: string
  description: string
  images: string[]
  material: string[]
}

interface Props {
  onBackToMain?: () => void
  onNavigateToShop?: () => void
  onNavigateToAbout?: () => void
  onNavigateToContact?: () => void
  onNavigateToLogin: () => void;
  onNavigateToSignup: () => void;
  product: ProductData
  productId: string
}

const SIZE_CHART = {
  S: { chest: "36-38", length: "26", shoulder: "17" },
  M: { chest: "38-40", length: "27", shoulder: "18" },
  L: { chest: "40-42", length: "28", shoulder: "19" },
  XL: { chest: "42-44", length: "29", shoulder: "20" },
  XXL: { chest: "44-46", length: "30", shoulder: "21" },
}

const REVIEWS = [
  { name: "Arjun K.", rating: 5, comment: "Quality is insane! Perfect fit and feels premium.", days: 3 },
  { name: "Priya S.", rating: 5, comment: "Love the design and comfort. Worth every penny!", days: 5 },
  { name: "Rohit M.", rating: 4, comment: "Great product, runs slightly large but amazing quality.", days: 7 },
  { name: "Sneha D.", rating: 5, comment: "Obsessed with this! Can't wait for more drops.", days: 2 },
]

export default function ProductPageBase({
  onBackToMain,
  onNavigateToShop,
  onNavigateToAbout,
  onNavigateToContact,
  onNavigateToLogin,
  onNavigateToSignup,
  product,
  productId,
}: Props) {

  const { user, logout } = useAuth();
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState("")
  const [showSizeChart, setShowSizeChart] = useState(false)
  const [userRating, setUserRating] = useState(0)
  const [userReview, setUserReview] = useState("")
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [liked, setLiked] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)


  const submitReview = (e: React.FormEvent) => {
    e.preventDefault()
    if (userRating && userReview) {
      toast({
        title: "Review Submitted! ⭐",
        description: "Thank you for your feedback!",
      })
      setShowReviewForm(false)
      setUserRating(0)
      setUserReview("")
    }
  }

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size)
  }

  // const handleLike = () => {
  //   setLiked(!liked)
  //   toast({
  //     title: liked ? "Removed from wishlist 💔" : "Added to wishlist! ❤️",
  //     description: liked ? "You can add it back anytime." : "We'll notify you about updates!",
  //   })
  // }

  const handleShare = async () => {
    try {
      const url = window.location.href
      await navigator.clipboard.writeText(url)
      toast({
        title: "Link Copied! 🔗",
        description: "Product URL copied to clipboard!",
      })
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Could not copy link. Please try again.",
        variant: "destructive",
      })
    }
  }

  const [activeIdx, setActiveIdx] = useState(0)

  useEffect(() => {
    const KEY = "kallkeyy:galleryIdx"
    const saved = sessionStorage.getItem(KEY)
    if (saved !== null) setActiveIdx(Number(saved))
  }, [])

  useEffect(() => {
    sessionStorage.setItem("kallkeyy:galleryIdx", String(activeIdx))
  }, [activeIdx])

  const handleUnavailablePage = (pageName: string) => {
    toast({
      title: "Coming Soon",
      description: `Sorry, the ${pageName} page is not available yet. Stay tuned!`,
      duration: 3000,
    })
  }

  const handleAddToCart = async () => {
    // Check if user is logged in
    if (!user) {
      toast({
        variant: "destructive",
        title: "Login Required ⚠️",
        description: "Please login to add items to cart"
      });
      onNavigateToLogin();
      return;
    }

    // Check if size is selected
    if (!selectedSize) {
      toast({
        variant: "destructive",
        title: "Please select a size",
        description: "Choose a size before adding to cart"
      });
      return;
    }
    
    try {
      await addToCart({
        productId: productId,
        productName: product.name,
        size: selectedSize,
        price: parseFloat(product.price.replace('₹', '').replace(',', '')),
        image: product.images[0],
        quantity: 1
      });

      toast({
        title: "Added to Cart! 🎉",
        description: `${product.name} - Size ${selectedSize} added successfully`
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to add to cart",
        description: error instanceof Error ? error.message : "Please try again"
      });
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
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background corner decorations */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-64 h-64 bg-[#DD0004]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#DD0004]/10 rounded-full blur-3xl" />
      </div>

      {/* Floating elements throughout */}
      <div className="fixed inset-0 pointer-events-none opacity-5 z-0">
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
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

      {/* MAIN CONTENT */}
      <div className="container mx-auto px-4 py-12 relative z-10">
        <button
          onClick={onBackToMain}
          className="group flex items-center gap-2 text-[#808088] hover:text-white transition-all duration-300 mb-8 hover:translate-x-1"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
          Back to Home
        </button>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left: Product Images */}
          <div className="space-y-6 sticky top-24">
            <div className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 bg-[#28282B] group">
              <img
                src={product.images[activeIdx]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.opacity = "0"
                }}
                draggable={false}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-center justify-between">
                  <Badge className="bg-[#DD0004] text-white border-none px-4 py-2 text-sm font-bold">KALLKEYY</Badge>
                  <Badge className="bg-white/10 backdrop-blur-sm text-white border-white/20 px-4 py-2 text-sm font-bold">
                    {product.tag}
                  </Badge>
                </div>
              </div>
              <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-[#DD0004]/50" />
              <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-[#DD0004]/50" />
            </div>

            <div className="grid grid-cols-4 gap-4">
              {product.images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIdx(i)}
                  aria-label={`View image ${i + 1}`}
                  className={`aspect-square rounded-lg overflow-hidden border transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#DD0004] ${
                    activeIdx === i ? "border-[#DD0004] ring-1 ring-[#DD0004]" : "border-[#808088]/30 hover:border-white"
                  }`}
                >
                  <img
                    src={src}
                    alt={`${product.name} view ${i + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.opacity = "0"
                    }}
                    draggable={false}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Product Details */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Badge className="bg-[#DD0004]/20 text-[#DD0004] border border-[#DD0004] px-3 py-1 text-xs font-bold">
                  IN STOCK
                </Badge>
                <Badge className="bg-white/10 text-white border border-white/20 px-3 py-1 text-xs font-bold">
                  LIMITED EDITION
                </Badge>
              </div>

              <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">{product.name}</h1>

              <div className="flex items-center gap-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-[#DD0004] text-[#DD0004]" />
                  ))}
                </div>
                <span className="text-[#808088] text-sm">(247 reviews)</span>
              </div>

              <p className="text-2xl font-bold text-[#DD0004]">{product.price}</p>

              <p className="text-[#CCCCCC] leading-relaxed">{product.description}</p>

              <div className="border-t border-white/10 pt-6">
                <h3 className="text-sm font-bold text-white mb-4 tracking-wider">PRODUCT DETAILS</h3>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { icon: Ruler, text: "Premium Fit" },
                    { icon: Truck, text: "Fast Shipping" },
                    { icon: RotateCcw, text: "Easy Returns" },
                  ].map((item, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 p-4 bg-[#28282B] rounded-lg border border-white/10">
                      <item.icon className="w-6 h-6 text-[#DD0004]" />
                      <span className="text-xs text-center text-[#CCCCCC]">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Size Selection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white tracking-wider">SIZE</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSizeChart(!showSizeChart)}
                  className="border border-[#DD0004] text-[#DD0004] hover:bg-[#DD0004] hover:text-white transition-all duration-300 hover:scale-105"
                >
                  <Ruler className="w-4 h-4 mr-2" />
                  Size Chart {showSizeChart ? <ChevronUp className="ml-2 w-4 h-4" /> : <ChevronDown className="ml-2 w-4 h-4" />}
                </Button>
              </div>

              {/* ✅ ANIMATED SIZE CHART - Remove the conditional {showSizeChart && ...} */}
              <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  showSizeChart ? "max-h-[600px] opacity-100 mt-4" : "max-h-0 opacity-0 mt-0"
                }`}
              >
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h4 className="font-bold text-sm mb-3">Indian Size Chart (inches)</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-white/20">
                          <th className="text-left p-2">Size</th>
                          <th className="text-left p-2">Chest</th>
                          <th className="text-left p-2">Length</th>
                          <th className="text-left p-2">Shoulder</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(SIZE_CHART).map(([size, measurements]) => (
                          <tr key={size} className="border-b border-white/10">
                            <td className="p-2 font-semibold">{size}</td>
                            <td className="p-2">{measurements.chest}"</td>
                            <td className="p-2">{measurements.length}"</td>
                            <td className="p-2">{measurements.shoulder}"</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Size buttons */}
              <div className="grid grid-cols-5 gap-3">
                {Object.keys(SIZE_CHART).map((size) => (
                  <button
                    key={size}
                    onClick={() => handleSizeSelect(size)}
                    className={`py-3 px-4 border rounded-lg font-bold transition-all duration-300 hover:scale-105 ${
                      selectedSize === size
                        ? "border-[#DD0004] bg-[#DD0004] text-white shadow-lg shadow-[#DD0004]/20"
                        : "border-[#808088]/30 hover:border-white hover:shadow-lg"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <Button
                onClick={handleAddToCart}
                disabled={!selectedSize}
                className="w-full bg-gradient-to-r from-[#DD0004] to-[#FF0000] hover:from-[#FF0000] hover:to-[#DD0004] text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] py-4"
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                ADD TO CART
              </Button>

              <div className="grid grid-cols-1 gap-3">
                {/* <Button
                  onClick={handleLike}
                  variant="outline"
                  className={`border-white/20 hover:border-[#DD0004] transition-all duration-300 hover:scale-105 ${
                    liked ? "bg-[#DD0004]/20 border-[#DD0004] text-[#DD0004]" : ""
                  }`}
                >
                  <Heart className={`w-5 h-5 mr-2 ${liked ? "fill-[#DD0004]" : ""}`} />
                  {liked ? "Saved" : "Save"}
                </Button> */}
                <Button
                  onClick={handleShare}
                  variant="outline"
                  className="border-white/20 hover:border-[#DD0004] transition-all duration-300 hover:scale-105"
                >
                  <Share2 className="w-5 h-5 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            {/* Material & Care */}
            <div className="border-t border-white/10 pt-8 space-y-4">
              <h3 className="text-sm font-bold text-white tracking-wider">MATERIAL & CARE</h3>
              <div className="space-y-2">
                {product.material.map((item, i) => (
                  <p key={i} className="text-sm text-[#CCCCCC]">
                    {item}
                  </p>
                ))}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="border-t border-white/10 pt-8 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white tracking-wider">CUSTOMER REVIEWS</h3>
                <Button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  variant="outline"
                  size="sm"
                  className="border-[#DD0004] text-[#DD0004] hover:bg-[#DD0004] hover:text-white transition-all duration-300 hover:scale-105"
                >
                  <Star className="w-4 h-4 mr-2" />
                  Write Review
                </Button>
              </div>

              {showReviewForm && (
                <form onSubmit={submitReview} className="space-y-4 p-4 bg-[#28282B]/50 rounded-lg border border-white/10">
                  <div>
                    <label className="text-sm font-semibold text-[#CCCCCC] mb-2 block">Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setUserRating(star)}
                          className="p-1 hover:scale-110 transition-transform duration-300"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              star <= userRating ? "fill-[#DD0004] text-[#DD0004]" : "text-[#808088]"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-[#CCCCCC] mb-2 block">Your Review</label>
                    <textarea
                      value={userReview}
                      onChange={(e) => setUserReview(e.target.value)}
                      placeholder={`Share your experience with the ${productId === "tshirt" ? "tee" : "hoodie"}...`}
                      rows={4}
                      className="w-full bg-[#1C1C21] border border-[#808088]/30 rounded-lg p-3 text-white focus:border-[#DD0004] focus:ring-2 focus:ring-[#DD0004]/20 transition-all duration-300 resize-none"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-[#DD0004] hover:bg-[#DD0004]/90 text-white font-bold transition-all duration-300 hover:scale-105"
                  >
                    Submit Review
                  </Button>
                </form>
              )}

              <div className="space-y-4">
                {REVIEWS.map((review, i) => (
                  <div key={i} className="p-4 bg-[#28282B] rounded-lg border border-white/10">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#DD0004] flex items-center justify-center text-white font-bold flex-shrink-0">
                        {review.name.charAt(0)}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-white">{review.name}</h4>
                          <span className="text-xs text-[#808088]">{review.days}d ago</span>
                        </div>
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, j) => (
                            <Star
                              key={j}
                              className={`w-4 h-4 ${
                                j < review.rating ? "fill-[#DD0004] text-[#DD0004]" : "text-[#808088]"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-[#CCCCCC]">{review.comment}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
