"use client";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { LiquidLogo } from "@/lib/visuals/liquid-logo/LiquidLogo";

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-32 pb-24 px-6 text-center z-10 overflow-hidden">
      {/* Interactive AI Animation Background */}
      <div className="absolute inset-0 z-0 opacity-50 flex items-center justify-center pointer-events-none">
        <LiquidLogo src="/logo.png" className="w-full h-full max-w-[800px] max-h-[800px]" />
      </div>

      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-[400px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none z-0" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-5xl mx-auto flex flex-col items-center z-10 relative"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-medium tracking-widest uppercase text-emerald-400">Oversight 2.0 is Live</span>
        </div>

        <h1 className="font-[family-name:--font-cormorant] text-6xl md:text-8xl lg:text-[110px] font-bold leading-[0.9] tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 mb-6 drop-shadow-2xl">
          Never drop a commitment.<br />Ever again.
        </h1>

        <p className="text-lg md:text-xl text-zinc-400 max-w-2xl font-medium tracking-wide leading-relaxed mb-12">
          An autonomous intelligence layer that monitors your inbox, detects commitments, and stages actions for your 1-click approval.
        </p>

        {/* Dual CTAs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6 w-full max-w-2xl px-4">
          <div className="relative group flex-1">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-emerald-700 rounded-lg blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
            <button 
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="relative w-full flex items-center justify-center gap-3 px-8 py-5 bg-zinc-950 border border-emerald-500/50 rounded-lg hover:bg-emerald-500/10 transition-colors"
            >
              <div className="flex flex-col items-start text-left">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="text-lg">🚀</span> Connect Google Workspace
                </span>
                <span className="text-[10px] uppercase tracking-widest text-emerald-400/80 mt-1">Uses your real data</span>
              </div>
            </button>
          </div>

          <div className="relative group flex-1">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
            <Link 
              href="/demo"
              className="relative w-full flex items-center justify-center gap-3 px-8 py-5 bg-zinc-950 border border-purple-500/50 rounded-lg hover:bg-purple-500/10 transition-colors"
            >
              <div className="flex flex-col items-start text-left">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="text-lg">▶</span> Try Interactive Demo
                </span>
                <span className="text-[10px] uppercase tracking-widest text-purple-400/80 mt-1">Instant • No sign-in required</span>
              </div>
            </Link>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/5 w-full max-w-3xl flex flex-wrap justify-center gap-x-8 gap-y-4 text-xs font-semibold tracking-widest text-zinc-500 uppercase">
          <span>Built with Google Gemini</span>
          <span>•</span>
          <span>Google Workspace</span>
          <span>•</span>
          <span>Next.js</span>
          <span>•</span>
          <span>AI Agents</span>
        </div>
      </motion.div>
    </section>
  );
}
