"use client";

import { useEffect, useState } from "react";
import { parseLogoImage } from "./parse-logo-image";
import { Canvas, ShaderParams } from "./canvas";

export function LiquidLogo({ src, className }: { src: string; className?: string }) {
  const [imageData, setImageData] = useState<ImageData | null>(null);

  const params: ShaderParams = {
    patternScale: 2.0,
    refraction: 0.015,
    edge: 0.4,
    patternBlur: 0.005,
    liquid: 0.07,
    speed: 0.3,
  };

  useEffect(() => {
    parseLogoImage(src)
      .then((res) => setImageData(res.imageData))
      .catch(console.error);
  }, [src]);

  return (
    <div className={className}>
      {imageData ? (
        <Canvas imageData={imageData} params={params} processing={false} />
      ) : (
        <div className="w-full h-full flex items-center justify-center opacity-50">
          Loading Logo...
        </div>
      )}
    </div>
  );
}
