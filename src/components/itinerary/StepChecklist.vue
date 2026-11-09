<script setup lang="ts">
import type { ItineraryStep } from '@/types/itinerary'
import { Checkbox } from '@/components/ui/checkbox'
import { useProgress } from '@/composables/useProgress'
import { cn } from '@/lib/utils'

/**
 * Checklist for a step. Each item is saved as soon as it changes.
 * Checking every item does not complete the step — that stays a separate action.
 */
defineProps<{ step: ItineraryStep }>()

const { isChecked, setChecklistItem } = useProgress()
</script>

<template>
  <ul class="-mx-2">
    <li v-for="item in step.checklist" :key="item.id">
      <label class="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/60">
        <Checkbox
          :model-value="isChecked(step.id, item.id)"
          class="size-5 [&_svg]:size-4"
          @update:model-value="(value) => setChecklistItem(step.id, item.id, value === true)"
        />
        <span
          :class="cn(
            'text-[15px] transition-colors',
            isChecked(step.id, item.id) && 'text-muted-foreground line-through decoration-muted-foreground/50',
          )"
        >
          {{ item.label }}
        </span>
      </label>
    </li>
  </ul>
</template>
