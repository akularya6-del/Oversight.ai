"use client";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Code2, FileText, ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-32 px-6 bg-zinc-950 border-t border-white/5 relative overflow-hidden z-10">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none" />
      
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
        >
          <h2 className="font-[family-name:--font-cormorant] text-5xl md:text-7xl font-bold text-white leading-[0.9] tracking-tighter mb-8">
            Ready to stop dropping<br />important work?
          </h2>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <button 
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-white text-black font-bold rounded-lg hover:bg-zinc-200 transition-colors"
            >
              Connect Google Workspace <ArrowRight className="w-4 h-4" />
            </button>
            <Link 
              href="/demo"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-zinc-900 text-white font-bold rounded-lg border border-white/10 hover:bg-zinc-800 transition-colors"
            >
              Try Interactive Demo
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-6">
            <a href="https://github.com/google/gemini" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">
              <Code2 className="w-4 h-4" />
              GitHub
            </a>
            <a href="https://ai.google.dev/" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">
              <FileText className="w-4 h-4" />
              Architecture
            </a>
            <a href="https://ai.google.dev/docs" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">
              <FileText className="w-4 h-4" />
              Documentation
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
