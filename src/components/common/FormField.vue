<script setup lang="ts">
import { Label } from '@/components/ui/label'

/** Label + control + optional hint, with consistent spacing. Put the input in the default slot with the same `id`. */
defineProps<{
  id: string
  label: string
  hint?: string
  required?: boolean
}>()
</script>

<template>
  <div class="space-y-1.5">
    <Label :for="id" class="text-sm">
      {{ label }}
      <span v-if="required" class="text-muted-foreground" aria-hidden="true">*</span>
    </Label>
    <slot />
    <p v-if="hint" :id="`${id}-hint`" class="text-xs text-muted-foreground">
      {{ hint }}
    </p>
  </div>
</template>
