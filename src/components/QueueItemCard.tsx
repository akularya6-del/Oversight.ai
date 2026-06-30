"use client";

import { motion } from "framer-motion";
import { Check, X, Calendar, Mail, Loader2 } from "lucide-react";
import { StagedAction, EmailPayload, EventPayload } from "@/types/actions";
import { cn } from "@/lib/utils";

type Props = {
  action: StagedAction;
  isFocused?: boolean;
  onApprove: (action: StagedAction) => void;
  onDismiss: (id: string) => void;
};

export function QueueItemCard({ action, isFocused = false, onApprove, onDismiss }: Props) {
  const isExecuting = action.status === "executing";
  const isVip = action.priority === "high" || action.senderProfile?.tier === "vip";
  
  // Format the context and action to be extremely human readable
  let actionDescription = "";
  let payloadDetails = null;

  if (action.type === "draft_email") {
    const payload = action.payload as EmailPayload;
    actionDescription = `Draft email to ${payload.to}`;
    payloadDetails = payload.body;
  } else {
    const payload = action.payload as EventPayload;
    const startDate = new Date(payload.startDateTime);
    const dateStr = startDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    const timeStr = startDate.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
    actionDescription = `Schedule "${payload.title}" for ${dateStr} at ${timeStr}`;
    payloadDetails = `Guests: ${payload.attendees.join(", ")}`;
  }

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -50, scale: 0.95 }}
      className={cn(
        "group flex flex-col md:flex-row md:items-start justify-between gap-6 p-5 w-full bg-white dark:bg-[#18181B] border border-gray-200 dark:border-gray-800 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md",
        isVip && "border-l-4 border-l-emerald-500",
        isExecuting && "opacity-60 pointer-events-none scale-[0.98]",
        isFocused && "ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-[#09090B]"
      )}
    >
      <div className="flex-1 space-y-4">
        {/* Context / Trigger */}
        <div className="space-y-1">
           <div className="flex items-center gap-2">
             {isVip && <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full">VIP Priority</span>}
             {action.senderProfile && <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{action.senderProfile.name}</span>}
           </div>
           <p className="text-sm text-gray-600 dark:text-gray-300 border-l-2 border-gray-200 dark:border-gray-700 pl-3 italic">
              &quot;{action.reasoning}&quot;
           </p>
        </div>

        {/* Proposed Action */}
        <div className="bg-gray-50 dark:bg-[#27272A] rounded-lg p-3 flex items-start gap-3">
           {action.type === 'draft_email' ? <Mail className="w-4 h-4 mt-0.5 text-gray-500" /> : <Calendar className="w-4 h-4 mt-0.5 text-gray-500" />}
           <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{actionDescription}</p>
              {payloadDetails && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{payloadDetails}</p>}
           </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-row md:flex-col gap-2 shrink-0 md:w-32 justify-end md:justify-start">
         <button
           onClick={() => onApprove(action)}
           disabled={isExecuting}
           className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-all"
         >
           {isExecuting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
           Approve
         </button>
         <button
           onClick={() => onDismiss(action.id)}
           disabled={isExecuting}
           className="flex-1 flex items-center justify-center gap-2 bg-transparent hover:bg-gray-100 dark:hover:bg-[#27272A] text-gray-500 dark:text-gray-400 text-sm font-medium py-2 px-4 rounded-lg transition-all"
         >
           <X className="w-4 h-4" />
           Reject
         </button>
      </div>
    </motion.div>
  );
}
