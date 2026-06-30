"use client";
import { motion } from "framer-motion";

export function LiveIntelligenceSection() {
  return (
    <section className="py-32 px-6 bg-[#09090B] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto flex flex-col md:flex-row-reverse items-center gap-16 relative z-10">
        <motion.div 
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="flex-1"
        >
          <h2 className="text-sm font-bold tracking-widest text-purple-400 uppercase mb-4">Live Intelligence</h2>
          <h3 className="font-[family-name:--font-cormorant] text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
            Total transparency. Zero confusion.
          </h3>
          <p className="text-lg text-zinc-400 leading-relaxed mb-8">
            The biggest problem with AI is the &quot;black box.&quot; Our Live Intelligence Layer constantly explains what the AI is doing, why it&apos;s doing it, and what happens next—in plain English.
          </p>
          <p className="text-sm text-zinc-500 leading-relaxed">
            You never have to wonder if the system is working, if it missed something, or if it made a mistake. It feels like having a world-class Chief of Staff whispering in your ear.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          className="flex-1 relative w-full h-[400px] flex items-center justify-center"
        >
          {/* Floating Live Intelligence UI Simulation */}
          <div className="absolute inset-0 bg-zinc-900/40 rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-6 p-8">
            
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl p-6 w-full max-w-sm shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-purple-500" />
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                  </span>
                  <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">Reasoning</span>
                </div>
                <span className="text-[10px] text-zinc-500">Just now</span>
              </div>
              <p className="text-sm text-white font-medium mb-2">Cross-checking your calendar...</p>
              <p className="text-xs text-zinc-400 italic">&quot;Making sure the suggested 2PM slot doesn&apos;t conflict with your board meeting.&quot;</p>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl p-6 w-full max-w-sm shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] relative overflow-hidden opacity-50 scale-95"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Completed</span>
              </div>
              <p className="text-sm text-white font-medium">Everything important has been reviewed.</p>
            </motion.div>

          </div>
        </motion.div>
      </div>
    </section>
  );
}
