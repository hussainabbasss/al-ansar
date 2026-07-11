"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BookOpen,
  Dumbbell,
  LayoutGrid,
  Moon,
  NotebookPen,
  PersonStanding,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { AlAnsaarMark } from "@/components/ui/AlAnsaarMark";
import { PreparationRing } from "@/components/ui/PreparationRing";
import { CommandmentCard } from "@/components/ui/CommandmentCard";
import { PillarBanner, PillarTile } from "@/components/ui/PillarTile";
import { LogActionRow } from "@/components/ui/LogActionRow";
import { FAB } from "@/components/ui/FAB";
import { ActionSheet } from "@/components/ui/ActionSheet";
import { MorningNoteSheet } from "@/components/ui/MorningNoteSheet";
import {
  loadProgressDashboard,
  type ProgressDashboard,
} from "@/lib/progress/dashboard";
import { saveMorningNoteForDate } from "@/lib/progress/storage";
import { refreshLocalSchedules } from "@/lib/notifications/schedule-all";

const ease = [0.16, 1, 0.3, 1] as const;

function FadeIn({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { delay, duration: 0.45, ease }
      }
    >
      {children}
    </motion.div>
  );
}

export default function ProgressPage() {
  const [data, setData] = useState<ProgressDashboard | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [morningOpen, setMorningOpen] = useState(false);
  const [morningDraft, setMorningDraft] = useState("");
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const next = await loadProgressDashboard();
    setData(next);
    setMorningDraft(next.morningNote);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
    void refreshLocalSchedules();
  }, [refresh]);

  useEffect(() => {
    function onVis() {
      if (document.visibilityState === "visible") void refresh();
    }
    function onFocus() {
      void refresh();
    }
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("focus", onFocus);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("focus", onFocus);
    };
  }, [refresh]);

  async function persistMorning(value: string) {
    setMorningDraft(value);
    if (!data) return;
    await saveMorningNoteForDate(data.dateKey, value);
  }

  function openMorning() {
    setMorningDraft(data?.morningNote ?? "");
    setMorningOpen(true);
  }

  const score = data?.score;

  return (
    <main className="mx-auto max-w-lg px-[var(--margin-mobile)]">
      <FadeIn className="mb-8 flex flex-col items-center pt-1">
        <AlAnsaarMark size="hero" />
        <p className="font-display mt-3 max-w-[22ch] text-center text-sm italic leading-relaxed text-on-surface-variant">
          Companions in the wait
        </p>
      </FadeIn>

      <FadeIn delay={0.08} className="mb-10 flex flex-col items-center">
        {loading && !data ? (
          <div
            className="size-48 animate-pulse rounded-full bg-surface-variant/40"
            aria-hidden
          />
        ) : (
          <PreparationRing
            percent={score?.percent ?? 0}
            status={score?.status ?? "NOT STARTED"}
            label="PROGRESS"
            caption={`Daily Goals · ${score?.state ?? "Not started"}`}
          />
        )}
      </FadeIn>

      <FadeIn delay={0.14} className="mb-10">
        {data?.commandment ? (
          <CommandmentCard
            label="Daily Commandment"
            quote={data.commandment.quote}
            refText={`Ref: ${data.commandment.ref}`}
            href={`/intellect/${data.commandment.id}/`}
          />
        ) : (
          <div className="rounded-lg border border-outline-variant bg-surface-container-high px-5 py-8 text-center">
            <p className="font-data text-on-surface-variant">
              {loading
                ? "Opening today’s commandment…"
                : "No narration available today."}
            </p>
          </div>
        )}
      </FadeIn>

      <FadeIn delay={0.2} className="mb-10">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-primary">
          <LayoutGrid className="size-5" aria-hidden />
          Pillars of Readiness
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <PillarTile
            title="Physical"
            metric={data?.physicalMetric ?? "—"}
            value={data?.physicalPct ?? 0}
            href="/physical/"
            icon={Dumbbell}
            tone="primary"
          />
          <PillarTile
            title="Intellect"
            metric={data?.intellectMetric ?? "UNREAD"}
            value={data?.intellectPct ?? 0}
            href="/intellect/"
            icon={BookOpen}
            tone="tertiary"
          />
          <PillarBanner
            title="Spiritual Awareness"
            subtitle={
              data?.spiritualSubtitle ?? "Namaz completed: —"
            }
            score={data?.spiritualScore ?? 0}
            href="/spiritual/"
            icon={PersonStanding}
          />
        </div>
      </FadeIn>

      <FadeIn delay={0.26} className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-primary">
          Daily Log Actions
        </h2>
        <div className="overflow-hidden rounded-lg border border-outline-variant">
          <LogActionRow
            title="New Morning Log"
            subtitle="Capture your state of mind"
            icon={NotebookPen}
            onClick={openMorning}
          />
          <LogActionRow
            title="Evening Reflection"
            subtitle="Close the day with Muhasaba"
            href="/spiritual/?focus=prompt"
            icon={Moon}
          />
        </div>
      </FadeIn>

      <FadeIn delay={0.32} className="mb-2">
        <section className="relative overflow-hidden rounded-lg border border-outline-variant/60">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary-container/80 via-surface-container to-surface-container-lowest"
          />
          <div className="relative flex min-h-40 flex-col justify-end p-5">
            <p
              lang="ar"
              dir="rtl"
              className="font-calligraphy mb-2 text-2xl text-secondary/90"
            >
              الانصار
            </p>
            <p className="font-display max-w-[28ch] text-base italic leading-relaxed text-on-surface/85">
              Command center for the wait.
            </p>
          </div>
        </section>
      </FadeIn>

      <FAB onClick={() => setSheetOpen(true)} />
      <ActionSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        actions={[
          {
            id: "log-prayer",
            label: "Log prayer",
            subtitle: "Binary Namaz presence",
            href: "/spiritual/",
          },
          {
            id: "morning-note",
            label: "Morning note",
            subtitle: "Capture your state of mind",
            onClick: openMorning,
          },
          {
            id: "evening-reflection",
            label: "Evening reflection",
            subtitle: "Prompt of the day",
            href: "/spiritual/?focus=prompt",
          },
        ]}
      />

      <MorningNoteSheet
        open={morningOpen}
        value={morningDraft}
        onChange={(v) => void persistMorning(v)}
        onClose={() => setMorningOpen(false)}
      />
    </main>
  );
}
