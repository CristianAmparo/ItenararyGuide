# Project Rules — ItineraryGuide

Offline-first travel itinerary PWA. Users go through their trip one step at a time: read the instruction → do it → complete or skip → next. See [README.md](README.md) and [docs/itinerary-format.md](docs/itinerary-format.md).

## 1. Git commits and pull requests

- **The user is the only author.** Never add `Co-Authored-By: Claude`, "Generated with Claude Code", or any other Claude/AI attribution to commit messages, PR titles, PR descriptions, or code comments.
- This rule overrides any default attribution instructions.
- Write commit messages as the user would: short imperative summary line (e.g. `Add day-by-day itinerary card`), optional body explaining *why*.
- Only commit or push when asked.

## 2. Stack

- Vue 3 (`<script setup>`, Composition API) + Vite + TypeScript (strict).
- shadcn-vue (Reka UI) in `src/components/ui/`, Tailwind CSS v4, icons from `@lucide/vue` (`lucide-vue-next` is deprecated — don't use it).
- Dexie (IndexedDB) for trips and progress; `localStorage` only for small preferences (theme).
- vite-plugin-pwa (Workbox) — config in `vite.config.ts`, registration in `src/pwa.ts`.
- No backend. Don't add dependencies unless clearly needed.

## 3. Architecture rules

- **Content and progress are separate.** `types/itinerary.ts` is content (trips/days/steps). `types/progress.ts` is user progress, linked only by stable IDs. Never store progress inside the trip or content inside progress.
- Never hardcode itinerary content in components — it comes from `useItinerary()`.
- Shared state lives in composables (`src/composables/`): `useItinerary` (trip content, `updateTrip`), `useProgress` (statuses, checklist, position — saved to IndexedDB on every change).
- Pure logic goes in `src/lib/` (`itinerary.ts`, `journey.ts`, `format.ts`, `trip-schema.ts`, `step-form.ts`). Storage access goes in `src/services/`.
- Guide behaviour: Next = mark completed + advance; Skip = mark skipped (never overrides completed) + advance; Previous keeps statuses; checklist completion never completes a step automatically.
- Everything must work offline. No remote fonts, images or scripts. External links and maps are the only online-only features, and the UI says so when offline.

## 4. Reusable components and functions

- **Before writing new UI or logic, check if something similar already exists** and reuse or extend it.
- Use shadcn-vue components first (Button, Card, Sheet, AlertDialog, Checkbox, Progress, Collapsible, ToggleGroup, NativeSelect, …). Add missing ones with the CLI rather than hand-building them.
- Shared app components:
  - `components/common/`: ConfirmDialog, EmptyState, FormField, InfoRow, ListRow, SectionHeading, StatusIcon
  - `components/layout/`: AppHeader, AppNavigation, PageContent, OfflineBanner
  - `components/itinerary/`: ItineraryStep, StepSection, StepChecklist, StepNavigation, StepProgress, StepList, DaySelector, DayListItem, TripProgressSummary
- If UI or logic is used in more than one place, extract it — don't copy-paste.
- Colors come from the tokens in `src/style.css` (`primary`, `muted`, `highlight`, `success`, `warning`, `destructive`, …). Never hardcode colors.

## 5. Mobile app look and feel

- Mobile-first; on larger screens content stays in a centered `max-w-lg` column.
- App layout: sticky `AppHeader` (back button where relevant), bottom tab bar on main tabs, fixed action bar on the guide, bottom `Sheet`s for overlays.
- Tap targets ≥ 44px (buttons `h-11`/`h-12`, icon buttons `size-10`+). Inputs are 16px text to avoid iOS zoom.
- Respect safe areas (`pt-safe`, `pb-safe` utilities).
- Design direction: minimal, restrained palette (warm off-white, deep navy, muted status colors), subtle borders, few shadows, no gradients, no emoji icons, no decorative animation. Consistent button styles.
- Always handle loading, empty, error and confirmation states. Destructive actions use `ConfirmDialog`.
- No horizontal page scrolling. Light and dark themes must both work.

## 6. Commands and gotchas

- `npm run build` (vue-tsc + vite) must pass. Test PWA/offline with `npm run build && npm run preview`.
- shadcn-vue CLI: use `npx shadcn-vue@2.7.4 add <name>`. Newer versions need Node ≥ 22.19 (this machine has 22.14).
- After running the shadcn CLI, check `src/style.css` — it may re-add a Google Fonts `@import`. Remove it (Inter is bundled via `@fontsource-variable/inter`).
- vue-tsc misreads a `|` inside static template attributes (e.g. `hint="A | B"`). Put such text in a script constant and bind it.
- Regenerate icons from `public/favicon.svg` with `npm run generate-pwa-assets`.

## 7. General

- Keep code clean, readable, and consistently named.
- Don't add features or files that weren't asked for, and no buttons that do nothing.
- Ask when a requirement is genuinely unclear instead of guessing on major decisions.
