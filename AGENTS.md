# Agent instructions — Al-Ansaar

## Read docs before building

Before writing or changing application code, read the relevant docs in `docs/`:

1. [`docs/project-overview.md`](docs/project-overview.md) — product vision, architecture, auth, roadmap
2. [`docs/ui-plan.md`](docs/ui-plan.md) — Sacred Discipline visual system and screen specs
3. Active implementation plans (`docs/01-*.md`, etc.) — current pass scope, decisions, and done-when

Do not invent product behavior that contradicts those docs. If a plan is marked **Awaiting confirmation to build**, do not implement it until the developer confirms.

Stitch design references live under `docs/stitch_al_asr_readiness_training/`.

## Keep README in sync

After every build or feature pass that changes user-facing behavior, update [`README.md`](README.md) so it matches what the app actually does. Keep the banner, Arabic dua, and translation. Stay direct — no fluff. Reflect new capabilities, removed ones, and accurate paths/commands.

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
