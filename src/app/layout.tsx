import type { Metadata } from "next";
import { Inter, Playfair_Display, Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import "./globals.css";

import { LiveIntelligenceProvider } from "@/lib/contexts/LiveIntelligenceContext";
import { LiveIntelligence } from "@/components/LiveIntelligence";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant",
});

export const metadata: Metadata = {
  title: "Oversight.ai — Proactive AI Productivity",
  description:
    "Oversight.ai monitors your Gmail and Calendar, detects missed commitments, and executes resolutions with one click — powered by Gemini.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
      </head>
      <body
        className={`${inter.variable} ${playfair.variable} ${cormorant.variable} ${plusJakarta.variable} font-sans text-[#FAFAFA] bg-[#09090B] antialiased`}
      >
        <SessionProvider>
          <LiveIntelligenceProvider>
            {children}
            <LiveIntelligence />
          </LiveIntelligenceProvider>
        </SessionProvider>
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#111113",
              border: "1px solid rgba(42, 42, 42, 0.8)",
              color: "#FAFAFA",
              boxShadow: "0 10px 40px -10px rgba(0,0,0,0.8)",
              borderRadius: "4px",
              fontSize: "13px",
            },
          }}
        />
      </body>
    </html>
  );
}
