import type { ItineraryStep, Trip, TripDay } from '@/types/itinerary'
import type { StepDisplayStatus, StepStatus, TripProgress, TripStats } from '@/types/progress'

/** A step together with its position in the trip. */
export interface StepRef {
  day: TripDay
  dayIndex: number
  step: ItineraryStep
  stepIndex: number
}

export function findDay(trip: Trip, dayId: string | null | undefined): TripDay | undefined {
  if (!dayId) return undefined
  return trip.days.find(d => d.id === dayId)
}

export function findStep(trip: Trip, dayId: string | null | undefined, stepId: string | null | undefined): StepRef | undefined {
  const dayIndex = trip.days.findIndex(d => d.id === dayId)
  if (dayIndex < 0) return undefined
  const day = trip.days[dayIndex]!
  const stepIndex = day.steps.findIndex(s => s.id === stepId)
  if (stepIndex < 0) return undefined
  return { day, dayIndex, step: day.steps[stepIndex]!, stepIndex }
}

/** Previous step in the trip, crossing into the previous day if needed. */
export function getPreviousStep(trip: Trip, ref: StepRef): StepRef | undefined {
  if (ref.stepIndex > 0) {
    const stepIndex = ref.stepIndex - 1
    return { ...ref, stepIndex, step: ref.day.steps[stepIndex]! }
  }
  for (let i = ref.dayIndex - 1; i >= 0; i--) {
    const day = trip.days[i]!
    if (day.steps.length) {
      const stepIndex = day.steps.length - 1
      return { day, dayIndex: i, step: day.steps[stepIndex]!, stepIndex }
    }
  }
  return undefined
}

/** Next step within the same day, or undefined at the end of the day. */
export function getNextStepInDay(ref: StepRef): StepRef | undefined {
  const stepIndex = ref.stepIndex + 1
  const step = ref.day.steps[stepIndex]
  return step ? { ...ref, stepIndex, step } : undefined
}

/** The next day after `dayId` that has at least one step. */
export function getNextDay(trip: Trip, dayId: string): TripDay | undefined {
  const index = trip.days.findIndex(d => d.id === dayId)
  return trip.days.slice(index + 1).find(d => d.steps.length > 0)
}

export function getStepStatus(progress: TripProgress | null, stepId: string): StepStatus | undefined {
  return progress?.steps[stepId]?.status
}

export function getDisplayStatus(progress: TripProgress | null, stepId: string, currentStepId?: string | null): StepDisplayStatus {
  const status = getStepStatus(progress, stepId)
  if (status) return status
  return stepId === currentStepId ? 'current' : 'upcoming'
}

/** First step in a day that is neither completed nor skipped (or the first step). */
export function getResumeStep(day: TripDay, progress: TripProgress | null): ItineraryStep | undefined {
  return day.steps.find(s => !getStepStatus(progress, s.id)) ?? day.steps[0]
}

export function computeStats(steps: ItineraryStep[], progress: TripProgress | null): TripStats {
  let completed = 0
  let skipped = 0
  for (const step of steps) {
    const status = getStepStatus(progress, step.id)
    if (status === 'completed') completed++
    else if (status === 'skipped') skipped++
  }
  const total = steps.length
  const remaining = total - completed - skipped
  const percent = total ? Math.round(((completed + skipped) / total) * 100) : 0
  return { total, completed, skipped, remaining, percent }
}

export type DayState = 'done' | 'in-progress' | 'not-started' | 'empty'

export function getDayState(day: TripDay, progress: TripProgress | null): DayState {
  const stats = computeStats(day.steps, progress)
  if (stats.total === 0) return 'empty'
  if (stats.remaining === 0) return 'done'
  if (stats.completed + stats.skipped > 0) return 'in-progress'
  return 'not-started'
}

export function allSteps(trip: Trip): ItineraryStep[] {
  return trip.days.flatMap(d => d.steps)
}

export function checklistKey(stepId: string, itemId: string): string {
  return `${stepId}:${itemId}`
}

export function countCheckedItems(step: ItineraryStep, progress: TripProgress | null): number {
  if (!step.checklist || !progress) return 0
  return step.checklist.filter(item => progress.checklist[checklistKey(step.id, item.id)]).length
}
