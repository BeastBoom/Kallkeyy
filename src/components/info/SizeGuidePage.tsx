"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";

interface Props {
  onBackToMain: () => void;
  skipAnimations?: boolean;
}

export default function SizeGuidePage({ onBackToMain, skipAnimations = false }: Props) {
  const [selectedType, setSelectedType] = useState<"hoodie" | "tshirt">("hoodie");

  const HOODIE_SIZE_CHART = {
    M: { chest: "38-40", garmentChest: "46", length: "27.5", shoulder: "24.5" },
    L: { chest: "40-42", garmentChest: "48", length: "28.5", shoulder: "25" },
    XL: { chest: "42-44", garmentChest: "50", length: "29.5", shoulder: "25.5" },
    XXL: { chest: "44-46", garmentChest: "52", length: "30", shoulder: "26" },
  };

  const TSHIRT_SIZE_CHART = {
    M: { chest: "38-40", garmentChest: "46", length: "27.5", shoulder: "24.5" },
    L: { chest: "40-42", garmentChest: "48", length: "28.5", shoulder: "25" },
    XL: { chest: "42-44", garmentChest: "50", length: "29.5", shoulder: "25.5" },
    XXL: { chest: "44-46", garmentChest: "52", length: "30", shoulder: "26" },
  };

  const SIZE_CHART = selectedType === "hoodie" ? HOODIE_SIZE_CHART : TSHIRT_SIZE_CHART;

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
            SIZE <span className="text-[#b90e0a]">GUIDE</span>
          </h1>
          <div className="w-20 h-1 bg-[#b90e0a] mx-auto mb-6"></div>
          <p className="text-gray-400 text-lg">
            Find your perfect fit with our detailed size guide
          </p>
        </div>

        {/* Product Type Selector */}
        <div className="flex justify-center gap-4 mb-12">
          <button
            onClick={() => setSelectedType("hoodie")}
            className={`px-8 py-3 rounded-lg font-bold transition-all duration-300 ${
              selectedType === "hoodie"
                ? "bg-[#b90e0a] text-white scale-105"
                : "bg-white/5 border border-white/10 hover:border-[#b90e0a]"
            }`}
          >
            HOODIES
          </button>
          <button
            onClick={() => setSelectedType("tshirt")}
            className={`px-8 py-3 rounded-lg font-bold transition-all duration-300 ${
              selectedType === "tshirt"
                ? "bg-[#b90e0a] text-white scale-105"
                : "bg-white/5 border border-white/10 hover:border-[#b90e0a]"
            }`}
          >
            T-SHIRTS
          </button>
        </div>

        {/* Size Chart Table */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 mb-12">
          <h2 className="text-2xl font-black mb-6">
            {selectedType === "hoodie" ? "HOODIE" : "T-SHIRT"} SIZE CHART (inches)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-[#b90e0a]">
                  <th className="text-left p-4 font-black">SIZE</th>
                  <th className="text-left p-4 font-black">BODY CHEST</th>
                  <th className="text-left p-4 font-black">GARMENT CHEST</th>
                  <th className="text-left p-4 font-black">LENGTH</th>
                  <th className="text-left p-4 font-black">SHOULDER</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(SIZE_CHART).map(([size, measurements], index) => (
                  <tr
                    key={size}
                    className={`border-b border-white/10 hover:bg-white/5 transition-colors ${
                      index % 2 === 0 ? "bg-white/[0.02]" : ""
                    }`}
                  >
                    <td className="p-4 font-bold text-[#b90e0a] text-lg">{size}</td>
                    <td className="p-4">{measurements.chest}"</td>
                    <td className="p-4">{measurements.garmentChest}"</td>
                    <td className="p-4">{measurements.length}"</td>
                    <td className="p-4">{measurements.shoulder}"</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* How to Measure Section */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 mb-12">
          <h2 className="text-2xl font-black mb-6">HOW TO MEASURE</h2>
          <div className="space-y-4 text-gray-300">
            <div className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-[#b90e0a] rounded-full flex items-center justify-center font-bold text-sm">
                1
              </span>
              <div>
                <h3 className="font-bold text-white mb-1">Body Chest</h3>
                <p className="text-sm">
                  Measure around the fullest part of your chest, keeping the tape horizontal.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-[#b90e0a] rounded-full flex items-center justify-center font-bold text-sm">
                2
              </span>
              <div>
                <h3 className="font-bold text-white mb-1">Length</h3>
                <p className="text-sm">
                  Measure from the highest point of the shoulder to the bottom hem.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-[#b90e0a] rounded-full flex items-center justify-center font-bold text-sm">
                3
              </span>
              <div>
                <h3 className="font-bold text-white mb-1">Shoulder</h3>
                <p className="text-sm">
                  Measure from shoulder seam to shoulder seam across the back.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Fit Guide */}
        <div className="bg-gradient-to-r from-[#b90e0a]/10 to-transparent border border-[#b90e0a]/30 rounded-2xl p-6 md:p-8">
          <h2 className="text-2xl font-black mb-4">FIT GUIDE</h2>
          <div className="space-y-3 text-gray-300">
            <p>
              <span className="text-white font-bold">• Oversized Fit:</span> Our products are designed
              with an oversized, relaxed fit for maximum comfort and style.
            </p>
            <p>
              <span className="text-white font-bold">• Between Sizes?</span> We recommend sizing down if
              you prefer a more fitted look, or stick with your regular size for the full oversized effect.
            </p>
            <p>
              <span className="text-white font-bold">• Still Unsure?</span> Contact our support team at{" "}
              <a
                href="mailto:support@kallkeyy.com"
                className="text-[#b90e0a] hover:underline no-underline"
              >
                support@kallkeyy.com
              </a>{" "}
              for personalized sizing advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

