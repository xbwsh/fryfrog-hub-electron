<template>
  <div class="comics-view">
    <div class="view-header">
      <div class="header-left">
        <h1>漫画</h1>
        <p class="view-subtitle">管理你的漫画库</p>
      </div>
      <div class="header-actions">
        <SearchBar v-model="searchQuery" placeholder="搜索漫画..." @input="handleSearch" />
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

    <div v-else class="content-grid">
      <div
        v-for="series in seriesList"
        :key="series.name"
        class="content-card"
        @click="viewSeries(series)"
      >
        <div class="card-cover">
          <img
            :src="getSeriesCoverUrlForSeries(series)"
            :alt="series.name"
            draggable="false"
            @error="onImageError"
          />
          <div class="card-badge" v-if="series.volumeCount">{{ series.volumeCount }} 卷</div>
          <div v-if="getSeriesProgress(series)" class="card-progress">
            <div class="card-progress-bar">
              <div class="card-progress-fill" :style="{ width: getSeriesProgress(series)!.percent + '%' }"></div>
            </div>
          </div>
        </div>
        <div class="card-info">
          <div class="card-title">{{ series.name }}</div>
          <div class="card-meta">
            <span v-if="series.author">{{ series.author }}</span>
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
import { getComicSeries, getComicProgress, getComicCoverUrl, getComicCoverUrlWithCache, getSeriesCoverUrl } from '@/api/backend'
import SearchBar from '@/components/SearchBar.vue'

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

function getSeriesCoverUrlForSeries(series: ComicSeries): string {
  if (series.coverUrl) return getSeriesCoverUrl(series.coverUrl)
  const first = series.comics[0]
  if (first) return getComicCoverUrlWithCache(first.id, first.updatedAt)
  return ''
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
  display: flex;
  align-items: center;
  gap: 8px;
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
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  grid-auto-rows: max-content;
  gap: 20px;
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

.content-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.card-cover {
  aspect-ratio: 3/4;
  overflow: hidden;
  position: relative;
  background: var(--bg-tertiary);
}

.card-cover img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.card-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.6);
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
}

.card-progress-bar {
  height: 3px;
  background: rgba(0, 0, 0, 0.3);
}

.card-progress-fill {
  height: 100%;
  background: var(--accent);
  transition: width 0.3s ease;
}

.card-info {
  padding: 12px;
}

.card-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-meta {
  font-size: 11px;
  color: var(--text-muted);
}
</style>
