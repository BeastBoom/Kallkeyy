const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
    const response = await fetch(`${API_BASE_URL}/api/subscribers/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Subscription failed');
    }

    return data;
  } catch (error) {
    console.error('Subscription error:', error);
    throw error;
  }
};
