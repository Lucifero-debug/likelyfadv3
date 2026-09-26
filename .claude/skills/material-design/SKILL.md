---
name: material-design
description: Google's Material Design 3 (and M3 Expressive) translated for the web — design tokens, HCT color and dynamic color, the 15-style type scale, the shape and elevation scales, the spring-based motion physics system, state layers, container transform and shared axis transitions, adaptive layout with window size classes, and touch-target/contrast accessibility. Use when building or reviewing Material-style UI, Android or Flutter-flavored web interfaces, token-driven design systems, themeable/dynamic-color products, or any interface that needs a documented, component-based visual language rather than a bespoke one.
---

# Material Design

## Initial Response

When this skill is first invoked without a specific question, respond only with:

> I'm ready to help you build token-driven, Material-style interfaces on the web. My knowledge comes from Google's Material Design 3 and M3 Expressive specs, translated for the web.

Do not provide any other information until the user asks a question.

How Google builds an interface that a thousand engineers can extend without it drifting apart. This knowledge comes from the Material Design 3 specification and the M3 Expressive update announced at Google I/O 2025 — distilled and translated to the web platform (CSS custom properties, `color-mix`, `@container`, spring libraries, `prefers-reduced-motion`).

The through-line: **nothing in a Material interface is a literal value. Every color, size, corner, and animation is a named role that resolves to a value.** That indirection is the entire system. It is why one theme change cascades through hundreds of components, why dynamic color is possible at all, and why Material scales where bespoke design doesn't.

## The Core Idea

> Material is not a look. It's a token layer plus a component library plus the rules that connect them.

Where Apple's system optimizes for a single company's taste applied with obsessive craft, Material optimizes for **many teams shipping consistently on unknown hardware, in unknown languages, at unknown text sizes, with a user-chosen color scheme.** Design for that and the rest follows.

Three things distinguish M3 from what came before:
1. **Roles, not hexes.** You never write a color. You write `--md-sys-color-primary`.
2. **Tonal elevation.** Depth comes primarily from surface *color*, with shadow as a secondary hint.
3. **Physics, not duration.** Since M3 Expressive, motion is spring-based, not easing-and-duration.

## 1. Tokens — the non-negotiable foundation

Everything below assumes a token layer. If you skip this, you are not doing Material, you are doing something that looks vaguely like it.

Three layers, and components only ever read the third:

| Layer | Example | Who reads it |
| --- | --- | --- |
| **Reference** | `--md-ref-palette-primary40` | Nothing. Raw tonal values. |
| **System** | `--md-sys-color-primary` | Components. This is the API. |
| **Component** | `--md-comp-fab-container-color` | Optional, for per-component overrides. |

```css
:root {
  --md-ref-palette-primary40: #6750a4;
  --md-sys-color-primary: var(--md-ref-palette-primary40);
}
.fab { background: var(--md-sys-color-primary); } /* never a hex */
```

**Rule: if you type a hex value anywhere outside the reference layer, you have introduced a bug.** It will not respond to theme changes, dark mode, or dynamic color.

## 2. Color — HCT, tonal palettes, and roles

Material generates color in **HCT** (hue, chroma, tone), a color space built so that *tone maps directly to perceptual lightness*. This is the whole trick: if two colors are 40 tones apart, they have a predictable contrast ratio regardless of hue. You cannot get that guarantee from HSL.

