<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { PlusIcon } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import AppHeader from '@/components/layout/AppHeader.vue'
import PageContent from '@/components/layout/PageContent.vue'
import FormField from '@/components/common/FormField.vue'
import ListRow from '@/components/common/ListRow.vue'
import SectionHeading from '@/components/common/SectionHeading.vue'
import { useItinerary } from '@/composables/useItinerary'
import { addDaysIso, formatShortDate, pluralize } from '@/lib/format'
import { createId } from '@/lib/id'

const router = useRouter()
const { trip, updateTrip } = useItinerary()

const form = reactive({
  title: trip.value?.title ?? '',
  destination: trip.value?.destination ?? '',
  startDate: trip.value?.startDate ?? '',
  endDate: trip.value?.endDate ?? '',
  description: trip.value?.description ?? '',
})

const isDirty = computed(() => !!trip.value && (
  form.title !== trip.value.title
  || form.destination !== trip.value.destination
  || form.startDate !== trip.value.startDate
  || form.endDate !== trip.value.endDate
  || form.description !== (trip.value.description ?? '')
))

async function save() {
  if (!form.title.trim()) {
    toast.error('Trip name is required')
    return
  }
  await updateTrip((draft) => {
    draft.title = form.title.trim()
    draft.destination = form.destination.trim()
    draft.startDate = form.startDate
    draft.endDate = form.endDate
    draft.description = form.description.trim() || undefined
  })
  toast.success('Trip details saved')
}

async function addDay() {
  if (!trip.value) return
  const last = trip.value.days[trip.value.days.length - 1]
  const id = createId('day')
  const date = last ? addDaysIso(last.date, 1) : (trip.value.startDate || addDaysIso('', 0))
  await updateTrip((draft) => {
    draft.days.push({ id, date, title: `Day ${draft.days.length + 1}`, steps: [] })
    if (draft.endDate < date) draft.endDate = date
  })
  form.endDate = trip.value.endDate
  router.push({ name: 'edit-day', params: { dayId: id } })
}
</script>

<template>
  <AppHeader title="Edit itinerary" back="/settings" />

  <PageContent v-if="trip" bottom-space="none" class="space-y-6">
    <form class="space-y-4" @submit.prevent="save">
      <FormField id="trip-title" label="Trip name" required>
        <Input id="trip-title" v-model="form.title" required autocomplete="off" />
      </FormField>
      <FormField id="trip-destination" label="Destination">
        <Input id="trip-destination" v-model="form.destination" autocomplete="off" />
      </FormField>
      <div class="grid grid-cols-2 gap-3">
        <FormField id="trip-start" label="Start date">
          <Input id="trip-start" v-model="form.startDate" type="date" />
        </FormField>
        <FormField id="trip-end" label="End date">
          <Input id="trip-end" v-model="form.endDate" type="date" />
        </FormField>
      </div>
      <FormField id="trip-description" label="Description">
        <Textarea id="trip-description" v-model="form.description" rows="2" />
      </FormField>
      <Button type="submit" class="h-11 w-full" :disabled="!isDirty">
        Save trip details
      </Button>
    </form>

    <section>
      <SectionHeading title="Days">
        <Button variant="ghost" size="sm" class="h-9" @click="addDay">
          <PlusIcon />
          Add day
        </Button>
      </SectionHeading>
      <Card class="gap-0 divide-y py-0">
        <ListRow
          v-for="(day, index) in trip.days"
          :key="day.id"
          :label="`Day ${index + 1} · ${day.title}`"
          :description="`${formatShortDate(day.date)} · ${pluralize(day.steps.length, 'step')}`"
          :to="{ name: 'edit-day', params: { dayId: day.id } }"
        />
      </Card>
    </section>
  </PageContent>
</template>
