<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { ArrowDownIcon, ArrowUpIcon, PlusIcon, SearchXIcon, Trash2Icon } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import AppHeader from '@/components/layout/AppHeader.vue'
import PageContent from '@/components/layout/PageContent.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import FormField from '@/components/common/FormField.vue'
import SectionHeading from '@/components/common/SectionHeading.vue'
import { useItinerary } from '@/composables/useItinerary'
import { findDay } from '@/lib/itinerary'
import { getStepTypeMeta } from '@/lib/step-types'
import type { TripDay } from '@/types/itinerary'

const route = useRoute()
const router = useRouter()
const { trip, updateTrip } = useItinerary()

const dayId = String(route.params.dayId)
const day = computed(() => (trip.value ? findDay(trip.value, dayId) : undefined))
const dayNumber = computed(() => (trip.value && day.value ? trip.value.days.indexOf(day.value) + 1 : 0))

const form = reactive({
  title: day.value?.title ?? '',
  date: day.value?.date ?? '',
  description: day.value?.description ?? '',
})

const isDirty = computed(() => !!day.value && (
  form.title !== day.value.title
  || form.date !== day.value.date
  || form.description !== (day.value.description ?? '')
))

function withDay(mutate: (day: TripDay) => void) {
  return updateTrip((draft) => {
    const target = findDay(draft, dayId)
    if (target) mutate(target)
  })
}

async function save() {
  if (!form.title.trim() || !form.date) {
    toast.error('Title and date are required')
    return
  }
  await withDay((d) => {
    d.title = form.title.trim()
    d.date = form.date
    d.description = form.description.trim() || undefined
  })
  toast.success('Day saved')
}

async function moveStep(index: number, direction: -1 | 1) {
  await withDay((d) => {
    const target = index + direction
    if (target < 0 || target >= d.steps.length) return
    const [step] = d.steps.splice(index, 1)
    d.steps.splice(target, 0, step!)
  })
}

const stepToDelete = ref<{ id: string, title: string } | null>(null)
const deleteStepOpen = ref(false)

function askDeleteStep(step: { id: string, title: string }) {
  stepToDelete.value = step
  deleteStepOpen.value = true
}

async function deleteStep() {
  const step = stepToDelete.value
  if (!step) return
  await withDay((d) => {
    d.steps = d.steps.filter(s => s.id !== step.id)
  })
  toast.success('Step deleted')
}

async function deleteDay() {
  await updateTrip((draft) => {
    draft.days = draft.days.filter(d => d.id !== dayId)
  })
  toast.success('Day deleted')
  router.replace({ name: 'edit-trip' })
}
</script>

<template>
  <AppHeader
    :title="day ? `Day ${dayNumber}` : 'Edit day'"
    subtitle="Edit itinerary"
    :back="{ name: 'edit-trip' }"
  />

  <PageContent v-if="day && trip" bottom-space="none" class="space-y-6">
    <form class="space-y-4" @submit.prevent="save">
      <FormField id="day-title" label="Title" required>
        <Input id="day-title" v-model="form.title" required autocomplete="off" />
      </FormField>
      <FormField id="day-date" label="Date" required>
        <Input id="day-date" v-model="form.date" type="date" required />
      </FormField>
      <FormField id="day-description" label="Description">
        <Textarea id="day-description" v-model="form.description" rows="2" />
      </FormField>
      <Button type="submit" class="h-11 w-full" :disabled="!isDirty">
        Save day
      </Button>
    </form>

    <section>
      <SectionHeading title="Steps">
        <Button as-child variant="ghost" size="sm" class="h-9">
          <RouterLink :to="{ name: 'edit-step', params: { dayId } }">
            <PlusIcon />
            Add step
          </RouterLink>
        </Button>
      </SectionHeading>

      <Card v-if="day.steps.length" class="gap-0 divide-y py-0">
        <div v-for="(step, index) in day.steps" :key="step.id" class="flex items-center gap-1 py-1 pr-1 pl-4">
          <RouterLink
            :to="{ name: 'edit-step', params: { dayId }, query: { id: step.id } }"
            class="min-w-0 flex-1 rounded-md py-2 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <span class="block truncate text-[15px] font-medium">{{ step.title }}</span>
            <span class="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
              <span v-if="step.scheduledTime" class="tabular-nums">{{ step.scheduledTime }} ·</span>
              {{ getStepTypeMeta(step.type).label }}
            </span>
          </RouterLink>
          <Button
            variant="ghost"
            size="icon"
            class="size-10 text-muted-foreground"
            :disabled="index === 0"
            :aria-label="`Move ${step.title} up`"
            @click="moveStep(index, -1)"
          >
            <ArrowUpIcon />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            class="size-10 text-muted-foreground"
            :disabled="index === day.steps.length - 1"
            :aria-label="`Move ${step.title} down`"
            @click="moveStep(index, 1)"
          >
            <ArrowDownIcon />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            class="size-10 text-muted-foreground hover:text-destructive"
            :aria-label="`Delete ${step.title}`"
            @click="askDeleteStep(step)"
          >
            <Trash2Icon />
          </Button>
        </div>
      </Card>
      <Card v-else class="py-0">
        <EmptyState title="No steps yet" description="Add the first activity for this day." />
      </Card>
    </section>

    <ConfirmDialog
      title="Delete this day?"
      :description="`Day ${dayNumber} and its ${day.steps.length} steps will be removed from the itinerary.`"
      confirm-label="Delete day"
      destructive
      @confirm="deleteDay"
    >
      <template #trigger>
        <Button variant="destructive" class="h-11 w-full">
          <Trash2Icon />
          Delete day
        </Button>
      </template>
    </ConfirmDialog>

    <ConfirmDialog
      v-model:open="deleteStepOpen"
      title="Delete this step?"
      :description="stepToDelete ? `“${stepToDelete.title}” will be removed from this day.` : ''"
      confirm-label="Delete step"
      destructive
      @confirm="deleteStep"
    />
  </PageContent>

  <PageContent v-else bottom-space="none">
    <EmptyState :icon="SearchXIcon" title="Day not found">
      <Button as-child class="h-11">
        <RouterLink :to="{ name: 'edit-trip' }">
          Back to itinerary
        </RouterLink>
      </Button>
    </EmptyState>
  </PageContent>
</template>
