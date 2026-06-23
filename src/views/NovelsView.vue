<template>
  <div class="ebooks-view">
    <div class="view-header">
      <div class="header-left">
        <h1>📖 电子书</h1>
        <p class="view-subtitle">管理你的电子书库</p>
      </div>
      <div class="header-actions">
        <button class="scan-btn" @click="showScanDialog = true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23 4 23 10 17 10"/>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
          扫描目录
        </button>
        <div class="search-bar">
          <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input v-model="searchQuery" type="text" placeholder="搜索电子书..." @input="handleSearch" />
        </div>
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

    <Teleport to="body">
      <div v-if="showScanDialog" class="dialog-overlay" @click.self="showScanDialog = false">
        <div class="dialog">
          <h3>扫描电子书目录</h3>
          <p class="dialog-desc">输入要扫描的目录路径，支持 .epub、.txt 等格式</p>
          <input
            v-model="scanPath"
            type="text"
            class="dialog-input"
            placeholder="例如: /media/books"
            @keyup.enter="handleScan"
          />
          <div class="dialog-actions">
            <button class="dialog-btn cancel" @click="showScanDialog = false">取消</button>
            <button class="dialog-btn confirm" :disabled="!scanPath.trim() || scanning" @click="handleScan">
              {{ scanning ? '扫描中...' : '开始扫描' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Ebook, EbookSeries } from '@/types/backend'
import { getEbookSeries, scanEbookDirectory, getEbookProgress } from '@/api/backend'
import EbookReader from '@/views/EbookReader.vue'

const route = useRoute()
const router = useRouter()
const seriesList = ref<EbookSeries[]>([])
const loading = ref(false)
const error = ref('')
const searchQuery = ref('')
const readingBook = ref<Ebook | null>(null)
const showScanDialog = ref(false)
const scanPath = ref('')
const scanning = ref(false)
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

async function handleScan() {
  if (!scanPath.value.trim()) return
  scanning.value = true
  try {
    await scanEbookDirectory(scanPath.value)
    showScanDialog.value = false
    scanPath.value = ''
    await loadEbooks()
  } catch (e) {
    error.value = '扫描失败'
    console.error('Failed to scan directory:', e)
  } finally {
    scanning.value = false
  }
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
  gap: 12px;
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

.dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 24px;
  width: 400px;
  max-width: 90vw;
}

.dialog h3 {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.dialog-desc {
  margin: 0 0 16px;
  font-size: 13px;
  color: var(--text-muted);
}

.dialog-input {
  width: 100%;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 10px 12px;
  font-size: 14px;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.dialog-input:focus {
  border-color: var(--accent);
  outline: none;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.dialog-btn {
  padding: 8px 16px;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid var(--border);
  transition: var(--transition);
}

.dialog-btn.cancel {
  background: transparent;
  color: var(--text-secondary);
}

.dialog-btn.cancel:hover {
  background: var(--bg-hover);
}

.dialog-btn.confirm {
  background: var(--accent);
  color: white;
  border-color: var(--accent);
}

.dialog-btn.confirm:hover {
  background: var(--accent-hover);
}

.dialog-btn.confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}


</style>
