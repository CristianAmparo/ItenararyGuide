<script setup lang="ts">
import { computed } from 'vue'
import { CheckIcon, SkipForwardIcon } from '@lucide/vue'
import type { StepDisplayStatus } from '@/types/progress'
import { cn } from '@/lib/utils'

/** Round status marker used in step lists and day rows. */
const props = withDefaults(defineProps<{
  status: StepDisplayStatus
  size?: 'sm' | 'md'
}>(), { size: 'md' })

const LABELS: Record<StepDisplayStatus, string> = {
  completed: 'Completed',
  skipped: 'Skipped',
  current: 'Current',
  upcoming: 'Upcoming',
}

const classes = computed(() => cn(
  'flex shrink-0 items-center justify-center rounded-full border',
  props.size === 'sm' ? 'size-5 [&_svg]:size-3' : 'size-6 [&_svg]:size-3.5',
  props.status === 'completed' && 'border-success bg-success text-success-foreground',
  props.status === 'skipped' && 'border-warning/60 bg-warning/15 text-warning',
  props.status === 'current' && 'border-primary bg-background ring-3 ring-primary/15',
  props.status === 'upcoming' && 'border-border bg-background',
))
</script>

<template>
  <span :class="classes" role="img" :aria-label="LABELS[status]">
    <CheckIcon v-if="status === 'completed'" stroke-width="3" />
    <SkipForwardIcon v-else-if="status === 'skipped'" stroke-width="2.5" />
    <span v-else-if="status === 'current'" class="size-2 rounded-full bg-primary" />
  </span>
</template>
