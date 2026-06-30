"use client";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

export function SolutionSection() {
  return (
    <section className="py-32 px-6 bg-[#09090B] relative overflow-hidden">
      {/* Background radial */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-16 relative z-10">
        <motion.div 
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="flex-1"
        >
          <h2 className="text-sm font-bold tracking-widest text-emerald-500 uppercase mb-4">The Solution</h2>
          <h3 className="font-[family-name:--font-cormorant] text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
            An intelligence layer that works for you.
          </h3>
          <p className="text-lg text-zinc-400 leading-relaxed mb-8">
            Oversight continuously monitors your Gmail and Calendar, understands conversations, detects commitments, drafts actions, schedules meetings, and prepares everything for your approval.
          </p>
          
          <div className="space-y-4">
            {[
              "Understands context, not just keywords.",
              "Learns your relationships and priorities.",
              "Nothing happens without your explicit approval."
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span className="text-zinc-300 font-medium">{text}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          className="flex-1 relative w-full aspect-square md:aspect-auto md:h-[500px]"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-zinc-900 to-zinc-800 border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col justify-between overflow-hidden">
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-emerald-500/20 blur-[80px] rounded-full" />
            
            <div className="space-y-4 relative z-10">
              <div className="w-3/4 h-4 bg-white/10 rounded animate-pulse" />
              <div className="w-1/2 h-4 bg-white/10 rounded animate-pulse" />
              <div className="w-5/6 h-4 bg-white/10 rounded animate-pulse" />
            </div>

            <div className="relative z-10 bg-black/50 backdrop-blur-md border border-emerald-500/30 rounded-xl p-5 shadow-lg transform translate-y-4 rotate-[-2deg]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <span className="text-emerald-500 font-bold text-xs">AI</span>
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Drafted Reply</div>
                  <div className="text-xs text-zinc-400">Ready for review</div>
                </div>
              </div>
              <p className="text-xs text-zinc-300 italic">&quot;I&apos;ve drafted a response confirming the 2PM meeting and added it to your calendar.&quot;</p>
              <div className="mt-4 flex gap-2">
                <button className="flex-1 bg-emerald-500 text-black text-xs font-bold py-2 rounded">Approve</button>
                <button className="flex-1 bg-white/10 text-white text-xs font-bold py-2 rounded">Edit</button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
