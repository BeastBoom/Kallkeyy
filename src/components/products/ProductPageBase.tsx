"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
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

const PREORDER_KEY = "kallkeyy:preorderCount" as const

const getInitialCount = () => {
  try {
    const saved = sessionStorage.getItem(PREORDER_KEY)
    const n = saved ? Number.parseInt(saved, 10) : Number.NaN
    return Number.isFinite(n) ? n : 92
  } catch {
    return 92
  }
}

export default function ProductPageBase({
  onBackToMain,
  onNavigateToShop,
  onNavigateToAbout,
  onNavigateToContact,
  product,
  productId,
}: Props) {
  const [preorderCount, setPreorderCount] = useState(getInitialCount())

  useEffect(() => {
    try {
      sessionStorage.setItem(PREORDER_KEY, String(preorderCount))
    } catch {}
  }, [preorderCount])

  const [form, setForm] = useState({ name: "", email: "", phone: "", size: "" })
  const [open, setOpen] = useState(false)
  const [selectedSize, setSelectedSize] = useState("")
  const [showSizeChart, setShowSizeChart] = useState(false)
  const [userRating, setUserRating] = useState(0)
  const [userReview, setUserReview] = useState("")
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [liked, setLiked] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (form.name && form.email && form.size) {
      setPreorderCount((p) => p + 1)
      setOpen(false)
      toast({
        title: "Preorder Confirmed! 🔥",
        description: `You're #${preorderCount + 1} in line for the ${product.name}. We'll contact you soon!`,
      })
      setForm({ name: "", email: "", phone: "", size: "" })
      setSelectedSize("")
    }
  }

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
    setForm((s) => ({ ...s, size }))
  }

  const handleLike = () => {
    setLiked(!liked)
    toast({
      title: liked ? "Removed from wishlist 💔" : "Added to wishlist! ❤️",
      description: liked ? "You can add it back anytime." : "We'll notify you about updates!",
    })
  }

  const handleShare = () => {
    toast({
      title: "Share link copied! 🔗",
      description: `Share this amazing ${productId === "tshirt" ? "tee" : "hoodie"} with your friends!`,
    })
  }

  const handlePreorderClick = () => {
    if (selectedSize && !form.size) {
      setForm((s) => ({ ...s, size: selectedSize }))
    }
    setOpen(true)
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

      {/* NAVBAR */}
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
                onClick={() => onBackToMain && onBackToMain()}
                className="hover:text-[#DD0004] transition-colors duration-300 px-6 py-3 hover:bg-white/5 rounded-lg"
              >
                HOME
              </button>
              <button
                onClick={() => (onNavigateToShop ? onNavigateToShop() : handleUnavailablePage("Shop"))}
                className="hover:text-[#DD0004] transition-colors duration-300 px-6 py-3 hover:bg-white/5 rounded-lg"
              >
                SHOP
              </button>
              <button
                onClick={() => (onNavigateToAbout ? onNavigateToAbout() : handleUnavailablePage("About"))}
                className="hover:text-[#DD0004] transition-colors duration-300 px-6 py-3 hover:bg-white/5 rounded-lg"
              >
                ABOUT
              </button>
              <button
                onClick={() => (onNavigateToContact ? onNavigateToContact() : handleUnavailablePage("Contact"))}
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
                  onBackToMain && onBackToMain()
                  setMobileMenuOpen(false)
                }}
                className="block w-full text-left hover:text-[#DD0004] transition-colors duration-300 px-4 py-3 hover:bg-white/5 rounded-lg"
              >
                HOME
              </button>
              <button
                onClick={() => {
                  onNavigateToShop ? onNavigateToShop() : handleUnavailablePage("Shop")
                  setMobileMenuOpen(false)
                }}
                className="block w-full text-left hover:text-[#DD0004] transition-colors duration-300 px-4 py-3 hover:bg-white/5 rounded-lg"
              >
                SHOP
              </button>
              <button
                onClick={() => {
                  onNavigateToAbout ? onNavigateToAbout() : handleUnavailablePage("About")
                  setMobileMenuOpen(false)
                }}
                className="block w-full text-left hover:text-[#DD0004] transition-colors duration-300 px-4 py-3 hover:bg-white/5 rounded-lg"
              >
                ABOUT
              </button>
              <button
                onClick={() => {
                  onNavigateToContact ? onNavigateToContact() : handleUnavailablePage("Contact")
                  setMobileMenuOpen(false)
                }}
                className="block w-full text-left hover:text-[#DD0004] transition-colors duration-300 px-4 py-3 hover:bg-white/5 rounded-lg"
              >
                CONTACT
              </button>
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
                  PRE‑LAUNCH
                </Badge>
                <Badge className="bg-white/10 text-white border border-white/20 px-3 py-1 text-xs font-bold">
                  LIMITED EDITION
                </Badge>
              </div>

              <div className="flex items-center gap-2 text-sm text-[#808088]">
                <TrendingUp className="w-4 h-4" />
                <span className="font-medium">{preorderCount} people preordered</span>
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
                    { icon: Truck, text: "Ships on Launch" },
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

              {showSizeChart && (
                <div className="border border-white/10 rounded-lg p-4 bg-[#28282B]/50 backdrop-blur-sm animate-fade-in-up">
                  <p className="text-sm text-[#CCCCCC] mb-3 font-semibold">Indian Size Chart (inches)</p>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-2 text-white font-bold">Size</th>
                        <th className="text-left py-2 text-white font-bold">Chest</th>
                        <th className="text-left py-2 text-white font-bold">Length</th>
                        <th className="text-left py-2 text-white font-bold">Shoulder</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(SIZE_CHART).map(([size, measurements]) => (
                        <tr key={size} className="border-b border-white/5">
                          <td className="py-2 text-[#CCCCCC] font-semibold">{size}</td>
                          <td className="py-2 text-[#808088]">{measurements.chest}</td>
                          <td className="py-2 text-[#808088]">{measurements.length}</td>
                          <td className="py-2 text-[#808088]">{measurements.shoulder}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

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
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button
                    onClick={handlePreorderClick}
                    className="w-full bg-[#DD0004] hover:bg-[#DD0004]/90 text-white font-bold py-6 text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#DD0004]/30 group"
                    size="lg"
                  >
                    <ShoppingBag className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                    PREORDER NOW
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#1C1C21] border-white/10 text-white">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-black">Secure Your {productId === "tshirt" ? "Tee" : "Hoodie"}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={submit} className="space-y-4">
                    <div>
                      <label className="text-sm font-semibold text-[#CCCCCC] mb-2 block">Name *</label>
                      <Input
                        required
                        placeholder="Your full name"
                        value={form.name}
                        onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                        className="bg-[#28282B] border-[#808088]/30 text-white focus:border-[#DD0004] focus:ring-2 focus:ring-[#DD0004]/20 transition-all duration-300"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-[#CCCCCC] mb-2 block">Email *</label>
                      <Input
                        required
                        type="email"
                        placeholder="your.email@example.com"
                        value={form.email}
                        onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                        className="bg-[#28282B] border-[#808088]/30 text-white focus:border-[#DD0004] focus:ring-2 focus:ring-[#DD0004]/20 transition-all duration-300"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-[#CCCCCC] mb-2 block">Phone (Optional)</label>
                      <Input
                        type="tel"
                        placeholder="+91 XXXXX XXXXX"
                        value={form.phone}
                        onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
                        className="bg-[#28282B] border-[#808088]/30 text-white focus:border-[#DD0004] focus:ring-2 focus:ring-[#DD0004]/20 transition-all duration-300"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-[#CCCCCC] mb-2 block">Size *</label>
                      <Select required onValueChange={(v) => setForm((s) => ({ ...s, size: v }))} value={form.size}>
                        <SelectTrigger className="bg-[#28282B] border-[#808088]/30 text-white focus:border-[#DD0004] focus:ring-2 focus:ring-[#DD0004]/20">
                          <SelectValue placeholder="Select your size" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1C1C21] border-white/10 text-white">
                          {Object.keys(SIZE_CHART).map((size) => (
                            <SelectItem key={size} value={size} className="focus:bg-[#DD0004] focus:text-white">
                              {size} - Chest: {SIZE_CHART[size as keyof typeof SIZE_CHART].chest}"
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="bg-[#28282B]/50 rounded-lg p-4 border border-white/10">
                      <p className="text-sm font-semibold text-[#CCCCCC] mb-2">What happens next:</p>
                      <ul className="space-y-1 text-xs text-[#808088]">
                        <li>• We'll contact you when the {productId === "tshirt" ? "tee" : "hoodie"} launches</li>
                        <li>• Priority shipping to your address</li>
                        <li>• Exclusive member perks and early access</li>
                      </ul>
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-[#DD0004] hover:bg-[#DD0004]/90 text-white font-bold py-4 transition-all duration-300 hover:scale-105"
                    >
                      CONFIRM PREORDER
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={handleLike}
                  variant="outline"
                  className={`border-white/20 hover:border-[#DD0004] transition-all duration-300 hover:scale-105 ${
                    liked ? "bg-[#DD0004]/20 border-[#DD0004] text-[#DD0004]" : ""
                  }`}
                >
                  <Heart className={`w-5 h-5 mr-2 ${liked ? "fill-[#DD0004]" : ""}`} />
                  {liked ? "Saved" : "Save"}
                </Button>
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
