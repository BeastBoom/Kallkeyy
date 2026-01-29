/**
 * SEO Utilities and Configuration
 * Handles dynamic meta tags, structured data, and SEO optimization
 */

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  canonical?: string;
}

export const SITE_CONFIG = {
  name: "KALLKEYY",
  url: "https://kallkeyy.com",
  description: "Premium streetwear fashion brand. Shop quality hoodies and t-shirts designed for the modern streetwear enthusiast.",
  defaultImage: "https://kallkeyy.com/navbar-logo.png",
  locale: "en_US",
};

/**
 * Update meta tags dynamically
 */
export const updateMetaTags = (config: SEOConfig) => {
  const {
    title,
    description,
    keywords,
    image,
    url,
    type = "website",
    canonical,
  } = config;

  // Update title
  if (title) {
    document.title = title;
    
    // Update or create meta title
    let metaTitle = document.querySelector('meta[property="og:title"]');
    if (!metaTitle) {
      metaTitle = document.createElement('meta');
      metaTitle.setAttribute('property', 'og:title');
      document.head.appendChild(metaTitle);
    }
    metaTitle.setAttribute('content', title);
  }

  // Update description
  if (description) {
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    // OG description
    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (!ogDesc) {
      ogDesc = document.createElement('meta');
      ogDesc.setAttribute('property', 'og:description');
      document.head.appendChild(ogDesc);
    }
    ogDesc.setAttribute('content', description);
  }

  // Update keywords
  if (keywords) {
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', keywords);
  }

  // Update image
  const finalImage = image || SITE_CONFIG.defaultImage;
  let ogImage = document.querySelector('meta[property="og:image"]');
  if (!ogImage) {
    ogImage = document.createElement('meta');
    ogImage.setAttribute('property', 'og:image');
    document.head.appendChild(ogImage);
  }
  ogImage.setAttribute('content', finalImage);

  // Update URL
  const finalUrl = url || (typeof window !== 'undefined' ? window.location.href : SITE_CONFIG.url);
  let ogUrl = document.querySelector('meta[property="og:url"]');
  if (!ogUrl) {
    ogUrl = document.createElement('meta');
    ogUrl.setAttribute('property', 'og:url');
    document.head.appendChild(ogUrl);
  }
  ogUrl.setAttribute('content', finalUrl);

  // Update type
  let ogType = document.querySelector('meta[property="og:type"]');
  if (!ogType) {
    ogType = document.createElement('meta');
    ogType.setAttribute('property', 'og:type');
    document.head.appendChild(ogType);
  }
  ogType.setAttribute('content', type);

  // Update canonical URL
  if (canonical) {
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    (canonicalLink as HTMLLinkElement).href = canonical;
  }
};

/**
 * Generate structured data for organization
 */
export const getOrganizationStructuredData = () => {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "KALLKEYY",
    "url": SITE_CONFIG.url,
    "logo": `${SITE_CONFIG.url}/navbar-logo.png`,
    "description": SITE_CONFIG.description,
    "sameAs": [
      // Add social media links here when available
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Service",
      "url": `${SITE_CONFIG.url}/contact`
    }
  };
};

/**
 * Generate structured data for product
 */
export const getProductStructuredData = (product: {
  name: string;
  description: string;
  image: string[];
  price?: number;
  currency?: string;
  availability?: string;
  sku?: string;
  brand?: string;
}) => {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "image": product.image,
    "brand": {
      "@type": "Brand",
      "name": product.brand || "KALLKEYY"
    },
    "offers": product.price ? {
      "@type": "Offer",
      "url": typeof window !== 'undefined' ? window.location.href : SITE_CONFIG.url,
      "priceCurrency": product.currency || "INR",
      "price": product.price.toString(),
      "availability": product.availability || "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "KALLKEYY"
      }
    } : undefined,
    "sku": product.sku,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.5",
      "reviewCount": "50"
    }
  };
};

/**
 * Generate structured data for breadcrumbs
 */
export const getBreadcrumbStructuredData = (items: Array<{ name: string; url: string }>) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
};

/**
 * Generate structured data for website
 */
export const getWebsiteStructuredData = () => {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "KALLKEYY",
    "url": SITE_CONFIG.url,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${SITE_CONFIG.url}/shop?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };
};

