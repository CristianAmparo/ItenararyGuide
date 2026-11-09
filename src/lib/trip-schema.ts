import type {
  ChecklistItem,
  ExternalLink,
  ItineraryStep,
  QuickInfoCategory,
  QuickInfoItem,
  QuickInfoSection,
  StepType,
  Trip,
  TripDay,
} from '@/types/itinerary'
import { STEP_TYPES } from '@/lib/step-types'

/**
 * Validates and normalizes untrusted itinerary JSON (imports, backups).
 *
 * - Required fields are checked and a readable error is thrown.
 * - Missing IDs are generated from the item's position (e.g. "day-2-step-3").
 *   Providing your own IDs is recommended: they keep progress attached to the
 *   right step even if you later reorder content.
 * - Unknown fields are dropped.
 */

export class TripValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'TripValidationError'
  }
}

type Json = Record<string, unknown>

const QUICK_INFO_CATEGORIES: QuickInfoCategory[] = ['accommodation', 'flight', 'booking', 'emergency', 'documents', 'transport', 'other']

function isObject(value: unknown): value is Json {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function optionalString(value: unknown): string | undefined {
  if (typeof value === 'string') return value.trim() || undefined
  if (typeof value === 'number') return String(value)
  return undefined
}

function requiredString(value: unknown, path: string): string {
  const result = optionalString(value)
  if (!result) throw new TripValidationError(`"${path}" is required and must be text.`)
  return result
}

function stringList(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined
  const list = value.map(optionalString).filter((v): v is string => !!v)
  return list.length ? list : undefined
}

function idOf(value: unknown, fallback: string): string {
  return optionalString(value) ?? fallback
}

function parseChecklist(value: unknown, stepId: string): ChecklistItem[] | undefined {
  if (!Array.isArray(value)) return undefined
  const items = value
    .map((raw, i): ChecklistItem | null => {
      if (typeof raw === 'string') return raw.trim() ? { id: `${stepId}-item-${i + 1}`, label: raw.trim() } : null
      if (!isObject(raw)) return null
      const label = optionalString(raw.label)
      return label ? { id: idOf(raw.id, `${stepId}-item-${i + 1}`), label } : null
    })
    .filter((v): v is ChecklistItem => !!v)
  return items.length ? items : undefined
}

function parseLinks(value: unknown): ExternalLink[] | undefined {
  if (!Array.isArray(value)) return undefined
  const links = value
    .filter(isObject)
    .map(raw => ({ label: optionalString(raw.label) ?? optionalString(raw.url) ?? '', url: optionalString(raw.url) ?? '' }))
    .filter(link => link.url)
  return links.length ? links : undefined
}

function parseBookingDetails(value: unknown): Record<string, string> | undefined {
  if (!isObject(value)) return undefined
  const entries = Object.entries(value)
    .map(([k, v]) => [k.trim(), optionalString(v)] as const)
    .filter((e): e is readonly [string, string] => !!e[0] && !!e[1])
  return entries.length ? Object.fromEntries(entries) : undefined
}

function parseStep(raw: unknown, path: string, fallbackId: string): ItineraryStep {
  if (!isObject(raw)) throw new TripValidationError(`"${path}" must be an object.`)
  const id = idOf(raw.id, fallbackId)
  const type = (typeof raw.type === 'string' && raw.type in STEP_TYPES ? raw.type : 'other') as StepType

  let location: ItineraryStep['location']
  if (isObject(raw.location)) {
    const name = optionalString(raw.location.name) ?? optionalString(raw.location.address)
    if (name) {
      location = {
        name,
        address: optionalString(raw.location.address),
        mapsUrl: optionalString(raw.location.mapsUrl),
      }
    }
  }

  return {
    id,
    title: requiredString(raw.title, `${path}.title`),
    type,
    description: optionalString(raw.description),
    scheduledTime: optionalString(raw.scheduledTime),
    estimatedDuration: optionalString(raw.estimatedDuration),
    location,
    instructions: stringList(raw.instructions),
    checklist: parseChecklist(raw.checklist, id),
    notes: stringList(raw.notes),
    bookingDetails: parseBookingDetails(raw.bookingDetails),
    transportation: optionalString(raw.transportation),
    image: optionalString(raw.image),
    links: parseLinks(raw.links),
  }
}

function parseDay(raw: unknown, index: number): TripDay {
  const path = `days[${index}]`
  if (!isObject(raw)) throw new TripValidationError(`"${path}" must be an object.`)
  const id = idOf(raw.id, `day-${index + 1}`)
  const steps = Array.isArray(raw.steps)
    ? raw.steps.map((s, i) => parseStep(s, `${path}.steps[${i}]`, `${id}-step-${i + 1}`))
    : []
  return {
    id,
    date: requiredString(raw.date, `${path}.date`),
    title: optionalString(raw.title) ?? `Day ${index + 1}`,
    description: optionalString(raw.description),
    steps,
  }
}

function parseQuickInfo(value: unknown): QuickInfoSection[] | undefined {
  if (!Array.isArray(value)) return undefined
  const sections = value
    .filter(isObject)
    .map((raw, i): QuickInfoSection | null => {
      const title = optionalString(raw.title)
      if (!title) return null
      const category = QUICK_INFO_CATEGORIES.includes(raw.category as QuickInfoCategory)
        ? raw.category as QuickInfoCategory
        : 'other'
      const items: QuickInfoItem[] = (Array.isArray(raw.items) ? raw.items : [])
        .filter(isObject)
        .map(item => ({
          label: optionalString(item.label) ?? '',
          value: optionalString(item.value) ?? '',
          href: optionalString(item.href),
        }))
        .filter(item => item.label || item.value)
      return { id: idOf(raw.id, `info-${i + 1}`), title, category, items }
    })
    .filter((v): v is QuickInfoSection => !!v)
  return sections.length ? sections : undefined
}

function assertUniqueIds(trip: Trip): void {
  const seen = new Set<string>()
  const check = (id: string, kind: string) => {
    if (seen.has(id)) throw new TripValidationError(`Duplicate ${kind} ID "${id}". IDs must be unique within a trip.`)
    seen.add(id)
  }
  for (const day of trip.days) {
    check(day.id, 'day')
    for (const step of day.steps) {
      check(step.id, 'step')
      const itemIds = new Set<string>()
      for (const item of step.checklist ?? []) {
        if (itemIds.has(item.id)) throw new TripValidationError(`Duplicate checklist item ID "${item.id}" in step "${step.id}".`)
        itemIds.add(item.id)
      }
    }
  }
}

export function parseTrip(raw: unknown): Trip {
  if (!isObject(raw)) throw new TripValidationError('The itinerary must be a JSON object.')
  if (!Array.isArray(raw.days) || raw.days.length === 0) {
    throw new TripValidationError('The itinerary must contain a non-empty "days" list.')
  }
  const days = raw.days.map(parseDay)
  const trip: Trip = {
    id: idOf(raw.id, 'trip-1'),
    title: requiredString(raw.title, 'title'),
    destination: optionalString(raw.destination) ?? '',
    startDate: optionalString(raw.startDate) ?? days[0]!.date,
    endDate: optionalString(raw.endDate) ?? days[days.length - 1]!.date,
    description: optionalString(raw.description),
    days,
    quickInfo: parseQuickInfo(raw.quickInfo),
  }
  assertUniqueIds(trip)
  return trip
}
