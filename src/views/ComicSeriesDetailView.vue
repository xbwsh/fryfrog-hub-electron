<template>
  <div class="comic-series-view">
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
              @error="onImageError"
            />
          </div>
        </div>

        <div class="info-section">
          <h1 class="series-name">{{ series.name }}</h1>
          <p class="series-author">{{ series.author }}</p>
          <p class="series-count">{{ series.volumeCount }} 卷</p>
        </div>
      </div>

      <div class="volumes-section">
        <h2 class="section-title">分卷列表</h2>
        <div class="volumes-grid">
          <div
            v-for="comic in series.comics"
            :key="comic.id"
            class="volume-card"
            @click="viewComic(comic)"
          >
            <div class="volume-cover">
              <img
                :src="getComicCoverUrl(comic.id)"
                :alt="comic.title"
                @error="onImageError"
              />
              <div class="volume-badge" v-if="comic.volume">Vol.{{ comic.volume }}</div>
            </div>
            <div class="volume-info">
              <div class="volume-title">{{ comic.title || `第 ${comic.volume} 卷` }}</div>
              <div class="volume-meta" v-if="comic.pageCount">{{ comic.pageCount }} 页</div>
              <div v-if="getComicProgressById(comic.id)" class="volume-progress">
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: getComicProgressById(comic.id)!.progressPercent + '%' }"></div>
                </div>
                <span class="progress-text">第{{ getComicProgressById(comic.id)!.currentPage }}页 {{ Math.round(getComicProgressById(comic.id)!.progressPercent) }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { ComicSeries, ComicVolume, ComicProgress } from '@/types/backend'
import { getComicSeries, getComicCoverUrl, getComicProgress } from '@/api/backend'

const router = useRouter()
const route = useRoute()

const series = ref<ComicSeries | null>(null)
const loading = ref(false)
const error = ref('')
const comicProgressMap = ref<Map<number, ComicProgress>>(new Map())

async function loadSeries() {
  const name = route.params.name as string
  if (!name) {
    error.value = '无效的系列名称'
    return
  }

  loading.value = true
  error.value = ''
  try {
    const allSeries = await getComicSeries()
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
  const progressMap = new Map<number, ComicProgress>()
  for (const comic of series.value.comics) {
    try {
      const progress = await getComicProgress(comic.id)
      if (progress && !progress.completed) {
        progressMap.set(comic.id, progress)
      }
    } catch {
      // ignore errors for individual comics
    }
  }
  comicProgressMap.value = progressMap
}

function getComicProgressById(comicId: number): ComicProgress | undefined {
  return comicProgressMap.value.get(comicId)
}

function viewComic(comic: ComicVolume) {
  router.push({ name: 'comic-detail', params: { id: comic.id } })
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

onMounted(loadSeries)
</script>

<style scoped>
.comic-series-view {
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

.volumes-section {
  padding: 0 32px 40px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
  color: var(--text-primary);
}

.volumes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 20px;
}

.volume-card {
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  overflow: hidden;
  cursor: pointer;
  transition: var(--transition);
}

.volume-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.volume-cover {
  width: 100%;
  height: 186px;
  overflow: hidden;
  position: relative;
  background: linear-gradient(135deg, #3498db, #2980b9);
}

.volume-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.volume-badge {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  color: white;
  font-size: 11px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 12px;
}

.volume-info {
  padding: 12px;
}

.volume-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.volume-meta {
  font-size: 11px;
  color: var(--text-muted);
}

.volume-progress {
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


</style>
