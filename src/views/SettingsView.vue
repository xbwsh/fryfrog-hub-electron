<template>
  <div class="settings-view">
    <div class="settings-header">
      <h1>设置</h1>
    </div>

    <div class="settings-section">
      <div class="section-title">服务器</div>
      <div class="setting-item">
        <div class="item-info">
          <h3 class="item-label">后端地址</h3>
          <p class="item-description">Fryfrog Hub 后端服务的访问地址</p>
        </div>
        <div class="url-input-group">
          <input
            v-model="backendUrlInput"
            type="text"
            class="url-input"
            placeholder="http://localhost:20058"
            @blur="saveBackendUrl"
            @keydown.enter="saveBackendUrl"
          />
          <button class="btn-save" :disabled="backendUrlInput === connectionStore.backendUrl" @click="saveBackendUrl">
            保存
          </button>
        </div>
      </div>
    </div>

    <div class="settings-section">
      <div class="section-title">外观</div>
      <div class="setting-item">
        <div class="item-info">
          <h3 class="item-label">主题模式</h3>
          <p class="item-description">选择你喜欢的外观主题</p>
        </div>
        <select v-model="themeMode" class="theme-select">
          <option value="light">浅色</option>
          <option value="dark">深色</option>
          <option value="system">跟随系统</option>
        </select>
      </div>
    </div>

    <div class="settings-section">
      <div class="section-title">播放</div>
      <div class="setting-item">
        <div class="item-info">
          <h3 class="item-label">离线缓存</h3>
          <p class="item-description">开启后，播放过的歌曲将被缓存到本地</p>
        </div>
        <button
          class="toggle-switch"
          :class="{ active: playerStore.downloadEnabled }"
          @click="toggleDownload"
        >
          <span class="toggle-thumb"></span>
        </button>
      </div>
      <div class="setting-item" v-if="playerStore.downloadEnabled">
        <div class="item-info">
          <h3 class="item-label">缓存歌曲</h3>
          <p class="item-description">已缓存 {{ cachedTrackCount }} 首歌曲</p>
        </div>
        <button class="btn-clear" @click="clearCache">清除缓存</button>
      </div>
    </div>

    <div class="settings-section">
      <div class="section-title">媒体库</div>
      <div class="setting-item">
        <div class="item-info">
          <h3 class="item-label">一键整理</h3>
          <p class="item-description">清理无效记录并扫描新文件（音乐、漫画、电子书、视频）</p>
        </div>
        <button class="btn-rescan" :disabled="isRescanning" @click="handleRescan">
          {{ isRescanning ? '整理中...' : '开始整理' }}
        </button>
      </div>
      <div v-if="rescanResult" class="rescan-result">
        <div class="result-item" v-for="(mod, key) in rescanResult" :key="key">
          <span class="result-label">{{ moduleLabels[key as keyof typeof moduleLabels] }}</span>
          <span class="result-detail">清理 {{ mod.cleanedCount }} 条 · {{ mod.scanStatus }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { usePlayerStore } from '@/stores/player'
import { useThemeStore, type ThemeMode } from '@/stores/theme'
import { useLibraryStore } from '@/stores/library'
import { useConnectionStore } from '@/stores/connection'

const playerStore = usePlayerStore()
const themeStore = useThemeStore()
const libraryStore = useLibraryStore()
const connectionStore = useConnectionStore()

const backendUrlInput = ref(connectionStore.backendUrl)

function saveBackendUrl() {
  const url = backendUrlInput.value.trim()
  if (url && url !== connectionStore.backendUrl) {
    connectionStore.setBackendUrl(url)
  }
}

const isRescanning = ref(false)
const rescanResult = ref<{
  music: { cleanedCount: number; scanStatus: string }
  comic: { cleanedCount: number; scanStatus: string }
  ebook: { cleanedCount: number; scanStatus: string }
  video: { cleanedCount: number; scanStatus: string }
} | null>(null)

const moduleLabels: Record<string, string> = {
  music: '音乐',
  comic: '漫画',
  ebook: '电子书',
  video: '视频',
}

const themeMode = computed({
  get: () => themeStore.mode,
  set: (value: ThemeMode) => themeStore.setMode(value),
})

const cachedTrackCount = computed(() => playerStore.downloadedTracks.size)

function toggleDownload() {
  playerStore.setDownloadEnabled(!playerStore.downloadEnabled)
}

function clearCache() {
  if (confirm('确定要清除所有缓存的歌曲吗？')) {
    playerStore.downloadedTracks = new Map()
    localStorage.removeItem('downloadedTracks')
  }
}

async function handleRescan() {
  if (isRescanning.value) return
  isRescanning.value = true
  rescanResult.value = null
  try {
    rescanResult.value = await libraryStore.rescan()
  } catch {
    alert('整理媒体库失败，请检查后端连接')
  } finally {
    isRescanning.value = false
  }
}
</script>

<style scoped>
.settings-view {
  padding: 24px 32px 80px;
  overflow-y: auto;
  height: 100%;
}

.settings-header {
  margin-bottom: 32px;
}

.settings-header h1 {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 700;
}

.settings-section {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  padding: 20px;
  margin-bottom: 20px;
}

.section-title {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: var(--text-muted);
  margin-bottom: 16px;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid var(--border);
}

.setting-item:last-child {
  border-bottom: none;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-label {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.item-description {
  font-size: 13px;
  color: var(--text-muted);
}

.theme-select {
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 8px 12px;
  font-size: 14px;
  color: var(--text-primary);
  cursor: pointer;
}

.toggle-switch {
  width: 44px;
  height: 24px;
  border-radius: 12px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  position: relative;
  cursor: pointer;
  transition: var(--transition);
}

.toggle-switch.active {
  background: var(--accent);
  border-color: var(--accent);
}

.toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: white;
  transition: var(--transition);
}

.toggle-switch.active .toggle-thumb {
  left: 22px;
}

.btn-clear {
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 8px 16px;
  font-size: 13px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: var(--transition);
}

.btn-clear:hover {
  background: var(--bg-hover);
  color: #ff6b6b;
  border-color: #ff6b6b;
}

.btn-rescan {
  background: var(--accent);
  border: none;
  border-radius: var(--radius-md);
  padding: 8px 16px;
  font-size: 13px;
  color: white;
  cursor: pointer;
  transition: var(--transition);
}

.btn-rescan:hover {
  opacity: 0.85;
}

.btn-rescan:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.url-input-group {
  display: flex;
  gap: 8px;
  align-items: center;
}

.url-input {
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 8px 12px;
  font-size: 14px;
  color: var(--text-primary);
  width: 280px;
  font-family: monospace;
  transition: var(--transition);
}

.url-input:focus {
  border-color: var(--accent);
  outline: none;
  box-shadow: 0 0 0 3px var(--accent-glow);
}

.btn-save {
  background: var(--accent);
  border: none;
  border-radius: var(--radius-md);
  padding: 8px 16px;
  font-size: 13px;
  color: white;
  cursor: pointer;
  transition: var(--transition);
  white-space: nowrap;
}

.btn-save:hover:not(:disabled) {
  opacity: 0.85;
}

.btn-save:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.rescan-result {
  padding: 12px 0 4px;
}

.result-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 13px;
}

.result-label {
  font-weight: 500;
  color: var(--text-primary);
}

.result-detail {
  color: var(--text-muted);
}
</style>
