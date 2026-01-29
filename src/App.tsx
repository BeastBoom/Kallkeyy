"use client";

import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import Preloader from "@/components/Preloader";
import { useSEO } from "./hooks/useSEO";
import { trackPageView } from "./lib/analytics";
import { SITE_CONFIG } from "./lib/seo";
import KaalDrishta from "@/components/products/KaalDrishta";
import SmaraJivitam from "@/components/products/SmaraJivitam";
import AntahaYugaysa from "@/components/products/AntahaYugaysa";
import MrityoBaddha from "@/components/products/MrityoBaddha";
import ProductMenuPage from "@/components/ProductMenuPage";
import HomePage from "@/components/HomePage";
import LoginPage from "@/components/auth/LoginPage";
import SignupPage from "@/components/auth/SignupPage";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { FloatingCart } from "@/components/cart/FloatingCart";
import ForgotPasswordPage from '@/components/auth/ForgotPasswordPage';
import CheckoutPage from './components/cart/CheckoutPage';
import OrdersPage from './components/orders/OrdersPage';
import OrderDetailPage from './components/orders/OrderDetailPage';
import OrderConfirmationPage from './components/orders/OrderConfirmationPage';
import AboutPage from './components/info/AboutPage';
import ContactPage from './components/info/ContactPage';
import SizeGuidePage from './components/info/SizeGuidePage';
import ShippingPage from './components/info/ShippingPage';
import ReturnsPage from './components/info/ReturnsPage';
import FAQPage from './components/info/FAQPage';
import PrivacyPolicyPage from './components/info/PrivacyPolicyPage';
import TermsOfServicePage from './components/info/TermsOfServicePage';

const queryClient = new QueryClient();

type AppStage =
  | "loading"
  | "main"
  | "product-menu"
  | "product"
  | "about"
  | "contact"
  | "login"
  | "signup"
  | "forgot-password"
  | "checkout"
  | "orders"
  | "order-detail"
  | "order-confirmation"
  | "size-guide"
  | "shipping"
  | "returns"
  | "faq"
  | "privacy-policy"
  | "terms-of-service";

// Route configuration
const ROUTES = {
  HOME: "/",
  SHOP: "/shop",
  ABOUT: "/about",
  CONTACT: "/contact",
  SIZE_GUIDE: "/size-guide",
  SHIPPING: "/shipping",
  RETURNS: "/returns",
  FAQ: "/faq",
  PRIVACY_POLICY: "/privacy-policy",
  TERMS_OF_SERVICE: "/terms-of-service",
  KAALDRISHTA: "/product/kaaldrishta",
  SMARAJIVITAM: "/product/smarajivitam",
  ANTAHAYUGAYSA: "/product/antahayugaysa",
  MRITYOBADDHA: "/product/mrityobaddha",
  LOGIN: "/login",
  SIGNUP: "/signup",
  FORGOT_PASSWORD: "/forgot-password",
  CHECKOUT: "/checkout",
  ORDERS: "/orders",
  ORDER_DETAIL: "/order",
  ORDER_CONFIRMATION: "/order-confirmation",
} as const;



