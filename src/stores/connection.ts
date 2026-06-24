import { defineStore } from 'pinia'
import { ref } from 'vue'
import { setBackendConfig } from '@/api/backend'

const DEFAULT_USERNAME = '666'
const DEFAULT_PASSWORD = '666'
const DEFAULT_BACKEND_URL = 'http://localhost:20058'

const authStorageKey = 'fryfrog-auth'
const backendUrlStorageKey = 'fryfrog-backend-url'
const showServerAddressStorageKey = 'fryfrog-show-server-address'

function loadSavedAuth(): { username: string; password: string } | null {
  const saved = localStorage.getItem(authStorageKey)
  if (!saved) return null
  try {
    return JSON.parse(saved)
  } catch {
    localStorage.removeItem(authStorageKey)
    return null
  }
}

export const useConnectionStore = defineStore('connection', () => {
  const savedAuth = loadSavedAuth()
  const backendUrl = ref(localStorage.getItem(backendUrlStorageKey) || DEFAULT_BACKEND_URL)
  const username = ref(savedAuth?.username || '')
  const password = ref(savedAuth?.password || '')
  const isAuthenticated = ref(false)
  const connected = ref(false)
  const showServerAddress = ref(localStorage.getItem(showServerAddressStorageKey) !== 'false')

  function applyBackendConfig() {
    setBackendConfig({ url: backendUrl.value, authenticated: isAuthenticated.value })
  }

  function setBackendUrl(url: string) {
    backendUrl.value = url
    localStorage.setItem(backendUrlStorageKey, url)
    applyBackendConfig()
  }

  async function login(user: string, pass: string): Promise<boolean> {
    if (user !== DEFAULT_USERNAME || pass !== DEFAULT_PASSWORD) {
      return false
    }
    username.value = user
    password.value = pass
    isAuthenticated.value = true
    connected.value = true
    localStorage.setItem(authStorageKey, JSON.stringify({ username: user, password: pass }))
    applyBackendConfig()
    return true
  }

  async function restoreConnection(): Promise<boolean> {
    if (!username.value || !password.value) {
      return false
    }
    isAuthenticated.value = true
    connected.value = true
    applyBackendConfig()
    return true
  }

  function disconnect() {
    username.value = ''
    password.value = ''
    isAuthenticated.value = false
    connected.value = false
    localStorage.removeItem(authStorageKey)
  }

  function setShowServerAddress(value: boolean) {
    showServerAddress.value = value
    localStorage.setItem(showServerAddressStorageKey, String(value))
  }

  return {
    backendUrl,
    username,
    password,
    isAuthenticated,
    connected,
    showServerAddress,
    login,
    restoreConnection,
    disconnect,
    setBackendUrl,
    setShowServerAddress,
  }
})
