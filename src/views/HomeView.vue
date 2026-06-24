<template>
  <div class="home-view">
    <div class="welcome-section">
      <h1 class="welcome-title">欢迎回来，{{ connectionStore.username }}</h1>
      <p class="welcome-subtitle">探索你的媒体库</p>
    </div>

    <section class="content-section">
      <div class="section-header">
        <div class="section-title">
          <h2>音乐</h2>
          <span v-if="playerStore.currentTrack" class="now-playing-hint">
            <span v-if="playerStore.isPlaying" class="eq-bars">
              <span class="eq-bar"></span>
              <span class="eq-bar"></span>
              <span class="eq-bar"></span>
            </span>
            <span v-else class="pause-icon">&#9646;&#9646;</span>
            正在播放：{{ playerStore.currentTrack.title }} - {{ playerStore.currentTrack.artist }}
          </span>
        </div>
        <router-link to="/music" class="see-all">查看全部</router-link>
      </div>
      <div class="scroll-wrapper" v-if="musicTracks.length > 0">
        <button
          v-show="canScrollLeft.music"
          class="scroll-btn scroll-btn-left"
          @click="scrollLeft('music')"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <div
          class="content-grid"
          ref="musicGrid"
          @wheel="handleWheel($event, 'music')"
          @scroll="updateScrollState('music')"
        >
          <div v-for="track in musicTracks" :key="track.id" class="content-card" @click="playMusic(track)">
            <div class="card-cover music-cover">
              <img :src="getMusicCoverArtUrl(track.id)" alt="封面" />
            </div>
            <div class="card-info">
              <span class="card-title">{{ track.title }}</span>
              <span class="card-subtitle">{{ track.artist }}</span>
            </div>
          </div>
        </div>
        <button
          v-show="canScrollRight.music"
          class="scroll-btn scroll-btn-right"
          @click="scrollRight('music')"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
        <div class="fade-mask fade-mask-left" v-show="canScrollLeft.music"></div>
        <div class="fade-mask fade-mask-right" v-show="canScrollRight.music"></div>
      </div>
      <div class="content-grid" v-else>
        <div v-for="i in 6" :key="'music-' + i" class="content-card">
          <div class="card-cover music-cover">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="12" r="10"/>
              <polygon points="10 8 16 12 10 16 10 8" fill="currentColor"/>
            </svg>
          </div>
          <div class="card-info">
            <span class="card-title">示例音乐 {{ i }}</span>
            <span class="card-subtitle">艺术家 {{ i }}</span>
          </div>
        </div>
      </div>
    </section>

    <section class="content-section">
      <div class="section-header">
        <div class="section-title">
          <h2>漫画</h2>
        </div>
        <router-link to="/comics" class="see-all">查看全部</router-link>
      </div>
      <div class="scroll-wrapper" v-if="comics.length > 0">
        <button
          v-show="canScrollLeft.comics"
          class="scroll-btn scroll-btn-left"
          @click="scrollLeft('comics')"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <div
          class="content-grid"
          ref="comicsGrid"
          @wheel="handleWheel($event, 'comics')"
          @scroll="updateScrollState('comics')"
        >
          <div v-for="comic in comics" :key="comic.id" class="content-card" @click="readComic(comic)">
            <div class="card-cover comic-cover">
              <img :src="getComicCoverUrl(comic.id)" alt="封面" @error="onImageError" />
            </div>
            <div class="card-info">
              <span class="card-title">{{ comic.title }}</span>
              <span class="card-subtitle">{{ comic.author }}</span>
            </div>
          </div>
        </div>
        <button
          v-show="canScrollRight.comics"
          class="scroll-btn scroll-btn-right"
          @click="scrollRight('comics')"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
        <div class="fade-mask fade-mask-left" v-show="canScrollLeft.comics"></div>
        <div class="fade-mask fade-mask-right" v-show="canScrollRight.comics"></div>
      </div>
      <div class="content-grid" v-else>
        <div v-for="i in 6" :key="'comic-' + i" class="content-card">
          <div class="card-cover comic-cover">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
          </div>
          <div class="card-info">
            <span class="card-title">示例漫画 {{ i }}</span>
            <span class="card-subtitle">作者 {{ i }}</span>
          </div>
        </div>
      </div>
    </section>

    <section class="content-section">
      <div class="section-header">
        <div class="section-title">
          <h2>电子书</h2>
        </div>
        <router-link to="/ebooks" class="see-all">查看全部</router-link>
      </div>
      <div class="scroll-wrapper" v-if="ebooks.length > 0">
        <button
          v-show="canScrollLeft.ebooks"
          class="scroll-btn scroll-btn-left"
          @click="scrollLeft('ebooks')"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <div
          class="content-grid"
          ref="ebooksGrid"
          @wheel="handleWheel($event, 'ebooks')"
          @scroll="updateScrollState('ebooks')"
        >
          <div v-for="book in ebooks" :key="book.id" class="content-card" @click="readEbook(book)">
            <div class="card-cover ebook-cover">
              <img :src="getEbookCoverUrl(book.id)" alt="封面" @error="onImageError" />
            </div>
            <div class="card-info">
              <span class="card-title">{{ book.title }}</span>
              <span class="card-subtitle">{{ book.author }}</span>
            </div>
          </div>
        </div>
        <button
          v-show="canScrollRight.ebooks"
          class="scroll-btn scroll-btn-right"
          @click="scrollRight('ebooks')"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
        <div class="fade-mask fade-mask-left" v-show="canScrollLeft.ebooks"></div>
        <div class="fade-mask fade-mask-right" v-show="canScrollRight.ebooks"></div>
      </div>
      <div class="content-grid" v-else>
        <div v-for="i in 6" :key="'ebook-' + i" class="content-card">
          <div class="card-cover ebook-cover">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
          </div>
          <div class="card-info">
            <span class="card-title">示例电子书 {{ i }}</span>
            <span class="card-subtitle">作者 {{ i }}</span>
          </div>
        </div>
      </div>
    </section>

    <section class="content-section">
      <div class="section-header">
        <div class="section-title">
          <h2>视频</h2>
        </div>
        <router-link to="/videos" class="see-all">查看全部</router-link>
      </div>
      <div class="scroll-wrapper" v-if="seriesList.length > 0">
        <button
          v-show="canScrollLeft.videos"
          class="scroll-btn scroll-btn-left"
          @click="scrollLeft('videos')"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <div
          class="content-grid"
          ref="videosGrid"
          @wheel="handleWheel($event, 'videos')"
          @scroll="updateScrollState('videos')"
        >
          <div v-for="series in seriesList" :key="series.id" class="content-card" @click="watchVideo(series)">
            <div class="card-cover video-cover">
              <img :src="series.posterUrl || getSeriesPosterUrl(series.id)" alt="封面" @error="onImageError" />
            </div>
            <div class="card-info">
              <span class="card-title">{{ series.title }}</span>
              <span class="card-subtitle">{{ series.year }} · {{ series.episodes ? series.episodes.length : 0 }} 集</span>
            </div>
          </div>
        </div>
        <button
          v-show="canScrollRight.videos"
          class="scroll-btn scroll-btn-right"
          @click="scrollRight('videos')"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
        <div class="fade-mask fade-mask-left" v-show="canScrollLeft.videos"></div>
        <div class="fade-mask fade-mask-right" v-show="canScrollRight.videos"></div>
      </div>
      <div class="content-grid" v-else>
        <div v-for="i in 6" :key="'video-' + i" class="content-card">
          <div class="card-cover video-cover">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
              <line x1="7" y1="2" x2="7" y2="22"/>
              <line x1="17" y1="2" x2="17" y2="22"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
            </svg>
          </div>
          <div class="card-info">
            <span class="card-title">示例视频 {{ i }}</span>
            <span class="card-subtitle">2024</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useConnectionStore } from '@/stores/connection'
