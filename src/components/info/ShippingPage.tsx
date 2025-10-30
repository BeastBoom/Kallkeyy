"use client";

import { ArrowLeft, Truck, Package, MapPin, Clock, AlertCircle } from "lucide-react";

interface Props {
  onBackToMain: () => void;
  skipAnimations?: boolean;
}

export default function ShippingPage({ onBackToMain, skipAnimations = false }: Props) {
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
            SHIPPING <span className="text-[#b90e0a]">INFORMATION</span>
          </h1>
          <div className="w-20 h-1 bg-[#b90e0a] mx-auto mb-6"></div>
          <p className="text-gray-400 text-lg">
            Fast, reliable shipping across India
          </p>
        </div>

        {/* Shipping Overview */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-[#b90e0a] transition-all duration-300">
            <Clock className="w-12 h-12 text-[#b90e0a] mb-4" />
            <h3 className="text-xl font-black mb-2">DELIVERY TIME</h3>
            <p className="text-gray-400">5-7 business days</p>
            <p className="text-sm text-gray-500 mt-2">
              Average delivery time after order confirmation
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-[#b90e0a] transition-all duration-300">
            <MapPin className="w-12 h-12 text-[#b90e0a] mb-4" />
            <h3 className="text-xl font-black mb-2">SHIPPING COVERAGE</h3>
            <p className="text-gray-400">All India</p>
            <p className="text-sm text-gray-500 mt-2">
              We ship to all serviceable pincodes across India
            </p>
          </div>
        </div>

        {/* Shipping Details */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 mb-12">
          <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
            <Truck className="w-8 h-8 text-[#b90e0a]" />
            SHIPPING DETAILS
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-lg mb-2 text-white">Processing Time</h3>
              <p className="text-gray-400">
                Orders are processed within 1-2 business days after payment confirmation. You'll
                receive a confirmation email with tracking details once your order is shipped.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-2 text-white">Shipping Charges</h3>
              <p className="text-gray-400 mb-2">
                Shipping charges are calculated at checkout based on your location and order value.
              </p>
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-sm text-green-400">
                <strong>FREE SHIPPING</strong> on orders above ₹1,999
              </div>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-2 text-white">Tracking Your Order</h3>
              <p className="text-gray-400">
                Once shipped, you'll receive a tracking number via email and SMS. You can track your
                order status in the <span className="text-[#b90e0a] font-bold">Orders</span> section
                of your account or directly on the courier partner's website.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-2 text-white">Delivery Partners</h3>
              <p className="text-gray-400">
                We work with trusted courier partners including Delhivery, Bluedart, and Shiprocket
                to ensure safe and timely delivery of your orders.
              </p>
            </div>
          </div>
        </div>

        {/* Delivery Guidelines */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 mb-12">
          <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
            <Package className="w-8 h-8 text-[#b90e0a]" />
            DELIVERY GUIDELINES
          </h2>
          <div className="space-y-4 text-gray-300">
            <div className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-[#b90e0a] rounded-full flex items-center justify-center font-bold text-sm">
                1
              </span>
              <div>
                <h3 className="font-bold text-white mb-1">Provide Accurate Address</h3>
                <p className="text-sm">
                  Ensure your shipping address is complete and accurate to avoid delivery delays.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-[#b90e0a] rounded-full flex items-center justify-center font-bold text-sm">
                2
              </span>
              <div>
                <h3 className="font-bold text-white mb-1">Be Available for Delivery</h3>
                <p className="text-sm">
                  Someone should be available to receive the package. If unavailable, the courier will
                  attempt redelivery or hold the package at the nearest facility.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-[#b90e0a] rounded-full flex items-center justify-center font-bold text-sm">
                3
              </span>
              <div>
                <h3 className="font-bold text-white mb-1">Inspect Upon Delivery</h3>
                <p className="text-sm">
                  Check your package for any visible damage before accepting delivery. If damaged,
                  refuse the delivery and contact us immediately.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-[#b90e0a] rounded-full flex items-center justify-center font-bold text-sm">
                4
              </span>
              <div>
                <h3 className="font-bold text-white mb-1">Keep Tracking Number Handy</h3>
                <p className="text-sm">
                  Save your tracking number to monitor delivery progress and address any issues quickly.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Important Notes */}
        <div className="bg-gradient-to-r from-yellow-500/10 to-transparent border border-yellow-500/30 rounded-2xl p-6 md:p-8">
          <h2 className="text-2xl font-black mb-4 flex items-center gap-3">
            <AlertCircle className="w-8 h-8 text-yellow-500" />
            IMPORTANT NOTES
          </h2>
          <ul className="space-y-3 text-gray-300">
            <li className="flex gap-2">
              <span className="text-yellow-500">•</span>
              <span>
                Delivery times may vary during peak seasons, festivals, or due to unforeseen circumstances.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-yellow-500">•</span>
              <span>
                Remote or restricted areas may require additional delivery time.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-yellow-500">•</span>
              <span>
                We are not responsible for delays caused by incorrect address information provided by the customer.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-yellow-500">•</span>
              <span>
                For shipping-related queries, contact us at{" "}
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

