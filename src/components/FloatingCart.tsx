"use client"
import React, { useState } from 'react';
import { ShoppingBag, X, Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';

export const FloatingCart: React.FC = () => {
  const { items, totalItems, totalPrice, updateQuantity, removeFromCart, loading } = useCart();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null; // Only show if logged in

  return (
    <>
      {/* Floating Cart Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-[#DD0004] hover:bg-[#BB0003] text-white rounded-full p-4 shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95"
        aria-label="Shopping Cart"
      >
        <ShoppingBag className="w-6 h-6" />
        {totalItems > 0 && (
          <span className="absolute -top-2 -right-2 bg-white text-[#DD0004] text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg animate-pulse">
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
                items.map((item, index) => (
                  <div
                    key={`${item.productId}-${item.size}-${index}`}
                    className="bg-white/5 rounded-lg p-3 border border-white/10"
                  >
                    <div className="flex gap-3">
                      {/* Product Image */}
                      <img
                        src={item.image}
                        alt={item.productName}
                        className="w-20 h-20 object-cover rounded-lg"
                      />

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold text-sm truncate">
                          {item.productName}
                        </h3>
                        <p className="text-white/60 text-xs">Size: {item.size}</p>
                        <p className="text-[#DD0004] font-bold text-sm mt-1">
                          ₹{item.price}
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item.productId, item.size, Math.max(1, item.quantity - 1))}
                            disabled={loading}
                            className="bg-white/10 hover:bg-white/20 text-white rounded p-1 transition-colors disabled:opacity-50"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-white text-sm font-semibold min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                            disabled={loading}
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
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-white/10 p-4 space-y-4">
                {/* Total */}
                <div className="flex items-center justify-between text-white">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-2xl font-bold text-[#DD0004]">₹{totalPrice}</span>
                </div>

                {/* Checkout Button */}
                <Button
                  className="w-full bg-[#DD0004] hover:bg-[#BB0003] text-white font-bold py-6 transition-all duration-300 hover:scale-105"
                  disabled={loading}
                >
                  Proceed to Checkout
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};
