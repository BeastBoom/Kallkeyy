"use client";

import { useState } from "react";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  onBackToMain: () => void;
  skipAnimations?: boolean;
}

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

export default function FAQPage({ onBackToMain, skipAnimations = false }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const faqs: FAQItem[] = [
    {
      category: "Orders",
      question: "How do I place an order?",
      answer: "Browse our collection, select your desired product and size, add it to cart, and proceed to checkout. You'll need to create an account or log in to complete your purchase."
    },
    {
      category: "Orders",
      question: "Can I modify or cancel my order after placing it?",
      answer: "Orders can be modified or cancelled within 1 hour of placement. After that, the order enters processing and cannot be changed. Contact us immediately at support@kallkeyy.com if you need to make changes."
    },
    {
      category: "Orders",
      question: "What payment methods do you accept?",
      answer: "We accept all major payment methods including Credit/Debit Cards, UPI, Net Banking, and popular digital wallets through our secure payment gateway."
    },
    {
      category: "Shipping",
      question: "How long does shipping take?",
      answer: "We process orders within 1-2 business days, and delivery typically takes 5-7 business days across India. You'll receive tracking information once your order is shipped."
    },
    {
      category: "Shipping",
      question: "Do you offer international shipping?",
      answer: "Currently, we only ship within India. We're working on expanding to international markets soon!"
    },
    {
      category: "Shipping",
      question: "How can I track my order?",
      answer: "Once shipped, you'll receive tracking details via email and WhatsApp. You can also track your order in the Orders section of your account."
    },
    {
      category: "Shipping",
      question: "What if my package is lost or damaged?",
      answer: "If your package is lost or arrives damaged, please contact us immediately at support@kallkeyy.com with your order details and photos (if damaged). We'll resolve the issue promptly."
    },
    {
      category: "Returns",
      question: "What is your return policy?",
      answer: "We accept returns within 3 days of delivery. Items must be unworn, unwashed, with original tags and packaging intact. Initiate a return request from your Orders page."
    },
    {
      category: "Returns",
      question: "How long does it take to process a refund?",
      answer: "Once we receive and inspect your returned item, refunds are processed within 5-7 business days to your original payment method."
    },
    {
      category: "Returns",
      question: "Do you offer exchanges?",
      answer: "We currently don't offer direct exchanges. Please return the item for a refund and place a new order for the size/product you want."
    },
    {
      category: "Returns",
      question: "Who pays for return shipping?",
      answer: "Return shipping is free for defective items or wrong products. For other returns, shipping charges may apply based on your location and reason for return."
    },
    {
      category: "Products",
      question: "What sizes do you offer?",
      answer: "We offer sizes M, L, XL, and XXL. Check our Size Guide page for detailed measurements to find your perfect fit."
    },
    {
      category: "Products",
      question: "How do your products fit?",
      answer: "Our products feature an oversized, relaxed fit. If you prefer a more fitted look, consider sizing down. Check the Size Guide for detailed measurements."
    },
    {
      category: "Products",
      question: "What materials are your products made from?",
      answer: "We use premium materials including 100% cotton and high-quality cotton blends. Each product page lists specific material details and care instructions."
    },
    {
      category: "Products",
      question: "Are your products pre-shrunk?",
      answer: "Yes, our products are pre-washed to minimize shrinkage. Follow the care instructions to maintain the quality and fit."
    },
    {
      category: "Products",
      question: "Will there be restocks of sold-out items?",
      answer: "We restock popular items based on demand. Follow us on Instagram @kall.keyy for restock announcements and new drop alerts."
    },
    {
      category: "Account",
      question: "How do I create an account?",
      answer: "Click on 'Sign Up' in the navigation menu, provide your details, and verify your email/phone. You'll need an account to place orders and track them."
    },
    {
      category: "Account",
      question: "I forgot my password. How can I reset it?",
      answer: "Click on 'Forgot Password' on the login page, enter your registered email, and follow the instructions sent to your inbox to reset your password."
    },
    {
      category: "Account",
      question: "Can I change my account details?",
      answer: "Currently, account detail changes require contacting our support team at support@kallkeyy.com. We're working on adding self-service account management features."
    },
    {
      category: "General",
      question: "Do you have a physical store?",
      answer: "We are currently an online-only brand. This allows us to offer premium quality streetwear at better prices."
    },
    {
      category: "General",
      question: "How can I stay updated on new drops?",
      answer: "Follow us on Instagram @kall.keyy and subscribe to our newsletter for exclusive early access to new collections and special offers."
    },
    {
      category: "General",
      question: "Do you offer gift cards?",
      answer: "Gift cards are coming soon! Stay tuned to our social media for announcements."
    }
  ];

  const categories = ["All", ...Array.from(new Set(faqs.map(faq => faq.category)))];

  const filteredFAQs = selectedCategory === "All" 
    ? faqs 
    : faqs.filter(faq => faq.category === selectedCategory);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

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
            <span className="text-[#b90e0a]">FAQ</span>
          </h1>
          <div className="w-20 h-1 bg-[#b90e0a] mx-auto mb-6"></div>
          <p className="text-gray-400 text-lg">
            Got questions? We've got answers.
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8 flex flex-wrap justify-center gap-3">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-lg font-bold transition-all duration-300 ${
                selectedCategory === category
                  ? "bg-[#b90e0a] text-white scale-105"
                  : "bg-white/5 border border-white/10 hover:border-[#b90e0a]"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {filteredFAQs.map((faq, index) => (
            <div
              key={index}
              className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-[#b90e0a] transition-all duration-300"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full p-6 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
              >
                <div className="flex-1 pr-4">
                  <span className="text-xs text-[#b90e0a] font-bold mb-2 block">
                    {faq.category}
                  </span>
                  <h3 className="text-lg font-bold text-white">
                    {faq.question}
                  </h3>
                </div>
                <div className="flex-shrink-0">
                  {openIndex === index ? (
                    <ChevronUp className="w-6 h-6 text-[#b90e0a]" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-gray-400" />
                  )}
                </div>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? "max-h-96" : "max-h-0"
                }`}
              >
                <div className="p-6 pt-0 text-gray-300 leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-12 bg-gradient-to-r from-[#b90e0a]/10 to-transparent border border-[#b90e0a]/30 rounded-2xl p-8 text-center">
          <h2 className="text-2xl md:text-3xl font-black mb-4 font-akira">
            STILL HAVE QUESTIONS?
          </h2>
          <p className="text-gray-300 mb-6">
            Can't find what you're looking for? Our support team is here to help!
          </p>
          <a
            href="mailto:support@kallkeyy.com"
            className="inline-block bg-[#b90e0a] hover:bg-[#8a0a07] text-white font-bold px-8 py-3 rounded-lg transition-all duration-300 hover:scale-105 no-underline"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}

