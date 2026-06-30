"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Play } from "lucide-react";

export function DemoShowcaseSection() {
  return (
    <section className="py-32 px-6 bg-zinc-950 border-t border-white/5 relative z-10 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[400px] bg-purple-500/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-5xl mx-auto text-center relative z-10">
        <h2 className="text-sm font-bold tracking-widest text-purple-400 uppercase mb-4">Interactive Demo</h2>
        <h3 className="font-[family-name:--font-cormorant] text-4xl md:text-5xl font-bold text-white leading-tight mb-8">
          Don&apos;t take our word for it.<br />Experience it yourself.
        </h3>
        <p className="text-lg text-zinc-400 max-w-2xl mx-auto mb-12 leading-relaxed">
          We built a fully interactive demo using realistic data. See the AI reason, approve actions, watch the Live Intelligence Layer, and experience the UI—without signing in.
        </p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          className="relative group inline-block"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg blur opacity-40 group-hover:opacity-70 transition duration-500"></div>
          <Link 
            href="/demo"
            className="relative flex items-center gap-3 px-10 py-5 bg-black border border-purple-500/50 rounded-lg hover:bg-purple-500/10 transition-colors shadow-2xl"
          >
            <Play className="w-6 h-6 text-purple-400" />
            <div className="flex flex-col items-start text-left">
              <span className="text-lg font-bold text-white">Launch Interactive Demo</span>
              <span className="text-xs text-purple-400/80 uppercase tracking-widest">Takes exactly 60 seconds</span>
            </div>
          </Link>
        </motion.div>

        {/* Mockup Window */}
        <div className="mt-20 relative mx-auto w-full max-w-4xl rounded-xl border border-white/10 bg-black shadow-2xl overflow-hidden group">
          <div className="h-8 bg-zinc-900 border-b border-white/10 flex items-center px-4 gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>
          <div className="relative aspect-video bg-zinc-950 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/50 to-black pointer-events-none" />
            {/* Play Button Overlay */}
            <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-full flex items-center justify-center backdrop-blur-md group-hover:scale-110 transition-transform cursor-pointer">
              <Play className="w-8 h-8 text-white ml-2" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
