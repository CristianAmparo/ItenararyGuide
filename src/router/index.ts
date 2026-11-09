import { createRouter, createWebHistory } from 'vue-router'
import { useItinerary } from '@/composables/useItinerary'
import { useProgress } from '@/composables/useProgress'
import { findDay } from '@/lib/itinerary'
import { dayResumeRoute, resumeRoute } from '@/lib/journey'
import HomePage from '@/pages/HomePage.vue'

declare module 'vue-router' {
  interface RouteMeta {
    /** Show the bottom tab bar on this page. */
    nav?: boolean
  }
}

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior: (_to, _from, saved) => saved ?? { top: 0 },
  routes: [
    { path: '/', name: 'home', component: HomePage, meta: { nav: true } },
    {
      // Resume wherever the user left off. Always redirects (the component is never shown);
      // a guard is used instead of `redirect` because it must wait for data to load.
      path: '/guide',
      name: 'guide',
      component: HomePage,
      beforeEnter: async () => {
        const { trip, ensureLoaded } = useItinerary()
        await ensureLoaded()
        return (trip.value && resumeRoute(trip.value, useProgress().progress.value)) || { name: 'home' }
      },
    },
    {
      // Open a day at its first unfinished step. Always redirects.
      path: '/guide/:dayId',
      name: 'guide-day',
      component: HomePage,
      beforeEnter: async (to) => {
        const { trip, ensureLoaded } = useItinerary()
        await ensureLoaded()
        const day = trip.value && findDay(trip.value, String(to.params.dayId))
        return (day && dayResumeRoute(day, useProgress().progress.value)) || { name: 'home' }
      },
    },
    {
      path: '/guide/:dayId/:stepId',
      name: 'guide-step',
      component: () => import('@/pages/GuidedItineraryPage.vue'),
    },
    {
      path: '/complete/:dayId',
      name: 'day-complete',
      component: () => import('@/pages/DayCompletePage.vue'),
    },
    {
      path: '/days/:dayId?',
      name: 'days',
      component: () => import('@/pages/TripOverviewPage.vue'),
      meta: { nav: true },
    },
    {
      path: '/info',
      name: 'info',
      component: () => import('@/pages/QuickInfoPage.vue'),
      meta: { nav: true },
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/pages/SettingsPage.vue'),
      meta: { nav: true },
    },
    {
      path: '/edit',
      name: 'edit-trip',
      component: () => import('@/pages/edit/EditTripPage.vue'),
    },
    {
      path: '/edit/:dayId',
      name: 'edit-day',
      component: () => import('@/pages/edit/EditDayPage.vue'),
    },
    {
      // ?id=<stepId> edits an existing step; without it a new step is created on save.
      path: '/edit/:dayId/step',
      name: 'edit-step',
      component: () => import('@/pages/edit/EditStepPage.vue'),
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

// Every page needs the itinerary, so load it (once) before the first navigation.
router.beforeEach(async () => {
  await useItinerary().ensureLoaded()
})
