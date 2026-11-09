import { computed, ref } from 'vue'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const deferredPrompt = ref<BeforeInstallPromptEvent | null>(null)
const installed = ref(
  typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches,
)

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault()
    deferredPrompt.value = event as BeforeInstallPromptEvent
  })
  window.addEventListener('appinstalled', () => {
    installed.value = true
    deferredPrompt.value = null
  })
}

/**
 * Exposes the browser's install prompt (Chrome/Edge on Android and desktop).
 * `canInstall` is false when the browser hasn't offered installation, so the
 * button is only shown when it will actually work.
 */
export function useInstallPrompt() {
  const canInstall = computed(() => !!deferredPrompt.value && !installed.value)

  async function install(): Promise<boolean> {
    const event = deferredPrompt.value
    if (!event) return false
    await event.prompt()
    const choice = await event.userChoice
    deferredPrompt.value = null
    return choice.outcome === 'accepted'
  }

  return { canInstall, installed, install }
}
