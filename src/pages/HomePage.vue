<script setup lang="ts">
import { computed } from 'vue'
import { ArrowRightIcon, CalendarIcon, MapPinIcon, PartyPopperIcon, PlayIcon } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import AppHeader from '@/components/layout/AppHeader.vue'
import PageContent from '@/components/layout/PageContent.vue'
import SectionHeading from '@/components/common/SectionHeading.vue'
import DayListItem from '@/components/itinerary/DayListItem.vue'
import TripProgressSummary from '@/components/itinerary/TripProgressSummary.vue'
import { useItinerary } from '@/composables/useItinerary'
import { useProgress } from '@/composables/useProgress'
import { computeStats, findStep } from '@/lib/itinerary'
import { formatDateRange, formatShortDate, pluralize } from '@/lib/format'
import { resumeRoute } from '@/lib/journey'
import { getStepTypeMeta } from '@/lib/step-types'

const { trip, steps } = useItinerary()
const { progress } = useProgress()

const stats = computed(() => computeStats(steps.value, progress.value))
const hasStarted = computed(() => !!progress.value?.lastAccessedAt)
const isTripDone = computed(() => stats.value.total > 0 && stats.value.remaining === 0)
const resumeTo = computed(() => (trip.value ? resumeRoute(trip.value, progress.value) : null))

/** The step the user will land on with "Continue". */
const current = computed(() => {
  if (!trip.value || !progress.value?.currentDayId) return null
  return findStep(trip.value, progress.value.currentDayId, progress.value.currentStepId) ?? null
})
</script>

<template>
  <AppHeader title="Itinerary Guide" />

  <PageContent v-if="trip" class="space-y-6">
    <!-- Trip summary -->
    <section aria-labelledby="trip-title">
      <p class="flex items-center gap-1.5 text-sm text-muted-foreground">
        <MapPinIcon class="size-4" aria-hidden="true" />
        {{ trip.destination }}
      </p>
      <h2 id="trip-title" class="mt-1 text-2xl font-semibold tracking-tight">
        {{ trip.title }}
      </h2>
      <p class="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
        <CalendarIcon class="size-4" aria-hidden="true" />
        {{ formatDateRange(trip.startDate, trip.endDate) }} · {{ pluralize(trip.days.length, 'day') }}
      </p>
      <p v-if="trip.description" class="mt-3 text-[15px] leading-relaxed text-foreground/80">
        {{ trip.description }}
      </p>
    </section>

    <!-- Current status + primary action -->
    <Card class="gap-0 py-0">
      <CardContent class="p-4">
        <TripProgressSummary :stats="stats" label="Trip progress" />

        <Separator class="my-4" />

        <div v-if="isTripDone" class="mb-4 flex items-center gap-3">
          <PartyPopperIcon class="size-5 shrink-0 text-success" aria-hidden="true" />
          <p class="text-sm">
            You've worked through every step of this trip.
          </p>
        </div>
        <div v-else-if="current && hasStarted" class="mb-4">
          <p class="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Day {{ current.dayIndex + 1 }} · {{ formatShortDate(current.day.date) }} · Where you left off
          </p>
          <p class="mt-1 flex items-center gap-2 text-[15px] font-medium">
            <component :is="getStepTypeMeta(current.step.type).icon" class="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <span class="truncate">{{ current.step.title }}</span>
          </p>
        </div>
        <p v-else class="mb-4 text-sm text-muted-foreground">
          Start the guide to go through your trip one step at a time.
        </p>

        <Button v-if="resumeTo" as-child class="h-12 w-full text-[15px]">
          <RouterLink :to="resumeTo">
            <template v-if="hasStarted">
              Continue journey
              <ArrowRightIcon class="size-4.5" />
            </template>
            <template v-else>
              <PlayIcon class="size-4" />
              Start journey
            </template>
          </RouterLink>
        </Button>
      </CardContent>
    </Card>

    <!-- Day-by-day preview -->
    <section aria-labelledby="days-heading">
      <SectionHeading id="days-heading" title="Day by day" />
      <Card class="gap-0 divide-y py-0">
        <DayListItem
          v-for="(day, index) in trip.days"
          :key="day.id"
          :day="day"
          :day-number="index + 1"
          :progress="progress"
          :is-current="progress?.currentDayId === day.id"
          :to="{ name: 'days', params: { dayId: day.id } }"
        />
      </Card>
    </section>
  </PageContent>
</template>
