"use client";

import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

import Preloader from "@/components/Preloader";
import EarlyAccessPage from "@/components/EarlyAccessPage";
import MainBrandPage from "@/components/MainBrandPage";
import HoodiePage from "@/components/products/HoodiePage";
import TshirtPage from "@/components/products/TshirtPage";
import ProductMenuPage from "@/components/ProductMenuPage";
// Import these when you create them:
// import AboutPage from "@/components/About"
// import ContactPage from "@/components/Contact"

const queryClient = new QueryClient();

const STAGE_KEY = "kallkeyy:stage" as const;
const PRODUCT_KEY = "kallkeyy:selectedProduct" as const;

const getInitialStage = (): AppStage => {
  try {
    const saved = sessionStorage.getItem(STAGE_KEY) as AppStage | null;
    return saved ?? "loading";
  } catch {
    return "loading";
  }
};

const getInitialProduct = (): string => {
  try {
    const saved = sessionStorage.getItem(PRODUCT_KEY);
    return saved ?? "hoodie";
  } catch {
    return "hoodie";
  }
};

// Updated to include about and contact
type AppStage =
  | "loading"
  | "early-access"
  | "main"
  | "product-menu"
  | "product"
  | "about"
  | "contact";

const App = () => {
  const [stage, setStage] = useState<AppStage>(getInitialStage());
  const [selectedProduct, setSelectedProduct] = useState<string>(
    getInitialProduct()
  );

  useEffect(() => {
    try {
      sessionStorage.setItem(STAGE_KEY, stage);
    } catch {}
  }, [stage]);

  useEffect(() => {
    try {
      sessionStorage.setItem(PRODUCT_KEY, selectedProduct);
    } catch {}
  }, [selectedProduct]);

  useEffect(() => {
    window.history.pushState({ stage }, "", "");

    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.stage) {
        setStage(event.state.stage);
      } else {
        setStage("main");
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    if (stage !== "loading") {
      window.history.pushState({ stage }, "", "");
    }
  }, [stage]);

  const handleSelectProduct = (productId: string) => {
    setSelectedProduct(productId);
    setStage("product");
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {stage === "loading" && (
          <Preloader onComplete={() => setStage("early-access")} />
        )}

        {stage === "early-access" && (
          <EarlyAccessPage onAccessGranted={() => setStage("main")} />
        )}

        {stage === "main" && (
          <MainBrandPage
            onViewProduct={() => setStage("product")}
            onViewProductMenu={() => setStage("product-menu")}
            onViewHoodie={() => {
              setSelectedProduct("hoodie");
              setStage("product");
            }}
            onViewTshirt={() => {
              setSelectedProduct("tshirt");
              setStage("product");
            }}
            onNavigateToShop={() => setStage("product-menu")}
            onNavigateToAbout={() => setStage("about")}
            onNavigateToContact={() => setStage("contact")}
          />
        )}

        {stage === "product-menu" && (
          <ProductMenuPage
            onSelectProduct={handleSelectProduct}
            onBackToMain={() => setStage("main")}
            onNavigateToShop={() => setStage("product-menu")}
            onNavigateToAbout={() => setStage("about")}
            onNavigateToContact={() => setStage("contact")}
          />
        )}

        {stage === "product" && selectedProduct === "hoodie" && (
          <HoodiePage
            onBackToMain={() => setStage("main")}
            onNavigateToShop={() => setStage("product-menu")}
            onNavigateToAbout={() => setStage("about")}
            onNavigateToContact={() => setStage("contact")}
          />
        )}

        {stage === "product" && selectedProduct === "tshirt" && (
          <TshirtPage
            onBackToMain={() => setStage("main")}
            onNavigateToShop={() => setStage("product-menu")}
            onNavigateToAbout={() => setStage("about")}
            onNavigateToContact={() => setStage("contact")}
          />
        )}

        {/* Temporary placeholders - replace when you create the actual pages */}
        {stage === "about" && (
          <div className="min-h-screen bg-black text-white flex items-center justify-center flex-col gap-4">
            <h1 className="text-4xl font-bold">About Page - Coming Soon</h1>
            <button
              onClick={() => setStage("main")}
              className="bg-[#DD0004] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#BB0003]"
            >
              Back to Home
            </button>
          </div>
        )}

        {stage === "contact" && (
          <div className="min-h-screen bg-black text-white flex items-center justify-center flex-col gap-4">
            <h1 className="text-4xl font-bold">Contact Page - Coming Soon</h1>
            <button
              onClick={() => setStage("main")}
              className="bg-[#DD0004] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#BB0003]"
            >
              Back to Home
            </button>
          </div>
        )}

        <Toaster />
        <Sonner />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
