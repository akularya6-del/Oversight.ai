"use client";

import { HeroSection } from "./landing/HeroSection";
import { ProblemSection } from "./landing/ProblemSection";
import { SolutionSection } from "./landing/SolutionSection";
import { WorkflowSection } from "./landing/WorkflowSection";
import { LiveIntelligenceSection } from "./landing/LiveIntelligenceSection";
import { ArchitectureSection } from "./landing/ArchitectureSection";
import { TechStackSection } from "./landing/TechStackSection";
import { SecuritySection } from "./landing/SecuritySection";
import { FeaturesSection } from "./landing/FeaturesSection";
import { DemoShowcaseSection } from "./landing/DemoShowcaseSection";
import { MetricsSection } from "./landing/MetricsSection";
import { JudgeSection } from "./landing/JudgeSection";
import { FAQSection } from "./landing/FAQSection";
import { CTASection } from "./landing/CTASection";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { LayoutDashboard } from "lucide-react";

export default function ShowcaseClient({
  isAuthenticated,
}: {
  isAuthenticated: boolean;
}) {
  return (
    <main className="min-h-screen bg-[#09090B] text-[#FAFAFA] overflow-x-hidden font-sans relative selection:bg-emerald-500/30 selection:text-emerald-200">
      
      {/* Premium Navbar */}
      <nav className="fixed top-0 inset-x-0 h-16 z-50 bg-[#09090B]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-black rounded-full" />
            </div>
            <span className="font-bold tracking-tight text-white">Oversight</span>
          </div>

          <div className="flex items-center gap-6">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-sm font-semibold text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link href="/demo" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors hidden sm:block">
                  Interactive Demo
                </Link>
                <button
                  onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                  className="text-sm font-semibold text-black bg-white hover:bg-zinc-200 px-4 py-2 rounded-full transition-colors"
                >
                  Log In
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Sections */}
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <WorkflowSection />
      <LiveIntelligenceSection />
      <ArchitectureSection />
      <TechStackSection />
      <SecuritySection />
      <FeaturesSection />
      <DemoShowcaseSection />
      <MetricsSection />
      <JudgeSection />
      <FAQSection />
      <CTASection />

      {/* Footer */}
      <footer className="py-8 text-center text-xs text-zinc-600 border-t border-white/5">
        &copy; {new Date().getFullYear()} Oversight AI. All rights reserved. Built for the Google AI Hackathon.
      </footer>
    </main>
  );
}
