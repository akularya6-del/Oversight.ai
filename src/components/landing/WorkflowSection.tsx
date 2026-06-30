"use client";
import { motion } from "framer-motion";
import { Mail, Brain, KeySquare, CalendarSearch, Edit3, UserCheck, Check } from "lucide-react";

export function WorkflowSection() {
  const steps = [
    { icon: <Mail className="w-5 h-5" />, title: "Email Arrives", desc: "A client asks for a meeting next Tuesday." },
    { icon: <Brain className="w-5 h-5" />, title: "AI Reads Context", desc: "Agent retrieves previous conversations with this client." },
    { icon: <KeySquare className="w-5 h-5" />, title: "AI Understands", desc: "Recognizes the VIP status and urgency." },
    { icon: <CalendarSearch className="w-5 h-5" />, title: "Calendar Checked", desc: "Agent cross-references your real-time availability." },
    { icon: <Edit3 className="w-5 h-5" />, title: "Action Drafted", desc: "A reply and calendar invite are prepared." },
    { icon: <UserCheck className="w-5 h-5" />, title: "User Approves", desc: "You click one button to approve." },
    { icon: <Check className="w-5 h-5" />, title: "Done", desc: "Email sent, calendar updated. Zero effort." }
  ];

  return (
    <section className="py-32 px-6 bg-zinc-950 border-t border-white/5 relative">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-24">
          <h2 className="text-sm font-bold tracking-widest text-zinc-500 uppercase mb-4">Interactive Workflow</h2>
          <h3 className="font-[family-name:--font-cormorant] text-4xl md:text-5xl font-bold text-white leading-tight">
            How it works in practice.
          </h3>
        </div>

        <div className="relative">
          {/* Horizontal Line */}
          <div className="absolute top-1/2 left-0 w-full h-px bg-white/10 -translate-y-1/2 hidden md:block" />
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            {steps.map((step, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: idx * 0.1 }}
                className="group relative flex flex-col items-center flex-1 w-full md:w-auto"
              >
                {/* Node */}
                <div className="w-12 h-12 rounded-full bg-zinc-900 border border-white/20 flex items-center justify-center text-zinc-400 group-hover:border-emerald-500 group-hover:text-emerald-400 group-hover:bg-emerald-500/10 transition-all duration-300 shadow-xl relative z-10">
                  {step.icon}
                </div>
                
                {/* Connector line for mobile */}
                {idx !== steps.length - 1 && (
                  <div className="w-px h-8 bg-white/10 md:hidden my-2" />
                )}

                {/* Info Card (Expands on Hover) */}
                <div className="mt-6 text-center w-48 opacity-100 md:opacity-0 md:-translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 absolute top-14 left-1/2 -translate-x-1/2 pointer-events-none">
                  <div className="bg-zinc-900 border border-white/10 p-4 rounded-lg shadow-2xl">
                    <h4 className="text-sm font-bold text-white mb-2">{step.title}</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
                
                {/* Always visible title on mobile, hidden on desktop until hover logic above or keep it simple */}
                <div className="mt-4 text-center md:hidden">
                  <h4 className="text-sm font-bold text-white mb-1">{step.title}</h4>
                  <p className="text-xs text-zinc-400">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
