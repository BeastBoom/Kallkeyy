import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface Props {
  onViewProduct: () => void;
}

export default function MainBrandPage({ onViewProduct }: Props) {
  const [isVisible, setIsVisible] = useState({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({
              ...prev,
              [entry.target.id]: true,
            }));
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('[id^="animate-"]');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        {/* Floating polygons */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float-slow"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${8 + Math.random() * 4}s`,
            }}
          >
            <div className="w-8 h-8 border-2 border-white/10 transform rotate-45" />
          </div>
        ))}

        {/* Moving lines */}
        <div className="absolute top-1/4 w-full h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent animate-slide-horizontal" />
        <div className="absolute bottom-1/3 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent animate-slide-horizontal-reverse" />

        {/* Corner decorations */}
        <svg className="absolute top-10 left-10 w-32 h-32 animate-pulse" viewBox="0 0 100 100">
          <polygon points="50,5 75,25 75,75 25,75 25,25" stroke="white" strokeWidth="1" fill="none" opacity="0.1" />
          <circle cx="50" cy="50" r="20" stroke="orange" strokeWidth="1" fill="none" opacity="0.2" />
        </svg>

        <svg className="absolute top-10 right-10 w-24 h-24 animate-spin-slow" viewBox="0 0 100 100">
          <rect x="25" y="25" width="50" height="50" stroke="white" strokeWidth="1" fill="none" opacity="0.1" transform="rotate(45 50 50)" />
        </svg>

        <svg className="absolute bottom-10 left-10 w-40 h-40 animate-bounce-slow" viewBox="0 0 100 100">
          <path d="M20,80 Q50,20 80,80" stroke="orange" strokeWidth="2" fill="none" opacity="0.2" />
        </svg>

        <svg className="absolute bottom-10 right-10 w-28 h-28 animate-pulse" viewBox="0 0 100 100">
          <polygon points="50,10 90,90 10,90" stroke="white" strokeWidth="1" fill="none" opacity="0.1" />
        </svg>
      </div>

      {/* Hero Section */}
      <section id="animate-hero" className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 w-20 h-20 border-2 border-orange-500 rotate-45 animate-pulse-glow"></div>
          <div className="absolute top-20 right-20 w-16 h-16 border border-white rotate-12 animate-float"></div>
          <div className="absolute bottom-20 left-20 w-12 h-12 bg-orange-500 rotate-45 animate-bounce-subtle"></div>
          <div className="absolute bottom-10 right-10 w-24 h-24 border-2 border-white rotate-12 animate-spin-slow"></div>
          <div className="absolute top-1/2 left-1/4 w-8 h-8 bg-white rotate-45 animate-pulse-glow"></div>
          <div className="absolute top-1/3 right-1/3 w-14 h-14 border border-orange-500 rotate-45 animate-float"></div>
        </div>
        
        <div className={`text-center relative z-10 max-w-4xl transition-all duration-1000 ${isVisible['animate-hero'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 tracking-tight">
            BORN FROM THE
            <span className="text-orange-500 block animate-color-pulse">UNDERGROUND</span>
          </h1>
          <div className="w-32 h-1 bg-orange-500 mx-auto mb-8 animate-expand-width"></div>
          <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-in-delayed">
            KALLKEYY redefines streetwear with authentic design, premium materials, and unapologetic style. 
            This is more than clothing—this is culture.
          </p>
          <Button
            onClick={onViewProduct}
            className="bg-orange-500 hover:bg-orange-600 text-black font-bold px-12 py-4 text-xl shadow-2xl hover:shadow-orange-500/20 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 animate-bounce-in"
          >
            SHOP THE DROP
          </Button>
        </div>
      </section>

      {/* About Section */}
      <section id="animate-about" className="py-20 px-4 relative">
        {/* Background decorations */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-1/4 w-32 h-32 border border-orange-500/30 rotate-45 animate-spin-very-slow"></div>
          <div className="absolute bottom-20 right-1/4 w-24 h-24 border border-white/20 rotate-12 animate-float-slow"></div>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center transition-all duration-1000 ${isVisible['animate-about'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
            <div className="space-y-6 animate-slide-in-left">
              <h2 className="text-4xl md:text-5xl font-black mb-6">OUR STORY</h2>
              <div className="w-20 h-1 bg-orange-500 mb-6 animate-expand-width"></div>
              <p className="text-lg text-gray-300 mb-6 leading-relaxed animate-fade-in-up">
                Founded in the heart of urban culture, KALLKEYY emerged from the streets with a vision to 
                create authentic streetwear that speaks to the soul of every individual who dares to be different.
              </p>
              <p className="text-lg text-gray-300 mb-8 leading-relaxed animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                Every piece is crafted with meticulous attention to detail, using premium materials and 
                cutting-edge design techniques that honor both tradition and innovation.
              </p>
              <Button
                onClick={onViewProduct}
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-black transition-all duration-300 px-8 py-3 hover:scale-105 hover:shadow-lg animate-bounce-in"
                style={{animationDelay: '0.4s'}}
              >
                EXPLORE COLLECTION
              </Button>
            </div>
            <div className="relative animate-slide-in-right">
              <div className="aspect-square bg-gray-800 rounded-lg shadow-2xl relative overflow-hidden group hover:scale-105 transition-transform duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-transparent"></div>
                <div className="absolute bottom-4 left-4 text-2xl font-black group-hover:text-orange-500 transition-colors duration-300">KALLKEYY</div>
                {/* Placeholder for image - you can replace with actual image */}
                <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-30">🔥</div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-orange-500 rotate-45 opacity-80 animate-bounce-subtle"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section id="animate-values" className="py-20 px-4 bg-gray-900 relative overflow-hidden">
        {/* Animated background patterns */}
        <div className="absolute inset-0 opacity-5">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white animate-twinkle"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            />
          ))}
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <h2 className={`text-4xl md:text-5xl font-black text-center mb-16 transition-all duration-1000 ${isVisible['animate-values'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
            WHAT WE STAND FOR
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "AUTHENTICITY",
                desc: "Real designs for real people. No compromise on genuine street culture and artistic expression.",
                icon: "🔥",
                delay: "0s"
              },
              {
                title: "QUALITY",
                desc: "Premium materials meet expert craftsmanship. Every stitch tells a story of excellence.",
                icon: "⚡",
                delay: "0.2s"
              },
              {
                title: "COMMUNITY",
                desc: "Building a movement of individuals who express themselves through bold, fearless fashion.",
                icon: "🌟",
                delay: "0.4s"
              }
            ].map((item, i) => (
              <div 
                key={i} 
                className={`bg-black p-8 rounded-lg shadow-xl border-l-4 border-orange-500 hover:transform hover:scale-105 transition-all duration-500 hover:shadow-2xl hover:shadow-orange-500/10 group ${isVisible['animate-values'] ? 'animate-bounce-in' : 'opacity-0'}`}
                style={{animationDelay: item.delay}}
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{item.icon}</div>
                <h3 className="text-2xl font-bold mb-4 text-orange-500 group-hover:glow transition-all duration-300">{item.title}</h3>
                <p className="text-gray-300 leading-relaxed group-hover:text-white transition-colors duration-300">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section id="animate-process" className="py-20 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center transition-all duration-1000 ${isVisible['animate-process'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
            <div className="relative order-2 lg:order-1 animate-slide-in-left">
              <div className="aspect-video bg-gray-800 rounded-lg shadow-2xl relative overflow-hidden group hover:scale-105 transition-transform duration-300">
                <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/30 to-transparent"></div>
                <div className="absolute bottom-4 right-4 text-xl font-bold group-hover:text-orange-500 transition-colors duration-300">CRAFTSMANSHIP</div>
                {/* Placeholder for image */}
                <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-30">✂️</div>
              </div>
              <div className="absolute -top-4 -left-4 w-16 h-16 border-2 border-orange-500 rotate-45 animate-spin-slow"></div>
            </div>
            <div className="order-1 lg:order-2 animate-slide-in-right">
              <h2 className="text-4xl md:text-5xl font-black mb-6">DESIGN PROCESS</h2>
              <div className="w-20 h-1 bg-orange-500 mb-6 animate-expand-width"></div>
              <p className="text-lg text-gray-300 mb-6 leading-relaxed animate-fade-in-up">
                From concept sketches to final production, every KALLKEYY piece undergoes rigorous 
                design iterations and quality checks to ensure it meets our uncompromising standards.
              </p>
              <div className="space-y-4 mb-8">
                {["Conceptualization", "Material Selection", "Pattern Making", "Quality Control"].map((step, i) => (
                  <div 
                    key={i} 
                    className="flex items-center space-x-4 animate-slide-in-right hover:translate-x-2 transition-transform duration-300"
                    style={{animationDelay: `${i * 0.1}s`}}
                  >
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-black font-bold hover:scale-110 transition-transform duration-300">
                      {i + 1}
                    </div>
                    <span className="text-lg hover:text-orange-500 transition-colors duration-300">{step}</span>
                  </div>
                ))}
              </div>
              <Button
                onClick={onViewProduct}
                className="bg-white text-black hover:bg-gray-200 font-bold px-8 py-3 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl animate-bounce-in"
                style={{animationDelay: '0.6s'}}
              >
                VIEW FLAGSHIP PIECE
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="animate-cta" className="py-20 px-4 bg-orange-500 text-black relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-20">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-black/10 rounded-full animate-float-random"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        <div className={`max-w-4xl mx-auto text-center relative z-10 transition-all duration-1000 ${isVisible['animate-cta'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
          <h2 className="text-4xl md:text-6xl font-black mb-6 animate-bounce-in">READY TO JOIN THE MOVEMENT?</h2>
          <p className="text-xl md:text-2xl mb-8 font-semibold animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            Limited quantities. Unlimited attitude. Get yours before they're gone.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={onViewProduct}
              className="bg-black text-white hover:bg-gray-800 font-bold px-12 py-4 text-xl shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 animate-bounce-in"
              style={{animationDelay: '0.4s'}}
            >
              SHOP NOW
            </Button>
            <Button
              onClick={onViewProduct}
              variant="outline"
              className="border-black text-black hover:bg-black hover:text-white font-bold px-12 py-4 text-xl transition-all duration-300 hover:scale-105 animate-bounce-in"
              style={{animationDelay: '0.6s'}}
            >
              PRE-ORDER EXCLUSIVE
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-12 px-4 border-t border-gray-800 relative">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2 animate-fade-in-up">
              <h3 className="text-3xl font-black mb-4">KALLKEYY</h3>
              <p className="text-gray-400 mb-4 max-w-md">
                Authentic streetwear for the next generation. Born from the underground, 
                crafted for tomorrow.
              </p>
              <div className="flex space-x-4">
                {['IG', 'TW', 'FB'].map((social, i) => (
                  <div 
                    key={social}
                    className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-500 transition-all duration-300 cursor-pointer hover:scale-110 hover:rotate-12 animate-bounce-in"
                    style={{animationDelay: `${i * 0.1}s`}}
                  >
                    {social}
                  </div>
                ))}
              </div>
            </div>
            <div className="animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              <h4 className="text-lg font-bold mb-4">QUICK LINKS</h4>
              <ul className="space-y-2 text-gray-400">
                {['About Us', 'Size Guide', 'Shipping', 'Returns'].map((link, i) => (
                  <li 
                    key={link}
                    className="hover:text-white cursor-pointer hover:translate-x-2 transition-all duration-300"
                  >
                    {link}
                  </li>
                ))}
              </ul>
            </div>
            <div className="animate-fade-in-up" style={{animationDelay: '0.4s'}}>
              <h4 className="text-lg font-bold mb-4">SUPPORT</h4>
              <ul className="space-y-2 text-gray-400">
                {['Contact', 'FAQ', 'Track Order', 'Help'].map((link, i) => (
                  <li 
                    key={link}
                    className="hover:text-white cursor-pointer hover:translate-x-2 transition-all duration-300"
                  >
                    {link}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 animate-fade-in-up" style={{animationDelay: '0.6s'}}>
            <p>&copy; 2025 KALLKEYY. All rights reserved. Made with passion for street culture.</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(180deg); }
        }

        @keyframes slide-horizontal {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        @keyframes slide-horizontal-reverse {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }

        @keyframes color-pulse {
          0%, 100% { color: rgb(249, 115, 22); }
          50% { color: rgb(255, 165, 0); }
        }

        @keyframes expand-width {
          0% { width: 0; }
          100% { width: 8rem; }
        }

        @keyframes bounce-in {
          0% { opacity: 0; transform: scale(0.3); }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
        }

        @keyframes fade-in-delayed {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes slide-in-left {
          0% { opacity: 0; transform: translateX(-50px); }
          100% { opacity: 1; transform: translateX(0); }
        }

        @keyframes slide-in-right {
          0% { opacity: 0; transform: translateX(50px); }
          100% { opacity: 1; transform: translateX(0); }
        }

        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes spin-very-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 5px rgba(249, 115, 22, 0.5); }
          50% { box-shadow: 0 0 20px rgba(249, 115, 22, 0.8), 0 0 30px rgba(249, 115, 22, 0.3); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }

        @keyframes float-random {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-10px) rotate(90deg); }
          50% { transform: translateY(-5px) rotate(180deg); }
          75% { transform: translateY(-15px) rotate(270deg); }
        }

        .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
        .animate-slide-horizontal { animation: slide-horizontal 12s linear infinite; }
        .animate-slide-horizontal-reverse { animation: slide-horizontal-reverse 15s linear infinite; }
        
        .animate-color-pulse { animation: color-pulse 3s ease-in-out infinite; }
        .animate-expand-width { animation: expand-width 1.2s ease-out forwards; }
        .animate-bounce-in { animation: bounce-in 1s ease-out forwards; }
        .animate-fade-in-delayed { animation: fade-in-delayed 1s ease-out forwards 0.8s; }
        .animate-slide-in-left { animation: slide-in-left 1s ease-out forwards; }
        .animate-slide-in-right { animation: slide-in-right 1s ease-out forwards; }
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
        .animate-spin-very-slow { animation: spin-very-slow 20s linear infinite; }
        .animate-bounce-slow { animation: bounce-slow 4s ease-in-out infinite; }
        .animate-bounce-subtle { animation: bounce-subtle 3s ease-in-out infinite; }
        
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-twinkle { animation: twinkle 2s ease-in-out infinite; }
        .animate-float-random { animation: float-random 4s ease-in-out infinite; }
      `}</style>
    </div>
  );
}