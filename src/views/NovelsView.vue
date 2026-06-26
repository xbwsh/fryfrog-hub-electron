<template>
  <div class="ebooks-view">
    <div class="view-header">
      <div class="header-left">
        <h1>电子书</h1>
        <p class="view-subtitle">管理你的电子书库</p>
      </div>
      <div class="header-actions">
        <SearchBar v-model="searchQuery" placeholder="搜索电子书..." @input="handleSearch" />
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="loadEbooks">重试</button>
    </div>

    <div v-else-if="seriesList.length === 0" class="empty-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
      <p>暂无电子书</p>
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
              draggable="false"
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

    <EbookReader
      v-if="readingBook"
      :ebook-id="readingBook.id"
      :ebook-title="readingBook.title"
      :ebook-file-path="readingBook.filePath"
      @close="readingBook = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Ebook, EbookSeries } from '@/types/backend'
import { getEbookSeries, getEbookProgress } from '@/api/backend'
import EbookReader from '@/views/EbookReader.vue'
import SearchBar from '@/components/SearchBar.vue'

const route = useRoute()
const router = useRouter()
const seriesList = ref<EbookSeries[]>([])
const loading = ref(false)
const error = ref('')
const searchQuery = ref('')
const readingBook = ref<Ebook | null>(null)
const seriesProgressMap = ref<Map<string, { percent: number; text: string }>>(new Map())

async function loadEbooks() {
  loading.value = true
  error.value = ''
  try {
    seriesList.value = await getEbookSeries()
    await loadAllSeriesProgress()
  } catch (e) {
    error.value = '加载电子书失败'
    console.error('Failed to load ebooks:', e)
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
    for (const book of series.books) {
      try {
        const progress = await getEbookProgress(book.id)
        if (progress && !progress.completed) {
          totalProgress += progress.chapterProgressPercent
          count++
          lastText = `第${progress.currentChapter}章 ${Math.round(progress.chapterProgressPercent)}%`
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

function getSeriesProgress(series: EbookSeries): { percent: number; text: string } | undefined {
  return seriesProgressMap.value.get(series.name)
}

async function checkAutoOpen() {
  const readId = route.query.read
  if (readId && !readingBook.value) {
    for (const series of seriesList.value) {
      const book = series.books.find(b => b.id === parseInt(String(readId)))
      if (book) {
        readingBook.value = book
        break
      }
    }
  }
}

async function handleSearch() {
  if (!searchQuery.value.trim()) {
    await loadEbooks()
    return
  }
  loading.value = true
  error.value = ''
  try {
    const allSeries = await getEbookSeries()
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

function viewSeries(series: EbookSeries) {
  router.push({ name: 'ebook-series', params: { name: series.name } })
}

function getSeriesCoverUrl(coverPath: string): string {
  if (!coverPath) return ''
  if (coverPath.startsWith('http')) return coverPath
  return `/api/v1/ebook/cover-image?path=${encodeURIComponent(coverPath)}`
}

function onImageError(e: Event) {
  const img = e.target as HTMLImageElement
  img.style.display = 'none'
}

onMounted(async () => {
  await loadEbooks()
  checkAutoOpen()
})

watch(() => route.query.read, () => {
  if (!loading.value) {
    checkAutoOpen()
  }
})
</script>

<style scoped>
.ebooks-view {
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

.series-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 32px 80px;
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
  background: linear-gradient(135deg, #2ecc71, #27ae60);
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
