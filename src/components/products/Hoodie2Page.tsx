"use client";

import ProductPageBase from "./ProductPageBase";

interface Props {
  onBackToMain: () => void;
  onNavigateToShop: () => void;
  onNavigateToAbout?: () => void;
  onNavigateToContact?: () => void;
  onNavigateToLogin: () => void;
  onNavigateToSignup: () => void;
}

const HOODIE2_DATA = {
  name: "KALLKEYY OVERSIZED HOODIE",
  price: "₹3,299",
  tag: "NEW LAUNCH",
  description:
    "Premium oversized hoodie with dropped shoulders. Bold graphics and maximum comfort. Heavy 450 GSM fabric with screen-printed graphics.",
  images: [
    "/hoodie2-main.jpg",
    "/hoodie2-back.jpg",
    "/hoodie2-detail.jpg",
    "/product-hoodie.jpg"  // Fallback to existing image
  ],
  material: [
    "• 80% Cotton, 20% Polyester blend",
    "• 450gsm heavyweight construction",
    "• Oversized drop-shoulder fit",
    "• Machine wash cold, tumble dry low",
    "• Do not bleach or iron directly on print",
  ],
};

export default function Hoodie2Page({
  onBackToMain,
  onNavigateToShop,
  onNavigateToAbout,
  onNavigateToContact,
  onNavigateToLogin,
  onNavigateToSignup
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
    />
  );
}
