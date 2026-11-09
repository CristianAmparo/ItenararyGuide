import { computed, ref, shallowRef } from 'vue'
import type { Trip } from '@/types/itinerary'
import { allSteps } from '@/lib/itinerary'
import { toPlain } from '@/lib/id'
import { loadActiveTrip, saveTrip } from '@/services/itinerary.service'
import { useProgress } from '@/composables/useProgress'

type LoadStatus = 'idle' | 'loading' | 'ready' | 'error'

// Module-level state: one shared instance for the whole app.
const trip = shallowRef<Trip | null>(null)
const status = ref<LoadStatus>('idle')
const error = ref<string | null>(null)

/** The active trip's itinerary content. */
export function useItinerary() {
  const progress = useProgress()

  /** Loads the active trip and its progress from IndexedDB. */
  async function load(): Promise<void> {
    status.value = 'loading'
    error.value = null
    try {
      const loaded = await loadActiveTrip()
      await progress.load(loaded.id)
      trip.value = loaded
      status.value = 'ready'
    }
    catch (err) {
      console.error(err)
      error.value = 'Your itinerary could not be loaded from this device\'s storage.'
      status.value = 'error'
    }
  }

  /** Loads once; safe to call from multiple places. */
  async function ensureLoaded(): Promise<void> {
    if (status.value === 'idle') await load()
  }

  /**
   * Applies an edit to the trip and saves it. The mutator receives a plain
   * copy, so callers can modify it freely.
   */
  async function updateTrip(mutate: (draft: Trip) => void): Promise<void> {
    if (!trip.value) return
    const draft = toPlain(trip.value)
    mutate(draft)
    await saveTrip(draft)
    trip.value = draft
  }

  const steps = computed(() => (trip.value ? allSteps(trip.value) : []))

  return {
    trip: computed(() => trip.value),
    status: computed(() => status.value),
    error: computed(() => error.value),
    steps,
    load,
    ensureLoaded,
    updateTrip,
  }
}
