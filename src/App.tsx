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
import LoginPage from "@/components/LoginPage";
import SignupPage from "@/components/SignupPage";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { FloatingCart } from "@/components/FloatingCart";
import ForgotPasswordPage from '@/components/ForgotPasswordPage';
import CheckoutPage from './components/CheckoutPage';

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
  | "checkout";

// Route configuration
const ROUTES = {
  HOME: "/",
  SHOP: "/shop",
  ABOUT: "/about",
  CONTACT: "/contact",
  KAALDRISHTA: "/product/kaaldrishta",
  SMARAJIVITAM: "/product/smarajivitam",
  ANTAHAYUGAYSA: "/product/antahayugaysa",
  MRITYOBADDHA: "/product/mrityobaddha",
  LOGIN: "/login",
  SIGNUP: "/signup",
  CHECKOUT: "/checkout",
} as const;



const App = () => {
  const [stage, setStage] = useState<AppStage>("loading");
  const [selectedProduct, setSelectedProduct] = useState<string>("kaaldrishta");
  const navigateToForgotPassword = () => setStage("forgot-password");

  // Function to get current route from URL
  const getCurrentRoute = (): AppStage => {
    const path = window.location.pathname;

    if (path === ROUTES.HOME) return "main";
    if (path === ROUTES.SHOP) return "product-menu";
    if (path === ROUTES.ABOUT) return "about";
    if (path === ROUTES.CONTACT) return "contact";
    if (path === ROUTES.LOGIN) return "login";  
    if (path === ROUTES.SIGNUP) return "signup";
    if (path === ROUTES.CHECKOUT) return "checkout";
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
  }, []);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const route = getCurrentRoute();
      const product = getProductFromURL();

      setStage(route);
      setSelectedProduct(product);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Navigation functions with proper URL updates
  const navigateToHome = () => {
    setStage("main");
    window.history.pushState({}, "", ROUTES.HOME);
  };

  const navigateToShop = () => {
    setStage("product-menu");
    window.history.pushState({}, "", ROUTES.SHOP);
  };

  const navigateToAbout = () => {
    setStage("about");
    window.history.pushState({}, "", ROUTES.ABOUT);
  };

  const navigateToContact = () => {
    setStage("contact");
    window.history.pushState({}, "", ROUTES.CONTACT);
  };

  const navigateToLogin = () => {
    setStage("login");
    window.history.pushState({}, "", ROUTES.LOGIN);
  };

  const navigateToSignup = () => {
    setStage("signup");
    window.history.pushState({}, "", ROUTES.SIGNUP);
  };

  const navigateToCheckout = () => {
    setStage("checkout");
    window.history.pushState({}, "", ROUTES.CHECKOUT);
  };

  const navigateToProduct = (productId: string) => {
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
    window.history.pushState({}, "", route);
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
      checkout: "Checkout - KALLKEYY",
      login: "Login - KALLKEYY",
      signup: "Sign Up - KALLKEYY",
      "forgot-password": "Reset Password - KALLKEYY",
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

            <FloatingCart />

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
                onBackToMain={navigateToHome}
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
              />
            )}

            {stage === "login" && (
              <LoginPage
                onNavigateToHome={navigateToHome} 
                onNavigateToSignup={navigateToSignup}
                onNavigateToForgotPassword={navigateToForgotPassword}
              />
            )}

            {stage === "signup" && (
              <SignupPage
                onNavigateToHome={navigateToHome}
                onNavigateToLogin={navigateToLogin}
              />
            )}

            {stage === "forgot-password" && (
              <ForgotPasswordPage
                onNavigateToLogin={navigateToLogin}
              />
            )}
            
            {stage === "about" && (
              <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
                <h1 className="text-4xl font-bold mb-4">
                  About Page - Coming Soon
                </h1>
                <button
                  onClick={navigateToHome}
                  className="bg-[#b90e0a] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#BB0003]"
                >
                  Back to Home
                </button>
              </div>
            )}

            {stage === "contact" && (
              <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
                <h1 className="text-4xl font-bold mb-4">
                  Contact Page - Coming Soon
                </h1>
                <button
                  onClick={navigateToHome}
                  className="bg-[#b90e0a] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#BB0003]"
                >
                  Back to Home
                </button>
              </div>
            )}

            {stage === "checkout" && (
              <CheckoutPage onBackToShop={navigateToShop} />
            )}
          </TooltipProvider>
        </CartProvider> 
      </AuthProvider> 
    </QueryClientProvider>
  );
};

export default App;
