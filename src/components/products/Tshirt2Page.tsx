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
  name: "KALLKEYY GRAPHIC TEE PRO",
  price: "₹1,699",
  tag: "TRENDING",
  description:
    "Premium graphic tee with exclusive artwork. Made for those who stand out. 280 GSM premium cotton with oversized boxy fit.",
  images: [
    "/tshirt2-front.jpg",
    "/tshirt2-back.jpg",
    "/tshirt2-detail.jpg",
    "/hoodie-front.png"  // Fallback to existing image
  ],
  material: [
    "• 100% Premium Cotton",
    "• 280gsm heavyweight construction",
    "• Oversized boxy fit",
    "• Pre-shrunk and enzyme washed",
    "• Machine wash cold, hang dry",
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
