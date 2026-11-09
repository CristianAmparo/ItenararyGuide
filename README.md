# Itinerary Guide

An offline-first, installable travel companion (PWA). It turns a trip itinerary into a guided, step-by-step journey: read the current instruction, do it, mark it complete or skip it, and continue. Progress is saved on the device automatically.

## Stack

Vue 3 + Vite + TypeScript, shadcn-vue (Reka UI) + Tailwind CSS v4, `@lucide/vue` icons, Dexie (IndexedDB), vite-plugin-pwa (Workbox).

## Scripts

```bash
npm install
npm run dev                  # development server
npm run build                # type-check + production build (includes service worker)
npm run preview              # serve the production build (use this to test offline/PWA)
npm run generate-pwa-assets  # regenerate app icons from public/favicon.svg
```

The service worker only runs in the production build (`build` + `preview`, or any static host). Installation needs HTTPS or `localhost`.

## Using your own itinerary

Write a JSON file (see [docs/itinerary-format.md](docs/itinerary-format.md)) and load it from **Settings → Import itinerary**. Give steps stable `id`s so progress survives later edits.

## Project structure

```text
src/
├── components/
│   ├── ui/           shadcn-vue components (generated; owned by the project)
│   ├── common/       shared app components (ConfirmDialog, EmptyState, InfoRow, ListRow, …)
│   ├── layout/       AppHeader, AppNavigation, PageContent, OfflineBanner
│   └── itinerary/    guide building blocks (ItineraryStep, StepNavigation, StepProgress, DaySelector, …)
├── composables/      useItinerary, useProgress, useOffline, useTheme, useInstallPrompt
├── data/             sample itinerary
├── lib/              pure helpers (itinerary logic, formatting, validation, routes)
├── pages/            route pages (+ edit/ for the itinerary editor)
├── router/
├── services/         IndexedDB access, import/export/backup
└── types/            itinerary (content) and progress types
```

Itinerary content (`trips` table) and user progress (`progress` table) are stored separately and linked only by IDs, so editing content never erases progress.

## Deploying

`npm run build` outputs a static site in `dist/`. Host it on any static host with HTTPS and route unknown paths to `index.html` (SPA fallback).
