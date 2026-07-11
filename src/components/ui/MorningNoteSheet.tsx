"use client";

import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import { PrimaryButton } from "./Buttons";

type MorningNoteSheetProps = {
  open: boolean;
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
};

export function MorningNoteSheet({
  open,
  value,
  onChange,
  onClose,
}: MorningNoteSheetProps) {
  const titleId = useId();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => textareaRef.current?.focus(), 50);
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener("keydown", onKey);
    };
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
        className="relative w-full max-w-lg rounded-t-xl border border-outline-variant bg-surface-container-high p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-[0_-8px_32px_rgba(0,0,0,0.35)]"
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="font-label text-secondary">Daily log</p>
            <h2
              id={titleId}
              className="font-display truncate text-xl font-semibold"
            >
              Morning note
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="touch-target inline-flex shrink-0 items-center justify-center text-on-surface-variant hover:text-on-surface"
            aria-label="Dismiss"
          >
            <X className="size-5" />
          </button>
        </div>
        <p className="mb-3 text-sm leading-relaxed text-on-surface-variant">
          Capture your state of mind as the day begins.
        </p>
        <label className="sr-only" htmlFor="morning-note">
          Morning note
        </label>
        <textarea
          id="morning-note"
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={(e) => onChange(e.target.value)}
          placeholder="Intention, fatigue, gratitude…"
          className="mb-3 h-28 w-full resize-none rounded border border-outline-variant bg-surface-container-lowest p-3 text-sm leading-relaxed text-on-surface placeholder:text-on-surface-variant/50 focus:border-secondary focus:outline-none"
        />
        <p className="font-data mb-3 text-right text-[10px] text-on-surface-variant">
          Stored on this device
        </p>
        <PrimaryButton variant="gold" onClick={onClose}>
          Done
        </PrimaryButton>
      </div>
    </div>
  );
}
