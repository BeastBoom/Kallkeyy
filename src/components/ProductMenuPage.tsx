"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Props {
  onSelectProduct: (productId: string) => void
  onBackToMain: () => void
}

const products = [
  {
    id: "hoodie",
    name: "ESSENTIAL HOODIE",
    image: "/product-hoodie.jpg",
    price: "₹2,999",
    tag: "FLAGSHIP",
  },
  {
    id: "tshirt",
    name: "SIGNATURE TEE",
    image: "/hoodie-front.png",
    price: "₹1,499",
    tag: "NEW DROP",
  },
]

export default function ProductMenuPage({ onSelectProduct, onBackToMain }: Props) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleUnavailablePage = (pageName: string) => {
    toast({
      title: "Coming Soon",
      description: `Sorry, the ${pageName} page is not available yet. Stay tuned!`,
      duration: 3000,
    })
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Chain decorations inspired by genrage */}
      <div className="fixed inset-0 pointer-events-none opacity-10">
        {/* Chain links pattern */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float-chain"
            style={{
              top: `${(i * 15) % 100}%`,
              left: `${(i * 20) % 100}%`,
              animationDelay: `${i * 0.3}s`,
            }}
          >
            <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
              <circle cx="15" cy="30" r="12" stroke="white" strokeWidth="2" />
              <circle cx="45" cy="30" r="12" stroke="white" strokeWidth="2" />
              <line x1="27" y1="30" x2="33" y2="30" stroke="white" strokeWidth="2" />
            </svg>
          </div>
        ))}

        {/* Diagonal lines */}
        <div className="absolute top-0 left-0 w-full h-full">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute h-px bg-white/5"
              style={{
                top: `${i * 8}%`,
                left: 0,
                right: 0,
                transform: `rotate(${i * 3}deg)`,
              }}
            />
          ))}
        </div>
      </div>

      <nav className="relative z-20 border-b border-white/10 bg-black/90 backdrop-blur-md sticky top-0">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            {/* Left side - Logo and text */}
            <div className="flex items-center gap-4">
              <h1 className="text-4xl font-black tracking-widest hover:text-[#DD0004] transition-colors duration-300 cursor-pointer">
                KALLKEYY
              </h1>
            </div>

            {/* Right side - Menu links (bigger buttons) */}
            <div className="hidden md:flex gap-6 text-lg font-bold">
              <button
                onClick={() => onBackToMain()}
                className="hover:text-[#DD0004] transition-colors duration-300 px-6 py-3 hover:bg-white/5 rounded-lg"
              >
                HOME
              </button>
              <button
                onClick={() => handleUnavailablePage("Shop")}
                className="hover:text-[#DD0004] transition-colors duration-300 px-6 py-3 hover:bg-white/5 rounded-lg"
              >
                SHOP
              </button>
              <button
                onClick={() => handleUnavailablePage("About")}
                className="hover:text-[#DD0004] transition-colors duration-300 px-6 py-3 hover:bg-white/5 rounded-lg"
              >
                ABOUT
              </button>
              <button
                onClick={() => handleUnavailablePage("Contact")}
                className="hover:text-[#DD0004] transition-colors duration-300 px-6 py-3 hover:bg-white/5 rounded-lg"
              >
                CONTACT
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden text-white hover:text-[#DD0004] transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={32} /> : <Menu size={32} />}
            </button>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-6 pb-4 space-y-4 text-lg font-bold border-t border-white/10 pt-4">
              <button
                onClick={() => {
                  onBackToMain()
                  setMobileMenuOpen(false)
                }}
                className="block w-full text-left hover:text-[#DD0004] transition-colors duration-300 px-4 py-3 hover:bg-white/5 rounded-lg"
              >
                HOME
              </button>
              <button
                onClick={() => {
                  handleUnavailablePage("Shop")
                  setMobileMenuOpen(false)
                }}
                className="block w-full text-left hover:text-[#DD0004] transition-colors duration-300 px-4 py-3 hover:bg-white/5 rounded-lg"
              >
                SHOP
              </button>
              <button
                onClick={() => {
                  handleUnavailablePage("About")
                  setMobileMenuOpen(false)
                }}
                className="block w-full text-left hover:text-[#DD0004] transition-colors duration-300 px-4 py-3 hover:bg-white/5 rounded-lg"
              >
                ABOUT
              </button>
              <button
                onClick={() => {
                  handleUnavailablePage("Contact")
                  setMobileMenuOpen(false)
                }}
                className="block w-full text-left hover:text-[#DD0004] transition-colors duration-300 px-4 py-3 hover:bg-white/5 rounded-lg"
              >
                CONTACT
              </button>
            </div>
          )}
        </div>
      </nav>

      <div className="relative z-10 py-6 overflow-hidden border-b border-white/10">
        <div className="flex whitespace-nowrap animate-scroll-faster">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center">
              <span className="text-2xl md:text-4xl font-black text-white/10 mx-4">STREET CULTURE</span>
              <span className="text-2xl md:text-4xl font-black text-[#DD0004]/20 mx-4">★</span>
              <span className="text-2xl md:text-4xl font-black text-white/10 mx-4">AUTHENTIC STYLE</span>
              <span className="text-2xl md:text-4xl font-black text-[#DD0004]/20 mx-4">★</span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-6xl font-black mb-4">
            THE <span className="text-[#DD0004]">COLLECTION</span>
          </h2>
          <div className="w-32 h-1 bg-[#DD0004] mx-auto mb-6" />
          <p className="text-[#808088] text-lg max-w-2xl mx-auto">
            Limited edition pieces crafted for those who dare to stand out. Each design tells a story of rebellion and
            authenticity.
          </p>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-20">
          {products.map((product, index) => (
            <div
              key={product.id}
              className="group relative bg-[#28282B] backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:border-[#DD0004]/50 transition-all duration-500 animate-slide-in-up"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {/* Chain decoration on card */}
              <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-40 transition-opacity duration-300">
                <svg width="40" height="40" viewBox="0 0 60 60" fill="none">
                  <circle cx="15" cy="30" r="12" stroke="#DD0004" strokeWidth="2" />
                  <circle cx="45" cy="30" r="12" stroke="#DD0004" strokeWidth="2" />
                  <line x1="27" y1="30" x2="33" y2="30" stroke="#DD0004" strokeWidth="2" />
                </svg>
              </div>

              {/* Product tag */}
              <div className="absolute top-4 left-4 z-10">
                <span className="bg-[#DD0004] text-white px-3 py-1 text-xs font-bold rounded-full">{product.tag}</span>
              </div>

              {/* Product image */}
              <div className="aspect-square bg-black/40 relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    ;(e.currentTarget as HTMLImageElement).style.opacity = "0"
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-[#DD0004]/0 group-hover:bg-[#DD0004]/10 transition-all duration-500" />
              </div>

              {/* Product info */}
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black group-hover:text-[#DD0004] transition-colors duration-300">
                    {product.name}
                  </h3>
                  <span className="text-xl font-bold text-[#DD0004]">{product.price}</span>
                </div>

                <Button
                  onClick={() => onSelectProduct(product.id)}
                  className="w-full bg-white text-black hover:bg-[#DD0004] hover:text-white font-bold py-4 text-base transition-all duration-300 group-hover:scale-105"
                >
                  VIEW DETAILS →
                </Button>
              </div>

              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-[#DD0004]/30 group-hover:border-[#DD0004] transition-colors duration-300" />
              <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-[#DD0004]/30 group-hover:border-[#DD0004] transition-colors duration-300" />
            </div>
          ))}
        </div>

        {/* Brand Story Section */}
        <div className="max-w-5xl mx-auto mb-20 bg-[#28282B] rounded-2xl p-12 border border-white/10">
          <div className="text-center mb-8">
            <h3 className="text-3xl md:text-4xl font-black mb-4">
              OUR <span className="text-[#DD0004]">STORY</span>
            </h3>
            <div className="w-24 h-1 bg-[#DD0004] mx-auto mb-6" />
          </div>
          <p className="text-[#808088] text-lg leading-relaxed mb-6 text-center max-w-3xl mx-auto">
            KALLKEYY was born from the streets, inspired by the raw energy of urban culture. We create pieces that speak
            to those who refuse to blend in, who wear their identity with pride.
          </p>
          <p className="text-white/60 text-base leading-relaxed text-center max-w-3xl mx-auto">
            Every stitch, every design choice is intentional. We're not just making clothes – we're crafting statements,
            building a movement, and redefining what streetwear means.
          </p>
        </div>

        {/* Social Media Section */}
        <div className="max-w-5xl mx-auto mb-20">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-black mb-4">
              FOLLOW <span className="text-[#DD0004]">OUR JOURNEY</span>
            </h3>
            <div className="w-24 h-1 bg-[#DD0004] mx-auto mb-4" />
            <p className="text-[#808088]">Check out our latest drops and behind-the-scenes content</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-[#28282B] rounded-xl overflow-hidden border border-white/10 hover:border-[#DD0004]/30 transition-all duration-300 hover:scale-105 cursor-pointer group"
                onClick={() => handleUnavailablePage("Instagram Reel")}
              >
                <div className="aspect-[9/16] bg-black/40 flex items-center justify-center relative overflow-hidden">
                  {/* Placeholder for Instagram reel embed */}
                  <div className="text-6xl opacity-20 group-hover:opacity-40 transition-opacity duration-300">📱</div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-white font-bold text-sm">Instagram Reel #{i}</p>
                    <p className="text-white/60 text-xs">Tap to view on Instagram</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button
              onClick={() => handleUnavailablePage("Instagram")}
              className="bg-[#DD0004] hover:bg-[#DD0004]/80 text-white font-bold px-8 py-3 transition-all duration-300 hover:scale-105"
            >
              VIEW MORE ON INSTAGRAM →
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-5xl mx-auto mb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: "🔥", title: "PREMIUM QUALITY", desc: "Only the finest materials" },
              { icon: "⚡", title: "LIMITED DROPS", desc: "Exclusive releases" },
              { icon: "🌟", title: "AUTHENTIC DESIGN", desc: "True street culture" },
            ].map((item, i) => (
              <div
                key={i}
                className="text-center p-8 bg-[#28282B] rounded-xl border border-white/10 hover:border-[#DD0004]/30 transition-all duration-300"
              >
                <div className="text-5xl mb-4">{item.icon}</div>
                <h4 className="text-lg font-bold mb-2">{item.title}</h4>
                <p className="text-[#808088] text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="max-w-3xl mx-auto mb-20 bg-gradient-to-r from-[#28282B] to-[#1a1a1c] rounded-2xl p-12 border border-[#DD0004]/20">
          <div className="text-center">
            <h3 className="text-3xl font-black mb-4">STAY IN THE LOOP</h3>
            <p className="text-[#808088] mb-8">Get early access to new drops and exclusive offers</p>
            <div className="flex gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 bg-black/40 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:border-[#DD0004] focus:outline-none"
              />
              <Button className="bg-[#DD0004] hover:bg-[#DD0004]/80 text-white font-bold px-8">SUBSCRIBE</Button>
            </div>
          </div>
        </div>

        {/* Bottom scrolling text */}
        <div className="mt-24 overflow-hidden">
          <div className="flex whitespace-nowrap animate-scroll-faster-reverse">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex items-center">
                <span className="text-2xl md:text-4xl font-black text-[#808088]/20 mx-4">LIMITED EDITION</span>
                <span className="text-2xl md:text-4xl font-black text-[#DD0004]/30 mx-4">◆</span>
                <span className="text-2xl md:text-4xl font-black text-[#808088]/20 mx-4">EXCLUSIVE DROP</span>
                <span className="text-2xl md:text-4xl font-black text-[#DD0004]/30 mx-4">◆</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer className="relative z-10 border-t border-white/10 bg-black py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2 animate-fade-in-up">
              <h3 className="text-3xl font-black mb-4">KALLKEYY</h3>
              <p className="text-[#808088] mb-4 max-w-md">
                Authentic streetwear for the next generation. Born from the underground, crafted for tomorrow.
              </p>
              <div className="flex space-x-4">
                {["IG", "TW", "FB"].map((social, i) => (
                  <div
                    key={social}
                    onClick={() => handleUnavailablePage(social)}
                    className="w-10 h-10 bg-[#28282B] rounded-full flex items-center justify-center hover:bg-[#DD0004] transition-all duration-300 cursor-pointer hover:scale-110 hover:rotate-12 animate-bounce-in"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    {social}
                  </div>
                ))}
              </div>
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              <h4 className="text-lg font-bold mb-4">QUICK LINKS</h4>
              <ul className="space-y-2 text-[#808088]">
                {["About Us", "Size Guide", "Shipping", "Returns"].map((link) => (
                  <li
                    key={link}
                    onClick={() => handleUnavailablePage(link)}
                    className="hover:text-white cursor-pointer hover:translate-x-2 transition-all duration-300"
                  >
                    {link}
                  </li>
                ))}
              </ul>
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
              <h4 className="text-lg font-bold mb-4">SUPPORT</h4>
              <ul className="space-y-2 text-[#808088]">
                {["Contact", "FAQ", "Track Order", "Help"].map((link) => (
                  <li
                    key={link}
                    onClick={() => handleUnavailablePage(link)}
                    className="hover:text-white cursor-pointer hover:translate-x-2 transition-all duration-300"
                  >
                    {link}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div
            className="border-t border-[#808088]/20 mt-8 pt-8 text-center text-[#808088] animate-fade-in-up"
            style={{ animationDelay: "0.6s" }}
          >
            <p>&copy; 2025 KALLKEYY. All rights reserved. Made with passion for street culture.</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes scroll-faster {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        @keyframes scroll-faster-reverse {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0);
          }
        }

        @keyframes float-chain {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(10deg);
          }
        }

        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-in-up {
          0% {
            opacity: 0;
            transform: translateY(50px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce-in {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-scroll-faster {
          animation: scroll-faster 10s linear infinite;
        }
        .animate-scroll-faster-reverse {
          animation: scroll-faster-reverse 10s linear infinite;
        }
        .animate-float-chain {
          animation: float-chain 4s ease-in-out infinite;
        }
        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out forwards;
        }
        .animate-slide-in-up {
          animation: slide-in-up 0.8s ease-out forwards;
        }
        .animate-bounce-in {
          animation: bounce-in 1s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
