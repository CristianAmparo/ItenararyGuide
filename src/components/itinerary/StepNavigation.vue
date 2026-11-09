<script setup lang="ts">
import { ArrowRightIcon, CheckIcon, ChevronLeftIcon } from '@lucide/vue'
import { Button } from '@/components/ui/button'

/** Fixed bottom action bar for the guided itinerary: Previous, Skip, Next. */
defineProps<{
  canGoBack: boolean
  isLastStep: boolean
}>()

const emit = defineEmits<{ previous: [], skip: [], next: [] }>()
</script>

<template>
  <div
    class="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-lg border-t bg-background/95 pb-safe backdrop-blur supports-backdrop-filter:bg-background/85 md:border-x"
  >
    <div class="flex items-center gap-2 px-4 py-3">
      <Button
        variant="outline"
        size="icon"
        class="size-12 shrink-0"
        :disabled="!canGoBack"
        aria-label="Previous step"
        @click="emit('previous')"
      >
        <ChevronLeftIcon class="size-5" />
      </Button>
      <Button
        variant="ghost"
        class="h-12 shrink-0 px-4 text-[15px] text-muted-foreground"
        @click="emit('skip')"
      >
        Skip
      </Button>
      <Button class="h-12 flex-1 text-[15px]" @click="emit('next')">
        <template v-if="isLastStep">
          Complete day
          <CheckIcon class="size-4.5" />
        </template>
        <template v-else>
          Next step
          <ArrowRightIcon class="size-4.5" />
        </template>
      </Button>
    </div>
  </div>
</template>
