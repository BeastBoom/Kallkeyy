"use client";

import ProductPageBase from "./ProductPageBase";

interface Props {
  onBackToMain: () => void;
  onNavigateToShop: () => void;
  onNavigateToAbout?: () => void;
  onNavigateToContact?: () => void;
  onNavigateToLogin: () => void;
  onNavigateToSignup: () => void;
  onNavigateToProduct?: (productId: string) => void
}

const HOODIE2_DATA = {
  name: "ANTAHA-YUGAYSA",
  price: "₹2,199",
  tag: "NEW LAUNCH",
  description:
    "“ANTAHA-YUGAYSA — HANDS OF GOD” When the divine clock shattered, time imploded into itself, through a wormhole. The Hands of God reached—not to save, but to rewrite. From that fracture, Antaha-Yugaysa was born—where endings wear eternity, and creation remembers its own destruction.",
  images: [
    "/hoodie2-main.jpg",
    "/hoodie2-back.jpg",
    "/hoodie2-detail.jpg",
    "/product-hoodie.jpg"  // Fallback to existing image
  ],
  material: [
    "Oversized unisex fit",
    "350gsm comfortable fabric",
    "Boxy fit with drop shoulders",
    "Do not bleach or iron directly on print",
  ],
};

export default function Hoodie2Page({
  onBackToMain,
  onNavigateToShop,
  onNavigateToAbout,
  onNavigateToContact,
  onNavigateToLogin,
  onNavigateToSignup,
  onNavigateToProduct
}: Props) {
  return (
    <ProductPageBase
      product={HOODIE2_DATA}
      productId="hoodie2"
      onBackToMain={onBackToMain}
      onNavigateToShop={onNavigateToShop}
      onNavigateToAbout={onNavigateToAbout}
      onNavigateToContact={onNavigateToContact}
      onNavigateToLogin={onNavigateToLogin}
      onNavigateToSignup={onNavigateToSignup}
      onNavigateToProduct={onNavigateToProduct}
    />
  );
}
