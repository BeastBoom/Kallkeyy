"use client"

import { useEffect, useState } from "react"

interface PreloaderProps {
  onComplete: () => void
}

const TAGLINES = ["Streetwear Reimagined", "Comfort Meets Style", "Urban Expression", "Coming Soon"]

export default function Preloader({ onComplete }: PreloaderProps) {
  const [idx, setIdx] = useState(0)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    const rotate = setInterval(() => setIdx((p) => (p + 1) % TAGLINES.length), 800)

    const timer = setTimeout(() => {
      clearInterval(rotate)
      setFadeOut(true)
      setTimeout(onComplete, 800)
    }, 3200)

    return () => {
      clearInterval(rotate)
      clearTimeout(timer)
    }
  }, [onComplete])

  return (
    <div
      className={`fixed inset-0 z-50 bg-black flex items-center justify-center transition-all duration-800 ${fadeOut ? "opacity-0 scale-110" : "opacity-100 scale-100"}`}
    >
      {/* Animated sunray circles - Changed from orange to red */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full border-2 border-[#DD0004]/20"
            style={{
              width: `${300 + i * 150}px`,
              height: `${300 + i * 150}px`,
              top: "50%",
              left: "50%",
              transform: `translate(-50%, -50%) rotate(${i * 45}deg)`,
              animation: `sunray ${3 + i * 0.5}s linear infinite`,
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}

        {/* Floating circles */}
        {[...Array(12)].map((_, i) => (
          <div
            key={`circle-${i}`}
            className="absolute rounded-full bg-white/5 animate-pulse"
            style={{
              width: `${20 + Math.random() * 40}px`,
              height: `${20 + Math.random() * 40}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Central pulse ring - Changed from orange to red */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-96 h-96 rounded-full border border-[#DD0004]/30 animate-ping" />
        <div
          className="absolute w-64 h-64 rounded-full border border-[#DD0004]/50 animate-ping"
          style={{ animationDelay: "0.5s" }}
        />
        <div
          className="absolute w-32 h-32 rounded-full border border-[#DD0004]/70 animate-ping"
          style={{ animationDelay: "1s" }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center">
        <div className="relative">
          <h1 className="text-6xl md:text-8xl font-black text-white tracking-wider mb-8 animate-pulse">KALLKEYY</h1>
          {/* Glowing outline effect - Changed from orange to red */}
          <div className="absolute inset-0 text-6xl md:text-8xl font-black text-[#DD0004]/20 tracking-wider animate-pulse scale-105">
            KALLKEYY
          </div>
        </div>

        <p
          key={idx}
          className="text-xl md:text-2xl font-semibold text-[#DD0004] animate-fade-in"
          style={{
            animation: "textSlide 0.8s ease-out",
          }}
        >
          {TAGLINES[idx]}
        </p>

        {/* Progress dots - Changed from orange to red */}
        <div className="flex justify-center space-x-2 mt-8">
          {TAGLINES.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === idx ? "bg-[#DD0004] scale-125" : "bg-white/30"
              }`}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes sunray {
          0% { transform: translate(-50%, -50%) rotate(0deg) scale(1); opacity: 0.1; }
          50% { opacity: 0.3; }
          100% { transform: translate(-50%, -50%) rotate(360deg) scale(1.1); opacity: 0.1; }
        }
        
        @keyframes textSlide {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
