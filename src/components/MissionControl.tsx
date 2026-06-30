"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Activity, Clock, CheckCircle2, XCircle } from "lucide-react";

export interface AgentEvent {
  node: string;
  status: "running" | "completed" | "failed";
  message: string;
  durationMs?: number;
  confidence?: number;
  tokens?: number;
}

export function MissionControl({ events }: { events: AgentEvent[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeNodes, setActiveNodes] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile(); // Set initially on client mount
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const running = new Set<string>();
    events.forEach(evt => {
      if (evt.status === "running") {
        running.add(evt.node);
      } else if (evt.status === "completed" || evt.status === "failed") {
        running.delete(evt.node);
      }
    });
    setActiveNodes(Array.from(running));
  }, [events]);

  return (
    <div className="fixed bottom-0 md:bottom-4 right-0 md:right-4 z-50 w-full md:max-w-md">
      <div className="bg-[#09090B] border-t md:border border-[#2A2A2A] shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.8)] md:shadow-2xl md:rounded-sm overflow-hidden flex flex-col">
        {/* Header */}
        <div 
          className="bg-[#111113] p-3 border-b border-[#2A2A2A] flex items-center justify-between cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center gap-2 text-[#FAFAFA]">
            <Terminal className="w-4 h-4 text-[#10B981]" />
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase">
              Mission Control
            </span>
          </div>
          <div className="flex items-center gap-2">
            {activeNodes.length > 0 && (
              <span className="flex items-center gap-1.5 text-[9px] text-[#FAFAFA]/70 tracking-widest uppercase">
                <Activity className="w-3 h-3 text-[#F59E0B] animate-pulse" />
                {activeNodes.length} Active
              </span>
            )}
          </div>
        </div>

        {/* Body */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: isMobile ? "50vh" : 300 }}
              exit={{ height: 0 }}
              className="overflow-y-auto custom-scrollbar p-4 space-y-3 bg-[#09090B]"
            >
              {events.length === 0 ? (
                <div className="text-[10px] text-[#FAFAFA]/40 font-mono tracking-wider">
                  Waiting for pipeline initialization...
                </div>
              ) : (
                events.map((evt, idx) => (
                  <div key={idx} className="flex flex-col gap-1 border-l-2 border-[#2A2A2A] pl-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#FAFAFA] tracking-[0.1em] uppercase">
                        {evt.node}
                      </span>
                      {evt.status === "completed" && <CheckCircle2 className="w-3 h-3 text-[#10B981]" />}
                      {evt.status === "failed" && <XCircle className="w-3 h-3 text-red-500" />}
                      {evt.status === "running" && <Activity className="w-3 h-3 text-[#F59E0B] animate-pulse" />}
                    </div>
                    <p className="text-[11px] text-[#FAFAFA]/70 font-mono leading-relaxed">
                      {evt.message}
                    </p>
                    {(evt.durationMs || evt.confidence) && (
                      <div className="flex items-center gap-3 mt-1 text-[9px] text-[#FAFAFA]/40 tracking-wider">
                        {evt.durationMs && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {evt.durationMs}ms
                          </span>
                        )}
                        {evt.confidence && (
                          <span>Confidence: {(evt.confidence * 100).toFixed(0)}%</span>
                        )}
                        {evt.tokens && (
                          <span>Tokens: {evt.tokens}</span>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
