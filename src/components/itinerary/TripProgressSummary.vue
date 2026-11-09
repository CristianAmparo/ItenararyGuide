<script setup lang="ts">
import type { TripStats } from '@/types/progress'
import { Progress } from '@/components/ui/progress'

/** Progress bar plus completed / skipped / remaining counts. */
defineProps<{
  stats: TripStats
  label?: string
}>()
</script>

<template>
  <div>
    <div class="mb-2 flex items-baseline justify-between">
      <span class="text-sm font-medium">{{ label ?? 'Progress' }}</span>
      <span class="text-sm font-semibold tabular-nums">{{ stats.percent }}%</span>
    </div>
    <Progress
      :model-value="stats.percent"
      class="h-2"
      :aria-label="`${label ?? 'Progress'}: ${stats.percent}%`"
    />
    <dl class="mt-4 grid grid-cols-3 divide-x text-center">
      <div>
        <dt class="text-xs text-muted-foreground">
          Completed
        </dt>
        <dd class="mt-0.5 text-lg font-semibold text-success tabular-nums">
          {{ stats.completed }}
        </dd>
      </div>
      <div>
        <dt class="text-xs text-muted-foreground">
          Skipped
        </dt>
        <dd class="mt-0.5 text-lg font-semibold text-warning tabular-nums">
          {{ stats.skipped }}
        </dd>
      </div>
      <div>
        <dt class="text-xs text-muted-foreground">
          Remaining
        </dt>
        <dd class="mt-0.5 text-lg font-semibold tabular-nums">
          {{ stats.remaining }}
        </dd>
      </div>
    </dl>
  </div>
</template>
