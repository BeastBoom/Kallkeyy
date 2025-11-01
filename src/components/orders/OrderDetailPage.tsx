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
  const { user, logout } = useAuth();

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
      toast({
        title: "Copied!",
        description: "Payment ID copied to clipboard",
      });
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
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case "confirmed":
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case "shipped":
        return <Truck className="w-6 h-6 text-blue-500" />;
      case "processing":
      case "pending":
      case "paid":
        return <Clock className="w-6 h-6 text-yellow-500" />;
      case "cancelled":
        return <XCircle className="w-6 h-6 text-red-500" />;
      case "return_requested":
      case "returned":
        return <Package className="w-6 h-6 text-amber-500" />;
      default:
        return <Package className="w-6 h-6 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-green-500";
      case "confirmed":
        return "bg-green-500";
      case "shipped":
        return "bg-blue-500";
      case "processing":
      case "pending":
      case "paid":
        return "bg-yellow-500";
      case "cancelled":
        return "bg-red-500";
      case "return_requested":
      case "returned":
        return "bg-amber-500";
      default:
        return "bg-gray-500";
    }
  };

  const handleUnavailablePage = (pageName: string) => {
    toast({
      title: "Coming Soon",
      description: `${pageName} page will be available soon!`,
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

  // Note: Cancel order functionality is temporarily disabled - users should email support
  const showCancelButton = order && (order.status === 'pending' || order.status === 'processing' || order.status === 'paid' || order.status === 'confirmed');
  const canRequestReturn = order && order.status === 'delivered' && !order.returnRequested;

  return (
    <div className={`min-h-screen bg-black text-white overflow-hidden ${skipAnimations ? '[&_*]:!animate-none' : ''}`}>
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
                    onClick={onBackToOrders}
                    className="text-[#b90e0a] transition-colors duration-300 px-2 lg:px-3 py-2 bg-white/5 rounded-lg whitespace-nowrap"
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
                  onClick={onBackToOrders}
                  className="block w-full text-left text-[#b90e0a] transition-colors duration-300 px-4 py-2.5 bg-white/5 rounded-lg text-base font-semibold"
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

      {/* Main Content */}
      <div className="pt-32 pb-20 px-4 lg:px-8 container mx-auto max-w-6xl">
        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="mb-8 flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-semibold">Back</span>
        </button>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-[#b90e0a] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !order ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold mb-4">Order Not Found</h2>
            <p className="text-gray-400 mb-6">The order you're looking for doesn't exist.</p>
            <Button onClick={() => window.history.back()} className="bg-[#b90e0a] hover:bg-[#8a0a07] text-white font-bold">
              Back
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-black mb-2">Order #{order.orderId}</h1>
                  <p className="text-gray-400">
                    Placed on{" "}
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <Badge variant="outline" className={`${getStatusColor(order.status)} text-white border-0 capitalize flex items-center gap-2 text-base px-4 py-2`}>
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
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Order Items
              </h2>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex gap-4 pb-4 border-b border-white/10 last:border-0 last:pb-0">
                    <img
                      src={item.image}
                      alt={item.productName}
                      className="w-20 h-20 lg:w-24 lg:h-24 object-cover rounded-lg bg-white/5"
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1">{item.productName}</h3>
                      <p className="text-sm text-gray-400 mb-2">
                        Size: {item.size} | Qty: {item.quantity}
                      </p>
                      <p className="font-semibold text-lg">₹{item.price.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold">Total Amount</span>
                  <span className="text-2xl font-black text-[#b90e0a]">₹{order.amount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Shipping & Payment Info */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Shipping Address */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Shipping Address
                </h2>
                <div className="space-y-2 text-gray-300">
                  <p className="font-semibold text-white">{order.shippingAddress.fullName}</p>
                  <p>{order.shippingAddress.address}</p>
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state}
                  </p>
                  <p>{order.shippingAddress.pincode}</p>
                  <p className="pt-2 border-t border-white/10">{order.shippingAddress.phone}</p>
                  <p>{order.shippingAddress.email}</p>
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Information
                </h2>
                {order.paymentMethod === 'cod' ? (
                  <div className="text-center py-4">
                    <p className="text-gray-400">Payment Information is not available for COD Orders</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Payment ID</p>
                      <div className="flex items-center gap-2">
                        {showPaymentId ? (
                          <>
                            <code className="flex-1 bg-white/5 px-3 py-2 rounded text-sm break-all">
                              {order.razorpayPaymentId || "N/A"}
                            </code>
                            {order.razorpayPaymentId && (
                              <>
                                <button
                                  onClick={handleCopyPaymentId}
                                  className="p-2 hover:bg-white/10 rounded transition-colors"
                                  title="Copy Payment ID"
                                >
                                  <Copy className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setShowPaymentId(false)}
                                  className="p-2 hover:bg-white/10 rounded transition-colors"
                                  title="Hide Payment ID"
                                >
                                  <EyeOff className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </>
                        ) : (
                          <div className="flex-1 flex items-center gap-2">
                            <code className="flex-1 bg-white/5 px-3 py-2 rounded text-sm">
                              •••••••••••••••••
                            </code>
                            {order.razorpayPaymentId && (
                              <button
                                onClick={() => setShowPaymentId(true)}
                                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded text-sm transition-colors flex items-center gap-2"
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
                      <p className="text-sm text-gray-400 mb-1">Payment Status</p>
                      <Badge className={order.paymentStatus === 'completed' ? 'bg-green-500' : 'bg-yellow-500'}>{order.paymentStatus}</Badge>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tracking Info */}
            {order.trackingUrl && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Shipping & Tracking
                </h2>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Courier</p>
                      <p className="font-semibold">{order.courierName || "N/A"}</p>
                    </div>
                    {order.awbCode && (
                      <div>
                        <p className="text-sm text-gray-400 mb-1">AWB Code</p>
                        <p className="font-semibold">{order.awbCode}</p>
                      </div>
                    )}
                    {order.estimatedDelivery && (
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Estimated Delivery</p>
                        <p className="font-semibold flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(order.estimatedDelivery).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
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
                    className="inline-flex items-center gap-2 bg-[#b90e0a] hover:bg-[#8a0a07] text-white font-bold px-6 py-3 rounded-lg transition-colors"
                  >
                    <Truck className="w-5 h-5" />
                    Track Package
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            )}

            {/* Return Request Info */}
            {order.returnRequested && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-amber-500">
                  <RotateCcw className="w-5 h-5" />
                  Return Request
                </h2>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Reason</p>
                    <p className="font-semibold">{order.returnReason}</p>
                  </div>
                  {order.returnComments && (
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Comments</p>
                      <p className="text-gray-300">{order.returnComments}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Requested On</p>
                    <p className="font-semibold">
                      {order.returnRequestedAt
                        ? new Date(order.returnRequestedAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "N/A"}
                    </p>
                  </div>
                  <p className="text-sm text-amber-400 mt-4">Your return request is being processed. We'll contact you soon.</p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4">Need Help?</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {showCancelButton && (
                  <Button onClick={handleCancelOrder} variant="outline" className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white cursor-pointer">
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancel Order
                  </Button>
                )}
                {canRequestReturn && (
                  <Button onClick={() => setShowReturnModal(true)} variant="outline" className="border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-white">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Request Return
                  </Button>
                )}
                <a
                  href="mailto:support@kallkeyy.com"
                  className="flex items-center justify-center gap-2 border border-white/20 hover:border-[#b90e0a] hover:bg-[#b90e0a]/10 text-white hover:text-[#b90e0a] px-4 py-2 rounded-lg transition-all font-semibold no-underline"
                >
                  <Mail className="w-4 h-4" />
                  Email Us
                </a>
                <a
                  href="https://instagram.com/kallkeyy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 border border-white/20 hover:border-[#b90e0a] hover:bg-[#b90e0a]/10 text-white hover:text-[#b90e0a] px-4 py-2 rounded-lg transition-all font-semibold no-underline"
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Request Return</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Reason for Return *</label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#b90e0a]"
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
                <label className="block text-sm font-medium mb-2">Additional Comments (Optional)</label>
                <textarea
                  value={returnComments}
                  onChange={(e) => setReturnComments(e.target.value)}
                  placeholder="Provide any additional details..."
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#b90e0a] resize-none"
                />
              </div>
              <p className="text-sm text-gray-400">Returns are accepted within 7 days of delivery.</p>
              <div className="flex gap-3">
                <Button onClick={handleRequestReturn} className="flex-1 bg-[#b90e0a] hover:bg-[#8a0a07] text-white font-bold">
                  Submit Request
                </Button>
                <Button onClick={() => setShowReturnModal(false)} variant="outline" className="flex-1 border-white/20">
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
