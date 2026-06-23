<template>
  <div class="comics-view">
    <div class="view-header">
      <div class="header-left">
        <h1>📚 漫画</h1>
        <p class="view-subtitle">管理你的漫画库</p>
      </div>
      <div class="header-actions">
        <div class="search-bar">
          <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input v-model="searchQuery" type="text" placeholder="搜索漫画..." @input="handleSearch" />
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="loadComics">重试</button>
    </div>

    <div v-else-if="seriesList.length === 0" class="empty-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
      </svg>
      <p>暂无漫画</p>
    </div>

    <div v-else class="series-list">
      <div
        v-for="series in seriesList"
        :key="series.name"
        class="series-group"
      >
        <div
          class="series-header"
          @click="viewSeries(series)"
        >
          <div class="series-cover">
            <img
              :src="getSeriesCoverUrl(series.coverArtPath)"
              :alt="series.name"
              @error="onImageError"
            />
          </div>
          <div class="series-info">
            <h3 class="series-name">{{ series.name }}</h3>
            <p class="series-meta">{{ series.author }} · {{ series.volumeCount }} 卷</p>
            <div v-if="getSeriesProgress(series)" class="series-progress">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: getSeriesProgress(series)!.percent + '%' }"></div>
              </div>
              <span class="progress-text">{{ getSeriesProgress(series)!.text }}</span>
            </div>
          </div>
          <div class="series-arrow">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { ComicSeries } from '@/types/backend'
import { getComicSeries, getComicProgress } from '@/api/backend'

const router = useRouter()
const seriesList = ref<ComicSeries[]>([])
const loading = ref(false)
const error = ref('')
const searchQuery = ref('')
const seriesProgressMap = ref<Map<string, { percent: number; text: string }>>(new Map())

async function loadComics() {
  loading.value = true
  error.value = ''
  try {
    seriesList.value = await getComicSeries()
    await loadAllSeriesProgress()
  } catch (e) {
    error.value = '加载漫画失败'
    console.error('Failed to load comics:', e)
  } finally {
    loading.value = false
  }
}

async function loadAllSeriesProgress() {
  const map = new Map<string, { percent: number; text: string }>()
  for (const series of seriesList.value) {
    let totalProgress = 0
    let count = 0
    let lastText = ''
    for (const comic of series.comics) {
      try {
        const progress = await getComicProgress(comic.id)
        if (progress && !progress.completed) {
          totalProgress += progress.progressPercent
          count++
          lastText = `第${progress.currentPage}页 ${Math.round(progress.progressPercent)}%`
        }
      } catch {
        // ignore
      }
    }
    if (count > 0) {
      map.set(series.name, {
        percent: Math.round(totalProgress / count),
        text: `${count}本阅读中 · ${lastText}`
      })
    }
  }
  seriesProgressMap.value = map
}

function getSeriesProgress(series: ComicSeries): { percent: number; text: string } | undefined {
  return seriesProgressMap.value.get(series.name)
}

async function handleSearch() {
  if (!searchQuery.value.trim()) {
    await loadComics()
    return
  }
  loading.value = true
  error.value = ''
  try {
    const allSeries = await getComicSeries()
    const query = searchQuery.value.toLowerCase()
    seriesList.value = allSeries.filter(s =>
      s.name.toLowerCase().includes(query) ||
      s.author.toLowerCase().includes(query)
    )
  } catch (e) {
    error.value = '搜索失败'
    console.error('Search failed:', e)
  } finally {
    loading.value = false
  }
}

function viewSeries(series: ComicSeries) {
  router.push({ name: 'comic-series', params: { name: series.name } })
}

function getSeriesCoverUrl(coverPath: string): string {
  if (!coverPath) return ''
  if (coverPath.startsWith('http')) return coverPath
  return `/api/v1/comic/cover-image?path=${encodeURIComponent(coverPath)}`
}

function onImageError(e: Event) {
  const img = e.target as HTMLImageElement
  img.style.display = 'none'
}

onMounted(loadComics)
</script>

<style scoped>
.comics-view {
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

.series-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 32px 32px;
}

.series-group {
  margin-bottom: 24px;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.series-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  cursor: pointer;
  transition: var(--transition);
}

.series-header:hover {
  background: var(--bg-hover);
}

.series-header:hover .series-arrow {
  color: var(--accent);
}

.series-cover {
  width: 50px;
  height: 68px;
  border-radius: var(--radius-md);
  overflow: hidden;
  flex-shrink: 0;
  background: linear-gradient(135deg, #3498db, #2980b9);
}

.series-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.series-info {
  flex: 1;
  min-width: 0;
}

.series-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.series-meta {
  font-size: 12px;
  color: var(--text-muted);
  margin: 0;
}

.series-progress {
  margin-top: 6px;
}

.progress-bar {
  height: 3px;
  background: var(--border);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 4px;
}

.progress-fill {
  height: 100%;
  background: var(--accent);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 10px;
  color: var(--text-muted);
}

.series-arrow {
  color: var(--text-muted);
  flex-shrink: 0;
}


</style>
