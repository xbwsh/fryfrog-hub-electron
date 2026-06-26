<template>
  <div class="videos-view">
    <div class="view-header">
      <div class="header-left">
        <h1>视频</h1>
        <p class="view-subtitle">管理你的视频库</p>
      </div>
      <div class="header-actions">
        <button class="view-toggle" :title="displayMode === 'landscape' ? '切换为竖屏' : '切换为横屏'" @click="toggleDisplayMode">
          <svg v-if="displayMode === 'landscape'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="3" width="20" height="14" rx="2"/>
            <line x1="8" y1="21" x2="16" y2="21"/>
            <line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="5" y="2" width="14" height="20" rx="2"/>
            <line x1="12" y1="18" x2="12" y2="18.01"/>
          </svg>
        </button>
        <SearchBar v-model="searchQuery" placeholder="搜索视频..." @input="handleSearch" />
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="loadVideos">重试</button>
    </div>

    <div v-else-if="seriesList.length === 0" class="empty-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
        <line x1="7" y1="2" x2="7" y2="22"/>
        <line x1="17" y1="2" x2="17" y2="22"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
      </svg>
      <p>暂无视频</p>
    </div>

    <div v-else class="content-grid" :class="{ 'portrait-mode': displayMode === 'portrait' }">
      <div v-for="series in seriesList" :key="series.id" class="content-card" @click="viewSeries(series)">
        <div class="card-cover video-cover">
          <img :src="displayMode === 'landscape' ? (series.backdropUrl || getSeriesFanartUrl(series.id)) : (series.posterUrl || getSeriesPosterUrl(series.id))" :alt="series.title" draggable="false" @error="onImageError" />
          <div class="play-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
          </div>
          <div class="card-badge" v-if="series.episodes && series.episodes.length > 0">{{ series.episodes.length }} 集</div>
          <div v-if="getSeriesProgress(series) > 0" class="card-progress">
            <div class="card-progress-bar">
              <div class="card-progress-fill" :style="{ width: Math.min(getSeriesProgress(series), 100) + '%' }"></div>
            </div>
          </div>
          <div v-if="isSeriesWatched(series)" class="card-watched-badge">已看完</div>
        </div>
        <div class="card-info">
          <div class="card-title">{{ series.title }}</div>
          <div class="card-meta">
            <span v-if="series.year">{{ series.year }}</span>
            <span v-if="series.episodes && series.episodes.length > 0" class="meta-sep">·</span>
            <span v-if="series.episodes && series.episodes.length > 0">{{ series.episodes.length }} 集</span>
          </div>
          <div class="card-overview" v-if="series.overview">{{ series.overview }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { SeriesDTO } from '@/types/backend'
import { getAllSeries, getSeriesPosterUrl, getSeriesFanartUrl } from '@/api/backend'
import SearchBar from '@/components/SearchBar.vue'

const router = useRouter()
const seriesList = ref<SeriesDTO[]>([])
const loading = ref(false)
const error = ref('')
const searchQuery = ref('')
const displayMode = ref<'landscape' | 'portrait'>(localStorage.getItem('fryfrog-video-display-mode') as 'landscape' | 'portrait' || 'landscape')

function toggleDisplayMode() {
  displayMode.value = displayMode.value === 'landscape' ? 'portrait' : 'landscape'
  localStorage.setItem('fryfrog-video-display-mode', displayMode.value)
}

async function loadVideos() {
  loading.value = true
  error.value = ''
  try {
    seriesList.value = await getAllSeries()
  } catch (e) {
    error.value = '加载视频失败'
    console.error('Failed to load videos:', e)
  } finally {
    loading.value = false
  }
}

async function handleSearch() {
  if (!searchQuery.value.trim()) {
    await loadVideos()
    return
  }
  loading.value = true
  error.value = ''
  try {
    const allSeries = await getAllSeries()
    seriesList.value = allSeries.filter(s =>
      s.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (s.originalTitle && s.originalTitle.toLowerCase().includes(searchQuery.value.toLowerCase()))
    )
  } catch (e) {
    error.value = '搜索失败'
    console.error('Search failed:', e)
  } finally {
    loading.value = false
  }
}

function onImageError(e: Event) {
  const img = e.target as HTMLImageElement
  img.style.display = 'none'
}

function viewSeries(series: SeriesDTO) {
  if (series.episodes && series.episodes.length > 0) {
    router.push({ name: 'video-detail', params: { id: series.episodes[0].id } })
  }
}

function getSeriesProgress(series: SeriesDTO): number {
  if (!series.episodes || series.episodes.length === 0) return 0
  const totalProgress = series.episodes.reduce((sum, ep) => sum + (ep.watchProgressPercent || 0), 0)
  return totalProgress / series.episodes.length
}

function isSeriesWatched(series: SeriesDTO): boolean {
  if (!series.episodes || series.episodes.length === 0) return false
  return series.episodes.every(ep => ep.watched)
}

onMounted(loadVideos)
</script>

<style scoped>
.videos-view {
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
  gap: 16px;
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

.view-toggle {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--transition);
  flex-shrink: 0;
}

.view-toggle:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
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

.empty-state svg {
  color: var(--text-muted);
  opacity: 0.5;
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

.content-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  grid-auto-rows: max-content;
  gap: 16px;
  padding: 0 32px 80px;
  overflow-y: auto;
}

.content-card {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: pointer;
  transition: var(--transition);
  min-width: 0;
}

.card-cover {
  aspect-ratio: 16/9;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.6);
  overflow: hidden;
  position: relative;
}

.card-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-cover {
  background: linear-gradient(135deg, #9b59b6, #8e44ad);
}

.play-icon {
  position: absolute;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transition: var(--transition);
}

.content-card:hover .play-icon {
  opacity: 1;
}

.favorite-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: var(--transition);
}

.content-card:hover .favorite-btn {
  opacity: 1;
}

.favorite-btn.active {
  opacity: 1;
  color: #ff6b6b;
  background: rgba(0, 0, 0, 0.5);
}

.favorite-btn:hover {
  transform: scale(1.1);
}

.card-badge {
  position: absolute;
  bottom: 8px;
  left: 8px;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  color: white;
  font-size: 11px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 12px;
}

.card-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0 8px 8px;
}

.card-progress-bar {
  height: 3px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  overflow: hidden;
}

.card-progress-fill {
  height: 100%;
  background: var(--accent);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.card-watched-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  background: rgba(46, 204, 113, 0.8);
  backdrop-filter: blur(4px);
  color: white;
  font-size: 11px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 12px;
}

.card-info {
  padding: 12px;
  overflow: hidden;
}

.content-card:hover .card-info {
  overflow-x: auto;
  scrollbar-width: none;
}

.content-card:hover .card-info::-webkit-scrollbar {
  display: none;
}

.card-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: default;
}

.content-card:hover .card-title {
  overflow-x: auto;
  scrollbar-width: none;
}

.content-card:hover .card-title::-webkit-scrollbar {
  display: none;
}

.card-meta {
  font-size: 12px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.meta-sep {
  margin: 0 4px;
}

.card-overview {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

.portrait-mode .content-grid {
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
}

.portrait-mode .card-cover {
  aspect-ratio: 2 / 3;
}

.portrait-mode .card-overview {
  -webkit-line-clamp: 3;
}
</style>
