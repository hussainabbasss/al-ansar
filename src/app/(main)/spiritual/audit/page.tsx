"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { StackHeader } from "@/components/ui/StackHeader";
import { StatusChip } from "@/components/ui/StatusChip";
import { resolvePrescriptionDua } from "@/lib/spiritual/duas";
import { loadWeeklyAudit } from "@/lib/spiritual/storage";
import type { StoredWeeklyAudit } from "@/lib/spiritual/types";
import { maybeRunWeeklyMuhasaba } from "@/lib/spiritual/weekly";

export default function AuditPage() {
  const [audit, setAudit] = useState<StoredWeeklyAudit | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const existing = await loadWeeklyAudit();
      if (!cancelled) setAudit(existing);
      const generated = await maybeRunWeeklyMuhasaba();
      if (!cancelled) {
        if (generated) setAudit(generated);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const dua = audit
    ? resolvePrescriptionDua(audit.prescriptionDuaId)
    : null;

  return (
    <div className="min-h-full">
      <StackHeader
        title="Weekly Muhasaba"
        eyebrow="Spiritual Audit"
        backHref="/spiritual/"
      />
      <main className="mx-auto max-w-lg px-[var(--margin-mobile)] py-8 pb-12">
        {loading ? (
          <p className="font-data text-on-surface-variant">Loading…</p>
        ) : !audit || !dua ? (
          <div className="rounded-lg border border-outline-variant bg-surface-container p-5">
            <p className="text-sm leading-relaxed text-on-surface-variant">
              Your weekly Muhasaba arrives with a notification each week —
              Thursday night or Friday morning, when you are online.
            </p>
            <Link
              href="/spiritual/"
              className="font-label mt-4 inline-flex text-primary"
            >
              ← Back to Presence Audit
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between gap-3">
              <p className="font-data text-on-surface-variant">
                {audit.weekOf}
              </p>
              <StatusChip>Cached Locally</StatusChip>
            </div>

            <section className="mb-6 rounded-lg border border-outline-variant bg-surface-container p-5">
              <h2 className="font-label mb-3 text-secondary">Diagnostic</h2>
              <p className="text-sm leading-relaxed text-on-surface-variant">
                {audit.diagnostic}
              </p>
            </section>

            <section className="mb-6 rounded-lg border border-outline-variant bg-surface-container p-5">
              <h2 className="font-label mb-3 text-primary">Practical Remedy</h2>
              <p className="text-sm leading-relaxed text-on-surface-variant">
                {audit.remedy}
              </p>
            </section>

            <section className="mb-6 rounded-lg border border-outline-variant bg-surface-container-high p-5">
              <div className="mb-3 h-px w-12 bg-secondary" aria-hidden />
              <h2 className="font-label mb-1 text-secondary">
                Spiritual Prescription
              </h2>
              <p className="font-label mb-2 text-[10px] text-on-surface-variant">
                {dua.source} · {dua.ref}
              </p>
              <p className="font-display mb-3 text-lg font-semibold text-on-surface">
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
              <p className="font-display text-lg leading-snug italic text-on-surface">
                {dua.translation}
              </p>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
