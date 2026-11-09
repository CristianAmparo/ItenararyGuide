import type { Component } from 'vue'
import type { QuickInfoCategory, StepType } from '@/types/itinerary'
import {
  BedDoubleIcon,
  BusIcon,
  CircleDotIcon,
  FileTextIcon,
  InfoIcon,
  PlaneIcon,
  ShieldAlertIcon,
  ShoppingBagIcon,
  TicketIcon,
  TrainFrontIcon,
  UtensilsIcon,
  MapPinIcon,
} from '@lucide/vue'

export interface StepTypeMeta {
  label: string
  icon: Component
}

export const STEP_TYPES: Record<StepType, StepTypeMeta> = {
  airport: { label: 'Airport', icon: PlaneIcon },
  transport: { label: 'Transport', icon: TrainFrontIcon },
  accommodation: { label: 'Accommodation', icon: BedDoubleIcon },
  activity: { label: 'Activity', icon: MapPinIcon },
  food: { label: 'Food', icon: UtensilsIcon },
  shopping: { label: 'Shopping', icon: ShoppingBagIcon },
  other: { label: 'Other', icon: CircleDotIcon },
}

export const STEP_TYPE_OPTIONS = Object.entries(STEP_TYPES).map(([value, meta]) => ({
  value: value as StepType,
  label: meta.label,
}))

export function getStepTypeMeta(type: StepType | undefined): StepTypeMeta {
  return STEP_TYPES[type ?? 'other'] ?? STEP_TYPES.other
}

export const QUICK_INFO_ICONS: Record<QuickInfoCategory, Component> = {
  accommodation: BedDoubleIcon,
  flight: PlaneIcon,
  booking: TicketIcon,
  emergency: ShieldAlertIcon,
  documents: FileTextIcon,
  transport: BusIcon,
  other: InfoIcon,
}
