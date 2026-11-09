<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { TriangleAlertIcon } from '@lucide/vue'
import 'vue-sonner/style.css'
import { Toaster } from '@/components/ui/sonner'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import AppNavigation from '@/components/layout/AppNavigation.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { useItinerary } from '@/composables/useItinerary'
import { useTheme } from '@/composables/useTheme'

useTheme()

const route = useRoute()
const { status, error, load } = useItinerary()

const showNav = computed(() => status.value === 'ready' && route.meta.nav === true)
</script>

<template>
  <div class="mx-auto flex min-h-dvh max-w-lg flex-col bg-background md:border-x">
    <div v-if="status === 'error'" class="flex flex-1 items-center pt-safe">
      <EmptyState
        :icon="TriangleAlertIcon"
        title="Something went wrong"
        :description="error ?? undefined"
      >
        <Button class="h-11" @click="load">
          Try again
        </Button>
      </EmptyState>
    </div>

    <div v-else-if="status !== 'ready'" class="space-y-4 px-4 pt-safe" aria-busy="true" aria-label="Loading">
      <Skeleton class="mt-6 h-6 w-40" />
      <Skeleton class="h-32 w-full" />
      <Skeleton class="h-16 w-full" />
      <Skeleton class="h-16 w-full" />
    </div>

    <RouterView v-else />

    <AppNavigation v-if="showNav" />
  </div>
  <Toaster position="top-center" :offset="{ top: 'calc(env(safe-area-inset-top, 0px) + 12px)' }" />
</template>
