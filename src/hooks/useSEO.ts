import { useEffect } from 'react';
import { 
  SEOConfig, 
  updateMetaTags, 
  getWebsiteStructuredData,
  getOrganizationStructuredData,
  getProductStructuredData,
  getBreadcrumbStructuredData
} from '../lib/seo';

/**
 * Hook to update SEO meta tags and structured data
 */
export const useSEO = (config: SEOConfig, structuredData?: any) => {
  useEffect(() => {
    // Update meta tags
    updateMetaTags(config);

    // Update or create structured data
    if (structuredData) {
      let script = document.querySelector('script[type="application/ld+json"][data-seo="true"]');
      if (!script) {
        script = document.createElement('script');
        script.setAttribute('type', 'application/ld+json');
        script.setAttribute('data-seo', 'true');
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(structuredData, null, 2);
    }
  }, [config, structuredData]);
};

/**
 * Hook for product pages with product structured data
 */
export const useProductSEO = (config: SEOConfig, product: {
  name: string;
  description: string;
  image: string[];
  price?: number;
  currency?: string;
  availability?: string;
  sku?: string;
  brand?: string;
}) => {
  const productData = getProductStructuredData(product);
  
  // Combine website and product data
  const websiteData = getWebsiteStructuredData();
  const organizationData = getOrganizationStructuredData();
  
  // Create multiple structured data scripts
  useEffect(() => {
    updateMetaTags(config);

    // Remove existing structured data
    const existingScripts = document.querySelectorAll('script[data-seo="true"]');
    existingScripts.forEach(script => script.remove());

    // Add website structured data
    let websiteScript = document.createElement('script');
    websiteScript.setAttribute('type', 'application/ld+json');
    websiteScript.setAttribute('data-seo', 'true');
    websiteScript.setAttribute('data-type', 'website');
    websiteScript.textContent = JSON.stringify(websiteData, null, 2);
    document.head.appendChild(websiteScript);

    // Add organization structured data
    let orgScript = document.createElement('script');
    orgScript.setAttribute('type', 'application/ld+json');
    orgScript.setAttribute('data-seo', 'true');
    orgScript.setAttribute('data-type', 'organization');
    orgScript.textContent = JSON.stringify(organizationData, null, 2);
    document.head.appendChild(orgScript);

    // Add product structured data
    let productScript = document.createElement('script');
    productScript.setAttribute('type', 'application/ld+json');
    productScript.setAttribute('data-seo', 'true');
    productScript.setAttribute('data-type', 'product');
    productScript.textContent = JSON.stringify(productData, null, 2);
    document.head.appendChild(productScript);
  }, [config, product]);
};

