<script setup lang="ts">
/** Small uppercase label above a group of content, with an optional action on the right. */
defineProps<{
  title: string
  as?: string
}>()
</script>

<template>
  <div class="mb-2 flex min-h-8 items-center justify-between gap-2 px-1">
    <component :is="as ?? 'h2'" class="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
      {{ title }}
    </component>
    <slot />
  </div>
</template>
