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
  M: { chest: "38-40", garmentChest: "46", length: "27.5", shoulder: "24.5" },
  L: { chest: "40-42", garmentChest: "48", length: "28.5", shoulder: "25" },
  XL: { chest: "42-44", garmentChest: "50", length: "29.5", shoulder: "25.5" },
  XXL: { chest: "44-46", garmentChest: "52", length: "30", shoulder: "26" },
};

const TSHIRT_SIZE_CHART = {
  M: { chest: "38-40", garmentChest: "46", length: "27.5", shoulder: "24.5" },
  L: { chest: "40-42", garmentChest: "48", length: "28.5", shoulder: "25" },
  XL: { chest: "42-44", garmentChest: "50", length: "29.5", shoulder: "25.5" },
  XXL: { chest: "44-46", garmentChest: "52", length: "30", shoulder: "26" },
};

// List of all available products (to exclude current product)
const ALL_PRODUCTS = [
  {
    id: "kaaldrishta",
    name: "KAAL-DRISHTA",
    price: "₹2,199",
    image: "/KaalDrishta-1.png",
    tag: "FLAGSHIP",
  },
  {
    id: "antahayugaysa",
    name: "ANTAHA-YUGAYSA",
    price: "₹2,199",
    image: "/Antahayugasya-1.png",
    tag: "NEW LAUNCH",
  },
  {
    id: "smarajivitam",
    name: "SMARA-JIVITAM",
    price: "₹999",
    image: "/Smarajivitam-1.png",
    tag: "NEW DROP",
  },
  {
    id: "mrityobaddha",
    name: "MRITYO-BADDHA",
    price: "₹999",
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
    <div className={`min-h-screen bg-black text-white relative overflow-hidden ${skipAnimations ? '[&_*]:!animate-none' : ''}`}>
      {/* Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#b90e0a]/5 via-transparent to-transparent pointer-events-none" />
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-[#b90e0a]/10 rounded-full blur-3xl pointer-events-none opacity-20" />

      {/* NAVBAR */}
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

      <div className="container mx-auto px-4 py-12 relative z-10">
        <button
          onClick={() => window.history.back()}
          className="group flex items-center gap-2 text-[#808088] hover:text-white transition-all duration-300 mb-8 hover:translate-x-1"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
          Back
        </button>

        {/* TWO-COLUMN LAYOUT: Images & Product Info Only */}
        <div className="grid lg:grid-cols-2 gap-12 items-start mb-16">
          {/* Left: Product Images/Videos */}
          <div className="space-y-6 sticky top-24">
            <div className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 bg-[#28282B] group">
              {product.images[activeIdx]?.endsWith(".mp4") ? (
                <video
                  src={product.images[activeIdx]}
                  className="w-full h-full object-contain"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              ) : (
                <img
                  src={product.images[activeIdx]}
                  alt={product.name}
                  className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.opacity = "0";
                  }}
                  draggable={false}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-center justify-between">
                  <Badge className="bg-[#b90e0a] text-white border-none px-4 py-2 text-sm font-bold">
                    KALLKEYY
                  </Badge>
                  <Badge className="bg-white/10 backdrop-blur-sm text-white border-white/20 px-4 py-2 text-sm font-bold">
                    {product.tag}
                  </Badge>
                </div>
              </div>
              <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-[#b90e0a]/50" />
              <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-[#b90e0a]/50" />
            </div>

            <div className="grid grid-cols-4 gap-4">
              {product.images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIdx(i)}
                  aria-label={`View ${
                    src.endsWith(".mp4") ? "video" : "image"
                  } ${i + 1}`}
                  className={`aspect-square rounded-lg overflow-hidden border transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#b90e0a] ${
                    activeIdx === i
                      ? "border-[#b90e0a] ring-1 ring-[#b90e0a]"
                      : "border-[#808088]/30 hover:border-white"
                  }`}
                >
                  {src.endsWith(".mp4") ? (
                    <video
                      src={src}
                      className="w-full h-full object-contain"
                      muted
                      playsInline
                    />
                  ) : (
                    <img
                      src={src}
                      alt={`${product.name} view ${i + 1}`}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.opacity =
                          "0";
                      }}
                      draggable={false}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Product Details (Title, Price, Description, Size, Add to Cart) */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                {isLoadingStock ? (
                  <Badge className="bg-gray-500 text-white px-4 py-1.5 rounded-full">
                    Checking Stock...
                  </Badge>
                ) : isAllSizesOutOfStock() ? (
                  <Badge className="bg-red-500 text-white px-4 py-1.5 rounded-full font-bold">
                    OUT OF STOCK
                  </Badge>
                ) : (
                  <Badge className="bg-green-500 text-white px-4 py-1.5 rounded-full">
                    In Stock
                  </Badge>
                )}
                <Badge className="bg-white/10 text-white border border-white/20 px-3 py-1 text-xs font-bold">
                  ASTITVA ACT-I
                </Badge>
              </div>

              <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
                {product.name}
              </h1>

              <div className="flex items-center gap-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.round(reviewStats.averageRating)
                          ? "fill-[#b90e0a] text-[#b90e0a]"
                          : "text-[#808088]"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[#808088] text-sm">
                  ({reviewStats.totalReviews} review
                  {reviewStats.totalReviews !== 1 ? "s" : ""})
                </span>
              </div>

              {product.originalPrice && product.salePrice ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <p className="text-2xl font-bold text-[#b90e0a]">
                      {product.salePrice}
                    </p>
                    <p className="text-xl text-[#808088] line-through">
                      {product.originalPrice}
                    </p>
                    <Badge className="bg-green-500 text-white px-3 py-1 text-sm font-bold">
                      {Math.round(
                        ((parseFloat(
                          product.originalPrice.replace(/[₹,]/g, "")
                        ) -
                          parseFloat(product.salePrice.replace(/[₹,]/g, ""))) /
                          parseFloat(
                            product.originalPrice.replace(/[₹,]/g, "")
                          )) *
                          100
                      )}
                      % OFF
                    </Badge>
                  </div>
                </div>
              ) : (
                <p className="text-2xl font-bold text-[#b90e0a]">
                  {product.price}
                </p>
              )}

              <p className="text-[#CCCCCC] leading-relaxed">
                {product.description}
              </p>

              <div className="border-t border-white/10 pt-6">
                <h3 className="text-sm font-bold text-white mb-4 tracking-wider">
                  PRODUCT DETAILS
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { icon: Ruler, text: "Premium Fit" },
                    { icon: Truck, text: "Fast Shipping" },
                    { icon: RotateCcw, text: "Easy Returns" },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex flex-col items-center gap-2 p-4 bg-[#28282B] rounded-lg border border-white/10"
                    >
                      <item.icon className="w-6 h-6 text-[#b90e0a]" />
                      <span className="text-xs text-center text-[#CCCCCC]">
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Size Selection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white tracking-wider">
                  SIZE
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSizeChart(!showSizeChart)}
                  className="border border-[#b90e0a] text-[#b90e0a] hover:bg-[#b90e0a] hover:text-white transition-all duration-300 hover:scale-105"
                >
                  <Ruler className="w-4 h-4 mr-2" />
                  Size Chart{" "}
                  {showSizeChart ? (
                    <ChevronUp className="ml-2 w-4 h-4" />
                  ) : (
                    <ChevronDown className="ml-2 w-4 h-4" />
                  )}
                </Button>
              </div>

              {/* Animated Size Chart */}
              <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  showSizeChart
                    ? "max-h-[600px] opacity-100 mt-4"
                    : "max-h-0 opacity-0 mt-0"
                }`}
              >
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h4 className="font-bold text-sm mb-3">
                    {product.productType === "hoodie" ? "Hoodie" : "T-Shirt"}{" "}
                    Size Chart (inches)
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-white/20">
                          <th className="text-left p-2">Size</th>
                          <th className="text-left p-2">Body Chest</th>
                          <th className="text-left p-2">Garment Chest</th>
                          <th className="text-left p-2">Length</th>
                          <th className="text-left p-2">Shoulder</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(SIZE_CHART).map(
                          ([size, measurements]) => (
                            <tr key={size} className="border-b border-white/10">
                              <td className="p-2 font-semibold">{size}</td>
                              <td className="p-2">{measurements.chest}"</td>
                              <td className="p-2">
                                {measurements.garmentChest}"
                              </td>
                              <td className="p-2">{measurements.length}"</td>
                              <td className="p-2">{measurements.shoulder}"</td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Size buttons with minimal stock indicators */}
              <div className="grid grid-cols-4 gap-3">
                {Object.keys(SIZE_CHART).map((size) => {
                  const isInStock = isSizeInStock(size);
                  const isSelected = selectedSize === size;
                  const stockQty = getStockQuantity(size);
                  
                  return (
                    <div key={size} className="relative pb-4">
                      <button
                        onClick={() => handleSizeSelect(size)}
                        disabled={!isInStock}
                        className={`w-full py-3 px-4 border rounded-lg font-bold transition-all duration-300 relative overflow-hidden ${
                          !isInStock
                            ? "border-gray-600 bg-gray-800 text-gray-500 cursor-not-allowed opacity-50"
                            : isSelected
                            ? "border-[#b90e0a] bg-[#b90e0a] text-white shadow-lg shadow-[#b90e0a]/20 hover:scale-105"
                            : "border-[#808088]/30 hover:border-white hover:shadow-lg hover:scale-105"
                        }`}
                      >
                        {size}
                        {!isInStock && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-[140%] h-[1.5px] bg-red-500 rotate-45" />
                          </div>
                        )}
                      </button>
                      {/* Only show stock when it's critically low (≤5) */}
                      {isInStock && !isLoadingStock && stockQty <= 5 && (
                        <div className="absolute -bottom-5 left-0 right-0 text-center">
                          <span className="text-[10px] text-orange-400 font-bold animate-pulse">
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
            <div className="space-y-4">
              {isAllSizesOutOfStock() ? (
                <Button
                  disabled
                  className="w-full bg-gray-400 text-white cursor-not-allowed opacity-60 py-4 font-bold"
                >
                  OUT OF STOCK
                </Button>
              ) : (
                <Button
                  onClick={handleAddToCart}
                  disabled={!selectedSize || isLoadingStock}
                  className="w-full bg-gradient-to-r from-[#b90e0a] to-[#FF0000] hover:from-[#FF0000] hover:to-[#b90e0a] text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] py-4"
                >
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  {isLoadingStock 
                    ? "CHECKING STOCK..." 
                    : !selectedSize 
                    ? "SELECT A SIZE" 
                    : "ADD TO CART"
                  }
                </Button>
              )}

              <div className="grid grid-cols-1 gap-3">
                <Button
                  onClick={handleShare}
                  variant="outline"
                  className="border-white/20 hover:border-[#b90e0a] transition-all duration-300 hover:scale-105"
                >
                  <Share2 className="w-5 h-5 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* FULL-WIDTH SECTIONS BELOW (Material, Reviews, Browse Products) */}
        <div className="space-y-16">
          {/* Material & Care - Full Width */}
          <div className="border-t border-white/10 pt-8 space-y-4">
            <h3 className="text-sm font-bold text-white tracking-wider flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-[#b90e0a]" />
              MATERIAL & CARE
            </h3>
            <div className="bg-[#28282B] rounded-lg p-6 border border-white/10">
              <div className="space-y-2">
                {product.material.map((item, i) => (
                  <p
                    key={i}
                    className="text-sm text-[#CCCCCC] flex items-start gap-2"
                  >
                    <span className="text-[#b90e0a] mt-1">•</span>
                    <span>{item}</span>
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Reviews Section - Full Width */}
          <div className="border-t border-white/10 pt-8 space-y-6">
            {/* Header with Review Stats */}
            <div className="space-y-4">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white font-akira">
                Customer Reviews
              </h3>

              {isLoadingReviews ? (
                <div className="text-center py-8 text-[#808088]">
                  Loading reviews...
                </div>
              ) : reviewStats.totalReviews === 0 ? (
                <div className="bg-[#28282B] rounded-lg p-8 border border-white/10 text-center">
                  <Star className="w-12 h-12 mx-auto mb-4 text-[#808088]" />
                  <p className="text-lg text-white mb-2">No reviews yet</p>
                  <p className="text-sm text-[#808088] mb-6">
                    Be the first to review this product!
                  </p>
                  {user && (
                    <Button
                      onClick={() => {
                        setIsEditingReview(false);
                        setUserRating(0);
                        setUserReview("");
                        setShowReviewForm(true);
                      }}
                      className="bg-[#b90e0a] hover:bg-[#b90e0a]/90 text-white font-bold transition-all duration-300 hover:scale-105"
                    >
                      <Star className="w-4 h-4 mr-2" />
                      Write First Review
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  {/* Review Statistics */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-[#28282B] rounded-lg p-6 border border-white/10">
                    {/* Average Rating */}
                    <div className="flex flex-col items-center justify-center border-r border-white/10 lg:border-r-0">
                      <div className="text-5xl font-black text-white mb-2">
                        {reviewStats.averageRating.toFixed(1)}
                      </div>
                      <div className="flex gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${
                              i < Math.round(reviewStats.averageRating)
                                ? "fill-[#b90e0a] text-[#b90e0a]"
                                : "text-[#808088]"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-[#808088]">
                        Based on {reviewStats.totalReviews} review
                        {reviewStats.totalReviews !== 1 ? "s" : ""}
                      </p>
                    </div>

                    {/* Rating Distribution */}
                    <div className="lg:col-span-2 space-y-2">
                      {[5, 4, 3, 2, 1].map((stars) => {
                        const count =
                          reviewStats.ratingDistribution[
                            stars as keyof typeof reviewStats.ratingDistribution
                          ];
                        const percentage =
                          reviewStats.totalReviews > 0
                            ? (count / reviewStats.totalReviews) * 100
                            : 0;

                        return (
                          <div key={stars} className="flex items-center gap-3">
                            <span className="text-sm text-white w-12">
                              {stars} star
                            </span>
                            <div className="flex-1 bg-[#1C1C21] rounded-full h-3 overflow-hidden">
                              <div
                                className="bg-[#b90e0a] h-full transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-sm text-[#808088] w-12 text-right">
                              {Math.round(percentage)}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Write/Edit Review Button */}
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-[#808088]">
                      {reviewStats.totalReviews} review
                      {reviewStats.totalReviews !== 1 ? "s" : ""}
                    </p>
                    {user &&
                      (userReviewData ? (
                        <Button
                          onClick={handleEditReview}
                          variant="outline"
                          size="sm"
                          className="border-[#b90e0a] text-[#b90e0a] hover:bg-[#b90e0a] hover:text-white transition-all duration-300 hover:scale-105"
                        >
                          <Star className="w-4 h-4 mr-2" />
                          Edit Your Review
                        </Button>
                      ) : (
                        <Button
                          onClick={() => {
                            setIsEditingReview(false);
                            setUserRating(0);
                            setUserReview("");
                            setShowReviewForm(true);
                          }}
                          variant="outline"
                          size="sm"
                          className="border-[#b90e0a] text-[#b90e0a] hover:bg-[#b90e0a] hover:text-white transition-all duration-300 hover:scale-105"
                        >
                          <Star className="w-4 h-4 mr-2" />
                          Write Review
                        </Button>
                      ))}
                  </div>

                  {/* Display Reviews */}
                  <div className="space-y-4">
                    {(() => {
                      // Separate user's review and other reviews
                      const userReview = reviews.find(
                        (r) => r.userId === user?.id || r.userId === user?._id
                      );
                      const otherReviews = reviews.filter(
                        (r) => r.userId !== user?.id && r.userId !== user?._id
                      );

                      // Combine: user's review first, then others
                      const orderedReviews = userReview
                        ? [userReview, ...otherReviews]
                        : otherReviews;

                      // Show only first 4 if not expanded
                      const displayReviews = showAllReviews
                        ? orderedReviews
                        : orderedReviews.slice(0, 4);

                      return displayReviews.map((review) => {
                        const isUserReview =
                          review.userId === user?.id ||
                          review.userId === user?._id;

                        return (
                          <div
                            key={review._id}
                            className={`p-4 rounded-lg border ${
                              isUserReview
                                ? "bg-[#b90e0a]/10 border-[#b90e0a]/30"
                                : "bg-[#28282B] border-white/10"
                            }`}
                          >
                            <div className="flex items-start gap-4">
                              <div className="w-10 h-10 rounded-full bg-[#b90e0a] flex items-center justify-center text-white font-bold flex-shrink-0">
                                {review.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h4 className="font-bold text-white flex items-center gap-2">
                                      {review.name}
                                      {isUserReview && (
                                        <Badge className="bg-[#b90e0a] text-white text-xs px-2 py-0.5">
                                          Your Review
                                        </Badge>
                                      )}
                                    </h4>
                                  </div>
                                  <span className="text-xs text-[#808088]">
                                    {getDaysAgo(review.createdAt)}d ago
                                  </span>
                                </div>
                                <div className="flex gap-1">
                                  {[...Array(5)].map((_, j) => (
                                    <Star
                                      key={j}
                                      className={`w-4 h-4 ${
                                        j < review.rating
                                          ? "fill-[#b90e0a] text-[#b90e0a]"
                                          : "text-[#808088]"
                                      }`}
                                    />
                                  ))}
                                </div>
                                {review.description && (
                                  <p className="text-sm text-[#CCCCCC]">
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
                    <div className="text-center">
                      <Button
                        onClick={() => setShowAllReviews(!showAllReviews)}
                        variant="outline"
                        className="border-white/20 hover:border-[#b90e0a] transition-all duration-300 hover:scale-105"
                      >
                        {showAllReviews ? (
                          <>
                            <ChevronUp className="w-4 h-4 mr-2" />
                            Show Less Reviews
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
                  className="space-y-4 p-4 bg-[#28282B]/50 rounded-lg border border-white/10"
                >
                  {!user && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400">
                      Please login to write a review
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-semibold text-[#CCCCCC] mb-2 block">
                      Rating <span className="text-[#b90e0a]">*</span>
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setUserRating(star)}
                          className="p-1 hover:scale-110 transition-transform duration-300"
                          disabled={!user}
                        >
                          <Star
                            className={`w-6 h-6 ${
                              star <= userRating
                                ? "fill-[#b90e0a] text-[#b90e0a]"
                                : "text-[#808088]"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-[#CCCCCC] mb-2 block">
                      Your Review{" "}
                      <span className="text-[#808088]">(Optional)</span>
                    </label>
                    <textarea
                      value={userReview}
                      onChange={(e) => setUserReview(e.target.value)}
                      placeholder={`Share your experience with the ${product.name.toLowerCase()}...`}
                      rows={4}
                      disabled={!user}
                      className="w-full bg-[#1C1C21] border border-[#808088]/30 rounded-lg p-3 text-white focus:border-[#b90e0a] focus:ring-2 focus:ring-[#b90e0a]/20 transition-all duration-300 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={!user || userRating === 0 || isSubmittingReview}
                      className="flex-1 bg-[#b90e0a] hover:bg-[#b90e0a]/90 text-white font-bold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmittingReview
                        ? "Submitting..."
                        : isEditingReview
                        ? "Update Review"
                        : "Submit Review"}
                    </Button>
                    <Button
                      type="button"
                      onClick={handleCancelEdit}
                      variant="outline"
                      className="border-white/20 hover:border-[#b90e0a] transition-all duration-300"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Browse Other Products - Full Width */}
          <div className="border-t border-white/10 pt-8 space-y-6">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white font-akira">
              BROWSE OTHER PRODUCTS
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {otherProducts.map((otherProduct) => (
                <div
                  key={otherProduct.id}
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'instant' });
                    onNavigateToProduct?.(otherProduct.id);
                  }}
                  className="group bg-[#28282B] rounded-lg border border-white/10 overflow-hidden hover:border-[#b90e0a] transition-all duration-300 cursor-pointer hover:scale-105"
                >
                  <div className="aspect-square overflow-hidden bg-[#1a1a1a]">
                    <img
                      src={otherProduct.image}
                      alt={otherProduct.name}
                      className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          "/placeholder-product.jpg";
                      }}
                    />
                  </div>
                  <div className="p-3 md:p-4 space-y-1 md:space-y-2">
                    <Badge className="bg-white/10 text-white border-none px-2 py-0.5 text-xs">
                      {otherProduct.tag}
                    </Badge>
                    <h4 className="font-bold text-white text-xs md:text-sm line-clamp-2">
                      {otherProduct.name}
                    </h4>
                    <p className="text-[#b90e0a] font-bold text-sm md:text-base">
                      {otherProduct.price}
                    </p>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.scrollTo({ top: 0, behavior: 'instant' });
                        onNavigateToProduct?.(otherProduct.id);
                      }}
                      variant="outline"
                      size="sm"
                      className="w-full border-[#b90e0a] text-[#b90e0a] hover:bg-[#b90e0a] hover:text-white transition-all duration-300 text-xs py-1.5"
                    >
                      View Product
                    </Button>
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
