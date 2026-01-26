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
  ChevronRight,
  Mail,
  Instagram,
  ArrowLeft,
  ShoppingBag,
  Calendar,
  CreditCard,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "../../contexts/AuthContext";
import { getAllOrders, Order } from "../../services/orderService";

interface Props {
  onBackToMain: () => void;
  onNavigateToShop?: () => void;
  onNavigateToAbout?: () => void;
  onNavigateToContact?: () => void;
  onNavigateToLogin: () => void;
  onNavigateToSignup: () => void;
  onViewOrderDetail: (orderId: string) => void;
  skipAnimations?: boolean;
}

export default function OrdersPage({
  onBackToMain,
  onNavigateToShop,
  onNavigateToAbout,
  onNavigateToContact,
  onNavigateToLogin,
  onNavigateToSignup,
  onViewOrderDetail,
  skipAnimations = false,
}: Props) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, logout } = useAuth();
  
  // Get current route to determine active nav item
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
  const isHomeActive = currentPath === '/';
  const isShopActive = currentPath === '/shop' || currentPath.startsWith('/product/');

  useEffect(() => {
    if (user) {
      fetchOrders();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const data = await getAllOrders();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load orders. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5" />;
      case "confirmed":
        return <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5" />;
      case "shipped":
        return <Truck className="w-4 h-4 lg:w-5 lg:h-5" />;
      case "processing":
      case "pending":
      case "paid":
        return <Clock className="w-4 h-4 lg:w-5 lg:h-5" />;
      case "cancelled":
        return <XCircle className="w-4 h-4 lg:w-5 lg:h-5" />;
      case "return_requested":
      case "returned":
        return <Package className="w-4 h-4 lg:w-5 lg:h-5" />;
      default:
        return <Package className="w-4 h-4 lg:w-5 lg:h-5" />;
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

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
      <div className="relative z-10 pb-32 px-4 sm:px-6 lg:px-8 container mx-auto max-w-6xl">
        <div className="pt-6">
          {/* Back Button */}
          <button
            onClick={() => window.history.back()}
            className="mb-6 sm:mb-8 flex items-center gap-2 text-gray-500 hover:text-[#b90e0a] transition-all duration-300 group"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-semibold text-sm sm:text-base">Back</span>
          </button>

          {/* Header */}
          <div className="mb-8 sm:mb-12">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-[#b90e0a] to-[#ff3333] rounded-xl flex items-center justify-center shadow-lg shadow-[#b90e0a]/20">
              <ShoppingBag className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-gray-900">
                My Orders
              </h1>
              <p className="text-gray-500 text-sm sm:text-base mt-0.5">
                Track and manage your purchases
              </p>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-14 h-14 sm:w-16 sm:h-16 border-4 border-[#b90e0a] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Loading your orders...</p>
          </div>
        ) : !user ? (
          <div className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-8 sm:p-12 text-center shadow-lg">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <Package className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 text-gray-900">Please Log In</h2>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              You need to be logged in to view your orders. Login to track your purchases and manage returns.
            </p>
            <Button
              onClick={onNavigateToLogin}
              className="bg-gradient-to-r from-[#b90e0a] to-[#d91410] hover:from-[#a00d09] hover:to-[#b90e0a] text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-[#b90e0a]/25 transition-all duration-300 hover:-translate-y-0.5"
            >
              Log In
            </Button>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-8 sm:p-12 text-center shadow-lg">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <Package className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 text-gray-900">No Orders Yet</h2>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              You haven't placed any orders yet. Start shopping to see your orders here.
            </p>
            <Button
              onClick={handleShopNavigate}
              className="bg-gradient-to-r from-[#b90e0a] to-[#d91410] hover:from-[#a00d09] hover:to-[#b90e0a] text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-[#b90e0a]/25 transition-all duration-300 hover:-translate-y-0.5"
            >
              Start Shopping
            </Button>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-5">
            {orders.map((order, index) => (
              <div
                key={order._id}
                className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:shadow-xl hover:shadow-[#b90e0a]/5 transition-all duration-300 cursor-pointer group hover:border-[#b90e0a]/20"
                onClick={() => onViewOrderDetail(order._id)}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Order Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-base sm:text-lg text-gray-900 group-hover:text-[#b90e0a] transition-colors">
                          Order #{order.orderId}
                        </h3>
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mt-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{formatDate(order.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Order Details */}
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Package className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{order.items.length} {order.items.length === 1 ? 'item' : 'items'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <CreditCard className="w-4 h-4 text-gray-400" />
                        <span className="font-bold text-gray-900">₹{order.amount.toLocaleString()}</span>
                      </div>
                      {order.trackingUrl && (
                        <div className="flex items-center gap-1.5 text-[#b90e0a]">
                          <Truck className="w-4 h-4" />
                          <span className="font-medium">Tracked by {order.courierName || 'Courier'}</span>
                        </div>
                      )}
                    </div>

                    {/* Status and View Details */}
                    <div className="flex items-center gap-3 pt-2">
                      <Badge
                        className={`${getStatusStyles(order.status)} capitalize flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold border rounded-full`}
                      >
                        {getStatusIcon(order.status)}
                        <span>
                          {order.status === 'return_requested' ? 'Return Requested' : 
                           order.status === 'confirmed' ? 'Confirmed' : 
                           order.status}
                        </span>
                      </Badge>
                      <Button
                        variant="outline"
                        className="border-gray-200 hover:border-[#b90e0a] hover:bg-[#b90e0a]/5 hover:text-[#b90e0a] transition-all font-semibold rounded-xl group-hover:border-[#b90e0a]/30"
                      >
                        View Details
                        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 ml-1 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </div>

                  {/* Product Image */}
                  {order.items.length > 0 && (
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg border-2 border-white bg-gray-100 overflow-hidden shadow-sm">
                      <img
                        src={order.items[0].image}
                        alt={order.items[0].productName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>

      {/* Footer Contact */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 py-3 sm:py-4 px-4 z-40">
        <div className="container mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="text-sm text-gray-600 font-medium">
            Need help with your order?
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            <a
              href="mailto:support@kallkeyy.com"
              className="flex items-center gap-2 text-sm text-gray-700 hover:text-[#b90e0a] transition-colors font-semibold no-underline group"
            >
              <div className="w-8 h-8 bg-gray-100 group-hover:bg-[#b90e0a]/10 rounded-full flex items-center justify-center transition-colors">
                <Mail className="w-4 h-4" />
              </div>
              <span className="hidden sm:inline">Email Us</span>
            </a>
            <a
              href="https://instagram.com/kall.keyy/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-gray-700 hover:text-[#b90e0a] transition-colors font-semibold no-underline group"
            >
              <div className="w-8 h-8 bg-gray-100 group-hover:bg-[#b90e0a]/10 rounded-full flex items-center justify-center transition-colors">
                <Instagram className="w-4 h-4" />
              </div>
              <span className="hidden sm:inline">Message Us</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
