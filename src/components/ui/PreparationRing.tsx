"use client";

import { motion, useReducedMotion } from "framer-motion";

type PreparationRingProps = {
  percent: number;
  status?: string;
  label?: string;
  caption?: string;
};

export function PreparationRing({
  percent,
  status = "ON TRACK",
  label = "PREPARATION",
  caption,
}: PreparationRingProps) {
  const reduceMotion = useReducedMotion();
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative flex size-48 items-center justify-center"
        role="img"
        aria-label={`${label} ${percent} percent of daily goals, ${status}`}
      >
        <svg className="absolute inset-0 size-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-surface-variant"
          />
          <motion.circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            className="text-primary"
            strokeDasharray={circumference}
            initial={
              reduceMotion
                ? { strokeDashoffset: offset }
                : { strokeDashoffset: circumference }
            }
            animate={{ strokeDashoffset: offset }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { duration: 1.1, ease: [0.16, 1, 0.3, 1] }
            }
          />
          <motion.circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            className="text-secondary opacity-50"
            strokeDasharray={circumference}
            initial={
              reduceMotion
                ? { strokeDashoffset: circumference * 0.72 }
                : { strokeDashoffset: circumference }
            }
            animate={{ strokeDashoffset: circumference * 0.72 }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.12 }
            }
          />
        </svg>
        <div className="z-10 text-center">
          <span className="font-label mb-1 block text-on-surface-variant">
            {label}
          </span>
          <span className="font-display text-4xl font-bold tracking-tight text-primary">
            {percent}%
          </span>
          <div className="mt-1">
            <span className="font-data text-secondary">{status}</span>
          </div>
        </div>
      </div>
      {caption ? (
        <p className="font-label mt-4 tracking-[0.18em] text-outline">
          {caption}
        </p>
      ) : null}
    </div>
  );
}

/** @deprecated Use PreparationRing */
export const ReadinessRing = PreparationRing;
