"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface Props {
  onAccessGranted: () => void
}

export default function EarlyAccessPage({ onAccessGranted }: Props) {
  const [form, setForm] = useState({ name: "", email: "" })
  const [code, setCode] = useState("")
  const [codeDialogOpen, setCodeDialogOpen] = useState(false)

  const dots = useMemo(() => {
    return [...Array(100)].map((_, i) => ({
      id: i,
      top: Math.random() * 100,
      left: Math.random() * 100,
      delay: Math.random() * 3,
    }))
  }, [])

  const request = (e: React.FormEvent) => {
    e.preventDefault()
    if (form.name && form.email) {
      toast({
        title: "Thank you for applying! 🎉",
        description: "You'll receive an email once your request is approved.",
        duration: 5000,
      })
      setForm({ name: "", email: "" })
    }
  }

  const verify = (e: React.FormEvent) => {
    e.preventDefault()
    if (code === "KALLKEYY2025") {
      toast({ title: "Access approved", description: "Welcome to KALLKEYY" })
      setTimeout(onAccessGranted, 800)
    } else {
      toast({
        title: "Invalid code",
        description: "Please check and try again",
        variant: "destructive",
      })
    }
  }

  const handleCodeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCode(e.target.value.toUpperCase())
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 relative overflow-hidden">
      {/* Dots background pattern - Using memoized dots to prevent reset */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        {dots.map((dot) => (
          <div
            key={dot.id}
            className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
            style={{
              top: `${dot.top}%`,
              left: `${dot.left}%`,
              animationDelay: `${dot.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Scan lines like preloader */}
      <div className="fixed inset-0 pointer-events-none opacity-10">
        <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_0%,rgba(255,255,255,0.05)_50%,transparent_100%)] bg-[length:100%_4px]" />
      </div>

      {/* Corner brackets */}
      <div className="fixed top-8 left-8 w-16 h-16 border-t-2 border-l-2 border-[#DD0004] opacity-50" />
      <div className="fixed top-8 right-8 w-16 h-16 border-t-2 border-r-2 border-[#DD0004] opacity-50" />
      <div className="fixed bottom-8 left-8 w-16 h-16 border-b-2 border-l-2 border-[#DD0004] opacity-50" />
      <div className="fixed bottom-8 right-8 w-16 h-16 border-b-2 border-r-2 border-[#DD0004] opacity-50" />

      {/* Main content */}
      <div className="max-w-md w-full space-y-8 text-center relative z-10 animate-fade-in-up">
        <div className="space-y-6">
          <div className="relative">
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-widest animate-glitch">KALLKEYY</h1>
          </div>

          <div className="w-24 h-1 bg-[#DD0004] mx-auto animate-expand" />

          <h2
            className="text-2xl md:text-3xl font-bold text-[#DD0004] animate-slide-up"
            style={{ animationDelay: "0.3s" }}
          >
            EXCLUSIVE ACCESS
          </h2>

          <p className="text-white/70 text-lg animate-slide-up" style={{ animationDelay: "0.6s" }}>
            Request early access to the pre-launch portal and be first to preorder the flagship drop.
          </p>
        </div>

        <form onSubmit={request} className="space-y-6 animate-slide-up" style={{ animationDelay: "0.9s" }}>
          <div className="space-y-4">
            <div className="relative">
              <Input
                placeholder="ENTER YOUR NAME"
                value={form.name}
                onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                className="bg-[#28282B] border-[#DD0004]/30 text-white placeholder-white/40 h-12 text-lg focus:border-[#DD0004] focus:ring-2 focus:ring-[#DD0004]/20 transition-all duration-300 hover:border-[#DD0004]/50"
              />
            </div>
            <div className="relative">
              <Input
                placeholder="ENTER YOUR EMAIL"
                type="email"
                value={form.email}
                onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                className="bg-[#28282B] border-[#DD0004]/30 text-white placeholder-white/40 h-12 text-lg focus:border-[#DD0004] focus:ring-2 focus:ring-[#DD0004]/20 transition-all duration-300 hover:border-[#DD0004]/50"
              />
            </div>
          </div>
          <Button
            type="submit"
            className="w-full bg-[#DD0004] hover:bg-[#DD0004]/80 text-white font-bold py-4 text-lg shadow-lg hover:shadow-[#DD0004]/20 transition-all duration-300 transform hover:scale-105"
          >
            REQUEST EARLY ACCESS
          </Button>

          <Dialog open={codeDialogOpen} onOpenChange={setCodeDialogOpen}>
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="w-full border-white text-white hover:bg-white hover:text-black font-bold py-4 text-base transition-all duration-300 transform hover:scale-105 bg-transparent"
              >
                GOT THE ACCESS CODE? CLICK HERE
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-black border-[#DD0004]/30 text-white">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-[#DD0004]">ENTER ACCESS CODE</DialogTitle>
              </DialogHeader>
              <form onSubmit={verify} className="space-y-6">
                <div className="space-y-4">
                  <p className="text-white/70 text-sm">Enter the access code you received via email</p>
                  <div className="relative">
                    <Input
                      placeholder="ACCESS CODE"
                      value={code}
                      onChange={handleCodeInput}
                      className="bg-[#28282B] border-[#DD0004]/30 text-white placeholder-white/40 h-12 text-xl font-mono text-center tracking-widest focus:border-[#DD0004] focus:ring-2 focus:ring-[#DD0004]/20 transition-all duration-300 uppercase hover:border-[#DD0004]/50"
                      maxLength={12}
                      style={{ fontFamily: "monospace" }}
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-white text-black hover:bg-[#DD0004] hover:text-white font-bold py-4 text-lg shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  UNLOCK ACCESS
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </form>

        <div className="mt-8 text-[#DD0004]/70 text-sm animate-fade-in" style={{ animationDelay: "1.2s" }}>
          <p className="animate-pulse">LIMITED SPOTS • EXCLUSIVE DROP ACCESS</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes twinkle {
          0%,
          100% {
            opacity: 0.2;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes glitch {
          0%,
          100% {
            text-shadow: 0 0 10px rgba(221, 0, 4, 0.5);
          }
          25% {
            text-shadow:
              -2px 0 rgba(221, 0, 4, 0.7),
              2px 0 rgba(255, 255, 255, 0.3);
          }
          50% {
            text-shadow: 0 0 20px rgba(221, 0, 4, 0.8);
          }
          75% {
            text-shadow:
              2px 0 rgba(221, 0, 4, 0.7),
              -2px 0 rgba(255, 255, 255, 0.3);
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

        @keyframes slide-up {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes expand {
          0% {
            width: 0;
          }
          100% {
            width: 6rem;
          }
        }

        .animate-twinkle {
          animation: twinkle 2s ease-in-out infinite;
        }
        .animate-glitch {
          animation: glitch 3s ease-in-out infinite;
        }
        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out forwards;
        }
        .animate-slide-up {
          animation: slide-up 0.8s ease-out forwards;
        }
        .animate-expand {
          animation: expand 1s ease-out forwards;
        }
        .animate-fade-in {
          animation: fade-in-up 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
