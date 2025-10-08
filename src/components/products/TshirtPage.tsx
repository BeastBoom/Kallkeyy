"use client"

import ProductPageBase from "./ProductPageBase"

interface Props {
  onBackToMain?: () => void
  onNavigateToShop?: () => void
  onNavigateToAbout?: () => void
  onNavigateToContact?: () => void
}

const TSHIRT_DATA = {
  name: "KALLKEYY SIGNATURE TEE",
  price: "₹1,499",
  tag: "NEW DROP",
  description:
    "Classic fit t-shirt with bold graphics and premium cotton construction. Features signature KALLKEYY branding, comfortable crew neck, and durable stitching. Perfect for everyday street style.",
  images: ["/hoodie-front.png", "/hoodie-side.png", "/product-hoodie.jpg", "/hoodie.png"],
  material: [
    "• 100% Premium Combed Cotton",
    "• 180gsm fabric weight",
    "• Pre-shrunk and enzyme washed",
    "• Machine wash cold, tumble dry low",
    "• Do not bleach or iron directly on print",
  ],
}

export default function TshirtPage({ onBackToMain, onNavigateToShop, onNavigateToAbout, onNavigateToContact }: Props) {
  return (
    <ProductPageBase
      product={TSHIRT_DATA}
      productId="tshirt"
      onBackToMain={onBackToMain}
      onNavigateToShop={onNavigateToShop}
      onNavigateToAbout={onNavigateToAbout}
      onNavigateToContact={onNavigateToContact}
    />
  )
}
