"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Menu, X, LogOut } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface Props {
  onBackToMain: () => void;
  onNavigateToShop?: () => void;
  onNavigateToAbout?: () => void;
  onNavigateToContact?: () => void;
  onNavigateToOrders?: () => void;
  onNavigateToLogin: () => void;
  onNavigateToSignup: () => void;
  skipAnimations?: boolean;
}

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

export default function FAQPage({
  onBackToMain,
  onNavigateToShop,
  onNavigateToAbout,
  onNavigateToContact,
  onNavigateToOrders,
  onNavigateToLogin,
  onNavigateToSignup,
  skipAnimations = false,
}: Props) {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const handleUnavailablePage = (pageName: string) => {
    toast({
      title: "Under Development",
      description: `The ${pageName} page is currently being developed. Check back soon!`,
      duration: 3000,
    });
  };

  const formatDisplayName = (fullName: string): string => {
    if (!fullName) return "";
    const nameParts = fullName.trim().split(/\s+/);
    return nameParts[0].toUpperCase();
  };

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
    <div className={`min-h-screen bg-gradient-to-b from-[#f8f8f8] via-[#f0f0f0] to-[#e8e8e8] text-black ${skipAnimations ? '[&_*]:!animate-none' : ''}`}>
      {/* Announcement Bar */}
      <div className="bg-[#333333] text-white text-center py-1.5 px-4 text-[10px] sm:text-xs font-bold tracking-widest uppercase z-[60] relative">
        Free Shipping on all pan-India orders · Code <span className="text-[#4CAF50]">KALLKEYY100</span> for 10% Off
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/95 backdrop-blur-md text-white">
        <div className="w-full px-5 sm:px-8 lg:px-24 py-3 lg:py-4">
          <div className="flex items-center justify-between max-w-[1600px] mx-auto">
            <div className="flex-shrink-0 z-10">
              <h1
                className="text-xl sm:text-2xl lg:text-3xl font-black tracking-wider hover:text-[#b90e0a] transition-colors duration-300 cursor-pointer font-akira"
                onClick={onBackToMain}
              >
                KALLKEYY
              </h1>
            </div>

            <div className="hidden lg:flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2">
              <button onClick={onBackToMain} className="text-sm font-bold tracking-wide hover:text-[#b90e0a] transition-colors duration-300 uppercase">Home</button>
              <button onClick={() => onNavigateToShop ? onNavigateToShop() : handleUnavailablePage("Shop")} className="text-sm font-bold tracking-wide hover:text-[#b90e0a] transition-colors duration-300 uppercase">Shop</button>
              {user && <button onClick={() => onNavigateToOrders ? onNavigateToOrders() : handleUnavailablePage("Orders")} className="text-sm font-bold tracking-wide hover:text-[#b90e0a] transition-colors duration-300 uppercase">Orders</button>}
              <button onClick={() => onNavigateToAbout ? onNavigateToAbout() : handleUnavailablePage("About")} className="text-sm font-bold tracking-wide hover:text-[#b90e0a] transition-colors duration-300 uppercase">About</button>
              <button onClick={() => onNavigateToContact ? onNavigateToContact() : handleUnavailablePage("Contact")} className="text-sm font-bold tracking-wide hover:text-[#b90e0a] transition-colors duration-300 uppercase">Contact</button>
            </div>

            <div className="flex items-center gap-3 z-10">
              <div className="hidden lg:flex items-center gap-6">
                {user ? (
                  <>
                    <span className="text-white text-base font-medium">Hey, <span className="text-[#b90e0a] font-bold">{formatDisplayName(user.name)}</span></span>
                    <button onClick={logout} className="text-white hover:text-[#b90e0a] transition-colors duration-300 flex items-center gap-2 text-base font-medium">
                      <LogOut size={18} /><span>Logout</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={onNavigateToLogin} className="text-white hover:text-[#b90e0a] transition-colors duration-300 text-base font-bold">Login</button>
                    <button onClick={onNavigateToSignup} className="bg-[#b90e0a] hover:bg-[#8a0a08] transition-colors duration-300 px-5 py-2.5 rounded-full text-base font-bold text-white">Sign Up</button>
                  </>
                )}
              </div>
              <button className="lg:hidden text-white hover:text-[#b90e0a] transition-colors p-1.5" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[100] animate-fadeIn">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative h-full flex flex-col pt-16 px-5 pb-6 overflow-y-auto">
            <button className="absolute top-4 right-4 text-white hover:text-[#b90e0a] transition-colors p-1.5" onClick={() => setMobileMenuOpen(false)}><X size={24} /></button>
            <div className="space-y-1">
              <button onClick={() => { onBackToMain(); setMobileMenuOpen(false); }} className="block w-full text-left text-white hover:text-[#b90e0a] transition-colors duration-300 px-3 py-3 hover:bg-white/5 rounded-lg text-base font-bold">Home</button>
              <button onClick={() => { onNavigateToShop?.(); setMobileMenuOpen(false); }} className="block w-full text-left text-white hover:text-[#b90e0a] transition-colors duration-300 px-3 py-3 hover:bg-white/5 rounded-lg text-base font-bold">Shop</button>
              {user && <button onClick={() => { onNavigateToOrders?.(); setMobileMenuOpen(false); }} className="block w-full text-left text-white hover:text-[#b90e0a] transition-colors duration-300 px-3 py-3 hover:bg-white/5 rounded-lg text-base font-bold">Orders</button>}
              <button onClick={() => { onNavigateToAbout?.(); setMobileMenuOpen(false); }} className="block w-full text-left text-white hover:text-[#b90e0a] transition-colors duration-300 px-3 py-3 hover:bg-white/5 rounded-lg text-base font-bold">About</button>
              <button onClick={() => { onNavigateToContact?.(); setMobileMenuOpen(false); }} className="block w-full text-left text-white hover:text-[#b90e0a] transition-colors duration-300 px-3 py-3 hover:bg-white/5 rounded-lg text-base font-bold">Contact</button>
            </div>
            <div className="border-t border-white/20 pt-4 mt-4">
              {user ? (
                <>
                  <div className="text-white px-3 py-2 mb-1 text-sm font-medium">Hey, <span className="text-[#b90e0a] font-bold">{formatDisplayName(user.name)}</span></div>
                  <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="block w-full text-left text-white hover:text-[#b90e0a] transition-colors duration-300 px-3 py-3 hover:bg-white/5 rounded-lg flex items-center gap-2 text-base font-bold"><LogOut size={18} />Logout</button>
                </>
              ) : (
                <div className="space-y-2 px-3">
                  <button onClick={() => { onNavigateToLogin(); setMobileMenuOpen(false); }} className="block w-full text-center text-white hover:text-[#b90e0a] transition-colors duration-300 py-3 border border-white/20 rounded-full text-sm font-bold">Login</button>
                  <button onClick={() => { onNavigateToSignup(); setMobileMenuOpen(false); }} className="w-full bg-[#b90e0a] hover:bg-[#8a0a08] transition-colors duration-300 py-3 rounded-full text-center text-sm font-bold text-white">Sign Up</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <button onClick={onBackToMain} className="hover:text-[#b90e0a] transition-colors">Home</button>
          <span>/</span>
          <span className="text-[#b90e0a] font-medium">FAQ</span>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black mb-4 font-akira text-[#0a0a0a]">
            <span className="text-[#b90e0a]">FAQ</span>
          </h1>
          <div className="w-20 h-1 bg-[#b90e0a] mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Got questions? We've got answers.</p>
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
                  : "bg-white border border-black/10 hover:border-[#b90e0a] text-[#0a0a0a]"
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
              className="bg-white border border-black/5 rounded-xl overflow-hidden hover:border-[#b90e0a]/30 transition-all duration-300 shadow-sm"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full p-6 flex items-center justify-between text-left hover:bg-[#fafafa] transition-colors"
              >
                <div className="flex-1 pr-4">
                  <span className="text-xs text-[#b90e0a] font-bold mb-2 block">{faq.category}</span>
                  <h3 className="text-lg font-bold text-[#0a0a0a]">{faq.question}</h3>
                </div>
                <div className="flex-shrink-0">
                  {openIndex === index ? (
                    <ChevronUp className="w-6 h-6 text-[#b90e0a]" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-gray-400" />
                  )}
                </div>
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${openIndex === index ? "max-h-96" : "max-h-0"}`}>
                <div className="p-6 pt-0 text-gray-600 leading-relaxed">{faq.answer}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-12 bg-white border border-black/5 rounded-2xl p-8 text-center shadow-sm">
          <h2 className="text-2xl md:text-3xl font-black mb-4 font-akira text-[#0a0a0a]">STILL HAVE QUESTIONS?</h2>
          <p className="text-gray-600 mb-6">Can't find what you're looking for? Our support team is here to help!</p>
          <a href="mailto:support@kallkeyy.com" className="inline-block bg-[#b90e0a] hover:bg-[#8a0a08] text-white font-bold px-8 py-3 rounded-full transition-all duration-300 hover:scale-105 no-underline">
            Contact Support
          </a>
        </div>
      </div>

    </div>
  );
}
