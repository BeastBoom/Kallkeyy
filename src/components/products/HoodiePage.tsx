"use client"

import ProductPageBase from "./ProductPageBase"

interface Props {
  onBackToMain?: () => void
  onNavigateToShop?: () => void
  onNavigateToAbout?: () => void
  onNavigateToContact?: () => void
  onNavigateToLogin: () => void 
  onNavigateToSignup: () => void 
}

const HOODIE_DATA = {
  name: "KALLKEYY ESSENTIAL HOODIE",
  price: "₹2,999",
  tag: "FLAGSHIP",
  description:
    "Premium cotton-blend hoodie with signature fit and street-ready design. Features embroidered wordmark, red accent details, and heavyweight construction built to last. Limited quantities available.",
  images: ["/product-hoodie.jpg", "/hoodie-side.png", "/hoodie-front.png", "/hoodie.png"],
  material: [
    "• 80% Premium Cotton, 20% Polyester blend",
    "• 400gsm heavyweight construction",
    "• Pre-shrunk and enzyme washed",
    "• Machine wash cold, tumble dry low",
    "• Do not bleach or iron directly on print",
  ],
}

export default function HoodiePage({ onBackToMain, onNavigateToShop, onNavigateToAbout, onNavigateToContact, onNavigateToLogin, onNavigateToSignup }: Props) {
  return (
    <ProductPageBase
      product={HOODIE_DATA}
      productId="hoodie"
      onBackToMain={onBackToMain}
      onNavigateToShop={onNavigateToShop}
      onNavigateToAbout={onNavigateToAbout}
      onNavigateToContact={onNavigateToContact}
      onNavigateToLogin={onNavigateToLogin}
      onNavigateToSignup={onNavigateToSignup}
    />
  )
}
