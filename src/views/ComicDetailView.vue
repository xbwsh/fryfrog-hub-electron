<template>
  <div class="comic-detail-view">
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="loadComic">重试</button>
    </div>

    <div v-else-if="comic" class="detail-content">
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
              :src="getComicCoverUrl(comic.id)"
              :alt="comic.title"
              draggable="false"
              @error="onImageError"
            />
          </div>
          <div class="action-buttons">
            <button
              class="favorite-toggle"
              :class="{ active: comic.favorite }"
              @click="handleToggleFavorite"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" :fill="comic.favorite ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              {{ comic.favorite ? '已收藏' : '收藏' }}
            </button>
            <button class="read-btn" @click="showReader = true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
              {{ comicProgress !== null ? `继续阅读 (${Math.round(comicProgress)}%)` : '阅读' }}
            </button>
          </div>
        </div>

        <div class="info-section">
          <h1 class="comic-title">{{ comic.title }}</h1>

          <div class="info-grid">
            <div class="info-item" v-if="comic.author">
              <span class="info-label">作者</span>
              <span class="info-value">{{ comic.author }}</span>
            </div>
            <div class="info-item" v-if="comic.series">
              <span class="info-label">系列</span>
              <span class="info-value">{{ comic.series }}</span>
            </div>
            <div class="info-item" v-if="comic.volume">
              <span class="info-label">卷号</span>
              <span class="info-value">Vol.{{ comic.volume }}</span>
            </div>
            <div class="info-item" v-if="comic.year">
              <span class="info-label">年份</span>
              <span class="info-value">{{ comic.year }}</span>
            </div>
            <div class="info-item" v-if="comic.genre">
              <span class="info-label">类型</span>
              <span class="info-value">{{ comic.genre }}</span>
            </div>
            <div class="info-item" v-if="comic.format">
              <span class="info-label">格式</span>
              <span class="info-value">{{ comic.format }}</span>
            </div>
            <div class="info-item" v-if="comic.rating">
              <span class="info-label">评分</span>
              <span class="info-value">{{ comic.rating.toFixed(1) }}</span>
            </div>
            <div class="info-item" v-if="comic.releaseDate">
              <span class="info-label">发售日</span>
              <span class="info-value">{{ comic.releaseDate }}</span>
            </div>
            <div class="info-item" v-if="comic.pageCount">
              <span class="info-label">页数</span>
              <span class="info-value">{{ comic.pageCount }} 页</span>
            </div>
            <div class="info-item" v-if="comic.fileSize">
              <span class="info-label">大小</span>
              <span class="info-value">{{ formatFileSize(comic.fileSize) }}</span>
            </div>
          </div>

          <div class="summary-section" v-if="comic.summary">
            <h3>简介</h3>
            <p>{{ comic.summary }}</p>
          </div>

          <div class="file-section" v-if="comic.fileName">
            <h3>文件信息</h3>
            <div class="file-info">
              <span class="file-name">{{ comic.fileName }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ComicReader
      v-if="showReader && comic"
      :comic-id="comic.id"
      :comic-title="comic.title"
      @close="showReader = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, defineAsyncComponent, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { Comic } from '@/types/backend'
import { getComicById, toggleComicFavorite, getComicCoverUrl, getComicProgress } from '@/api/backend'
const ComicReader = defineAsyncComponent(() => import('@/views/ComicReader.vue'))

const router = useRouter()
const route = useRoute()

const comic = ref<Comic | null>(null)
const loading = ref(false)
const error = ref('')
const showReader = ref(false)
const comicProgress = ref<number | null>(null)

async function loadComic() {
  const id = Number(route.params.id)
  if (!id) {
    error.value = '无效的漫画ID'
    return
  }

  loading.value = true
  error.value = ''
  try {
    const data = await getComicById(id)
    if (data) {
      comic.value = data
      const progress = await getComicProgress(id)
      if (progress && !progress.completed) {
        comicProgress.value = progress.progressPercent
      }
    } else {
      error.value = '漫画不存在'
    }
  } catch (e) {
    error.value = '加载漫画失败'
    console.error('Failed to load comic:', e)
  } finally {
    loading.value = false
  }
}

async function handleToggleFavorite() {
  if (!comic.value) return
  try {
    const updated = await toggleComicFavorite(comic.value.id, !comic.value.favorite)
    if (updated) {
      comic.value = updated
    }
  } catch (e) {
    console.error('Failed to toggle favorite:', e)
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB'
}

function onImageError(e: Event) {
  const img = e.target as HTMLImageElement
  img.style.display = 'none'
}

onMounted(loadComic)
</script>

<style scoped>
.comic-detail-view {
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
}

.back-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.detail-body {
  display: flex;
  gap: 40px;
  padding: 0 32px 40px;
}

.cover-section {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.cover-wrapper {
  width: 280px;
  aspect-ratio: 3/4;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--bg-tertiary);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.cover-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.favorite-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border: 1px solid var(--border);
  transition: var(--transition);
}

.favorite-toggle:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.favorite-toggle.active {
  color: #ff6b6b;
  border-color: #ff6b6b;
  background: rgba(255, 107, 107, 0.1);
}

.read-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 600;
  background: var(--accent);
  color: white;
  border: none;
  transition: var(--transition);
}

.read-btn:hover {
  background: var(--accent-hover);
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
}

.continue-btn:hover {
  background: var(--bg-hover);
  border-color: var(--accent);
  color: var(--accent);
}

.info-section {
  flex: 1;
  min-width: 0;
}

.comic-title {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 24px;
  line-height: 1.3;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 15px;
  color: var(--text-primary);
  font-weight: 500;
}

.summary-section,
.file-section {
  margin-bottom: 24px;
}

.summary-section h3,
.file-section h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.summary-section p {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.7;
}

.file-info {
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  padding: 12px 16px;
}

.file-name {
  font-size: 13px;
  color: var(--text-secondary);
  font-family: monospace;
}


</style>
