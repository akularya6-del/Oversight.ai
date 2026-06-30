"use client";
import { motion } from "framer-motion";

export function TechStackSection() {
  const tech = [
    { name: "Google Gemini", desc: "State-of-the-art multimodal reasoning.", color: "border-blue-500/30", text: "text-blue-400" },
    { name: "Google Workspace API", desc: "Native, deep integration with Gmail and Calendar.", color: "border-red-500/30", text: "text-red-400" },
    { name: "Google OAuth", desc: "Enterprise-grade security and authentication.", color: "border-amber-500/30", text: "text-amber-400" },
    { name: "Next.js", desc: "Lightning-fast, server-rendered React framework.", color: "border-white/30", text: "text-white" },
    { name: "TypeScript", desc: "Type-safe, reliable architecture.", color: "border-blue-400/30", text: "text-blue-300" },
    { name: "TailwindCSS", desc: "Pixel-perfect, utility-first styling.", color: "border-cyan-500/30", text: "text-cyan-400" },
    { name: "Framer Motion", desc: "Fluid, 60fps micro-animations.", color: "border-pink-500/30", text: "text-pink-400" },
    { name: "Vercel", desc: "Global edge network deployment.", color: "border-zinc-500/50", text: "text-zinc-300" },
  ];

  return (
    <section className="py-32 px-6 bg-[#09090B] relative z-10 overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-sm font-bold tracking-widest text-zinc-500 uppercase mb-4">Technology Stack</h2>
          <h3 className="font-[family-name:--font-cormorant] text-4xl md:text-5xl font-bold text-white leading-tight">
            Built on giants.
          </h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {tech.map((t, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: idx * 0.05 }}
              className={`bg-zinc-900/50 border ${t.color} p-6 rounded-2xl hover:bg-zinc-900 transition-colors flex flex-col items-center justify-center text-center`}
            >
              <h4 className={`text-sm font-bold uppercase tracking-widest ${t.text} mb-2`}>{t.name}</h4>
              <p className="text-xs text-zinc-500 font-medium">{t.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
