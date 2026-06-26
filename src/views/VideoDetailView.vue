<template>
  <div class="video-detail-view">
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="loadVideo">重试</button>
    </div>

    <div v-else-if="series" class="detail-content">
      <div class="hero-section">
        <div class="backdrop">
          <img v-if="currentDisplayInfo.backdropUrl" :src="currentDisplayInfo.backdropUrl" :alt="currentDisplayInfo.title" draggable="false" @error="onImageError" />
          <div class="backdrop-overlay"></div>
        </div>

        <button class="back-btn" @click="router.back()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
        </button>

        <div class="hero-body">
          <div class="poster-col">
            <img
              v-if="currentDisplayInfo.posterUrl"
              :src="currentDisplayInfo.posterUrl"
              :alt="currentDisplayInfo.title"
              class="poster-img"
              @error="onImageError"
            />
            <div v-else class="poster-placeholder">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
                <line x1="7" y1="2" x2="7" y2="22"/>
                <line x1="17" y1="2" x2="17" y2="22"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <line x1="2" y1="7" x2="7" y2="7"/>
                <line x1="2" y1="17" x2="7" y2="17"/>
                <line x1="17" y1="7" x2="22" y2="7"/>
                <line x1="17" y1="17" x2="22" y2="17"/>
              </svg>
            </div>
          </div>

          <div class="info-col">
            <h1 class="video-title">{{ currentDisplayInfo.title }}</h1>
            <p class="video-original-title" v-if="currentDisplayInfo.originalTitle && currentDisplayInfo.originalTitle !== currentDisplayInfo.title">{{ currentDisplayInfo.originalTitle }}</p>

            <div class="meta-line">
              <span v-if="currentDisplayInfo.year">{{ currentDisplayInfo.year }}</span>
              <span class="meta-sep" v-if="currentDisplayInfo.year && series.episodes">·</span>
              <span v-if="series.episodes">{{ series.episodes.length }} 集</span>
              <span class="meta-sep" v-if="video?.episodeNumber">·</span>
              <span v-if="video?.episodeNumber">第 {{ video.episodeNumber }} 集</span>
            </div>

            <div class="action-row">
              <button class="play-btn" @click="playEpisode(video || series.episodes[0])">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                {{ hasSeriesProgress ? '继续播放' : '播放' }}
              </button>
              <button
                v-if="hasSeriesProgress"
                class="play-btn secondary"
                @click="playEpisode(series.episodes[0])"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                从头播放
              </button>
              <button class="icon-btn scrape-btn" @click="showTmdbSearch = true" title="刮削元数据">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </button>
              <button class="icon-btn" v-if="series.tmdbId" @click="handleRefreshTmdb" title="刷新元数据" :disabled="refreshing">
                <svg v-if="!refreshing" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                </svg>
                <div v-else class="scrape-spinner-small"></div>
              </button>
              <button class="icon-btn" v-if="series.tmdbId" @click="handleUnbindTmdb" title="解绑 TMDB">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
              <button class="icon-btn" v-if="series.rating > 0" :title="'评分 ' + series.rating">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </button>
            </div>

            <div class="rating-row" v-if="series.rating > 0">
              <span class="rating-score">{{ series.rating.toFixed(1) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="detail-body">
        <div class="overview-section" v-if="currentDisplayInfo.overview">
          <p>{{ currentDisplayInfo.overview }}</p>
        </div>

        <div class="section">
          <h3>剧集列表</h3>
          <div class="episode-list">
            <div
              v-for="episode in series.episodes"
              :key="episode.id"
              class="episode-item"
              :class="{ active: episode.id === video?.id }"
              @click="selectEpisode(episode)"
            >
              <div class="episode-number">{{ episode.episodeNumber }}</div>
              <div class="episode-info">
                <div class="episode-title">{{ episode.title }} - 第 {{ episode.episodeNumber }} 集</div>
                <div class="episode-file">{{ episode.fileName }}</div>
                <div v-if="episode.watchProgressPercent > 0" class="episode-progress">
                  <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: Math.min(episode.watchProgressPercent, 100) + '%' }"></div>
                  </div>
                  <span v-if="episode.watched" class="progress-text watched">已看完</span>
                  <span v-else class="progress-text">{{ Math.round(episode.watchProgressPercent) }}%</span>
                </div>
              </div>
              <div class="episode-play">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div class="section">
          <h3>文件信息</h3>
          <div class="file-card">
            <div class="file-row">
              <span class="file-label">当前剧集</span>
              <span class="file-value">第 {{ video?.episodeNumber }} 集</span>
            </div>
            <div class="file-row">
              <span class="file-label">文件名</span>
              <span class="file-value">{{ video?.fileName }}</span>
            </div>
            <div class="file-row" v-if="video?.fileSize">
              <span class="file-label">大小</span>
              <span class="file-value">{{ formatFileSize(video.fileSize) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="video" class="detail-content">
      <div class="hero-section">
        <div class="backdrop">
          <img v-if="video.backdropUrl || video.id" :src="video.backdropUrl || getVideoFanartUrl(video.id)" :alt="video.title" draggable="false" @error="onImageError" />
          <div class="backdrop-overlay"></div>
        </div>

        <button class="back-btn" @click="router.back()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
        </button>

        <div class="hero-body">
          <div class="poster-col">
            <img
              v-if="video.posterUrl || video.id"
              :src="video.posterUrl || getVideoPosterUrl(video.id)"
              :alt="video.title"
              class="poster-img"
              draggable="false"
              @error="onImageError"
            />
            <div v-else class="poster-placeholder">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
                <line x1="7" y1="2" x2="7" y2="22"/>
                <line x1="17" y1="2" x2="17" y2="22"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <line x1="2" y1="7" x2="7" y2="7"/>
                <line x1="2" y1="17" x2="7" y2="17"/>
                <line x1="17" y1="7" x2="22" y2="7"/>
                <line x1="17" y1="17" x2="22" y2="17"/>
              </svg>
            </div>
          </div>

          <div class="info-col">
            <h1 class="video-title">{{ video.title }}</h1>
            <p class="video-original-title" v-if="video.originalTitle && video.originalTitle !== video.title">{{ video.originalTitle }}</p>

            <div class="meta-line">
              <span v-if="video.year">{{ video.year }}</span>
              <span class="meta-sep" v-if="video.year && video.durationMinutes">·</span>
              <span v-if="video.durationMinutes">{{ formatDuration(video.durationMinutes) }}</span>
              <span class="meta-sep" v-if="video.genre">·</span>
              <span v-if="video.genre">{{ video.genre }}</span>
            </div>

            <div class="tag-row">
              <span class="tag" v-if="video.resolution">{{ video.resolution }}</span>
              <span class="tag" v-if="video.videoCodec">{{ video.videoCodec }}</span>
              <span class="tag" v-if="video.audioCodec">{{ video.audioCodec }}</span>
              <span class="tag" v-if="video.format">{{ video.format }}</span>
            </div>

            <div v-if="video.watchProgressPercent > 0" class="video-progress">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: Math.min(video.watchProgressPercent, 100) + '%' }"></div>
              </div>
              <span v-if="video.watched" class="progress-text watched">已看完</span>
              <span v-else class="progress-text">{{ Math.round(video.watchProgressPercent) }}%</span>
            </div>

            <div class="action-row">
              <button class="play-btn" @click="showPlayer = true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                {{ video.watchPosition > 0 && !video.watched ? '继续播放' : '播放' }}
              </button>
              <button
                v-if="video.watchPosition > 0 && !video.watched"
                class="play-btn secondary"
                @click="resetAndPlay"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                从头播放
              </button>
              <button class="icon-btn scrape-btn" @click="showTmdbSearch = true" title="刮削元数据">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </button>
              <button class="icon-btn" v-if="video.tmdbId" @click="handleRefreshTmdb" title="刷新元数据" :disabled="refreshing">
                <svg v-if="!refreshing" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                </svg>
                <div v-else class="scrape-spinner-small"></div>
              </button>
              <button class="icon-btn" v-if="video.tmdbId" @click="handleUnbindTmdb" title="解绑 TMDB">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
              <button
                class="icon-btn"
                :class="{ active: video.favorite }"
                @click="handleToggleFavorite"
                :title="video.favorite ? '取消收藏' : '收藏'"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" :fill="video.favorite ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              </button>
              <button class="icon-btn" v-if="video.rating > 0" :title="'评分 ' + video.rating">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </button>
            </div>

            <div class="rating-row" v-if="video.rating > 0">
              <span class="rating-score">{{ video.rating.toFixed(1) }}</span>
              <span class="rating-vote">{{ video.voteCount }} 票</span>
            </div>
          </div>
        </div>
      </div>

      <div class="detail-body">
        <div class="overview-section" v-if="video.overview">
          <p>{{ video.overview }}</p>
        </div>

        <div class="section" v-if="actors.length > 0">
          <h3>演职人员</h3>
          <div class="actor-list">
            <div class="actor-item" v-for="actor in actors" :key="actor.id">
              <img v-if="actor.imagePath || actor.imageUrl" :src="getVideoActorImageUrl(actor.id)" :alt="actor.name" class="actor-avatar" draggable="false" @error="onActorImageError" />
              <div v-else class="actor-avatar-placeholder">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <div class="actor-info">
                <span class="actor-name">{{ actor.name }}</span>
                <span class="actor-character" v-if="actor.character">{{ actor.character }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="section">
          <h3>文件信息</h3>
          <div class="file-card">
            <div class="file-row">
              <span class="file-label">文件名</span>
              <span class="file-value">{{ video.fileName }}</span>
            </div>
            <div class="file-row" v-if="video.fileSize">
              <span class="file-label">大小</span>
              <span class="file-value">{{ formatFileSize(video.fileSize) }}</span>
            </div>
          </div>
        </div>

        <div class="section">
          <h3>视频信息</h3>
          <div class="info-card">
            <div class="info-col-item" v-if="video.resolution || video.videoCodec || video.bitrateKbps">
              <div class="info-col-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
                  <line x1="7" y1="2" x2="7" y2="22"/>
                  <line x1="17" y1="2" x2="17" y2="22"/>
                  <line x1="2" y1="12" x2="22" y2="12"/>
                </svg>
                <span>视频</span>
              </div>
              <span class="info-col-detail">
                {{ [video.resolution, video.videoCodec, video.bitrateKbps ? video.bitrateKbps + ' kbps' : ''].filter(Boolean).join(' · ') || '--' }}
              </span>
            </div>
            <div class="info-col-item" v-if="video.audioCodec">
              <div class="info-col-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
                </svg>
                <span>音频</span>
              </div>
              <span class="info-col-detail">{{ video.audioCodec }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <VideoPlayer
      v-if="showPlayer && currentPlayVideo"
      :video-id="currentPlayVideo.id"
      :video-title="currentPlayVideo.title"
      @close="showPlayer = false"
    />

    <Teleport to="body">
      <div v-if="showTmdbSearch" class="modal-overlay" @click.self="showTmdbSearch = false">
        <div class="tmdb-modal">
          <div class="modal-header">
            <h2>搜索 TMDB 元数据</h2>
            <button class="modal-close" @click="showTmdbSearch = false">&times;</button>
          </div>
          <div class="modal-body">
            <div class="search-row">
              <input
                v-model="tmdbSearchQuery"
                class="tmdb-input"
                :placeholder="`搜索 ${video?.title || ''}...`"
                @keydown.enter="handleTmdbSearch"
              />
              <button class="search-btn" :disabled="tmdbSearching || !tmdbSearchQuery.trim()" @click="handleTmdbSearch">
                {{ tmdbSearching ? '搜索中...' : '搜索' }}
              </button>
            </div>

            <div v-if="tmdbSearchError" class="tmdb-error">{{ tmdbSearchError }}</div>

            <div v-if="tmdbResults.length > 0" class="tmdb-results">
              <div
                v-for="item in tmdbResults"
                :key="item.id"
                class="tmdb-card"
                :class="{ binding: bindingId === item.id }"
              >
                <img v-if="item.poster_path" :src="`https://image.tmdb.org/t/p/w200${item.poster_path}`" class="tmdb-poster" draggable="false" />
                <div v-else class="tmdb-poster-placeholder"></div>
                <div class="tmdb-info">
                  <div class="tmdb-title">{{ item.title || item.name }}</div>
                  <div class="tmdb-meta">
                    <span v-if="item.release_date || item.first_air_date">{{ (item.release_date || item.first_air_date)?.substring(0, 4) }}</span>
                    <span v-if="item.vote_average">评分 {{ item.vote_average.toFixed(1) }}</span>
                    <span class="tmdb-type">{{ item.media_type === 'tv' ? '电视剧' : '电影' }}</span>
                  </div>
                  <div class="tmdb-overview" v-if="item.overview">{{ item.overview.substring(0, 100) }}...</div>
                </div>
                <button
                  class="bind-btn"
                  :disabled="bindingId !== null"
                  @click="handleBindTmdb(item)"
                >
                  {{ bindingId === item.id ? '绑定中...' : '绑定' }}
                </button>
              </div>
            </div>

            <div v-else-if="tmdbSearched && !tmdbSearching" class="tmdb-empty">
              未找到相关结果
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { VideoDTO, SeriesDTO, VideoActor } from '@/types/backend'
import { getVideoById, getSeriesById, toggleVideoFavorite, getVideoPosterUrl, getVideoFanartUrl, getSeriesPosterUrl, getSeriesFanartUrl, deleteVideoProgress, getVideoActors, searchTmdb, bindTmdb, refreshTmdb, unbindTmdb } from '@/api/backend'
import VideoPlayer from '@/views/VideoPlayer.vue'

const router = useRouter()
const route = useRoute()

const video = ref<VideoDTO | null>(null)
const series = ref<SeriesDTO | null>(null)
const loading = ref(false)
const error = ref('')
const showPlayer = ref(false)
const actors = ref<VideoActor[]>([])

// TMDB search
const showTmdbSearch = ref(false)
const tmdbSearchQuery = ref('')
const tmdbResults = ref<any[]>([])
const tmdbSearching = ref(false)
const tmdbSearched = ref(false)
const tmdbSearchError = ref('')
const bindingId = ref<number | null>(null)
const refreshing = ref(false)

async function loadVideo() {
  const id = Number(route.params.id)
  if (!id) return

  loading.value = true
  error.value = ''
  series.value = null
  video.value = null

  try {
    const data = await getVideoById(id)
    if (data) {
      video.value = data
      if (data.isSeries && data.seriesId) {
        const seriesData = await getSeriesById(data.seriesId)
        if (seriesData) {
          series.value = seriesData
        }
      }
      try {
        actors.value = await getVideoActors(id)
      } catch {
        actors.value = []
      }
    } else {
      error.value = '视频不存在'
    }
  } catch (e) {
    error.value = '加载视频详情失败'
    console.error('Failed to load video:', e)
  } finally {
    loading.value = false
  }
}

async function handleTmdbSearch() {
  if (!tmdbSearchQuery.value.trim()) return
  tmdbSearching.value = true
  tmdbSearchError.value = ''
  tmdbSearched.value = false
  try {
    tmdbResults.value = await searchTmdb(tmdbSearchQuery.value.trim())
    tmdbSearched.value = true
  } catch (e) {
    tmdbSearchError.value = '搜索失败'
    console.error('TMDB search failed:', e)
  } finally {
    tmdbSearching.value = false
  }
}

async function handleBindTmdb(item: any) {
  const targetId = video.value?.id || series.value?.episodes[0]?.id
  if (!targetId || bindingId.value !== null) return
  bindingId.value = item.id
  tmdbSearchError.value = ''
  try {
    const updated = await bindTmdb(targetId, item.id, item.media_type)
    if (updated) {
      showTmdbSearch.value = false
      await loadVideo()
    }
  } catch (e) {
    tmdbSearchError.value = '绑定失败'
    console.error('Bind TMDB failed:', e)
  } finally {
    bindingId.value = null
  }
}

async function handleRefreshTmdb() {
  const targetId = video.value?.id || series.value?.episodes[0]?.id
  if (!targetId || refreshing.value) return
  refreshing.value = true
  try {
    const updated = await refreshTmdb(targetId)
    if (updated) {
      await loadVideo()
    }
  } catch (e) {
    console.error('Refresh TMDB failed:', e)
  } finally {
    refreshing.value = false
  }
}

async function handleUnbindTmdb() {
  const targetId = video.value?.id || series.value?.episodes[0]?.id
  if (!targetId) return
  if (!confirm('确定要解绑 TMDB 元数据吗？')) return
  try {
    const updated = await unbindTmdb(targetId)
    if (updated) {
      await loadVideo()
    }
  } catch (e) {
    console.error('Unbind TMDB failed:', e)
  }
}

function selectEpisode(episode: VideoDTO) {
  video.value = episode
}

function playEpisode(episode: VideoDTO) {
  video.value = episode
  showPlayer.value = true
}

async function resetAndPlay() {
  if (!video.value) return
  try {
    await deleteVideoProgress(video.value.id)
    video.value = { ...video.value, watchPosition: 0, watchProgressPercent: 0, watched: false }
    showPlayer.value = true
  } catch (e) {
    console.error('Failed to reset progress:', e)
  }
}

async function handleToggleFavorite() {
  if (!video.value) return
  try {
    const updated = await toggleVideoFavorite(video.value.id, !video.value.favorite)
    if (updated) {
      video.value = updated
    }
  } catch (e) {
    console.error('Failed to toggle favorite:', e)
  }
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h > 0 ? `${h} 小时 ${m} 分钟` : `${m} 分钟`
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
}

function onImageError(e: Event) {
  (e.target as HTMLImageElement).style.display = 'none'
}

function getVideoActorImageUrl(actorId: number): string {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || ''
  return `${baseUrl}/api/v1/video/actor/${actorId}/image`
}

function onActorImageError(e: Event) {
  (e.target as HTMLImageElement).style.display = 'none'
}

const currentPlayVideo = computed(() => {
  if (series.value && series.value.episodes) {
    const found = series.value.episodes.find(ep => ep.id === video.value?.id)
    return found || series.value.episodes[0]
  }
  return video.value
})

const currentDisplayInfo = computed(() => {
  if (video.value) {
    return {
      title: video.value.title,
      originalTitle: video.value.originalTitle,
      posterUrl: video.value.posterUrl || getVideoPosterUrl(video.value.id),
      backdropUrl: video.value.backdropUrl || getVideoFanartUrl(video.value.id),
      overview: video.value.overview,
      year: video.value.year
    }
  }
  if (series.value) {
    return {
      title: series.value.title,
      originalTitle: series.value.originalTitle,
      posterUrl: series.value.posterUrl || getSeriesPosterUrl(series.value.id),
      backdropUrl: series.value.backdropUrl || getSeriesFanartUrl(series.value.id),
      overview: series.value.overview,
      year: series.value.year
    }
  }
  return {
    title: '',
    originalTitle: '',
    posterUrl: '',
    backdropUrl: '',
    overview: '',
    year: 0
  }
})

const hasSeriesProgress = computed(() => {
  if (!series.value?.episodes) return false
  return series.value.episodes.some(ep => ep.watchPosition > 0 && !ep.watched)
})

watch(() => route.params.id, (newId) => {
  if (newId) {
    loadVideo()
  }
})

onMounted(loadVideo)
</script>

<style scoped>
.video-detail-view {
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

.scrape-spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.tmdb-modal {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  width: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border);
}

.modal-header h2 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
}

.modal-close:hover {
  color: var(--text-primary);
}

.modal-body {
  padding: 20px 24px;
  overflow-y: auto;
  flex: 1;
}

.search-row {
  display: flex;
  gap: 8px;
}

.tmdb-input {
  flex: 1;
  padding: 10px 14px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 14px;
  outline: none;
}

.tmdb-input:focus {
  border-color: var(--accent);
}

.search-btn {
  padding: 10px 18px;
  border-radius: var(--radius-md);
  background: var(--accent);
  color: white;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  white-space: nowrap;
}

.search-btn:hover:not(:disabled) {
  background: var(--accent-hover);
}

.search-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.tmdb-error {
  margin-top: 12px;
  padding: 10px 14px;
  border-radius: var(--radius-md);
  background: rgba(220, 53, 69, 0.1);
  color: #dc3545;
  font-size: 13px;
}

.tmdb-results {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tmdb-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  transition: var(--transition);
}

.tmdb-card.binding {
  opacity: 0.6;
}

.tmdb-poster {
  width: 50px;
  height: 75px;
  object-fit: cover;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}

.tmdb-poster-placeholder {
  width: 50px;
  height: 75px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}

.tmdb-info {
  flex: 1;
  min-width: 0;
}

.tmdb-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.tmdb-meta {
  display: flex;
  gap: 10px;
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 6px;
}

.tmdb-type {
  color: var(--accent);
}

.tmdb-overview {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.4;
}

.bind-btn {
  padding: 8px 16px;
  border-radius: var(--radius-md);
  background: var(--accent);
  color: white;
  border: none;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  flex-shrink: 0;
}

.bind-btn:hover:not(:disabled) {
  background: var(--accent-hover);
}

.bind-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.tmdb-empty {
  margin-top: 24px;
  text-align: center;
  color: var(--text-muted);
  font-size: 14px;
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

.hero-section {
  position: relative;
  min-height: 380px;
}

.backdrop {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.backdrop img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.backdrop-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.3) 0%,
    rgba(0, 0, 0, 0.6) 50%,
    var(--bg-primary) 100%
  );
}

.back-btn {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 5;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
  transition: var(--transition);
}

.back-btn:hover {
  background: rgba(0, 0, 0, 0.7);
}

.hero-body {
  position: relative;
  z-index: 2;
  display: flex;
  gap: 32px;
  padding: 60px 48px 40px;
  max-width: 1200px;
  margin: 0 auto;
}

.poster-col {
  flex-shrink: 0;
}

.poster-img {
  width: 200px;
  border-radius: var(--radius-lg);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  display: block;
}

.poster-placeholder {
  width: 200px;
  aspect-ratio: 2 / 3;
  border-radius: var(--radius-lg);
  background: var(--bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
}

.info-col {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.video-title {
  font-family: var(--font-display);
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
  line-height: 1.2;
}

.video-original-title {
  font-size: 15px;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.meta-line {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.meta-sep {
  color: var(--text-muted);
}

.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.tag {
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 4px;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  border: 1px solid var(--border);
}

.video-progress {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.action-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.play-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 28px;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
}

.play-btn:hover {
  background: var(--accent-hover);
}

.play-btn.secondary {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  border: 1px solid var(--border);
}

.play-btn.secondary:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.icon-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  background: var(--bg-tertiary);
  border: none;
  cursor: pointer;
  transition: var(--transition);
}

.icon-btn:hover {
  color: var(--text-primary);
  background: var(--bg-hover);
}

.icon-btn.active {
  color: var(--accent);
  background: var(--accent-glow);
}

.rating-row {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.rating-score {
  font-size: 20px;
  font-weight: 700;
  color: var(--accent);
}

.rating-vote {
  font-size: 13px;
  color: var(--text-muted);
}

.detail-body {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 48px 48px;
}

.overview-section {
  margin-bottom: 32px;
}

.overview-section p {
  font-size: 14px;
  line-height: 1.8;
  color: var(--text-secondary);
  white-space: pre-wrap;
}

.section {
  margin-bottom: 32px;
}

.section h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.actor-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.actor-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 80px;
}

.actor-avatar,
.actor-avatar-placeholder {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  overflow: hidden;
}

.actor-avatar {
  object-fit: cover;
}

.actor-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.actor-name {
  font-size: 12px;
  color: var(--text-secondary);
  text-align: center;
  word-break: break-all;
}

.actor-character {
  font-size: 11px;
  color: var(--text-muted);
  text-align: center;
}

.file-card,
.info-card {
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.file-row {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
}

.file-row:last-child {
  border-bottom: none;
}

.file-label {
  font-size: 13px;
  color: var(--text-muted);
  width: 80px;
  flex-shrink: 0;
}

.file-value {
  font-size: 13px;
  color: var(--text-primary);
  font-family: monospace;
  word-break: break-all;
}

.info-card {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}

.info-col-item {
  padding: 16px;
  border-right: 1px solid var(--border);
}

.info-col-item:last-child {
  border-right: none;
}

.info-col-icon {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.info-col-detail {
  font-size: 13px;
  color: var(--text-primary);
}



.episode-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.episode-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition);
}

.episode-item:hover {
  background: var(--bg-hover);
}

.episode-item.active {
  background: var(--accent-glow);
  border: 1px solid var(--accent);
}

.episode-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  flex-shrink: 0;
}

.episode-item.active .episode-number {
  background: var(--accent);
  color: white;
}

.episode-info {
  flex: 1;
  min-width: 0;
}

.episode-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.episode-file {
  font-size: 12px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.episode-progress {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
}

.progress-bar {
  flex: 1;
  height: 4px;
  background: var(--bg-tertiary);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--accent);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 11px;
  color: var(--text-muted);
  flex-shrink: 0;
}

.progress-text.watched {
  color: #2ecc71;
}

.episode-play {
  color: var(--text-muted);
  transition: var(--transition);
}

.episode-item:hover .episode-play {
  color: var(--accent);
}
</style>
