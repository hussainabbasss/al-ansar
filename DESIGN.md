# Design System — Sacred Discipline

Visual system for **Al-Ansaar** mobile UI. Canonical narrative also lives in `docs/ui-plan.md` and `docs/stitch_al_asr_readiness_training/sacred_discipline/DESIGN.md`.

## Theme

Dark-only nocturnal command surface. Tonal elevation (surface ladder), not shadows. Restrained color strategy: tinted slate neutrals + emerald primary + scarce gold secondary.

## Brand

| Form | Use |
|------|-----|
| **الانصار** (Aref Ruqaa) | Hero calligraphic mark on Progress; quiet echo in atmospheric footer / sign-in |
| **AL-ANSAAR** (Source Serif, tracked) | Top bar wordmark and Latin chrome |

## Colors

| Token | Value | Use |
|-------|-------|-----|
| background / surface | `#0b1326` | Canvas |
| surface-container-lowest | `#060e20` | Inputs |
| surface-container-low | `#131b2e` | Secondary tiles |
| surface-container | `#171f33` | Cards / rows |
| surface-container-high | `#222a3d` | Elevated cards / sheets |
| surface-variant | `#2d3449` | Tracks |
| on-surface | `#dae2fd` | Body / titles |
| on-surface-variant | `#bfc9c3` | Secondary |
| outline / outline-variant | `#89938d` / `#404944` | Labels / borders |
| primary | `#95d3ba` | Progress, Latin brand accent |
| primary-container | `#064e3b` | Filled CTAs |
| secondary | `#ffb95f` | Calligraphy, active tab, READY, spiritual CTAs |

## Typography

- **Aref Ruqaa** — Arabic calligraphy (الانصار)
- **Source Serif 4** — display, Latin wordmark, sacred quotes
- **Geist** — UI titles and body
- **JetBrains Mono** — caps labels, metrics, chips

## Spacing & radius

4px base; 8px rhythm; ~20–28px mobile margin. Disciplined radii: ~4px controls, ~8px cards. Pills only for small chips and tab shell.

## Components

Shared under `src/components/ui/`: AlAnsaarMark, AppTopBar, BottomTabs, PreparationRing, CommandmentCard, PresenceRow, PromptComposer, FAB, ActionSheet, JournalSheet, MorningNoteSheet, StackHeader, PrimaryButton.

## Motion

Brand mark reveal (blur → clear), READY pulse, progress ring draw-in, sync spin, section fade-ins on Progress (150–450ms, ease-out-expo). Honor reduced motion.

## z-index

`--z-sticky` (40) → `--z-nav` (50) → `--z-overlay` (60) → `--z-toast` (70)
