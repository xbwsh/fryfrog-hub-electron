import { defineStore } from 'pinia'
import { computed, onBeforeUnmount, ref } from 'vue'

export type ThemeMode = 'system' | 'light' | 'dark'

const storageKey = 'theme-mode'
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

export const useThemeStore = defineStore('theme', () => {
  const mode = ref<ThemeMode>((localStorage.getItem(storageKey) as ThemeMode) || 'system')
  const systemPrefersDark = ref(mediaQuery.matches)

  const resolvedTheme = computed(() => mode.value === 'system'
    ? (systemPrefersDark.value ? 'dark' : 'light')
    : mode.value)

  function applyTheme() {
    document.documentElement.dataset.theme = resolvedTheme.value
    document.documentElement.style.colorScheme = resolvedTheme.value
  }

  function setMode(value: ThemeMode) {
    mode.value = value
    localStorage.setItem(storageKey, value)
    applyTheme()
  }

  function handleSystemChange(event: MediaQueryListEvent) {
    systemPrefersDark.value = event.matches
    applyTheme()
  }

  mediaQuery.addEventListener('change', handleSystemChange)
  applyTheme()

  onBeforeUnmount(() => {
    mediaQuery.removeEventListener('change', handleSystemChange)
  })

  return {
    mode,
    resolvedTheme,
    setMode,
  }
})
