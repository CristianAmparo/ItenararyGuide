<script setup lang="ts">
import { computed } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import { CheckIcon, ChevronRightIcon } from '@lucide/vue'
import type { TripDay } from '@/types/itinerary'
import type { TripProgress } from '@/types/progress'
import { computeStats, getDayState } from '@/lib/itinerary'
import { formatShortDate, formatWeekday, pluralize } from '@/lib/format'
import { cn } from '@/lib/utils'

/** One day in the trip overview list: number, date, title, activity count, status. */
const props = defineProps<{
  day: TripDay
  dayNumber: number
  progress: TripProgress | null
  to: RouteLocationRaw
  isCurrent?: boolean
}>()

const stats = computed(() => computeStats(props.day.steps, props.progress))
const state = computed(() => getDayState(props.day, props.progress))
</script>

<template>
  <RouterLink
    :to="to"
    class="flex min-h-16 items-center gap-3 px-4 py-3 transition-colors outline-none hover:bg-muted/50 focus-visible:bg-muted"
  >
    <div
      :class="cn(
        'flex size-11 shrink-0 flex-col items-center justify-center rounded-lg border leading-none',
        state === 'done' && 'border-success/30 bg-success/10 text-success',
        isCurrent && state !== 'done' && 'border-primary bg-primary text-primary-foreground',
      )"
    >
      <CheckIcon v-if="state === 'done'" class="size-5" stroke-width="2.5" aria-hidden="true" />
      <template v-else>
        <span class="text-[10px] font-semibold tracking-wider uppercase opacity-70">Day</span>
        <span class="text-base font-semibold">{{ dayNumber }}</span>
      </template>
    </div>

    <div class="min-w-0 flex-1">
      <p class="truncate text-[15px] font-medium">
        {{ day.title }}
      </p>
      <p class="mt-0.5 text-xs text-muted-foreground">
        <span v-if="state === 'done'" class="sr-only">Day {{ dayNumber }}, completed. </span>
        {{ formatWeekday(day.date) }}, {{ formatShortDate(day.date) }} · {{ pluralize(stats.total, 'activity', 'activities') }}
      </p>
    </div>

    <span
      v-if="state === 'in-progress'"
      class="shrink-0 text-xs font-medium text-muted-foreground tabular-nums"
      :aria-label="`${stats.completed + stats.skipped} of ${stats.total} handled`"
    >
      {{ stats.completed + stats.skipped }}/{{ stats.total }}
    </span>
    <ChevronRightIcon class="size-4 shrink-0 text-muted-foreground/60" aria-hidden="true" />
  </RouterLink>
</template>
