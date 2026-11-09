<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import type { TripDay } from '@/types/itinerary'
import type { TripProgress } from '@/types/progress'
import { getDayState } from '@/lib/itinerary'
import { formatShortDate } from '@/lib/format'
import { cn } from '@/lib/utils'

/** Horizontally scrolling day switcher. Switching days never changes progress. */
const props = defineProps<{
  days: TripDay[]
  progress: TripProgress | null
}>()

const selected = defineModel<string>({ required: true })

const container = ref<HTMLElement | null>(null)

function scrollSelectedIntoView() {
  nextTick(() => {
    container.value
      ?.querySelector<HTMLElement>('[aria-pressed="true"]')
      ?.scrollIntoView({ inline: 'center', block: 'nearest' })
  })
}

onMounted(scrollSelectedIntoView)
watch(selected, scrollSelectedIntoView)

function stateLabel(day: TripDay) {
  const state = getDayState(day, props.progress)
  return state === 'done' ? 'completed' : state === 'in-progress' ? 'in progress' : 'not started'
}
</script>

<template>
  <div ref="container" class="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
    <button
      v-for="(day, index) in days"
      :key="day.id"
      type="button"
      :aria-pressed="selected === day.id"
      :aria-label="`Day ${index + 1}, ${formatShortDate(day.date)}, ${stateLabel(day)}`"
      :class="cn(
        'relative flex min-w-17 shrink-0 flex-col items-center rounded-lg border px-3 py-2 text-center transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
        selected === day.id
          ? 'border-primary bg-primary text-primary-foreground'
          : 'bg-card hover:bg-muted',
      )"
      @click="selected = day.id"
    >
      <span class="text-[11px] font-semibold tracking-wider uppercase opacity-70">Day {{ index + 1 }}</span>
      <span class="text-sm font-semibold">{{ formatShortDate(day.date) }}</span>
      <span
        v-if="getDayState(day, progress) === 'done'"
        class="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-success"
        aria-hidden="true"
      />
      <span
        v-else-if="getDayState(day, progress) === 'in-progress'"
        class="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-highlight"
        aria-hidden="true"
      />
    </button>
  </div>
</template>
