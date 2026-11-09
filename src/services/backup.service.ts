import type { Trip } from '@/types/itinerary'
import type { TripProgress } from '@/types/progress'
import { toPlain } from '@/lib/id'
import { parseTrip, TripValidationError } from '@/lib/trip-schema'
import { db, META_ACTIVE_TRIP } from '@/services/database'
import { listTrips } from '@/services/itinerary.service'
import { listProgress } from '@/services/progress.service'

/**
 * File formats:
 *
 * - Itinerary export: `{ format: "itinerary-guide/trip", version: 1, trip }`
 *   A bare Trip object is also accepted on import.
 * - Full backup: `{ format: "itinerary-guide/backup", version: 1, activeTripId, trips, progress }`
 *
 * See docs/itinerary-format.md.
 */

const TRIP_FORMAT = 'itinerary-guide/trip'
const BACKUP_FORMAT = 'itinerary-guide/backup'

export interface TripExport {
  format: typeof TRIP_FORMAT
  version: 1
  exportedAt: string
  trip: Trip
}

export interface BackupFile {
  format: typeof BACKUP_FORMAT
  version: 1
  exportedAt: string
  activeTripId: string | null
  trips: Trip[]
  progress: TripProgress[]
}

export type ParsedImport =
  | { kind: 'trip', trip: Trip }
  | { kind: 'backup', backup: BackupFile }

export function createTripExport(trip: Trip): TripExport {
  return { format: TRIP_FORMAT, version: 1, exportedAt: new Date().toISOString(), trip: toPlain(trip) }
}

export async function createBackup(): Promise<BackupFile> {
  const [trips, progress, active] = await Promise.all([
    listTrips(),
    listProgress(),
    db.meta.get(META_ACTIVE_TRIP),
  ])
  return {
    format: BACKUP_FORMAT,
    version: 1,
    exportedAt: new Date().toISOString(),
    activeTripId: active?.value ?? null,
    trips,
    progress,
  }
}

function sanitizeProgress(raw: unknown): TripProgress | null {
  if (typeof raw !== 'object' || raw === null) return null
  const p = raw as Partial<TripProgress>
  if (typeof p.tripId !== 'string') return null
  return {
    tripId: p.tripId,
    currentDayId: typeof p.currentDayId === 'string' ? p.currentDayId : null,
    currentStepId: typeof p.currentStepId === 'string' ? p.currentStepId : null,
    steps: typeof p.steps === 'object' && p.steps ? p.steps : {},
    checklist: typeof p.checklist === 'object' && p.checklist ? p.checklist : {},
    lastAccessedAt: typeof p.lastAccessedAt === 'string' ? p.lastAccessedAt : null,
  }
}

/** Parses an imported file into either a single trip or a full backup. */
export function parseImportFile(text: string): ParsedImport {
  let json: unknown
  try {
    json = JSON.parse(text)
  }
  catch {
    throw new TripValidationError('This file is not valid JSON.')
  }
  if (typeof json !== 'object' || json === null) {
    throw new TripValidationError('This file does not contain an itinerary.')
  }
  const data = json as Record<string, unknown>

  if (data.format === BACKUP_FORMAT) {
    if (!Array.isArray(data.trips) || data.trips.length === 0) {
      throw new TripValidationError('This backup does not contain any trips.')
    }
    const trips = data.trips.map(parseTrip)
    const progress = (Array.isArray(data.progress) ? data.progress : [])
      .map(sanitizeProgress)
      .filter((p): p is TripProgress => !!p)
    const activeTripId = typeof data.activeTripId === 'string' && trips.some(t => t.id === data.activeTripId)
      ? data.activeTripId
      : trips[0]!.id
    return {
      kind: 'backup',
      backup: { format: BACKUP_FORMAT, version: 1, exportedAt: String(data.exportedAt ?? ''), activeTripId, trips, progress },
    }
  }

  const tripData = data.format === TRIP_FORMAT ? data.trip : data
  return { kind: 'trip', trip: parseTrip(tripData) }
}

/**
 * Stores an imported trip and makes it active. Existing progress for the same
 * trip ID is kept, so re-importing an updated itinerary preserves progress.
 */
export async function importTrip(trip: Trip): Promise<void> {
  await db.transaction('rw', db.trips, db.meta, async () => {
    await db.trips.put(toPlain(trip))
    await db.meta.put({ key: META_ACTIVE_TRIP, value: trip.id })
  })
}

/** Replaces all stored trips and progress with the backup contents. */
export async function restoreBackup(backup: BackupFile): Promise<void> {
  await db.transaction('rw', db.trips, db.progress, db.meta, async () => {
    await db.trips.clear()
    await db.progress.clear()
    await db.trips.bulkPut(toPlain(backup.trips))
    await db.progress.bulkPut(toPlain(backup.progress))
    await db.meta.put({ key: META_ACTIVE_TRIP, value: backup.activeTripId ?? backup.trips[0]!.id })
  })
}

/** Triggers a JSON file download. */
export function downloadJson(data: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'trip'
}
