import { computed } from 'vue'
import { useOnline } from '@vueuse/core'

/** Reactive network status. */
export function useOffline() {
  const online = useOnline()
  const isOffline = computed(() => !online.value)
  return { isOffline }
}
