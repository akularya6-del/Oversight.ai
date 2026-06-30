"use client";
import { motion } from "framer-motion";
import { Workflow, Database, Search, Lightbulb, ShieldCheck, PlaySquare } from "lucide-react";

export function ArchitectureSection() {
  const agents = [
    { icon: <Workflow className="w-5 h-5 text-blue-400" />, name: "Planner", desc: "Figures out what work needs to be done.", detail: "Breaks down your inbox into discrete, parallel tasks." },
    { icon: <Database className="w-5 h-5 text-purple-400" />, name: "Memory", desc: "Remembers previous conversations.", detail: "Retrieves context, preferences, and relationships." },
    { icon: <Search className="w-5 h-5 text-amber-400" />, name: "Context", desc: "Reads the full email thread.", detail: "Understands the nuance of long, messy chains." },
    { icon: <Lightbulb className="w-5 h-5 text-yellow-400" />, name: "Reasoning", desc: "Understands what the sender actually wants.", detail: "Detects hidden intents and implied commitments." },
    { icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />, name: "Verification", desc: "Double checks before making recommendations.", detail: "Ensures no conflicts and absolute safety." },
    { icon: <PlaySquare className="w-5 h-5 text-rose-400" />, name: "Execution", desc: "Prepares actions for your approval.", detail: "Stages calendar events and drafts replies." },
  ];

  return (
    <section className="py-32 px-6 bg-zinc-950 border-t border-white/5 relative z-10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-sm font-bold tracking-widest text-zinc-500 uppercase mb-4">Multi-Agent Architecture</h2>
          <h3 className="font-[family-name:--font-cormorant] text-4xl md:text-5xl font-bold text-white leading-tight max-w-2xl mx-auto">
            A swarm of specialized AI working in perfect harmony.
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: idx * 0.1 }}
              className="group bg-zinc-900 border border-white/5 hover:border-white/20 p-8 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-150 duration-500 pointer-events-none">
                {agent.icon}
              </div>
              <div className="w-12 h-12 bg-black rounded-full border border-white/10 flex items-center justify-center mb-6 shadow-inner relative z-10">
                {agent.icon}
              </div>
              <h4 className="text-xl font-bold text-white mb-2 relative z-10">{agent.name}</h4>
              <p className="text-zinc-300 font-medium mb-3 relative z-10">{agent.desc}</p>
              
              {/* Expanding Detail */}
              <div className="h-0 opacity-0 group-hover:h-auto group-hover:opacity-100 group-hover:mt-4 transition-all duration-300 overflow-hidden relative z-10">
                <p className="text-xs text-zinc-500 leading-relaxed border-t border-white/10 pt-4">
                  {agent.detail}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
