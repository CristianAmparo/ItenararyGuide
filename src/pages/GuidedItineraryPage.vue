<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { InfoIcon, ListIcon, SearchXIcon } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import AppHeader from '@/components/layout/AppHeader.vue'
import PageContent from '@/components/layout/PageContent.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import DaySelector from '@/components/itinerary/DaySelector.vue'
import ItineraryStep from '@/components/itinerary/ItineraryStep.vue'
import StepList from '@/components/itinerary/StepList.vue'
import StepNavigation from '@/components/itinerary/StepNavigation.vue'
import StepProgress from '@/components/itinerary/StepProgress.vue'
import { useItinerary } from '@/composables/useItinerary'
import { useProgress } from '@/composables/useProgress'
import { findDay, findStep, getNextStepInDay, getPreviousStep, getStepStatus } from '@/lib/itinerary'
import { formatLongDate } from '@/lib/format'
import { dayCompleteRoute, guideRoute } from '@/lib/journey'

const route = useRoute()
const router = useRouter()
const { trip } = useItinerary()
const { progress, setStepStatus, setPosition } = useProgress()

const current = computed(() =>
  trip.value ? findStep(trip.value, String(route.params.dayId), String(route.params.stepId)) : undefined,
)
const status = computed(() => (current.value ? getStepStatus(progress.value, current.value.step.id) : undefined))
const previous = computed(() => (trip.value && current.value ? getPreviousStep(trip.value, current.value) : undefined))
const isLastStep = computed(() => !!current.value && !getNextStepInDay(current.value))

// Remember the position whenever a step is shown, so reopening the app resumes here.
watch(current, (ref) => {
  if (ref) setPosition(ref.day.id, ref.step.id)
}, { immediate: true })

/** Moves forward within the day, or to the day-complete screen after the last step. */
function advance() {
  if (!current.value) return
  const next = getNextStepInDay(current.value)
  router.replace(next ? guideRoute(next.day.id, next.step.id) : dayCompleteRoute(current.value.day.id))
}

function goNext() {
  if (!current.value) return
  setStepStatus(current.value.step.id, 'completed')
  advance()
}

function skip() {
  if (!current.value) return
  // Skipping never overrides a step that was already completed.
  if (status.value !== 'completed') setStepStatus(current.value.step.id, 'skipped')
  advance()
}

function goPrevious() {
  if (previous.value) router.replace(guideRoute(previous.value.day.id, previous.value.step.id))
}

// Day/step overview sheet
const overviewOpen = ref(false)
const overviewDayId = ref('')
const overviewDay = computed(() => (trip.value ? findDay(trip.value, overviewDayId.value) : undefined))

function openOverview() {
  overviewDayId.value = current.value?.day.id ?? trip.value?.days[0]?.id ?? ''
  overviewOpen.value = true
}

function jumpTo(stepId: string) {
  overviewOpen.value = false
  router.replace(guideRoute(overviewDayId.value, stepId))
}
</script>

<template>
  <template v-if="current && trip">
    <AppHeader
      :title="current.day.title"
      :subtitle="`Day ${current.dayIndex + 1} · ${formatLongDate(current.day.date)}`"
      back="/"
    >
      <Button variant="ghost" size="icon" class="size-10" aria-label="Quick info" as-child>
        <RouterLink to="/info">
          <InfoIcon class="size-5" />
        </RouterLink>
      </Button>
      <Button variant="ghost" size="icon" class="size-10" aria-label="All steps" @click="openOverview">
        <ListIcon class="size-5" />
      </Button>
    </AppHeader>

    <PageContent bottom-space="actions">
      <StepProgress
        :steps="current.day.steps"
        :current-index="current.stepIndex"
        :progress="progress"
        class="mb-6"
      />

      <ItineraryStep
        :key="current.step.id"
        :step="current.step"
        :status="status"
        class="animate-in fade-in-0 duration-200"
        @complete="setStepStatus(current.step.id, 'completed')"
        @clear="setStepStatus(current.step.id, null)"
      />
    </PageContent>

    <StepNavigation
      :can-go-back="!!previous"
      :is-last-step="isLastStep"
      @previous="goPrevious"
      @skip="skip"
      @next="goNext"
    />

    <Sheet v-model:open="overviewOpen">
      <SheetContent side="bottom" class="mx-auto max-h-[85dvh] max-w-lg gap-0 rounded-t-xl pb-safe">
        <SheetHeader class="pb-3">
          <SheetTitle>Itinerary</SheetTitle>
          <SheetDescription>Jump to any step. Your progress is kept.</SheetDescription>
        </SheetHeader>
        <div class="px-4 pb-3">
          <DaySelector v-model="overviewDayId" :days="trip.days" :progress="progress" />
        </div>
        <ScrollArea class="min-h-0 flex-1 border-t">
          <div class="p-2">
            <StepList
              v-if="overviewDay"
              :steps="overviewDay.steps"
              :progress="progress"
              :current-step-id="current.step.id"
              @select="jumpTo"
            />
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  </template>

  <template v-else>
    <AppHeader title="Guide" back="/" />
    <PageContent bottom-space="none">
      <EmptyState
        :icon="SearchXIcon"
        title="Step not found"
        description="This step may have been removed from the itinerary."
      >
        <Button as-child class="h-11">
          <RouterLink to="/guide">
            Go to my current step
          </RouterLink>
        </Button>
      </EmptyState>
    </PageContent>
  </template>
</template>
