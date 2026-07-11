"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, CircleHelp, Lock } from "lucide-react";
import { StackHeader } from "@/components/ui/StackHeader";
import { PrimaryButton } from "@/components/ui/Buttons";
import { HowToSheet } from "@/components/ui/HowToSheet";
import {
  loadFitnessPlan,
  loadSessionProgress,
  saveSessionProgress,
  sessionDayKey,
} from "@/lib/physical/storage";
import type {
  PlanDay,
  PlanExercise,
  StoredFitnessPlan,
} from "@/lib/physical/types";
import {
  currentPlanDayIndex,
  isPlanDayTickable,
  planDayLabel,
} from "@/lib/physical/schedule";
import { onFirstExerciseCompletedToday } from "@/lib/notifications/exercise";

function resolveHowTo(step: PlanExercise): string {
  if (step.howTo?.trim()) return step.howTo.trim();
  return `Perform “${step.name}” with control.\n\n• Setup: find a stable stance or position.\n• Move: ${step.detail}\n• Breathe steadily; stop if you feel sharp pain.\n• Prefer quality over speed.`;
}

function SessionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const weekParam = Number(searchParams.get("week") ?? "1");

  const [plan, setPlan] = useState<StoredFitnessPlan | null>(null);
  const [week, setWeek] = useState(1);
  const [dayIndex, setDayIndex] = useState(0);
  const [completed, setCompleted] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [howToExercise, setHowToExercise] = useState<PlanExercise | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = await loadFitnessPlan();
      if (cancelled) return;
      setPlan(stored);
      const w = Math.min(
        Math.max(1, weekParam || 1),
        stored?.weeks.length ?? 1,
      );
      setWeek(w);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [weekParam]);

  const weekData = plan?.weeks.find((w) => w.week === week) ?? plan?.weeks[0];
  const day: PlanDay | null = weekData?.days[dayIndex] ?? null;
  const tickable =
    !!plan && weekData
      ? isPlanDayTickable(plan, weekData.week, dayIndex)
      : false;

  useEffect(() => {
    if (!day || !weekData) return;
    let cancelled = false;
    (async () => {
      const progress = await loadSessionProgress();
      const key = sessionDayKey(weekData.week, day.day);
      if (!cancelled) setCompleted(progress.completed[key] ?? []);
    })();
    return () => {
      cancelled = true;
    };
  }, [day, weekData]);

  const doneCount = completed.length;
  const total = day?.exercises.length ?? 0;

  async function toggle(id: string) {
    if (!day || !weekData || !plan) return;
    if (!isPlanDayTickable(plan, weekData.week, dayIndex)) return;
    const key = sessionDayKey(weekData.week, day.day);
    const wasEmpty = completed.length === 0;
    const next = completed.includes(id)
      ? completed.filter((x) => x !== id)
      : [...completed, id];
    setCompleted(next);
    const progress = await loadSessionProgress();
    progress.completed[key] = next;
    await saveSessionProgress(progress);
    if (
      wasEmpty &&
      next.length > 0 &&
      dayIndex === currentPlanDayIndex(plan, weekData.week)
    ) {
      await onFirstExerciseCompletedToday();
    }
  }

  const calorieHint = useMemo(() => {
    if (!day) return "";
    const burned = day.exercises
      .filter((e) => completed.includes(e.id))
      .reduce((s, e) => s + e.estimatedCalories, 0);
    return `${burned} kcal burned · ${day.estimatedCalories} kcal day target`;
  }, [completed, day]);

  if (loading) {
    return (
      <main className="mx-auto max-w-lg px-[var(--margin-mobile)] py-8">
        <p className="font-data text-on-surface-variant">Loading session…</p>
      </main>
    );
  }

  if (!plan || !weekData || !day) {
    return (
      <div className="min-h-full">
        <StackHeader
          title="Record Session"
          eyebrow="No plan"
          backHref="/physical/"
        />
        <main className="mx-auto max-w-lg px-[var(--margin-mobile)] py-8">
          <p className="text-sm text-on-surface-variant">
            Add details on the Physical tab to generate a plan first.
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-full">
      <StackHeader
        title={day.title}
        eyebrow={`Week ${weekData.week} · ${planDayLabel(dayIndex)}`}
        backHref="/physical/"
      />
      <main className="mx-auto max-w-lg px-[var(--margin-mobile)] py-8 pb-12">
        <div className="mb-4 flex gap-2 overflow-x-auto">
          {plan.weeks.map((w) => (
            <button
              key={w.week}
              type="button"
              onClick={() => {
                setWeek(w.week);
                setDayIndex(0);
              }}
              className={`font-label shrink-0 rounded px-3 py-2 ${
                w.week === week
                  ? "bg-secondary text-on-secondary"
                  : "bg-surface-variant text-on-surface-variant"
              }`}
            >
              W{w.week}
            </button>
          ))}
        </div>

        <div className="mb-5 flex gap-2 overflow-x-auto">
          {weekData.days.map((d, i) => {
            const open = isPlanDayTickable(plan, weekData.week, i);
            return (
              <button
                key={d.day}
                type="button"
                onClick={() => setDayIndex(i)}
                className={`font-label shrink-0 rounded px-3 py-2 ${
                  i === dayIndex
                    ? "bg-primary text-on-primary"
                    : open
                      ? "border border-outline-variant text-on-surface-variant"
                      : "border border-outline-variant/50 text-on-surface-variant/45"
                }`}
              >
                {planDayLabel(i)}
              </button>
            );
          })}
        </div>

        {!tickable ? (
          <div className="mb-4 flex items-center gap-2 rounded border border-outline-variant bg-surface-container-low px-3 py-2 text-on-surface-variant">
            <Lock className="size-3.5 shrink-0" aria-hidden />
            <p className="font-data text-[12px]">
              Preview only — complete earlier days first. Checkmarks unlock on
              this day&apos;s date.
            </p>
          </div>
        ) : null}

        <p className="font-data mb-1 text-on-surface-variant">
          {doneCount} / {total} complete · {day.durationMins} mins · {day.focus}
        </p>
        <p className="font-data mb-5 text-secondary">{calorieHint}</p>

        <ul className="mb-8 space-y-2">
          {day.exercises.map((step) => {
            const done = completed.includes(step.id);
            return (
              <li
                key={step.id}
                className={`border border-outline-variant bg-surface-container p-4 ${
                  !tickable ? "opacity-70" : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  <button
                    type="button"
                    onClick={() => void toggle(step.id)}
                    disabled={!tickable}
                    aria-pressed={done}
                    aria-label={`Mark ${step.name} ${done ? "incomplete" : "complete"}`}
                    className={`mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-sm border transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                      done
                        ? "border-primary bg-primary text-on-primary"
                        : "border-outline text-on-surface-variant hover:border-primary"
                    }`}
                  >
                    {done ? (
                      <Check className="size-4" strokeWidth={3} aria-hidden />
                    ) : null}
                  </button>

                  <div className={`min-w-0 flex-1 ${done ? "opacity-50" : ""}`}>
                    <p
                      className={`font-semibold text-on-surface ${
                        done ? "line-through" : ""
                      }`}
                    >
                      {step.name}
                    </p>
                    <p className="text-sm text-on-surface-variant">
                      {step.detail}
                    </p>
                    <p className="font-data mt-1 text-outline">
                      ~{step.estimatedCalories} kcal
                    </p>
                    <button
                      type="button"
                      onClick={() => setHowToExercise(step)}
                      className="font-label mt-3 inline-flex min-h-9 items-center gap-1.5 rounded border border-secondary/50 px-3 py-1.5 text-secondary transition-colors hover:bg-secondary/10"
                    >
                      <CircleHelp className="size-3.5" aria-hidden />
                      How to
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <PrimaryButton
          variant="gold"
          disabled={doneCount === 0}
          onClick={() => router.push("/physical/")}
        >
          Close Session
        </PrimaryButton>
      </main>

      <HowToSheet
        open={!!howToExercise}
        title={howToExercise?.name ?? ""}
        howTo={howToExercise ? resolveHowTo(howToExercise) : ""}
        onClose={() => setHowToExercise(null)}
      />
    </div>
  );
}

export default function SessionPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-lg px-[var(--margin-mobile)] py-8">
          <p className="font-data text-on-surface-variant">Loading…</p>
        </main>
      }
    >
      <SessionContent />
    </Suspense>
  );
}
