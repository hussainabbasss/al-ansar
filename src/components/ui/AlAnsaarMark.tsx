"use client";

import { motion, useReducedMotion } from "framer-motion";

type AlAnsaarMarkProps = {
  /** Larger hero treatment on Progress */
  size?: "hero" | "compact";
  className?: string;
  showLatin?: boolean;
};

/**
 * Calligraphic brand mark — الانصار in Aref Ruqaa.
 * Gold is intentional here: scarce brand sacred signal (Sacred Discipline).
 */
export function AlAnsaarMark({
  size = "hero",
  className = "",
  showLatin = true,
}: AlAnsaarMarkProps) {
  const reduceMotion = useReducedMotion();
  const isHero = size === "hero";

  return (
    <div
      className={`relative flex flex-col items-center text-center ${className}`}
      role="img"
      aria-label="Al-Ansaar"
    >
      {/* Soft Khatim glow — tonal, not neon */}
      <div
        aria-hidden
        className={`pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[55%] rounded-full bg-secondary/10 blur-3xl ${
          isHero ? "size-44" : "size-24"
        }`}
      />
      <div
        aria-hidden
        className={`pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[48%] rounded-full border border-primary/15 ${
          isHero ? "size-36" : "size-20"
        }`}
        style={{
          clipPath:
            "polygon(50% 0%, 65% 25%, 100% 25%, 75% 50%, 100% 75%, 65% 75%, 50% 100%, 35% 75%, 0% 75%, 25% 50%, 0% 25%, 35% 25%)",
          opacity: 0.35,
        }}
      />

      <motion.p
        lang="ar"
        dir="rtl"
        className={`font-calligraphy relative font-bold text-secondary ${
          isHero
            ? "text-[clamp(2.75rem,12vw,3.75rem)] leading-[1.35]"
            : "text-3xl leading-[1.4]"
        }`}
        style={{
          textShadow:
            "0 0 40px color-mix(in srgb, var(--secondary) 28%, transparent)",
        }}
        initial={reduceMotion ? false : { opacity: 0, y: 8, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { duration: 0.9, ease: [0.16, 1, 0.3, 1] }
        }
      >
        الانصار
      </motion.p>

      {showLatin ? (
        <motion.p
          className={`font-label relative mt-2 tracking-[0.28em] text-primary ${
            isHero ? "text-[11px]" : "text-[10px]"
          }`}
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { delay: 0.25, duration: 0.5, ease: [0.16, 1, 0.3, 1] }
          }
        >
          Al-Ansaar
        </motion.p>
      ) : null}
    </div>
  );
}
