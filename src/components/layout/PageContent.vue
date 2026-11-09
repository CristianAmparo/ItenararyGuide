<script setup lang="ts">
import { cn } from '@/lib/utils'
import type { HTMLAttributes } from 'vue'

/**
 * Scrollable page body with consistent padding. `bottomSpace` reserves room
 * for the bottom tab bar ("nav") or a fixed action bar ("actions").
 */
const props = withDefaults(defineProps<{
  bottomSpace?: 'nav' | 'actions' | 'none'
  class?: HTMLAttributes['class']
}>(), { bottomSpace: 'nav' })
</script>

<template>
  <main
    :class="cn(
      'flex-1 px-4 pt-4',
      props.bottomSpace === 'nav' && 'pb-[calc(6rem+env(safe-area-inset-bottom,0px))]',
      props.bottomSpace === 'actions' && 'pb-[calc(7.5rem+env(safe-area-inset-bottom,0px))]',
      props.bottomSpace === 'none' && 'pb-8',
      props.class,
    )"
  >
    <slot />
  </main>
</template>
