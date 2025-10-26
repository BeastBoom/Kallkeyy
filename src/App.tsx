"use client";

import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import Preloader from "@/components/Preloader";
import MainBrandPage from "@/components/MainBrandPage";
import HoodiePage from "@/components/products/HoodiePage";
import TshirtPage from "@/components/products/TshirtPage";
import Hoodie2Page from "@/components/products/Hoodie2Page";
import Tshirt2Page from "@/components/products/Tshirt2Page";
import ProductMenuPage from "@/components/ProductMenuPage";
import LoginPage from "@/components/LoginPage";
import SignupPage from "@/components/SignupPage";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { FloatingCart } from "@/components/FloatingCart";
import ForgotPasswordPage from '@/components/ForgotPasswordPage';

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
  | "forgot-password";

// Route configuration
const ROUTES = {
  HOME: "/",
  SHOP: "/shop",
  ABOUT: "/about",
  CONTACT: "/contact",
  HOODIE: "/product/hoodie",
  TSHIRT: "/product/tshirt",
  HOODIE2: "/product/hoodie2",
  TSHIRT2: "/product/tshirt2",
  LOGIN: "/login",
  SIGNUP: "/signup",
} as const;



const App = () => {
  const [stage, setStage] = useState<AppStage>("loading");
  const [selectedProduct, setSelectedProduct] = useState<string>("hoodie");
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
    if (
      path === ROUTES.HOODIE ||
      path === ROUTES.TSHIRT ||
      path === ROUTES.HOODIE2 ||
      path === ROUTES.TSHIRT2
    )
      return "product";
    return "main";
  };

  // Function to get product from URL
  const getProductFromURL = (): string => {
    const path = window.location.pathname;
    if (path === ROUTES.HOODIE) return "hoodie";
    if (path === ROUTES.TSHIRT) return "tshirt";
    if (path === ROUTES.HOODIE2) return "hoodie2";
    if (path === ROUTES.TSHIRT2) return "tshirt2";
    return "hoodie"; // Default
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

  const navigateToProduct = (productId: string) => {
    setSelectedProduct(productId);
    setStage("product");
    let route;
    switch (productId) {
      case "hoodie":
        route = ROUTES.HOODIE;
        break;
      case "tshirt":
        route = ROUTES.TSHIRT;
        break;
      case "hoodie2":
        route = ROUTES.HOODIE2;
        break;
      case "tshirt2":
        route = ROUTES.TSHIRT2;
        break;
      default:
        route = ROUTES.HOODIE;
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
                onViewProduct={() => navigateToProduct("hoodie")}
                onViewProductMenu={navigateToShop}
                onViewHoodie={() => navigateToProduct("hoodie")}
                onViewTshirt={() => navigateToProduct("tshirt")}
                onViewHoodie2={() => navigateToProduct("hoodie2")}
                onViewTshirt2={() => navigateToProduct("tshirt2")}
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

            {stage === "product" && selectedProduct === "hoodie" && (
              <HoodiePage
                onBackToMain={navigateToHome}
                onNavigateToShop={navigateToShop}
                onNavigateToAbout={navigateToAbout}
                onNavigateToContact={navigateToContact}
                onNavigateToLogin={navigateToLogin}
                onNavigateToSignup={navigateToSignup}
              />
            )}

            {stage === "product" && selectedProduct === "tshirt" && (
              <TshirtPage
                onBackToMain={navigateToHome}
                onNavigateToShop={navigateToShop}
                onNavigateToAbout={navigateToAbout}
                onNavigateToContact={navigateToContact}
                onNavigateToLogin={navigateToLogin}
                onNavigateToSignup={navigateToSignup}
              />
            )}

            {stage === "product" && selectedProduct === "hoodie2" && (
              <Hoodie2Page
                onBackToMain={navigateToHome}
                onNavigateToShop={navigateToShop}
                onNavigateToAbout={navigateToAbout}
                onNavigateToContact={navigateToContact}
                onNavigateToLogin={navigateToLogin}
                onNavigateToSignup={navigateToSignup}
              />
            )}

            {stage === "product" && selectedProduct === "tshirt2" && (
              <Tshirt2Page
                onBackToMain={navigateToHome}
                onNavigateToShop={navigateToShop}
                onNavigateToAbout={navigateToAbout}
                onNavigateToContact={navigateToContact}
                onNavigateToLogin={navigateToLogin}
                onNavigateToSignup={navigateToSignup}
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
                  className="bg-[#DD0004] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#BB0003]"
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
                  className="bg-[#DD0004] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#BB0003]"
                >
                  Back to Home
                </button>
              </div>
            )}
          </TooltipProvider>
        </CartProvider> 
      </AuthProvider> 
    </QueryClientProvider>
  );
};

export default App;
