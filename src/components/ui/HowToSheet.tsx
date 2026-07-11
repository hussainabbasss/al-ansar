"use client";

import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import { PrimaryButton } from "./Buttons";

type HowToSheetProps = {
  open: boolean;
  title: string;
  howTo: string;
  onClose: () => void;
};

export function HowToSheet({ open, title, howTo, onClose }: HowToSheetProps) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[var(--z-overlay)] flex items-end justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-t-xl border border-outline-variant bg-surface-container-high p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-[0_-8px_32px_rgba(0,0,0,0.35)]"
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-label text-secondary">How to perform</p>
            <h2
              id={titleId}
              className="font-display text-xl font-semibold text-on-surface"
            >
              {title}
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="touch-target inline-flex shrink-0 items-center justify-center text-on-surface-variant hover:text-on-surface"
            aria-label="Dismiss"
          >
            <X className="size-5" />
          </button>
        </div>
        <p className="mb-6 text-sm leading-relaxed whitespace-pre-wrap text-on-surface-variant">
          {howTo}
        </p>
        <PrimaryButton variant="gold" onClick={onClose}>
          Got it
        </PrimaryButton>
      </div>
    </div>
  );
}
