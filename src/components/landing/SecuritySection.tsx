"use client";
import { motion } from "framer-motion";
import { Shield, Lock, EyeOff, RotateCcw } from "lucide-react";

export function SecuritySection() {
  const security = [
    { icon: <Shield className="w-5 h-5 text-emerald-400" />, title: "Explicit Consent", desc: "No email is sent and no calendar event is created without you clicking 'Approve'." },
    { icon: <Lock className="w-5 h-5 text-emerald-400" />, title: "OAuth Powered", desc: "Zero passwords stored. We use secure Google OAuth tokens that can be revoked anytime." },
    { icon: <EyeOff className="w-5 h-5 text-emerald-400" />, title: "Private by Design", desc: "Data is analyzed exclusively for your workflows and is never used to train global models." },
    { icon: <RotateCcw className="w-5 h-5 text-emerald-400" />, title: "Undo Support", desc: "Accidentally approved? You have 5 seconds to undo any action before it hits the network." },
  ];

  return (
    <section className="py-32 px-6 bg-zinc-950 border-t border-white/5 relative z-10 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[200px] pointer-events-none" />
      
      <div className="max-w-4xl mx-auto relative z-10 text-center">
        <h2 className="text-sm font-bold tracking-widest text-emerald-500 uppercase mb-4">Enterprise Grade Security</h2>
        <h3 className="font-[family-name:--font-cormorant] text-4xl md:text-5xl font-bold text-white leading-tight mb-16">
          Your data is yours. Period.
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {security.map((sec, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: idx * 0.1 }}
              className="flex flex-col items-center text-center p-8 bg-zinc-900/50 rounded-2xl border border-white/5"
            >
              <div className="w-12 h-12 bg-black rounded-full border border-emerald-500/30 flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                {sec.icon}
              </div>
              <h4 className="text-lg font-bold text-white mb-2">{sec.title}</h4>
              <p className="text-sm text-zinc-400 leading-relaxed">{sec.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
