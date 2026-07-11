"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Lock, PersonStanding } from "lucide-react";
import { WeeklyLoadChart } from "@/components/ui/WeeklyLoadChart";
import { TrainingModuleCard } from "@/components/ui/TrainingModuleCard";
import { PrimaryButton } from "@/components/ui/Buttons";
import {
  daysUntilUnlock,
  planIsLocked,
  type StoredFitnessPlan,
} from "@/lib/physical/types";
import {
  loadFitnessPlan,
  loadSessionProgress,
  sessionDayKey,
  type SessionProgress,
} from "@/lib/physical/storage";
import {
  burnedCaloriesForDay,
  currentPlanDayIndex,
  planDayLabel,
} from "@/lib/physical/schedule";

function DisabledOverlay({ label }: { label: string }) {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/70 backdrop-blur-[2px]">
      <p className="font-label px-4 text-center text-on-surface-variant">
        {label}
      </p>
    </div>
  );
}

export default function PhysicalPage() {
  const [plan, setPlan] = useState<StoredFitnessPlan | null>(null);
  const [progress, setProgress] = useState<SessionProgress>({ completed: {} });
  const [loading, setLoading] = useState(true);
  const [weekIndex, setWeekIndex] = useState(0);
  const [showRenew, setShowRenew] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [stored, session] = await Promise.all([
        loadFitnessPlan(),
        loadSessionProgress(),
      ]);
      if (!cancelled) {
        setPlan(stored);
        setProgress(session);
        if (stored && !planIsLocked(stored)) setShowRenew(true);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const hasPlan = !!plan;
  const locked = plan ? planIsLocked(plan) : false;
  const canAddDetails = !hasPlan || !locked;

  const week = plan?.weeks[weekIndex] ?? null;

  const burnedByDay = useMemo(() => {
    if (!week) return [];
    return week.days.map((d, i) => {
      const key = sessionDayKey(week.week, d.day);
      const ids = progress.completed[key] ?? [];
      return burnedCaloriesForDay(week, i, ids);
    });
  }, [week, progress]);

  const weekBurned = burnedByDay.reduce((s, n) => s + n, 0);

  const calorieBars = useMemo(() => {
    if (!week || !plan) return [];
    const max = Math.max(...burnedByDay, week.estimatedCaloriesBurn * 0.15, 1);
    const todayIdx = currentPlanDayIndex(plan, week.week);
    return week.days.map((_, i) => {
      const burned = burnedByDay[i] ?? 0;
      const height =
        burned > 0 ? Math.max(12, Math.round((burned / max) * 100)) : 4;
      return {
        day: planDayLabel(i),
        height,
        value: burned,
        highlight: (i === todayIdx
          ? "secondary"
          : burned > 0
            ? "primary"
            : false) as false | "primary" | "secondary",
      };
    });
  }, [week, plan, burnedByDay]);

  if (loading) {
    return (
      <main className="mx-auto max-w-lg px-[var(--margin-mobile)]">
        <p className="font-data text-on-surface-variant">Loading plan…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-lg px-[var(--margin-mobile)]">
      <section className="mb-6 flex flex-col gap-1">
        <span className="font-label tracking-widest text-secondary">
          Sacred Discipline
        </span>
        <h1 className="font-display text-2xl font-semibold">
          Physical Readiness
        </h1>
        <p className="max-w-md text-sm text-on-surface-variant">
          Your body is the vessel for wait. Forge endurance, mobility, and
          functional strength for the moment of action.
        </p>
      </section>

      {canAddDetails ? (
        <div className="mb-4 rounded-md border border-secondary/40 bg-surface-container p-5">
          <p className="font-label text-secondary">
            {hasPlan ? "Renew plan" : "Add details"}
          </p>
          <p className="mt-1 text-sm text-on-surface-variant">
            {hasPlan
              ? "Your month lock has ended. Generate a new plan or keep training with the current one."
              : "Share height, weight, and readiness details to build a 4-week companion plan stored on this device."}
          </p>
          <Link href="/physical/questionnaire/" className="mt-4 block">
            <PrimaryButton variant="gold">
              {hasPlan ? "Update details" : "Add details"}
            </PrimaryButton>
          </Link>
          {hasPlan && showRenew ? (
            <PrimaryButton
              variant="discipline"
              className="mt-3"
              onClick={() => setShowRenew(false)}
            >
              Keep current plan
            </PrimaryButton>
          ) : null}
        </div>
      ) : (
        <div className="mb-4 flex items-start gap-3 rounded-md border border-outline-variant bg-surface-container-low p-4 opacity-80">
          <Lock className="mt-0.5 size-4 shrink-0 text-outline" aria-hidden />
          <div>
            <p className="font-label text-outline">Add details locked</p>
            <p className="text-sm text-on-surface-variant">
              New profile in ~{plan ? daysUntilUnlock(plan) : 0} days. Continue
              your current month plan below.
            </p>
          </div>
        </div>
      )}

      <div
        className={`relative mb-4 overflow-hidden rounded-lg border border-outline-variant bg-surface-container p-5 ${
          !hasPlan ? "pointer-events-none select-none" : ""
        }`}
      >
        {!hasPlan ? (
          <DisabledOverlay label="Generate a plan to unlock calories" />
        ) : null}
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-primary">Calories Burn</h2>
            <span className="font-data uppercase text-on-surface-variant">
              From completed work · Week {weekIndex + 1}
            </span>
          </div>
          <div className="text-right">
            <span className="font-display text-3xl font-semibold text-secondary">
              {hasPlan ? weekBurned : "—"}
            </span>
            <p className="font-label text-on-surface-variant">KCAL</p>
          </div>
        </div>

        {hasPlan ? (
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {plan!.weeks.map((w, i) => (
              <button
                key={w.week}
                type="button"
                onClick={() => setWeekIndex(i)}
                className={`font-label shrink-0 rounded px-3 py-2 transition-colors ${
                  i === weekIndex
                    ? "bg-secondary text-on-secondary"
                    : "bg-surface-variant text-on-surface-variant hover:text-on-surface"
                }`}
              >
                W{w.week}
              </button>
            ))}
          </div>
        ) : null}

        <WeeklyLoadChart
          days={
            calorieBars.length
              ? calorieBars
              : ["D1", "D2", "D3", "D4", "D5"].map((day) => ({
                  day,
                  height: 4,
                  value: 0,
                  highlight: false as const,
                }))
          }
        />
        <p className="font-data mt-3 text-on-surface-variant">
          {week
            ? `${week.theme} · tick sessions to fill the graph`
            : "Week tabs unlock after your first plan"}
        </p>
      </div>

      <div className={`relative mb-4 ${!hasPlan ? "pointer-events-none" : ""}`}>
        {!hasPlan ? <DisabledOverlay label="Locked until plan exists" /> : null}
        <Link
          href="/physical/session/"
          className={`flex flex-col items-start gap-3 rounded-lg bg-primary-container p-5 text-on-primary-container transition-transform duration-200 active:scale-[0.99] ${
            !hasPlan ? "opacity-40" : ""
          }`}
          aria-disabled={!hasPlan}
          tabIndex={hasPlan ? 0 : -1}
          onClick={(e) => {
            if (!hasPlan) e.preventDefault();
          }}
        >
          <span
            className="flex size-11 items-center justify-center rounded-full bg-on-primary/10 text-2xl leading-none"
            aria-hidden
          >
            ＋
          </span>
          <div>
            <h2 className="text-lg font-semibold">Record Session</h2>
            <p className="text-sm leading-relaxed opacity-85">
              Log today’s movements and mark what you completed.
            </p>
          </div>
          <span className="font-label mt-1 flex min-h-10 w-full items-center justify-center rounded-full bg-on-primary text-primary">
            Initialize
          </span>
        </Link>
      </div>

      <div
        className={`relative mb-4 flex flex-col gap-4 ${
          !hasPlan ? "pointer-events-none" : ""
        }`}
      >
        {!hasPlan ? (
          <div className="relative min-h-40 rounded-lg border border-outline-variant bg-surface-container-high opacity-50">
            <DisabledOverlay label="Modules unlock with your plan" />
          </div>
        ) : (
          plan!.modules.map((mod) => (
            <TrainingModuleCard
              key={mod.id}
              title={mod.title}
              description={mod.description}
              chip={mod.chip}
              chipTone={mod.chipTone}
              level={mod.level}
              duration={mod.duration}
              href={`/physical/session/?week=${mod.week}`}
            />
          ))
        )}
      </div>

      <div
        className={`relative mb-4 flex items-center gap-4 rounded-lg border border-outline-variant bg-surface-container p-5 ${
          !hasPlan ? "pointer-events-none opacity-50" : ""
        }`}
      >
        {!hasPlan ? <DisabledOverlay label="Locked" /> : null}
        <div className="flex size-16 shrink-0 items-center justify-center rounded-full border-2 border-secondary text-secondary">
          <PersonStanding className="size-8" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold">The Stillness of Action</h3>
          <p className="text-sm text-on-surface-variant italic">
            &ldquo;
            {plan?.stillnessQuote ??
              "Strength is not in the struggle, but in the readiness to struggle."}
            &rdquo;
          </p>
        </div>
      </div>

      {plan ? (
        <p className="font-data mb-6 text-center text-outline">
          Companion plan · renew after{" "}
          {new Date(plan.expiresAt).toLocaleDateString()}
        </p>
      ) : (
        <div className="mb-6 flex items-center justify-center gap-2 opacity-50">
          <Lock className="size-3.5" aria-hidden />
          <span className="font-data text-[10px] tracking-widest uppercase">
            Plans store on this device · not cache
          </span>
        </div>
      )}
    </main>
  );
}
