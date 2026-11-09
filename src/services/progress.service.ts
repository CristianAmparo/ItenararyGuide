import type { TripProgress } from '@/types/progress'
import { toPlain } from '@/lib/id'
import { db } from '@/services/database'

export function createEmptyProgress(tripId: string): TripProgress {
  return {
    tripId,
    currentDayId: null,
    currentStepId: null,
    steps: {},
    checklist: {},
    lastAccessedAt: null,
  }
}

export async function loadProgress(tripId: string): Promise<TripProgress> {
  const stored = await db.progress.get(tripId)
  // Merge with defaults so older or partial records stay valid.
  return { ...createEmptyProgress(tripId), ...stored }
}

export async function saveProgress(progress: TripProgress): Promise<void> {
  await db.progress.put(toPlain(progress))
}

export async function listProgress(): Promise<TripProgress[]> {
  return db.progress.toArray()
}
