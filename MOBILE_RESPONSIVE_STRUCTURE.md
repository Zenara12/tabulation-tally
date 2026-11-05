# Mobile Responsive Structure

This guide defines how the mobile UI should be structured around the bottom navigation already introduced for the admin and judge layouts.

The goal is to make the existing Nuxt application usable on small touch screens without changing authentication, event management, contestant scoring, results calculation, or API behavior.

## Scope and source of truth

The mobile navigation implementation is represented by:

- `app/components/BottomNavigation.vue`
- `app/layouts/admin.vue`
- `app/layouts/judge.vue`
- commit `f5ce754` (`fix: use bottom nav menu when in mobile`)

The repository currently contains the resulting commit through the merge on `feature/mobile-setup`. The navigation branch is named `fix/mobile-bottom-nav-01` in the local Git history, although it may be referred to as `feature/mobile-bottom-nav-01` in earlier project discussions.

The responsive work described here is limited to layout, spacing, overflow, touch targets, and visual presentation. Do not duplicate business logic in the mobile UI.

## Navigation contract

| Viewport | Navigation | Main content | Required behavior |
| --- | --- | --- | --- |
| `< md` | Fixed bottom navigation | `pb-28` | Hide the desktop sidebar and keep the last content/action clear of the fixed bar, including safe-area space. |
| `>= md` | Fixed-width desktop sidebar | `pb-0` | Hide the bottom navigation and keep the existing sidebar links and sign-out action. |

`BottomNavigation.vue` is role-aware:

- Admins: Dashboard, Judges & Admins, Settings.
- Judges: Dashboard, Settings.
- Settings exposes the current user and sign-out action.

The bottom navigation must remain fixed, visible above page content, and keyboard accessible. Any new primary destination added to a sidebar should be evaluated for inclusion in the role-specific mobile links.

## Layout invariants

Every authenticated page uses the role layout and follows these rules:

1. The page root must allow the layout's `pb-28 md:pb-0` spacing to reserve room for the mobile navigation and device safe-area inset.
2. Page content should use responsive outer spacing such as `px-4 py-6 sm:px-6 lg:px-10 lg:py-10`.
3. Long content must be constrained with a readable `max-w-*` value while tables and scoring grids may intentionally scroll horizontally.
4. Do not use a fixed width on the page root that can create viewport-level horizontal scrolling.
5. Primary actions should wrap or become full-width on narrow screens rather than forcing a row wider than the viewport.
6. Keep data loading, mutation, validation, and navigation behavior unchanged; responsive changes belong in templates and classes unless a small interaction fix is required for touch use.

## Page structure by workflow

### Admin dashboard (`app/pages/admin/index.vue`)

- Keep the heading and `+ New event` action in a stacked layout below `sm`; the existing `flex-col sm:flex-row` pattern is the intended structure.
- Event cards should remain full-width, with the event name/status on top and counts below on phones.
- The create-event dialog should use `w-full max-w-md` and horizontal screen padding so it fits at 320px wide.
- Dialog actions may remain right-aligned on larger screens, but should wrap or use a full-width primary action when the available width is tight.

### Admin event detail (`app/pages/admin/events/[id].vue`)

This is the densest admin screen and should be treated as four responsive sections rather than one desktop table:

- Header: stack the event title, status selector, and delete action below `sm`.
- Tabs: keep the tab row horizontally scrollable with `overflow-x-auto`; do not compress labels until they become unreadable.
- Criteria and judges: keep tables inside an overflow container. Forms should stack below `sm` and become a row at `sm` when space permits.
- Contestants: preserve the existing table as a deliberate horizontal-scroll surface because it contains number, name, alias, character, image, and actions. Keep the contestant form one column on phones and two columns at `md`.
- Image upload: keep the preview touch-friendly and retain a clear remove action. The contestant fields remain `name`, `alias`, `characterName`, and `cosplayPictureUrl`.
- Results: allow the results component to scroll horizontally while keeping the surrounding summary, tabs, refresh, and print controls wrapped.

### Admin users (`app/pages/admin/users.vue`)

This page should follow the same outer spacing as the other admin pages. In particular:

- Replace the desktop-only `px-10 py-10` page spacing with responsive outer spacing.
- Put the users table inside `overflow-x-auto` with a sensible `min-w-*`, or provide a compact card alternative if the table becomes difficult to scan.
- Keep the protected seed admin indicator and remove action visible without changing deletion rules.
- Keep the create-account dialog at `w-full max-w-md` with inputs and actions that fit narrow screens.

### Judge assigned events (`app/pages/judge/index.vue`)

