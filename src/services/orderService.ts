import { API_BASE_URL } from '../lib/apiConfig';

export interface OrderItem {
  productId: string;
  productName: string;
  size: string;
  quantity: number;
  price: number;
  image: string;
}

export interface Order {
  _id: string;
  orderId: string;
  userId: string;
  items: OrderItem[];
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
    email: string;
  };
  amount: number;
  currency: string;
  status: string;
  paymentStatus: string;
  paymentMethod?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  courierName?: string;
  trackingUrl?: string;
  awbCode?: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  returnRequested?: boolean;
  returnReason?: string;
  returnComments?: string;
  returnRequestedAt?: string;
  cancelledAt?: string;
  cancellationWindowEndsAt?: string;
  refundDetails?: {
    refundId?: string;
    refundAmount?: number;
    refundStatus?: 'pending' | 'processed' | 'failed' | 'completed';
    refundReason?: string;
    refundedAt?: string;
    refundNotes?: string;
  };
  createdAt: string;
  updatedAt: string;
}

const getAuthToken = () => {
  return localStorage.getItem('token') || '';
};

export const getAllOrders = async (): Promise<Order[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

export const getOrderById = async (orderId: string): Promise<Order> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch order details');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching order details:', error);
    throw error;
  }
};

export const requestOrderReturn = async (
  orderId: string,
  reason: string,
  comments: string
): Promise<{ message: string; order: Order }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/return`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`,
      },
      credentials: 'include',
      body: JSON.stringify({ reason, comments }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to request return');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error requesting return:', error);
    throw error;
  }
};

export const cancelOrder = async (orderId: string): Promise<{ message: string; order: Order }> => {
  try {
    
    const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/cancel`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`,
      },
      credentials: 'include',
    });


    if (!response.ok) {
      const error = await response.json();
      console.error(`❌ Backend returned error:`, error);
      
      // If order is eligible for refund, redirect to refund endpoint
      if (error.refundEligible) {
        return processOrderRefund(orderId, error.cancellationReason || 'User cancelled order');
      }
      
      throw new Error(error.message || 'Failed to cancel order');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Frontend order cancellation error:', error);
    throw error;
  }
};

export const processOrderRefund = async (
  orderId: string,
  reason: string
): Promise<{ message: string; order: Order }> => {
  try {
    
    const response = await fetch(`${API_BASE_URL}/api/refunds/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`,
      },
      credentials: 'include',
      body: JSON.stringify({ orderId, reason }),
    });


    if (!response.ok) {
      const error = await response.json();
      console.error(`❌ Refund processing failed:`, error);
      throw new Error(error.message || 'Failed to process refund');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Frontend refund processing error:', error);
    throw error;
  }
};

// Helper function to validate payment status for frontend
export const validatePaymentStatus = (paymentStatus: string, razorpayStatus?: string): boolean => {
  // Only accept 'captured' status for transactions to appear in Razorpay dashboard
  if (razorpayStatus && razorpayStatus !== 'captured') {
    console.warn(`⚠️ Payment status is ${razorpayStatus}, not 'captured'. Transactions may not appear in Razorpay dashboard.`);
    return false;
  }
  
  return paymentStatus === 'completed';
};

export const getRefundStatus = async (orderId: string): Promise<{ success: boolean; refundDetails: any; orderStatus: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/refunds/status/${orderId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch refund status');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching refund status:', error);
    throw error;
  }
};

export const getOrderTracking = async (orderId: string): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/tracking`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch tracking information');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching tracking information:', error);
    throw error;
  }
};

