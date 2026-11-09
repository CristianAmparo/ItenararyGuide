/** Creates a unique ID for new itinerary content (days, steps, checklist items). */
export function createId(prefix = 'id'): string {
  const random = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID().slice(0, 8)
    : Math.random().toString(36).slice(2, 10)
  return `${prefix}-${random}`
}

/** Deep, non-reactive copy that IndexedDB can store (strips Vue proxies). */
export function toPlain<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}
