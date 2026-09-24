---
name: carbon-design
description: IBM's Carbon Design System and the IBM Design Language, translated for the web — the 2x Grid, the 01–13 spacing scale, IBM Plex and the productive/expressive type sets, the four-theme token system with layering (background, layer, field), productive vs expressive motion with exact duration and easing tokens, square-cornered component conventions, data-dense table and form patterns, and IBM's accessibility floor. Use when building or reviewing enterprise software, admin consoles, dashboards, data tables, complex forms, data visualization, or any interface where information density, cross-framework consistency, and accessibility compliance matter more than personality.
---

# Carbon Design System

## Initial Response

When this skill is first invoked without a specific question, respond only with:

> I'm ready to help you build dense, grid-disciplined, Carbon-style interfaces on the web. My knowledge comes from IBM's Carbon Design System and the IBM Design Language.

Do not provide any other information until the user asks a question.

How IBM builds interfaces for people who use the same screen eight hours a day. This knowledge comes from the Carbon Design System (v11) and the IBM Design Language — distilled and translated to the web platform (CSS custom properties, CSS Grid, `prefers-reduced-motion`).

The through-line: **Carbon assumes the user is at work, in a hurry, and looking at a lot of information at once.** Every decision follows from that. Density over comfort, clarity over delight, the grid over the composition, and motion that gets out of the way rather than performing.

## The Core Idea

> Carbon is not trying to be liked. It's trying to be unambiguous.

Where Material optimizes for many teams shipping consistently, and Apple optimizes for craft, Carbon optimizes for **a user scanning a dense screen under time pressure, and an engineering org that must not drift across hundreds of products and five frameworks.**

What makes a screen read as Carbon:
1. **Square corners.** Near-zero border radius. This is the single most recognizable trait.
2. **The 2x Grid.** Visible, rigid, columnar. Content snaps to it.
3. **IBM Plex everywhere**, with one electric blue as the only real accent.
4. **Layering, not elevation.** Depth is a flat stack of surface tokens, not shadows.

If you round the corners and add shadows, you are no longer doing Carbon.

## 1. The 2x Grid

Carbon's grid is a 16-column grid where everything — column widths, gutters, margins, component heights — is a multiple of 8px, built up from a 4px mini-unit.

| Breakpoint | Min width | Columns | Margin |
| --- | --- | --- | --- |
| sm | 320px | 4 | 16px |
| md | 672px | 8 | 16px |
| lg | 1056px | 16 | 16px |
| xlg | 1312px | 16 | 16px |
| max | 1584px | 16 | 24px |

Gutter is 32px (16px each side of the column). Carbon offers three gutter modes: wide (default, 32px), narrow (16px, content hangs into the gutter), and condensed (1px, for tightly packed tiles).

**The grid is meant to be felt.** Unlike most systems where the grid is invisible scaffolding, Carbon interfaces often expose it — aligned edges, full-bleed dividers, tiles that snap hard. Content that floats free of the columns reads as a mistake.

```css
.grid {
  display: grid;
  grid-template-columns: repeat(16, 1fr);
  column-gap: 2rem;
  padding-inline: 1rem;
}
@media (max-width: 671px)  { .grid { grid-template-columns: repeat(4, 1fr); } }
@media (max-width: 1055px) { .grid { grid-template-columns: repeat(8, 1fr); } }
```

## 2. Spacing — the 01–13 scale

One scale, thirteen steps, named by index rather than size. Never improvise a value between them.

```
spacing-01   2px     spacing-06   24px    spacing-11   80px
spacing-02   4px     spacing-07   32px    spacing-12   96px
spacing-03   8px     spacing-08   40px    spacing-13  160px
spacing-04  12px     spacing-09   48px
spacing-05  16px     spacing-10   64px
```

Rough guidance: 01–03 for inside components, 04–06 between related elements, 07–09 between groups, 10–13 between page sections. Note how tight the low end is — Carbon's density comes from actually using `spacing-02` and `spacing-03`, not from shrinking fonts.

## 3. Color and the layering model

Carbon ships **four themes**, not two: **White** and **Gray 10** (light), **Gray 90** and **Gray 100** (dark). Products pick a pair and ship both.

The important concept is **layering, not elevation.** Carbon has essentially no shadows. Depth is a discrete stack of background tokens, each one step lighter or darker than the last:

```
$background      → the page
$layer-01        → a card or panel on the page
$layer-02        → something on that card
$layer-03        → something on that
```

Each layer has matching companions that step with it: `$field-01/02/03` for input backgrounds, `$border-subtle-00/01/02/03`, `$layer-hover-01/02/03`, `$layer-accent-01/02/03`. In Carbon's React implementation the `<Layer>` component increments the level automatically, so a component nested two deep picks the right tokens without being told.

