<script setup lang="ts">
import { CalendarDaysIcon, CompassIcon, HouseIcon, InfoIcon, SettingsIcon } from '@lucide/vue'
import { useRoute } from 'vue-router'

/** Bottom tab bar for the main sections. */
const route = useRoute()

const tabs = [
  { to: '/', label: 'Home', icon: HouseIcon, match: (p: string) => p === '/' },
  { to: '/guide', label: 'Guide', icon: CompassIcon, match: (p: string) => p.startsWith('/guide') },
  { to: '/days', label: 'Days', icon: CalendarDaysIcon, match: (p: string) => p.startsWith('/days') },
  { to: '/info', label: 'Info', icon: InfoIcon, match: (p: string) => p.startsWith('/info') },
  { to: '/settings', label: 'Settings', icon: SettingsIcon, match: (p: string) => p.startsWith('/settings') || p.startsWith('/edit') },
]
</script>

<template>
  <nav
    aria-label="Main"
    class="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-lg border-t bg-background/95 pb-safe backdrop-blur supports-backdrop-filter:bg-background/85 md:border-x"
  >
    <ul class="grid grid-cols-5">
      <li v-for="tab in tabs" :key="tab.to">
        <RouterLink
          :to="tab.to"
          class="flex h-15 flex-col items-center justify-center gap-1 text-[11px] font-medium text-muted-foreground transition-colors outline-none focus-visible:bg-muted aria-[current=page]:text-foreground"
          :aria-current="tab.match(route.path) ? 'page' : undefined"
        >
          <component
            :is="tab.icon"
            class="size-5.5"
            :stroke-width="tab.match(route.path) ? 2.25 : 1.75"
            aria-hidden="true"
          />
          {{ tab.label }}
        </RouterLink>
      </li>
    </ul>
  </nav>
</template>