const App = () => {
  const [stage, setStage] = useState<AppStage>("loading");
  const [selectedProduct, setSelectedProduct] = useState<string>("kaaldrishta");
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");
  const [skipAnimations, setSkipAnimations] = useState(false);

  // Protected routes that cannot be accessed directly via URL
  const PROTECTED_ROUTES = [ROUTES.CHECKOUT, ROUTES.ORDER_CONFIRMATION] as const;

  // Function to get current route from URL
  const getCurrentRoute = (): AppStage => {
    const path = window.location.pathname;

    if (path === ROUTES.HOME) return "main";
    if (path === ROUTES.SHOP) return "product-menu";
    if (path === ROUTES.ABOUT) return "about";
    if (path === ROUTES.CONTACT) return "contact";
    if (path === ROUTES.SIZE_GUIDE) return "size-guide";
    if (path === ROUTES.SHIPPING) return "shipping";
    if (path === ROUTES.RETURNS) return "returns";
    if (path === ROUTES.FAQ) return "faq";
    if (path === ROUTES.PRIVACY_POLICY) return "privacy-policy";
    if (path === ROUTES.TERMS_OF_SERVICE) return "terms-of-service";
    if (path === ROUTES.LOGIN) return "login";  
    if (path === ROUTES.SIGNUP) return "signup";
    if (path === ROUTES.FORGOT_PASSWORD) return "forgot-password";
    if (path === ROUTES.CHECKOUT) return "checkout";
    if (path === ROUTES.ORDERS) return "orders";
    if (path.startsWith(ROUTES.ORDER_DETAIL)) {
      return "order-detail";
    }
    if (path === ROUTES.ORDER_CONFIRMATION) return "order-confirmation";
    if (
      path === ROUTES.KAALDRISHTA ||
      path === ROUTES.SMARAJIVITAM ||
      path === ROUTES.ANTAHAYUGAYSA ||
      path === ROUTES.MRITYOBADDHA
    )
      return "product";
    return "main";
  };

  // Function to get product from URL
  const getProductFromURL = (): string => {
    const path = window.location.pathname;
    if (path === ROUTES.KAALDRISHTA) return "kaaldrishta";
    if (path === ROUTES.SMARAJIVITAM) return "smarajivitam";
    if (path === ROUTES.ANTAHAYUGAYSA) return "antahayugaysa";
    if (path === ROUTES.MRITYOBADDHA) return "mrityobaddha";
    return "kaaldrishta"; // Default
  };

  // Check if route is protected and should be blocked
  const isRouteProtected = (path: string): boolean => {
    return PROTECTED_ROUTES.includes(path as typeof PROTECTED_ROUTES[number]);
  };

  // Check if navigation is allowed (via programmatic navigation, not direct URL access)
  const isNavigationAllowed = (path: string): boolean => {
    // Check sessionStorage for allowed routes (set during programmatic navigation)
    const allowed = sessionStorage.getItem(`allowed_${path}`);
    return allowed === 'true';
  };

  // Initialize app based on current URL
  useEffect(() => {
    const path = window.location.pathname;
    const route = getCurrentRoute();
    const product = getProductFromURL();

    // Check if trying to access protected route directly
    if (isRouteProtected(path)) {
      // Check if navigation was allowed (via programmatic navigation)
      if (!isNavigationAllowed(path)) {
        // Redirect to home page if accessing protected route directly
        console.log('⚠️ Blocked direct access to protected route:', path);
        window.history.replaceState({}, "", ROUTES.HOME);
        setStage("main");
        setSkipAnimations(true);
        return;
      } else {
        // Clear the allowed flag after using it (but don't clear it immediately for order-confirmation)
        // We want to keep it until the component is fully loaded
        if (path !== ROUTES.ORDER_CONFIRMATION) {
          sessionStorage.removeItem(`allowed_${path}`);
        }
      }
    }

    setStage(route === "main" ? "loading" : route);
    setSelectedProduct(product);
    
    // Extract orderId from URL if on order detail page (for page reloads)
    if (route === "order-detail") {
      const orderIdFromUrl = path.replace(ROUTES.ORDER_DETAIL + '/', '');
      if (orderIdFromUrl && orderIdFromUrl !== 'order-detail' && orderIdFromUrl !== path) {
        setSelectedOrderId(orderIdFromUrl);
      }
    }

    // Set a small delay for preloader if we're on home page
    if (route === "main") {
      setTimeout(() => setStage("main"), 100);
    }

    // Save initial scroll position in history state
    if (!window.history.state?.scrollPos) {
      window.history.replaceState({ scrollPos: window.scrollY }, "");
    }
  }, []);

  // Handle browser back/forward buttons with scroll restoration
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const path = window.location.pathname;
      const route = getCurrentRoute();
      const product = getProductFromURL();

      // Check if trying to navigate to protected route via browser back/forward
      if (isRouteProtected(path) && !isNavigationAllowed(path)) {
        // Block navigation to protected route via browser history
        window.history.go(1); // Go forward to undo the back navigation
        return;
      }

      // Skip animations when navigating via browser back/forward
      setSkipAnimations(true);
      
      setStage(route);
      setSelectedProduct(product);

      // Restore scroll position after route change
      setTimeout(() => {
        const scrollPos = event.state?.scrollPos || 0;
        window.scrollTo({ top: scrollPos, behavior: 'instant' });
      }, 0);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Listen for direct URL changes (e.g., user typing in address bar or refreshing)
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname;
      
      // Check if trying to access protected route directly
      if (isRouteProtected(path) && !isNavigationAllowed(path)) {
        // Redirect to home page if accessing protected route directly
        window.history.replaceState({}, "", ROUTES.HOME);
        setStage("main");
        setSkipAnimations(true);
      }
    };

    // Check on mount and when pathname changes
    handleLocationChange();

    // Listen for hashchange (though we're not using hash routing)
    window.addEventListener("hashchange", handleLocationChange);

    return () => {
      window.removeEventListener("hashchange", handleLocationChange);
    };
  }, []);

  // Navigation functions with proper URL updates and scroll position saving
  const navigateToHome = () => {
    // Save current scroll position before navigating
    window.history.replaceState({ scrollPos: window.scrollY }, "");
    setSkipAnimations(false); // Enable animations for forward navigation
    window.scrollTo({ top: 0, behavior: 'instant' });
    setStage("main");
    window.history.pushState({ scrollPos: 0 }, "", ROUTES.HOME);
  };

  const navigateToShop = () => {
    window.history.replaceState({ scrollPos: window.scrollY }, "");
    setSkipAnimations(false); // Enable animations for forward navigation
    window.scrollTo({ top: 0, behavior: 'instant' });
    setStage("product-menu");
    window.history.pushState({ scrollPos: 0 }, "", ROUTES.SHOP);
  };

  const navigateToAbout = () => {
    window.history.replaceState({ scrollPos: window.scrollY }, "");
    setSkipAnimations(false); // Enable animations for forward navigation
    window.scrollTo({ top: 0, behavior: 'instant' });
    setStage("about");
    window.history.pushState({ scrollPos: 0 }, "", ROUTES.ABOUT);
  };

  const navigateToContact = () => {
    window.history.replaceState({ scrollPos: window.scrollY }, "");
    setSkipAnimations(false); // Enable animations for forward navigation
    window.scrollTo({ top: 0, behavior: 'instant' });
    setStage("contact");
    window.history.pushState({ scrollPos: 0 }, "", ROUTES.CONTACT);
  };

  const navigateToSizeGuide = () => {
    window.history.replaceState({ scrollPos: window.scrollY }, "");
    setSkipAnimations(false); // Enable animations for forward navigation
    window.scrollTo({ top: 0, behavior: 'instant' });
    setStage("size-guide");
    window.history.pushState({ scrollPos: 0 }, "", ROUTES.SIZE_GUIDE);
  };

  const navigateToShipping = () => {
    window.history.replaceState({ scrollPos: window.scrollY }, "");
    setSkipAnimations(false); // Enable animations for forward navigation
    window.scrollTo({ top: 0, behavior: 'instant' });
    setStage("shipping");
    window.history.pushState({ scrollPos: 0 }, "", ROUTES.SHIPPING);
  };

  const navigateToReturns = () => {
    window.history.replaceState({ scrollPos: window.scrollY }, "");
    setSkipAnimations(false); // Enable animations for forward navigation
    window.scrollTo({ top: 0, behavior: 'instant' });
    setStage("returns");
    window.history.pushState({ scrollPos: 0 }, "", ROUTES.RETURNS);
  };

  const navigateToFAQ = () => {
    window.history.replaceState({ scrollPos: window.scrollY }, "");
    setSkipAnimations(false); // Enable animations for forward navigation
    window.scrollTo({ top: 0, behavior: 'instant' });
    setStage("faq");
    window.history.pushState({ scrollPos: 0 }, "", ROUTES.FAQ);
  };

  const navigateToPrivacyPolicy = () => {
    window.history.replaceState({ scrollPos: window.scrollY }, "");
    setSkipAnimations(false); // Enable animations for forward navigation
    window.scrollTo({ top: 0, behavior: 'instant' });
    setStage("privacy-policy");
    window.history.pushState({ scrollPos: 0 }, "", ROUTES.PRIVACY_POLICY);
  };

  const navigateToTermsOfService = () => {
    window.history.replaceState({ scrollPos: window.scrollY }, "");
    setSkipAnimations(false); // Enable animations for forward navigation
    window.scrollTo({ top: 0, behavior: 'instant' });
    setStage("terms-of-service");
    window.history.pushState({ scrollPos: 0 }, "", ROUTES.TERMS_OF_SERVICE);
  };

  const navigateToLogin = () => {
    window.history.replaceState({ scrollPos: window.scrollY }, "");
    setSkipAnimations(false); // Enable animations for forward navigation
    window.scrollTo({ top: 0, behavior: 'instant' });
    setStage("login");
    window.history.pushState({ scrollPos: 0 }, "", ROUTES.LOGIN);
  };

  const navigateToSignup = () => {
    window.history.replaceState({ scrollPos: window.scrollY }, "");
    setSkipAnimations(false); // Enable animations for forward navigation
    window.scrollTo({ top: 0, behavior: 'instant' });
    setStage("signup");
    window.history.pushState({ scrollPos: 0 }, "", ROUTES.SIGNUP);
  };

  const navigateToForgotPassword = () => {
    window.history.replaceState({ scrollPos: window.scrollY }, "");
    setSkipAnimations(false); // Enable animations for forward navigation
    window.scrollTo({ top: 0, behavior: 'instant' });
    setStage("forgot-password");
    window.history.pushState({ scrollPos: 0 }, "", ROUTES.FORGOT_PASSWORD);
  };

  const navigateToCheckout = () => {
    // Mark checkout as allowed navigation before navigating
    sessionStorage.setItem(`allowed_${ROUTES.CHECKOUT}`, 'true');
    
    window.history.replaceState({ scrollPos: window.scrollY }, "");
    setSkipAnimations(false); // Enable animations for forward navigation
    window.scrollTo({ top: 0, behavior: 'instant' });
    setStage("checkout");
    window.history.pushState({ scrollPos: 0 }, "", ROUTES.CHECKOUT);
  };

  const navigateToOrders = () => {
    window.history.replaceState({ scrollPos: window.scrollY }, "");
    setSkipAnimations(false); // Enable animations for forward navigation
    window.scrollTo({ top: 0, behavior: 'instant' });
    setStage("orders");
    window.history.pushState({ scrollPos: 0 }, "", ROUTES.ORDERS);
  };

  const navigateToOrderDetail = (orderId: string) => {
    window.history.replaceState({ scrollPos: window.scrollY }, "");
    setSkipAnimations(false); // Enable animations for forward navigation
    window.scrollTo({ top: 0, behavior: 'instant' });
    setSelectedOrderId(orderId);
    setStage("order-detail");
    window.history.pushState({ scrollPos: 0 }, "", `${ROUTES.ORDER_DETAIL}/${orderId}`);
  };

  const navigateToOrderConfirmation = (orderId?: string) => {
    window.history.replaceState({ scrollPos: window.scrollY }, "");
    setSkipAnimations(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
    
    // Set allowed flag for protected route BEFORE setting stage
    sessionStorage.setItem(`allowed_${ROUTES.ORDER_CONFIRMATION}`, 'true');
    
    // Set the stage to trigger rendering of OrderConfirmationPage
    setStage("order-confirmation");
    
    // Update URL
    const url = orderId 
      ? `${ROUTES.ORDER_CONFIRMATION}?orderId=${orderId}`
      : ROUTES.ORDER_CONFIRMATION;
    window.history.pushState({ scrollPos: 0 }, "", url);
    
    console.log('✅ Navigating to order confirmation page', { orderId, url });
  };

  const navigateToProduct = (productId: string) => {
    // Save current scroll position before navigating
    window.history.replaceState({ scrollPos: window.scrollY }, "");
    setSkipAnimations(false); // Enable animations for forward navigation
    // Scroll to top immediately when navigating to product
    window.scrollTo({ top: 0, behavior: 'instant' });
    
    setSelectedProduct(productId);
    setStage("product");
    let route;
    switch (productId) {
      case "kaaldrishta":
        route = ROUTES.KAALDRISHTA;
        break;
      case "smarajivitam":
        route = ROUTES.SMARAJIVITAM;
        break;
      case "antahayugaysa":
        route = ROUTES.ANTAHAYUGAYSA;
        break;
      case "mrityobaddha":
        route = ROUTES.MRITYOBADDHA;
        break;
      default:
        route = ROUTES.KAALDRISHTA;
    }
    window.history.pushState({ scrollPos: 0 }, "", route);
  };

  const handleSelectProduct = (productId: string) => {
    navigateToProduct(productId);
  };

  // SEO configuration for each page
  const getSEOConfig = (): { title: string; description: string; keywords?: string; url?: string } => {
    const baseUrl = SITE_CONFIG.url;
    const pageConfigs: Record<string, any> = {
      loading: {
        title: "KALLKEYY - Loading...",
        description: SITE_CONFIG.description,
      },
      main: {
        title: "KALLKEYY - Premium Streetwear Fashion | Hoodies, T-Shirts & Accessories",
        description: "Discover KALLKEYY - premium streetwear fashion brand. Shop quality hoodies, t-shirts, and accessories designed for the modern streetwear enthusiast.",
        keywords: "streetwear, hoodies, t-shirts, fashion, clothing, KALLKEYY, urban fashion, street style",
        url: `${baseUrl}/`,
      },
      "product-menu": {
        title: "Shop - Premium Streetwear Collection | KALLKEYY",
        description: "Browse our complete collection of premium streetwear including hoodies, t-shirts, and accessories. Free shipping available.",
        keywords: "streetwear shop, hoodies, t-shirts, clothing store, KALLKEYY shop",
        url: `${baseUrl}/shop`,
      },
      product: {
        title: `${selectedProduct.charAt(0).toUpperCase() + selectedProduct.slice(1)} - Premium Streetwear | KALLKEYY`,
        description: `Shop ${selectedProduct.charAt(0).toUpperCase() + selectedProduct.slice(1)} - premium streetwear from KALLKEYY. High quality, comfortable, and stylish.`,
        keywords: `${selectedProduct}, streetwear, KALLKEYY, premium clothing`,
        url: `${baseUrl}/product/${selectedProduct}`,
      },
      about: {
        title: "About Us - KALLKEYY Streetwear Brand",
        description: "Learn about KALLKEYY - a premium streetwear fashion brand committed to quality, style, and authenticity.",
        keywords: "about KALLKEYY, streetwear brand, fashion company",
        url: `${baseUrl}/about`,
      },
      contact: {
        title: "Contact Us - KALLKEYY Customer Support",
        description: "Get in touch with KALLKEYY. We're here to help with orders, questions, or feedback. Contact our customer support team.",
        keywords: "contact KALLKEYY, customer support, help",
        url: `${baseUrl}/contact`,
      },
      "size-guide": {
        title: "Size Guide - Find Your Perfect Fit | KALLKEYY",
        description: "KALLKEYY size guide. Find the perfect fit for our hoodies and t-shirts. Detailed measurements and sizing information.",
        keywords: "size guide, sizing, measurements, fit guide",
        url: `${baseUrl}/size-guide`,
      },
      shipping: {
        title: "Shipping Information - KALLKEYY",
        description: "KALLKEYY shipping information. Learn about our shipping options, delivery times, and tracking your order.",
        keywords: "shipping, delivery, KALLKEYY shipping",
        url: `${baseUrl}/shipping`,
      },
      returns: {
        title: "Returns & Exchanges - KALLKEYY",
        description: "KALLKEYY returns and exchange policy. Learn how to return or exchange your items.",
        keywords: "returns, exchanges, refund policy",
        url: `${baseUrl}/returns`,
      },
      faq: {
        title: "Frequently Asked Questions - KALLKEYY",
        description: "Find answers to common questions about KALLKEYY products, orders, shipping, and more.",
        keywords: "FAQ, questions, help, KALLKEYY",
        url: `${baseUrl}/faq`,
      },
      "privacy-policy": {
        title: "Privacy Policy - KALLKEYY",
        description: "KALLKEYY privacy policy. Learn how we collect, use, and protect your personal information.",
        url: `${baseUrl}/privacy-policy`,
      },
      "terms-of-service": {
        title: "Terms of Service - KALLKEYY",
        description: "KALLKEYY terms of service. Read our terms and conditions for using our website and services.",
        url: `${baseUrl}/terms-of-service`,
      },
      checkout: {
        title: "Checkout - Complete Your Order | KALLKEYY",
        description: "Complete your KALLKEYY order. Secure checkout with multiple payment options.",
        url: `${baseUrl}/checkout`,
      },
      login: {
        title: "Login - KALLKEYY Account",
        description: "Login to your KALLKEYY account to view orders and manage your profile.",
        url: `${baseUrl}/login`,
      },
      signup: {
        title: "Sign Up - Create KALLKEYY Account",
        description: "Create a KALLKEYY account to track orders, save favorites, and enjoy exclusive offers.",
        url: `${baseUrl}/signup`,
      },
      "forgot-password": {
        title: "Reset Password - KALLKEYY",
        description: "Reset your KALLKEYY account password.",
        url: `${baseUrl}/forgot-password`,
      },
      orders: {
        title: "My Orders - KALLKEYY",
        description: "View your KALLKEYY order history and track your purchases.",
        url: `${baseUrl}/orders`,
      },
      "order-detail": {
        title: "Order Details - KALLKEYY",
        description: "View details of your KALLKEYY order.",
        url: `${baseUrl}/order/${selectedOrderId}`,
      },
      "order-confirmation": {
        title: "Order Confirmed - Thank You | KALLKEYY",
        description: "Your KALLKEYY order has been confirmed. Thank you for your purchase!",
        url: `${baseUrl}/order-confirmation`,
      },
    };

    return pageConfigs[stage] || pageConfigs.main;
  };

  // Update SEO and track page views
  const seoConfig = getSEOConfig();
  useSEO(seoConfig);

  useEffect(() => {
    // Track page view with Google Analytics
    const path = window.location.pathname;
    trackPageView(path, seoConfig.title);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, selectedProduct, selectedOrderId]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />

            <FloatingCart onNavigateToProduct={navigateToProduct} onNavigateToCheckout={navigateToCheckout} />

            {stage === "loading" && (
              <Preloader onComplete={() => setStage("main")} />
            )}

            {stage === "main" && (
              <HomePage
                onSelectProduct={handleSelectProduct}
                onBackToMain={navigateToHome}
                onNavigateToShop={navigateToShop}
                onNavigateToAbout={navigateToAbout}
                onNavigateToContact={navigateToContact}
                onNavigateToLogin={navigateToLogin}
                onNavigateToSignup={navigateToSignup}
                onNavigateToOrders={navigateToOrders}
                onNavigateToSizeGuide={navigateToSizeGuide}
                onNavigateToShipping={navigateToShipping}
                onNavigateToReturns={navigateToReturns}
                onNavigateToFAQ={navigateToFAQ}
                onNavigateToPrivacyPolicy={navigateToPrivacyPolicy}
                onNavigateToTermsOfService={navigateToTermsOfService}
                skipAnimations={skipAnimations}
              />
            )}

            {stage === "product-menu" && (
              <ProductMenuPage
                onSelectProduct={handleSelectProduct}
                onBackToMain={navigateToHome}
                onNavigateToShop={navigateToShop}
                onNavigateToAbout={navigateToAbout}
                onNavigateToContact={navigateToContact}
                onNavigateToLogin={navigateToLogin}
                onNavigateToSignup={navigateToSignup}
                onNavigateToOrders={navigateToOrders}
                onNavigateToSizeGuide={navigateToSizeGuide}
                onNavigateToShipping={navigateToShipping}
                onNavigateToReturns={navigateToReturns}
                onNavigateToFAQ={navigateToFAQ}
                onNavigateToPrivacyPolicy={navigateToPrivacyPolicy}
                onNavigateToTermsOfService={navigateToTermsOfService}
                skipAnimations={skipAnimations}
              />
            )}

            {stage === "privacy-policy" && (
              <PrivacyPolicyPage 
                onBackToMain={navigateToHome} 
                onNavigateToShop={navigateToShop}
                onNavigateToAbout={navigateToAbout}
                onNavigateToContact={navigateToContact}
                onNavigateToLogin={navigateToLogin}
                onNavigateToSignup={navigateToSignup}
                onNavigateToOrders={navigateToOrders}
                skipAnimations={skipAnimations} 
              />
            )}

            {stage === "terms-of-service" && (
              <TermsOfServicePage 
                onBackToMain={navigateToHome} 
                onNavigateToShop={navigateToShop}
                onNavigateToAbout={navigateToAbout}
                onNavigateToContact={navigateToContact}
                onNavigateToLogin={navigateToLogin}
                onNavigateToSignup={navigateToSignup}
                onNavigateToOrders={navigateToOrders}
                skipAnimations={skipAnimations} 
              />
            )}

            {stage === "product" && selectedProduct === "kaaldrishta" && (
              <KaalDrishta
                onBackToMain={navigateToHome}
                onNavigateToShop={navigateToShop}
                onNavigateToAbout={navigateToAbout}
                onNavigateToContact={navigateToContact}
                onNavigateToLogin={navigateToLogin}
                onNavigateToSignup={navigateToSignup}
                onNavigateToProduct={navigateToProduct}
                onNavigateToOrders={navigateToOrders}
                skipAnimations={skipAnimations}
              />
            )}

            {stage === "product" && selectedProduct === "smarajivitam" && (
              <SmaraJivitam
                onBackToMain={navigateToHome}
                onNavigateToShop={navigateToShop}
                onNavigateToAbout={navigateToAbout}
                onNavigateToContact={navigateToContact}
                onNavigateToLogin={navigateToLogin}
                onNavigateToSignup={navigateToSignup}
                onNavigateToProduct={navigateToProduct}
                onNavigateToOrders={navigateToOrders}
                skipAnimations={skipAnimations}
              />
            )}

            {stage === "product" && selectedProduct === "antahayugaysa" && (
              <AntahaYugaysa
                onBackToMain={navigateToHome}
                onNavigateToShop={navigateToShop}
                onNavigateToAbout={navigateToAbout}
                onNavigateToContact={navigateToContact}
                onNavigateToLogin={navigateToLogin}
                onNavigateToSignup={navigateToSignup}
                onNavigateToProduct={navigateToProduct}
                onNavigateToOrders={navigateToOrders}
                skipAnimations={skipAnimations}
              />
            )}

            {stage === "product" && selectedProduct === "mrityobaddha" && (
              <MrityoBaddha
                onBackToMain={navigateToHome}
                onNavigateToShop={navigateToShop}
                onNavigateToAbout={navigateToAbout}
                onNavigateToContact={navigateToContact}
                onNavigateToLogin={navigateToLogin}
                onNavigateToSignup={navigateToSignup}
                onNavigateToProduct={navigateToProduct}
                onNavigateToOrders={navigateToOrders}
                skipAnimations={skipAnimations}
              />
            )}

            {stage === "login" && (
              <LoginPage
                onNavigateToHome={navigateToHome} 
                onNavigateToSignup={navigateToSignup}
                onNavigateToForgotPassword={navigateToForgotPassword}
                onNavigateToPrivacyPolicy={navigateToPrivacyPolicy}
                onNavigateToTermsOfService={navigateToTermsOfService}
              />
            )}

            {stage === "signup" && (
              <SignupPage
                onNavigateToHome={navigateToHome}
                onNavigateToLogin={navigateToLogin}
                onNavigateToPrivacyPolicy={navigateToPrivacyPolicy}
                onNavigateToTermsOfService={navigateToTermsOfService}
              />
            )}

            {stage === "forgot-password" && (
              <ForgotPasswordPage
                onNavigateToLogin={navigateToLogin}
              />
            )}
            
            {stage === "about" && (
              <AboutPage
                onBackToMain={navigateToHome}
                onNavigateToShop={navigateToShop}
                onNavigateToOrders={navigateToOrders}
                onNavigateToContact={navigateToContact}
                onNavigateToLogin={navigateToLogin}
                onNavigateToSignup={navigateToSignup}
                skipAnimations={skipAnimations}
              />
            )}

            {stage === "contact" && (
              <ContactPage
                onBackToMain={navigateToHome}
                onNavigateToShop={navigateToShop}
                onNavigateToOrders={navigateToOrders}
                onNavigateToAbout={navigateToAbout}
                onNavigateToFAQ={navigateToFAQ}
                onNavigateToLogin={navigateToLogin}
                onNavigateToSignup={navigateToSignup}
                skipAnimations={skipAnimations}
              />
            )}

            {stage === "size-guide" && (
              <SizeGuidePage 
                onBackToMain={navigateToHome}
                onNavigateToLogin={navigateToLogin}
                onNavigateToSignup={navigateToSignup}
                skipAnimations={skipAnimations} 
              />
            )}

            {stage === "shipping" && (
              <ShippingPage 
                onBackToMain={navigateToHome}
                onNavigateToLogin={navigateToLogin}
                onNavigateToSignup={navigateToSignup}
                skipAnimations={skipAnimations} 
              />
            )}

            {stage === "returns" && (
              <ReturnsPage 
                onBackToMain={navigateToHome}
                onNavigateToLogin={navigateToLogin}
                onNavigateToSignup={navigateToSignup}
                skipAnimations={skipAnimations} 
              />
            )}

            {stage === "faq" && (
              <FAQPage 
                onBackToMain={navigateToHome}
                onNavigateToLogin={navigateToLogin}
                onNavigateToSignup={navigateToSignup}
                skipAnimations={skipAnimations} 
              />
            )}

            {stage === "checkout" && (
              <CheckoutPage 
                onBackToShop={navigateToShop} 
                skipAnimations={skipAnimations}
                onOrderSuccess={navigateToOrderConfirmation}
              />
            )}

            {stage === "orders" && (
              <OrdersPage
                onBackToMain={navigateToHome}
                onNavigateToShop={navigateToShop}
                onNavigateToAbout={navigateToAbout}
                onNavigateToContact={navigateToContact}
                onNavigateToLogin={navigateToLogin}
                onNavigateToSignup={navigateToSignup}
                onViewOrderDetail={navigateToOrderDetail}
                skipAnimations={skipAnimations}
              />
            )}

            {stage === "order-confirmation" && (
              <OrderConfirmationPage />
            )}

            {stage === "order-detail" && (
              <OrderDetailPage
                orderId={selectedOrderId}
                onBackToOrders={navigateToOrders}
                onBackToMain={navigateToHome}
                onNavigateToShop={navigateToShop}
                onNavigateToAbout={navigateToAbout}
                onNavigateToContact={navigateToContact}
                onNavigateToLogin={navigateToLogin}
                onNavigateToSignup={navigateToSignup}
                skipAnimations={skipAnimations}
              />
            )}
          </TooltipProvider>
        </CartProvider> 
      </AuthProvider> 
    </QueryClientProvider>
  );
};

export default App;
