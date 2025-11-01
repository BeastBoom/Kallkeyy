"use client";

import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import Preloader from "@/components/Preloader";
import MainBrandPage from "@/components/MainBrandPage";
import KaalDrishta from "@/components/products/KaalDrishta";
import SmaraJivitam from "@/components/products/SmaraJivitam";
import AntahaYugaysa from "@/components/products/AntahaYugaysa";
import MrityoBaddha from "@/components/products/MrityoBaddha";
import ProductMenuPage from "@/components/ProductMenuPage";
import LoginPage from "@/components/auth/LoginPage";
import SignupPage from "@/components/auth/SignupPage";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { FloatingCart } from "@/components/cart/FloatingCart";
import ForgotPasswordPage from '@/components/auth/ForgotPasswordPage';
import CheckoutPage from './components/cart/CheckoutPage';
import OrdersPage from './components/orders/OrdersPage';
import OrderDetailPage from './components/orders/OrderDetailPage';
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
} as const;



const App = () => {
  const [stage, setStage] = useState<AppStage>("loading");
  const [selectedProduct, setSelectedProduct] = useState<string>("kaaldrishta");
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");
  const [skipAnimations, setSkipAnimations] = useState(false);

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
    if (path.startsWith(ROUTES.ORDER_DETAIL)) return "order-detail";
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

  // Initialize app based on current URL
  useEffect(() => {
    const route = getCurrentRoute();
    const product = getProductFromURL();

    setStage(route === "main" ? "loading" : route);
    setSelectedProduct(product);

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
      const route = getCurrentRoute();
      const product = getProductFromURL();

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

  // Update document title based on current page
  useEffect(() => {
    const titles = {
      loading: "KALLKEYY - Loading...",
      main: "KALLKEYY - Streetwear Fashion",
      "product-menu": "Shop - KALLKEYY",
      product: `${
        selectedProduct.charAt(0).toUpperCase() + selectedProduct.slice(1)
      } - KALLKEYY`,
      about: "About Us - KALLKEYY",
      contact: "Contact - KALLKEYY",
      "size-guide": "Size Guide - KALLKEYY",
      shipping: "Shipping - KALLKEYY",
      returns: "Returns & Exchanges - KALLKEYY",
      faq: "FAQ - KALLKEYY",
      "privacy-policy": "Privacy Policy - KALLKEYY",
      "terms-of-service": "Terms of Service - KALLKEYY",
      checkout: "Checkout - KALLKEYY",
      login: "Login - KALLKEYY",
      signup: "Sign Up - KALLKEYY",
      "forgot-password": "Reset Password - KALLKEYY",
      orders: "My Orders - KALLKEYY",
      "order-detail": "Order Details - KALLKEYY",
    };

    document.title = titles[stage] || "KALLKEYY";
  }, [stage, selectedProduct]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />

            <FloatingCart onNavigateToProduct={navigateToProduct} />

            {stage === "loading" && (
              <Preloader onComplete={() => setStage("main")} />
            )}

            {stage === "main" && (
              <MainBrandPage
                onViewProduct={() => navigateToProduct("kaaldrishta")}
                onViewProductMenu={navigateToShop}
                onViewHoodie={() => navigateToProduct("kaaldrishta")}
                onViewTshirt={() => navigateToProduct("smarajivitam")}
                onViewHoodie2={() => navigateToProduct("antahayugaysa")}
                onViewTshirt2={() => navigateToProduct("mrityobaddha")}
                onNavigateToLogin={navigateToLogin}
                onNavigateToSignup={navigateToSignup}
                onNavigateToShop={navigateToShop}
                onNavigateToAbout={navigateToAbout}
                onNavigateToContact={navigateToContact}
                onNavigateToOrders={navigateToOrders}
                onNavigateToSizeGuide={navigateToSizeGuide}
                onNavigateToShipping={navigateToShipping}
                onNavigateToReturns={navigateToReturns}
                onNavigateToFAQ={navigateToFAQ}
                onNavigateToPrivacyPolicy={navigateToPrivacyPolicy}
                onNavigateToTermsOfService={navigateToTermsOfService}
                onBackToMain={navigateToHome}
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
              <SizeGuidePage onBackToMain={navigateToHome} skipAnimations={skipAnimations} />
            )}

            {stage === "shipping" && (
              <ShippingPage onBackToMain={navigateToHome} skipAnimations={skipAnimations} />
            )}

            {stage === "returns" && (
              <ReturnsPage onBackToMain={navigateToHome} skipAnimations={skipAnimations} />
            )}

            {stage === "faq" && (
              <FAQPage onBackToMain={navigateToHome} skipAnimations={skipAnimations} />
            )}

            {stage === "checkout" && (
              <CheckoutPage onBackToShop={navigateToShop} skipAnimations={skipAnimations} />
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
