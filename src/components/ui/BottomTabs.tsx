"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Dumbbell, PersonStanding, Zap } from "lucide-react";

const tabs = [
  { href: "/", label: "Progress", icon: Zap, match: (p: string) => p === "/" },
  {
    href: "/physical/",
    label: "Physical",
    icon: Dumbbell,
    match: (p: string) => p.startsWith("/physical"),
  },
  {
    href: "/intellect/",
    label: "Intellect",
    icon: BookOpen,
    match: (p: string) => p.startsWith("/intellect"),
  },
  {
    href: "/spiritual/",
    label: "Spiritual",
    icon: PersonStanding,
    match: (p: string) => p.startsWith("/spiritual"),
  },
] as const;

export function BottomTabs() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-[var(--z-nav)] flex items-center justify-between gap-3 rounded-t-xl border-t border-outline-variant bg-surface/90 px-[var(--margin-mobile)] py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-xl"
    >
      {tabs.map(({ href, label, icon: Icon, match }) => {
        const active = match(pathname);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`touch-target flex min-w-0 flex-1 flex-col items-center justify-center gap-1 px-1 py-1.5 transition-colors duration-200 ${
              active
                ? "text-secondary"
                : "text-on-surface-variant/60 hover:text-secondary/80"
            }`}
          >
            <Icon
              className="size-5"
              strokeWidth={active ? 2.25 : 1.75}
              aria-hidden
            />
            <span className="font-label text-[10px] tracking-widest">
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
