"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLiveIntelligence } from "@/lib/contexts/LiveIntelligenceContext";
import { Sparkles, CheckCircle2, Search, BrainCircuit, PenTool, Calendar, ShieldCheck, Mail, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function LiveIntelligence() {
  const { state, message, insight } = useLiveIntelligence();
  const [isHovered, setIsHovered] = useState(false);

  // Icon mapping based on state
  const getIcon = () => {
    switch (state) {
      case "loading":
      case "syncing":
        return <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />;
      case "processing":
        return <Search className="w-4 h-4 text-emerald-500" />;
      case "reasoning":
        return <BrainCircuit className="w-4 h-4 text-purple-500" />;
      case "drafting":
        return <PenTool className="w-4 h-4 text-amber-500" />;
      case "scheduling":
        return <Calendar className="w-4 h-4 text-blue-500" />;
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case "idle":
      default:
        return <ShieldCheck className="w-4 h-4 text-gray-400" />;
    }
  };

  const getSubtext = () => {
    switch (state) {
      case "loading":
        return "Connecting to Google Workspace...";
      case "syncing":
        return "Scanning today's inbox...";
      case "processing":
        return "Finding conversations that might need attention.";
      case "reasoning":
        return "Cross-checking with your calendar & memory.";
      case "drafting":
        return "Preparing a response you'll review before anything is sent.";
      case "scheduling":
        return "Making sure suggested meetings don't conflict.";
      case "completed":
        return "No scheduling conflicts detected. Inbox analyzed.";
      case "idle":
      default:
        return "Nothing is sent automatically. You always stay in control.";
    }
  };

  return (
    <div className="fixed z-50 bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:top-6 md:right-6 md:bottom-auto w-[90%] md:w-80 pointer-events-none">
      <AnimatePresence mode="wait">
        <motion.aside
          role="region"
          aria-label="Live Intelligence Layer"
          key={state + message} // Re-animate if state or message changes
          initial={{ opacity: 0, y: 15, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -15, scale: 0.95 }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          className="pointer-events-auto"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="bg-white/70 dark:bg-[#111113]/80 backdrop-blur-xl border border-gray-200 dark:border-[#2A2A2A] rounded-2xl p-4 shadow-xl shadow-black/5 dark:shadow-black/20 overflow-hidden relative group">
            
            {/* Subtle glow effect based on state */}
            <div className={cn(
              "absolute inset-0 opacity-10 transition-colors duration-1000",
              state === "reasoning" ? "bg-purple-500" :
              state === "drafting" ? "bg-amber-500" :
              state === "scheduling" ? "bg-blue-500" :
              state === "idle" ? "bg-transparent" : "bg-emerald-500"
            )} />

            <div className="relative flex items-start gap-3">
              <div className="mt-0.5 shrink-0 bg-gray-100 dark:bg-[#2A2A2A] p-1.5 rounded-full border border-gray-200 dark:border-gray-700 shadow-inner">
                {getIcon()}
              </div>
              <div className="flex-1 space-y-1 overflow-hidden">
                <motion.p 
                  layout="position"
                  className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-tight"
                >
                  {message}
                </motion.p>
                <motion.p 
                  layout="position"
                  className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed"
                >
                  {getSubtext()}
                </motion.p>
                
                <AnimatePresence>
                  {(isHovered || insight) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: "auto", marginTop: 12 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      className="border-t border-gray-200 dark:border-gray-800 pt-3"
                    >
                      {insight ? (
                        <div className="flex items-start gap-2">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                          <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                            {insight}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            We analyze email urgency, sender relationships, and your schedule to ensure urgent work reaches the top of your queue.
                          </p>
                          <div className="flex items-center justify-between text-[10px] font-bold tracking-wider uppercase text-emerald-600 dark:text-emerald-500">
                            <span>Confidence: 98%</span>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.aside>
      </AnimatePresence>
    </div>
  );
}