- Keep event cards stacked on phones and preserve the full-card link target.
- Keep status and `Score`/`View` actions readable without requiring horizontal scrolling.
- Ensure the final card can scroll above the fixed bottom navigation because the layout reserves `pb-24`.

### Judge scoring (`app/pages/judge/score/[id].vue`)

The scoring grid is intentionally wider than a phone. It should not be forced into unreadable columns.

- Keep the scoring table inside `overflow-x-auto` with its current minimum width.
- Keep the contestant identity column visible as the first column and preserve number, name, alias, character, and reference image information.
- Make score inputs large enough for touch entry and keep numeric input behavior unchanged.
- Keep save actions reachable both above and below the grid. They may become full-width on narrow screens.
- Keep the progress summary and error message above the grid so the judge understands the current state before scrolling.
- Preserve click, keyboard activation, and Escape-to-close behavior for the reference-image modal.
- The modal must fit within the viewport, keep the close action reachable, and use `object-contain` for portrait and landscape images.

### Results and leaderboard (`app/components/EventLeaderboard.vue`, `app/components/ResultsTable.vue`)

- Keep the results table in a horizontally scrollable container; criteria columns are dynamic and cannot reliably be stacked without changing the workflow.
- Allow summary metrics, tabs, refresh, and print controls to wrap on narrow screens.
- Keep contestant identity content compact but readable; aliases and character names may truncate within the table cell.
- Do not change ranking, weighted totals, incomplete-score warnings, refresh behavior, or print-only markup as part of responsive work.

## Component and class conventions

Use the following Tailwind patterns consistently:

```html
<!-- Page shell -->
<div class="px-4 py-6 sm:px-6 lg:px-10 lg:py-10 max-w-5xl mx-auto">

<!-- Mobile-first action row -->
<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

<!-- Intentional table scrolling -->
<div class="overflow-x-auto rounded-lg border border-ink/10 bg-white">
  <table class="w-full min-w-[720px] text-sm">

<!-- Responsive form grid -->
<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
```

Prefer mobile-first classes. Add a breakpoint only when the content has enough room to benefit from a row, multiple columns, or increased spacing.

Avoid:

- `w-screen` inside a padded page shell.
- Tables that overflow the entire document instead of a local scroll container.
- Hiding essential actions only on mobile.
- Tiny text or touch targets used to make a crowded desktop row fit.
- Replacing a functional table with a different mobile data model unless the interaction is explicitly approved.

## Touch and accessibility requirements

- Interactive controls should have approximately 44px of touch area. The current bottom-nav links use `min-h-14` and should retain that minimum.
- Every icon-only control needs an accessible name or visible text.
- Preserve visible focus styles for keyboard users.
- Use semantic buttons for actions and `NuxtLink` for navigation.
- Keep `aria-expanded`, `aria-haspopup`, and menu semantics synchronized with the Settings popup.
- The fixed navigation must not cover focused inputs, modal actions, table controls, or the final page content.
- For dialogs, retain click-outside and Escape handling where already implemented, and avoid trapping focus behind the dialog.

## Responsive verification matrix

Check the authenticated admin and judge flows at:

| Width | What to verify |
| --- | --- |
| 320px | No page-level horizontal scroll; dialogs and forms fit; labels and buttons remain usable. |
| 375px / 390px | Bottom navigation fits, settings popup stays inside the viewport, and last content is above the nav. |
| 768px | Sidebar and bottom navigation switch at the intended `md` breakpoint without a layout gap. |
| 1024px+ | Desktop sidebar, tables, and multi-column forms retain their current comfortable layout. |
| Landscape phone | Scoring grid scrolls locally and the fixed navigation does not hide controls. |

For each role, verify:

- Dashboard navigation and active states.
- Settings popup, account information, and sign out.
- Back links and deep links from mobile.
- Admin event tabs, contestant image upload, and delete/remove actions.
- Judge score entry, save actions, progress, and reference-image preview.
- Results tab switching, refresh, warnings, and print behavior.
- Keyboard navigation, focus visibility, Enter/Space activation, and Escape-to-close behavior.

## Implementation order

When continuing the mobile work, use this order:

1. Normalize the remaining page shells, especially `admin/users.vue`.
2. Verify the layout-level bottom padding and fixed navigation at narrow widths.
3. Fix local overflow for tables and dynamic results columns.
4. Make headers, action groups, forms, and dialogs stack or wrap below `sm`.
5. Check touch targets and keyboard behavior.
6. Run the responsive verification matrix and update `MANUAL_QA_CHECKLIST.md` with any newly discovered regression.

The finished result should feel like one responsive application: desktop uses the existing sidebar, mobile uses the role-specific bottom navigation, and the underlying workflows remain identical.
