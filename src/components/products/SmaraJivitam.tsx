"use client";

import ProductPageBase from "./ProductPageBase";

interface Props {
  onBackToMain?: () => void;
  onNavigateToShop?: () => void;
  onNavigateToAbout?: () => void;
  onNavigateToContact?: () => void;
  onNavigateToLogin: () => void;
  onNavigateToSignup: () => void;
  onNavigateToProduct?: (productId: string) => void;
  onNavigateToOrders?: () => void;
  skipAnimations?: boolean;
}

export const SMARA_JIVITAM_DATA = {
  name: "SMARA-JIVITAM",
  price: "₹1,199",
  originalPrice: "₹2,499",
  salePrice: "₹1,199",
  tag: "NEW DROP",
  description:
    '"SMARA JIVITAM — THE ASCENSION" Wings erupt from chaos, forged in will and fire. The sword of self-doubt strikes, but every wound becomes light. Smara Jivitam — proof that no sky limits you but your own mind. Rise. Break. Evolve.',
  images: [
    "/Smarajivitam-1.png",
    "/Smarajivitam.mp4",
    "/Smarajivitam-2.png",
    "/Smarajivitam-3.png",
  ],
  material: [
    "Oversized unisex fit",
    "240gsm French Terry Cotton",
    "Gentle Wash and Avoid Blow Dry",
    "Do not bleach or iron directly on print",
  ],
  productType: "tshirt" as const,
};

export default function SmaraJivitam({
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
      product={SMARA_JIVITAM_DATA}
      productId="smarajivitam"
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

