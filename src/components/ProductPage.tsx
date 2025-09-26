import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Star, ShoppingBag, Heart, Share2, Ruler, Truck, RotateCcw, ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  onBackToMain?: () => void;
}

const SIZE_CHART = {
  "S": { chest: "36-38", length: "26", shoulder: "17" },
  "M": { chest: "38-40", length: "27", shoulder: "18" },
  "L": { chest: "40-42", length: "28", shoulder: "19" },
  "XL": { chest: "42-44", length: "29", shoulder: "20" },
  "XXL": { chest: "44-46", length: "30", shoulder: "21" }
};

const REVIEWS = [
  { name: "Arjun K.", rating: 5, comment: "Quality is insane! Perfect fit and feels premium.", days: 3 },
  { name: "Priya S.", rating: 5, comment: "Love the design and comfort. Worth every penny!", days: 5 },
  { name: "Rohit M.", rating: 4, comment: "Great hoodie, runs slightly large but amazing quality.", days: 7 },
  { name: "Sneha D.", rating: 5, comment: "Obsessed with this! Can't wait for more drops.", days: 2 },
];

const PREORDER_KEY = 'kallkeyy:preorderCount' as const;

const getInitialCount = () => {
  try {
    const saved = sessionStorage.getItem(PREORDER_KEY);
    const n = saved ? parseInt(saved, 10) : NaN;
    return Number.isFinite(n) ? n : 92; // default to 92 if nothing saved
  } catch {
    return 92;
  }
};

