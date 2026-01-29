"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Star,
  ShoppingBag,
  Share2,
  Ruler,
  Truck,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";
import { API_BASE_URL } from "../../lib/apiConfig";

interface ProductData {
  name: string;
  price: string;
  originalPrice?: string;
  salePrice?: string;
  tag: string;
  description: string;
  images: string[];
  material: string[];
  productType: "hoodie" | "tshirt";
}

interface Props {
  onBackToMain?: () => void;
  onNavigateToShop?: () => void;
  onNavigateToAbout?: () => void;
  onNavigateToContact?: () => void;
  onNavigateToLogin: () => void;
  onNavigateToSignup: () => void;
  onNavigateToProduct?: (productId: string) => void;
  onNavigateToOrders?: () => void;
  product: ProductData;
  productId: string;
  skipAnimations?: boolean;
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

interface Review {
  _id?: string;
  productId: string;
  userId: string;
  name: string;
  email: string;
  rating: number;
  description: string;
  createdAt: string;
}

// Size charts for different product types
const HOODIE_SIZE_CHART = {
  M: { chest: "38-40", garmentChest: "46", length: "25.5", shoulder: "24.5" },
  L: { chest: "40-42", garmentChest: "48", length: "26.5", shoulder: "25" },
  XL: { chest: "42-44", garmentChest: "50", length: "27.5", shoulder: "25.5" },
  XXL: { chest: "44-46", garmentChest: "52", length: "28.5", shoulder: "26" },
};

const TSHIRT_SIZE_CHART = {
  M: { chest: "38-40", garmentChest: "46", length: "25.5", shoulder: "24.5" },
  L: { chest: "40-42", garmentChest: "48", length: "26.5", shoulder: "25" },
  XL: { chest: "42-44", garmentChest: "50", length: "27.5", shoulder: "25.5" },
  XXL: { chest: "44-46", garmentChest: "52", length: "28.5", shoulder: "26" },
};

// List of all available products (to exclude current product)
const ALL_PRODUCTS = [
  {
    id: "kaaldrishta",
    name: "KAAL-DRISHTA",
    price: "₹2,499",
    image: "/KaalDrishta-1.png",
    tag: "FLAGSHIP",
  },
  {
    id: "antahayugaysa",
    name: "ANTAHA-YUGAYSA",
    price: "₹2,499",
    image: "/Antahayugasya-1.png",
    tag: "NEW LAUNCH",
  },
  {
    id: "smarajivitam",
    name: "SMARA-JIVITAM",
    price: "₹1,299",
    image: "/Smarajivitam-1.png",
    tag: "NEW DROP",
  },
  {
    id: "mrityobaddha",
    name: "MRITYO-BADDHA",
    price: "₹1,299",
    image: "/Mrityobaddha-1.png",
    tag: "TRENDING",
  },
];

// Helper function to calculate review statistics
const calculateReviewStats = (reviewsList: Review[]): ReviewStats => {
  if (reviewsList.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    };
  }

  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let totalRating = 0;

  reviewsList.forEach((review) => {
    distribution[review.rating as keyof typeof distribution]++;
    totalRating += review.rating;
  });

  return {
    averageRating: totalRating / reviewsList.length,
    totalReviews: reviewsList.length,
    ratingDistribution: distribution,
  };
};

