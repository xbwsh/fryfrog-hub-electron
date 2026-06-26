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
      <div class="setting-item">
        <div class="item-info">
          <h3 class="item-label">显示服务器地址</h3>
          <p class="item-description">在侧边栏显示当前连接的服务器地址</p>
        </div>
        <button
          class="toggle-switch"
          :class="{ active: connectionStore.showServerAddress }"
          @click="connectionStore.setShowServerAddress(!connectionStore.showServerAddress)"
        >
          <span class="toggle-thumb"></span>
        </button>
      </div>
    </div>

    <div class="settings-section">
      <div class="section-title">TMDB</div>
      <div class="setting-item">
        <div class="item-info">
          <h3 class="item-label">API Key</h3>
          <p class="item-description">The Movie Database API 密钥</p>
        </div>
        <div class="url-input-group">
          <input
            v-model="tmdbApiKey"
            type="password"
            class="url-input"
            placeholder="输入 TMDB API Key"
            @blur="saveTmdbApiKey"
          />
        </div>
      </div>
      <div class="setting-item">
        <div class="item-info">
          <h3 class="item-label">语言</h3>
          <p class="item-description">TMDB 元数据语言</p>
        </div>
        <select v-model="tmdbLanguage" class="theme-select" @change="saveTmdbSetting('tmdb.language', tmdbLanguage)">
          <option value="zh-CN">简体中文</option>
          <option value="en-US">English</option>
          <option value="ja-JP">日本語</option>
        </select>
      </div>
      <div class="setting-item">
        <div class="item-info">
          <h3 class="item-label">图片尺寸</h3>
          <p class="item-description">TMDB 图片加载尺寸</p>
        </div>
        <select v-model="tmdbImageSize" class="theme-select" @change="saveTmdbSetting('tmdb.image-size', tmdbImageSize)">
          <option value="original">原始</option>
          <option value="w500">中等</option>
          <option value="w342">较小</option>
        </select>
      </div>
      <div class="setting-item">
        <div class="item-info">
          <h3 class="item-label">自动刮削</h3>
          <p class="item-description">扫描视频时自动从 TMDB 获取元数据</p>
        </div>
        <button
          class="toggle-switch"
          :class="{ active: tmdbAutoScrape }"
          @click="toggleTmdbSetting('tmdb.auto-scrape', tmdbAutoScrape)"
        >
          <span class="toggle-thumb"></span>
        </button>
      </div>
      <div class="setting-item">
        <div class="item-info">
          <h3 class="item-label">包含成人内容</h3>
          <p class="item-description">在搜索结果中包含成人内容</p>
        </div>
        <button
          class="toggle-switch"
          :class="{ active: tmdbIncludeAdult }"
          @click="toggleTmdbSetting('tmdb.include-adult', tmdbIncludeAdult)"
        >
          <span class="toggle-thumb"></span>
        </button>
      </div>
      <div class="setting-item">
        <div class="item-info">
          <h3 class="item-label">最低评分</h3>
          <p class="item-description">自动刮削时的最低评分阈值 ({{ tmdbMinScore }})</p>
        </div>
        <input
          v-model.number="tmdbMinScore"
          type="range"
          class="range-input"
          min="0"
          max="10"
          step="0.5"
          @change="saveTmdbSetting('tmdb.min-score', String(tmdbMinScore))"
        />
      </div>
    </div>

    <div class="settings-section">
      <div class="section-title">代理</div>
      <div class="setting-item">
        <div class="item-info">
          <h3 class="item-label">地址</h3>
          <p class="item-description">代理服务器地址（修改后需重启）</p>
        </div>
        <input
          v-model="proxyHost"
          type="text"
          class="url-input"
          placeholder="127.0.0.1"
          @blur="saveProxySetting('proxy.host', proxyHost)"
        />
      </div>
      <div class="setting-item">
        <div class="item-info">
          <h3 class="item-label">端口</h3>
          <p class="item-description">代理服务器端口（修改后需重启）</p>
        </div>
        <input
          v-model.number="proxyPort"
          type="number"
          class="url-input"
          placeholder="7890"
          @blur="saveProxySetting('proxy.port', String(proxyPort))"
        />
      </div>
    </div>

    <div class="settings-section">
      <div class="section-title">漫画</div>
      <div class="setting-item">
        <div class="item-info">
          <h3 class="item-label">自动刮削</h3>
          <p class="item-description">扫描漫画时自动从 Bangumi/AniList 获取元数据</p>
        </div>
        <button
          class="toggle-switch"
          :class="{ active: comicAutoScrape }"
          @click="toggleComicSetting('comic.auto-scrape', comicAutoScrape)"
        >
          <span class="toggle-thumb"></span>
        </button>
      </div>
      <div class="setting-item">
        <div class="item-info">
          <h3 class="item-label">最低评分</h3>
          <p class="item-description">漫画刮削最低评分 ({{ comicMinScore }})</p>
        </div>
        <input
          v-model.number="comicMinScore"
          type="range"
          class="range-input"
          min="0"
          max="10"
          step="0.5"
          @change="saveComicSetting('comic.min-score', String(comicMinScore))"
        />
      </div>
      <div class="setting-item">
        <div class="item-info">
          <h3 class="item-label">AniList 自动刮削</h3>
          <p class="item-description">扫描漫画时自动从 AniList 获取元数据</p>
        </div>
        <button
          class="toggle-switch"
          :class="{ active: anilistAutoScrape }"
          @click="toggleAnilistSetting('anilist.auto-scrape', anilistAutoScrape)"
        >
          <span class="toggle-thumb"></span>
        </button>
      </div>
      <div class="setting-item">
        <div class="item-info">
          <h3 class="item-label">AniList 最低评分</h3>
          <p class="item-description">AniList 自动刮削最低评分 ({{ anilistMinScore }})</p>
        </div>
        <input
          v-model.number="anilistMinScore"
          type="range"
          class="range-input"
          min="0"
          max="10"
          step="0.5"
          @change="saveAnilistSetting('anilist.min-score', String(anilistMinScore))"
        />
      </div>
    </div>

    <div class="settings-section">
      <div class="section-title">音乐</div>
      <div class="setting-item">
        <div class="item-info">
          <h3 class="item-label">刮削总开关</h3>
          <p class="item-description">启用或禁用音乐刮削功能</p>
        </div>
        <button
          class="toggle-switch"
          :class="{ active: musicScrapeEnabled }"
          @click="toggleMusicSetting('music.scrape.enabled', musicScrapeEnabled)"
        >
          <span class="toggle-thumb"></span>
        </button>
      </div>
      <div class="setting-item">
        <div class="item-info">
          <h3 class="item-label">自动刮削</h3>
          <p class="item-description">扫描音乐时自动刮削歌词和封面</p>
        </div>
        <button
          class="toggle-switch"
          :class="{ active: musicAutoScrape }"
          @click="toggleMusicSetting('music.scrape.auto-scrape', musicAutoScrape)"
        >
          <span class="toggle-thumb"></span>
        </button>
      </div>
      <div class="setting-item">
        <div class="item-info">
          <h3 class="item-label">元数据回写</h3>
          <p class="item-description">将刮削到的元数据写回音频文件</p>
        </div>
        <button
          class="toggle-switch"
          :class="{ active: musicAutoWriteback }"
          @click="toggleMusicSetting('music.auto-writeback', musicAutoWriteback)"
        >
          <span class="toggle-thumb"></span>
        </button>
      </div>
      <div class="setting-item">
        <div class="item-info">
          <h3 class="item-label">按文件夹整理</h3>
          <p class="item-description">按艺术家文件夹结构整理音乐</p>
        </div>
        <button
          class="toggle-switch"
          :class="{ active: musicUseFolderStructure }"
          @click="toggleMusicSetting('music.use-folder-structure', musicUseFolderStructure)"
        >
          <span class="toggle-thumb"></span>
        </button>
      </div>
      <div class="setting-item">
        <div class="item-info">
          <h3 class="item-label">未知艺术家名</h3>
          <p class="item-description">未知艺术家的默认显示名称</p>
        </div>
        <input
          v-model="musicDefaultArtist"
          type="text"
          class="url-input"
          placeholder="未知艺术家"
          @blur="saveMusicSetting('music.default-artist', musicDefaultArtist)"
        />
      </div>
      <div class="setting-item">
        <div class="item-info">
          <h3 class="item-label">歌词源回退</h3>
          <p class="item-description">主歌词源失败时尝试其他源</p>
        </div>
        <button
          class="toggle-switch"
          :class="{ active: musicLyricsFallback }"
          @click="toggleMusicSetting('music.scrape.lyrics-fallback', musicLyricsFallback)"
        >
          <span class="toggle-thumb"></span>
        </button>
      </div>
      <div class="setting-item">
        <div class="item-info">
          <h3 class="item-label">封面源回退</h3>
          <p class="item-description">主封面源失败时尝试其他源</p>
        </div>
        <button
          class="toggle-switch"
          :class="{ active: musicCoverFallback }"
          @click="toggleMusicSetting('music.scrape.cover-fallback', musicCoverFallback)"
        >
          <span class="toggle-thumb"></span>
        </button>
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
          <h3 class="item-label">定时扫描</h3>
          <p class="item-description">macOS 用户建议开启，每 60 秒自动扫描文件变更</p>
        </div>
        <button
          class="toggle-switch"
          :class="{ active: periodicScan }"
          @click="toggleWatcherSetting('watcher.periodic-scan', periodicScan)"
        >
          <span class="toggle-thumb"></span>
        </button>
      </div>
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
        <pre class="result-text">{{ rescanResult }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { usePlayerStore } from '@/stores/player'
import { useThemeStore, type ThemeMode } from '@/stores/theme'
import { useLibraryStore } from '@/stores/library'
import { useConnectionStore } from '@/stores/connection'
import {
  getSetting,
  updateSetting,
} from '@/api/backend'

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
const rescanResult = ref<string | null>(null)

const themeMode = computed({
  get: () => themeStore.mode,
  set: (value: ThemeMode) => themeStore.setMode(value),
})

const cachedTrackCount = computed(() => playerStore.downloadedTracks.size)

// TMDB settings
const tmdbApiKey = ref('')
const tmdbLanguage = ref('zh-CN')
const tmdbImageSize = ref('original')
const tmdbAutoScrape = ref(false)
const tmdbIncludeAdult = ref(true)
const tmdbMinScore = ref(0)

// Proxy settings
const proxyHost = ref('')
const proxyPort = ref(0)

// Anilist settings
const anilistAutoScrape = ref(false)
const anilistMinScore = ref(0)

// Comic settings
const comicAutoScrape = ref(false)
const comicMinScore = ref(0)

// Music settings
const musicScrapeEnabled = ref(true)
const musicAutoScrape = ref(false)
const musicAutoWriteback = ref(true)
const musicUseFolderStructure = ref(true)
const musicDefaultArtist = ref('')
const musicLyricsFallback = ref(true)
const musicCoverFallback = ref(true)

// Watcher settings
const periodicScan = ref(false)

async function loadSettings() {
  try {
    const settings = await Promise.all([
      getSetting('tmdb.api-key'),
      getSetting('tmdb.language'),
      getSetting('tmdb.image-size'),
      getSetting('tmdb.auto-scrape'),
      getSetting('tmdb.include-adult'),
      getSetting('tmdb.min-score'),
      getSetting('proxy.host'),
      getSetting('proxy.port'),
      getSetting('anilist.auto-scrape'),
      getSetting('anilist.min-score'),
      getSetting('comic.auto-scrape'),
      getSetting('comic.min-score'),
      getSetting('music.scrape.enabled'),
      getSetting('music.scrape.auto-scrape'),
      getSetting('music.auto-writeback'),
      getSetting('music.use-folder-structure'),
      getSetting('music.default-artist'),
      getSetting('music.scrape.lyrics-fallback'),
      getSetting('music.scrape.cover-fallback'),
      getSetting('watcher.periodic-scan'),
    ])

    if (settings[0]) tmdbApiKey.value = settings[0].value
    if (settings[1]) tmdbLanguage.value = settings[1].value
    if (settings[2]) tmdbImageSize.value = settings[2].value
    if (settings[3]) tmdbAutoScrape.value = settings[3].value === 'true'
    if (settings[4]) tmdbIncludeAdult.value = settings[4].value === 'true'
    if (settings[5]) tmdbMinScore.value = parseFloat(settings[5].value) || 0
    if (settings[6]) proxyHost.value = settings[6].value
    if (settings[7]) proxyPort.value = parseInt(settings[7].value) || 0
    if (settings[8]) anilistAutoScrape.value = settings[8].value === 'true'
    if (settings[9]) anilistMinScore.value = parseFloat(settings[9].value) || 0
    if (settings[10]) comicAutoScrape.value = settings[10].value === 'true'
    if (settings[11]) comicMinScore.value = parseFloat(settings[11].value) || 0
    if (settings[12]) musicScrapeEnabled.value = settings[12].value !== 'false'
    if (settings[13]) musicAutoScrape.value = settings[13].value === 'true'
    if (settings[14]) musicAutoWriteback.value = settings[14].value !== 'false'
    if (settings[15]) musicUseFolderStructure.value = settings[15].value !== 'false'
    if (settings[16]) musicDefaultArtist.value = settings[16].value
    if (settings[17]) musicLyricsFallback.value = settings[17].value !== 'false'
    if (settings[18]) musicCoverFallback.value = settings[18].value !== 'false'
    if (settings[19]) periodicScan.value = settings[19].value === 'true'
  } catch (error) {
    console.error('Failed to load settings:', error)
  }
}

async function saveTmdbApiKey() {
  if (tmdbApiKey.value) {
    await updateSetting('tmdb.api-key', tmdbApiKey.value)
  }
}

async function saveTmdbSetting(key: string, value: string) {
  await updateSetting(key, value)
}

async function toggleTmdbSetting(key: string, currentValue: boolean) {
  const newValue = !currentValue
  await updateSetting(key, String(newValue))
  if (key === 'tmdb.auto-scrape') tmdbAutoScrape.value = newValue
  if (key === 'tmdb.include-adult') tmdbIncludeAdult.value = newValue
}

async function saveProxySetting(key: string, value: string) {
  await updateSetting(key, value)
}

async function saveAnilistSetting(key: string, value: string) {
  await updateSetting(key, value)
}

async function toggleAnilistSetting(key: string, currentValue: boolean) {
  const newValue = !currentValue
  await updateSetting(key, String(newValue))
  if (key === 'anilist.auto-scrape') anilistAutoScrape.value = newValue
}

async function saveComicSetting(key: string, value: string) {
  await updateSetting(key, value)
}

async function toggleComicSetting(key: string, currentValue: boolean) {
  const newValue = !currentValue
  await updateSetting(key, String(newValue))
  if (key === 'comic.auto-scrape') comicAutoScrape.value = newValue
}

async function saveMusicSetting(key: string, value: string) {
  await updateSetting(key, value)
}

async function toggleMusicSetting(key: string, currentValue: boolean) {
  const newValue = !currentValue
  await updateSetting(key, String(newValue))
  if (key === 'music.scrape.enabled') musicScrapeEnabled.value = newValue
  if (key === 'music.scrape.auto-scrape') musicAutoScrape.value = newValue
  if (key === 'music.auto-writeback') musicAutoWriteback.value = newValue
  if (key === 'music.use-folder-structure') musicUseFolderStructure.value = newValue
  if (key === 'music.scrape.lyrics-fallback') musicLyricsFallback.value = newValue
  if (key === 'music.scrape.cover-fallback') musicCoverFallback.value = newValue
}

function toggleDownload() {
  playerStore.setDownloadEnabled(!playerStore.downloadEnabled)
}

function clearCache() {
  if (confirm('确定要清除所有缓存的歌曲吗？')) {
    playerStore.downloadedTracks = new Map()
    localStorage.removeItem('downloadedTracks')
  }
}

async function toggleWatcherSetting(key: string, currentValue: boolean) {
  const newValue = !currentValue
  await updateSetting(key, String(newValue))
  if (key === 'watcher.periodic-scan') periodicScan.value = newValue
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

onMounted(() => {
  loadSettings()
})
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

.result-text {
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--text-secondary);
  white-space: pre-wrap;
  margin: 0;
}

.range-input {
  -webkit-appearance: none;
  appearance: none;
  width: 120px;
  height: 4px;
  background: var(--bg-tertiary);
  border-radius: 2px;
  outline: none;
}

.range-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--accent);
  cursor: pointer;
}

.range-input::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--accent);
  cursor: pointer;
  border: none;
}
</style>
