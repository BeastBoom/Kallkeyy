"use client";

import ProductPageBase from "./ProductPageBase";

interface Props {
  onBackToMain: () => void;
  onNavigateToShop: () => void;
  onNavigateToAbout?: () => void;
  onNavigateToContact?: () => void;
  onNavigateToLogin: () => void;
  onNavigateToSignup: () => void;
  onNavigateToProduct?: (productId: string) => void;
}

const TSHIRT2_DATA = {
  name: "MRITYO-BADDHA",
  price: "₹999",
  originalPrice: "₹1,999",
  salePrice: "₹999",
  tag: "TRENDING",
  description:
    '"MRITYO-BADDHA — BOUND BY DEATH" A graphic tee that embodies the struggle against mortality. 280 GSM premium cotton with oversized boxy fit.',
  images: [
    "/Mrityobaddha-1.png",
    "/Mrityobaddha.mp4",
    "/Mrityobaddha-2.png",
    "/Mrityobaddha-3.png",
  ],
  material: [
    "Oversized unisex fit",
    "240gsm French Terry Cotton",
    "Boxy fit with drop shoulders",
    "Do not bleach or iron directly on print",
  ],
  productType: "tshirt" as const,
};

export default function Tshirt2Page({
  onBackToMain,
  onNavigateToShop,
  onNavigateToAbout,
  onNavigateToContact,
  onNavigateToLogin,
  onNavigateToSignup,
  onNavigateToProduct,
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
