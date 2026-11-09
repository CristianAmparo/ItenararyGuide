import { registerSW } from 'virtual:pwa-register'
import { toast } from 'vue-sonner'

/**
 * Registers the service worker that caches the app for offline use.
 * When a new version is available the user is asked before reloading, so an
 * update never interrupts them mid-step.
 */
export function registerServiceWorker(): void {
  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      toast('A new version is available', {
        duration: Infinity,
        action: { label: 'Update', onClick: () => updateSW(true) },
      })
    },
    onOfflineReady() {
      toast.success('Ready to use offline')
    },
  })
}
