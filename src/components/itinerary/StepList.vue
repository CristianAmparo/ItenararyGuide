<script setup lang="ts">
import type { ItineraryStep } from '@/types/itinerary'
import type { TripProgress } from '@/types/progress'
import { ChevronRightIcon } from '@lucide/vue'
import StatusIcon from '@/components/common/StatusIcon.vue'
import { getDisplayStatus } from '@/lib/itinerary'
import { getStepTypeMeta } from '@/lib/step-types'
import { cn } from '@/lib/utils'

/** Timeline of a day's steps with completed / skipped / current / upcoming states. */
defineProps<{
  steps: ItineraryStep[]
  progress: TripProgress | null
  currentStepId?: string | null
}>()

const emit = defineEmits<{ select: [stepId: string] }>()
</script>

<template>
  <ol class="relative">
    <li v-for="(step, index) in steps" :key="step.id" class="relative">
      <!-- Connector line between status markers -->
      <span
        v-if="index < steps.length - 1"
        class="absolute top-9 bottom-0 left-[1.4375rem] w-px bg-border"
        aria-hidden="true"
      />
      <button
        type="button"
        :class="cn(
          'flex w-full items-start gap-3 rounded-lg px-2 py-3 text-left transition-colors outline-none hover:bg-muted/60 focus-visible:ring-3 focus-visible:ring-ring/50',
          step.id === currentStepId && 'bg-accent/60',
        )"
        :aria-current="step.id === currentStepId ? 'step' : undefined"
        @click="emit('select', step.id)"
      >
        <StatusIcon :status="getDisplayStatus(progress, step.id, currentStepId)" class="mt-0.5 ml-1" />
        <div class="min-w-0 flex-1">
          <p
            :class="cn(
              'text-[15px] leading-snug font-medium',
              getDisplayStatus(progress, step.id, currentStepId) === 'skipped' && 'text-muted-foreground',
            )"
          >
            {{ step.title }}
          </p>
          <p class="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <span v-if="step.scheduledTime" class="tabular-nums">{{ step.scheduledTime }}</span>
            <span v-if="step.scheduledTime" aria-hidden="true">·</span>
            <component :is="getStepTypeMeta(step.type).icon" class="size-3.5" aria-hidden="true" />
            {{ getStepTypeMeta(step.type).label }}
          </p>
        </div>
        <ChevronRightIcon class="mt-1 size-4 shrink-0 text-muted-foreground/60" aria-hidden="true" />
      </button>
    </li>
  </ol>
</template>
