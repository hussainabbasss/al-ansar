"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BookOpen, Bolt, Lock, NotebookPen } from "lucide-react";
import { DisciplineCard } from "@/components/ui/DisciplineCard";
import { PresenceRow } from "@/components/ui/PresenceRow";
import { PromptComposer } from "@/components/ui/PromptComposer";
import { MetricCard } from "@/components/ui/MetricCard";
import { StatusChip } from "@/components/ui/StatusChip";
import { JournalSheet } from "@/components/ui/JournalSheet";
import { DailyAuditSheet } from "@/components/ui/DailyAuditSheet";
import { computeReadyIndex, buildDailyAuditRequest } from "@/lib/spiritual/aggregate";
import { requestSalahAudit } from "@/lib/spiritual/analyze";
import { formatHijriDate } from "@/lib/spiritual/hijri";
import { isOnline, subscribeOnline } from "@/lib/spiritual/online";
import {
  isDailyAuditLocked,
  loadDailyAudit,
  loadDailyAuditLockUntil,
  loadDayNamaz,
  loadPromptForDate,
  loadWeeklyAudit,
  localDateKey,
  saveDailyAudit,
  savePromptForDate,
  updatePrayer,
} from "@/lib/spiritual/storage";
import {
  PRAYER_META,
  type PrayerId,
  type PrayerLog,
  type StoredDailyAudit,
  type StoredWeeklyAudit,
} from "@/lib/spiritual/types";
import { maybeRunWeeklyMuhasaba } from "@/lib/spiritual/weekly";

const PROMPT_OF_DAY =
  "If you found yourself at the threshold of the Final Moment this evening, what is the one act of service you would regret leaving undone?";

