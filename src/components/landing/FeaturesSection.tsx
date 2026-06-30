"use client";
import { motion } from "framer-motion";
import { Inbox, CalendarPlus, PenLine, Clock, CalendarOff, Star, Brain, CheckSquare, Undo2, Activity, Play } from "lucide-react";

export function FeaturesSection() {
  const features = [
    { icon: <Inbox />, name: "AI Inbox Analysis" },
    { icon: <CalendarPlus />, name: "Meeting Scheduling" },
    { icon: <PenLine />, name: "Draft Replies" },
    { icon: <Clock />, name: "Follow-up Detection" },
    { icon: <CalendarOff />, name: "Conflict Detection" },
    { icon: <Star />, name: "VIP Recognition" },
    { icon: <Brain />, name: "Context Awareness" },
    { icon: <CheckSquare />, name: "Approval Queue" },
    { icon: <Undo2 />, name: "Undo Support" },
    { icon: <Activity />, name: "Live Intelligence" },
    { icon: <Play />, name: "Interactive Demo" },
  ];

  return (
    <section className="py-32 px-6 bg-[#09090B] relative z-10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-sm font-bold tracking-widest text-zinc-500 uppercase mb-4">Features</h2>
          <h3 className="font-[family-name:--font-cormorant] text-4xl md:text-5xl font-bold text-white leading-tight">
            Everything you need. Nothing you don&apos;t.
          </h3>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          {features.map((feat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-center gap-3 px-6 py-4 bg-zinc-900 border border-white/5 rounded-full hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-colors group cursor-default"
            >
              <div className="text-zinc-500 group-hover:text-emerald-400 w-5 h-5 transition-colors">
                {feat.icon}
              </div>
              <span className="text-sm font-bold text-zinc-300 group-hover:text-white transition-colors">{feat.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
