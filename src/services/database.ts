import Dexie, { type EntityTable } from 'dexie'
import type { Trip } from '@/types/itinerary'
import type { TripProgress } from '@/types/progress'

/** Small key/value records, e.g. which trip is active. */
export interface MetaRecord {
  key: string
  value: string
}

/**
 * IndexedDB schema. Itinerary content (`trips`) and user progress
 * (`progress`) are separate tables linked by trip ID.
 */
class ItineraryDatabase extends Dexie {
  trips!: EntityTable<Trip, 'id'>
  progress!: EntityTable<TripProgress, 'tripId'>
  meta!: EntityTable<MetaRecord, 'key'>

  constructor() {
    super('itinerary-guide')
    this.version(1).stores({
      trips: 'id',
      progress: 'tripId',
      meta: 'key',
    })
  }
}

export const db = new ItineraryDatabase()

export const META_ACTIVE_TRIP = 'activeTripId'
