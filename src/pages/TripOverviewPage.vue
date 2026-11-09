<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowRightIcon, CalendarXIcon } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import AppHeader from '@/components/layout/AppHeader.vue'
import PageContent from '@/components/layout/PageContent.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import DaySelector from '@/components/itinerary/DaySelector.vue'
import StepList from '@/components/itinerary/StepList.vue'
import { Progress } from '@/components/ui/progress'
import { useItinerary } from '@/composables/useItinerary'
import { useProgress } from '@/composables/useProgress'
import { computeStats, findDay } from '@/lib/itinerary'
import { formatLongDate, pluralize } from '@/lib/format'
import { guideRoute } from '@/lib/journey'

const route = useRoute()
const router = useRouter()
const { trip } = useItinerary()
const { progress } = useProgress()

/** Selected day comes from the URL, defaulting to the current day, then the first. */
const selectedDayId = computed<string>({
  get: () => {
    const fromRoute = route.params.dayId ? String(route.params.dayId) : ''
    if (trip.value && findDay(trip.value, fromRoute)) return fromRoute
    const current = progress.value?.currentDayId
    if (trip.value && findDay(trip.value, current)) return current!
    return trip.value?.days[0]?.id ?? ''
  },
  set: dayId => router.replace({ name: 'days', params: { dayId } }),
})

const day = computed(() => (trip.value ? findDay(trip.value, selectedDayId.value) : undefined))
const dayNumber = computed(() => (trip.value && day.value ? trip.value.days.indexOf(day.value) + 1 : 0))
const stats = computed(() => computeStats(day.value?.steps ?? [], progress.value))
const currentStepId = computed(() =>
  progress.value?.currentDayId === selectedDayId.value ? progress.value.currentStepId : null,
)
</script>

<template>
  <AppHeader title="Days" />

  <PageContent v-if="trip">
    <DaySelector v-model="selectedDayId" :days="trip.days" :progress="progress" />

    <section v-if="day" class="mt-5" aria-live="polite">
      <p class="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
        Day {{ dayNumber }} · {{ formatLongDate(day.date) }}
      </p>
      <h2 class="mt-1 text-xl font-semibold tracking-tight">
        {{ day.title }}
      </h2>
      <p v-if="day.description" class="mt-1 text-[15px] text-foreground/80">
        {{ day.description }}
      </p>

      <div v-if="day.steps.length" class="mt-4 flex items-center gap-3">
        <Progress :model-value="stats.percent" class="h-1.5 flex-1" :aria-label="`Day ${dayNumber} progress`" />
        <span class="shrink-0 text-xs text-muted-foreground tabular-nums">
          {{ stats.completed }} done<template v-if="stats.skipped"> · {{ stats.skipped }} skipped</template> · {{ pluralize(stats.remaining, 'left', 'left') }}
        </span>
      </div>

      <StepList
        v-if="day.steps.length"
        class="-mx-2 mt-3"
        :steps="day.steps"
        :progress="progress"
        :current-step-id="currentStepId"
        @select="stepId => router.push(guideRoute(day!.id, stepId))"
      />
      <EmptyState
        v-else
        :icon="CalendarXIcon"
        title="No activities yet"
        description="Add steps to this day from Settings → Edit itinerary."
      />

      <Button v-if="day.steps.length" as-child class="mt-4 h-12 w-full text-[15px]">
        <RouterLink :to="{ name: 'guide-day', params: { dayId: day.id } }">
          {{ stats.remaining === 0 ? 'Review this day' : stats.completed + stats.skipped > 0 ? 'Continue this day' : 'Start this day' }}
          <ArrowRightIcon class="size-4.5" />
        </RouterLink>
      </Button>
    </section>
  </PageContent>
</template>
