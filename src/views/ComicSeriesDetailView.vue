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
              :src="seriesCoverUrl"
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
          <p class="series-meta" v-if="series.serializationStart">连载开始：{{ series.serializationStart }}</p>
          <p class="series-summary" v-if="series.seriesSummary">{{ series.seriesSummary }}</p>
          <button class="anilist-btn" @click="showAnilistSearch = true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            搜索元数据
          </button>
        </div>
      </div>

      <div class="characters-section" v-if="characters.length > 0">
        <h2 class="section-title">角色</h2>
        <div class="characters-grid" @wheel.prevent="handleCharacterScroll">
          <div v-for="char in characters" :key="char.id" class="character-card">
            <img v-if="char.imagePath || char.imageUrl" :src="getComicCharacterImageUrl(char.id)" :alt="char.name" class="character-avatar" draggable="false" @error="onCharacterImageError" />
            <div v-else class="character-avatar-placeholder"></div>
            <div class="character-info">
              <div class="character-name">{{ char.name }}</div>
              <div class="character-original" v-if="char.originalName">{{ char.originalName }}</div>
              <div class="character-role" v-if="char.role">{{ char.role }}</div>
            </div>
          </div>
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
              :src="getComicCoverUrlWithCache(comic.id, comic.updatedAt)"
              :alt="comic.title"
              draggable="false"
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

    <Teleport to="body">
      <div v-if="showAnilistSearch" class="modal-overlay" @click.self="showAnilistSearch = false">
        <div class="anilist-modal">
          <div class="modal-header">
            <h2>搜索元数据</h2>
            <button class="modal-close" @click="showAnilistSearch = false">&times;</button>
          </div>
          <div class="modal-body">
            <div class="source-tabs">
              <button :class="['source-tab', { active: searchSource === 'bangumi' }]" @click="searchSource = 'bangumi'">Bangumi</button>
              <button :class="['source-tab', { active: searchSource === 'anilist' }]" @click="searchSource = 'anilist'">AniList</button>
            </div>

            <div class="bind-mode-row">
              <span class="bind-mode-label">绑定模式:</span>
              <label class="bind-mode-option" :class="{ active: bindMode === 'series' }">
                <input type="radio" v-model="bindMode" value="series" />
                <span>系列级（推荐）</span>
              </label>
              <label class="bind-mode-option" :class="{ active: bindMode === 'volume' }">
                <input type="radio" v-model="bindMode" value="volume" />
                <span>卷级</span>
              </label>
            </div>

            <div class="search-row">
              <input
                v-model="searchQuery"
                class="anilist-input"
                :placeholder="`搜索 ${series?.name || ''}...`"
                @keydown.enter="handleSearch"
              />
              <button class="search-btn" :disabled="searching || !searchQuery.trim()" @click="handleSearch">
                {{ searching ? '搜索中...' : '搜索' }}
              </button>
            </div>

            <div v-if="searchError" class="anilist-error">{{ searchError }}</div>

            <div v-if="bangumiResults.length > 0 && searchSource === 'bangumi'" class="anilist-results">
              <div
                v-for="item in bangumiResults"
                :key="item.id"
                class="anilist-card"
                :class="{ binding: bindingId === item.id }"
              >
                <img v-if="item.cover" :src="item.cover" class="anilist-cover" draggable="false" />
                <div class="anilist-info">
                  <div class="anilist-title">{{ item.name_cn || item.name }}</div>
                  <div class="anilist-meta">
                    <span v-if="item.score">评分 {{ item.score }}</span>
                    <span v-if="item.author">{{ item.author }}</span>
                  </div>
                  <div class="anilist-genres" v-if="item.tags?.length">
                    <span v-for="g in item.tags.slice(0, 4)" :key="g" class="genre-tag">{{ g }}</span>
                  </div>
                </div>
                <button
                  class="bind-btn"
                  :disabled="bindingId !== null"
                  @click="handleBindBangumi(item)"
                >
                  {{ bindingId === item.id ? '绑定中...' : '绑定' }}
                </button>
              </div>
            </div>

            <div v-if="anilistResults.length > 0 && searchSource === 'anilist'" class="anilist-results">
              <div
                v-for="item in anilistResults"
                :key="item.id"
                class="anilist-card"
                :class="{ binding: bindingId === item.id }"
              >
                <img
                  v-if="item.coverImage?.medium"
                  :src="item.coverImage.medium"
                  class="anilist-cover"
                  draggable="false"
                />
                <div class="anilist-info">
                  <div class="anilist-title">{{ item.title?.bestTitle || item.title?.romaji || '' }}</div>
                  <div class="anilist-meta">
                    <span v-if="item.meanScore">评分 {{ item.meanScore }}</span>
                    <span v-if="item.volumes">{{ item.volumes }} 卷</span>
                    <span v-if="item.status">{{ item.status }}</span>
                  </div>
                  <div class="anilist-genres" v-if="item.genres?.length">
                    <span v-for="g in item.genres.slice(0, 4)" :key="g" class="genre-tag">{{ g }}</span>
                  </div>
                </div>
                <button
                  class="bind-btn"
                  :disabled="bindingId !== null"
                  @click="handleBindAnilist(item)"
                >
                  {{ bindingId === item.id ? '绑定中...' : '绑定' }}
                </button>
              </div>
            </div>

            <div v-else-if="searched && !searching" class="anilist-empty">
              未找到相关结果
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { ComicSeries, ComicVolume, ComicProgress, AnilistMediaItem, BangumiItem, ComicCharacter } from '@/types/backend'
import { getComicSeries, getComicCoverUrl, getComicCoverUrlWithCache, getComicProgress, searchAnilistComics, bindAnilistMetadata, searchBangumiComics, bindBangumiMetadata, getComicCharacters, getComicCharacterImageUrl, getSeriesCoverUrl } from '@/api/backend'

