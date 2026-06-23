<template>
  <div class="favorites-view">
    <div class="view-header">
      <h1>收藏</h1>
      <p class="view-subtitle">你喜欢的内容</p>
    </div>

    <div class="tab-bar">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-btn"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        <span class="tab-label">{{ tab.label }}</span>
        <span v-if="tab.count > 0" class="tab-badge">{{ tab.count }}</span>
      </button>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="loadAll">重试</button>
    </div>

    <div v-else-if="currentList.length === 0" class="empty-state">
      <p>暂无收藏</p>
    </div>

    <div v-else-if="activeTab === 'music'" class="favorites-list">
      <div
        v-for="item in currentList"
        :key="item.id"
        class="fav-item"
        @click="openItem(item)"
      >
        <div class="fav-cover">
          <img :src="getCoverUrl(item)" alt="" @error="onCoverError" />
        </div>
        <div class="fav-info">
          <div class="fav-title">{{ item.title }}</div>
          <div class="fav-subtitle">{{ getSubtitle(item) }}</div>
        </div>
        <button
          class="fav-fav-btn"
          :class="{ active: item.favorite }"
          @click.stop="handleToggleFavorite(item)"
          :title="item.favorite ? '取消收藏' : '收藏'"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" :fill="item.favorite ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </button>
      </div>
    </div>

    <div v-else class="content-grid">
      <div
        v-for="item in currentList"
        :key="item.id"
        class="content-card"
        @click="openItem(item)"
      >
        <div class="card-cover">
          <img :src="getCoverUrl(item)" :alt="item.title" @error="onCoverError" />
          <button
            class="favorite-btn"
            :class="{ active: item.favorite }"
            @click.stop="handleToggleFavorite(item)"
            :title="item.favorite ? '取消收藏' : '收藏'"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" :fill="item.favorite ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </button>
          <div class="card-badge" v-if="getBadge(item)">{{ getBadge(item) }}</div>
          <div v-if="item._type === 'video' && (item as VideoDTO).watchProgressPercent > 0" class="card-progress">
            <div class="card-progress-bar">
              <div class="card-progress-fill" :style="{ width: Math.min((item as VideoDTO).watchProgressPercent, 100) + '%' }"></div>
            </div>
          </div>
          <div v-if="item._type === 'video' && (item as VideoDTO).watched" class="card-watched-badge">已看完</div>
        </div>
        <div class="card-info">
          <div class="card-title">{{ item.title }}</div>
          <div class="card-meta">{{ getSubtitle(item) }}</div>
        </div>
      </div>
    </div>

    <MusicPlayerBar @toggle-lyrics="showLyrics = !showLyrics" />

    <transition name="lyrics-fade">
      <div class="lyrics-overlay" v-show="showLyrics">
        <LyricsPanel @close="showLyrics = false" />
      </div>
    </transition>

    <EbookReader
      v-if="readingEbook"
      :ebook-id="readingEbook.id"
      :ebook-title="readingEbook.title"
      :ebook-file-path="readingEbook.filePath"
      @close="readingEbook = null"
    />

    <VideoPlayer
      v-if="playingVideo"
      :video-id="playingVideo.id"
      :video-title="playingVideo.title"
      @close="playingVideo = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { MusicTrack, Comic, Ebook, VideoDTO } from '@/types/backend'
import {
  getFavorites,
  getComicFavorites,
  getEbookFavorites,
  getVideoFavorites,
  getMusicCoverArtUrl,
  getComicCoverUrl,
  getEbookCoverUrl,
  getVideoCoverUrl,
  toggleFavorite,
  toggleComicFavorite,
  toggleEbookFavorite,
  toggleVideoFavorite,
} from '@/api/backend'
import { usePlayerStore } from '@/stores/player'
import MusicPlayerBar from '@/components/MusicPlayerBar.vue'
import LyricsPanel from '@/components/LyricsPanel.vue'
import EbookReader from '@/views/EbookReader.vue'

type FavItem = (MusicTrack | Comic | Ebook | VideoDTO) & { _type: string }

const router = useRouter()
const playerStore = usePlayerStore()

const loading = ref(false)
const error = ref('')
const showLyrics = ref(false)
const activeTab = ref('music')

const musicList = ref<FavItem[]>([])
const comicList = ref<FavItem[]>([])
const ebookList = ref<FavItem[]>([])
const videoList = ref<FavItem[]>([])
const readingEbook = ref<Ebook | null>(null)
const playingVideo = ref<VideoDTO | null>(null)

const tabs = computed(() => [
  { key: 'music', label: '音乐', count: musicList.value.length },
  { key: 'comic', label: '漫画', count: comicList.value.length },
  { key: 'ebook', label: '电子书', count: ebookList.value.length },
  { key: 'video', label: '视频', count: videoList.value.length },
])

const currentList = computed(() => {
  switch (activeTab.value) {
    case 'music': return musicList.value
    case 'comic': return comicList.value
    case 'ebook': return ebookList.value
    case 'video': return videoList.value
    default: return []
  }
})

