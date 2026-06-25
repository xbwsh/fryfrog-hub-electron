<template>
  <div class="ebook-series-view">
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="loadSeries">重试</button>
    </div>

    <div v-else-if="series" class="detail-content">
      <div class="detail-header">
        <button class="back-btn" @click="router.back()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
          返回
        </button>
      </div>

      <div class="detail-body">
        <div class="cover-section">
          <div class="cover-wrapper">
            <img
              :src="getSeriesCoverUrl(series.coverArtPath)"
              :alt="series.name"
              draggable="false"
              @error="onImageError"
            />
          </div>
        </div>

        <div class="info-section">
          <h1 class="series-name">{{ series.name }}</h1>
          <p class="series-author">{{ series.author }}</p>
          <p class="series-count">{{ series.volumeCount }} 卷</p>
          <div v-if="bestProgress" class="continue-section">
            <button class="continue-btn" @click="readBook(bestProgress.book)">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="14 10 20 10 20 4"/>
                <path d="M4 20v-6h6"/>
              </svg>
              继续阅读 · {{ bestProgress.book.title }} ({{ Math.round(bestProgress.progress.chapterProgressPercent) }}%)
            </button>
          </div>
        </div>
      </div>

      <div class="books-section">
        <h2 class="section-title">书籍列表</h2>
        <div class="books-grid">
          <div
            v-for="book in series.books"
            :key="book.id"
            class="book-card"
            @click="readBook(book)"
          >
            <div class="book-cover">
              <img
                :src="getEbookCoverUrl(book.id)"
                :alt="book.title"
                draggable="false"
                @error="onImageError"
              />
              <div class="book-badge" v-if="book.format">{{ book.format }}</div>
            </div>
            <div class="book-info">
                <div class="book-title">{{ book.title }}</div>
                <div class="book-meta">{{ book.year }} · {{ book.pageCount }}页</div>
                <div v-if="getBookProgress(book.id)" class="book-progress">
                  <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: getBookProgress(book.id)!.chapterProgressPercent + '%' }"></div>
                  </div>
                  <span class="progress-text">第{{ getBookProgress(book.id)!.currentChapter }}章 {{ Math.round(getBookProgress(book.id)!.chapterProgressPercent) }}%</span>
                </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { EbookSeries, Ebook, EbookProgress } from '@/types/backend'
import { getEbookSeries, getEbookCoverUrl, getEbookProgress } from '@/api/backend'

const router = useRouter()
const route = useRoute()

const series = ref<EbookSeries | null>(null)
const loading = ref(false)
const error = ref('')
const ebookProgressMap = ref<Map<number, EbookProgress>>(new Map())

async function loadSeries() {
  const name = route.params.name as string
  if (!name) {
    error.value = '无效的系列名称'
    return
  }

  loading.value = true
  error.value = ''
  try {
    const allSeries = await getEbookSeries()
    series.value = allSeries.find(s => s.name === name) || null
    if (!series.value) {
      error.value = '系列不存在'
      return
    }
    await loadAllProgress()
  } catch (e) {
    error.value = '加载系列失败'
    console.error('Failed to load series:', e)
  } finally {
    loading.value = false
  }
}

async function loadAllProgress() {
  if (!series.value) return
  const progressMap = new Map<number, EbookProgress>()
  for (const book of series.value.books) {
    try {
      const progress = await getEbookProgress(book.id)
      if (progress && !progress.completed) {
        progressMap.set(book.id, progress)
      }
    } catch {
      // ignore errors for individual books
    }
  }
  ebookProgressMap.value = progressMap
}

function getBookProgress(bookId: number): EbookProgress | undefined {
  return ebookProgressMap.value.get(bookId)
}

const bestProgress = computed(() => {
  if (!series.value) return null
  let best: { book: Ebook; progress: EbookProgress } | null = null
  for (const book of series.value.books) {
    const progress = ebookProgressMap.value.get(book.id)
    if (progress && !progress.completed) {
      if (!best || progress.chapterProgressPercent > best.progress.chapterProgressPercent) {
        best = { book, progress }
      }
    }
  }
  return best
})

function readBook(book: Ebook) {
  router.push({ name: 'ebooks', query: { read: book.id } })
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

onMounted(loadSeries)
</script>

<style scoped>
.ebook-series-view {
  height: 100%;
  overflow-y: auto;
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
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

.detail-header {
  padding: 16px 32px;
  flex-shrink: 0;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  padding: 8px 12px;
  border-radius: var(--radius-md);
  transition: var(--transition);
  background: none;
  border: none;
  cursor: pointer;
}

.back-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.detail-body {
  display: flex;
  gap: 32px;
  padding: 0 32px 32px;
  align-items: center;
}

.cover-section {
  flex-shrink: 0;
}

.cover-wrapper {
  width: 180px;
  aspect-ratio: 3/4;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: linear-gradient(135deg, #3498db, #2980b9);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.cover-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.info-section {
  flex: 1;
}

.series-name {
  font-family: var(--font-display);
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 12px;
  line-height: 1.3;
}

.series-author {
  font-size: 16px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.series-count {
  font-size: 14px;
  color: var(--text-muted);
}

.books-section {
  padding: 0 32px 40px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
  color: var(--text-primary);
}

.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 20px;
}

.book-card {
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  overflow: hidden;
  cursor: pointer;
  transition: var(--transition);
}

.book-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.book-cover {
  width: 100%;
  height: 186px;
  overflow: hidden;
  position: relative;
  background: linear-gradient(135deg, #3498db, #2980b9);
}

.book-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.book-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  color: white;
  font-size: 10px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 12px;
}

.book-info {
  padding: 12px;
}

.book-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.book-meta {
  font-size: 11px;
  color: var(--text-muted);
}

.book-progress {
  margin-top: 8px;
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

.continue-section {
  margin-top: 16px;
}

.continue-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 500;
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border);
  transition: var(--transition);
  cursor: pointer;
}

.continue-btn:hover {
  background: var(--bg-hover);
  border-color: var(--accent);
  color: var(--accent);
}


</style>
