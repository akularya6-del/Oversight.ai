"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Sun, Moon, Sunset, RefreshCw, Search, ChevronDown, ChevronUp,
  Mail, Calendar, DollarSign, AlertTriangle, User, Bell,
  TrendingUp, Clock, CheckCircle, Zap, Filter, Loader2,
  ArrowRight, Sparkles, MessageSquare, BarChart2,
} from "lucide-react";
import type { DailyBriefResult, BriefEmailCard, BriefInsight } from "@/lib/ai/daily-brief";

// ─── Helpers ────────────────────────────────────────────────────────────────

function getGreeting(name: string): { icon: React.ReactNode; greeting: string } {
  const hour = new Date().getHours();
  if (hour < 12) return { icon: <Sun className="w-5 h-5 text-amber-400" />, greeting: `Good morning, ${name.split(" ")[0]}` };
  if (hour < 17) return { icon: <Sun className="w-5 h-5 text-amber-400" />, greeting: `Good afternoon, ${name.split(" ")[0]}` };
  if (hour < 21) return { icon: <Sunset className="w-5 h-5 text-orange-400" />, greeting: `Good evening, ${name.split(" ")[0]}` };
  return { icon: <Moon className="w-5 h-5 text-indigo-400" />, greeting: `Good night, ${name.split(" ")[0]}` };
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const CATEGORY_META: Record<BriefEmailCard["category"], { icon: React.ReactNode; label: string; color: string }> = {
  urgent: { icon: <AlertTriangle className="w-3.5 h-3.5" />, label: "Urgent", color: "text-red-400 bg-red-500/10 border-red-500/20" },
  meeting: { icon: <Calendar className="w-3.5 h-3.5" />, label: "Meeting", color: "text-violet-400 bg-violet-500/10 border-violet-500/20" },
  client: { icon: <User className="w-3.5 h-3.5" />, label: "Client", color: "text-sky-400 bg-sky-500/10 border-sky-500/20" },
  finance: { icon: <DollarSign className="w-3.5 h-3.5" />, label: "Finance", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  personal: { icon: <User className="w-3.5 h-3.5" />, label: "Personal", color: "text-pink-400 bg-pink-500/10 border-pink-500/20" },
  notification: { icon: <Bell className="w-3.5 h-3.5" />, label: "Notification", color: "text-slate-400 bg-slate-500/10 border-slate-500/20" },
  newsletter: { icon: <Mail className="w-3.5 h-3.5" />, label: "Newsletter", color: "text-slate-400 bg-slate-500/10 border-slate-500/20" },
  other: { icon: <Mail className="w-3.5 h-3.5" />, label: "Other", color: "text-slate-400 bg-slate-500/10 border-slate-500/20" },
};

const PRIORITY_META: Record<BriefEmailCard["priority"], { label: string; dot: string; badge: string }> = {
  critical: { label: "CRITICAL", dot: "bg-red-500", badge: "text-red-400 border-red-500/30 bg-red-500/10" },
  high: { label: "HIGH", dot: "bg-amber-400", badge: "text-amber-400 border-amber-500/30 bg-amber-500/10" },
  normal: { label: "NORMAL", dot: "bg-emerald-500", badge: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" },
  low: { label: "LOW", dot: "bg-slate-500", badge: "text-slate-400 border-slate-500/30 bg-slate-500/10" },
};

const INSIGHT_META: Record<BriefInsight["type"], { icon: React.ReactNode; color: string }> = {
  warning: { icon: <AlertTriangle className="w-3.5 h-3.5 shrink-0" />, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  info: { icon: <BarChart2 className="w-3.5 h-3.5 shrink-0" />, color: "text-sky-400 bg-sky-500/10 border-sky-500/20" },
  opportunity: { icon: <TrendingUp className="w-3.5 h-3.5 shrink-0" />, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  relationship: { icon: <User className="w-3.5 h-3.5 shrink-0" />, color: "text-violet-400 bg-violet-500/10 border-violet-500/20" },
};

const LOADING_STEPS = [
  "Reading today's emails...",
  "Understanding conversations...",
  "Finding important commitments...",
  "Grouping related discussions...",
  "Detecting themes and patterns...",
  "Preparing your daily briefing...",
];

type FilterType = "all" | "urgent" | "vip" | "meeting" | "finance" | "personal" | "needsReply";

// ─── Sub-components ─────────────────────────────────────────────────────────

function StatChip({ label, value, icon, color }: {
  label: string; value: number; icon: React.ReactNode; color?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 px-4 py-3 rounded-xl bg-[#111113] border border-[#1E1E20] min-w-[80px]">
      <div className={`${color ?? "text-slate-400"}`}>{icon}</div>
      <span className={`text-xl font-bold tabular-nums ${color ?? "text-[#FAFAFA]"}`}>{value}</span>
      <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium text-center leading-tight">{label}</span>
    </div>
  );
}

function InsightPill({ insight }: { insight: BriefInsight }) {
  const meta = INSIGHT_META[insight.type];
  return (
    <div className={`flex items-start gap-2 px-3 py-2.5 rounded-lg border text-xs font-medium ${meta.color}`}>
      {meta.icon}
      <span className="leading-snug">{insight.text}</span>
    </div>
  );
}

function EmailCard({ card, query }: { card: BriefEmailCard; query: string }) {
  const [expanded, setExpanded] = useState(false);
  const cat = CATEGORY_META[card.category];
  const pri = PRIORITY_META[card.priority];

  const highlight = (text: string) => {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    return text.replace(regex, `<mark class="bg-amber-400/30 text-amber-200 rounded px-0.5">$1</mark>`);
  };

  return (
    <div
      className={`rounded-xl border transition-all duration-200 overflow-hidden ${
        card.priority === "critical"
          ? "border-red-500/30 bg-red-500/5"
          : card.priority === "high"
          ? "border-amber-500/20 bg-[#111113]"
          : "border-[#1E1E20] bg-[#111113]"
      }`}
    >
      {/* Card Header */}
      <button
        className="w-full text-left p-4 flex items-start gap-3 group"
        onClick={() => setExpanded((e) => !e)}
        aria-expanded={expanded}
      >
        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2A2A2A] to-[#1E1E20] border border-[#2A2A2A] flex items-center justify-center text-sm font-bold text-[#FAFAFA]/80 shrink-0">
          {card.sender.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="min-w-0">
              <span
                className="text-sm font-semibold text-[#FAFAFA] truncate block"
                dangerouslySetInnerHTML={{ __html: highlight(card.sender) }}
              />
              <span
                className="text-xs text-slate-500 truncate block"
                dangerouslySetInnerHTML={{ __html: highlight(card.senderEmail) }}
              />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] text-slate-600">{timeAgo(card.date)}</span>
              {expanded ? (
                <ChevronUp className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition-colors" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition-colors" />
              )}
            </div>
          </div>

          <p
            className="text-[13px] font-medium text-[#FAFAFA]/90 mb-2 leading-snug"
            dangerouslySetInnerHTML={{ __html: highlight(card.subject) }}
          />
          <p
            className="text-xs text-slate-400 leading-relaxed line-clamp-2"
            dangerouslySetInnerHTML={{ __html: highlight(card.summary) }}
          />

          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {/* Category */}
            <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md border ${cat.color}`}>
              {cat.icon}
              {cat.label}
            </span>
            {/* Priority */}
            <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-md border tracking-wider ${pri.badge}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${pri.dot}`} />
              {pri.label}
            </span>
            {/* Needs Reply */}
            {card.needsReply && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md border text-violet-400 bg-violet-500/10 border-violet-500/20">
                <MessageSquare className="w-3 h-3" />
                Needs Reply
              </span>
            )}
            {/* Confidence */}
            <span className="text-[10px] text-slate-600 ml-auto">{card.confidence}% confidence</span>
          </div>
        </div>
      </button>

      {/* Suggested Action Bar */}
      {!expanded && (
        <div className="px-4 pb-3 flex items-center gap-2">
          <ArrowRight className="w-3 h-3 text-emerald-500 shrink-0" />
          <span className="text-xs text-emerald-400/80 font-medium">{card.suggestedAction}</span>
        </div>
      )}

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-[#1E1E20] divide-y divide-[#1A1A1C]">
          {/* Snippet */}
          <div className="px-4 py-3">
            <p className="text-[10px] uppercase tracking-wider text-slate-600 font-medium mb-1.5">Original Snippet</p>
            <p className="text-xs text-slate-400 italic leading-relaxed">&ldquo;{card.snippet}&rdquo;</p>
          </div>

          {/* AI Reasoning */}
          <div className="px-4 py-3">
            <p className="text-[10px] uppercase tracking-wider text-slate-600 font-medium mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-violet-400" />
              AI Reasoning
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">{card.aiReasoning}</p>
          </div>

          {/* Suggested Action */}
          <div className="px-4 py-3 bg-emerald-500/5">
            <p className="text-[10px] uppercase tracking-wider text-emerald-600 font-medium mb-1.5 flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Suggested Action
            </p>
            <p className="text-xs text-emerald-400 font-medium">{card.suggestedAction}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Loading Screen ──────────────────────────────────────────────────────────

function BriefLoadingState() {
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setStepIdx((i) => (i + 1) % LOADING_STEPS.length);
    }, 900);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-24 gap-6">
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 animate-ping" />
        <div className="absolute inset-1 rounded-full border-2 border-emerald-500/40 animate-spin" style={{ animationDuration: "2s" }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-emerald-400" />
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-[#FAFAFA]/80 mb-1 transition-all duration-300">{LOADING_STEPS[stepIdx]}</p>
        <p className="text-xs text-slate-600">Gemini is analyzing your inbox</p>
      </div>
      <div className="flex gap-1">
        {LOADING_STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-1 rounded-full transition-all duration-300 ${i === stepIdx ? "w-5 bg-emerald-500" : "w-1.5 bg-[#2A2A2A]"}`}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

interface DailyBriefProps {
  userName: string;
  isDemo?: boolean;
}

export function DailyBrief({ userName, isDemo = false }: DailyBriefProps) {
  const [brief, setBrief] = useState<DailyBriefResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchBrief = useCallback(async (forceRefresh = false) => {
    if (forceRefresh) setIsRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (isDemo) params.set("demo", "true");
      if (forceRefresh) params.set("refresh", "true");

      const res = await fetch(`/api/daily-brief?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load brief");
      const data: DailyBriefResult = await res.json();
      setBrief(data);
      setLastRefreshed(new Date());
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [isDemo]);

  useEffect(() => {
    fetchBrief();
    // Auto-refresh every 15 minutes
    const interval = setInterval(() => fetchBrief(true), 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchBrief]);

  const { icon: greetingIcon, greeting } = getGreeting(userName);

  const filteredCards = useMemo(() => {
    if (!brief) return [];
    let cards = brief.emailCards;

    if (query.trim()) {
      const q = query.toLowerCase();
      cards = cards.filter(
        (c) =>
          c.sender.toLowerCase().includes(q) ||
          c.subject.toLowerCase().includes(q) ||
          c.summary.toLowerCase().includes(q) ||
          c.senderEmail.toLowerCase().includes(q) ||
          c.suggestedAction.toLowerCase().includes(q)
      );
    }

    switch (activeFilter) {
      case "urgent": return cards.filter((c) => c.priority === "critical" || c.category === "urgent");
      case "vip": return cards.filter((c) => c.priority === "critical" || c.priority === "high");
      case "meeting": return cards.filter((c) => c.category === "meeting");
      case "finance": return cards.filter((c) => c.category === "finance");
      case "personal": return cards.filter((c) => c.category === "personal");
      case "needsReply": return cards.filter((c) => c.needsReply);
      default: return cards;
    }
  }, [brief, query, activeFilter]);

  const FILTERS: { id: FilterType; label: string; icon: React.ReactNode }[] = [
    { id: "all", label: "All", icon: <Mail className="w-3 h-3" /> },
    { id: "urgent", label: "Urgent", icon: <AlertTriangle className="w-3 h-3" /> },
    { id: "vip", label: "Important", icon: <TrendingUp className="w-3 h-3" /> },
    { id: "meeting", label: "Meetings", icon: <Calendar className="w-3 h-3" /> },
    { id: "finance", label: "Finance", icon: <DollarSign className="w-3 h-3" /> },
    { id: "needsReply", label: "Needs Reply", icon: <MessageSquare className="w-3 h-3" /> },
  ];

  if (loading) return <BriefLoadingState />;

  if (error && !brief) {
    return (
      <div className="text-center py-16">
        <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-3" />
        <p className="text-sm text-slate-400">Failed to load your brief</p>
        <button
          onClick={() => fetchBrief()}
          className="mt-4 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!brief) return null;

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {greetingIcon}
            <h2 className="text-lg font-bold text-[#FAFAFA]">{greeting}</h2>
          </div>
          <p className="text-xs text-slate-500">
            Here&apos;s what happened in the last 24 hours
            {isDemo && <span className="ml-2 text-amber-400 font-medium">· Demo Mode</span>}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {lastRefreshed && (
            <span className="text-[10px] text-slate-600 hidden sm:block">
              Updated {timeAgo(lastRefreshed.toISOString())}
            </span>
          )}
          <button
            onClick={() => fetchBrief(true)}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-[#FAFAFA] transition-colors px-3 py-1.5 rounded-lg border border-[#2A2A2A] hover:border-[#3A3A3A] bg-[#111113] disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="overflow-x-auto pb-1">
        <div className="flex gap-2 min-w-max">
          <StatChip label="Emails" value={brief.stats.total} icon={<Mail className="w-4 h-4" />} />
          <StatChip label="Important" value={brief.stats.important} icon={<TrendingUp className="w-4 h-4" />} color="text-emerald-400" />
          <StatChip label="Urgent" value={brief.stats.urgent} icon={<AlertTriangle className="w-4 h-4" />} color="text-red-400" />
          <StatChip label="Meetings" value={brief.stats.meetings} icon={<Calendar className="w-4 h-4" />} color="text-violet-400" />
          <StatChip label="Invoices" value={brief.stats.invoices} icon={<DollarSign className="w-4 h-4" />} color="text-emerald-400" />
          <StatChip label="Needs Reply" value={brief.stats.needsReply} icon={<MessageSquare className="w-4 h-4" />} color="text-amber-400" />
          <StatChip label="Follow-ups" value={brief.stats.followUps} icon={<Clock className="w-4 h-4" />} color="text-sky-400" />
        </div>
      </div>

      {/* ── Executive Summary ── */}
      <div className="p-4 rounded-xl border border-[#2A2A2A] bg-gradient-to-br from-[#111113] to-[#0D0D0F]">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-violet-400" />
          <span className="text-[11px] uppercase tracking-wider font-bold text-violet-400">Executive Summary</span>
        </div>
        <p className="text-sm text-[#FAFAFA]/80 leading-relaxed">{brief.overview}</p>

        {/* Themes */}
        {brief.themes.length > 0 && (
          <div className="mt-3 pt-3 border-t border-[#1E1E20] flex flex-wrap gap-1.5">
            {brief.themes.map((theme) => (
              <span
                key={theme}
                className="text-[10px] px-2 py-0.5 rounded-full border border-violet-500/20 bg-violet-500/10 text-violet-400 font-medium"
              >
                {theme}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Insights ── */}
      {brief.insights.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500">AI Insights</span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {brief.insights.map((insight, i) => (
              <InsightPill key={i} insight={insight} />
            ))}
          </div>
        </div>
      )}

      {/* ── Email Cards Section ── */}
      <div>
        {/* Section header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
              Important Emails
            </span>
          </div>
          <span className="text-[10px] text-slate-600">{filteredCards.length} shown</span>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by sender, subject, or keyword..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#111113] border border-[#1E1E20] rounded-lg text-[#FAFAFA] placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
          <Filter className="w-3.5 h-3.5 text-slate-600 shrink-0 mt-1.5" />
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-lg border transition-all whitespace-nowrap ${
                activeFilter === f.id
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                  : "border-[#1E1E20] bg-[#111113] text-slate-500 hover:text-slate-300 hover:border-[#2A2A2A]"
              }`}
            >
              {f.icon}
              {f.label}
            </button>
          ))}
        </div>

        {/* Cards */}
        {filteredCards.length === 0 ? (
          <div className="text-center py-10">
            <Mail className="w-6 h-6 text-slate-700 mx-auto mb-2" />
            <p className="text-sm text-slate-600">
              {query ? `No emails matching "${query}"` : "No emails in this category"}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredCards.map((card) => (
              <EmailCard key={card.id} card={card} query={query} />
            ))}
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="pt-2 flex items-center justify-center gap-2">
        <Loader2 className="w-3 h-3 text-slate-700" />
        <p className="text-[10px] text-slate-700">
          Auto-refreshes every 15 minutes · Generated by Gemini 2.5 Flash
        </p>
      </div>
    </div>
  );
}
