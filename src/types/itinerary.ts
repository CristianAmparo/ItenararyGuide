/**
 * Itinerary content model.
 *
 * This is the *content* of a trip (what to do). It never contains user
 * progress — progress lives in `types/progress.ts` and references content
 * only through stable IDs, so editing content never erases progress.
 */

export type StepType =
  | 'transport'
  | 'activity'
  | 'accommodation'
  | 'food'
  | 'airport'
  | 'shopping'
  | 'other'

export interface Trip {
  id: string
  title: string
  destination: string
  /** ISO date, e.g. "2026-12-01" */
  startDate: string
  /** ISO date, e.g. "2026-12-05" */
  endDate: string
  description?: string
  days: TripDay[]
  /** Important travel information shown on the Quick Info screen. */
  quickInfo?: QuickInfoSection[]
}

export interface TripDay {
  id: string
  /** ISO date, e.g. "2026-12-01" */
  date: string
  title: string
  description?: string
  steps: ItineraryStep[]
}

export interface ItineraryStep {
  id: string
  title: string
  type: StepType
  description?: string
  /** Display time, e.g. "07:30" or "Morning" */
  scheduledTime?: string
  /** e.g. "45 min", "2 h" */
  estimatedDuration?: string
  location?: LocationInfo
  instructions?: string[]
  checklist?: ChecklistItem[]
  notes?: string[]
  /** e.g. { "Flight": "CX 906", "Booking ref": "ABC123" } */
  bookingDetails?: Record<string, string>
  /** Transportation guidance, e.g. "Take the MTR Island Line to Central" */
  transportation?: string
  /** Local path (e.g. "/images/peak.jpg") or data URL. Remote URLs will not work offline. */
  image?: string
  links?: ExternalLink[]
}

export interface ChecklistItem {
  id: string
  label: string
}

export interface LocationInfo {
  name: string
  address?: string
  mapsUrl?: string
}

export interface ExternalLink {
  label: string
  url: string
}

export interface QuickInfoSection {
  id: string
  title: string
  category?: QuickInfoCategory
  items: QuickInfoItem[]
}

export type QuickInfoCategory =
  | 'accommodation'
  | 'flight'
  | 'booking'
  | 'emergency'
  | 'documents'
  | 'transport'
  | 'other'

export interface QuickInfoItem {
  label: string
  value: string
  /** Optional link, e.g. "tel:+852…" or a maps URL. */
  href?: string
}
