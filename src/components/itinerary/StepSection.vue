<script setup lang="ts">
import type { Component } from 'vue'
import { ChevronDownIcon } from '@lucide/vue'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

/**
 * A titled section inside a step. Secondary information can be made
 * `collapsible` to keep busy steps clean.
 */
withDefaults(defineProps<{
  title: string
  icon?: Component
  collapsible?: boolean
  defaultOpen?: boolean
  meta?: string
}>(), { collapsible: false, defaultOpen: false })
</script>

<template>
  <section class="border-t py-4">
    <Collapsible v-if="collapsible" :default-open="defaultOpen" class="group/section">
      <CollapsibleTrigger
        class="-my-2 flex min-h-11 w-full items-center gap-2 rounded-md text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <component :is="icon" v-if="icon" class="size-4 text-muted-foreground" aria-hidden="true" />
        <h3 class="flex-1 text-sm font-semibold">
          {{ title }}
        </h3>
        <span v-if="meta" class="text-xs text-muted-foreground">{{ meta }}</span>
        <ChevronDownIcon
          class="size-4 text-muted-foreground transition-transform group-data-[state=open]/section:rotate-180"
          aria-hidden="true"
        />
      </CollapsibleTrigger>
      <CollapsibleContent class="pt-3">
        <slot />
      </CollapsibleContent>
    </Collapsible>

    <template v-else>
      <div class="mb-3 flex items-center gap-2">
        <component :is="icon" v-if="icon" class="size-4 text-muted-foreground" aria-hidden="true" />
        <h3 class="flex-1 text-sm font-semibold">
          {{ title }}
        </h3>
        <span v-if="meta" class="text-xs text-muted-foreground">{{ meta }}</span>
      </div>
      <slot />
    </template>
  </section>
</template>
