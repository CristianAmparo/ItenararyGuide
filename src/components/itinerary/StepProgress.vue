<script setup lang="ts">
import { computed } from 'vue'
import type { ItineraryStep } from '@/types/itinerary'
import type { TripProgress } from '@/types/progress'
import { computeStats, getStepStatus } from '@/lib/itinerary'
import { padNumber } from '@/lib/format'
import { cn } from '@/lib/utils'

/**
 * "STEP 03 / 08" plus a segmented bar: one segment per step, colored by
 * status, with the current step outlined.
 */
const props = defineProps<{
  steps: ItineraryStep[]
  currentIndex: number
  progress: TripProgress | null
}>()

const stats = computed(() => computeStats(props.steps, props.progress))

const segments = computed(() => props.steps.map((step, index) => ({
  id: step.id,
  status: getStepStatus(props.progress, step.id),
  current: index === props.currentIndex,
})))

const valueText = computed(() =>
  `Step ${props.currentIndex + 1} of ${props.steps.length}. ${stats.value.completed} completed, ${stats.value.skipped} skipped.`,
)
</script>

<template>
  <div>
    <div class="mb-2 flex items-baseline justify-between text-xs font-semibold tracking-wider uppercase">
      <span>
        Step {{ padNumber(currentIndex + 1) }}
        <span class="text-muted-foreground">/ {{ padNumber(steps.length) }}</span>
      </span>
      <span class="font-medium tracking-normal text-muted-foreground normal-case">
        {{ stats.completed }} done<template v-if="stats.skipped"> · {{ stats.skipped }} skipped</template>
      </span>
    </div>
    <div
      role="progressbar"
      :aria-valuenow="currentIndex + 1"
      aria-valuemin="1"
      :aria-valuemax="steps.length"
      :aria-valuetext="valueText"
      class="flex gap-1"
    >
      <span
        v-for="segment in segments"
        :key="segment.id"
        :class="cn(
          'h-1.5 flex-1 rounded-full bg-muted transition-colors',
          segment.status === 'completed' && 'bg-success',
          segment.status === 'skipped' && 'bg-warning/60',
          segment.current && 'outline-2 outline-offset-1 outline-primary',
          segment.current && !segment.status && 'bg-primary/30',
        )"
      />
    </div>
  </div>
</template>
