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
  onNavigateToOrders?: () => void;
  skipAnimations?: boolean;
}

export const ANTAHA_YUGAYSA_DATA = {
  name: "ANTAHA-YUGAYSA",
  price: "₹1,999",
  originalPrice: "₹4,499",
  salePrice: "₹1,999",
  tag: "NEW LAUNCH",
  description:
    '"ANTAHA-YUGAYSA — HANDS OF GOD" When the divine clock shattered, time imploded into itself, through a wormhole. The Hands of God reached—not to save, but to rewrite. From that fracture, Antaha-Yugaysa was born—where endings wear eternity, and creation remembers its own destruction.',
  images: [
    "/Antahayugasya-1.png",
    "/antahayugasya.mp4",
    "/Antahayugasya-2.png",
    "/Antahayugasya-3.png",
  ],
  material: [
    "Oversized unisex fit",
    "350gsm comfortable fabric",
    "Gentle Wash and Avoid Blow Dry",
    "Do not bleach or iron directly on print",
  ],
  productType: "hoodie" as const,
};

export default function AntahaYugaysa({
  onBackToMain,
  onNavigateToShop,
  onNavigateToAbout,
  onNavigateToContact,
  onNavigateToLogin,
  onNavigateToSignup,
  onNavigateToProduct,
  onNavigateToOrders,
  skipAnimations,
}: Props) {
  return (
    <ProductPageBase
      product={ANTAHA_YUGAYSA_DATA}
      productId="antahayugaysa"
      onBackToMain={onBackToMain}
      onNavigateToShop={onNavigateToShop}
      onNavigateToAbout={onNavigateToAbout}
      onNavigateToContact={onNavigateToContact}
      onNavigateToLogin={onNavigateToLogin}
      onNavigateToSignup={onNavigateToSignup}
      onNavigateToProduct={onNavigateToProduct}
      onNavigateToOrders={onNavigateToOrders}
      skipAnimations={skipAnimations}
    />
  );
}

