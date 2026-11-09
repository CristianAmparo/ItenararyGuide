<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowRightIcon, CheckIcon, FlagIcon, HouseIcon, SearchXIcon } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import AppHeader from '@/components/layout/AppHeader.vue'
import PageContent from '@/components/layout/PageContent.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import SectionHeading from '@/components/common/SectionHeading.vue'
import StepList from '@/components/itinerary/StepList.vue'
import TripProgressSummary from '@/components/itinerary/TripProgressSummary.vue'
import { useItinerary } from '@/composables/useItinerary'
import { useProgress } from '@/composables/useProgress'
import { computeStats, getNextDay, getStepStatus } from '@/lib/itinerary'
import { formatLongDate } from '@/lib/format'
import { guideRoute } from '@/lib/journey'

const route = useRoute()
const router = useRouter()
const { trip, steps: allSteps } = useItinerary()
const { progress } = useProgress()

const dayIndex = computed(() => trip.value?.days.findIndex(d => d.id === route.params.dayId) ?? -1)
const day = computed(() => (dayIndex.value >= 0 ? trip.value!.days[dayIndex.value] : undefined))
const nextDay = computed(() => (trip.value && day.value ? getNextDay(trip.value, day.value.id) : undefined))
const nextDayNumber = computed(() => (nextDay.value && trip.value ? trip.value.days.indexOf(nextDay.value) + 1 : 0))

const dayStats = computed(() => computeStats(day.value?.steps ?? [], progress.value))
const tripStats = computed(() => computeStats(allSteps.value, progress.value))
const skippedSteps = computed(() =>
  day.value?.steps.filter(s => getStepStatus(progress.value, s.id) === 'skipped') ?? [],
)
const remainingSteps = computed(() =>
  day.value?.steps.filter(s => !getStepStatus(progress.value, s.id)) ?? [],
)

const heading = computed(() => {
  const n = dayIndex.value + 1
  if (!nextDay.value) return tripStats.value.remaining === 0 ? 'Trip complete' : 'You reached the end of your trip'
  return dayStats.value.remaining === 0 ? `Day ${n} complete` : `End of Day ${n}`
})

function openStep(stepId: string) {
  if (day.value) router.push(guideRoute(day.value.id, stepId))
}
</script>

<template>
  <template v-if="day">
    <AppHeader
      :title="nextDay ? 'Day summary' : 'Trip summary'"
      :subtitle="`Day ${dayIndex + 1} · ${formatLongDate(day.date)}`"
      back="/"
    />

    <PageContent bottom-space="none" class="space-y-6">
      <div class="flex flex-col items-center pt-4 text-center">
        <div v-if="dayStats.remaining === 0" class="flex size-14 items-center justify-center rounded-full bg-success/10 text-success">
          <CheckIcon class="size-7" stroke-width="2.5" aria-hidden="true" />
        </div>
        <div v-else class="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <FlagIcon class="size-6" aria-hidden="true" />
        </div>
        <h2 class="mt-4 text-xl font-semibold tracking-tight">
          {{ heading }}
        </h2>
        <p class="mt-1 max-w-xs text-[15px] text-muted-foreground">
          {{ day.title }}
        </p>
      </div>

      <Card class="gap-0 py-0">
        <CardContent class="p-4">
          <TripProgressSummary :stats="dayStats" :label="`Day ${dayIndex + 1}`" />
        </CardContent>
      </Card>

      <section v-if="remainingSteps.length">
        <SectionHeading title="Not done yet" />
        <StepList :steps="remainingSteps" :progress="progress" @select="openStep" />
      </section>

      <section v-if="skippedSteps.length">
        <SectionHeading title="Skipped" />
        <StepList :steps="skippedSteps" :progress="progress" @select="openStep" />
      </section>

      <div class="space-y-2">
        <Button v-if="nextDay" as-child class="h-12 w-full text-[15px]">
          <RouterLink :to="{ name: 'guide-day', params: { dayId: nextDay.id } }">
            Continue to Day {{ nextDayNumber }}
            <ArrowRightIcon class="size-4.5" />
          </RouterLink>
        </Button>
        <p v-else class="pb-2 text-center text-sm text-muted-foreground">
          Trip progress: {{ tripStats.completed }} completed, {{ tripStats.skipped }} skipped
          of {{ tripStats.total }} steps.
        </p>
        <Button as-child variant="outline" class="h-12 w-full text-[15px]">
          <RouterLink to="/">
            <HouseIcon class="size-4" />
            Back to trip overview
          </RouterLink>
        </Button>
      </div>
    </PageContent>
  </template>

  <template v-else>
    <AppHeader title="Day complete" back="/" />
    <PageContent bottom-space="none">
      <EmptyState :icon="SearchXIcon" title="Day not found" description="This day may have been removed from the itinerary.">
        <Button as-child class="h-11">
          <RouterLink to="/">
            Back to home
          </RouterLink>
        </Button>
      </EmptyState>
    </PageContent>
  </template>
</template>
