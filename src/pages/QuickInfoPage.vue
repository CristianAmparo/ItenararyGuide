<script setup lang="ts">
import { InfoIcon } from '@lucide/vue'
import { Card } from '@/components/ui/card'
import AppHeader from '@/components/layout/AppHeader.vue'
import PageContent from '@/components/layout/PageContent.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import InfoRow from '@/components/common/InfoRow.vue'
import { useItinerary } from '@/composables/useItinerary'
import { QUICK_INFO_ICONS } from '@/lib/step-types'

const { trip } = useItinerary()
</script>

<template>
  <AppHeader title="Quick info" :subtitle="trip?.title" />

  <PageContent class="space-y-6">
    <template v-if="trip?.quickInfo?.length">
      <section v-for="section in trip.quickInfo" :key="section.id" :aria-labelledby="`qi-${section.id}`">
        <div class="mb-2 flex items-center gap-2 px-1">
          <component
            :is="QUICK_INFO_ICONS[section.category ?? 'other']"
            class="size-4 text-muted-foreground"
            aria-hidden="true"
          />
          <h2 :id="`qi-${section.id}`" class="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            {{ section.title }}
          </h2>
        </div>
        <Card class="gap-0 divide-y px-4 py-0">
          <InfoRow
            v-for="(item, i) in section.items"
            :key="i"
            :label="item.label"
            :value="item.value"
            :href="item.href"
            copyable
          />
        </Card>
      </section>
    </template>

    <EmptyState
      v-else
      :icon="InfoIcon"
      title="No quick info yet"
      description="Add hotel, flight and emergency details to the itinerary's quickInfo section and import it from Settings."
    />
  </PageContent>
</template>
