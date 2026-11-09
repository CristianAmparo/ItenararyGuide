import type { ChecklistItem, ItineraryStep, StepType } from '@/types/itinerary'
import { createId } from '@/lib/id'

/**
 * Editable, form-friendly shape of a step. Lists are edited as multi-line
 * text ("one per line") to keep the editor simple on mobile.
 */
export interface StepForm {
  title: string
  type: StepType
  scheduledTime: string
  estimatedDuration: string
  description: string
  instructions: string
  checklist: ChecklistItem[]
  locationName: string
  locationAddress: string
  locationMapsUrl: string
  transportation: string
  notes: string
  /** "Label: value" per line */
  bookingDetails: string
  /** "Label | https://…" per line */
  links: string
  image: string
}

function lines(text: string): string[] {
  return text.split('\n').map(l => l.trim()).filter(Boolean)
}

function orUndefined<T>(value: T[] | undefined): T[] | undefined {
  return value && value.length ? value : undefined
}

export function stepToForm(step?: ItineraryStep): StepForm {
  return {
    title: step?.title ?? '',
    type: step?.type ?? 'activity',
    scheduledTime: step?.scheduledTime ?? '',
    estimatedDuration: step?.estimatedDuration ?? '',
    description: step?.description ?? '',
    instructions: (step?.instructions ?? []).join('\n'),
    checklist: (step?.checklist ?? []).map(item => ({ ...item })),
    locationName: step?.location?.name ?? '',
    locationAddress: step?.location?.address ?? '',
    locationMapsUrl: step?.location?.mapsUrl ?? '',
    transportation: step?.transportation ?? '',
    notes: (step?.notes ?? []).join('\n'),
    bookingDetails: Object.entries(step?.bookingDetails ?? {}).map(([k, v]) => `${k}: ${v}`).join('\n'),
    links: (step?.links ?? []).map(l => `${l.label} | ${l.url}`).join('\n'),
    image: step?.image ?? '',
  }
}

/** Builds a step from the form, keeping the existing ID so progress stays attached. */
export function formToStep(form: StepForm, id: string): ItineraryStep {
  const bookingEntries = lines(form.bookingDetails)
    .map((line) => {
      const index = line.indexOf(':')
      return index > 0 ? [line.slice(0, index).trim(), line.slice(index + 1).trim()] as const : null
    })
    .filter((e): e is readonly [string, string] => !!e && !!e[0] && !!e[1])

  const links = lines(form.links)
    .map((line) => {
      const index = line.indexOf('|')
      const label = index >= 0 ? line.slice(0, index).trim() : ''
      const url = index >= 0 ? line.slice(index + 1).trim() : line
      return url ? { label: label || url, url } : null
    })
    .filter((l): l is { label: string, url: string } => !!l)

  const locationName = form.locationName.trim() || form.locationAddress.trim()

  return {
    id,
    title: form.title.trim(),
    type: form.type,
    scheduledTime: form.scheduledTime.trim() || undefined,
    estimatedDuration: form.estimatedDuration.trim() || undefined,
    description: form.description.trim() || undefined,
    instructions: orUndefined(lines(form.instructions)),
    checklist: orUndefined(
      form.checklist
        .map(item => ({ id: item.id, label: item.label.trim() }))
        .filter(item => item.label),
    ),
    location: locationName
      ? {
          name: locationName,
          address: form.locationAddress.trim() || undefined,
          mapsUrl: form.locationMapsUrl.trim() || undefined,
        }
      : undefined,
    transportation: form.transportation.trim() || undefined,
    notes: orUndefined(lines(form.notes)),
    bookingDetails: bookingEntries.length ? Object.fromEntries(bookingEntries) : undefined,
    links: orUndefined(links),
    image: form.image.trim() || undefined,
  }
}

export function newChecklistItem(): ChecklistItem {
  return { id: createId('item'), label: '' }
}
