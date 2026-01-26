"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Menu,
  X,
  LogOut,
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  ArrowLeft,
  Mail,
  Instagram,
  MapPin,
  CreditCard,
  Calendar,
  Copy,
  ExternalLink,
  RotateCcw,
  Eye,
  EyeOff,
  Receipt,
  Phone,
  User,
  Check,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "../../contexts/AuthContext";
import { getOrderById, requestOrderReturn, Order } from "../../services/orderService";

interface Props {
  orderId: string;
  onBackToOrders: () => void;
  onBackToMain: () => void;
  onNavigateToShop?: () => void;
  onNavigateToAbout?: () => void;
  onNavigateToContact?: () => void;
  onNavigateToLogin: () => void;
  onNavigateToSignup: () => void;
  skipAnimations?: boolean;
}


export default function OrderDetailPage({
  orderId,
  onBackToOrders,
  onBackToMain,
  onNavigateToShop,
  onNavigateToAbout,
  onNavigateToContact,
  onNavigateToLogin,
  onNavigateToSignup,
  skipAnimations = false,
}: Props) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnReason, setReturnReason] = useState("");
  const [returnComments, setReturnComments] = useState("");
  const [showPaymentId, setShowPaymentId] = useState(false);
  const [copiedPaymentId, setCopiedPaymentId] = useState(false);
  const { user, logout } = useAuth();
  
  // Get current route to determine active nav item
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
  const isHomeActive = currentPath === '/';
  const isShopActive = currentPath === '/shop' || currentPath.startsWith('/product/');

  // Extract orderId from URL on mount or when URL changes (for page reloads)
  useEffect(() => {
    const pathParts = window.location.pathname.split('/');
    const urlOrderId = pathParts[pathParts.length - 1];
    if (urlOrderId && urlOrderId !== 'order-detail' && !orderId) {
      // If orderId prop is not available but URL has it, use URL orderId
      // This handles page reloads
      // Note: We can't change props, so we'll use urlOrderId in fetchOrderDetails
    }
  }, []);

  useEffect(() => {
    // Use orderId from props, or extract from URL if props not available (page reload)
    const pathParts = window.location.pathname.split('/');
    const urlOrderId = pathParts[pathParts.length - 1];
    const effectiveOrderId = orderId || (urlOrderId && urlOrderId !== 'order-detail' ? urlOrderId : null);
    
    if (user && effectiveOrderId) {
      fetchOrderDetails(effectiveOrderId);
    } else if (!user) {
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [user, orderId]);

  const fetchOrderDetails = async (orderIdToFetch?: string) => {
    try {
      setIsLoading(true);
      // Use provided orderId or extract from URL
      const pathParts = window.location.pathname.split('/');
      const urlOrderId = pathParts[pathParts.length - 1];
      const effectiveOrderId = orderIdToFetch || orderId || (urlOrderId && urlOrderId !== 'order-detail' ? urlOrderId : null);
      
      if (!effectiveOrderId) {
        throw new Error('Order ID not found');
      }
      
      const data = await getOrderById(effectiveOrderId);
      setOrder(data);
    } catch (error) {
      console.error("Error fetching order details:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load order details. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyPaymentId = () => {
    if (order?.razorpayPaymentId) {
      navigator.clipboard.writeText(order.razorpayPaymentId);
      setCopiedPaymentId(true);
      toast({
        title: "Copied!",
        description: "Payment ID copied to clipboard",
      });
      setTimeout(() => setCopiedPaymentId(false), 2000);
    }
  };

  const handleRequestReturn = async () => {
    if (!returnReason.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please provide a reason for return",
      });
      return;
    }

    try {
      await requestOrderReturn(orderId, returnReason, returnComments);
      toast({
        title: "Success",
        description: "Return request submitted successfully",
      });
      setShowReturnModal(false);
      fetchOrderDetails();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to submit return request",
      });
    }
  };

  const handleCancelOrder = () => {
    toast({
      variant: "destructive",
      title: "Order Cancellation",
      description: "Orders cannot be cancelled right now. Please mail to support@kallkeyy.com for order cancellation.",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return <CheckCircle className="w-5 h-5 lg:w-6 lg:h-6" />;
      case "confirmed":
        return <CheckCircle className="w-5 h-5 lg:w-6 lg:h-6" />;
      case "shipped":
        return <Truck className="w-5 h-5 lg:w-6 lg:h-6" />;
      case "processing":
      case "pending":
      case "paid":
        return <Clock className="w-5 h-5 lg:w-6 lg:h-6" />;
      case "cancelled":
        return <XCircle className="w-5 h-5 lg:w-6 lg:h-6" />;
      case "return_requested":
      case "returned":
        return <Package className="w-5 h-5 lg:w-6 lg:h-6" />;
      default:
        return <Package className="w-5 h-5 lg:w-6 lg:h-6" />;
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "confirmed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "shipped":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "processing":
      case "pending":
      case "paid":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200";
      case "return_requested":
      case "returned":
        return "bg-orange-50 text-orange-700 border-orange-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

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

  // Note: Cancel order functionality is temporarily disabled - users should email support
  const showCancelButton = order && (order.status === 'pending' || order.status === 'processing' || order.status === 'paid' || order.status === 'confirmed');
  const canRequestReturn = order && order.status === 'delivered' && !order.returnRequested;

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900 ${skipAnimations ? '[&_*]:!animate-none' : ''}`}>
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
                  onClick={onBackToOrders}
                  className="text-sm font-bold tracking-wide text-[#b90e0a] transition-colors duration-300 whitespace-nowrap uppercase"
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
                  onBackToMain();
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left text-white hover:text-[#b90e0a] transition-colors duration-300 px-3 py-3 hover:bg-white/5 rounded-lg text-base font-bold"
              >
                Home
              </button>
              <button
                onClick={() => {
                  handleShopNavigate();
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left text-white hover:text-[#b90e0a] transition-colors duration-300 px-3 py-3 hover:bg-white/5 rounded-lg text-base font-bold"
              >
                Shop
              </button>
              {user && (
                <button
                  onClick={() => {
                    onBackToOrders();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left text-[#b90e0a] transition-colors duration-300 px-3 py-3 bg-white/5 rounded-lg text-base font-bold"
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
      <div className="relative z-10 pt-12 sm:pt-18 pb-20 px-4 sm:px-6 lg:px-8 container mx-auto max-w-5xl">
        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="mb-8 sm:mb-10 flex items-center gap-2 text-gray-500 hover:text-[#b90e0a] transition-all duration-300 group"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-semibold text-sm sm:text-base">Back</span>
        </button>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-14 h-14 sm:w-16 sm:h-16 border-4 border-[#b90e0a] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Loading order details...</p>
          </div>
        ) : !order ? (
          <div className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-8 sm:p-12 text-center shadow-lg">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <Package className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 text-gray-900">Order Not Found</h2>
            <p className="text-gray-500 mb-6">The order you're looking for doesn't exist or may have been removed.</p>
            <Button 
              onClick={() => window.history.back()} 
              className="bg-gradient-to-r from-[#b90e0a] to-[#d91410] hover:from-[#a00d09] hover:to-[#b90e0a] text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-[#b90e0a]/25 transition-all duration-300 hover:-translate-y-0.5"
            >
              Go Back
            </Button>
          </div>
        ) : (
          <div className="space-y-5 sm:space-y-6">
            {/* Header Card */}
            <div className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8 shadow-lg">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-[#b90e0a] to-[#ff3333] rounded-xl flex items-center justify-center shadow-lg shadow-[#b90e0a]/20 flex-shrink-0">
                    <Receipt className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 mb-1">
                      Order #{order.orderId}
                    </h1>
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Placed on{" "}
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                <Badge 
                  className={`${getStatusStyles(order.status)} capitalize flex items-center gap-2 text-sm sm:text-base px-4 py-2 border rounded-full font-semibold self-start lg:self-center`}
                >
                  {getStatusIcon(order.status)}
                  <span>
                    {order.status === 'return_requested' ? 'Return Requested' : 
                     order.status === 'confirmed' ? 'Confirmed' : 
                     order.status}
                  </span>
                </Badge>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-lg">
              <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2 text-gray-900">
                <Package className="w-5 h-5 text-[#b90e0a]" />
                Order Items
              </h2>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div 
                    key={index} 
                    className="flex gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0 group"
                  >
                    <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 shadow-md group-hover:shadow-lg transition-shadow">
                      <img
                        src={item.image}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base sm:text-lg mb-1 text-gray-900 truncate">{item.productName}</h3>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className="text-xs sm:text-sm px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full font-medium">
                          Size: {item.size}
                        </span>
                        <span className="text-xs sm:text-sm px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full font-medium">
                          Qty: {item.quantity}
                        </span>
                      </div>
                      <p className="font-bold text-lg sm:text-xl text-[#b90e0a]">₹{item.price.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Total */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-lg sm:text-xl font-bold text-gray-900">Total Amount</span>
                  <span className="text-2xl sm:text-3xl font-black text-[#b90e0a]">₹{order.amount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Shipping & Payment Info */}
            <div className="grid lg:grid-cols-2 gap-5 sm:gap-6">
              {/* Shipping Address */}
              <div className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-lg">
                <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2 text-gray-900">
                  <MapPin className="w-5 h-5 text-[#b90e0a]" />
                  Shipping Address
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <User className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span className="font-semibold text-gray-900">{order.shippingAddress.fullName}</span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg text-gray-600 text-sm leading-relaxed">
                    <p>{order.shippingAddress.address}</p>
                    <p className="mt-1">
                      {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span>{order.shippingAddress.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg flex-1 min-w-0">
                      <Mail className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <span className="truncate">{order.shippingAddress.email}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-lg">
                <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2 text-gray-900">
                  <CreditCard className="w-5 h-5 text-[#b90e0a]" />
                  Payment Information
                </h2>
                {order.paymentMethod === 'cod' ? (
                  <div className="text-center py-6 px-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CreditCard className="w-6 h-6 text-amber-600" />
                    </div>
                    <p className="text-amber-700 font-medium">Cash on Delivery</p>
                    <p className="text-amber-600 text-sm mt-1">Payment will be collected at delivery</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-2 font-medium">Payment ID</p>
                      <div className="flex items-center gap-2">
                        {showPaymentId ? (
                          <div className="flex-1 flex items-center gap-2">
                            <code className="flex-1 bg-gray-50 border border-gray-200 px-3 py-2.5 rounded-lg text-sm text-gray-700 font-mono break-all">
                              {order.razorpayPaymentId || "N/A"}
                            </code>
                            {order.razorpayPaymentId && (
                              <div className="flex gap-1">
                                <button
                                  onClick={handleCopyPaymentId}
                                  className="p-2.5 bg-gray-100 hover:bg-[#b90e0a]/10 hover:text-[#b90e0a] rounded-lg transition-colors"
                                  title="Copy Payment ID"
                                >
                                  {copiedPaymentId ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                                </button>
                                <button
                                  onClick={() => setShowPaymentId(false)}
                                  className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                  title="Hide Payment ID"
                                >
                                  <EyeOff className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex-1 flex items-center gap-2">
                            <code className="flex-1 bg-gray-50 border border-gray-200 px-3 py-2.5 rounded-lg text-sm text-gray-400">
                              •••••••••••••••••
                            </code>
                            {order.razorpayPaymentId && (
                              <button
                                onClick={() => setShowPaymentId(true)}
                                className="px-4 py-2.5 bg-gray-100 hover:bg-[#b90e0a]/10 hover:text-[#b90e0a] rounded-lg text-sm transition-colors flex items-center gap-2 font-medium"
                                title="Show Payment ID"
                              >
                                <Eye className="w-4 h-4" />
                                View
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-2 font-medium">Payment Status</p>
                      <Badge className={`${order.paymentStatus === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'} capitalize px-3 py-1.5 border rounded-full font-semibold`}>
                        {order.paymentStatus}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tracking Info */}
            {order.trackingUrl && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-lg">
                <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2 text-blue-900">
                  <Truck className="w-5 h-5 text-blue-600" />
                  Shipping & Tracking
                </h2>
                <div className="grid sm:grid-cols-3 gap-4 mb-5">
                  <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-blue-100">
                    <p className="text-xs text-blue-600 mb-1 font-medium uppercase tracking-wide">Courier</p>
                    <p className="font-bold text-blue-900">{order.courierName || "N/A"}</p>
                  </div>
                  {order.awbCode && (
                    <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-blue-100">
                      <p className="text-xs text-blue-600 mb-1 font-medium uppercase tracking-wide">AWB Code</p>
                      <p className="font-bold text-blue-900 font-mono">{order.awbCode}</p>
                    </div>
                  )}
                  {order.estimatedDelivery && (
                    <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-blue-100">
                      <p className="text-xs text-blue-600 mb-1 font-medium uppercase tracking-wide">Est. Delivery</p>
                      <p className="font-bold text-blue-900 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(order.estimatedDelivery).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  )}
                </div>
                <a
                  href={order.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-6 py-3 rounded-xl transition-all duration-300 shadow-lg shadow-blue-600/25 hover:-translate-y-0.5"
                >
                  <Truck className="w-5 h-5" />
                  Track Package
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}

            {/* Return Request Info */}
            {order.returnRequested && (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-lg">
                <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2 text-amber-900">
                  <RotateCcw className="w-5 h-5 text-amber-600" />
                  Return Request
                </h2>
                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-amber-100">
                    <p className="text-xs text-amber-600 mb-1 font-medium uppercase tracking-wide">Reason</p>
                    <p className="font-semibold text-amber-900">{order.returnReason}</p>
                  </div>
                  {order.returnRequestedAt && (
                    <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-amber-100">
                      <p className="text-xs text-amber-600 mb-1 font-medium uppercase tracking-wide">Requested On</p>
                      <p className="font-semibold text-amber-900">
                        {new Date(order.returnRequestedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  )}
                </div>
                {order.returnComments && (
                  <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-amber-100 mb-4">
                    <p className="text-xs text-amber-600 mb-1 font-medium uppercase tracking-wide">Additional Comments</p>
                    <p className="text-amber-800">{order.returnComments}</p>
                  </div>
                )}
                <p className="text-sm text-amber-700 bg-amber-100 px-4 py-3 rounded-xl flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Your return request is being processed. We'll contact you soon.
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-lg">
              <h2 className="text-lg sm:text-xl font-bold mb-4 text-gray-900">Need Help?</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {showCancelButton && (
                  <Button 
                    onClick={handleCancelOrder} 
                    variant="outline" 
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-xl font-semibold h-12 transition-all cursor-pointer"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancel Order
                  </Button>
                )}
                {canRequestReturn && (
                  <Button 
                    onClick={() => setShowReturnModal(true)} 
                    variant="outline" 
                    className="border-amber-200 text-amber-600 hover:bg-amber-50 hover:border-amber-300 rounded-xl font-semibold h-12 transition-all"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Request Return
                  </Button>
                )}
                <a
                  href="mailto:support@kallkeyy.com"
                  className="flex items-center justify-center gap-2 border border-gray-200 hover:border-[#b90e0a] hover:bg-[#b90e0a]/5 text-gray-700 hover:text-[#b90e0a] px-4 py-3 rounded-xl transition-all font-semibold no-underline h-12"
                >
                  <Mail className="w-4 h-4" />
                  Email Us
                </a>
                <a
                  href="https://instagram.com/kallkeyy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 border border-gray-200 hover:border-[#b90e0a] hover:bg-[#b90e0a]/5 text-gray-700 hover:text-[#b90e0a] px-4 py-3 rounded-xl transition-all font-semibold no-underline h-12"
                >
                  <Instagram className="w-4 h-4" />
                  Message Us
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Return Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <RotateCcw className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Request Return</h2>
                <p className="text-sm text-gray-500">Fill out the form below</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Reason for Return *</label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-[#b90e0a] focus:ring-2 focus:ring-[#b90e0a]/20 transition-all"
                >
                  <option value="" disabled>Select a reason</option>
                  <option value="Defective Product">Defective Product</option>
                  <option value="Wrong Size">Wrong Size</option>
                  <option value="Wrong Item">Wrong Item Received</option>
                  <option value="Not as Described">Not as Described</option>
                  <option value="Changed Mind">Changed Mind</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Additional Comments (Optional)</label>
                <textarea
                  value={returnComments}
                  onChange={(e) => setReturnComments(e.target.value)}
                  placeholder="Provide any additional details..."
                  rows={4}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-[#b90e0a] focus:ring-2 focus:ring-[#b90e0a]/20 resize-none transition-all placeholder:text-gray-400"
                />
              </div>
              <p className="text-sm text-gray-500 bg-gray-50 px-4 py-3 rounded-xl">
                ℹ️ Returns are accepted within 7 days of delivery.
              </p>
              <div className="flex gap-3 pt-2">
                <Button 
                  onClick={handleRequestReturn} 
                  className="flex-1 bg-gradient-to-r from-[#b90e0a] to-[#d91410] hover:from-[#a00d09] hover:to-[#b90e0a] text-white font-bold h-12 rounded-xl shadow-lg shadow-[#b90e0a]/25"
                >
                  Submit Request
                </Button>
                <Button 
                  onClick={() => setShowReturnModal(false)} 
                  variant="outline" 
                  className="flex-1 border-gray-200 hover:bg-gray-50 h-12 rounded-xl font-semibold"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
