<script setup lang="ts">
import { computed } from 'vue'
import {
  ClockIcon,
  ExternalLinkIcon,
  ListChecksIcon,
  ListOrderedIcon,
  MapIcon,
  MapPinIcon,
  NavigationIcon,
  StickyNoteIcon,
  TicketIcon,
  TimerIcon,
  LinkIcon,
} from '@lucide/vue'
import type { ItineraryStep } from '@/types/itinerary'
import type { StepStatus } from '@/types/progress'
import { Button } from '@/components/ui/button'
import InfoRow from '@/components/common/InfoRow.vue'
import StepSection from '@/components/itinerary/StepSection.vue'
import StepChecklist from '@/components/itinerary/StepChecklist.vue'
import StepStatusControl from '@/components/itinerary/StepStatusControl.vue'
import { useOffline } from '@/composables/useOffline'
import { useProgress } from '@/composables/useProgress'
import { countCheckedItems } from '@/lib/itinerary'
import { getStepTypeMeta } from '@/lib/step-types'

/**
 * Full content of one itinerary step. Only sections that have data are shown;
 * secondary information (booking details, links) is collapsible.
 */
const props = defineProps<{
  step: ItineraryStep
  status: StepStatus | undefined
}>()

const emit = defineEmits<{ complete: [], clear: [] }>()

const { isOffline } = useOffline()
const { progress } = useProgress()

const typeMeta = computed(() => getStepTypeMeta(props.step.type))
const bookingEntries = computed(() => Object.entries(props.step.bookingDetails ?? {}))
const checklistMeta = computed(() =>
  props.step.checklist ? `${countCheckedItems(props.step, progress.value)} of ${props.step.checklist.length}` : undefined,
)
</script>

<template>
  <article>
    <!-- Meta line: type, time, duration -->
    <div class="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
      <span class="inline-flex items-center gap-1.5">
        <component :is="typeMeta.icon" class="size-4" aria-hidden="true" />
        {{ typeMeta.label }}
      </span>
      <span v-if="step.scheduledTime" class="inline-flex items-center gap-1.5">
        <ClockIcon class="size-4" aria-hidden="true" />
        <span class="sr-only">Scheduled time:</span>
        {{ step.scheduledTime }}
      </span>
      <span v-if="step.estimatedDuration" class="inline-flex items-center gap-1.5">
        <TimerIcon class="size-4" aria-hidden="true" />
        <span class="sr-only">Estimated duration:</span>
        {{ step.estimatedDuration }}
      </span>
    </div>

    <h2 class="text-[1.625rem] leading-tight font-semibold tracking-tight text-balance">
      {{ step.title }}
    </h2>

    <p v-if="step.description" class="mt-3 text-[17px] leading-relaxed text-foreground/85">
      {{ step.description }}
    </p>

    <StepStatusControl
      class="mt-4 mb-4"
      :status="status"
      @complete="emit('complete')"
      @clear="emit('clear')"
    />

    <img
      v-if="step.image"
      :src="step.image"
      :alt="step.title"
      class="mb-4 aspect-video w-full rounded-lg border object-cover"
      loading="lazy"
    >

    <StepSection v-if="step.location" title="Location" :icon="MapPinIcon">
      <p class="text-[15px] font-medium">
        {{ step.location.name }}
      </p>
      <p v-if="step.location.address" class="mt-0.5 text-sm text-muted-foreground">
        {{ step.location.address }}
      </p>
      <template v-if="step.location.mapsUrl">
        <Button as-child variant="outline" class="mt-3 h-10 w-full">
          <a :href="step.location.mapsUrl" target="_blank" rel="noopener noreferrer">
            <MapIcon />
            Open in Maps
          </a>
        </Button>
        <p v-if="isOffline" class="mt-2 text-xs text-muted-foreground">
          Maps need an internet connection.
        </p>
      </template>
    </StepSection>

    <StepSection v-if="step.instructions?.length" title="Instructions" :icon="ListOrderedIcon">
      <ol class="space-y-3">
        <li v-for="(instruction, i) in step.instructions" :key="i" class="flex gap-3 text-[15px] leading-relaxed">
          <span
            class="mt-0.5 flex size-5.5 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground"
            aria-hidden="true"
          >{{ i + 1 }}</span>
          <span>{{ instruction }}</span>
        </li>
      </ol>
    </StepSection>

    <StepSection v-if="step.checklist?.length" title="Checklist" :icon="ListChecksIcon" :meta="checklistMeta">
      <StepChecklist :step="step" />
    </StepSection>

    <StepSection v-if="step.transportation" title="Getting there" :icon="NavigationIcon">
      <p class="text-[15px] leading-relaxed">
        {{ step.transportation }}
      </p>
    </StepSection>

    <StepSection v-if="step.notes?.length" title="Important notes" :icon="StickyNoteIcon">
      <ul class="space-y-2">
        <li
          v-for="(note, i) in step.notes"
          :key="i"
          class="border-l-2 border-warning/60 pl-3 text-[15px] leading-relaxed"
        >
          {{ note }}
        </li>
      </ul>
    </StepSection>

    <StepSection
      v-if="bookingEntries.length"
      title="Booking details"
      :icon="TicketIcon"
      collapsible
      :default-open="true"
    >
      <div class="divide-y">
        <InfoRow
          v-for="[label, value] in bookingEntries"
          :key="label"
          :label="label"
          :value="value"
          copyable
        />
      </div>
    </StepSection>

    <StepSection
      v-if="step.links?.length"
      title="Links"
      :icon="LinkIcon"
      collapsible
      :meta="String(step.links.length)"
    >
      <ul class="space-y-1">
        <li v-for="link in step.links" :key="link.url">
          <a
            :href="link.url"
            target="_blank"
            rel="noopener noreferrer"
            class="flex min-h-11 items-center gap-2 text-[15px] font-medium text-highlight underline-offset-4 hover:underline"
          >
            <ExternalLinkIcon class="size-4 shrink-0" aria-hidden="true" />
            {{ link.label }}
          </a>
        </li>
      </ul>
      <p v-if="isOffline" class="mt-1 text-xs text-muted-foreground">
        Links need an internet connection.
      </p>
    </StepSection>
  </article>
</template>
