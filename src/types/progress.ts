/**
 * User progress for a trip. Stored separately from itinerary content and
 * linked only by stable IDs (trip, day, step, checklist item).
 */

export type StepStatus = 'completed' | 'skipped'

/** Display status, including derived states that are never stored. */
export type StepDisplayStatus = StepStatus | 'current' | 'upcoming'

export interface StepProgressEntry {
  status: StepStatus
  updatedAt: string
}

export interface TripProgress {
  tripId: string
  /** Where the user currently is in the guide. */
  currentDayId: string | null
  currentStepId: string | null
  /** Keyed by step ID. Steps without an entry are not started. */
  steps: Record<string, StepProgressEntry>
  /** Keyed by `${stepId}:${checklistItemId}`. Only checked items are stored. */
  checklist: Record<string, true>
  /** ISO timestamp of the last guide interaction, null if never started. */
  lastAccessedAt: string | null
}

export interface TripStats {
  total: number
  completed: number
  skipped: number
  remaining: number
  /** 0–100, counts completed and skipped as handled. */
  percent: number
}

export type Theme = 'light' | 'dark' | 'system'
