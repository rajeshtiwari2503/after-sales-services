"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Toaster } from "react-hot-toast";

export default function ToasterProvider() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={12}
      containerStyle={{ zIndex: 99999 }}
      containerClassName="!pointer-events-none"
      toastOptions={{
        duration: 4000,
        style: {
          background: "#111827",
          color: "#fff",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "12px",
          padding: "14px 16px",
          fontSize: "14px",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.15)",
          maxWidth: "420px",
          opacity: 1,
        },
        success: {
          iconTheme: {
            primary: "#6366f1",
            secondary: "#fff",
          },
        },
        error: {
          iconTheme: {
            primary: "#ef4444",
            secondary: "#fff",
          },
        },
      }}
    />,
    document.body
  );
}
