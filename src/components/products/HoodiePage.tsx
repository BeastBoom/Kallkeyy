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
}

const HOODIE_DATA = {
  name: "KAAL-DRISHTA",
  price: "₹2,199",
  originalPrice: "₹4,499",
  salePrice: "₹2,199",
  tag: "FLAGSHIP",
  description:
    "KAALDRISHTA — the blazing eye that never blinks. Born from the ashes of forgotten gods, its wings burn through illusion. Omnipresent, it sees past life and death — the watcher of endings, the guardian of rebirth. Nothing escapes its divine sight.",
  images: [
    "/KaalDrishta-1.png",
    "/KallDrishta.mp4",
    "/KaalDrishta-2.png",
    "/KaalDrishta-3.png",
  ],
  material: [
    "Oversized unisex fit",
    "350gsm comfortable fabric",
    "Boxy fit with drop shoulders",
    "Do not bleach or iron directly on print",
  ],
  productType: "hoodie" as const,
};

export default function HoodiePage({
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
      product={HOODIE_DATA}
      productId="hoodie"
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