**Semantic text and border tokens:**

| Token | Purpose |
| --- | --- |
| `$text-primary` | Body text and headings |
| `$text-secondary` | Labels, supporting text |
| `$text-helper` | Hints under fields |
| `$text-on-color` | Text on a filled button |
| `$text-error` | Inline error text |
| `$border-subtle` | Dividers, container edges |
| `$border-strong` | Input underlines |
| `$border-interactive` | Active/selected state |
| `$focus` | Focus ring — never restyle this away |
| `$interactive` | The one blue (Blue 60, `#0f62fe`) |
| `$support-error` / `-success` / `-warning` / `-info` | Status only |

**One accent, used sparingly.** Carbon's blue means "interactive." If you use it decoratively, you have broken the interface's main signal. Status colors mean status and nothing else.

## 4. Typography — IBM Plex, two type sets

IBM Plex Sans is the workhorse; Plex Mono for code, IDs, and numeric columns; Plex Serif rarely, for editorial moments.

Carbon splits its type tokens into two sets that mirror the motion split:

- **Productive** — tight line heights, for UI where reading is scanning. Most of your product.
- **Expressive** — larger sizes, looser leading, fluid across breakpoints. For marketing pages, landing sections, and the occasional hero moment inside a product.

Common productive tokens:

```
label-01          12px / 16px / 0.32 tracking
helper-text-01    12px / 16px
body-compact-01   14px / 18px      ← the dense default
body-01           14px / 20px
body-compact-02   16px / 22px
body-02           16px / 24px
heading-compact-01 14px / 18px / 600
heading-01        14px / 20px / 600
heading-02        16px / 24px / 600
heading-03        20px / 28px
heading-04        28px / 36px
heading-05        32px / 40px
heading-06        42px / 50px
heading-07        54px / 64px
code-01           12px / 16px  (Plex Mono)
```

Note `body-compact-01` at 14/18. That's the real default for dense product UI, and it's tighter than most systems allow. Use `body-01` (14/20) when there's prose to read.

The expressive set adds **fluid** tokens (`fluid-heading-03` through `06`, `fluid-display-01` through `04`) that interpolate across breakpoints with `clamp()`. Use those only in expressive contexts.

## 5. Motion — productive and expressive

Carbon's motion philosophy is explicit and worth quoting in spirit: motion is essential and efficient, guiding users to value as quickly as possible. **Avoid easing curves that suggest bounce, stretch, or sudden stops.** This is the exact opposite of Material's expressive springs, and it's deliberate — bounce is noise in a tool someone uses all day.

Two styles:
- **Productive** — fast, functional. Micro-interactions, state changes, anything routine. Almost everything.
- **Expressive** — slower, more present. Reserve for occasional important moments as a rhythmic break from the productive experience.

**Easing tokens:**

| Curve | Productive | Expressive |
| --- | --- | --- |
| Standard (visible start to end) | `cubic-bezier(0.2, 0, 0.38, 0.9)` | `cubic-bezier(0.4, 0.14, 0.3, 1)` |
| Entrance (appearing) | `cubic-bezier(0, 0, 0.38, 0.9)` | `cubic-bezier(0, 0, 0.3, 1)` |
| Exit (leaving) | `cubic-bezier(0.2, 0, 1, 0.9)` | `cubic-bezier(0.4, 0.14, 1, 1)` |

Entrance decelerates into place. Exit accelerates away — because something leaving doesn't need to be watched. Standard is for elements visible throughout, like an expanding tile or a sorting table row.

**Duration tokens:**

```
fast-01      70ms    micro-interactions, hover
fast-02     110ms    small expansions, short reveals
moderate-01 150ms    standard transitions
moderate-02 240ms    larger expansions
slow-01     400ms    large expansions, important moments
slow-02     700ms    background dimming, page-level
```

**Duration should scale with distance.** Carbon uses a non-linear duration scale so that a tall panel and a short one feel equally quick. If an element travels or scales further, give it more time. Carbon publishes a motion generator for the exact curve.

```css
.tile {
  transition: max-height 240ms cubic-bezier(0.2, 0, 0.38, 0.9);
}
.notification {
  animation: slide-in 110ms cubic-bezier(0, 0, 0.38, 0.9);
}
```

## 6. Shape and elevation — the square-corner rule

Carbon's default border radius is **0**. Buttons, inputs, tiles, modals, dropdowns: square. v11 introduced optional rounding for select cases, but square is the identity. The visual weight that other systems get from corner radius and shadow, Carbon gets from the grid and the layer stack.

