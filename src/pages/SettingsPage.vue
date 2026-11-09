<script setup lang="ts">
import { ref } from 'vue'
import { toast } from 'vue-sonner'
import {
  ArchiveRestoreIcon,
  DatabaseBackupIcon,
  DownloadIcon,
  MonitorSmartphoneIcon,
  MoonIcon,
  PencilIcon,
  RotateCcwIcon,
  SmartphoneIcon,
  SunIcon,
  UploadIcon,
} from '@lucide/vue'
import { Card } from '@/components/ui/card'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import AppHeader from '@/components/layout/AppHeader.vue'
import PageContent from '@/components/layout/PageContent.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import ListRow from '@/components/common/ListRow.vue'
import SectionHeading from '@/components/common/SectionHeading.vue'
import { useInstallPrompt } from '@/composables/useInstallPrompt'
import { useItinerary } from '@/composables/useItinerary'
import { useOffline } from '@/composables/useOffline'
import { useProgress } from '@/composables/useProgress'
import { useTheme } from '@/composables/useTheme'
import type { Theme } from '@/types/progress'
import {
  createBackup,
  createTripExport,
  downloadJson,
  importTrip,
  parseImportFile,
  restoreBackup,
  slugify,
  type ParsedImport,
} from '@/services/backup.service'

const { trip, load } = useItinerary()
const { reset } = useProgress()
const { theme, setTheme } = useTheme()
const { isOffline } = useOffline()
const { canInstall, installed, install } = useInstallPrompt()

const themeOptions: { value: Theme, label: string, icon: typeof SunIcon }[] = [
  { value: 'light', label: 'Light', icon: SunIcon },
  { value: 'dark', label: 'Dark', icon: MoonIcon },
  { value: 'system', label: 'System', icon: MonitorSmartphoneIcon },
]

// --- Export / backup -------------------------------------------------------

function exportItinerary() {
  if (!trip.value) return
  downloadJson(createTripExport(trip.value), `${slugify(trip.value.title)}.json`)
}

async function backUp() {
  try {
    const backup = await createBackup()
    downloadJson(backup, `itinerary-guide-backup-${new Date().toISOString().slice(0, 10)}.json`)
  }
  catch (err) {
    console.error(err)
    toast.error('Backup failed', { description: 'Your data could not be read from storage.' })
  }
}

// --- Import / restore ------------------------------------------------------

const fileInput = ref<HTMLInputElement | null>(null)
const pendingImport = ref<ParsedImport | null>(null)
const confirmImportOpen = ref(false)

function chooseFile() {
  fileInput.value?.click()
}

async function onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = '' // allow choosing the same file again
  if (!file) return
  try {
    pendingImport.value = parseImportFile(await file.text())
    confirmImportOpen.value = true
  }
  catch (err) {
    toast.error('Could not import this file', {
      description: err instanceof Error ? err.message : 'The file could not be read.',
    })
  }
}

async function confirmImport() {
  const parsed = pendingImport.value
  if (!parsed) return
  try {
    if (parsed.kind === 'trip') await importTrip(parsed.trip)
    else await restoreBackup(parsed.backup)
    await load()
    toast.success(parsed.kind === 'trip' ? `Imported "${parsed.trip.title}"` : 'Backup restored')
  }
  catch (err) {
    console.error(err)
    toast.error('Import failed', { description: 'Nothing was changed.' })
  }
  finally {
    pendingImport.value = null
  }
}

function importDescription(parsed: ParsedImport | null): string {
  if (!parsed) return ''
  if (parsed.kind === 'backup') {
    return `This replaces all trips and progress on this device with the backup (${parsed.backup.trips.length} trip${parsed.backup.trips.length === 1 ? '' : 's'}).`
  }
  const sameTrip = parsed.trip.id === trip.value?.id
  return sameTrip
    ? `"${parsed.trip.title}" will replace the current version of this trip. Progress on steps that still exist is kept.`
    : `"${parsed.trip.title}" (${parsed.trip.days.length} days) will become your active trip.`
}

