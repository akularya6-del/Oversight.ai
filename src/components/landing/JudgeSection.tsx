"use client";
import { motion } from "framer-motion";
import { Trophy, Code2, Bot, Users, Cpu, Eye, Layers } from "lucide-react";

export function JudgeSection() {
  const criteria = [
    { icon: <Code2 />, title: "Google Technologies Used", desc: "Powered natively by Gemini, Google Workspace APIs, and Google OAuth." },
    { icon: <Bot />, title: "Agentic AI", desc: "A complex multi-agent pipeline (Planner, Memory, Context, Reasoning, Verification, Execution) acting autonomously." },
    { icon: <Users />, title: "Human-in-the-Loop", desc: "Radically safe UX. The AI stages everything, but the user must click 'Approve'. Zero hallucination risk." },
    { icon: <Cpu />, title: "Production Architecture", desc: "Deployed on Vercel Edge with Next.js, Upstash Redis KV, Server-Sent Events, and a highly concurrent backend." },
    { icon: <Eye />, title: "Trust & Transparency", desc: "The Live Intelligence Layer solves the 'AI Black Box' problem by explaining every step in plain English." },
    { icon: <Layers />, title: "Enterprise UX", desc: "Premium, motion-rich design (Linear/Cursor tier) proving that AI apps don't have to look like chatbots." }
  ];

  return (
    <section className="py-32 px-6 bg-zinc-950 border-t border-white/5 relative z-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row gap-16 items-start">
          <div className="flex-1 sticky top-32">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full mb-6">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500">For the Judges</span>
            </div>
            <h3 className="font-[family-name:--font-cormorant] text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
              Why Oversight deserves to win.
            </h3>
            <p className="text-lg text-zinc-400 leading-relaxed mb-8">
              We didn&apos;t just build a wrapper around an LLM. We built a production-ready, highly complex agentic system—and then we wrapped it in an obsessive, enterprise-grade UX.
            </p>
          </div>

          <div className="flex-1 space-y-6">
            {criteria.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: idx * 0.1 }}
                className="bg-black border border-white/10 rounded-xl p-6 shadow-xl"
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="text-amber-500 bg-amber-500/10 p-2 rounded-lg">
                    {item.icon}
                  </div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-widest">{item.title}</h4>
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed pl-14">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
