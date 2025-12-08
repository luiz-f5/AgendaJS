"use client";
import { useEffect } from "react";

interface ToastProps {
  message: string;
  type: "success" | "warn" | "error" | "danger";
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, 10000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  const styles: Record<string, { bg: string; border: string }> = {
    success: { bg: "var(--success-color)", border: "2px solid var(--success-color-light)" },
    warn: { bg: "var(--warn-color)", border: "2px solid var(--warn-color-light)" },
    error: { bg: "var(--error-color)", border: "2px solid var(--error-color-light)" },
    danger: { bg: "var(--color-danger)", border: "2px solid var(--error-color-light)" },
  };

  return (
    <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
      <div
        className="px-6 py-3 shadow-lg animate-fadeInOut text-center text-white font-semibold"
        style={{
          backgroundColor: styles[type].bg,
          border: styles[type].border,
          borderRadius: "999px",
        }}
      >
        {message}
      </div>
    </div>
  );
}
