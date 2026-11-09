<script setup lang="ts">
import { WifiOffIcon } from '@lucide/vue'
import { useOffline } from '@/composables/useOffline'

const { isOffline } = useOffline()
</script>

<template>
  <div
    v-if="isOffline"
    role="status"
    class="flex items-center gap-2 border-t bg-muted px-4 py-1.5 text-xs text-muted-foreground"
  >
    <WifiOffIcon class="size-3.5 shrink-0" aria-hidden="true" />
    <span>Offline. Your itinerary works normally; maps and links need a connection.</span>
  </div>
</template>