**How a theme is built:**
1. Pick one seed color (a brand color, or on Android, extracted from the user's wallpaper).
2. Material derives five tonal palettes: primary, secondary, tertiary, neutral, neutral-variant. Plus error.
3. Each palette has tones 0–100.
4. Roles map to specific tones. Light theme uses primary tone 40 for `primary`; dark theme uses tone 80.

**The role pairs you actually use.** Every `X` has an `on-X` guaranteed to be readable on it. Never mix and match across pairs.

| Role | Purpose |
| --- | --- |
| `primary` / `on-primary` | The main action. Filled buttons, FAB, active states. |
| `primary-container` / `on-primary-container` | A quieter primary. Tinted surfaces, selected chips. |
| `secondary` / `tertiary` (+ containers) | Supporting accents. Tertiary is for contrast and balance, not a third brand color. |
| `error` / `on-error` (+ container) | Errors only. Never for emphasis. |
| `surface` / `on-surface` | The page and its text. |
| `on-surface-variant` | Secondary text, icons, inactive states. |
| `outline` / `outline-variant` | Borders and dividers respectively. |
| `inverse-surface` / `inverse-on-surface` / `inverse-primary` | Snackbars and anything on an inverted ground. |

**Surface containers replace the old tint math.** Instead of overlaying primary at increasing opacity, M3 ships discrete surface roles: `surface-dim`, `surface`, `surface-bright`, and `surface-container-lowest` / `-low` / `-container` / `-high` / `-highest`. Use these for depth. The older `surface-tint` approach is being phased out — prefer the container roles.

```css
.card       { background: var(--md-sys-color-surface-container-low); }
.dialog     { background: var(--md-sys-color-surface-container-high); }
.bottom-nav { background: var(--md-sys-color-surface-container); }
```

**On the web, generate the palettes — don't hand-pick them.** Use `@material/material-color-utilities` to go from a seed to a full token set, then emit CSS variables for light and dark.

## 3. Typography — 15 styles, two emphases

Five roles × three sizes = 15 styles. Use the role that matches the *job*, not the size you want.

| Role | Job |
| --- | --- |
| **Display** | Short, high-impact text. Hero numbers, big statements. Rare. |
| **Headline** | Section headings. |
| **Title** | Card and dialog headings, list headers. Medium/small are weight 500. |
| **Body** | Paragraphs and long-form. |
| **Label** | UI chrome — buttons, tabs, chips, captions. Always weight 500. |

Baseline values in sp (size / line-height / tracking):

```
display-large    57 / 64 / -0.25      title-large      22 / 28 /  0
display-medium   45 / 52 /  0         title-medium     16 / 24 /  0.15  w500
display-small    36 / 44 /  0         title-small      14 / 20 /  0.10  w500
headline-large   32 / 40 /  0         body-large       16 / 24 /  0.50
headline-medium  28 / 36 /  0         body-medium      14 / 20 /  0.25
headline-small   24 / 32 /  0         body-small       12 / 16 /  0.40
                                      label-large      14 / 20 /  0.10  w500
                                      label-medium     12 / 16 /  0.50  w500
                                      label-small      11 / 16 /  0.50  w500
```

Note the tracking direction: **negative on display, increasingly positive as text gets smaller.** Same principle Apple applies, opposite default.

**M3 Expressive adds a parallel "emphasized" set** for all 15 styles — heavier weight and wider width, built for variable fonts. Use emphasized to create hierarchy *without* changing size, which is how you get editorial-feeling layouts inside a rigid grid.

```css
.headline-large {
  font: 400 2rem/2.5rem var(--md-sys-typescale-brand);
  letter-spacing: 0;
}
.headline-large--emphasized {
  font-weight: 500;
  font-variation-settings: "wdth" 110;
}
```

Roboto Flex is the default variable font and its axes (`wght`, `wdth`, `opsz`, `GRAD`) are the intended mechanism. Ship a static fallback.

## 4. Shape — the corner scale

Corner radius is a token, never an improvised number.

```
none 0    extra-small 4    small 8    medium 12    large 16
large-increased 20    extra-large 28    extra-large-increased 32
extra-extra-large 48    full 9999
```

Conventions worth knowing: cards use medium, dialogs and bottom sheets extra-large, FABs large, buttons and chips full. Deviating is allowed; deviating *inconsistently* is the failure mode.

**Shape morphing is the signature M3 Expressive move.** Shapes animate between states — a button squashing on press, a loading indicator cycling through a shape library. On the web, animate `border-radius` on a spring, or morph SVG paths for the non-rectangular shapes.

```css
.fab { border-radius: 16px; transition: border-radius 200ms; }
.fab:active { border-radius: 28px; }
```

## 5. Elevation — tonal first, shadow second

Six levels, in dp: **0, 1, 3, 6, 8, 12.**

The M3 change from M2 is the important part: **depth is expressed primarily through surface color, with shadow as a secondary cue.** A raised card in M3 is a lighter surface container. A raised card in M2 was a drop shadow. If you port an M2 design by keeping the shadows and ignoring the surfaces, it will look wrong and you won't know why.

Typical assignments: cards level 1, navigation bars level 2, FAB level 3, dialogs level 3, menus level 2.

```css
.card {
  background: var(--md-sys-color-surface-container-low);
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.30), 0 1px 3px 1px rgb(0 0 0 / 0.15);
}
```

Never use shadow alone to carry hierarchy in dark theme — shadows barely read on dark surfaces, which is exactly why tonal elevation exists.

## 6. State layers — how Material shows interaction

Every interactive element carries a translucent overlay in `on-surface` (or the relevant `on-` role) at a fixed opacity per state. This is a system, not a per-component decision.

| State | Opacity |
| --- | --- |
| Hover | 8% |
| Focus | 10% |
| Pressed | 10% |
| Dragged | 16% |

```css
.button { position: relative; isolation: isolate; }
.button::after {
  content: ""; position: absolute; inset: 0; border-radius: inherit;
  background: currentColor; opacity: 0; transition: opacity 100ms; z-index: -1;
}
.button:hover::after  { opacity: 0.08; }
.button:focus-visible::after { opacity: 0.10; }
.button:active::after { opacity: 0.10; }
```

The **ripple** is Material's other interaction signature: an ink splash originating from the pointer position, not the element center. If you implement it, originate it correctly or don't implement it.

## 7. Motion physics — springs, since M3 Expressive

M3 Expressive replaced the easing-and-duration system with a **physics-based spring system.** Two axes:

**Two token categories:**
- **Spatial** — position, size, layout, shape. Configured to allow overshoot.
- **Effects** — color, opacity. High damping, no overshoot, because bouncing opacity looks broken.

**Two schemes:**
- **Expressive** — the recommended default. Lower damping, visible bounce. For hero moments and key interactions.
- **Standard** — higher damping, minimal bounce. For utilitarian, dense, or productivity UI.

Published token values (damping ratio / stiffness):

| Token | Damping | Stiffness |
| --- | --- | --- |
| standard spatial fast | 0.9 | 1400 |
| standard spatial default | 0.9 | 700 |
| standard spatial slow | 0.9 | 300 |
| expressive spatial fast | 0.6 | 800 |
| expressive spatial default | 0.8 | 380 |
| expressive spatial slow | 0.8 | 200 |
| effects fast | 1.0 | 3800 |
| effects default | 1.0 | 1600 |
| effects slow | 1.0 | 800 |

Check m3.material.io for canonical values before shipping — the token set is still evolving.

```js
import { animate } from 'motion';

// Spatial: an element moving. Expressive default.
animate(el, { y: 0 }, { type: 'spring', stiffness: 380, damping: 0.8 });

// Effects: a color or opacity change. Never bounce these.
animate(el, { opacity: 1 }, { type: 'spring', stiffness: 1600, damping: 1.0 });
```

Note that **the same token is faster on a watch than on a tablet** in the official implementation — the relationship between fast/default/slow is what's guaranteed, not the absolute value. On the web, pick one device context and be consistent.

Like any spring system, these are interruptible and velocity-aware. Animate from the current on-screen value, not the target, when a gesture interrupts.

## 8. Transitions — the four patterns

Material names its transitions, and naming them is most of the value. Pick the one that matches the *relationship* between the two screens.

| Pattern | Use when | Behavior |
| --- | --- | --- |
| **Container transform** | One element becomes a screen. Card → detail page, FAB → sheet, search bar → results. | The container morphs: bounds, corner radius, and color interpolate. Outgoing content fades out fast, incoming fades in slow. |
| **Shared axis** | The two screens have a spatial or sequential relationship. Onboarding steps, back/forward. | Both move together along X, Y, or Z, with a fade. Direction encodes forward vs backward. |
| **Fade through** | The two screens are unrelated peers. Bottom-nav destinations. | Outgoing fades out and scales to 92%, then incoming fades in. Sequential, not simultaneous. |
| **Fade** | An element enters or leaves on top of everything. Dialogs, menus. | Simple fade plus a small scale. |

The single most common mistake is using fade-through between screens that *do* have a relationship, which throws away the spatial story.

Container transform on the web: the View Transitions API with `view-transition-name` gets you most of the way, with a spring for the morph.

## 9. Layout and spacing

**Everything sits on a 4dp grid; 8dp is the common step.** Spacing values: 4, 8, 12, 16, 24, 32, 40, 48. Component-internal padding is often 4 or 8; layout gaps are 16 or 24.

**Window size classes** are Material's breakpoints, defined by content need rather than device:

| Class | Width | Typical layout |
| --- | --- | --- |
| Compact | < 600dp | One pane. Bottom nav. |
| Medium | 600–839dp | One pane, wider margins. Nav rail. |
| Expanded | 840–1199dp | Two panes. Nav rail or drawer. |
| Large | 1200–1599dp | Two panes. Permanent drawer. |
| Extra-large | ≥ 1600dp | Two or three panes. |

Margins: 16dp compact, 24dp medium and up. Use container queries rather than viewport media queries where a component can appear in more than one pane.

**Canonical layouts** — list-detail, supporting pane, feed. Pick one and let the size class decide how it collapses, rather than inventing a responsive behavior per screen.

## 10. Components that make a screen read as Material

- **FAB** — one per screen, for the single most important action. Level 3 elevation, large corner. Small / standard / large / extended variants.
- **Buttons** — five variants in a deliberate emphasis order: elevated, filled, filled-tonal, outlined, text. Filled-tonal is the underused one: a real action that isn't *the* action.
- **Cards** — elevated, filled, outlined. Medium corner.
- **Chips** — assist, filter, input, suggestion. Four different jobs, don't blur them.
- **Navigation** — bottom bar (compact), rail (medium+), drawer (expanded+). Same destinations, different container.
- **Snackbar** — brief, one optional action, inverse surface.

M3 Expressive additions worth knowing: button groups, split buttons, FAB menus, loading indicators that morph through shapes, and wavy progress indicators.

## 11. Accessibility — non-negotiables

- **Touch targets: 48 × 48dp minimum**, even when the visual element is smaller. Expand the hit area, don't grow the icon.
- **Contrast:** 4.5:1 for body text, 3:1 for large text and for UI component boundaries. The `on-` role pairs are engineered to satisfy this — which is why breaking a pair is a real bug, not a style choice.
- **Never encode meaning in color alone.** An error state needs an icon or text, not just `error` red.
- **Respect `prefers-reduced-motion`.** Drop overshoot, replace spatial springs with short cross-fades, keep the effects springs. Motion that aids comprehension can stay; motion that only decorates goes.
- **Respect user text size.** The type scale is in sp precisely so it scales. Size layout in `rem`, never fixed px, or large text will break it.
- Dynamic color must still pass contrast after the user picks a seed. Test the extremes.

```css
@media (prefers-reduced-motion: reduce) {
  .sheet { transition: opacity 150ms linear; transform: none !important; }
}
```

## 12. When not to use Material

Material is a strong opinion. It's the right call for productivity tools, dashboards, multi-team products, anything Android-adjacent, and anything that must be themeable. It's the wrong call for a brand-forward marketing site or a portfolio, where its recognizability works against you — the interface will read as "a Google app," not as the brand.

The usable middle: **take Material's token architecture and discard its component aesthetic.** The role system, the tonal palettes, the spring tokens, and the 4dp grid are all portable to a completely different-looking product. That's usually the highest-value thing to steal.

## Quick Reference

| Need | Token / technique | Concrete value |
| --- | --- | --- |
| Any color | System role, never a hex | `var(--md-sys-color-primary)` |
| Readable text on a fill | The paired `on-` role | `on-primary` on `primary` |
| Depth | Surface container role first, shadow second | `surface-container-high` |
| Elevation levels | Six steps in dp | 0, 1, 3, 6, 8, 12 |
| Corner radius | Shape scale | 0, 4, 8, 12, 16, 20, 28, 32, 48, full |
| Spacing | 4dp grid | 4, 8, 12, 16, 24, 32, 40, 48 |
| Default motion | Expressive spatial default | damping 0.8, stiffness 380 |
| Color / opacity motion | Effects, never bounces | damping 1.0, stiffness 1600 |
| Calm, utilitarian motion | Standard scheme | damping 0.9, stiffness 700 |
| Card opens to a page | Container transform | morph bounds + radius + color |
| Peer destinations | Fade through | out+scale to 92%, then in |
| Sequential screens | Shared axis | X, Y, or Z with fade |
| Hover / focus / press | State layer opacity | 8% / 10% / 10% |
| Minimum tap target | Expand hit area, not icon | 48 × 48dp |
| Body text contrast | WCAG AA | 4.5:1 (3:1 large text and UI) |
| Breakpoints | Window size classes | 600 / 840 / 1200 / 1600dp |
| Hierarchy without size change | Emphasized type set | heavier weight + wider width |
| Theme from one color | material-color-utilities | seed → HCT → 5 tonal palettes |