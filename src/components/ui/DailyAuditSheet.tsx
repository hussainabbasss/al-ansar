"use client";

import { resolvePrescriptionDua } from "@/lib/spiritual/duas";
import type { StoredDailyAudit } from "@/lib/spiritual/types";

type DailyAuditSheetProps = {
  open: boolean;
  audit: StoredDailyAudit | null;
  onClose: () => void;
};

export function DailyAuditSheet({
  open,
  audit,
  onClose,
}: DailyAuditSheetProps) {
  if (!open || !audit) return null;

  const dua = resolvePrescriptionDua(audit.prescriptionDuaId);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        aria-label="Close daily audit"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="daily-audit-title"
        className="relative z-10 max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-xl border border-outline-variant bg-surface-container p-5 pb-10 sm:rounded-xl"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="font-label text-secondary">Daily Muhasaba</p>
            <h2 id="daily-audit-title" className="font-display text-xl font-semibold">
              {audit.periodLabel}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="font-label text-on-surface-variant hover:text-on-surface"
          >
            Close
          </button>
        </div>

        <section className="mb-4 rounded-lg border border-outline-variant bg-surface-container-low p-4">
          <h3 className="font-label mb-2 text-secondary">Diagnostic</h3>
          <p className="text-sm leading-relaxed text-on-surface-variant">
            {audit.diagnostic}
          </p>
        </section>

        <section className="mb-4 rounded-lg border border-outline-variant bg-surface-container-low p-4">
          <h3 className="font-label mb-2 text-primary">Practical Remedy</h3>
          <p className="text-sm leading-relaxed text-on-surface-variant">
            {audit.remedy}
          </p>
        </section>

        <section className="rounded-lg border border-outline-variant bg-surface-container-high p-4">
          <div className="mb-2 h-px w-12 bg-secondary" aria-hidden />
          <h3 className="font-label mb-1 text-secondary">Spiritual Prescription</h3>
          <p className="font-label mb-2 text-[10px] text-on-surface-variant">
            {dua.source} · {dua.ref}
          </p>
          <p className="font-display mb-2 text-lg font-semibold text-on-surface">
            {dua.title}
          </p>
          {dua.arabic ? (
            <p
              dir="rtl"
              lang="ar"
              className="mb-3 text-right text-base leading-loose text-on-surface"
            >
              {dua.arabic}
            </p>
          ) : null}
          <p className="font-display text-base leading-snug italic text-on-surface">
            {dua.translation}
          </p>
        </section>
      </div>
    </div>
  );
}
