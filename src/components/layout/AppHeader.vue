<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'
import { useRouter } from 'vue-router'
import { ChevronLeftIcon } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import OfflineBanner from '@/components/layout/OfflineBanner.vue'

/**
 * Sticky top app bar. Pass `back` to show a back button (a route, or `true`
 * to go back in history). Actions go in the default slot.
 */
const props = defineProps<{
  title: string
  subtitle?: string
  back?: RouteLocationRaw | true
}>()

const router = useRouter()

function goBack() {
  if (props.back === true) {
    if (window.history.state?.back) router.back()
    else router.push('/')
  }
  else if (props.back) {
    router.push(props.back)
  }
}
</script>

<template>
  <header class="sticky top-0 z-30 border-b bg-background/95 pt-safe backdrop-blur supports-backdrop-filter:bg-background/80">
    <div class="flex h-14 items-center gap-1 px-2" :class="back ? '' : 'pl-4'">
      <Button
        v-if="back"
        variant="ghost"
        size="icon"
        class="size-10 shrink-0"
        aria-label="Back"
        @click="goBack"
      >
        <ChevronLeftIcon class="size-5" />
      </Button>
      <div class="min-w-0 flex-1">
        <p v-if="subtitle" class="truncate text-xs font-medium text-muted-foreground">
          {{ subtitle }}
        </p>
        <h1 class="truncate text-base leading-tight font-semibold">
          {{ title }}
        </h1>
      </div>
      <div v-if="$slots.default" class="flex shrink-0 items-center gap-0.5">
        <slot />
      </div>
    </div>
    <OfflineBanner />
  </header>
</template>
