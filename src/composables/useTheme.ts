import { ref, watchEffect } from 'vue'
import { usePreferredDark } from '@vueuse/core'
import type { Theme } from '@/types/progress'

/** Lightweight preference, so it lives in localStorage (read early in index.html). */
const STORAGE_KEY = 'itinerary-guide:theme'

function readStoredTheme(): Theme {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    if (value === 'light' || value === 'dark' || value === 'system') return value
  }
  catch {
    // Storage unavailable (private mode): fall back to system.
  }
  return 'system'
}

const theme = ref<Theme>(readStoredTheme())
let initialized = false

export function useTheme() {
  const prefersDark = usePreferredDark()

  if (!initialized) {
    initialized = true
    watchEffect(() => {
      const dark = theme.value === 'dark' || (theme.value === 'system' && prefersDark.value)
      document.documentElement.classList.toggle('dark', dark)
      document.querySelector('meta[name="theme-color"]')
        ?.setAttribute('content', dark ? '#16181f' : '#faf8f4')
    })
  }

  function setTheme(value: Theme): void {
    theme.value = value
    try {
      localStorage.setItem(STORAGE_KEY, value)
    }
    catch {
      // Ignore: preference simply won't persist.
    }
  }

  return { theme, setTheme }
}
