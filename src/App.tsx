import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

import Preloader from "@/components/Preloader";
import EarlyAccessPage from "@/components/EarlyAccessPage";
import MainBrandPage from "@/components/MainBrandPage";
import ProductPage from "@/components/ProductPage";

const queryClient = new QueryClient();

const STAGE_KEY = 'kallkeyy:stage' as const;

const getInitialStage = (): AppStage => {
  try {
    const saved = sessionStorage.getItem(STAGE_KEY) as AppStage | null;
    return saved ?? 'loading';
  } catch {
    return 'loading';
  }
};

type AppStage = "loading" | "early-access" | "main" | "product";

const App = () => {
  const [stage, setStage] = useState<AppStage>(getInitialStage());

  useEffect(() => {
    try {
      sessionStorage.setItem(STAGE_KEY, stage);
    } catch {}
  }, [stage]);

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
          <MainBrandPage onViewProduct={() => setStage("product")} />
        )}
        {stage === "product" && (
          <ProductPage onBackToMain={() => setStage("main")} />
        )}
        <Toaster />
        <Sonner />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
