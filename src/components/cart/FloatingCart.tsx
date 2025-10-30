"use client"
import React, { useEffect, useState } from 'react';
import { ShoppingBag, X, Minus, Plus, Trash2, Bookmark, AlertTriangle } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';

interface FloatingCartProps {
  onNavigateToProduct?: (productId: string) => void;
}

export const FloatingCart: React.FC<FloatingCartProps> = ({ onNavigateToProduct }) => {
  const { items, savedForLater, totalItems, totalPrice, updateQuantity, removeFromCart, saveForLater, moveToCart, removeFromSaved, loading } = useCart();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isCheckoutPage, setIsCheckoutPage] = useState(false);

  useEffect(() => {
    const checkPath = () => {
      const path = window.location.pathname;
      setIsCheckoutPage(path === '/checkout');
    };

    checkPath();
    
    // Listen for navigation changes
    window.addEventListener('popstate', checkPath);
    const originalPushState = window.history.pushState;
    window.history.pushState = function(...args) {
      originalPushState.apply(window.history, args);
      checkPath();
    };

    return () => {
      window.removeEventListener('popstate', checkPath);
      window.history.pushState = originalPushState;
    };
  }, []);

  if (!user || isCheckoutPage) return null; // Only show if logged in

  return (
    <>
      {/* Floating Cart Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-[#b90e0a] hover:bg-[#BB0003] text-white rounded-full p-4 shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95"
        aria-label="Shopping Cart"
      >
        <ShoppingBag className="w-6 h-6" />
        {totalItems > 0 && (
          <span className="absolute -top-2 -right-2 bg-white text-[#b90e0a] text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg animate-pulse">
            {totalItems}
          </span>
        )}
      </button>

      {/* Cart Drawer */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-[60] transition-opacity duration-300"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer */}
          <div className="fixed top-0 right-0 h-full w-full md:w-96 bg-[#0a0a0a] z-[70] shadow-2xl transform transition-transform duration-300 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                Your Cart ({totalItems})
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {items.length === 0 ? (
                <div className="text-center text-white/40 py-12">
                  <ShoppingBag className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p>Your cart is empty</p>
                </div>
              ) : (
                <>
                  {items.map((item, index) => (
                    <div
                      key={`${item.productId}-${item.size}-${index}`}
                      className={`bg-white/5 rounded-lg p-3 border ${
                        item.inStock === false ? 'border-red-500/50' : 'border-white/10'
                      }`}
                    >
                      {/* Stock Warning */}
                      {item.inStock === false && (
                        <div className="flex items-center gap-2 mb-2 bg-red-500/10 border border-red-500/30 rounded p-2">
                          <AlertTriangle className="w-4 h-4 text-red-400" />
                          <span className="text-red-400 text-xs font-semibold">
                            {item.reason || 'Out of Stock'}
                          </span>
                        </div>
                      )}

                      <div className="flex gap-3">
                        {/* Product Image */}
                        <img
                          src={item.image}
                          alt={item.productName}
                          className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => {
                            if (onNavigateToProduct) {
                              onNavigateToProduct(item.productId);
                              setIsOpen(false);
                            }
                          }}
                        />

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <h3 
                            className="text-white font-semibold text-sm truncate cursor-pointer hover:text-[#b90e0a] transition-colors"
                            onClick={() => {
                              if (onNavigateToProduct) {
                                onNavigateToProduct(item.productId);
                                setIsOpen(false);
                              }
                            }}
                          >
                            {item.productName}
                          </h3>
                          <p className="text-white/60 text-xs">Size: {item.size}</p>
                          <p className="text-[#b90e0a] font-bold text-sm mt-1">
                            ₹{item.price}
                          </p>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => updateQuantity(item.productId, item.size, Math.max(1, item.quantity - 1))}
                              disabled={loading || item.inStock === false}
                              className="bg-white/10 hover:bg-white/20 text-white rounded p-1 transition-colors disabled:opacity-50"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-white text-sm font-semibold min-w-[2rem] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                              disabled={loading || item.inStock === false}
                              className="bg-white/10 hover:bg-white/20 text-white rounded p-1 transition-colors disabled:opacity-50"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => removeFromCart(item.productId, item.size)}
                              disabled={loading}
                              className="ml-auto text-red-500 hover:text-red-400 transition-colors disabled:opacity-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Save for Later Button */}
                          <button
                            onClick={() => saveForLater(item.productId, item.size)}
                            disabled={loading}
                            className="mt-2 text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors disabled:opacity-50"
                          >
                            <Bookmark className="w-3 h-3" />
                            Save for Later
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {/* Saved for Later Section */}
              {savedForLater && savedForLater.length > 0 && (
                <div className="border-t border-white/10 pt-4 mt-4">
                  <h3 className="text-white/80 font-semibold text-sm mb-3 flex items-center gap-2">
                    <Bookmark className="w-4 h-4" />
                    Saved for Later ({savedForLater.length})
                  </h3>
                  <div className="space-y-3">
                    {savedForLater.map((item, index) => (
                      <div
                        key={`saved-${item.productId}-${item.size}-${index}`}
                        className="bg-white/5 rounded-lg p-3 border border-white/10"
                      >
                        <div className="flex gap-3">
                          {/* Product Image */}
                          <img
                            src={item.image}
                            alt={item.productName}
                            className="w-16 h-16 object-cover rounded-lg opacity-60 cursor-pointer hover:opacity-100 transition-opacity"
                            onClick={() => {
                              if (onNavigateToProduct) {
                                onNavigateToProduct(item.productId);
                                setIsOpen(false);
                              }
                            }}
                          />

                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            <h3 
                              className="text-white/80 font-semibold text-sm truncate cursor-pointer hover:text-[#b90e0a] transition-colors"
                              onClick={() => {
                                if (onNavigateToProduct) {
                                  onNavigateToProduct(item.productId);
                                  setIsOpen(false);
                                }
                              }}
                            >
                              {item.productName}
                            </h3>
                            <p className="text-white/50 text-xs">Size: {item.size}</p>
                            <p className="text-[#b90e0a]/80 font-bold text-sm mt-1">
                              ₹{item.price}
                            </p>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2 mt-2">
                              <button
                                onClick={() => moveToCart(item.productId, item.size)}
                                disabled={loading}
                                className="text-xs bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 px-3 py-1 rounded transition-colors disabled:opacity-50"
                              >
                                Move to Cart
                              </button>
                              <button
                                onClick={() => removeFromSaved(item.productId, item.size)}
                                disabled={loading}
                                className="text-xs text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-white/10 p-4 space-y-4">
                {/* Total */}
                <div className="flex items-center justify-between text-white">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-2xl font-bold text-[#b90e0a]">₹{totalPrice}</span>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={() => {
                    window.location.href = '/checkout'; // Or use your navigation prop
                  }}
                  className="w-full bg-[#b90e0a] text-white py-3 rounded hover:bg-gray-800"
                >
                  Proceed to Checkout
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};
