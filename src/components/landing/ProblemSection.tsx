"use client";
import { motion } from "framer-motion";
import { Mailbox, CalendarX, BrainCircuit, AlertCircle } from "lucide-react";

export function ProblemSection() {
  const problems = [
    {
      icon: <Mailbox className="w-6 h-6 text-rose-500" />,
      title: "Email Overload",
      description: "Hundreds of messages a day drown out the signal. The important requests get buried under newsletters and cc's."
    },
    {
      icon: <AlertCircle className="w-6 h-6 text-amber-500" />,
      title: "Missed Follow-ups",
      description: "Promises to &apos;get back to you next week&apos; are easily forgotten, damaging client trust and losing deals."
    },
    {
      icon: <CalendarX className="w-6 h-6 text-orange-500" />,
      title: "Scheduling Conflicts",
      description: "Double-booking VIPs or missing travel itineraries leads to logistical nightmares and apologies."
    },
    {
      icon: <BrainCircuit className="w-6 h-6 text-zinc-500" />,
      title: "Cognitive Load",
      description: "The constant anxiety of &apos;Did I forget something?&apos; drains your energy and prevents deep, focused work."
    }
  ];

  return (
    <section className="py-32 px-6 bg-zinc-950 border-t border-white/5 relative z-10">
      <div className="max-w-5xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-20"
        >
          <h2 className="text-sm font-bold tracking-widest text-zinc-500 uppercase mb-4">The Status Quo</h2>
          <p className="font-[family-name:--font-cormorant] text-4xl md:text-5xl font-bold text-white max-w-2xl mx-auto leading-tight">
            Your inbox wasn&apos;t built for modern workflows.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {problems.map((problem, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: idx * 0.1 }}
              className="bg-zinc-900/50 border border-white/5 rounded-2xl p-8 hover:bg-zinc-900 transition-colors"
            >
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center border border-white/10 mb-6 shadow-inner">
                {problem.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{problem.title}</h3>
              <p className="text-zinc-400 leading-relaxed">{problem.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
