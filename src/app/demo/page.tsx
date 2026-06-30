import { Suspense } from "react";
import { ApprovalQueue } from "@/components/ApprovalQueue";
import { DailyBrief } from "@/components/DailyBrief";
import { Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-[#09090B] font-sans text-[#FAFAFA]">
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#09090B]/80 backdrop-blur-md border-b border-[#2A2A2A]/50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          
          <div className="flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400">Demo Mode</span>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-32 space-y-10">
        <div className="mb-2 text-center">
          <h1 className="text-2xl font-bold font-[family-name:--font-cormorant] italic text-purple-400 mb-2">Interactive Demo</h1>
          <p className="text-sm text-gray-500">Experience a simulated inbox. No real data is modified.</p>
        </div>

        {/* ── AI Daily Brief (Demo) ── */}
        <section>
          <div className="flex items-center gap-2 mb-5">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/20">
              <Sparkles className="w-3 h-3 text-violet-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-violet-400">
                Today&apos;s Brief
              </span>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-violet-500/20 to-transparent" />
          </div>

          <Suspense fallback={
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
              <p className="text-sm text-slate-500">Loading demo brief...</p>
            </div>
          }>
            <DailyBrief userName="Anshuman" isDemo={true} />
          </Suspense>
        </section>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#1E1E20]" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-[#09090B] px-3 text-[10px] uppercase tracking-wider text-slate-600 font-medium">
              Action Queue
            </span>
          </div>
        </div>

        {/* ── Approval Queue ── */}
        <Suspense
          fallback={
            <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
              <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
              <p className="text-sm font-medium text-slate-500">Loading demo workspace...</p>
            </div>
          }
        >
          <ApprovalQueue mode="demo" />
        </Suspense>
      </main>
    </div>
  );
}
