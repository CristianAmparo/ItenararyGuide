import { computed, ref } from 'vue'
import { toast } from 'vue-sonner'
import type { StepStatus, TripProgress } from '@/types/progress'
import { checklistKey } from '@/lib/itinerary'
import { toPlain } from '@/lib/id'
import { createEmptyProgress, loadProgress, saveProgress } from '@/services/progress.service'

// Module-level state: one shared instance for the whole app.
const progress = ref<TripProgress | null>(null)

// Writes are chained so they reach IndexedDB in the order they were made,
// even when the user taps quickly through several steps.
let writeQueue: Promise<void> = Promise.resolve()
let errorShown = false

function persist(): Promise<void> {
  if (!progress.value) return writeQueue
  const snapshot = toPlain(progress.value)
  writeQueue = writeQueue
    .then(() => saveProgress(snapshot))
    .then(() => { errorShown = false })
    .catch((err) => {
      console.error(err)
      if (!errorShown) {
        errorShown = true
        toast.error('Progress could not be saved', { description: 'Check that this browser allows site storage.' })
      }
    })
  return writeQueue
}

function now(): string {
  return new Date().toISOString()
}

/** User progress for the active trip, saved automatically on every change. */
export function useProgress() {
  async function load(tripId: string): Promise<void> {
    progress.value = await loadProgress(tripId)
  }

  /** Sets or clears (`null`) a step's status. */
  function setStepStatus(stepId: string, status: StepStatus | null): Promise<void> {
    if (!progress.value) return Promise.resolve()
    if (status) {
      progress.value.steps[stepId] = { status, updatedAt: now() }
    }
    else {
      delete progress.value.steps[stepId]
    }
    progress.value.lastAccessedAt = now()
    return persist()
  }

  function isChecked(stepId: string, itemId: string): boolean {
    return !!progress.value?.checklist[checklistKey(stepId, itemId)]
  }

  function setChecklistItem(stepId: string, itemId: string, checked: boolean): Promise<void> {
    if (!progress.value) return Promise.resolve()
    const key = checklistKey(stepId, itemId)
    if (checked) progress.value.checklist[key] = true
    else delete progress.value.checklist[key]
    return persist()
  }

  /** Remembers where the user is in the guide. */
  function setPosition(dayId: string, stepId: string): Promise<void> {
    if (!progress.value) return Promise.resolve()
    if (progress.value.currentDayId === dayId && progress.value.currentStepId === stepId) {
      return Promise.resolve()
    }
    progress.value.currentDayId = dayId
    progress.value.currentStepId = stepId
    progress.value.lastAccessedAt = now()
    return persist()
  }

  /** Clears all progress for the active trip. Itinerary content is untouched. */
  function reset(): Promise<void> {
    if (!progress.value) return Promise.resolve()
    progress.value = createEmptyProgress(progress.value.tripId)
    return persist()
  }

  return {
    progress: computed(() => progress.value),
    load,
    setStepStatus,
    isChecked,
    setChecklistItem,
    setPosition,
    reset,
  }
}
