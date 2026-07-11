"use client";

import Link from "next/link";
import { RefreshCw, UserCircle } from "lucide-react";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ReadyPulse } from "./ReadyPulse";

type AppTopBarProps = {
  variant?: "centered" | "brand-left";
  showReadyLabel?: boolean;
};

export function AppTopBar({
  variant = "centered",
  showReadyLabel = false,
}: AppTopBarProps) {
  const [syncing, setSyncing] = useState(false);
  const reduceMotion = useReducedMotion();

  function handleSync() {
    if (syncing) return;
    setSyncing(true);
    window.setTimeout(() => setSyncing(false), reduceMotion ? 200 : 900);
  }

  const syncControl = (
    <button
      type="button"
      aria-label={syncing ? "Syncing" : "Sync local data"}
      aria-busy={syncing}
      onClick={handleSync}
      className="touch-target inline-flex items-center justify-center text-primary transition-opacity duration-200 hover:opacity-80 active:scale-95"
    >
      <motion.span
        animate={
          syncing && !reduceMotion ? { rotate: 360 } : { rotate: 0 }
        }
        transition={
          syncing && !reduceMotion
            ? { duration: 0.9, ease: "linear" }
            : { duration: 0 }
        }
        className="inline-flex"
      >
        <RefreshCw className="size-5" strokeWidth={1.75} />
      </motion.span>
    </button>
  );

  const accountLink = (
    <Link
      href="/sign-in/"
      aria-label="Sign in"
      className="touch-target inline-flex items-center justify-center text-primary transition-opacity duration-200 hover:opacity-80"
    >
      <UserCircle className="size-6" strokeWidth={1.5} />
    </Link>
  );

  return (
    <header className="fixed inset-x-0 top-0 z-[var(--z-nav)] flex h-16 items-center justify-between border-b border-outline-variant bg-surface/80 px-[var(--margin-mobile)] pt-[env(safe-area-inset-top)] backdrop-blur-xl">
      {variant === "centered" ? (
        <>
          <div className="flex items-center gap-2">
            {accountLink}
            <ReadyPulse />
          </div>
          <Link
            href="/"
            className="font-display text-xl font-semibold tracking-[0.18em] text-primary transition-opacity hover:opacity-90"
          >
            AL-ANSAAR
          </Link>
          {syncControl}
        </>
      ) : (
        <>
          <div className="flex min-w-0 items-center gap-2">
            {accountLink}
            <Link
              href="/"
              className="font-display truncate text-lg font-semibold tracking-[0.16em] text-primary transition-opacity hover:opacity-90"
            >
              AL-ANSAAR
            </Link>
          </div>
          <div className="flex items-center gap-3">
            {showReadyLabel ? <ReadyPulse label="READY" /> : <ReadyPulse />}
            {syncControl}
          </div>
        </>
      )}
    </header>
  );
}