export default function ProductPageBase({
  onBackToMain,
  onNavigateToShop,
  onNavigateToAbout,
  onNavigateToContact,
  onNavigateToLogin,
  onNavigateToSignup,
  onNavigateToProduct,
  onNavigateToOrders,
  product,
  productId,
  skipAnimations = false,
}: Props) {
  const { user, logout } = useAuth();
  const { addToCart } = useCart();
  
  // Get current route to determine active nav item
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
  const isHomeActive = currentPath === '/';
  const isShopActive = currentPath === '/shop' || currentPath.startsWith('/product/');

  // State management
  const [selectedSize, setSelectedSize] = useState("");
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState("");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [productStock, setProductStock] = useState({
    inStock: true,
    stock: { M: 0, L: 0, XL: 0, XXL: 0 },
  });
  const [isLoadingStock, setIsLoadingStock] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [reviewStats, setReviewStats] = useState<ReviewStats>({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });
  const [userReviewData, setUserReviewData] = useState<Review | null>(null);
  const [isEditingReview, setIsEditingReview] = useState(false);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Persist gallery index
  useEffect(() => {
    const KEY = "kallkeyy:galleryIdx";
    const saved = sessionStorage.getItem(KEY);
    if (saved !== null) setActiveIdx(Number(saved));
  }, []);

  useEffect(() => {
    sessionStorage.setItem("kallkeyy:galleryIdx", String(activeIdx));
  }, [activeIdx]);

  // Fetch product stock on component mount
  useEffect(() => {
    const fetchProductStock = async () => {
      try {
        setIsLoadingStock(true);
        const response = await fetch(
          `${API_BASE_URL}/api/products/${productId}`,
          {
            method: "GET",
            credentials: 'include',
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.product) {
            setProductStock({
              inStock: data.product.inStock,
              stock: data.product.stock,
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch product stock:", error);
        // Default to out of stock if API fails
        setProductStock({
          inStock: false,
          stock: { M: 0, L: 0, XL: 0, XXL: 0 },
        });
      } finally {
        setIsLoadingStock(false);
      }
    };

    fetchProductStock();
  }, [productId]);

  // Track product view with Google Analytics
  useEffect(() => {
    // Import analytics dynamically to avoid circular dependencies
    import('../../lib/analytics').then(({ trackProductView }) => {
      const priceMatch = product.price.match(/₹([\d,]+)/);
      const price = priceMatch ? parseFloat(priceMatch[1].replace(/,/g, '')) : 0;
      
      trackProductView({
        item_id: productId,
        item_name: product.name,
        item_category: product.productType === 'hoodie' ? 'Hoodies' : 'T-Shirts',
        price: price,
        currency: 'INR',
        quantity: 1,
      });
    });
  }, [productId, product.name, product.price, product.productType]);

  // Fetch reviews on component mount
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setIsLoadingReviews(true);
        const response = await fetch(
          `${API_BASE_URL}/api/reviews/${productId}`,
          {
            method: "GET",
            credentials: 'include',
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.reviews) {
            const allReviews = data.reviews;
            setReviews(allReviews);

            // Calculate stats
            const stats = calculateReviewStats(allReviews);
            setReviewStats(stats);

            // Find user's review if logged in (but DON'T depend on user in useEffect)
            if (user) {
              const userReview = allReviews.find(
                (r: Review) => r.userId === user.id || r.userId === user._id
              );
              if (userReview) {
                setUserReviewData(userReview);
              } else {
                setUserReviewData(null);
              }
            } else {
              setUserReviewData(null);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch reviews:", error);
        setReviews([]);
        setReviewStats({
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        });
      } finally {
        setIsLoadingReviews(false);
      }
    };

    fetchReviews();
  }, [productId]);

  useEffect(() => {
    if (user && reviews.length > 0) {
      const userReview = reviews.find(
        (r: Review) => r.userId === user.id || r.userId === user._id
      );
      setUserReviewData(userReview || null);
    } else if (!user) {
      setUserReviewData(null);
    }
  }, [user?._id, user?.id, reviews.length]);

  // Submit review handler
  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if user is logged in
    if (!user) {
      toast({
        variant: "destructive",
        title: "Login Required ⚠️",
        description: "Please login to write a review",
      });
      onNavigateToLogin();
      return;
    }

    // Validate rating
    if (userRating === 0) {
      toast({
        variant: "destructive",
        title: "Rating Required",
        description: "Please select a star rating",
      });
      return;
    }

    try {
      setIsSubmittingReview(true);

      const token = localStorage.getItem("token"); // ✅ FIXED: was 'authToken'
      if (!token) {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Please login again",
        });
        onNavigateToLogin();
        return;
      }

      // Determine if creating new or updating existing
      const isUpdate = isEditingReview && userReviewData?._id;
      const url = isUpdate
        ? `${API_BASE_URL}/api/reviews/${userReviewData._id}`
        : `${API_BASE_URL}/api/reviews`;
      const method = isUpdate ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId,
          rating: userRating,
          description: userReview.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: isUpdate ? "Review Updated! ⭐" : "Review Submitted! ⭐",
          description: "Thank you for your feedback!",
        });

        // Reset form
        setShowReviewForm(false);
        setIsEditingReview(false);
        setUserRating(0);
        setUserReview("");

        // Refresh reviews
        const reviewsResponse = await fetch(
          `${API_BASE_URL}/api/reviews/${productId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (reviewsResponse.ok) {
          const reviewsData = await reviewsResponse.json();
          if (reviewsData.success && reviewsData.reviews) {
            const allReviews = reviewsData.reviews;
            setReviews(allReviews);

            // Recalculate stats
            const stats = calculateReviewStats(allReviews);
            setReviewStats(stats);

            // Update user review data
            const userReview = allReviews.find(
              (r: Review) => r.userId === user.id || r.userId === user._id
            );
            setUserReviewData(userReview || null);
          }
        }
      } else {
        toast({
          variant: "destructive",
          title: "Submission Failed",
          description:
            data.message || "Failed to submit review. Please try again.",
        });
      }
    } catch (error) {
      console.error("Submit review error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit review. Please try again.",
      });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleEditReview = () => {
    if (userReviewData) {
      setUserRating(userReviewData.rating);
      setUserReview(userReviewData.description || "");
      setIsEditingReview(true);
      setShowReviewForm(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingReview(false);
    setShowReviewForm(false);
    setUserRating(0);
    setUserReview("");
  };

  const handleSizeSelect = (size: string) => {
    // Check if size is in stock
    const stockQty = productStock.stock[size as keyof typeof productStock.stock] || 0;
    if (stockQty > 0) {
      setSelectedSize(size);
    }
  };

  // Helper function to check if a size has stock
  const isSizeInStock = (size: string): boolean => {
    return (productStock.stock[size as keyof typeof productStock.stock] || 0) > 0;
  };

  // Helper function to check if all sizes are out of stock
  const isAllSizesOutOfStock = (): boolean => {
    return Object.values(productStock.stock).every(qty => qty === 0);
  };

  // Get stock quantity for selected size
  const getStockQuantity = (size: string): number => {
    return productStock.stock[size as keyof typeof productStock.stock] || 0;
  };

  const handleShare = async () => {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link Copied! 🔗",
        description: "Product URL copied to clipboard!",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Could not copy link. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddToCart = async () => {
    // Check if user is logged in
    if (!user) {
      toast({
        variant: "destructive",
        title: "Login Required ⚠️",
        description: "Please login to add items to cart",
      });
      onNavigateToLogin();
      return;
    }

    // Check if size is selected
    if (!selectedSize) {
      toast({
        variant: "destructive",
        title: "Please select a size",
        description: "Choose a size before adding to cart",
      });
      return;
    }

    try {
      const priceToUse = product.salePrice || product.price;
      await addToCart({
        productId: productId,
        productName: product.name,
        size: selectedSize,
        price: parseFloat(priceToUse.replace("₹", "").replace(",", "")),
        image:
          product.images.find((img) => !img.endsWith(".mp4")) ||
          product.images[0],
        quantity: 1,
      });

      toast({
        title: "Added to Cart! 🎉",
        description: `${product.name} - Size ${selectedSize}`,
      });
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Please try again";
      
      toast({
        variant: "destructive",
        title: "Failed to add to cart",
        description: errorMessage,
      });
    }
  };

  const handleUnavailablePage = (page: string) => {
    toast({
      variant: "destructive",
      title: "Under Development 🚧",
      description: `${page} page is currently being developed!`,
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

  // Calculate days ago from date
  const getDaysAgo = (dateString: string): number => {
    const reviewDate = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - reviewDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Get other products (exclude current product)
  const otherProducts = ALL_PRODUCTS.filter((p) => p.id !== productId);

  // Get the appropriate size chart based on product type
  const SIZE_CHART =
    product.productType === "hoodie" ? HOODIE_SIZE_CHART : TSHIRT_SIZE_CHART;

  return (
    <div className={`min-h-screen bg-[#f8f8f8] text-black relative ${skipAnimations ? '[&_*]:!animate-none' : ''}`}>
      {/* Announcement Bar */}
      <div className="bg-[#333333] text-white text-center py-1.5 px-4 text-[10px] sm:text-xs font-bold tracking-widest uppercase z-[60] relative">
        Free Shipping on all pan-India orders · Code <span className="text-[#4CAF50]">KALLKEYY100</span> for ₹100 Off on your first order only
      </div>

      {/* Navigation - Matching HomePage Style */}
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
                onClick={() => onBackToMain?.()}
                className="text-sm font-bold tracking-wide hover:text-[#b90e0a] transition-colors duration-300 whitespace-nowrap uppercase"
              >
                Home
              </button>
              <button
                onClick={() => onNavigateToShop ? onNavigateToShop() : handleUnavailablePage("Shop")}
                className="text-sm font-bold tracking-wide text-[#b90e0a] transition-colors duration-300 whitespace-nowrap uppercase"
              >
                Shop
              </button>
              {user && (
                <button
                  onClick={() => onNavigateToOrders ? onNavigateToOrders() : handleUnavailablePage("Orders")}
                  className="text-sm font-bold tracking-wide hover:text-[#b90e0a] transition-colors duration-300 whitespace-nowrap uppercase"
                >
                  Orders
                </button>
              )}
              <button
                onClick={() => onNavigateToAbout ? onNavigateToAbout() : handleUnavailablePage("About")}
                className="text-sm font-bold tracking-wide hover:text-[#b90e0a] transition-colors duration-300 whitespace-nowrap uppercase"
              >
                About
              </button>
              <button
                onClick={() => onNavigateToContact ? onNavigateToContact() : handleUnavailablePage("Contact")}
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
          {/* Dark overlay background */}
          <div 
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Menu content */}
          <div className="relative h-full flex flex-col pt-16 px-5 pb-6 overflow-y-auto">
            {/* Close button */}
            <button
              className="absolute top-4 right-4 text-white hover:text-[#b90e0a] transition-colors p-1.5"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              <X size={24} />
            </button>

            {/* Navigation Links */}
            <div className="space-y-1">
              <button
                onClick={() => {
                  onBackToMain?.();
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

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 relative z-10">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <button
            onClick={onBackToMain}
            className="hover:text-[#b90e0a] transition-colors"
          >
            Home
          </button>
          <span>/</span>
          <button
            onClick={() => onNavigateToShop?.()}
            className="hover:text-[#b90e0a] transition-colors"
          >
            Shop
          </button>
          <span>/</span>
          <span className="text-[#b90e0a] font-medium">{product.name}</span>
        </div>

        {/* TWO-COLUMN LAYOUT: Images & Product Info */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start mb-16">
          {/* Left: Product Images/Videos */}
          <div className="space-y-4 lg:sticky lg:top-20">
            {/* Main Image Container */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-white shadow-xl group">
              {/* Decorative corner accents */}
              <div className="absolute top-0 left-0 w-20 h-20 border-t-4 border-l-4 border-[#b90e0a] z-10 rounded-tl-2xl" />
              <div className="absolute bottom-0 right-0 w-20 h-20 border-b-4 border-r-4 border-[#b90e0a] z-10 rounded-br-2xl" />
              
              {product.images[activeIdx]?.endsWith(".mp4") ? (
                <video
                  src={product.images[activeIdx]}
                  className="w-full h-full object-contain bg-[#fafafa]"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              ) : (
                <img
                  src={product.images[activeIdx]}
                  alt={product.name}
                  className="w-full h-full object-contain bg-[#fafafa] transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.opacity = "0";
                  }}
                  draggable={false}
                />
              )}
              
              {/* Floating Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
                <Badge className="bg-[#b90e0a] text-white border-none px-3 py-1.5 text-xs font-bold shadow-lg">
                  ASTITVA ACT-I
                </Badge>
                {product.originalPrice && product.salePrice && (
                  <Badge className="bg-[#2E7D32] text-white border-none px-3 py-1.5 text-xs font-bold shadow-lg">
                    {Math.round(
                      ((parseFloat(product.originalPrice.replace(/[₹,]/g, "")) -
                        parseFloat(product.salePrice.replace(/[₹,]/g, ""))) /
                        parseFloat(product.originalPrice.replace(/[₹,]/g, ""))) *
                        100
                    )}% OFF
                  </Badge>
                )}
              </div>
              
              {/* Product Tag Badge */}
              <div className="absolute top-4 right-4 z-20">
                <Badge className="bg-black/80 backdrop-blur-sm text-white border-none px-3 py-1.5 text-xs font-bold shadow-lg">
                  {product.tag}
                </Badge>
              </div>
              
              {/* Image Counter */}
              <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-bold z-20">
                {activeIdx + 1} / {product.images.length}
              </div>
            </div>

            {/* Thumbnail Gallery */}
            <div className="grid grid-cols-4 gap-3">
              {product.images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIdx(i)}
                  aria-label={`View ${src.endsWith(".mp4") ? "video" : "image"} ${i + 1}`}
                  className={`relative aspect-square rounded-xl overflow-hidden bg-white transition-all duration-300 hover:scale-105 focus:outline-none ${
                    activeIdx === i
                      ? "ring-2 ring-[#b90e0a] shadow-lg shadow-[#b90e0a]/20"
                      : "ring-1 ring-black/10 hover:ring-black/30"
                  }`}
                >
                  {src.endsWith(".mp4") ? (
                    <>
                      <video
                        src={src}
                        className="w-full h-full object-contain bg-[#fafafa]"
                        muted
                        playsInline
                      />
                      {/* Video indicator */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                          <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-[#b90e0a] border-b-[6px] border-b-transparent ml-1" />
                        </div>
                      </div>
                    </>
                  ) : (
                    <img
                      src={src}
                      alt={`${product.name} view ${i + 1}`}
                      className="w-full h-full object-contain bg-[#fafafa]"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.opacity = "0";
                      }}
                      draggable={false}
                    />
                  )}
                  {activeIdx === i && (
                    <div className="absolute inset-0 border-2 border-[#b90e0a] rounded-xl pointer-events-none" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Product Details */}
          <div className="space-y-6">
            {/* Stock Status */}
            <div className="flex flex-wrap items-center gap-3">
              {isLoadingStock ? (
                <div className="flex items-center gap-2 text-gray-500">
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" />
                  <span className="text-sm font-medium">Checking availability...</span>
                </div>
              ) : isAllSizesOutOfStock() ? (
                <div className="flex items-center gap-2 text-black">
                  <div className="w-2 h-2 rounded-full bg-black" />
                  <span className="text-sm font-bold uppercase">Out of Stock</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-green-600">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm font-bold uppercase">In Stock</span>
                </div>
              )}
            </div>

            {/* Product Title */}
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0a0a0a] leading-tight font-akira mb-2">
                {product.name}
              </h1>
              <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">
                {product.productType === "hoodie" ? "Premium Heavyweight Hoodie" : "Oversized Graphic Tee"}
              </p>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3 pb-4 border-b border-black/10">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.round(reviewStats.averageRating)
                        ? "fill-[#b90e0a] text-[#b90e0a]"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {reviewStats.averageRating.toFixed(1)} ({reviewStats.totalReviews} review{reviewStats.totalReviews !== 1 ? "s" : ""})
              </span>
            </div>

            {/* Price Section */}
            <div className="bg-[#fafafa] p-5 rounded-xl border border-black/5">
              {product.originalPrice && product.salePrice ? (
                <div className="space-y-2">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl sm:text-4xl font-black text-[#b90e0a]">
                      {product.salePrice}
                    </span>
                    <span className="text-xl text-gray-400 line-through">
                      {product.originalPrice}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-[#2E7D32] text-white border-none px-3 py-1 text-xs font-bold">
                      SAVE {Math.round(
                        ((parseFloat(product.originalPrice.replace(/[₹,]/g, "")) -
                          parseFloat(product.salePrice.replace(/[₹,]/g, ""))) /
                          parseFloat(product.originalPrice.replace(/[₹,]/g, ""))) *
                          100
                      )}%
                    </Badge>
                    <span className="text-xs text-gray-500">Limited time offer</span>
                  </div>
                </div>
              ) : (
                <span className="text-3xl sm:text-4xl font-black text-[#b90e0a]">
                  {product.price}
                </span>
              )}
              
              {/* Discount Code */}
              <div className="mt-4 p-3 bg-[#b90e0a]/5 rounded-lg border border-[#b90e0a]/20">
                <p className="text-sm text-gray-700">
                  Use code{" "}
                  <button
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText("KALLKEYY100");
                        toast({
                          title: "Copied! 📋",
                          description: "Discount code KALLKEYY100 copied to clipboard",
                        });
                      } catch (error) {
                        toast({
                          variant: "destructive",
                          title: "Copy Failed",
                          description: "Could not copy code. Please try again.",
                        });
                      }
                    }}
                    className="font-black text-[#b90e0a] hover:text-[#8a0a08] underline underline-offset-2 transition-colors cursor-pointer"
                  >
                    KALLKEYY100
                  </button>{" "}
                  for an extra <span className="font-bold">₹100 OFF</span> on your first order only
                </p>
              </div>
            </div>

            {/* Description */}
            <p className="text-[#444444] leading-relaxed text-sm sm:text-base">
              {product.description}
            </p>

            {/* Product Features */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Ruler, text: "Premium Fit", subtext: "Oversized" },
                { icon: Truck, text: "Free Shipping", subtext: "Pan-India" },
                { icon: RotateCcw, text: "Easy Returns", subtext: "3 Days" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="group flex flex-col items-center gap-1.5 p-3 bg-white rounded-xl border border-black/5 hover:border-[#b90e0a]/30 hover:shadow-md transition-all duration-300"
                >
                  <div className="w-10 h-10 rounded-full bg-[#b90e0a]/10 flex items-center justify-center group-hover:bg-[#b90e0a] transition-colors duration-300">
                    <item.icon className="w-5 h-5 text-[#b90e0a] group-hover:text-white transition-colors duration-300" />
                  </div>
                  <span className="text-xs font-bold text-[#0a0a0a] text-center">{item.text}</span>
                  <span className="text-[10px] text-gray-500">{item.subtext}</span>
                </div>
              ))}
            </div>

            {/* Size Selection */}
            <div className="space-y-4 p-5 bg-white rounded-xl border border-black/5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-black tracking-wider uppercase">
                    Select Size
                  </h3>
                  {selectedSize && (
                    <p className="text-xs text-black mt-0.5">Selected: {selectedSize}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSizeChart(!showSizeChart)}
                  className="text-[#b90e0a] hover:bg-[#b90e0a]/10 transition-all duration-300 text-xs font-bold"
                >
                  <Ruler className="w-4 h-4 mr-1.5" />
                  Size Guide
                  {showSizeChart ? (
                    <ChevronUp className="ml-1 w-3 h-3" />
                  ) : (
                    <ChevronDown className="ml-1 w-3 h-3" />
                  )}
                </Button>
              </div>

              {/* Animated Size Chart */}
              <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  showSizeChart ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="bg-[#fafafa] rounded-lg p-4 border border-black/5 mt-3">
                  <h4 className="font-bold text-sm mb-3 text-[#0a0a0a]">
                    {product.productType === "hoodie" ? "Hoodie" : "T-Shirt"} Size Chart (inches)
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-black/10 bg-black/5">
                          <th className="text-left p-2.5 font-bold">Size</th>
                          <th className="text-left p-2.5 font-bold">Chest</th>
                          <th className="text-left p-2.5 font-bold">Garment</th>
                          <th className="text-left p-2.5 font-bold">Length</th>
                          <th className="text-left p-2.5 font-bold">Shoulder</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(SIZE_CHART).map(([size, measurements], idx) => (
                          <tr 
                            key={size} 
                            className={`border-b border-black/5 ${idx % 2 === 0 ? 'bg-white' : 'bg-[#fafafa]'} ${selectedSize === size ? 'bg-[#b90e0a]/10' : ''}`}
                          >
                            <td className="p-2.5 font-bold text-[#b90e0a]">{size}</td>
                            <td className="p-2.5">{measurements.chest}"</td>
                            <td className="p-2.5">{measurements.garmentChest}"</td>
                            <td className="p-2.5">{measurements.length}"</td>
                            <td className="p-2.5">{measurements.shoulder}"</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Size Buttons */}
              <div className="grid grid-cols-4 gap-3">
                {Object.keys(SIZE_CHART).map((size) => {
                  const isInStock = isSizeInStock(size);
                  const isSelected = selectedSize === size;
                  const stockQty = getStockQuantity(size);
                  
                  return (
                    <div key={size} className="relative">
                      <button
                        onClick={() => handleSizeSelect(size)}
                        disabled={!isInStock}
                        className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm transition-all duration-300 relative overflow-hidden ${
                          !isInStock
                            ? "bg-gray-100 text-black cursor-not-allowed"
                            : isSelected
                            ? "bg-[#b90e0a] text-white shadow-lg shadow-[#b90e0a]/30 scale-105"
                            : "bg-[#fafafa] text-black hover:bg-[#b90e0a]/10 hover:scale-105 border border-black/10"
                        }`}
                      >
                        {size}
                        {!isInStock && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-[150%] h-[2px] bg-gray-400 rotate-45" />
                          </div>
                        )}
                      </button>
                      {/* Low stock warning */}
                      {isInStock && !isLoadingStock && stockQty <= 5 && (
                        <div className="absolute -bottom-4 left-0 right-0 text-center">
                          <span className="text-[9px] text-orange-500 font-bold">
                            Only {stockQty} left!
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              {isAllSizesOutOfStock() ? (
                <Button
                  disabled
                  className="w-full bg-gray-300 text-black cursor-not-allowed py-6 font-bold text-base rounded-xl"
                >
                  OUT OF STOCK
                </Button>
              ) : (
                <Button
                  onClick={handleAddToCart}
                  disabled={!selectedSize || isLoadingStock}
                  className="w-full bg-[#b90e0a] hover:bg-[#a00d09] text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-xl hover:shadow-[#b90e0a]/20 py-6 text-base rounded-xl group"
                >
                  <ShoppingBag className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  {isLoadingStock 
                    ? "CHECKING STOCK..." 
                    : !selectedSize 
                    ? "SELECT A SIZE" 
                    : "ADD TO CART"
                  }
                </Button>
              )}

              <Button
                onClick={handleShare}
                variant="outline"
                className="w-full border-2 border-black/10 hover:border-[#b90e0a] hover:text-[#b90e0a] transition-all duration-300 py-5 rounded-xl font-bold"
              >
                <Share2 className="w-5 h-5 mr-2" />
                Share Product
              </Button>
            </div>
          </div>
        </div>

        {/* FULL-WIDTH SECTIONS BELOW */}
        <div className="space-y-12">
          {/* Material & Care Section */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-black/5">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-[#b90e0a]/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[#b90e0a]" />
              </div>
              <h3 className="text-lg sm:text-xl font-black text-[#0a0a0a] font-akira">
                MATERIAL & CARE
              </h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {product.material.map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-4 bg-[#fafafa] rounded-xl border border-black/5 hover:border-[#b90e0a]/20 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-[#b90e0a] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">{i + 1}</span>
                  </div>
                  <p className="text-sm text-[#444444] leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews Section */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-black/5">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#b90e0a]/10 flex items-center justify-center">
                  <Star className="w-5 h-5 text-[#b90e0a]" />
                </div>
                <h3 className="text-lg sm:text-xl font-black text-[#0a0a0a] font-akira">
                  CUSTOMER REVIEWS
                </h3>
              </div>
              {user && !userReviewData && reviewStats.totalReviews > 0 && (
                <Button
                  onClick={() => {
                    setIsEditingReview(false);
                    setUserRating(0);
                    setUserReview("");
                    setShowReviewForm(true);
                  }}
                  className="bg-[#b90e0a] hover:bg-[#8a0a08] text-white font-bold transition-all duration-300 text-sm"
                >
                  <Star className="w-4 h-4 mr-1.5" />
                  Write Review
                </Button>
              )}
            </div>

            {isLoadingReviews ? (
              <div className="text-center py-12 text-gray-500">
                <div className="w-8 h-8 border-2 border-[#b90e0a] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                Loading reviews...
              </div>
            ) : reviewStats.totalReviews === 0 ? (
              <div className="text-center py-12 bg-[#fafafa] rounded-xl border border-black/5">
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-lg font-bold text-[#0a0a0a] mb-2">No reviews yet</p>
                <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
                  Be the first to share your experience with this product!
                </p>
                {user && (
                  <Button
                    onClick={() => {
                      setIsEditingReview(false);
                      setUserRating(0);
                      setUserReview("");
                      setShowReviewForm(true);
                    }}
                    className="bg-[#b90e0a] hover:bg-[#8a0a08] text-white font-bold transition-all duration-300"
                  >
                    <Star className="w-4 h-4 mr-2" />
                    Write First Review
                  </Button>
                )}
              </div>
            ) : (
              <>
                {/* Review Statistics */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-[#fafafa] rounded-xl p-6 border border-black/5 mb-6">
                  {/* Average Rating */}
                  <div className="flex flex-col items-center justify-center lg:border-r border-black/10">
                    <div className="text-5xl sm:text-6xl font-black text-[#b90e0a] mb-2">
                      {reviewStats.averageRating.toFixed(1)}
                    </div>
                    <div className="flex gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.round(reviewStats.averageRating)
                              ? "fill-[#b90e0a] text-[#b90e0a]"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-500">
                      Based on {reviewStats.totalReviews} review{reviewStats.totalReviews !== 1 ? "s" : ""}
                    </p>
                  </div>

                  {/* Rating Distribution */}
                  <div className="lg:col-span-2 space-y-2.5 lg:pl-6">
                    {[5, 4, 3, 2, 1].map((stars) => {
                      const count = reviewStats.ratingDistribution[stars as keyof typeof reviewStats.ratingDistribution];
                      const percentage = reviewStats.totalReviews > 0 ? (count / reviewStats.totalReviews) * 100 : 0;

                      return (
                        <div key={stars} className="flex items-center gap-3">
                          <div className="flex items-center gap-1 w-16">
                            <span className="text-sm font-medium text-[#0a0a0a]">{stars}</span>
                            <Star className="w-3.5 h-3.5 fill-[#b90e0a] text-[#b90e0a]" />
                          </div>
                          <div className="flex-1 bg-black/10 rounded-full h-2.5 overflow-hidden">
                            <div
                              className="bg-[#b90e0a] h-full transition-all duration-700 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-500 w-10 text-right">
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Edit Review Button (if user has review) */}
                {user && userReviewData && (
                  <div className="flex justify-end mb-4">
                    <Button
                      onClick={handleEditReview}
                      variant="outline"
                      size="sm"
                      className="border-[#b90e0a] text-[#b90e0a] hover:bg-[#b90e0a] hover:text-white transition-all duration-300"
                    >
                      <Star className="w-4 h-4 mr-1.5" />
                      Edit Your Review
                    </Button>
                  </div>
                )}

                {/* Display Reviews */}
                <div className="space-y-4">
                  {(() => {
                    const userReview = reviews.find(
                      (r) => r.userId === user?.id || r.userId === user?._id
                    );
                    const otherReviews = reviews.filter(
                      (r) => r.userId !== user?.id && r.userId !== user?._id
                    );
                    const orderedReviews = userReview ? [userReview, ...otherReviews] : otherReviews;
                    const displayReviews = showAllReviews ? orderedReviews : orderedReviews.slice(0, 4);

                    return displayReviews.map((review) => {
                      const isUserReview = review.userId === user?.id || review.userId === user?._id;

                      return (
                        <div
                          key={review._id}
                          className={`p-5 rounded-xl border transition-all duration-300 hover:shadow-md ${
                            isUserReview
                              ? "bg-[#b90e0a]/5 border-[#b90e0a]/20"
                              : "bg-[#fafafa] border-black/5 hover:border-black/10"
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-[#b90e0a] flex items-center justify-center text-white font-bold flex-shrink-0 shadow-md">
                              {review.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center justify-between flex-wrap gap-2">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-bold text-[#0a0a0a]">{review.name}</h4>
                                  {isUserReview && (
                                    <Badge className="bg-[#b90e0a] text-white text-[10px] px-2 py-0.5 font-bold">
                                      You
                                    </Badge>
                                  )}
                                </div>
                                <span className="text-xs text-gray-400">
                                  {getDaysAgo(review.createdAt) === 0 
                                    ? "Today" 
                                    : getDaysAgo(review.createdAt) === 1 
                                    ? "Yesterday" 
                                    : `${getDaysAgo(review.createdAt)} days ago`}
                                </span>
                              </div>
                              <div className="flex gap-0.5">
                                {[...Array(5)].map((_, j) => (
                                  <Star
                                    key={j}
                                    className={`w-4 h-4 ${
                                      j < review.rating
                                        ? "fill-[#b90e0a] text-[#b90e0a]"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              {review.description && (
                                <p className="text-sm text-[#444444] leading-relaxed">
                                  {review.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>

                {/* View All Reviews Button */}
                {reviews.length > 4 && (
                  <div className="text-center pt-4">
                    <Button
                      onClick={() => setShowAllReviews(!showAllReviews)}
                      variant="outline"
                      className="border-black/10 hover:border-[#b90e0a] hover:text-[#b90e0a] transition-all duration-300"
                    >
                      {showAllReviews ? (
                        <>
                          <ChevronUp className="w-4 h-4 mr-2" />
                          Show Less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4 mr-2" />
                          View All {reviews.length} Reviews
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}

            {/* Review Form */}
            {showReviewForm && (
              <form
                onSubmit={submitReview}
                className="space-y-5 p-6 bg-[#fafafa] rounded-xl border border-black/5 mt-6"
              >
                <h4 className="font-bold text-[#0a0a0a]">
                  {isEditingReview ? "Edit Your Review" : "Write a Review"}
                </h4>
                
                {!user && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-600 flex items-center gap-2">
                    <span>⚠️</span>
                    Please login to write a review
                  </div>
                )}

                <div>
                  <label className="text-sm font-bold text-[#0a0a0a] mb-3 block">
                    Your Rating <span className="text-[#b90e0a]">*</span>
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setUserRating(star)}
                        className="p-1.5 hover:scale-125 transition-all duration-300"
                        disabled={!user}
                      >
                        <Star
                          className={`w-8 h-8 ${
                            star <= userRating
                              ? "fill-[#b90e0a] text-[#b90e0a]"
                              : "text-gray-300 hover:text-[#b90e0a]/50"
                          } transition-colors`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold text-[#0a0a0a] mb-2 block">
                    Your Review <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    value={userReview}
                    onChange={(e) => setUserReview(e.target.value)}
                    placeholder={`Share your experience with the ${product.name}...`}
                    rows={4}
                    disabled={!user}
                    className="w-full bg-white border border-black/10 rounded-xl p-4 text-[#0a0a0a] focus:border-[#b90e0a] focus:ring-2 focus:ring-[#b90e0a]/10 transition-all duration-300 resize-none disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    disabled={!user || userRating === 0 || isSubmittingReview}
                    className="flex-1 bg-[#b90e0a] hover:bg-[#8a0a08] text-white font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed py-5 rounded-xl"
                  >
                    {isSubmittingReview ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Submitting...
                      </span>
                    ) : isEditingReview ? (
                      "Update Review"
                    ) : (
                      "Submit Review"
                    )}
                  </Button>
                  <Button
                    type="button"
                    onClick={handleCancelEdit}
                    variant="outline"
                    className="border-black/10 hover:border-[#b90e0a] hover:text-[#b90e0a] transition-all duration-300 py-5 rounded-xl"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>

          {/* Browse Other Products */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-black/5">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#b90e0a]/10 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-[#b90e0a]" />
                </div>
                <h3 className="text-lg sm:text-xl font-black text-[#0a0a0a] font-akira">
                  YOU MAY ALSO LIKE
                </h3>
              </div>
              <Button
                onClick={() => onNavigateToShop?.()}
                variant="outline"
                size="sm"
                className="border-black/10 text-[#0a0a0a] hover:bg-[#b90e0a] hover:text-white hover:border-[#b90e0a] transition-all duration-300 text-xs"
              >
                View All
              </Button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {otherProducts.map((otherProduct) => (
                <div
                  key={otherProduct.id}
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'instant' });
                    onNavigateToProduct?.(otherProduct.id);
                  }}
                  className="group bg-[#fafafa] rounded-xl overflow-hidden transition-all duration-300 cursor-pointer hover:shadow-lg border border-black/5 hover:border-[#b90e0a]/30"
                >
                  <div className="relative aspect-square overflow-hidden bg-[#f5f5f5]">
                    <img
                      src={otherProduct.image}
                      alt={otherProduct.name}
                      className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "/placeholder-product.jpg";
                      }}
                    />
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                      <span className="text-white font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[#b90e0a] px-4 py-2 rounded-full transform scale-90 group-hover:scale-100">
                        Quick View
                      </span>
                    </div>
                    {/* Product Tag */}
                    <Badge className="absolute top-3 left-3 bg-[#b90e0a] text-white border-none px-2.5 py-1 text-[10px] font-bold">
                      {otherProduct.tag}
                    </Badge>
                  </div>
                  <div className="p-4 space-y-2">
                    <h4 className="font-bold text-[#0a0a0a] text-sm group-hover:text-[#b90e0a] transition-colors line-clamp-1">
                      {otherProduct.name}
                    </h4>
                    <p className="text-[#b90e0a] font-black text-lg">
                      {otherProduct.price}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