// --- Progress --------------------------------------------------------------

async function resetProgress() {
  await reset()
  toast.success('Progress reset')
}

async function installApp() {
  if (await install()) toast.success('App installed')
}
</script>

<template>
  <AppHeader title="Settings" />

  <PageContent class="space-y-6">
    <section>
      <SectionHeading title="Appearance" />
      <ToggleGroup
        type="single"
        variant="outline"
        :model-value="theme"
        class="w-full"
        aria-label="Theme"
        @update:model-value="(value) => value && setTheme(value as Theme)"
      >
        <ToggleGroupItem
          v-for="option in themeOptions"
          :key="option.value"
          :value="option.value"
          class="h-11 flex-1 data-[state=on]:bg-muted"
        >
          <component :is="option.icon" aria-hidden="true" />
          {{ option.label }}
        </ToggleGroupItem>
      </ToggleGroup>
    </section>

    <section>
      <SectionHeading title="Itinerary" />
      <Card class="gap-0 divide-y py-0">
        <ListRow :icon="PencilIcon" label="Edit itinerary" description="Trip details, days and steps" to="/edit" />
        <ListRow :icon="UploadIcon" label="Import itinerary" description="Load a trip or backup from a JSON file" @click="chooseFile" />
        <ListRow :icon="DownloadIcon" label="Export itinerary" description="Save the current trip as JSON" @click="exportItinerary" />
      </Card>
      <input
        ref="fileInput"
        type="file"
        accept="application/json,.json"
        class="hidden"
        aria-hidden="true"
        tabindex="-1"
        @change="onFileSelected"
      >
    </section>

    <section>
      <SectionHeading title="Backup" />
      <Card class="gap-0 divide-y py-0">
        <ListRow :icon="DatabaseBackupIcon" label="Back up all data" description="Trips and progress in one file" @click="backUp" />
        <ListRow :icon="ArchiveRestoreIcon" label="Restore from backup" description="Choose a backup file to restore" @click="chooseFile" />
      </Card>
    </section>

    <section>
      <SectionHeading title="Progress" />
      <Card class="gap-0 py-0">
        <ConfirmDialog
          title="Reset progress?"
          description="All completed, skipped and checklist items for this trip will be cleared. Your itinerary stays the same. This cannot be undone."
          confirm-label="Reset progress"
          destructive
          @confirm="resetProgress"
        >
          <template #trigger>
            <ListRow :icon="RotateCcwIcon" label="Reset progress" destructive />
          </template>
        </ConfirmDialog>
      </Card>
    </section>

    <section>
      <SectionHeading title="App" />
      <Card class="gap-0 divide-y py-0">
        <ListRow
          v-if="canInstall"
          :icon="SmartphoneIcon"
          label="Install app"
          description="Add to your home screen for offline use"
          @click="installApp"
        />
        <div class="px-4 py-3 text-sm">
          <p class="font-medium">
            {{ isOffline ? 'You are offline' : 'You are online' }}
          </p>
          <p class="mt-0.5 text-xs text-muted-foreground">
            <template v-if="installed">
              Installed. The app and your itinerary are stored on this device and work without internet.
            </template>
            <template v-else>
              The app and your itinerary are stored on this device and work without internet once loaded.
            </template>
            Maps and external links still need a connection.
          </p>
        </div>
      </Card>
    </section>

    <ConfirmDialog
      v-model:open="confirmImportOpen"
      :title="pendingImport?.kind === 'backup' ? 'Restore backup?' : 'Import itinerary?'"
      :description="importDescription(pendingImport)"
      :confirm-label="pendingImport?.kind === 'backup' ? 'Restore' : 'Import'"
      :destructive="pendingImport?.kind === 'backup'"
      @confirm="confirmImport"
    />
  </PageContent>
</template>
