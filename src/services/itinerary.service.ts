import type { Trip } from '@/types/itinerary'
import { sampleTrip } from '@/data/sample-itinerary'
import { toPlain } from '@/lib/id'
import { db, META_ACTIVE_TRIP } from '@/services/database'

export async function getTrip(id: string): Promise<Trip | undefined> {
  return db.trips.get(id)
}

export async function listTrips(): Promise<Trip[]> {
  return db.trips.toArray()
}

export async function saveTrip(trip: Trip): Promise<void> {
  await db.trips.put(toPlain(trip))
}

export async function setActiveTripId(id: string): Promise<void> {
  await db.meta.put({ key: META_ACTIVE_TRIP, value: id })
}

/**
 * Loads the active trip. On first launch (empty database) the sample trip is
 * stored and activated. Falls back to the first stored trip if the active ID
 * no longer exists.
 */
export async function loadActiveTrip(): Promise<Trip> {
  const activeId = (await db.meta.get(META_ACTIVE_TRIP))?.value
  if (activeId) {
    const trip = await db.trips.get(activeId)
    if (trip) return trip
  }

  const first = await db.trips.toCollection().first()
  if (first) {
    await setActiveTripId(first.id)
    return first
  }

  await db.transaction('rw', db.trips, db.meta, async () => {
    await db.trips.put(toPlain(sampleTrip))
    await db.meta.put({ key: META_ACTIVE_TRIP, value: sampleTrip.id })
  })
  return toPlain(sampleTrip)
}
