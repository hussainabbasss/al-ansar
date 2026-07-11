---
name: Sacred Discipline
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#bfc9c3'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#89938d'
  outline-variant: '#404944'
  surface-tint: '#95d3ba'
  primary: '#95d3ba'
  on-primary: '#003829'
  primary-container: '#064e3b'
  on-primary-container: '#80bea6'
  inverse-primary: '#2b6954'
  secondary: '#ffb95f'
  on-secondary: '#472a00'
  secondary-container: '#ee9800'
  on-secondary-container: '#5b3800'
  tertiary: '#b9c7e0'
  on-tertiary: '#233144'
  tertiary-container: '#374559'
  on-tertiary-container: '#a4b2ca'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#b0f0d6'
  primary-fixed-dim: '#95d3ba'
  on-primary-fixed: '#002117'
  on-primary-fixed-variant: '#0b513d'
  secondary-fixed: '#ffddb8'
  secondary-fixed-dim: '#ffb95f'
  on-secondary-fixed: '#2a1700'
  on-secondary-fixed-variant: '#653e00'
  tertiary-fixed: '#d5e3fd'
  tertiary-fixed-dim: '#b9c7e0'
  on-tertiary-fixed: '#0d1c2f'
  on-tertiary-fixed-variant: '#3a485c'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  display:
    fontFamily: Source Serif 4
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Source Serif 4
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 36px
  headline-lg-mobile:
    fontFamily: Source Serif 4
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-md:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-sm:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.1em
  data-mono:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  gutter: 16px
  margin-mobile: 20px
  margin-desktop: 64px
---

## Brand & Style
The design system is built upon the philosophy of **Sacred Discipline**. It serves as a digital companion for active anticipation, moving beyond passive waiting into a state of prepared readiness. The target audience is a community focused on self-improvement, spiritual tracking, and communal responsibility.

The visual style is **Sophisticated Minimalism** with **Tactile/Industrial** undertones. It avoids the fluff of typical consumer apps in favor of a "high-performance tool" aesthetic. By blending raw, structured layouts with subtle spiritual textures, the UI evokes the feeling of a modern command center for the soul. The experience should feel solemn, empowering, and intentionally grounded—mirroring the weight of *muhasaba* (self-reflection).

## Colors
The palette is rooted in a deep, nocturnal environment to promote focus and minimize eye strain during night-time reflection.

- **Primary (Deep Emerald):** Representing spiritual life and growth. Used for key progress indicators and active states.
- **Secondary (Gold):** Representing divine guidance and the "waiting" light. Used sparingly for accents, critical alerts, or completed spiritual milestones.
- **Neutral/Surface (Slate & Charcoal):** The backbone of the "discipline" aesthetic. These shades provide the structural grounding and distinguish between local-first data containers.
- **Text:** High-contrast whites and silver-grays to ensure legibility against the dark void of the background.

## Typography
Typography reflects the intersection of tradition and modern performance.

- **Headlines:** Use **Source Serif 4**. Its authoritative, calligraphic-inspired terminals lend a sense of history and sacredness to spiritual titles and quotes.
- **Body:** Use **Geist**. This typeface provides a technical, clean, and modern feel that emphasizes the "high-performance" nature of the app.
- **System/Data:** Use **JetBrains Mono** for tracking metrics, timers, and metadata. The monospaced nature reinforces the feeling of an "instrument" or a logbook.

## Layout & Spacing
The layout follows a **Rigid Fluidity** model. While the app is mobile-first and local-first, the spacing must feel architectural and deliberate.

- **Grid:** A 4-column grid for mobile and 12-column for tablet/desktop. 
- **Rhythm:** An 8px linear scale is used for all spatial relationships. 
- **Margins:** Wider than average side margins (20px on mobile) are used to create a "contained" and focused reading area, preventing content from feeling cluttered.
- **Local-First Indicators:** Explicit "Sync Status" areas are reserved at the top or bottom of the layout to reinforce the offline-ready nature of the tool.

## Elevation & Depth
Depth is created through **Tonal Layering** rather than traditional shadows. In this dark theme, shadows are ineffective; instead, we use "Surface Container" tiers.

- **Level 0 (Background):** Deepest black/blue (#020617). 
- **Level 1 (Cards/Items):** Slate gray (#1E293B) with a subtle 1px border (#334155).
- **Level 2 (Modals/Popovers):** Slightly lighter charcoal with a 1px Emerald border to indicate "active" focus.
- **Glassmorphism:** Reserved strictly for top navigation bars and bottom tab bars to maintain context of the scroll position, using a heavy backdrop blur (20px) and 10% opacity Emerald tint.

## Shapes
Shapes are **Disciplined and Sharp**. We use a "Soft" (0.25rem) corner radius for most elements to maintain a sense of precision and military-like readiness. 

- **Containers:** 4px radius. Large radius or "bubbly" shapes are strictly avoided as they conflict with the solemn tone.
- **Buttons:** 4px radius or fully sharp (0px) for high-action utility buttons.
- **Geometric Patterns:** Subtle SVG patterns of 8-pointed stars (Khatim) are used as low-opacity overlays (2-4% opacity) on primary surfaces to provide texture without distracting from data.

## Components
- **Action Buttons:** Primary buttons use the Emerald Green background with White text. Secondary "Discipline" buttons use a Slate background with a 1px Gold border.
- **Status Chips:** Small, monospaced labels used for "Completed," "Pending," or "Reflected." These should look like technical tags.
- **Spiritual Logs (Lists):** Each entry is separated by a thin, 1px Slate-700 divider. No heavy shadows.
- **Input Fields:** Minimalist underlines or 1px bordered boxes. The active state is indicated by a Gold glow on the bottom border only.
- **Cards:** Used for daily prompts or "Ayat of the Day." These feature a faint Islamic geometric watermark in the corner and use the Source Serif font for content.
- **The "Ready" Indicator:** A persistent, small Gold dot or glow in the UI that pulses slowly when the app is in "Active Anticipation" mode (high-priority task or prayer time).