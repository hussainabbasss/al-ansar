"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Lock } from "lucide-react";
import { CommandmentCard } from "@/components/ui/CommandmentCard";
import {
  DAILY_PACK_SIZE,
  openIntellectFeed,
  type DailyPack,
} from "@/lib/intellect/daily-pack";
import type { Hadith } from "@/lib/intellect/corpus";
import { hadithCorpus } from "@/lib/intellect/corpus";
import { markIntellectOpened } from "@/lib/intellect/opened";

export default function IntellectPage() {
  const [visible, setVisible] = useState<Hadith[]>([]);
  const [pack, setPack] = useState<DailyPack | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const result = await openIntellectFeed();
        await markIntellectOpened();
        if (cancelled) return;
        setPack(result.pack);
        setVisible(result.visible);
      } catch {
        if (!cancelled) {
          setError("Could not load narrations from device storage.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="mx-auto max-w-lg px-[var(--margin-mobile)]">
      <section className="mb-6">
        <p className="font-label mb-1 tracking-widest text-secondary">
          {hadithCorpus.source}
        </p>
        <h1 className="font-display text-2xl font-semibold">Intellect</h1>
        <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">
          Three narrations from today&apos;s pack of {DAILY_PACK_SIZE}. Open
          Intellect again to rotate; a new day refreshes the seven stored on
          this device.
        </p>
      </section>

      {loading ? (
        <p className="font-data text-on-surface-variant">Loading local pack…</p>
      ) : null}

      {error ? (
        <p className="text-sm text-error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-4">
        {visible.map((n) => (
          <CommandmentCard
            key={n.id}
            label={n.label}
            quote={n.quote}
            refText={`Ref: ${n.ref}`}
            href={`/intellect/${n.id}/`}
          />
        ))}
      </div>

      {pack ? (
        <p className="font-data mt-6 text-center text-outline">
          Pack {pack.date} · rotation {pack.rotation + 1}/{pack.ids.length} ·
          showing {visible.length} of {DAILY_PACK_SIZE}
        </p>
      ) : null}

      <div className="mt-4 flex items-center justify-center gap-2 opacity-50">
        <Lock className="size-3.5" aria-hidden />
        <span className="font-data text-[10px] tracking-widest uppercase">
          Device preferences · refreshes daily · not cache
        </span>
      </div>

      <Link
        href="/spiritual/"
        className="font-label mt-6 block text-center text-primary"
      >
        Continue to Muhasaba →
      </Link>
    </main>
  );
}
