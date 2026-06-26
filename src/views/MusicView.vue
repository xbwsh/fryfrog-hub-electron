<template>
  <div class="music-view">
    <div class="view-header">
      <div class="header-left">
        <h1>音乐</h1>
        <p class="view-subtitle">管理你的音乐库</p>
      </div>
      <div class="header-actions">
        <SearchBar v-model="searchQuery" placeholder="搜索音乐..." @input="handleSearch" />
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="loadTracks">重试</button>
    </div>

    <div v-else-if="tracks.length === 0" class="empty-state">
      <p>暂无音乐</p>
    </div>

    <div v-else class="track-list">
      <div
        v-for="track in tracks"
        :key="track.id"
        class="track-item"
        :class="{ active: playerStore.currentTrack?.id === track.id }"
        @click="playTrack(track)"
        @contextmenu="onContextMenu($event, track)"
      >
        <div class="track-cover-small">
          <img :src="getMusicCoverArtUrl(track.id)" alt="封面" draggable="false" />
        </div>
        <div class="track-playing" v-if="playerStore.currentTrack?.id === track.id && playerStore.isPlaying">
          <div class="eq-bar"></div>
          <div class="eq-bar"></div>
          <div class="eq-bar"></div>
        </div>
        <div class="track-index" v-else>{{ tracks.indexOf(track) + 1 }}</div>
        <div class="track-info">
          <div class="track-title">{{ track.title }}</div>
          <div class="track-artist">{{ track.artist }} - {{ track.album }}</div>
        </div>
        <div class="track-duration">{{ formatDuration(track.durationSeconds) }}</div>
      </div>
    </div>

    <MusicPlayerBar @toggle-lyrics="showLyrics = !showLyrics" />

    <transition name="lyrics-fade">
      <div class="lyrics-overlay" v-show="showLyrics">
        <LyricsPanel @close="showLyrics = false" />
      </div>
    </transition>

    <Teleport to="body">
      <div
        v-if="contextMenu.visible"
        class="context-menu"
        :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
        @click.stop
      >
        <div class="context-menu-item" @click="handleScrape">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          {{ scrapingId === contextMenu.trackId ? '刮削中...' : '刮削元数据' }}
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { MusicTrack } from '@/types/backend'
import { getAllTracks, getMusicCoverArtUrl, scrapeTrack, searchMusic } from '@/api/backend'
import { usePlayerStore } from '@/stores/player'
import MusicPlayerBar from '@/components/MusicPlayerBar.vue'
import LyricsPanel from '@/components/LyricsPanel.vue'
import SearchBar from '@/components/SearchBar.vue'

const playerStore = usePlayerStore()
const tracks = ref<MusicTrack[]>([])
const loading = ref(false)
const error = ref('')
const showLyrics = ref(false)
const scrapingId = ref<number | null>(null)
const searchQuery = ref('')

const contextMenu = ref({ visible: false, x: 0, y: 0, trackId: 0 })

function onContextMenu(e: MouseEvent, track: MusicTrack) {
  e.preventDefault()
  contextMenu.value = { visible: true, x: e.clientX, y: e.clientY, trackId: track.id }
}

function closeContextMenu() {
  contextMenu.value = { ...contextMenu.value, visible: false }
}

async function handleScrape() {
  const id = contextMenu.value.trackId
  closeContextMenu()
  if (scrapingId.value !== null) return
  scrapingId.value = id
  try {
    const updated = await scrapeTrack(id)
    if (updated) {
      const idx = tracks.value.findIndex(t => t.id === id)
      if (idx !== -1) tracks.value[idx] = updated
    }
  } catch (e) {
    console.error('Scrape failed:', e)
  } finally {
    scrapingId.value = null
  }
}

async function handleSearch() {
  if (!searchQuery.value.trim()) {
    await loadTracks()
    return
  }
  loading.value = true
  error.value = ''
  try {
    tracks.value = await searchMusic(searchQuery.value)
  } catch (e) {
    error.value = '搜索失败'
    console.error('Search failed:', e)
  } finally {
    loading.value = false
  }
}

async function loadTracks() {
  loading.value = true
  error.value = ''
  try {
    tracks.value = await getAllTracks()
  } catch (e) {
    error.value = '加载音乐失败'
    console.error('Failed to load tracks:', e)
  } finally {
    loading.value = false
  }
}

function playTrack(track: MusicTrack) {
  playerStore.playTrack(track, tracks.value)
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

onMounted(() => {
  loadTracks()
  document.addEventListener('click', closeContextMenu)
})
onUnmounted(() => {
  document.removeEventListener('click', closeContextMenu)
})
</script>

<style scoped>
.music-view {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.view-header {
  padding: 24px 32px 16px;
  flex-shrink: 0;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.header-left {
  flex: 1;
}

.view-header h1 {
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 4px;
}

.view-subtitle {
  color: var(--text-secondary);
  font-size: 14px;
}

.header-actions {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.scan-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 8px 16px;
  font-size: 14px;
  color: var(--text-primary);
  cursor: pointer;
  transition: var(--transition);
  flex-shrink: 0;
  height: 36px;
  box-sizing: border-box;
}

.scan-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.search-bar {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: var(--text-muted);
  pointer-events: none;
}

.search-bar input {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 8px 12px 8px 36px;
  font-size: 14px;
  color: var(--text-primary);
  width: 240px;
  height: 36px;
  box-sizing: border-box;
  transition: var(--transition);
}

.search-bar input:focus {
  border-color: var(--accent);
  outline: none;
  box-shadow: 0 0 0 3px var(--accent-glow);
}

.loading-state,
.error-state,
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: var(--text-secondary);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-state button {
  background: var(--accent);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
}

.error-state button:hover {
  background: var(--accent-hover);
}

.track-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 16px 80px;
}

.track-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  margin-bottom: 4px;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition);
}

.track-item:hover {
  background: var(--bg-hover);
}

.track-item.active {
  background: var(--accent-glow);
}

.track-cover-small {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  flex-shrink: 0;
  background: var(--bg-tertiary);
}

.track-cover-small img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.track-playing {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  width: 24px;
  height: 16px;
}

.eq-bar {
  width: 3px;
  background: var(--accent);
  border-radius: 1px;
  animation: eq 0.5s ease-in-out infinite alternate;
}

.eq-bar:nth-child(1) { height: 8px; animation-delay: 0s; }
.eq-bar:nth-child(2) { height: 12px; animation-delay: 0.15s; }
.eq-bar:nth-child(3) { height: 6px; animation-delay: 0.3s; }

@keyframes eq {
  0% { height: 4px; }
  100% { height: 14px; }
}

.track-index {
  width: 24px;
  font-size: 13px;
  color: var(--text-muted);
  text-align: center;
  flex-shrink: 0;
}

.track-item:hover .track-index {
  color: var(--accent);
}

.track-info {
  flex: 1;
  min-width: 0;
}

.track-title {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.track-item.active .track-title {
  color: var(--accent);
}

.track-artist {
  font-size: 13px;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.track-duration {
  font-size: 13px;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.lyrics-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #000;
  z-index: 100;
  display: flex;
  flex-direction: column;
}

.lyrics-fade-enter-active,
.lyrics-fade-leave-active {
  transition: all 0.3s ease;
}

.lyrics-fade-enter-from,
.lyrics-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.lyrics-fade-enter-to,
.lyrics-fade-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.context-menu {
  position: fixed;
  z-index: 200;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 4px;
  min-width: 160px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.context-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  font-size: 13px;
  color: var(--text-primary);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: var(--transition);
}

.context-menu-item:hover {
  background: var(--bg-hover);
}
</style>
