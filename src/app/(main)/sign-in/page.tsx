"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PrimaryButton } from "@/components/ui/Buttons";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    window.setTimeout(() => {
      router.push("/");
    }, 350);
  }

  return (
    <main className="mx-auto flex min-h-full max-w-lg flex-col px-[var(--margin-mobile)] pt-[max(3rem,env(safe-area-inset-top))] pb-10">
      <Link
        href="/"
        className="font-label mb-10 inline-flex min-h-11 items-center text-on-surface-variant transition-colors hover:text-primary"
      >
        ← Back to app
      </Link>

      <h1 className="font-display mb-2 text-center text-2xl font-semibold tracking-[0.18em] text-primary">
        AL-ANSAAR
      </h1>
      <p
        lang="ar"
        dir="rtl"
        className="font-calligraphy mb-2 text-center text-3xl text-secondary"
      >
        الانصار
      </p>
      <p className="mb-10 text-center text-sm leading-relaxed text-on-surface-variant">
        Sign in to sync and unlock AI features. Accounts are created on the web.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <label className="block">
          <span className="font-label mb-2 block text-on-surface-variant">
            Email
          </span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="min-h-11 w-full rounded border border-outline-variant bg-surface-container-lowest px-3 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-secondary focus:outline-none"
            placeholder="you@example.com"
            autoComplete="email"
          />
        </label>
        <label className="block">
          <span className="font-label mb-2 block text-on-surface-variant">
            Password
          </span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="min-h-11 w-full rounded border border-outline-variant bg-surface-container-lowest px-3 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-secondary focus:outline-none"
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </label>
        <PrimaryButton
          variant="gold"
          type="submit"
          className="mt-2"
          disabled={submitting}
        >
          {submitting ? "Signing in…" : "Sign In"}
        </PrimaryButton>
      </form>

      <p className="mt-8 text-center text-sm leading-relaxed text-outline">
        No in-app sign up. Request an account through the web portal when
        available.
      </p>
    </main>
  );
}
