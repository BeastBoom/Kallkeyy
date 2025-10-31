// Get API base URL - handle both with and without /api suffix
const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  // Remove trailing slash and /api if present
  const baseUrl = envUrl.replace(/\/api\/?$/, '').replace(/\/$/, '');
  return baseUrl;
};

const API_BASE_URL = getApiBaseUrl();

export interface SubscriptionResponse {
  success: boolean;
  message: string;
  data?: {
    email: string;
    subscribedAt: string;
    isActive: boolean;
  };
  errors?: Array<{ msg: string }>;
}

export const subscribeToNewsletter = async (email: string): Promise<SubscriptionResponse> => {
  try {
    // Construct URL correctly - ensure single /api in path
    const url = `${API_BASE_URL}/api/subscribers/subscribe`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for CORS
      body: JSON.stringify({ email }),
    });

    // Check if response is ok before parsing JSON
    if (!response.ok) {
      let errorMessage = 'Subscription failed';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.errors?.[0]?.msg || errorMessage;
      } catch (e) {
        // If JSON parsing fails, use status text
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Subscription error:', error);
    
    // Re-throw with better error message
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Network error. Please check your connection and try again.');
  }
};
