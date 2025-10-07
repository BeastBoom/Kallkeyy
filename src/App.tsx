"use client"

import { useState, useEffect } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"

import Preloader from "@/components/Preloader"
import EarlyAccessPage from "@/components/EarlyAccessPage"
import MainBrandPage from "@/components/MainBrandPage"
import ProductPage from "@/components/ProductPage"
import ProductMenuPage from "@/components/ProductMenuPage"

const queryClient = new QueryClient()

const STAGE_KEY = "kallkeyy:stage" as const
const PRODUCT_KEY = "kallkeyy:selectedProduct" as const

const getInitialStage = (): AppStage => {
  try {
    const saved = sessionStorage.getItem(STAGE_KEY) as AppStage | null
    return saved ?? "loading"
  } catch {
    return "loading"
  }
}

const getInitialProduct = (): string => {
  try {
    const saved = sessionStorage.getItem(PRODUCT_KEY)
    return saved ?? "hoodie"
  } catch {
    return "hoodie"
  }
}

type AppStage = "loading" | "early-access" | "main" | "product-menu" | "product"

const App = () => {
  const [stage, setStage] = useState<AppStage>(getInitialStage())
  const [selectedProduct, setSelectedProduct] = useState<string>(getInitialProduct())

  useEffect(() => {
    try {
      sessionStorage.setItem(STAGE_KEY, stage)
    } catch {}
  }, [stage])

  useEffect(() => {
    try {
      sessionStorage.setItem(PRODUCT_KEY, selectedProduct)
    } catch {}
  }, [selectedProduct])

  useEffect(() => {
    // Push initial state
    window.history.pushState({ stage }, "", "")

    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.stage) {
        setStage(event.state.stage)
      } else {
        // If no state, go back to main
        setStage("main")
      }
    }

    window.addEventListener("popstate", handlePopState)

    return () => {
      window.removeEventListener("popstate", handlePopState)
    }
  }, [])

  useEffect(() => {
    if (stage !== "loading") {
      window.history.pushState({ stage }, "", "")
    }
  }, [stage])

  const handleSelectProduct = (productId: string) => {
    setSelectedProduct(productId)
    setStage("product")
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {stage === "loading" && <Preloader onComplete={() => setStage("early-access")} />}
        {stage === "early-access" && <EarlyAccessPage onAccessGranted={() => setStage("main")} />}
        {stage === "main" && (
          <MainBrandPage
            onViewProduct={() => setStage("product")}
            onViewProductMenu={() => setStage("product-menu")}
            onViewHoodie={() => {
              setSelectedProduct("hoodie")
              setStage("product")
            }}
            onViewTshirt={() => {
              setSelectedProduct("tshirt")
              setStage("product")
            }}
          />
        )}
        {stage === "product-menu" && (
          <ProductMenuPage onSelectProduct={handleSelectProduct} onBackToMain={() => setStage("main")} />
        )}
        {stage === "product" && <ProductPage onBackToMain={() => setStage("main")} productId={selectedProduct} />}
        <Toaster />
        <Sonner />
      </TooltipProvider>
    </QueryClientProvider>
  )
}

export default App
