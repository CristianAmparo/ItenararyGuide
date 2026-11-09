<script setup lang="ts">
import type { Component } from 'vue'
import { RouterLink, type RouteLocationRaw } from 'vue-router'
import { ChevronRightIcon } from '@lucide/vue'
import { cn } from '@/lib/utils'

/**
 * Tappable settings-style row: icon, label, optional description.
 * Renders a RouterLink when `to` is given, otherwise a button.
 */
const props = defineProps<{
  label: string
  description?: string
  icon?: Component
  to?: RouteLocationRaw
  destructive?: boolean
  disabled?: boolean
  chevron?: boolean
}>()

defineEmits<{ click: [event: MouseEvent] }>()
</script>

<template>
  <component
    :is="to ? RouterLink : 'button'"
    :to="to"
    :type="to ? undefined : 'button'"
    :disabled="disabled"
    :class="cn(
      'flex min-h-14 w-full items-center gap-3 px-4 py-3 text-left transition-colors outline-none hover:bg-muted/50 focus-visible:bg-muted disabled:pointer-events-none disabled:opacity-50',
      props.destructive && 'text-destructive',
    )"
    @click="(e: MouseEvent) => $emit('click', e)"
  >
    <component :is="icon" v-if="icon" class="size-5 shrink-0" :class="destructive ? '' : 'text-muted-foreground'" aria-hidden="true" />
    <span class="min-w-0 flex-1">
      <span class="block text-[15px] font-medium">{{ label }}</span>
      <span v-if="description" class="mt-0.5 block text-xs text-muted-foreground">{{ description }}</span>
    </span>
    <slot />
    <ChevronRightIcon v-if="chevron ?? !!to" class="size-4 shrink-0 text-muted-foreground/60" aria-hidden="true" />
  </component>
</template>
