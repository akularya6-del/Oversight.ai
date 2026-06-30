"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

export function FAQSection() {
  const faqs = [
    { q: "How does it work?", a: "Oversight connects to your Gmail and Calendar via secure Google OAuth. It uses a swarm of Gemini-powered AI agents to read incoming emails, cross-reference your calendar, and determine if an action (like a reply or a meeting) is needed. It then stages these actions in a unified queue." },
    { q: "Does AI send emails automatically?", a: "No. Absolutely nothing happens without your explicit consent. The AI drafts the email and stages the calendar event, but you must click 'Approve' for it to execute." },
    { q: "Can I undo an action?", a: "Yes. When you approve an action, we hold it for 5 seconds (with a prominent Undo toast) before executing it against the Google API. If you click undo, the action is instantly reverted to the queue." },
    { q: "Is my data private?", a: "Yes. We use standard OAuth scopes that you can revoke at any time. We do not store your emails in our database, and your data is never used to train generalized AI models." },
    { q: "How accurate is the AI?", a: "By breaking the problem down into multiple agents (Planner, Memory, Context, Reasoning, Verification), we achieve a drastically higher accuracy than passing an email to a single prompt. The Verification agent ensures high fidelity." },
    { q: "Why Google Workspace?", a: "Google Workspace APIs provide the robust enterprise architecture necessary for this application. Plus, Gemini models offer the best reasoning and context windows available for complex email threads." },
    { q: "How does Live Intelligence work?", a: "The backend orchestration pipeline streams Server-Sent Events (SSE) to the frontend in real-time as each agent spins up. We parse these events and display them as plain English explanations." },
  ];

  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section className="py-32 px-6 bg-[#09090B] relative z-10">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-sm font-bold tracking-widest text-zinc-500 uppercase mb-4">FAQ</h2>
          <h3 className="font-[family-name:--font-cormorant] text-4xl md:text-5xl font-bold text-white leading-tight">
            Frequently Asked Questions
          </h3>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div 
              key={idx} 
              className="bg-zinc-900/50 border border-white/5 rounded-xl overflow-hidden hover:bg-zinc-900 transition-colors cursor-pointer"
              onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
            >
              <div className="px-6 py-5 flex items-center justify-between">
                <h4 className="text-sm font-bold text-white">{faq.q}</h4>
                <div className="text-zinc-500">
                  {openIdx === idx ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
              </div>
              <AnimatePresence>
                {openIdx === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-6 text-sm text-zinc-400 leading-relaxed border-t border-white/5 pt-4">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
