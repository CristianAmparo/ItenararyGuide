<script setup lang="ts">
import { CheckIcon, RotateCcwIcon, SkipForwardIcon } from '@lucide/vue'
import type { StepStatus } from '@/types/progress'
import { Button } from '@/components/ui/button'

/**
 * Shows the step's status and lets the user explicitly complete it
 * (without moving on) or undo a completed/skipped status.
 */
defineProps<{ status: StepStatus | undefined }>()

const emit = defineEmits<{ complete: [], clear: [] }>()
</script>

<template>
  <div class="flex min-h-10 items-center gap-2" aria-live="polite">
    <template v-if="status === 'completed'">
      <span class="inline-flex items-center gap-1.5 text-sm font-medium text-success">
        <CheckIcon class="size-4" stroke-width="2.5" aria-hidden="true" />
        Completed
      </span>
    </template>
    <template v-else-if="status === 'skipped'">
      <span class="inline-flex items-center gap-1.5 text-sm font-medium text-warning">
        <SkipForwardIcon class="size-4" aria-hidden="true" />
        Skipped
      </span>
    </template>

    <Button
      v-if="status"
      variant="ghost"
      size="sm"
      class="h-9 text-muted-foreground"
      @click="emit('clear')"
    >
      <RotateCcwIcon />
      Undo
    </Button>
    <Button
      v-else
      variant="outline"
      size="sm"
      class="h-9"
      @click="emit('complete')"
    >
      <CheckIcon />
      Mark as complete
    </Button>
  </div>
</template>
