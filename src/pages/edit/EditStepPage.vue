<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { PlusIcon, SearchXIcon, Trash2Icon, XIcon } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import AppHeader from '@/components/layout/AppHeader.vue'
import PageContent from '@/components/layout/PageContent.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import FormField from '@/components/common/FormField.vue'
import SectionHeading from '@/components/common/SectionHeading.vue'
import { useItinerary } from '@/composables/useItinerary'
import { createId } from '@/lib/id'
import { findDay } from '@/lib/itinerary'
import { formToStep, newChecklistItem, stepToForm } from '@/lib/step-form'
import { STEP_TYPE_OPTIONS } from '@/lib/step-types'

const LINKS_HINT = 'One per line as: Label | https://example.com'

const route = useRoute()
const router = useRouter()
const { trip, updateTrip } = useItinerary()

const dayId = String(route.params.dayId)
const stepId = route.query.id ? String(route.query.id) : null

const day = computed(() => (trip.value ? findDay(trip.value, dayId) : undefined))
const existingStep = stepId ? day.value?.steps.find(s => s.id === stepId) : undefined
const isNew = !stepId
const notFound = computed(() => !day.value || (!!stepId && !existingStep))

const form = reactive(stepToForm(existingStep))

function backToDay() {
  router.replace({ name: 'edit-day', params: { dayId } })
}

async function save() {
  if (!form.title.trim()) {
    toast.error('Title is required')
    return
  }
  const step = formToStep(form, existingStep?.id ?? createId('step'))
  await updateTrip((draft) => {
    const target = findDay(draft, dayId)
    if (!target) return
    const index = target.steps.findIndex(s => s.id === step.id)
    if (index >= 0) target.steps[index] = step
    else target.steps.push(step)
  })
  toast.success(isNew ? 'Step added' : 'Step saved')
  backToDay()
}

async function deleteStep() {
  if (!existingStep) return
  await updateTrip((draft) => {
    const target = findDay(draft, dayId)
    if (target) target.steps = target.steps.filter(s => s.id !== existingStep.id)
  })
  toast.success('Step deleted')
  backToDay()
}
</script>

<template>
  <AppHeader
    :title="isNew ? 'New step' : 'Edit step'"
    :subtitle="day?.title"
    :back="{ name: 'edit-day', params: { dayId } }"
  />

  <PageContent v-if="!notFound" bottom-space="none">
    <form class="space-y-6" @submit.prevent="save">
      <section class="space-y-4">
        <FormField id="step-title" label="Title" required>
          <Input id="step-title" v-model="form.title" required autocomplete="off" placeholder="e.g. Go to the airport" />
        </FormField>
        <FormField id="step-type" label="Type">
          <NativeSelect id="step-type" v-model="form.type" class="w-full">
            <NativeSelectOption v-for="option in STEP_TYPE_OPTIONS" :key="option.value" :value="option.value">
              {{ option.label }}
            </NativeSelectOption>
          </NativeSelect>
        </FormField>
        <div class="grid grid-cols-2 gap-3">
          <FormField id="step-time" label="Time">
            <Input id="step-time" v-model="form.scheduledTime" placeholder="07:30" autocomplete="off" />
          </FormField>
          <FormField id="step-duration" label="Duration">
            <Input id="step-duration" v-model="form.estimatedDuration" placeholder="45 min" autocomplete="off" />
          </FormField>
        </div>
        <FormField id="step-description" label="Description">
          <Textarea id="step-description" v-model="form.description" rows="3" />
        </FormField>
        <FormField id="step-instructions" label="Instructions" hint="One instruction per line.">
          <Textarea id="step-instructions" v-model="form.instructions" rows="4" aria-describedby="step-instructions-hint" />
        </FormField>
      </section>

      <Separator />

      <section>
        <SectionHeading title="Checklist">
          <Button type="button" variant="ghost" size="sm" class="h-9" @click="form.checklist.push(newChecklistItem())">
            <PlusIcon />
            Add item
          </Button>
        </SectionHeading>
        <ul v-if="form.checklist.length" class="space-y-2">
          <li v-for="(item, index) in form.checklist" :key="item.id" class="flex items-center gap-2">
            <Input
              v-model="item.label"
              :aria-label="`Checklist item ${index + 1}`"
              placeholder="e.g. Passport ready"
              autocomplete="off"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              class="size-11 shrink-0 text-muted-foreground"
              :aria-label="`Remove checklist item ${index + 1}`"
              @click="form.checklist.splice(index, 1)"
            >
              <XIcon />
            </Button>
          </li>
        </ul>
        <p v-else class="px-1 text-sm text-muted-foreground">
          No checklist items.
        </p>
      </section>

      <Separator />

      <section class="space-y-4">
        <SectionHeading title="Location" />
        <FormField id="step-location-name" label="Place name">
          <Input id="step-location-name" v-model="form.locationName" autocomplete="off" />
        </FormField>
        <FormField id="step-location-address" label="Address">
          <Input id="step-location-address" v-model="form.locationAddress" autocomplete="off" />
        </FormField>
        <FormField id="step-location-maps" label="Google Maps link">
          <Input id="step-location-maps" v-model="form.locationMapsUrl" type="url" inputmode="url" placeholder="https://maps.google.com/?q=..." />
        </FormField>
        <FormField id="step-transport" label="Getting there">
          <Textarea id="step-transport" v-model="form.transportation" rows="2" placeholder="e.g. MTR Island Line to Central, Exit A" />
        </FormField>
      </section>

      <Separator />

      <section class="space-y-4">
        <SectionHeading title="More details" />
        <FormField id="step-notes" label="Important notes" hint="One note per line.">
          <Textarea id="step-notes" v-model="form.notes" rows="3" aria-describedby="step-notes-hint" />
        </FormField>
        <FormField id="step-booking" label="Booking details" hint="One per line as: Label: value (e.g. Booking ref: ABC123)">
          <Textarea id="step-booking" v-model="form.bookingDetails" rows="3" aria-describedby="step-booking-hint" />
        </FormField>
        <FormField id="step-links" label="Links" :hint="LINKS_HINT">
          <Textarea id="step-links" v-model="form.links" rows="2" aria-describedby="step-links-hint" />
        </FormField>
        <FormField id="step-image" label="Image" hint="A path inside the app (e.g. /images/peak.jpg). Online images are not available offline.">
          <Input id="step-image" v-model="form.image" autocomplete="off" aria-describedby="step-image-hint" />
        </FormField>
      </section>

      <div class="space-y-2 pt-2">
        <Button type="submit" class="h-12 w-full text-[15px]">
          {{ isNew ? 'Add step' : 'Save step' }}
        </Button>
        <ConfirmDialog
          v-if="!isNew"
          title="Delete this step?"
          :description="`“${existingStep?.title}” will be removed from this day.`"
          confirm-label="Delete step"
          destructive
          @confirm="deleteStep"
        >
          <template #trigger>
            <Button type="button" variant="destructive" class="h-11 w-full">
              <Trash2Icon />
              Delete step
            </Button>
          </template>
        </ConfirmDialog>
      </div>
    </form>
  </PageContent>

  <PageContent v-else bottom-space="none">
    <EmptyState :icon="SearchXIcon" title="Step not found">
      <Button as-child class="h-11">
        <RouterLink :to="{ name: 'edit-trip' }">
          Back to itinerary
        </RouterLink>
      </Button>
    </EmptyState>
  </PageContent>
</template>
