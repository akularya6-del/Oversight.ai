"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

type LiquidGlassCardProps = {
  children: React.ReactNode;
  className?: string;
  borderRadius?: number;
  type?: "rounded" | "pill" | "circle";
  tintOpacity?: number;
};

export function LiquidGlassCard({
  children,
  className,
  borderRadius = 24,
  type = "rounded",
  tintOpacity = 0.1,
}: LiquidGlassCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!isLoaded || !containerRef.current || !window.Container) return;

    // We instantiate the vanilla JS container
    const container = new window.Container({
      borderRadius,
      type,
      tintOpacity,
    });

    // Mount it into the DOM
    const el = containerRef.current;
    
    // Create a wrapper for the generated canvas and the react children
    const glassEl = container.element;
    glassEl.style.position = "absolute";
    glassEl.style.inset = "0";
    glassEl.style.zIndex = "0";
    
    el.appendChild(glassEl);

    // Keep it responsive
    const handleResize = () => container.updateSizeFromDOM();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (el.contains(glassEl)) {
        el.removeChild(glassEl);
      }
    };
  }, [isLoaded, borderRadius, type, tintOpacity]);

  return (
    <>
      <Script 
        src="https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js" 
        strategy="lazyOnload"
      />
      <Script 
        src="/visuals/container.js" 
        strategy="lazyOnload"
        onLoad={() => setIsLoaded(true)}
      />
      <div 
        ref={containerRef} 
        className={`relative overflow-hidden ${className}`}
        style={{ borderRadius: `${borderRadius}px` }}
      >
        <div className="relative z-10 h-full w-full">
          {children}
        </div>
      </div>
    </>
  );
}

// Add types for the global window object where liquid-glass-js attaches
declare global {
  interface Window {
    Container: any;
    Button: any;
  }
}
