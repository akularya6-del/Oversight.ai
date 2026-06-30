import { ContactProfile } from "@/types/actions";
import { Crown } from "lucide-react";

export function ContactBadge({ profile }: { profile: ContactProfile }) {
  const isVip = profile.tier === "vip";

  if (isVip) {
    return (
      <div
        title={profile.relationshipSummary}
        className="inline-flex items-center gap-2 border-b border-[#B7955B] pb-0.5 mb-2 cursor-help"
      >
        <Crown className="w-3.5 h-3.5 text-[#B7955B]" />
        <span className="text-xs font-bold font-[family-name:--font-cormorant] tracking-[0.1em] text-[#2A2A2A] uppercase">
          {profile.name}
        </span>
        <span className="opacity-70 text-[8px] font-bold uppercase tracking-[0.2em] text-[#2A2A2A] ml-1">
          VIP
        </span>
      </div>
    );
  }

  return (
    <div
      title={profile.relationshipSummary}
      className="inline-flex items-center gap-1.5 border-b border-[#2A2A2A]/30 pb-0.5 mb-2 cursor-help"
    >
      <span className="text-xs font-bold font-[family-name:--font-cormorant] tracking-[0.1em] text-[#2A2A2A] uppercase">
        {profile.name}
      </span>
    </div>
  );
}