export default function ProductPage({ onBackToMain }: Props) {
  const [preorderCount, setPreorderCount] = useState<number>(getInitialCount());

// Persist count whenever it changes
  useEffect(() => {
    try {
      sessionStorage.setItem(PREORDER_KEY, String(preorderCount));
    } catch {}
  }, [preorderCount]);

  const [form, setForm] = useState({ name: "", email: "", phone: "", size: "" });
  const [open, setOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState("");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [liked, setLiked] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.name && form.email && form.size) {
      setPreorderCount((p) => p + 1);
      setOpen(false);
      toast({
        title: "Preorder Confirmed! 🔥",
        description: `You're #${preorderCount + 1} in line for the Essential Hoodie. We'll contact you soon!`,
      });
      setForm({ name: "", email: "", phone: "", size: "" });
      setSelectedSize("");
    }
  };

  const submitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (userRating && userReview) {
      toast({
        title: "Review Submitted! ⭐",
        description: "Thank you for your feedback!",
      });
      setShowReviewForm(false);
      setUserRating(0);
      setUserReview("");
    }
  };

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
    setForm((s) => ({ ...s, size }));
  };

  const handleLike = () => {
    setLiked(!liked);
    toast({
      title: liked ? "Removed from wishlist 💔" : "Added to wishlist! ❤️",
      description: liked ? "You can add it back anytime." : "We'll notify you about updates!",
    });
  };

  const handleShare = () => {
    // Mock share functionality
    toast({
      title: "Share link copied! 🔗",
      description: "Share this amazing hoodie with your friends!",
    });
  };

  // Preselect size in form when modal opens
  const handlePreorderClick = () => {
    if (selectedSize && !form.size) {
      setForm((s) => ({ ...s, size: selectedSize }));
    }
    setOpen(true);
  };

  const gallery: string[] = [
    "/product-hoodie.jpg",
    "/hoodie-side.png",
    "/hoodie-front.png",
    "/hoodie.png",
  ];

  const [activeIdx, setActiveIdx] = useState<number>(0);

  useEffect(() => {
    const KEY = "kallkeyy:galleryIdx";
    const saved = sessionStorage.getItem(KEY);
    if (saved !== null) setActiveIdx(Number(saved));
  }, []);
  useEffect(() => {
    sessionStorage.setItem("kallkeyy:galleryIdx", String(activeIdx));
  }, [activeIdx]);

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background corner decorations */}
      <div className="fixed inset-0 pointer-events-none opacity-10">
        {/* Top corners */}
        <svg className="absolute top-10 left-10 w-32 h-32 animate-spin-slow" viewBox="0 0 100 100">
          <polygon points="50,10 90,35 75,85 25,85 10,35" stroke="orange" strokeWidth="1" fill="none" />
          <circle cx="50" cy="50" r="20" stroke="white" strokeWidth="1" fill="none" />
        </svg>
        
        <svg className="absolute top-10 right-10 w-28 h-28 animate-pulse" viewBox="0 0 100 100">
          <rect x="25" y="25" width="50" height="50" stroke="white" strokeWidth="1" fill="none" transform="rotate(45 50 50)" />
          <circle cx="50" cy="50" r="10" stroke="orange" strokeWidth="1" fill="none" />
        </svg>

        {/* Bottom corners */}
        <svg className="absolute bottom-10 left-10 w-36 h-36 animate-bounce-slow" viewBox="0 0 100 100">
          <path d="M20,20 L80,20 L80,80 L20,80 Z" stroke="orange" strokeWidth="1" fill="none" />
          <path d="M35,35 L65,35 L65,65 L35,65 Z" stroke="white" strokeWidth="1" fill="none" />
        </svg>

        <svg className="absolute bottom-10 right-10 w-30 h-30 animate-float" viewBox="0 0 100 100">
          <polygon points="50,5 85,25 85,75 50,95 15,75 15,25" stroke="white" strokeWidth="1" fill="none" />
        </svg>

        {/* Floating elements throughout */}
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float-random"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${6 + Math.random() * 4}s`,
            }}
          >
            <div className={`w-2 h-2 ${i % 2 === 0 ? 'bg-orange-500/20' : 'bg-white/20'} rounded-full`} />
          </div>
        ))}
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="mb-6 animate-fade-in">
          <Button 
            variant="ghost" 
            onClick={onBackToMain} 
            className="gap-2 text-white hover:text-orange-500 hover:bg-gray-900 transition-all duration-300 hover:scale-105"
          >
            <ArrowLeft size={18} /> Back to Home
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-fade-in-up">
          {/* Left: Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-900 rounded-xl overflow-hidden shadow-2xl relative group hover:scale-105 transition-transform duration-300">
              <img
                src={gallery[activeIdx]}
                alt={`KALLKEYY Essential Hoodie view #${activeIdx + 1}`}
                className="w-full h-full object-cover select-none pointer-events-none"
                onError={(e) => {
                  // graceful fallback if an image is missing
                  (e.currentTarget as HTMLImageElement).style.opacity = "0";
                }}
                draggable={false}
              />
              <div className="absolute bottom-4 left-4 text-3xl font-black opacity-20 group-hover:opacity-40 transition-opacity duration-300">KALLKEYY</div>
              <div className="absolute top-4 right-4">
                <Badge className="bg-orange-500 text-black font-bold animate-pulse">EXCLUSIVE DROP</Badge>
              </div>
              
              {/* Corner design elements */}
              <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-orange-500/30"></div>
              <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-orange-500/30"></div>
            </div>
            
            <div className="grid grid-cols-4 gap-2">
                {gallery.map((src, i) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setActiveIdx(i)}
                    aria-label={`View image ${i + 1}`}
                    className={`aspect-square rounded-lg overflow-hidden border transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      activeIdx === i ? "border-orange-500 ring-1 ring-orange-500" : "border-gray-700 hover:border-white"
                    }`}
                    >
                    <img
                      src={src}
                      alt={`Thumbnail ${i + 1}`}
                      className="w-full h-full object-cover"
                      draggable={false}
                    />
                  </button>
                ))}
              </div>
          </div>

          {/* Right: Product Details */}
          <div className="space-y-6 animate-slide-in-right">
            <div className="flex items-center gap-3 flex-wrap animate-bounce-in">
              <Badge className="bg-orange-500 text-black font-bold">PRE‑LAUNCH</Badge>
              <Badge variant="outline" className="border-white text-white hover:bg-white hover:text-black transition-colors duration-300">LIMITED EDITION</Badge>
              <span className="text-orange-500 font-bold animate-pulse">{preorderCount} people preordered</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl md:text-4xl font-black">KALLKEYY ESSENTIAL HOODIE</h1>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={20} 
                      className="text-orange-500 fill-orange-500 animate-twinkle" 
                      style={{animationDelay: `${i * 0.1}s`}}
                    />
                  ))}
                  <span className="text-gray-400 ml-2 hover:text-white transition-colors duration-300">(247 reviews)</span>
                </div>
              </div>
              <p className="text-gray-300 text-lg leading-relaxed animate-fade-in-up">
                Premium cotton‑blend hoodie with signature fit and street-ready design. 
                Features embroidered wordmark, orange accent details, and heavyweight 
                construction built to last. Limited quantities available.
              </p>
            </div>

            <div className="space-y-4 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              <h3 className="text-xl font-bold">PRODUCT DETAILS</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                {[
                  { icon: Ruler, text: "Premium Fit" },
                  { icon: Truck, text: "Ships on Launch" },
                  { icon: RotateCcw, text: "Easy Returns" }
                ].map((item, i) => (
                  <div 
                    key={i}
                    className="flex items-center gap-2 bg-gray-900 p-3 rounded-lg hover:bg-gray-800 transition-all duration-300 hover:scale-105 cursor-pointer group"
                  >
                    <item.icon size={16} className="text-orange-500 group-hover:scale-110 transition-transform duration-300"/>
                    <span className="group-hover:text-orange-500 transition-colors duration-300">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div className="space-y-4 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">SIZE</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSizeChart(!showSizeChart)}
                  className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-black transition-all duration-300 hover:scale-105"
                >
                  Size Chart {showSizeChart ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                </Button>
              </div>
              
              {showSizeChart && (
                <div className="bg-gray-900 p-4 rounded-lg animate-slide-down">
                  <h4 className="font-bold mb-3">Indian Size Chart (inches)</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="text-left py-2">Size</th>
                          <th className="text-left py-2">Chest</th>
                          <th className="text-left py-2">Length</th>
                          <th className="text-left py-2">Shoulder</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(SIZE_CHART).map(([size, measurements]) => (
                          <tr key={size} className="border-b border-gray-800 hover:bg-gray-800 transition-colors duration-300">
                            <td className="py-2 font-semibold text-orange-500">{size}</td>
                            <td className="py-2">{measurements.chest}</td>
                            <td className="py-2">{measurements.length}</td>
                            <td className="py-2">{measurements.shoulder}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-5 gap-2">
                {Object.keys(SIZE_CHART).map((size) => (
                  <button
                    key={size}
                    onClick={() => handleSizeSelect(size)}
                    className={`py-3 px-4 border rounded-lg font-bold transition-all duration-300 hover:scale-105 ${
                      selectedSize === size
                        ? 'border-orange-500 bg-orange-500 text-black shadow-lg shadow-orange-500/20'
                        : 'border-gray-600 hover:border-white hover:shadow-lg'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 animate-bounce-in" style={{animationDelay: '0.6s'}}>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className="flex-1 bg-orange-500 text-black hover:bg-orange-600 font-bold py-4 text-lg shadow-xl hover:shadow-2xl hover:shadow-orange-500/20 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
                    disabled={!selectedSize}
                    onClick={handlePreorderClick}
                  >
                    <ShoppingBag size={20} className="mr-2" />
                    PREORDER NOW
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-black border-gray-700 text-white animate-scale-in">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-orange-500 animate-text-glow">Secure Your Hoodie</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={submit} className="space-y-4">
                    <Input 
                      placeholder="Full Name" 
                      value={form.name} 
                      onChange={(e) => setForm(s => ({...s, name: e.target.value}))}
                      className="bg-gray-900 border-gray-600 text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300"
                    />
                    <Input 
                      placeholder="Email" 
                      type="email" 
                      value={form.email} 
                      onChange={(e) => setForm(s => ({...s, email: e.target.value}))}
                      className="bg-gray-900 border-gray-600 text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300"
                    />
                    <Input 
                      placeholder="Phone Number" 
                      value={form.phone} 
                      onChange={(e) => setForm(s => ({...s, phone: e.target.value}))}
                      className="bg-gray-900 border-gray-600 text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300"
                    />
                    <Select onValueChange={(v) => setForm(s => ({...s, size: v}))} value={form.size}>
                      <SelectTrigger className="bg-gray-900 border-gray-600 text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300">
                        <SelectValue placeholder="Select Size" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-gray-600">
                        {Object.keys(SIZE_CHART).map((size) => (
                          <SelectItem key={size} value={size} className="text-white hover:bg-gray-800 focus:bg-gray-800">
                            {size} - Chest: {SIZE_CHART[size as keyof typeof SIZE_CHART].chest}"
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="bg-gray-900 p-4 rounded-lg">
                      <p className="text-sm text-gray-400 mb-2">What happens next:</p>
                      <ul className="text-sm space-y-1">
                        <li>• We'll contact you when the hoodie launches</li>
                        <li>• Priority shipping to your address</li>
                        <li>• Exclusive member perks and early access</li>
                      </ul>
                    </div>
                    <Button 
                      type="submit"
                      className="w-full bg-orange-500 text-black hover:bg-orange-600 font-bold py-3 transition-all duration-300 hover:scale-105"
                    >
                      CONFIRM PREORDER
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>

              <Button 
                onClick={handleLike}
                variant="outline" 
                className={`border-white text-white hover:bg-white hover:text-black px-6 transition-all duration-300 hover:scale-105 ${liked ? 'bg-red-500 border-red-500 text-white' : ''}`}
              >
                <Heart size={20} className={liked ? 'fill-current' : ''} />
              </Button>
              <Button 
                onClick={handleShare}
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-black px-6 transition-all duration-300 hover:scale-105"
              >
                <Share2 size={20} />
              </Button>
            </div>

            {/* Material & Care */}
            <div className="bg-gray-900 p-6 rounded-lg animate-fade-in-up hover:bg-gray-800 transition-colors duration-300" style={{animationDelay: '0.8s'}}>
              <h3 className="text-xl font-bold mb-4">MATERIAL & CARE</h3>
              <div className="space-y-2 text-gray-300">
                <p>• 80% Premium Cotton, 20% Polyester blend</p>
                <p>• 400gsm heavyweight construction</p>
                <p>• Pre-shrunk and enzyme washed</p>
                <p>• Machine wash cold, tumble dry low</p>
                <p>• Do not bleach or iron directly on print</p>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16 animate-fade-in-up" style={{animationDelay: '1s'}}>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-black animate-text-glow">CUSTOMER REVIEWS</h2>
            <Button
              onClick={() => setShowReviewForm(!showReviewForm)}
              variant="outline"
              className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-black transition-all duration-300 hover:scale-105"
            >
              Write Review
            </Button>
          </div>

          {showReviewForm && (
            <div className="bg-gray-900 p-6 rounded-lg mb-8 animate-slide-down">
              <form onSubmit={submitReview} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-2">Rating</label>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setUserRating(star)}
                        className="p-1 hover:scale-110 transition-transform duration-300"
                      >
                        <Star 
                          size={24} 
                          className={`transition-colors duration-300 ${star <= userRating ? "text-orange-500 fill-orange-500" : "text-gray-500 hover:text-orange-400"}`} 
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Your Review</label>
                  <textarea
                    value={userReview}
                    onChange={(e) => setUserReview(e.target.value)}
                    placeholder="Share your experience with the hoodie..."
                    rows={4}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300 resize-none"
                  />
                </div>
                <Button 
                  type="submit"
                  className="bg-orange-500 text-black hover:bg-orange-600 transition-all duration-300 hover:scale-105"
                >
                  Submit Review
                </Button>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {REVIEWS.map((review, i) => (
              <div 
                key={i} 
                className="bg-gray-900 p-6 rounded-lg hover:bg-gray-800 transition-all duration-300 hover:scale-105 hover:shadow-lg animate-bounce-in"
                style={{animationDelay: `${i * 0.1}s`}}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-black font-bold hover:scale-110 transition-transform duration-300">
                      {review.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold">{review.name}</p>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, j) => (
                          <Star 
                            key={j} 
                            size={16} 
                            className={j < review.rating ? "text-orange-500 fill-orange-500" : "text-gray-500"} 
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className="text-sm text-gray-400">{review.days}d ago</span>
                </div>
                <p className="text-gray-300">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient-shift {
          0%, 100% { background: linear-gradient(135deg, rgba(249, 115, 22, 0.1), transparent); }
          50% { background: linear-gradient(225deg, rgba(249, 115, 22, 0.2), transparent); }
        }

        @keyframes text-glow {
          0%, 100% { text-shadow: 0 0 20px rgba(249, 115, 22, 0.5); }
          50% { text-shadow: 0 0 30px rgba(249, 115, 22, 0.8), 0 0 40px rgba(249, 115, 22, 0.3); }
        }

        @keyframes twinkle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }

        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }

        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes slide-in-right {
          0% { opacity: 0; transform: translateX(50px); }
          100% { opacity: 1; transform: translateX(0); }
        }

        @keyframes bounce-in {
          0% { opacity: 0; transform: scale(0.3); }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
        }

        @keyframes slide-down {
          0% { opacity: 0; transform: translateY(-20px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes scale-in {
          0% { opacity: 0; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1); }
        }

        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }

        @keyframes float-random {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-10px) rotate(90deg); }
          50% { transform: translateY(-5px) rotate(180deg); }
          75% { transform: translateY(-15px) rotate(270deg); }
        }

        .animate-gradient-shift { animation: gradient-shift 4s ease-in-out infinite; }
        .animate-text-glow { animation: text-glow 2s ease-in-out infinite; }
        .animate-twinkle { animation: twinkle 2s ease-in-out infinite; }
        .animate-fade-in { animation: fade-in 1s ease-out forwards; }
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
        .animate-slide-in-right { animation: slide-in-right 1s ease-out forwards; }
        .animate-bounce-in { animation: bounce-in 1s ease-out forwards; }
        .animate-slide-down { animation: slide-down 0.5s ease-out forwards; }
        .animate-scale-in { animation: scale-in 0.3s ease-out forwards; }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
        .animate-bounce-slow { animation: bounce-slow 4s ease-in-out infinite; }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-float-random { animation: float-random 6s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
