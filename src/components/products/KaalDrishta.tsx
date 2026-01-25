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

export const KAAL_DRISHTA_DATA = {
  name: "KAAL-DRISHTA",
  price: "₹2,499",
  originalPrice: "₹4,499",
  salePrice: "₹2,499",
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

export default function KaalDrishta({
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
      product={KAAL_DRISHTA_DATA}
      productId="kaaldrishta"
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

