"use client"
import React, { useEffect, useState } from 'react';
import { ShoppingBag, X, Minus, Plus, Trash2, Bookmark, AlertTriangle, Sparkles, ArrowRight } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';

interface FloatingCartProps {
  onNavigateToProduct?: (productId: string) => void;
  onNavigateToCheckout?: () => void;
}

export const FloatingCart: React.FC<FloatingCartProps> = ({ onNavigateToProduct, onNavigateToCheckout }) => {
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

  if (!user || isCheckoutPage) return null;

  return (
    <>
      {/* Floating Cart Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-[#b90e0a] hover:bg-[#8a0a08] text-white rounded-full p-4 sm:p-5 shadow-xl transition-transform duration-200 ease-out hover:scale-105 active:scale-95"
        aria-label="Shopping Cart"
      >
        <ShoppingBag className="w-6 h-6 sm:w-7 sm:h-7" />
        {totalItems > 0 && (
          <span className="absolute -top-2 -right-2 bg-white text-[#b90e0a] text-xs sm:text-sm font-bold rounded-full w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center shadow-md border-2 border-[#b90e0a]">
            {totalItems}
          </span>
        )}
      </button>

      {/* Cart Drawer */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 z-[60]"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer */}
          <div className="fixed top-0 right-0 h-full w-full sm:w-[400px] lg:w-[440px] bg-white z-[70] shadow-2xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-100 bg-[#fafafa]">
              <h2 className="text-xl sm:text-2xl font-bold text-[#0a0a0a] flex items-center gap-3">
                <ShoppingBag className="w-6 h-6 sm:w-7 sm:h-7 text-[#b90e0a]" />
                <span>Your Cart</span>
                <span className="text-sm sm:text-base font-normal text-gray-500">({totalItems})</span>
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-[#0a0a0a] hover:bg-gray-100 rounded-full p-2 transition-colors duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {items.length === 0 ? (
                <div className="text-center text-gray-400 py-16">
                  <ShoppingBag className="w-20 h-20 mx-auto mb-6 opacity-20" />
                  <p className="text-lg sm:text-xl font-medium text-gray-500 mb-2">Your cart is empty</p>
                  <p className="text-sm text-gray-400">Add some items to get started!</p>
                </div>
              ) : (
                <>
                  {items.map((item, index) => (
                    <div
                      key={`${item.productId}-${item.size}-${index}`}
                      className={`bg-[#fafafa] rounded-xl p-4 border transition-colors duration-200 hover:border-gray-200 ${
                        item.inStock === false ? 'border-red-300' : 'border-gray-100'
                      }`}
                    >
                      {/* Stock Warning */}
                      {item.inStock === false && (
                        <div className="flex items-center gap-2 mb-3 bg-red-50 border border-red-200 rounded-lg p-3">
                          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                          <span className="text-red-600 text-sm font-medium">
                            {item.reason || 'Out of Stock'}
                          </span>
                        </div>
                      )}

                      <div className="flex gap-4">
                        {/* Product Image */}
                        <img
                          src={item.image}
                          alt={item.productName}
                          className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity duration-200"
                          onClick={() => {
                            if (onNavigateToProduct) {
                              onNavigateToProduct(item.productId);
                              setIsOpen(false);
                            }
                          }}
                        />

                        {/* Product Details */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <h3 
                              className="text-[#0a0a0a] font-bold text-base sm:text-lg leading-tight cursor-pointer hover:text-[#b90e0a] transition-colors duration-200 line-clamp-2"
                              onClick={() => {
                                if (onNavigateToProduct) {
                                  onNavigateToProduct(item.productId);
                                  setIsOpen(false);
                                }
                              }}
                            >
                              {item.productName}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-gray-500 text-sm">Size:</span>
                              <span className="bg-gray-200 text-[#0a0a0a] text-xs sm:text-sm font-semibold px-2.5 py-0.5 rounded-md">
                                {item.size}
                              </span>
                            </div>
                          </div>
                          
                          <p className="text-[#b90e0a] font-bold text-lg sm:text-xl mt-2">
                            ₹{item.price.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateQuantity(item.productId, item.size, Math.max(1, item.quantity - 1))}
                            disabled={loading || item.inStock === false}
                            className="bg-gray-200 hover:bg-[#b90e0a] hover:text-white text-[#0a0a0a] rounded-full p-2 transition-colors duration-200 disabled:opacity-50"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="text-[#0a0a0a] text-lg sm:text-xl font-bold min-w-[2.5rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                            disabled={loading || item.inStock === false}
                            className="bg-gray-200 hover:bg-[#b90e0a] hover:text-white text-[#0a0a0a] rounded-full p-2 transition-colors duration-200 disabled:opacity-50"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => saveForLater(item.productId, item.size)}
                            disabled={loading}
                            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors duration-200 disabled:opacity-50"
                          >
                            <Bookmark className="w-4 h-4" />
                            <span className="hidden sm:inline">Save</span>
                          </button>
                          <button
                            onClick={() => removeFromCart(item.productId, item.size)}
                            disabled={loading}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors duration-200 disabled:opacity-50"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {/* Saved for Later Section */}
              {savedForLater && savedForLater.length > 0 && (
                <div className="border-t border-gray-200 pt-5 mt-5">
                  <h3 className="text-gray-700 font-bold text-base sm:text-lg mb-4 flex items-center gap-2">
                    <Bookmark className="w-5 h-5 text-blue-600" />
                    Saved for Later
                    <span className="text-gray-400 font-normal">({savedForLater.length})</span>
                  </h3>
                  <div className="space-y-3">
                    {savedForLater.map((item, index) => (
                      <div
                        key={`saved-${item.productId}-${item.size}-${index}`}
                        className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-gray-200 transition-colors duration-200"
                      >
                        <div className="flex gap-3">
                          <img
                            src={item.image}
                            alt={item.productName}
                            className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg opacity-80 cursor-pointer hover:opacity-100 transition-opacity duration-200"
                            onClick={() => {
                              if (onNavigateToProduct) {
                                onNavigateToProduct(item.productId);
                                setIsOpen(false);
                              }
                            }}
                          />

                          <div className="flex-1 min-w-0">
                            <h3 
                              className="text-gray-700 font-semibold text-sm sm:text-base truncate cursor-pointer hover:text-[#b90e0a] transition-colors duration-200"
                              onClick={() => {
                                if (onNavigateToProduct) {
                                  onNavigateToProduct(item.productId);
                                  setIsOpen(false);
                                }
                              }}
                            >
                              {item.productName}
                            </h3>
                            <p className="text-gray-400 text-xs sm:text-sm">Size: {item.size}</p>
                            <p className="text-[#b90e0a] font-bold text-sm sm:text-base mt-1">
                              ₹{item.price.toLocaleString()}
                            </p>

                            <div className="flex items-center gap-2 mt-3">
                              <button
                                onClick={() => moveToCart(item.productId, item.size)}
                                disabled={loading}
                                className="text-xs sm:text-sm bg-blue-100 text-blue-600 hover:bg-blue-200 px-3 py-1.5 rounded-lg transition-colors duration-200 disabled:opacity-50 font-medium"
                              >
                                Move to Cart
                              </button>
                              <button
                                onClick={() => removeFromSaved(item.productId, item.size)}
                                disabled={loading}
                                className="text-xs sm:text-sm text-red-500 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors duration-200 disabled:opacity-50"
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
              <div className="border-t border-gray-200 p-5 sm:p-6 space-y-4 bg-[#fafafa]">
                {/* Total */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-gray-500">
                    <span className="text-base">Subtotal</span>
                    <span className="text-base">₹{totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xl sm:text-2xl font-bold text-[#0a0a0a]">Total</span>
                    <span className="text-2xl sm:text-3xl font-bold text-[#b90e0a]">₹{totalPrice.toLocaleString()}</span>
                  </div>
                </div>

                {/* Free shipping notice */}
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <p className="text-green-700 text-sm sm:text-base font-medium">
                    Free shipping on all pan-India orders!
                  </p>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={() => {
                    if (onNavigateToCheckout) {
                      setIsOpen(false);
                      onNavigateToCheckout();
                    } else {
                      sessionStorage.setItem('allowed_/checkout', 'true');
                      window.location.href = '/checkout';
                    }
                  }}
                  className="w-full bg-[#c41e1a] hover:bg-[#8a0a08] text-white py-4 sm:py-5 rounded-full font-bold text-base sm:text-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};
