"use client";
import { motion } from "framer-motion";

export function MetricsSection() {
  const metrics = [
    { value: "40%", label: "Less Cognitive Load", desc: "Stop stressing about what you forgot." },
    { value: "10h", label: "Saved per Month", desc: "Automating routine follow-ups and scheduling." },
    { value: "0", label: "Missed Commitments", desc: "Every thread is tracked until resolved." },
    { value: "100%", label: "Transparency", desc: "Live Intelligence explains every action." }
  ];

  return (
    <section className="py-32 px-6 bg-[#09090B] relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-24">
          <h2 className="text-sm font-bold tracking-widest text-emerald-500 uppercase mb-4">Why Oversight Wins</h2>
          <h3 className="font-[family-name:--font-cormorant] text-4xl md:text-5xl font-bold text-white leading-tight">
            The ROI of Executive AI.
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 border-y border-white/5 py-12">
          {metrics.map((metric, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: idx * 0.1 }}
              className="text-center border-r border-white/5 last:border-0 pr-8 last:pr-0"
            >
              <div className="text-5xl font-[family-name:--font-cormorant] font-bold text-white mb-2 tracking-tight">
                {metric.value}
              </div>
              <div className="text-sm font-bold uppercase tracking-widest text-emerald-500 mb-2">
                {metric.label}
              </div>
              <p className="text-xs text-zinc-500">
                {metric.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