async function loadAll() {
  loading.value = true
  error.value = ''
  try {
    const [music, comic, ebook, video] = await Promise.all([
      getFavorites(),
      getComicFavorites(),
      getEbookFavorites(),
      getVideoFavorites(),
    ])
    musicList.value = music.map(m => ({ ...m, _type: 'music' }))
    comicList.value = comic.map(c => ({ ...c, _type: 'comic' }))
    ebookList.value = ebook.map(e => ({ ...e, _type: 'ebook' }))
    videoList.value = video.map(v => ({ ...v, _type: 'video' }))
  } catch (e) {
    error.value = '加载收藏失败'
    console.error('Failed to load favorites:', e)
  } finally {
    loading.value = false
  }
}

function getCoverUrl(item: FavItem): string {
  switch (item._type) {
    case 'music': return getMusicCoverArtUrl(item.id)
    case 'comic': return getComicCoverUrl(item.id)
    case 'ebook': return getEbookCoverUrl(item.id)
    case 'video': return getVideoCoverUrl(item.id)
    default: return ''
  }
}

function getSubtitle(item: FavItem): string {
  switch (item._type) {
    case 'music': return `${(item as MusicTrack).artist} - ${(item as MusicTrack).album}`
    case 'comic': return (item as Comic).author || (item as Comic).series
    case 'ebook': return (item as Ebook).author
    case 'video': return (item as VideoDTO).director || (item as VideoDTO).actors
    default: return ''
  }
}

function getBadge(item: FavItem): string {
  switch (item._type) {
    case 'comic': return (item as Comic).series || ''
    case 'ebook': return (item as Ebook).format || ''
    case 'video': return (item as VideoDTO).resolution || ''
    default: return ''
  }
}

function onCoverError(e: Event) {
  (e.target as HTMLImageElement).style.display = 'none'
}

function openItem(item: FavItem) {
  switch (item._type) {
    case 'music':
      playerStore.playTrack(item as MusicTrack, musicList.value as MusicTrack[])
      break
    case 'comic':
      router.push({ name: 'comic-detail', params: { id: item.id } })
      break
    case 'ebook':
      readingEbook.value = item as Ebook
      break
    case 'video':
      router.push({ name: 'video-detail', params: { id: item.id } })
      break
  }
}

async function handleToggleFavorite(item: FavItem) {
  try {
    let updated: any
    switch (item._type) {
      case 'music': updated = await toggleFavorite(item.id, !item.favorite); break
      case 'comic': updated = await toggleComicFavorite(item.id, !item.favorite); break
      case 'ebook': updated = await toggleEbookFavorite(item.id, !item.favorite); break
      case 'video': updated = await toggleVideoFavorite(item.id, !item.favorite); break
    }
    if (!updated) return
    const list = currentList.value
    const index = list.findIndex(i => i.id === item.id && i._type === item._type)
    if (index !== -1) {
      list[index] = { ...updated, _type: item._type }
    } else {
      list.splice(index, 1)
    }
  } catch (e) {
    console.error('Failed to toggle favorite:', e)
  }
}

onMounted(loadAll)
</script>

<style scoped>
.favorites-view {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.view-header {
  padding: 24px 32px 16px;
  flex-shrink: 0;
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

.tab-bar {
  display: flex;
  gap: 4px;
  padding: 0 32px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  font-size: 14px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: var(--transition);
}

.tab-btn:hover {
  color: var(--text-primary);
}

.tab-btn.active {
  color: var(--accent);
  border-bottom-color: var(--accent);
}

.tab-badge {
  font-size: 11px;
  background: var(--bg-tertiary);
  color: var(--text-muted);
  padding: 1px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

.tab-btn.active .tab-badge {
  background: var(--accent-glow);
  color: var(--accent);
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

.favorites-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 16px;
}

.fav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition);
}

.fav-item:hover {
  background: var(--bg-hover);
}

.fav-cover {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  flex-shrink: 0;
  background: var(--bg-tertiary);
}

.fav-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.fav-info {
  flex: 1;
  min-width: 0;
}

.fav-title {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fav-subtitle {
  font-size: 13px;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fav-fav-btn {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  background: none;
  border: none;
  cursor: pointer;
  transition: var(--transition);
  flex-shrink: 0;
}

.fav-fav-btn:hover {
  color: var(--accent);
  background: var(--bg-hover);
}

.fav-fav-btn.active {
  color: var(--accent);
}

.content-grid {
  flex: 1;
  overflow-y: auto;
  padding: 16px 32px 80px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  grid-auto-rows: max-content;
  gap: 20px;
  align-content: start;
}

.content-card {
  cursor: pointer;
  border-radius: var(--radius-md);
  transition: var(--transition);
  min-width: 0;
}

.content-card:hover {
  transform: translateY(-2px);
}

.card-cover {
  position: relative;
  aspect-ratio: 3 / 4;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--bg-tertiary);
  margin-bottom: 8px;
}

.card-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.favorite-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  opacity: 0;
  transition: var(--transition);
}

.content-card:hover .favorite-btn {
  opacity: 1;
}

.favorite-btn.active {
  opacity: 1;
  color: var(--accent);
  background: rgba(0, 0, 0, 0.7);
}

.card-badge {
  position: absolute;
  bottom: 8px;
  left: 8px;
  font-size: 11px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
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
  padding: 0 4px;
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
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
</style>
