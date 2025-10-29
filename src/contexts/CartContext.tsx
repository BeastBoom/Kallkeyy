import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface CartItem {
  productId: string;
  productName: string;
  size: string;
  quantity: number;
  price: number;
  image: string;
  inStock?: boolean;
  availableQuantity?: number;
  reason?: string;
}

interface CartContextType {
  items: CartItem[];
  savedForLater: CartItem[];
  totalItems: number;
  totalPrice: number;
  addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => Promise<void>;
  updateQuantity: (productId: string, size: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string, size: string) => Promise<void>;
  clearCart: () => Promise<void>;
  fetchCart: () => Promise<void>;
  saveForLater: (productId: string, size: string) => Promise<void>;
  moveToCart: (productId: string, size: string) => Promise<void>;
  removeFromSaved: (productId: string, size: string) => Promise<void>;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [savedForLater, setSavedForLater] = useState<CartItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!user) {
      setItems([]);
      setSavedForLater([]);
      setTotalItems(0);
      setTotalPrice(0);
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
            // Fetch cart
            const cartResponse = await fetch('http://localhost:5000/api/cart', {
              credentials: 'include',
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });

      const cartData = await cartResponse.json();

      if (cartData.success) {
        // Fetch stock status for cart items
        const stockResponse = await fetch('http://localhost:5000/api/cart/validate', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        const stockData = await stockResponse.json();

        if (stockData.success && stockData.itemsWithStock) {
          // Merge stock info with cart items
          const itemsWithStockInfo = cartData.cart.items.map((item: CartItem) => {
            const stockInfo = stockData.itemsWithStock.find(
              (s: any) => s.productId === item.productId && s.size === item.size
            );
            return {
              ...item,
              inStock: stockInfo?.inStock ?? true,
              availableQuantity: stockInfo?.availableQuantity,
              reason: stockInfo?.reason
            };
          });
          setItems(itemsWithStockInfo);
        } else {
          setItems(cartData.cart.items);
        }

        setSavedForLater(cartData.cart.savedForLater || []);
        setTotalItems(cartData.cart.totalItems);
        setTotalPrice(cartData.cart.totalPrice);
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    if (!user) {
      throw new Error('Please login to add items to cart');
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/cart/add', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...item,
          quantity: item.quantity || 1
        })
      });

      const data = await response.json();

      if (data.success) {
        setItems(data.cart.items);
        setTotalItems(data.cart.totalItems);
        setTotalPrice(data.cart.totalPrice);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Failed to add to cart:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId: string, size: string, quantity: number) => {
    if (!user) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/cart/update', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId, size, quantity })
      });

      const data = await response.json();

      if (data.success) {
        setItems(data.cart.items);
        setTotalItems(data.cart.totalItems);
        setTotalPrice(data.cart.totalPrice);
      }
    } catch (error) {
      console.error('Failed to update cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId: string, size: string) => {
    if (!user) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/cart/remove', {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId, size })
      });

      const data = await response.json();

      if (data.success) {
        setItems(data.cart.items);
        setTotalItems(data.cart.totalItems);
        setTotalPrice(data.cart.totalPrice);
      }
    } catch (error) {
      console.error('Failed to remove from cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/cart/clear', {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setItems([]);
        setTotalItems(0);
        setTotalPrice(0);
      }
    } catch (error) {
      console.error('Failed to clear cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveForLaterFn = async (productId: string, size: string) => {
    if (!user) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/cart/save-for-later', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId, size })
      });

      const data = await response.json();

      if (data.success) {
        setItems(data.cart.items);
        setSavedForLater(data.cart.savedForLater);
        setTotalItems(data.cart.totalItems);
        setTotalPrice(data.cart.totalPrice);
      }
    } catch (error) {
      console.error('Failed to save for later:', error);
    } finally {
      setLoading(false);
    }
  };

  const moveToCart = async (productId: string, size: string) => {
    if (!user) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/cart/move-to-cart', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId, size })
      });

      const data = await response.json();

      if (data.success) {
        setItems(data.cart.items);
        setSavedForLater(data.cart.savedForLater);
        setTotalItems(data.cart.totalItems);
        setTotalPrice(data.cart.totalPrice);
        // Refresh to get stock info
        await fetchCart();
      }
    } catch (error) {
      console.error('Failed to move to cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromSaved = async (productId: string, size: string) => {
    if (!user) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/cart/remove-saved', {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId, size })
      });

      const data = await response.json();

      if (data.success) {
        setSavedForLater(data.cart.savedForLater);
      }
    } catch (error) {
      console.error('Failed to remove from saved:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setItems([]);
      setSavedForLater([]);
      setTotalItems(0);
      setTotalPrice(0);
    }
  }, [user]);

  return (
    <CartContext.Provider
      value={{
        items,
        savedForLater,
        totalItems,
        totalPrice,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        fetchCart,
        saveForLater: saveForLaterFn,
        moveToCart,
        removeFromSaved,
        loading
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
