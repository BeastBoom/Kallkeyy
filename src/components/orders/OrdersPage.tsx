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
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "confirmed":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "shipped":
        return <Truck className="w-5 h-5 text-blue-500" />;
      case "processing":
      case "pending":
      case "paid":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "cancelled":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "return_requested":
      case "returned":
        return <Package className="w-5 h-5 text-amber-500" />;
      default:
        return <Package className="w-5 h-5 text-gray-500" />;
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
              <div className="hidden lg:flex gap-0.5 text-sm font-bold">
                <button
                  onClick={() => onBackToMain()}
                  className={isHomeActive 
                    ? "text-[#b90e0a] transition-colors duration-300 px-1 lg:px-2 py-2 bg-white/5 rounded-lg whitespace-nowrap"
                    : "hover:text-[#b90e0a] transition-colors duration-300 px-1 lg:px-2 py-2 hover:bg-white/5 rounded-lg whitespace-nowrap"
                  }
                >
                  HOME
                </button>
                <button
                  onClick={() =>
                    onNavigateToShop
                      ? onNavigateToShop()
                      : handleUnavailablePage("Shop")
                  }
                  className={isShopActive
                    ? "text-[#b90e0a] transition-colors duration-300 px-1 lg:px-2 py-2 bg-white/5 rounded-lg whitespace-nowrap"
                    : "hover:text-[#b90e0a] transition-colors duration-300 px-1 lg:px-2 py-2 hover:bg-white/5 rounded-lg whitespace-nowrap"
                  }
                >
                  SHOP
                </button>
                {user && (
                  <button
                    className="text-[#b90e0a] transition-colors duration-300 px-1 lg:px-2 py-2 bg-white/5 rounded-lg whitespace-nowrap"
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
                  className="hover:text-[#b90e0a] transition-colors duration-300 px-1 lg:px-2 py-2 hover:bg-white/5 rounded-lg whitespace-nowrap"
                >
                  ABOUT
                </button>
                <button
                  onClick={() =>
                    onNavigateToContact
                      ? onNavigateToContact()
                      : handleUnavailablePage("Contact")
                  }
                  className="hover:text-[#b90e0a] transition-colors duration-300 px-1 lg:px-2 py-2 hover:bg-white/5 rounded-lg whitespace-nowrap"
                >
                  CONTACT
                </button>

                {/* AUTH BUTTONS - Desktop */}
                {user ? (
                  <>
                    <span className="text-white px-1 lg:px-2 py-2 flex items-center text-xs whitespace-nowrap">
                      HEY,{" "}
                      <span className="text-[#b90e0a] ml-1">
                        {formatDisplayName(user.name)}
                      </span>
                    </span>
                    <button
                      onClick={logout}
                      className="hover:text-[#b90e0a] transition-colors duration-300 px-1 lg:px-2 py-2 hover:bg-white/5 rounded-lg flex items-center gap-1 whitespace-nowrap"
                    >
                      <LogOut size={14} className="lg:w-4 lg:h-4" />
                      <span className="text-xs">LOGOUT</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => onNavigateToLogin()}
                      className="hover:text-[#b90e0a] transition-colors duration-300 px-1 lg:px-2 py-2 hover:bg-white/5 rounded-lg whitespace-nowrap text-xs"
                    >
                      LOGIN
                    </button>
                    <button
                      onClick={() => onNavigateToSignup()}
                      className="bg-[#b90e0a] hover:bg-[#b90e0a]/80 transition-colors duration-300 px-2 lg:px-3 py-2 rounded-lg ml-1 whitespace-nowrap text-xs"
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
      <div className="pt-32 pb-20 px-4 lg:px-8 container mx-auto">
        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="mb-8 flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-semibold">Back</span>
        </button>

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl lg:text-5xl font-black mb-4 tracking-tight">
            My Orders
          </h1>
          <p className="text-gray-400 text-lg">
            Track and manage your orders
          </p>
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-[#b90e0a] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !user ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold mb-4">Please Log In</h2>
            <p className="text-gray-400 mb-6">
              You need to be logged in to view your orders
            </p>
            <Button
              onClick={onNavigateToLogin}
              className="bg-[#b90e0a] hover:bg-[#8a0a07] text-white font-bold"
            >
              Log In
            </Button>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold mb-4">No Orders Yet</h2>
            <p className="text-gray-400 mb-6">
              You haven't placed any orders yet. Start shopping to see your orders here.
            </p>
            <Button
              onClick={() => onNavigateToShop && onNavigateToShop()}
              className="bg-[#b90e0a] hover:bg-[#8a0a07] text-white font-bold"
            >
              Start Shopping
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 cursor-pointer group"
                onClick={() => onViewOrderDetail(order._id)}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-lg mb-1">
                          Order #{order.orderId}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`${getStatusColor(order.status)} text-white border-0 capitalize flex items-center gap-2`}
                      >
                        {getStatusIcon(order.status)}
                        <span>
                          {order.status === 'return_requested' ? 'Return Requested' : 
                           order.status === 'confirmed' ? 'Confirmed' : 
                           order.status}
                        </span>
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Items: </span>
                        <span className="font-semibold">{order.items.length}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Total: </span>
                        <span className="font-semibold">₹{order.amount.toLocaleString()}</span>
                      </div>
                      {order.trackingUrl && (
                        <div className="flex items-center gap-2 text-[#b90e0a]">
                          <Truck className="w-4 h-4" />
                          <span>Tracked by {order.courierName || 'Courier'}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      className="border-white/20 hover:border-[#b90e0a] hover:bg-[#b90e0a]/10 hover:text-[#b90e0a] transition-all group-hover:translate-x-1"
                    >
                      View Details
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Contact */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-md border-t border-white/10 py-4 px-4">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-400">
            Need help with your order?
          </div>
          <div className="flex items-center gap-4">
            <a
              href="mailto:support@kallkeyy.com"
              className="flex items-center gap-2 text-sm text-white hover:text-[#b90e0a] transition-colors no-underline"
            >
              <Mail className="w-4 h-4" />
              <span className="hidden sm:inline">Email Us</span>
            </a>
            <a
              href="https://instagram.com/kall.keyy/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-white hover:text-[#b90e0a] transition-colors no-underline"
            >
              <Instagram className="w-4 h-4" />
              <span className="hidden sm:inline">Message Us</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