function SpiritualContent() {
  const searchParams = useSearchParams();
  const focusPrompt = searchParams.get("focus") === "prompt";
  const dateKey = localDateKey();

  const [loading, setLoading] = useState(true);
  const [prayers, setPrayers] = useState<PrayerLog[]>([]);
  const [promptValue, setPromptValue] = useState("");
  const [journalOpen, setJournalOpen] = useState(false);
  const [activePrayerId, setActivePrayerId] = useState<PrayerId | null>(null);
  const [online, setOnline] = useState(true);
  const [dailyLocked, setDailyLocked] = useState(false);
  const [lockUntil, setLockUntil] = useState<string | null>(null);
  const [dailyAudit, setDailyAudit] = useState<StoredDailyAudit | null>(null);
  const [weeklyAudit, setWeeklyAudit] = useState<StoredWeeklyAudit | null>(null);
  const [auditBusy, setAuditBusy] = useState(false);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [showDailySheet, setShowDailySheet] = useState(false);

  const hijri = useMemo(() => formatHijriDate(new Date()), []);

  const refreshLocks = useCallback(async () => {
    const [locked, until, daily, weekly] = await Promise.all([
      isDailyAuditLocked(),
      loadDailyAuditLockUntil(),
      loadDailyAudit(),
      loadWeeklyAudit(),
    ]);
    setDailyLocked(locked);
    setLockUntil(until);
    setDailyAudit(daily);
    setWeeklyAudit(weekly);
  }, []);

  useEffect(() => {
    setOnline(isOnline());
    return subscribeOnline(setOnline);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [log, prompt] = await Promise.all([
        loadDayNamaz(dateKey),
        loadPromptForDate(dateKey),
      ]);
      if (cancelled) return;
      setPrayers(log.prayers);
      setPromptValue(prompt);
      await refreshLocks();
      setLoading(false);
      void maybeRunWeeklyMuhasaba().then((w) => {
        if (w && !cancelled) setWeeklyAudit(w);
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [dateKey, refreshLocks]);

  const activePrayer = useMemo(
    () => prayers.find((p) => p.id === activePrayerId) ?? null,
    [prayers, activePrayerId],
  );

  const readyIndex = useMemo(() => computeReadyIndex(prayers), [prayers]);
  const doneCount = prayers.filter((p) => p.done).length;
  const journaled = prayers.filter((p) => p.done && p.journal.trim()).length;

  const readyBlurb =
    dailyAudit?.date === dateKey && dailyAudit.readyBlurb
      ? dailyAudit.readyBlurb
      : doneCount === 0
        ? "Mark your prayers as you complete them. Presence begins with the first sincere Takbir."
        : `${doneCount} of 5 prayers logged today. Keep the heart honest in the Hudur notes.`;

  async function togglePrayer(id: PrayerId) {
    const current = prayers.find((p) => p.id === id);
    if (!current) return;
    const nextDone = !current.done;
    const next = await updatePrayer(dateKey, id, { done: nextDone });
    setPrayers(next.prayers);
    if (nextDone) {
      setActivePrayerId(id);
      setJournalOpen(true);
    }
  }

  async function updateJournal(value: string) {
    if (!activePrayerId) return;
    const next = await updatePrayer(dateKey, activePrayerId, {
      journal: value,
    });
    setPrayers(next.prayers);
  }

  async function onPromptChange(value: string) {
    setPromptValue(value);
    await savePromptForDate(dateKey, value);
  }

  async function runDailyAudit() {
    setAuditError(null);
    if (!online) {
      setAuditError("Connect to the internet to run today’s audit.");
      return;
    }
    if (await isDailyAuditLocked()) {
      setDailyLocked(true);
      setAuditError("Daily audit already run. Available again in 24 hours.");
      return;
    }
    setAuditBusy(true);
    try {
      const payload = await buildDailyAuditRequest(dateKey);
      const res = await requestSalahAudit(payload);
      if (!res.ok) {
        setAuditError(
          res.error === "offline"
            ? "Connect to the internet to run today’s audit."
            : res.error === "missing_key"
              ? "Add GEMINI_API_KEY or BAZAARLINK_API_KEY to .env.local and restart npm run dev."
              : "Audit unavailable. Try again when the mentor service is reachable.",
        );
        return;
      }
      const stored: StoredDailyAudit = {
        ...res.result,
        scope: "daily",
        date: dateKey,
        generatedAt: new Date().toISOString(),
      };
      await saveDailyAudit(stored);
      setDailyAudit(stored);
      setShowDailySheet(true);
      await refreshLocks();
    } finally {
      setAuditBusy(false);
    }
  }

  const lockLabel = useMemo(() => {
    if (!lockUntil) return null;
    const until = new Date(lockUntil);
    if (Number.isNaN(until.getTime())) return null;
    return until.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }, [lockUntil]);

  const canRunDaily = online && !dailyLocked && !auditBusy;

  if (loading) {
    return (
      <main className="mx-auto max-w-lg px-[var(--margin-mobile)]">
        <p className="font-data text-on-surface-variant">Loading audit…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-lg px-[var(--margin-mobile)]">
      <section className="mb-6 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-label mb-1 tracking-widest text-secondary">
            Daily Audit
          </p>
          <h1 className="font-display text-3xl font-semibold">
            Muhasaba Focus
          </h1>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-data text-on-surface-variant">{hijri}</p>
          <div className="mt-1">
            <StatusChip>Active Readiness</StatusChip>
          </div>
        </div>
      </section>

      <DisciplineCard className="mb-4">
        <h2 className="mb-4 text-lg font-semibold">Presence Audit (Salat)</h2>
        <div>
          {PRAYER_META.map((meta) => {
            const prayer = prayers.find((p) => p.id === meta.id);
            return (
              <PresenceRow
                key={meta.id}
                name={meta.name}
                subtitle={meta.subtitle}
                done={prayer?.done ?? false}
                onToggle={() => togglePrayer(meta.id)}
              />
            );
          })}
        </div>
      </DisciplineCard>

      <div className="mb-4 flex flex-col rounded-lg border border-outline-variant bg-surface-container-high p-5 sm:p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-secondary">
          <Bolt className="size-5" />
          Ready Summary
        </h2>
        <div className="flex flex-col items-center text-center">
          <div
            className="relative mb-5 flex size-32 items-center justify-center rounded-full border-4 border-secondary"
            role="img"
            aria-label={`Ready index ${readyIndex}`}
          >
            <span className="font-display text-[42px] leading-none text-secondary">
              {readyIndex}
            </span>
            <span className="font-label absolute -bottom-2 rounded-full bg-secondary px-3 py-0.5 text-[10px] text-on-secondary">
              Index
            </span>
          </div>
          <p className="mb-5 max-w-[42ch] px-1 text-sm leading-relaxed text-on-surface-variant">
            {readyBlurb}
          </p>

          <button
            type="button"
            disabled={!canRunDaily}
            onClick={() => void runDailyAudit()}
            className={`font-label flex min-h-11 w-full items-center justify-center tracking-widest transition-opacity duration-200 ${
              canRunDaily
                ? "bg-secondary text-on-secondary hover:opacity-90"
                : "cursor-not-allowed bg-surface-variant text-on-surface-variant opacity-70"
            }`}
          >
            {auditBusy
              ? "Running audit…"
              : !online
                ? "Daily Audit (offline)"
                : dailyLocked
                  ? "Daily Audit locked"
                  : "Run Daily Audit"}
          </button>

          {dailyLocked && lockLabel ? (
            <p className="font-data mt-2 text-[10px] text-on-surface-variant">
              Available after {lockLabel}
            </p>
          ) : null}

          {auditError ? (
            <p className="mt-2 text-sm text-error" role="alert">
              {auditError}
            </p>
          ) : null}

          {dailyAudit?.date === dateKey ? (
            <button
              type="button"
              onClick={() => setShowDailySheet(true)}
              className="font-label mt-3 text-primary underline-offset-2 hover:underline"
            >
              Read today’s Muhasaba
            </button>
          ) : null}

          {weeklyAudit ? (
            <Link
              href="/spiritual/audit/"
              className="font-data mt-3 text-[10px] tracking-widest text-on-surface-variant uppercase hover:text-on-surface"
            >
              Last weekly Muhasaba →
            </Link>
          ) : null}
        </div>
      </div>

      <div className="mb-4">
        <PromptComposer
          prompt={PROMPT_OF_DAY}
          value={promptValue}
          onChange={(v) => void onPromptChange(v)}
          autoFocus={focusPrompt}
        />
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4">
        <MetricCard
          label="Prayers"
          value={`${doneCount} / 5`}
          icon={BookOpen}
        />
        <MetricCard
          label="Hudur notes"
          value={journaled > 0 ? `${journaled} logged` : "—"}
          icon={NotebookPen}
          iconClassName="text-secondary"
        />
      </div>

      <div className="mb-8 flex items-center justify-center gap-2 opacity-50">
        <Lock className="size-3.5" aria-hidden />
        <span className="font-data text-[10px] tracking-widest uppercase">
          Stored locally on device
        </span>
      </div>

      <JournalSheet
        open={journalOpen && !!activePrayer}
        prayerName={
          PRAYER_META.find((p) => p.id === activePrayer?.id)?.name ?? ""
        }
        value={activePrayer?.journal ?? ""}
        onChange={(v) => void updateJournal(v)}
        onClose={() => setJournalOpen(false)}
      />

      <DailyAuditSheet
        open={showDailySheet}
        audit={dailyAudit}
        onClose={() => setShowDailySheet(false)}
      />
    </main>
  );
}

export default function SpiritualPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-lg px-[var(--margin-mobile)] py-10">
          <p className="font-data text-on-surface-variant">Loading audit…</p>
        </main>
      }
    >
      <SpiritualContent />
    </Suspense>
  );
}
