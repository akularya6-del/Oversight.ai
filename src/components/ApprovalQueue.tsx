"use client";

import { useEffect, useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, CheckCircle2, ShieldCheck, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { StagedAction, FollowupInsight, ContactProfile } from "@/types/actions";
import { QueueItemCard } from "./QueueItemCard";
import { useLiveIntelligence } from "@/lib/contexts/LiveIntelligenceContext";

type ApprovalQueueProps = {
  mode?: "live" | "demo";
};

export function ApprovalQueue({ mode = "live" }: ApprovalQueueProps) {
  const { setState, setMessage, setInsight } = useLiveIntelligence();
  
  const [actions, setActions] = useState<StagedAction[]>([]);
  const [insights, setInsights] = useState<FollowupInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for keyboard focus and optimistic undo
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [pendingExecutions, setPendingExecutions] = useState<Map<string, NodeJS.Timeout>>(new Map());

  // Unified queue merges standard actions and insights
  const unifiedQueue = useMemo(() => {
    const validInsights = insights
      .filter((i) => i.proposedAction)
      .map((i) => ({ ...i.proposedAction!, reasoning: `Reply from ${i.replyFrom}: "${i.replySnippet}..."` }));
    
    return [...actions, ...validInsights];
  }, [actions, insights]);

  // Adjust focus if the queue shrinks
  useEffect(() => {
    if (focusedIndex >= unifiedQueue.length && unifiedQueue.length > 0) {
      setFocusedIndex(Math.max(0, unifiedQueue.length - 1));
    }
  }, [unifiedQueue.length, focusedIndex]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setState("loading");
    setMessage("Connecting to Google Workspace...");
    const abortController = new AbortController();
    
    const runPipeline = async () => {
      try {
        setState("syncing");
        setMessage("Scanning today's inbox...");
        
        const endpoint = mode === "demo" ? "/api/demo/agent" : "/api/agent";
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
          signal: abortController.signal
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Failed to analyze workspace");
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No response stream");

        const decoder = new TextDecoder();
        let buffer = "";

        setState("processing");
        setMessage("Finding conversations that might need attention.");

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunkStr = decoder.decode(value, { stream: true });
          buffer += chunkStr;
          
          let eventBoundaryIndex;
          while ((eventBoundaryIndex = buffer.indexOf('\n\n')) >= 0) {
            const rawEvent = buffer.slice(0, eventBoundaryIndex).trim();
            buffer = buffer.slice(eventBoundaryIndex + 2);
            
            if (rawEvent.startsWith('data: ')) {
              const dataStr = rawEvent.slice(6).trim();
              if (!dataStr) continue;
              try {
                const payload = JSON.parse(dataStr);
                
                if (payload.type === 'event') {
                  const ev = payload.event;
                  if (ev.type === 'agent_start' && ev.agent === 'PlannerAgent') {
                    setState("processing");
                    setMessage("Finding emails that deserve your attention first.");
                  } else if (ev.type === 'agent_start' && ev.agent === 'MemoryAgent') {
                    setState("reasoning");
                    setMessage("Using previous conversations to avoid repetitive replies.");
                  } else if (ev.type === 'agent_start' && ev.agent === 'VerificationAgent') {
                    setState("reasoning");
                    setMessage("Double-checking everything before suggesting an action.");
                    setInsight("Comparing urgency, VIP status, and previous interactions.");
                  }
                }
                
                if (payload.type === 'result') {
                  setActions(payload.actions ?? []);
                }
              } catch (e) {
                console.error("Parse error on chunk:", dataStr);
              }
            }
          }
        }
      } catch (err: any) {
        if (err.name !== "AbortError" && !(err.message || "").toLowerCase().includes("abort")) {
          setError(typeof err === "string" ? err : err instanceof Error ? err.message : "Failed to analyze workspace");
        }
      } finally {
        setState("reasoning");
        setMessage("Checking for forgotten follow-ups...");
        
        const followupEndpoint = mode === "demo" ? "/api/demo/followup/check" : "/api/followup/check";
        fetch(followupEndpoint)
          .then((res) => (res.ok ? res.json() : { insights: [] }))
          .then((data) => {
            setInsights(data.insights ?? []);
          })
          .catch(console.error)
          .finally(() => {
            setLoading(false);
            setState("completed");
            setMessage("Everything important has been reviewed.");
            setInsight(null);
            
            // Revert to idle after 3 seconds
            setTimeout(() => {
              setState("idle");
              setMessage("Monitoring quietly in the background.");
            }, 4000);
          });
      }
    };
    runPipeline();
    
    return () => {
      abortController.abort();
      pendingExecutions.forEach((timeout) => clearTimeout(timeout));
    };
  }, []);

  const onDismiss = (id: string) => {
    setActions((prev) => prev.filter((a) => a.id !== id));
    setInsights((prev) => prev.filter((i) => i.proposedAction?.id !== id));
    toast.info("Action dismissed.");
  };

  const executeAction = async (action: StagedAction) => {
    try {
      const execEndpoint = mode === "demo" ? "/api/demo/execute" : "/api/execute";
      const res = await fetch(execEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionType: action.type, payload: action.payload }),
      });
      if (!res.ok) throw new Error("Execution failed");
    } catch (err) {
      toast.error("Execution failed.", { description: err instanceof Error ? err.message : "Unknown error" });
      // Revert optimistic removal on error
      if (action.type === 'draft_email') {
         setActions(prev => [action, ...prev]);
      } else {
         setInsights(prev => [...prev, { id: 'restored', threadId: '', originalSubject: '', replyFrom: '', replySnippet: '', detectedAt: '', proposedAction: action }]);
      }
    }
  };

  const onApprove = (action: StagedAction) => {
    // 1. Optimistically remove from UI
    setActions((prev) => prev.filter((a) => a.id !== action.id));
    setInsights((prev) => prev.filter((i) => i.proposedAction?.id !== action.id));
    
    // Update live intelligence
    const isEmail = action.type === 'draft_email';
    setState(isEmail ? 'drafting' : 'scheduling');
    setMessage(isEmail ? 'Drafting a reply...' : 'Cross-checking your calendar...');
    setInsight(isEmail ? "Preparing a response you'll review before anything is sent." : "Making sure suggested meetings don't conflict.");

    // 2. Set timeout for execution
    const timeoutId = setTimeout(() => {
      executeAction(action);
      setPendingExecutions((prev) => {
        const next = new Map(prev);
        next.delete(action.id);
        return next;
      });
      // Revert intelligence state back to idle if queue is empty
      setTimeout(() => {
         setState("idle");
         setMessage("Monitoring quietly in the background.");
         setInsight(null);
      }, 3000);
    }, 5000);

    setPendingExecutions((prev) => new Map(prev).set(action.id, timeoutId));

    // 3. Show undo toast
    toast.success(isEmail ? "Email sent." : "Event scheduled.", {
      description: "Action executed successfully.",
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
      action: {
        label: "Undo",
        onClick: () => {
          clearTimeout(timeoutId);
          setPendingExecutions((prev) => {
            const next = new Map(prev);
            next.delete(action.id);
            return next;
          });
          // Restore to UI
          if (isEmail) {
             setActions(prev => [action, ...prev]);
          } else {
             setInsights(prev => [...prev, { id: `restored-${action.id}`, threadId: '', originalSubject: '', replyFrom: 'restored', replySnippet: 'restored', detectedAt: '', proposedAction: action }]);
          }
          toast.info("Action undone.");
          setState("idle");
          setMessage("Monitoring quietly in the background.");
          setInsight(null);
        }
      }
    });
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input (edge case, not really applicable here but good practice)
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === "ArrowDown" || e.key === "j") {
        setFocusedIndex((prev) => Math.min(prev + 1, unifiedQueue.length - 1));
      } else if (e.key === "ArrowUp" || e.key === "k") {
        setFocusedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter" || (e.metaKey && e.key === "Enter")) {
        const action = unifiedQueue[focusedIndex];
        if (action) onApprove(action);
      } else if (e.key === "Backspace" || e.key === "Delete") {
        const action = unifiedQueue[focusedIndex];
        if (action) onDismiss(action.id);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [unifiedQueue, focusedIndex, pendingExecutions]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <AlertCircle className="w-10 h-10 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Sync Failed</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2">{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
        <span className="ml-3 text-sm font-medium text-gray-500">Syncing inbox...</span>
      </div>
    );
  }

  if (unifiedQueue.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-24 text-center"
      >
        <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mb-4">
          <ShieldCheck className="w-6 h-6 text-emerald-500" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Inbox Zero</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">You are all caught up. AI is monitoring your inbox.</p>
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4 mb-6">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          {unifiedQueue.length} items need attention
        </h1>
        <div className="flex items-center gap-2">
           <span className="relative flex h-2.5 w-2.5">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
             <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
           </span>
           <span className="text-xs font-medium text-gray-500">Live Sync</span>
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        {unifiedQueue.map((action, index) => (
          <QueueItemCard
            key={action.id}
            action={action}
            isFocused={index === focusedIndex}
            onApprove={onApprove}
            onDismiss={onDismiss}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
