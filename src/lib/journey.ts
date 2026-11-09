import type { RouteLocationRaw } from 'vue-router'
import type { Trip, TripDay } from '@/types/itinerary'
import type { TripProgress } from '@/types/progress'
import { findStep, getResumeStep } from '@/lib/itinerary'

export function guideRoute(dayId: string, stepId: string): RouteLocationRaw {
  return { name: 'guide-step', params: { dayId, stepId } }
}

export function dayCompleteRoute(dayId: string): RouteLocationRaw {
  return { name: 'day-complete', params: { dayId } }
}

/** Where to open a specific day: its first unfinished step. */
export function dayResumeRoute(day: TripDay, progress: TripProgress | null): RouteLocationRaw | null {
  const step = getResumeStep(day, progress)
  return step ? guideRoute(day.id, step.id) : null
}

/**
 * Where "Continue journey" goes: the saved position if it still exists in
 * the itinerary, otherwise the first step of the trip.
 */
export function resumeRoute(trip: Trip, progress: TripProgress | null): RouteLocationRaw | null {
  if (progress?.currentDayId && progress.currentStepId) {
    const ref = findStep(trip, progress.currentDayId, progress.currentStepId)
    if (ref) return guideRoute(ref.day.id, ref.step.id)
  }
  const firstDay = trip.days.find(d => d.steps.length > 0)
  return firstDay ? guideRoute(firstDay.id, firstDay.steps[0]!.id) : null
}
