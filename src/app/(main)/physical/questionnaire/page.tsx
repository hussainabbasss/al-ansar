"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { StackHeader } from "@/components/ui/StackHeader";
import { PrimaryButton } from "@/components/ui/Buttons";
import { requestFitnessPlan } from "@/lib/physical/generate";
import type {
  Equipment,
  FitnessGoal,
  FitnessLevel,
  FitnessProfile,
} from "@/lib/physical/types";

type StepKey =
  | "heightCm"
  | "weightKg"
  | "age"
  | "level"
  | "goal"
  | "equipment"
  | "daysPerWeek"
  | "medicalNotes";

const steps: {
  key: StepKey;
  label: string;
  placeholder?: string;
  type: "number" | "text" | "select";
  options?: { value: string; label: string }[];
}[] = [
  {
    key: "heightCm",
    label: "Height (cm)",
    placeholder: "175",
    type: "number",
  },
  {
    key: "weightKg",
    label: "Weight (kg)",
    placeholder: "72",
    type: "number",
  },
  { key: "age", label: "Age", placeholder: "28", type: "number" },
  {
    key: "level",
    label: "Fitness level",
    type: "select",
    options: [
      { value: "beginner", label: "Beginner" },
      { value: "intermediate", label: "Intermediate" },
      { value: "advanced", label: "Advanced" },
    ],
  },
  {
    key: "goal",
    label: "Primary goal",
    type: "select",
    options: [
      { value: "endurance", label: "Endurance" },
      { value: "strength", label: "Strength" },
      { value: "mobility", label: "Mobility" },
      { value: "balanced", label: "Balanced readiness" },
    ],
  },
  {
    key: "equipment",
    label: "Equipment",
    type: "select",
    options: [
      { value: "bodyweight", label: "Bodyweight only" },
      { value: "home", label: "Home (bands / dumbbells)" },
      { value: "gym", label: "Full gym" },
    ],
  },
  {
    key: "daysPerWeek",
    label: "Training days / week",
    type: "select",
    options: [
      { value: "3", label: "3 days" },
      { value: "4", label: "4 days" },
      { value: "5", label: "5 days" },
      { value: "6", label: "6 days" },
    ],
  },
  {
    key: "medicalNotes",
    label: "Medical constraints",
    placeholder: "Injuries, limits, or none",
    type: "text",
  },
];

export default function QuestionnairePage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Record<string, string>>({
    level: "intermediate",
    goal: "balanced",
    equipment: "bodyweight",
    daysPerWeek: "4",
    medicalNotes: "none",
  });
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const current = steps[step]!;
  const isLast = step === steps.length - 1;
  const progress = useMemo(
    () => ((step + 1) / steps.length) * 100,
    [step],
  );

  async function finish() {
    setError(null);
    const heightCm = Number(values.heightCm);
    const weightKg = Number(values.weightKg);
    const age = Number(values.age);
    const daysPerWeek = Number(values.daysPerWeek);

    if (
      !heightCm ||
      !weightKg ||
      !age ||
      heightCm < 100 ||
      weightKg < 30 ||
      age < 12
    ) {
      setError("Check height, weight, and age.");
      return;
    }

    const profile: FitnessProfile = {
      heightCm,
      weightKg,
      age,
      level: values.level as FitnessLevel,
      goal: values.goal as FitnessGoal,
      equipment: values.equipment as Equipment,
      medicalNotes: values.medicalNotes?.trim() || "none",
      daysPerWeek,
    };

    setGenerating(true);
    try {
      await requestFitnessPlan(profile);
      router.push("/physical/");
    } catch {
      setError("Could not save plan to device storage.");
      setGenerating(false);
    }
  }

  function next() {
    if (!isLast) {
      setStep((s) => s + 1);
      return;
    }
    void finish();
  }

  return (
    <div className="min-h-full">
      <StackHeader
        title="Fitness Profile"
        eyebrow="Sacred Discipline"
        backHref="/physical/"
      />
      <main className="mx-auto max-w-lg px-[var(--margin-mobile)] py-8">
        <p className="font-data mb-6 text-on-surface-variant">
          Step {step + 1} of {steps.length}
        </p>
        <div className="mb-6 h-1 w-full rounded-full bg-surface-variant">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <label className="block">
          <span className="font-label mb-3 block text-secondary">
            {current.label}
          </span>
          {current.type === "select" ? (
            <select
              value={values[current.key] ?? ""}
              onChange={(e) =>
                setValues((v) => ({ ...v, [current.key]: e.target.value }))
              }
              className="min-h-11 w-full rounded border border-outline-variant bg-surface-container-lowest px-3 py-3 text-base text-on-surface focus:border-secondary focus:outline-none"
            >
              {current.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={current.type}
              value={values[current.key] ?? ""}
              onChange={(e) =>
                setValues((v) => ({ ...v, [current.key]: e.target.value }))
              }
              placeholder={current.placeholder}
              className="min-h-11 w-full rounded border border-outline-variant bg-surface-container-lowest px-3 py-3 text-base focus:border-secondary focus:outline-none"
            />
          )}
        </label>

        {error ? (
          <p className="mt-4 text-sm text-error" role="alert">
            {error}
          </p>
        ) : null}

        <div className="mt-8 flex gap-3">
          {step > 0 ? (
            <PrimaryButton
              variant="discipline"
              className="flex-1"
              disabled={generating}
              onClick={() => setStep((s) => s - 1)}
            >
              Back
            </PrimaryButton>
          ) : null}
          <PrimaryButton
            className="flex-1"
            disabled={generating}
            onClick={next}
          >
            {generating
              ? "Generating…"
              : isLast
                ? "Generate 4-week plan"
                : "Continue"}
          </PrimaryButton>
        </div>

        <p className="font-data mt-6 text-center text-outline">
          Plan saved on this device · refreshes with your details
        </p>
      </main>
    </div>
  );
}