const router = useRouter()
const route = useRoute()

const series = ref<ComicSeries | null>(null)
const loading = ref(false)
const error = ref('')
const comicProgressMap = ref<Map<number, ComicProgress>>(new Map())
const characters = ref<ComicCharacter[]>([])
const seriesCoverUrl = computed(() => {
  if (!series.value) return ''
  if (series.value.coverUrl) return getSeriesCoverUrl(series.value.coverUrl)
  const first = series.value.comics[0]
  if (first) return getComicCoverUrlWithCache(first.id, first.updatedAt)
  return ''
})
const showAnilistSearch = ref(false)
const searchSource = ref<'bangumi' | 'anilist'>('bangumi')
const searchQuery = ref('')
const bangumiResults = ref<BangumiItem[]>([])
const anilistResults = ref<AnilistMediaItem[]>([])
const searching = ref(false)
const searched = ref(false)
const searchError = ref('')
const bindingId = ref<number | null>(null)
const bindMode = ref<'series' | 'volume'>('series')

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
    try {
      const firstComic = series.value.comics[0]
      if (firstComic) {
        characters.value = await getComicCharacters(firstComic.id)
      }
    } catch {
      // 角色数据获取失败不影响主页面
    }
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

function handleCharacterScroll(e: WheelEvent) {
  const container = e.currentTarget as HTMLElement
  container.scrollLeft += e.deltaY
}

function onCharacterImageError(e: Event) {
  const img = e.target as HTMLImageElement
  img.style.display = 'none'
}

function viewComic(comic: ComicVolume) {
  router.push({ name: 'comic-detail', params: { id: comic.id } })
}


function onImageError(e: Event) {
  const img = e.target as HTMLImageElement
  img.style.display = 'none'
}

async function handleSearch() {
  if (!searchQuery.value.trim()) return
  searching.value = true
  searchError.value = ''
  searched.value = false
  try {
    if (searchSource.value === 'bangumi') {
      bangumiResults.value = await searchBangumiComics(searchQuery.value.trim())
      anilistResults.value = []
    } else {
      anilistResults.value = await searchAnilistComics(searchQuery.value.trim())
      bangumiResults.value = []
    }
    searched.value = true
  } catch (e) {
    searchError.value = '搜索失败'
    console.error('Search failed:', e)
  } finally {
    searching.value = false
  }
}