import { usePlayerStore } from '@/stores/player'
import {
  getAllTracks,
  getAllComics,
  getAllEbooks,
  getAllSeries,
  getMusicCoverArtUrl,
  getComicCoverUrl,
  getEbookCoverUrl,
  getSeriesPosterUrl,
} from '@/api/backend'
import type { MusicTrack, Comic, Ebook, SeriesDTO } from '@/types/backend'

const connectionStore = useConnectionStore()
const playerStore = usePlayerStore()
const router = useRouter()

const musicTracks = ref<MusicTrack[]>([])
const comics = ref<Comic[]>([])
const ebooks = ref<Ebook[]>([])
const seriesList = ref<SeriesDTO[]>([])

const musicGrid = ref<HTMLElement | null>(null)
const comicsGrid = ref<HTMLElement | null>(null)
const ebooksGrid = ref<HTMLElement | null>(null)
const videosGrid = ref<HTMLElement | null>(null)

const canScrollLeft = reactive({
  music: false,
  comics: false,
  ebooks: false,
  videos: false,
})

const canScrollRight = reactive({
  music: false,
  comics: false,
  ebooks: false,
  videos: false,
})

function getGridRef(section: string): HTMLElement | null {
  const refs: Record<string, HTMLElement | null> = {
    music: musicGrid.value,
    comics: comicsGrid.value,
    ebooks: ebooksGrid.value,
    videos: videosGrid.value,
  }
  return refs[section]
}

function updateScrollState(section: string) {
  const grid = getGridRef(section)
  if (!grid) return
  canScrollLeft[section] = grid.scrollLeft > 10
  canScrollRight[section] = grid.scrollLeft < grid.scrollWidth - grid.clientWidth - 10
}

function scrollLeft(section: string) {
  const grid = getGridRef(section)
  if (grid) {
    grid.scrollBy({ left: -300, behavior: 'smooth' })
  }
}

function scrollRight(section: string) {
  const grid = getGridRef(section)
  if (grid) {
    grid.scrollBy({ left: 300, behavior: 'smooth' })
  }
}

