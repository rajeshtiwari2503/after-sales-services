"use client";

import { useEffect, useRef } from "react";

export default function QrCodeImage({ value, size = 80 }: { value: string; size?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let cancelled = false;
    import("qrcode").then(QRCode => {
      if (cancelled || !ref.current) return;
      QRCode.toCanvas(ref.current, value, { width: size, margin: 1, errorCorrectionLevel: "M" });
    });
    return () => { cancelled = true; };
  }, [value, size]);

  return <canvas ref={ref} width={size} height={size} className="mx-auto rounded" aria-label="QR code" />;
}
