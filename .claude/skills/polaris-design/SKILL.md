---
name: polaris-design
description: Shopify's Polaris design system translated for the web — the space and border-radius token scales, semantic colour roles, the Card/Page/Stack layout model, admin patterns (index tables, resource lists, empty states, banners, badges, toasts), the save bar and form conventions, and Polaris's content and voice guidelines, which are as load-bearing as its visuals. Use when building or reviewing admin interfaces, dashboards, embedded Shopify apps, SaaS back-offices, settings and onboarding flows, or any product where a non-technical operator has to do real work without being confused or scared.
---

# Polaris Design System

## Initial Response

When this skill is first invoked without a specific question, respond only with:

> I'm ready to help you build clear, merchant-friendly, Polaris-style admin interfaces on the web. My knowledge comes from Shopify's Polaris design system, including its content guidelines.

Do not provide any other information until the user asks a question.

How Shopify builds software for people who did not choose to be software users. This knowledge comes from the Polaris design system — its tokens, components, patterns and, crucially, its content guidelines — translated for the web.

The through-line: **the person using this is running a business, not admiring your interface, and a confusing screen costs them real money.** Every Polaris decision follows from taking that seriously.

## The Core Idea

> In Polaris, the words are part of the design system. Not a layer added afterwards.

This is the thing that makes Polaris different from Apple, Material and Carbon, all of which document visuals thoroughly and content lightly. Polaris documents them with equal weight, because in an admin tool most of the interface *is* text: labels, helper text, empty states, error messages, confirmation dialogs. A beautifully spaced screen with a scary error message is a failed screen.

What makes a screen read as Polaris:
1. **Cards on a grey page.** A neutral background with white cards is the whole layout metaphor.
2. **Restrained colour.** Near-monochrome, with colour reserved for status and one primary action.
3. **Plain language.** Sentence case, no jargon, no cleverness.
4. **A visible primary action** and everything else quieter.

## 1. Tokens

Polaris tokens are CSS custom properties prefixed `--p-`. Use the semantic ones; the primitive scales exist underneath.

**Space** — a 4px base with extra low-end steps:

```
space-050   2px    space-500  20px    space-1600   64px
space-100   4px    space-600  24px    space-2000   80px
space-150   6px    space-800  32px    space-2400   96px
space-200   8px    space-1000 40px    space-3200  128px
space-300  12px    space-1200 48px
space-400  16px
```

`space-400` (16px) is the workhorse: card padding, gaps between form fields. `space-200` inside components, `space-600` between sections.

**Border radius:**

```
radius-050  2px    radius-300  12px    radius-750  30px
radius-100  4px    radius-400  16px    radius-full pill
radius-150  6px    radius-500  20px
radius-200  8px
```

Cards and most containers use `radius-300`; buttons and inputs `radius-200`. Polaris sits deliberately between Carbon's square corners and Material's generous ones.

**Colour** is semantic, and the naming tells you the job: `--p-color-bg-surface` (a card), `--p-color-bg-surface-secondary` (the page behind it), `--p-color-bg-fill-brand` (the primary button), `--p-color-text`, `--p-color-text-secondary`, `--p-color-border`, plus `-critical`, `-warning`, `-success`, `-info` variants for status. Never a hex.

**Type** is Inter, with a small scale: `heading-3xl` down through `heading-sm`, then `body-lg / md / sm / xs`. Notably fewer steps than Material's fifteen, because an admin tool doesn't need display type.

## 2. The layout model

Polaris layout is unusually simple, and that's the point. Three pieces do most of the work.

- **Page** — the outer wrapper. Owns the title, breadcrumb, primary action, and secondary actions. Everything lives inside one.
- **Card** — the content container. White, rounded, on a grey page. If content is grouped, it's in a card.
- **BlockStack / InlineStack** — vertical and horizontal stacking with a `gap` from the space scale. You almost never write a custom flex container.

```jsx
<Page title="Orders" primaryAction={{ content: 'Create order' }}>
  <Card>
    <BlockStack gap="400">
      <Text as="h2" variant="headingMd">Unfulfilled</Text>
      <IndexTable {...props} />
    </BlockStack>
  </Card>
</Page>
```

**One primary action per page**, in the page header. Everything else is secondary or lives in an overflow menu. If two things both feel primary, the page is doing too much.

Polaris uses a one- or two-column layout: main content plus an optional narrower secondary column for things like order summaries or status cards. It does not do complex multi-pane layouts, because admin tasks are usually linear.

## 3. Content guidelines — treat these as spec, not suggestion

This section is the reason to reach for Polaris even if you never use its components.

**Voice.** Plain, direct, and confident without being chirpy. You are a knowledgeable colleague, not a mascot and not a lawyer.

**Mechanics:**
- **Sentence case everywhere.** Buttons, headings, table columns, menu items. "Create order", not "Create Order".
- **Active voice, verb first.** "Delete product", not "Product deletion".
- **No terminal punctuation on labels, headings, or buttons.** Helper text and body copy do get periods.
- **Use contractions.** They're, you'll, don't.
- **No jargon, and no internal vocabulary.** If the merchant wouldn't say it, don't write it.
- **Numbers as numerals.** "3 products", not "three products".

**Buttons** name the action and its object: "Create discount", "Archive order". Never "OK", "Submit", "Click here", or "Yes"/"No" on a destructive dialog — label the actual outcome so someone skimming can't get it wrong.

**Errors** say what happened and what to do, in one or two sentences, with no blame and no "Error:" prefix. Put the message next to the field that caused it, not in a banner at the top of the page.

