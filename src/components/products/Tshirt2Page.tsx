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

const TSHIRT2_DATA = {
  name: "MRITYO-BADDHA",
  price: "₹999",
  tag: "TRENDING",
  description:
    "“MRITYO-BADDHA — BOUND BY DEATH” A graphic tee that embodies the struggle against mortality. 280 GSM premium cotton with oversized boxy fit.",
  images: [
    "/tshirt2-front.jpg",
    "/tshirt2-back.jpg",
    "/tshirt2-detail.jpg",
    "/hoodie-front.png"  // Fallback to existing image
  ],
  material: [
    "Oversized unisex fit",
    "240gsm French Terry Cotton",
    "Boxy fit with drop shoulders",
    "Do not bleach or iron directly on print",
  ],
};

export default function Tshirt2Page({
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
      product={TSHIRT2_DATA}
      productId="tshirt2"
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
