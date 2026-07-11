"use client";

import Link from "next/link";
import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";

type Action = {
  id?: string;
  label: string;
  subtitle?: string;
  href?: string;
  onClick?: () => void;
};

type ActionSheetProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  actions: Action[];
};

export function ActionSheet({
  open,
  onClose,
  title = "Quick log",
  actions,
}: ActionSheetProps) {
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
        className="absolute inset-0 bg-black/60 transition-opacity"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-lg rounded-t-xl border border-outline-variant bg-surface-container-high p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-[0_-8px_32px_rgba(0,0,0,0.35)]"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id={titleId} className="font-label text-secondary">
            {title}
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="touch-target inline-flex items-center justify-center text-on-surface-variant transition-colors hover:text-on-surface"
            aria-label="Dismiss"
          >
            <X className="size-5" />
          </button>
        </div>
        <ul className="space-y-2">
          {actions.map((action) => {
            const className =
              "block w-full min-h-11 rounded border border-outline-variant bg-surface-container px-4 py-3 text-left transition-colors duration-200 hover:bg-surface-variant active:bg-surface-variant";
            const body = (
              <>
                <p className="font-semibold text-on-surface">{action.label}</p>
                {action.subtitle ? (
                  <p className="mt-0.5 text-sm text-on-surface-variant">
                    {action.subtitle}
                  </p>
                ) : null}
              </>
            );
            return (
              <li key={action.id ?? `${action.label}-${action.href ?? "fn"}`}>
                {action.href ? (
                  <Link
                    href={action.href}
                    onClick={onClose}
                    className={className}
                  >
                    {body}
                  </Link>
                ) : (
                  <button
                    type="button"
                    className={className}
                    onClick={() => {
                      action.onClick?.();
                      onClose();
                    }}
                  >
                    {body}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
