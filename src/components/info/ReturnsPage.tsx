"use client";

import { ArrowLeft, RotateCcw, XCircle, CheckCircle, AlertTriangle, Clock } from "lucide-react";

interface Props {
  onBackToMain: () => void;
  skipAnimations?: boolean;
}

export default function ReturnsPage({ onBackToMain, skipAnimations = false }: Props) {
  return (
    <div className={`min-h-screen bg-black text-white px-4 py-12 ${skipAnimations ? '[&_*]:!animate-none' : ''}`}>
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="mb-8 flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-semibold">Back</span>
        </button>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-black mb-4 font-akira">
            RETURNS & <span className="text-[#b90e0a]">EXCHANGES</span>
          </h1>
          <div className="w-20 h-1 bg-[#b90e0a] mx-auto mb-6"></div>
          <p className="text-gray-400 text-lg">
            We want you to love your KALLKEYY purchase
          </p>
        </div>

        {/* Return Window */}
        <div className="bg-gradient-to-r from-[#b90e0a]/20 to-transparent border-2 border-[#b90e0a] rounded-2xl p-8 mb-12 text-center">
          <Clock className="w-16 h-16 text-[#b90e0a] mx-auto mb-4" />
          <h2 className="text-3xl font-black mb-2">3-DAY RETURN WINDOW</h2>
          <p className="text-xl text-gray-300">
            Returns are accepted within <span className="text-[#b90e0a] font-bold">3 days</span> after delivery
          </p>
        </div>

        {/* Eligibility Criteria */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 mb-12">
          <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-500" />
            RETURN ELIGIBILITY
          </h2>
          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-black text-sm">✓</span>
              </div>
              <div>
                <h3 className="font-bold text-white mb-1">Item is Unworn</h3>
                <p className="text-gray-400 text-sm">
                  Products must be unworn, unwashed, and in original condition with all tags attached.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-black text-sm">✓</span>
              </div>
              <div>
                <h3 className="font-bold text-white mb-1">Original Packaging</h3>
                <p className="text-gray-400 text-sm">
                  Item must be returned in original packaging along with all accessories and invoices.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-black text-sm">✓</span>
              </div>
              <div>
                <h3 className="font-bold text-white mb-1">Within Return Window</h3>
                <p className="text-gray-400 text-sm">
                  Return request must be initiated within 3 days of delivery.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-black text-sm">✓</span>
              </div>
              <div>
                <h3 className="font-bold text-white mb-1">No Signs of Damage</h3>
                <p className="text-gray-400 text-sm">
                  Items should not have any stains, odors, pet hair, or damage caused by the customer.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Non-Returnable Items */}
        <div className="bg-white/5 border border-red-500/30 rounded-2xl p-6 md:p-8 mb-12">
          <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
            <XCircle className="w-8 h-8 text-red-500" />
            NON-RETURNABLE ITEMS
          </h2>
          <div className="space-y-3 text-gray-300">
            <div className="flex gap-2">
              <span className="text-red-500">•</span>
              <span>Items with removed or tampered tags</span>
            </div>
            <div className="flex gap-2">
              <span className="text-red-500">•</span>
              <span>Worn, washed, or altered products</span>
            </div>
            <div className="flex gap-2">
              <span className="text-red-500">•</span>
              <span>Products returned after the 3-day window</span>
            </div>
            <div className="flex gap-2">
              <span className="text-red-500">•</span>
              <span>Items damaged due to misuse or improper care</span>
            </div>
            <div className="flex gap-2">
              <span className="text-red-500">•</span>
              <span>Sale or clearance items (unless defective)</span>
            </div>
          </div>
        </div>

        {/* Return Process */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 mb-12">
          <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
            <RotateCcw className="w-8 h-8 text-[#b90e0a]" />
            HOW TO RETURN
          </h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <span className="flex-shrink-0 w-10 h-10 bg-[#b90e0a] rounded-full flex items-center justify-center font-bold">
                1
              </span>
              <div>
                <h3 className="font-bold text-white mb-2">Initiate Return Request</h3>
                <p className="text-gray-400 text-sm">
                  Log in to your account, go to <span className="text-[#b90e0a] font-bold">Orders</span>,
                  select the order, and click "Request Return". Provide reason for return.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="flex-shrink-0 w-10 h-10 bg-[#b90e0a] rounded-full flex items-center justify-center font-bold">
                2
              </span>
              <div>
                <h3 className="font-bold text-white mb-2">Approval & Pickup</h3>
                <p className="text-gray-400 text-sm">
                  Once approved, we'll schedule a pickup from your address. Keep the item ready in its
                  original packaging.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="flex-shrink-0 w-10 h-10 bg-[#b90e0a] rounded-full flex items-center justify-center font-bold">
                3
              </span>
              <div>
                <h3 className="font-bold text-white mb-2">Quality Check</h3>
                <p className="text-gray-400 text-sm">
                  Returned items undergo a quality check to ensure they meet return eligibility criteria.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="flex-shrink-0 w-10 h-10 bg-[#b90e0a] rounded-full flex items-center justify-center font-bold">
                4
              </span>
              <div>
                <h3 className="font-bold text-white mb-2">Refund Processing</h3>
                <p className="text-gray-400 text-sm">
                  Once approved, refund will be processed within 5-7 business days to your original
                  payment method.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Exchange Policy */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 mb-12">
          <h2 className="text-2xl font-black mb-6">EXCHANGE POLICY</h2>
          <div className="space-y-4 text-gray-300">
            <p>
              We currently do not offer direct exchanges. If you need a different size or product,
              please return the original item and place a new order.
            </p>
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-sm">
              <strong className="text-blue-400">Pro Tip:</strong> To ensure you get the size you want,
              check our <span className="text-[#b90e0a] font-bold">Size Guide</span> before ordering.
            </div>
          </div>
        </div>

        {/* Important Information */}
        <div className="bg-gradient-to-r from-yellow-500/10 to-transparent border border-yellow-500/30 rounded-2xl p-6 md:p-8">
          <h2 className="text-2xl font-black mb-4 flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-yellow-500" />
            IMPORTANT INFORMATION
          </h2>
          <ul className="space-y-3 text-gray-300">
            <li className="flex gap-2">
              <span className="text-yellow-500">•</span>
              <span>
                Return shipping is free for defective items or wrong products sent. For other returns,
                shipping charges may apply.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-yellow-500">•</span>
              <span>
                Refunds will be initiated only after the returned item passes quality inspection.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-yellow-500">•</span>
              <span>
                The 3-day return window starts from the date of delivery, not the date of order.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-yellow-500">•</span>
              <span>
                For any return-related queries, contact us at{" "}
                <a
                  href="mailto:support@kallkeyy.com"
                  className="text-[#b90e0a] hover:underline no-underline"
                >
                  support@kallkeyy.com
                </a>
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

