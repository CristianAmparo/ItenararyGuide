<script setup lang="ts">
import { ref } from 'vue'
import { CheckIcon, CopyIcon, ExternalLinkIcon, PhoneIcon } from '@lucide/vue'
import { Button } from '@/components/ui/button'

/**
 * A label/value row, used for booking details and quick info.
 * Values can be copied; `href` makes the value a link (tel:, maps, web).
 */
const props = defineProps<{
  label: string
  value: string
  href?: string
  copyable?: boolean
}>()

const copied = ref(false)

async function copy() {
  try {
    await navigator.clipboard.writeText(props.value)
    copied.value = true
    setTimeout(() => (copied.value = false), 1500)
  }
  catch {
    // Clipboard unavailable (e.g. insecure context): nothing to do.
  }
}

const isPhone = props.href?.startsWith('tel:')
</script>

<template>
  <div class="flex min-h-12 items-center gap-3 py-2.5">
    <div class="min-w-0 flex-1">
      <p class="text-xs text-muted-foreground">
        {{ label }}
      </p>
      <a
        v-if="href"
        :href="href"
        :target="isPhone ? undefined : '_blank'"
        :rel="isPhone ? undefined : 'noopener noreferrer'"
        class="inline-flex items-center gap-1.5 text-[15px] font-medium break-words text-highlight underline-offset-4 hover:underline"
      >
        {{ value }}
        <PhoneIcon v-if="isPhone" class="size-3.5 shrink-0" aria-hidden="true" />
        <ExternalLinkIcon v-else class="size-3.5 shrink-0" aria-hidden="true" />
      </a>
      <p v-else class="text-[15px] font-medium break-words">
        {{ value }}
      </p>
    </div>
    <Button
      v-if="copyable"
      variant="ghost"
      size="icon"
      class="size-10 shrink-0 text-muted-foreground"
      :aria-label="copied ? `${label} copied` : `Copy ${label}`"
      @click="copy"
    >
      <CheckIcon v-if="copied" class="text-success" />
      <CopyIcon v-else />
    </Button>
  </div>
</template>