async function handleBindBangumi(item: BangumiItem) {
  if (!series.value || bindingId.value !== null) return
  bindingId.value = item.id
  searchError.value = ''
  try {
    if (bindMode.value === 'series') {
      await bindBangumiMetadata(series.value.comics[0].id, item.id, true)
    } else {
      for (const comic of series.value.comics) {
        await bindBangumiMetadata(comic.id, item.id, false)
      }
    }
    showAnilistSearch.value = false
    router.push({ name: 'comics' })
  } catch (e) {
    searchError.value = '绑定元数据失败'
    console.error('Bind failed:', e)
  } finally {
    bindingId.value = null
  }
}

async function handleBindAnilist(item: AnilistMediaItem) {
  if (!series.value || bindingId.value !== null) return
  bindingId.value = item.id
  searchError.value = ''
  try {
    if (bindMode.value === 'series') {
      await bindAnilistMetadata(series.value.comics[0].id, item.id, true)
    } else {
      for (const comic of series.value.comics) {
        await bindAnilistMetadata(comic.id, item.id, false)
      }
    }
    showAnilistSearch.value = false
    router.push({ name: 'comics' })
  } catch (e) {
    searchError.value = '绑定元数据失败'
    console.error('Bind failed:', e)
  } finally {
    bindingId.value = null
  }
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
  background: var(--bg-tertiary);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.cover-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: contain;
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

.series-meta {
  font-size: 13px;
  color: var(--text-secondary);
  margin-top: 8px;
}

.series-summary {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-top: 12px;
  max-height: 120px;
  overflow-y: auto;
}

.characters-section {
  padding: 0 32px 32px;
}

.characters-grid {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  scrollbar-width: none;
  padding: 4px;
}

.characters-grid::-webkit-scrollbar {
  display: none;
}

.character-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  flex-shrink: 0;
  width: 100px;
}

.character-avatar {
  width: 76px;
  height: 90px;
  border-radius: var(--radius-md);
  object-fit: cover;
  object-position: top;
  flex-shrink: 0;
  background: var(--bg-tertiary);
  margin-bottom: 8px;
}

.character-avatar-placeholder {
  width: 76px;
  height: 90px;
  border-radius: var(--radius-md);
  background: var(--bg-tertiary);
  flex-shrink: 0;
  margin-bottom: 8px;
}

.character-info {
  min-width: 0;
  text-align: center;
  width: 100%;
}

.character-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.character-original {
  font-size: 11px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.character-role {
  font-size: 10px;
  color: var(--accent);
  margin-top: 2px;
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
  aspect-ratio: 3/4;
  overflow: hidden;
  position: relative;
  background: var(--bg-tertiary);
}

.volume-cover img {
  width: 100%;
  height: 100%;
  object-fit: contain;
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

.anilist-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
  padding: 8px 14px;
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
}

.anilist-btn:hover {
  background: var(--accent);
  color: white;
  border-color: var(--accent);
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

.anilist-modal {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  width: 560px;
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

.source-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 16px;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  padding: 3px;
}

.source-tab {
  flex: 1;
  padding: 8px 0;
  border-radius: var(--radius-sm);
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
}

.source-tab.active {
  background: var(--bg-primary);
  color: var(--text-primary);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.bind-mode-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.bind-mode-label {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
}

.bind-mode-option {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  font-size: 12px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: var(--transition);
}

.bind-mode-option input {
  display: none;
}

.bind-mode-option.active {
  background: var(--accent);
  color: white;
  border-color: var(--accent);
}

.search-row {
  display: flex;
  gap: 8px;
}

.anilist-input {
  flex: 1;
  padding: 10px 14px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 14px;
  outline: none;
}

.anilist-input:focus {
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

.anilist-error {
  margin-top: 12px;
  padding: 10px 14px;
  border-radius: var(--radius-md);
  background: rgba(220, 53, 69, 0.1);
  color: #dc3545;
  font-size: 13px;
}

.anilist-results {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.anilist-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  transition: var(--transition);
}

.anilist-card.binding {
  opacity: 0.6;
}

.anilist-cover {
  width: 48px;
  height: 64px;
  object-fit: cover;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}

.anilist-info {
  flex: 1;
  min-width: 0;
}

.anilist-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.anilist-meta {
  display: flex;
  gap: 10px;
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 6px;
}

.anilist-genres {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.genre-tag {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  background: var(--bg-hover);
  color: var(--text-secondary);
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

.anilist-empty {
  margin-top: 24px;
  text-align: center;
  color: var(--text-muted);
  font-size: 14px;
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
