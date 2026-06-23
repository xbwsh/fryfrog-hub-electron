<template>
  <div class="backend-view">
    <div class="view-header">
      <h1>音乐库</h1>
      <div class="search-bar">
        <input v-model="searchQuery" type="text" placeholder="搜索音乐..." @input="handleSearch" />
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
      <div v-for="track in tracks" :key="track.id" class="track-item" @click="playTrack(track)">
        <div class="track-info">
          <div class="track-title">{{ track.title }}</div>
          <div class="track-artist">{{ track.artist }}</div>
          <div class="track-album">{{ track.album }}</div>
        </div>
        <div class="track-duration">{{ formatDuration(track.durationSeconds) }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { MusicTrack } from '@/types/backend'
import { getAllTracks, searchMusic } from '@/api/backend'
import { usePlayerStore } from '@/stores/player'

const playerStore = usePlayerStore()
const tracks = ref<MusicTrack[]>([])
const searchQuery = ref('')
const loading = ref(false)
const error = ref('')

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

function playTrack(track: MusicTrack) {
  playerStore.playTrack(track, tracks.value)
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

onMounted(loadTracks)
</script>

<style scoped>
.backend-view {
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.view-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.search-bar input {
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 10px 16px;
  font-size: 14px;
  color: var(--text-primary);
  width: 300px;
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
  to {
    transform: rotate(360deg);
  }
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
}

.track-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition);
}

.track-item:hover {
  background: var(--bg-hover);
}

.track-info {
  flex: 1;
  min-width: 0;
}

.track-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.track-artist,
.track-album {
  font-size: 13px;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.track-duration {
  font-size: 13px;
  color: var(--text-secondary);
  margin-left: 16px;
}
</style>
