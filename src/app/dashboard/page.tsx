import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ApprovalQueue } from "@/components/ApprovalQueue";
import { DailyBrief } from "@/components/DailyBrief";
import { Loader2, Sparkles } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  const userName = session.user.name ?? "there";

  return (
    <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-10">

      {/* ── AI Daily Brief ── */}
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

        <Suspense
          fallback={
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border-2 border-violet-500/20 animate-ping" />
                <div className="absolute inset-1 rounded-full border-2 border-violet-500/40 animate-spin" style={{ animationDuration: "2s" }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-violet-400" />
                </div>
              </div>
              <p className="text-sm text-slate-500">Preparing your daily brief...</p>
            </div>
          }
        >
          <DailyBrief userName={userName} isDemo={false} />
        </Suspense>
      </section>

      {/* ── Divider ── */}
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
      <section>
        <Suspense
          fallback={
            <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3 elegant-card rounded-2xl">
              <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
              <p className="text-sm font-medium text-slate-500">Loading workspace...</p>
            </div>
          }
        >
          <ApprovalQueue />
        </Suspense>
      </section>

    </main>
  );
}