```
Bad   "Invalid input."
Bad   "Error: The value you entered for the price field could not be validated."
Good  "Enter a price using numbers only."
```

**Empty states** are an invitation, not an apology. Name what goes here, say one line about why it's useful, and give one action. Never "No data."

**Destructive confirmations** state the consequence and whether it's reversible. "Delete 12 products? This can't be undone." Then label the button "Delete products", not "Confirm".

## 4. Status and feedback

Polaris has a clear hierarchy of how loud a message is, and picking the wrong level is the common mistake.

| Pattern | Loudness | Use for |
| --- | --- | --- |
| **Badge** | Quietest | Persistent status on an object. Paid, Fulfilled, Draft. |
| **Inline field error** | Quiet | A specific field is wrong. |
| **Toast** | Brief | Something succeeded and needs no action. Auto-dismisses. |
| **Banner** | Loud | Something needs attention on this page. Info, warning, critical, success. Stays. |
| **Modal** | Loudest | A decision must be made before continuing. Use rarely. |

Tones are `info`, `success`, `warning`, `critical`. Each pairs colour with an icon and text, never colour alone. A critical banner should be rare enough that it still means something.

**The contextual save bar** is a signature Polaris pattern: when a form becomes dirty, a bar appears pinned at the top with "Save" and "Discard", and it blocks navigation until resolved. Merchants lose work otherwise. If you build forms in an admin, build this.

## 5. Data display

- **IndexTable** — for lists of resources you act on in bulk. Selection, bulk actions that swap into the header, sorting, sticky header.
- **ResourceList** — for lists where each item needs a richer, less tabular layout (thumbnail, several lines of metadata).
- **DataTable** — for plain numeric or comparative tables with no per-row actions.
- **Filters / IndexFilters** — saved views as tabs, plus a search field and filter pills. Merchants live in these.

Rule of thumb: if the user selects rows and does something to them, it's an IndexTable. If they read rows and click into one, it's a ResourceList. If they're comparing numbers, it's a DataTable.

Always design the empty state, the loading state, and the "one item" state. Admin lists spend a lot of their life not full.

## 6. Forms

- Label **above** the field, always visible. Never placeholder-as-label.
- Helper text below the field, before the user types. Error text replaces it.
- Group related fields with `FormLayout`; use `FormLayout.Group` for fields that belong on one row.
- Mark **optional** fields rather than required ones when most are required, which in admin forms they usually are.
- Validate on blur and on submit, not on every keystroke.
- The submit action lives in the save bar or the page header, not buried at the bottom of a long form.

## 7. Accessibility

Polaris components ship accessible, which is a real part of its value, but the parts you control still matter:

- **Contrast 4.5:1** for body text, **3:1** for large text and UI boundaries. Polaris's semantic colour pairs satisfy this; overriding them can break it.
- **Never colour alone.** Every badge and banner carries an icon or text label.
- **Visible focus** on every interactive element.
- **Minimum 44px touch target** — admin gets used on phones in stockrooms more than people expect.
- **Label every control**, including icon-only buttons, with real text or `aria-label`.
- **Respect `prefers-reduced-motion`.** Polaris motion is modest; cutting it costs nothing.

## 8. Embedded app considerations

If the thing being built runs inside the Shopify admin:

- Match the host chrome, don't compete with it. No custom global nav, no second header.
- Use App Bridge for navigation, the save bar, modals, and toasts so they render at the admin level rather than trapped in an iframe.
- Polaris version drift between the app and the admin is the most common source of "looks slightly off." Pin and update deliberately.
- Follow the admin's information architecture. A merchant should not have to learn a second mental model to use one app.

## 9. When not to use Polaris

Polaris is tuned for one job: a non-technical operator doing business tasks in a back-office. It's the right call for admin panels, SaaS dashboards, settings and onboarding, internal tools, and anything embedded in Shopify. It is deliberately plain, so it's the wrong call for consumer products, marketing sites, or anything that needs to feel distinctive — it will read as "a Shopify app," which is exactly what it's for and exactly the problem elsewhere.

**The portable parts** even if you never install the library: the loudness hierarchy for feedback, the contextual save bar, the content guidelines, and the discipline of one primary action per page. Those improve almost any interface.

## Quick Reference

| Need | Token / technique | Concrete value |
| --- | --- | --- |
| Any colour | Semantic token, never a hex | `--p-color-bg-surface` |
| Default gap and padding | Space scale | `space-400` (16px) |
| Inside a component | Space scale | `space-200` (8px) |
| Between sections | Space scale | `space-600` (24px) |
| Card corners | Radius scale | `radius-300` (12px) |
| Button and input corners | Radius scale | `radius-200` (8px) |
| Page structure | Page → Card → BlockStack | one primary action per page |
| Layout gaps | Stack `gap` prop | never a custom flex container |
| Persistent object status | Badge | quietest level |
| Field is wrong | Inline error, next to the field | replaces helper text |
| Action succeeded | Toast | auto-dismisses |
| Page needs attention | Banner | info / success / warning / critical |
| Decision required first | Modal | use rarely |
| Unsaved form changes | Contextual save bar | blocks navigation |
| Bulk actions on rows | IndexTable | selection swaps the header |
| Rich, non-tabular list | ResourceList | |
| Casing | Sentence case, everywhere | "Create order" |
| Button labels | Verb plus object | never "OK" or "Submit" |
| Error copy | What happened, then what to do | no blame, no "Error:" prefix |
| Empty state | Invitation with one action | never "No data" |
| Contrast | WCAG AA | 4.5:1 text, 3:1 UI |
| Touch target | Minimum | 44px |
| Typeface | Inter | small scale, no display sizes |