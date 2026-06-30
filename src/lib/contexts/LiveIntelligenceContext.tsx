"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

type IntelligenceState = 'idle' | 'loading' | 'syncing' | 'processing' | 'reasoning' | 'drafting' | 'scheduling' | 'completed';

interface LiveIntelligenceContextType {
  state: IntelligenceState;
  setState: (state: IntelligenceState) => void;
  message: string;
  setMessage: (message: string) => void;
  insight: string | null;
  setInsight: (insight: string | null) => void;
}

const LiveIntelligenceContext = createContext<LiveIntelligenceContextType | undefined>(undefined);

export function LiveIntelligenceProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<IntelligenceState>('idle');
  const [message, setMessage] = useState<string>("Monitoring quietly in the background.");
  const [insight, setInsight] = useState<string | null>(null);

  return (
    <LiveIntelligenceContext.Provider
      value={{
        state,
        setState,
        message,
        setMessage,
        insight,
        setInsight
      }}
    >
      {children}
    </LiveIntelligenceContext.Provider>
  );
}

export function useLiveIntelligence() {
  const context = useContext(LiveIntelligenceContext);
  if (context === undefined) {
    throw new Error("useLiveIntelligence must be used within a LiveIntelligenceProvider");
  }
  return context;
}