Shadows exist only where something genuinely floats above the page and must be dismissed — overlays, popovers, toasts. Never on a card sitting in the flow.

## 7. Interactive states

States are systematic and must be complete. Every interactive element needs all of these, and missing one is a bug:

- **Hover** — `$layer-hover-*` or the token's `-hover` variant
- **Focus** — a **2px** `$focus` ring, always visible, never removed. Carbon uses a high-visibility double ring on dark fills.
- **Active** — the `-active` token variant
- **Selected** — `$layer-selected-*`
- **Disabled** — `$text-disabled`, `$button-disabled`; reduced contrast is accepted here by design
- **Skeleton** — Carbon ships skeleton states as a first-class thing. Use them; spinners for content loading are discouraged.

Focus visibility is non-negotiable in Carbon in a way it isn't in consumer systems. IBM ships to government and enterprise procurement that audits this.

## 8. The components that define a Carbon screen

- **Buttons** — primary, secondary, tertiary, ghost, danger, danger-tertiary, danger-ghost. Sizes sm through 2xl. Right-aligned in forms, full-bleed to the edge in side panels.
- **Data table** — the centerpiece. Sortable, selectable, expandable, with batch actions in a toolbar that replaces the header on selection. Sizes xs/sm/md/lg/xl for density.
- **Tile** — clickable, selectable, expandable. The square card.
- **UI shell** — header, side nav, switcher. The frame every IBM product sits in.
- **Notification** — inline, toast, actionable. Status color plus an icon, never color alone.
- **Form inputs** — text input, number, select, combo box, date picker, all with label above, helper text below, and inline error replacing the helper.
- **Progress indicator** — for multi-step flows, horizontal or vertical.

## 9. Accessibility — the floor, not the goal

- **Contrast: 4.5:1** for body text, **3:1** for large text and for non-text UI boundaries. Carbon's token pairs are built to satisfy this; breaking a pair breaks compliance.
- **Focus must always be visible.** 2px ring. No exceptions, no `outline: none`.
- **Never encode meaning in color alone.** Every status needs an icon and text.
- **Full keyboard operability**, including data tables, batch actions, and modals with focus trapping and restore.
- **Respect `prefers-reduced-motion`** — Carbon's motion is short enough that cutting it to near-zero costs almost nothing.
- Target size: **minimum 40px** for the standard control height, 48px for touch contexts.

```css
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
```

## 10. When not to use Carbon

Carbon's visual identity is intentionally enterprise. Bringing it to a consumer product means significant retheming, and at that point you've kept the architecture and thrown away the design, which is fine but should be a decision rather than a surprise.

It's the right call for admin consoles, dashboards, data-heavy tools, developer platforms, internal software, and anything with a compliance audit in its future. It's the wrong call for a marketing site, a portfolio, or a consumer app where warmth matters.

**The portable parts** even if you never ship a Carbon-looking screen: the 01–13 spacing scale, the layering model as an alternative to shadow-based elevation, the productive/expressive motion split, and the discipline of naming tokens by index rather than by appearance.

## Quick Reference

| Need | Token / technique | Concrete value |
| --- | --- | --- |
| Grid | 2x Grid, 16 columns | 32px gutter, 4/8/16 cols by breakpoint |
| Breakpoints | sm / md / lg / xlg / max | 320 / 672 / 1056 / 1312 / 1584 |
| Spacing | Index scale 01–13 | 2, 4, 8, 12, 16, 24, 32, 40, 48, 64, 80, 96, 160 |
| Depth | Layer stack, not shadow | `$layer-01` → `-02` → `-03` |
| Themes | Four, not two | White, Gray 10, Gray 90, Gray 100 |
| The accent | One blue, means interactive | Blue 60 `#0f62fe` |
| Dense body text | Productive set | `body-compact-01` 14/18 |
| Readable body text | Productive set | `body-01` 14/20 |
| Default motion | Productive standard | 150ms `cubic-bezier(0.2, 0, 0.38, 0.9)` |
| Something appearing | Productive entrance | 110ms `cubic-bezier(0, 0, 0.38, 0.9)` |
| Something leaving | Productive exit | 110ms `cubic-bezier(0.2, 0, 1, 0.9)` |
| Rare hero moment | Expressive standard | 400ms `cubic-bezier(0.4, 0.14, 0.3, 1)` |
| Corner radius | Square by default | 0 |
| Focus ring | Always visible | 2px `$focus` |
| Loading | Skeleton, not spinner | ships as a component |
| Contrast | WCAG AA | 4.5:1 text, 3:1 UI boundaries |
| Typeface | IBM Plex | Sans / Mono / Serif |