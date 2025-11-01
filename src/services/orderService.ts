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
      throw new Error(error.message || 'Failed to cancel order');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error cancelling order:', error);
    throw error;
  }
};