onMounted(async () => {
  try {
    const [tracks, comicsData, ebooksData, seriesData] = await Promise.allSettled([
      getAllTracks(),
      getAllComics(),
      getAllEbooks(),
      getAllSeries(),
    ])

    if (tracks.status === 'fulfilled') musicTracks.value = tracks.value.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    if (comicsData.status === 'fulfilled') comics.value = comicsData.value.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    if (ebooksData.status === 'fulfilled') ebooks.value = ebooksData.value.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    if (seriesData.status === 'fulfilled') seriesList.value = seriesData.value.sort((a, b) => (b.year || 0) - (a.year || 0))

    await nextTick()
    updateScrollState('music')
    updateScrollState('comics')
    updateScrollState('ebooks')
    updateScrollState('videos')
  } catch (error) {
    console.error('Failed to load home data:', error)
  }
})

function playMusic(track: MusicTrack) {
  playerStore.playTrack(track, musicTracks.value)
  router.push('/music')
}

function readComic(comic: Comic) {
  router.push({ name: 'comic-detail', params: { id: comic.id } })
}

function readEbook(book: Ebook) {
  router.push({ name: 'ebooks', query: { read: book.id } })
}

function watchVideo(series: SeriesDTO) {
  if (series.episodes && series.episodes.length > 0) {
    router.push({ name: 'video-detail', params: { id: series.episodes[0].id } })
  }
}

function onImageError(e: Event) {
  const img = e.target as HTMLImageElement
  img.style.display = 'none'
}

function handleWheel(e: WheelEvent, section: string) {
  const grid = getGridRef(section)
  if (!grid) return

  const canScrollL = grid.scrollLeft > 0
  const canScrollR = grid.scrollLeft < grid.scrollWidth - grid.clientWidth - 1

  if (e.deltaY > 0 && canScrollR) {
    e.preventDefault()
    grid.scrollLeft += e.deltaY
  } else if (e.deltaY < 0 && canScrollL) {
    e.preventDefault()
    grid.scrollLeft += e.deltaY
  }
}
</script>

<style scoped>
.home-view {
  padding: 24px 32px 80px;
  overflow-y: auto;
  height: 100%;
}

.welcome-section {
  margin-bottom: 32px;
}

.welcome-title {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 4px;
}

.welcome-subtitle {
  color: var(--text-secondary);
  font-size: 15px;
}

.content-section {
  margin-bottom: 40px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.now-playing-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--accent);
  font-weight: 400;
}

.eq-bars {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.eq-bar {
  width: 3px;
  background: var(--accent);
  border-radius: 1px;
  animation: eq 0.5s ease-in-out infinite alternate;
}

.eq-bar:nth-child(1) {
  height: 6px;
  animation-delay: 0s;
}

.eq-bar:nth-child(2) {
  height: 10px;
  animation-delay: 0.15s;
}

.eq-bar:nth-child(3) {
  height: 5px;
  animation-delay: 0.3s;
}

@keyframes eq {
  0% { height: 3px; }
  100% { height: 12px; }
}

.pause-icon {
  font-size: 10px;
  line-height: 1;
  letter-spacing: -1px;
  flex-shrink: 0;
}

.section-header h2 {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 700;
  margin: 0;
}

.see-all {
  font-size: 13px;
  color: var(--text-muted);
  text-decoration: none;
  transition: var(--transition);
}

.see-all:hover {
  color: var(--accent);
}

.scroll-wrapper {
  position: relative;
}

.content-grid {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  scrollbar-width: none;
  padding: 8px 4px;
  scroll-behavior: smooth;
}

.content-grid::-webkit-scrollbar {
  display: none;
}

.scroll-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  color: var(--text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: var(--transition);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.scroll-btn:hover {
  background: var(--accent);
  color: white;
  border-color: var(--accent);
}

.scroll-btn-left {
  left: -12px;
}

.scroll-btn-right {
  right: -12px;
}

.fade-mask {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 60px;
  pointer-events: none;
  z-index: 5;
}

.fade-mask-left {
  left: 0;
  background: linear-gradient(to right, var(--bg-primary) 0%, transparent 100%);
}

.fade-mask-right {
  right: 0;
  background: linear-gradient(to left, var(--bg-primary) 0%, transparent 100%);
}

.content-card {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: pointer;
  transition: var(--transition);
  min-width: 160px;
  max-width: 160px;
  flex-shrink: 0;
}

.content-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.card-cover {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.6);
  overflow: hidden;
}

.card-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.music-cover {
  background: linear-gradient(135deg, #e85d4a, #c0392b);
}

.comic-cover {
  background: linear-gradient(135deg, #3498db, #2980b9);
}

.ebook-cover {
  background: linear-gradient(135deg, #2ecc71, #27ae60);
}

.video-cover {
  background: linear-gradient(135deg, #9b59b6, #8e44ad);
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
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.content-card:hover .card-title {
  overflow-x: auto;
  scrollbar-width: none;
}

.content-card:hover .card-title::-webkit-scrollbar {
  display: none;
}

.card-subtitle {
  display: block;
  font-size: 12px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
