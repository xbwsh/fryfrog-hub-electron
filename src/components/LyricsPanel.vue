<template>
  <div class="lyrics-panel" :class="{ 'split-mode': layoutMode === 'split' }">
    <img v-if="playerStore.currentTrack" :src="playerStore.getTrackCoverArt(playerStore.currentTrack, 600)"
      class="lyrics-bg-image" alt="" />
    <div class="lyrics-bg-overlay" ref="bgOverlay"></div>

    <div class="lyrics-header">
      <h2>歌词</h2>
      <div class="header-actions">
        <span v-if="lyricsSource" class="lyrics-tag">{{ lyricsSource }}</span>
        <button class="mode-toggle-btn" @click="toggleLayoutMode"
          :title="layoutMode === 'full' ? '分屏模式' : '全屏模式'">
          <AppIcon :name="layoutMode === 'full' ? 'fullscreen' : 'fullscreen-exit'" :size="20" />
        </button>
        <button class="close-btn" @click="$emit('close')">
          <AppIcon name="close" :size="24" />
        </button>
      </div>
    </div>

    <div class="lyrics-body">
      <template v-if="layoutMode === 'split'">
        <div class="left-panel">
          <div class="vinyl-wrapper">
            <div class="vinyl-disc" :class="{ spinning: playerStore.isPlaying }">
              <img v-if="playerStore.currentTrack"
                :src="playerStore.getTrackCoverArt(playerStore.currentTrack, 400)" class="vinyl-cover" alt="封面" />
              <div class="vinyl-hole"></div>
            </div>
          </div>
          <div class="track-meta">
            <h3>{{ playerStore.currentTrack?.title || '未知歌曲' }}</h3>
            <p>{{ playerStore.currentTrack?.artist || '未知艺术家' }}</p>
          </div>
          <div class="controls">
            <button class="ctrl-btn star-btn" :class="{ starred: isStarred }" @click="toggleStarred" title="收藏">
              <AppIcon name="star" :size="20" :filled="isStarred" />
            </button>
            <button class="ctrl-btn" @click="playerStore.prevTrack" title="上一首">
              <AppIcon name="previous" :size="22" />
            </button>
            <button class="ctrl-btn play-btn" @click="playerStore.togglePlay" :disabled="!playerStore.currentTrack">
              <AppIcon :name="playerStore.isPlaying ? 'pause' : 'play'" :size="28" />
            </button>
            <button class="ctrl-btn" @click="playerStore.nextTrack" title="下一首">
              <AppIcon name="next" :size="22" />
            </button>
            <button class="ctrl-btn" @click="playerStore.cyclePlayMode" :title="playModeTitle">
              <AppIcon :name="playerStore.playMode === 'shuffle' ? 'shuffle' : playerStore.playMode === 'repeat_one' ? 'repeat-one' : playerStore.playMode === 'order' ? 'order' : 'repeat'" :size="20" />
            </button>
          </div>
          <div class="slider-row">
            <span class="time-label">{{ formatTime(playerStore.currentTime) }}</span>
            <input type="range" class="seek-slider" min="0" :max="playerStore.duration || 0" step="0.1"
              :value="playerStore.currentTime" @input="onSeekInput"
              :style="{ '--seek-pct': (playerStore.duration ? (playerStore.currentTime / playerStore.duration) * 100 : 0) + '%' }" />
            <span class="time-label">{{ formatTime(playerStore.duration) }}</span>
          </div>
        </div>
      </template>

      <div class="right-panel">
        <div v-if="layoutMode === 'full'" class="full-track-info">
          <h3>{{ playerStore.currentTrack?.title || '未知歌曲' }}</h3>
          <p>{{ playerStore.currentTrack?.artist || '未知艺术家' }}</p>
        </div>
        <div class="lyrics-scroll" ref="lyricsContainer">
          <div v-for="(lyric, index) in parsedLyrics" :key="index" class="lyric-line" :class="{
            active: index === currentLyricIndex,
            'near-active': Math.abs(index - currentLyricIndex) === 1,
            'far-active': Math.abs(index - currentLyricIndex) === 2
          }" @click="seekToLyric(lyric.time)">
            {{ lyric.text }}
          </div>
          <div v-if="parsedLyrics.length === 0" class="no-lyrics">
            <AppIcon name="edit" :size="64" />
            <p>暂无歌词</p>
          </div>
        </div>
        <div v-if="layoutMode === 'full'" class="lyrics-controls">
          <div class="controls">
            <button class="ctrl-btn star-btn" :class="{ starred: isStarred }" @click="toggleStarred" title="收藏">
              <AppIcon name="star" :size="20" :filled="isStarred" />
            </button>
            <button class="ctrl-btn" @click="playerStore.prevTrack" title="上一首">
              <AppIcon name="previous" :size="22" />
            </button>
            <button class="ctrl-btn play-btn" @click="playerStore.togglePlay" :disabled="!playerStore.currentTrack">
              <AppIcon :name="playerStore.isPlaying ? 'pause' : 'play'" :size="28" />
            </button>
            <button class="ctrl-btn" @click="playerStore.nextTrack" title="下一首">
              <AppIcon name="next" :size="22" />
            </button>
            <button class="ctrl-btn" @click="playerStore.cyclePlayMode" :title="playModeTitle">
              <AppIcon :name="playerStore.playMode === 'shuffle' ? 'shuffle' : playerStore.playMode === 'repeat_one' ? 'repeat-one' : playerStore.playMode === 'order' ? 'order' : 'repeat'" :size="20" />
            </button>
          </div>
          <div class="slider-row">
            <span class="time-label">{{ formatTime(playerStore.currentTime) }}</span>
            <input type="range" class="seek-slider" min="0" :max="playerStore.duration || 0" step="0.1"
              :value="playerStore.currentTime" @input="onSeekInput"
              :style="{ '--seek-pct': (playerStore.duration ? (playerStore.currentTime / playerStore.duration) * 100 : 0) + '%' }" />
            <span class="time-label">{{ formatTime(playerStore.duration) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePlayerStore } from '@/stores/player'
import { getLyrics, toggleFavorite } from '@/api/backend'
import { computed, ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import AppIcon from '@/components/AppIcon.vue'

const playerStore = usePlayerStore()
defineEmits(['close'])

const lyricsContainer = ref<HTMLElement>()
const bgOverlay = ref<HTMLElement>()
let bgAnimationFrame: number | null = null

const layoutMode = ref<'full' | 'split'>('full')
const lyricsSource = ref<'内嵌' | '外挂' | ''>('')
const fetchedLyrics = ref('')

const isStarred = computed(() => {
  if (!playerStore.currentTrack) return false
  return playerStore.currentTrack.favorite
})

async function toggleStarred() {
  if (!playerStore.currentTrack) return
  const track = playerStore.currentTrack
  try {
    const updated = await toggleFavorite(track.id, !track.favorite)
    if (updated) track.favorite = updated.favorite
  } catch {
    // silent
  }
}

function toggleLayoutMode() {
  layoutMode.value = layoutMode.value === 'full' ? 'split' : 'full'
  localStorage.setItem('lyricsLayoutMode', layoutMode.value)
}

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function onSeekInput(e: Event) {
  const val = parseFloat((e.target as HTMLInputElement).value)
  playerStore.seekTo(val)
}

const playModeTitle = computed(() => {
  const titles: Record<string, string> = {
    order: '顺序播放', shuffle: '随机播放', repeat_all: '列表循环', repeat_one: '单曲循环'
  }
  return titles[playerStore.playMode]
})

function animateBackground() {
  if (!bgOverlay.value) return
  const wave = Math.sin(Date.now() / 2000) * 0.1 + 0.95
  bgOverlay.value.style.opacity = String(0.5 + wave * 0.1)
  bgAnimationFrame = requestAnimationFrame(animateBackground)
}

watch(() => playerStore.isPlaying, (isPlaying) => {
  if (isPlaying) {
    animateBackground()
  } else if (bgAnimationFrame) {
    cancelAnimationFrame(bgAnimationFrame)
    if (bgOverlay.value) bgOverlay.value.style.opacity = '0.6'
  }
})

function handleKeydown(e: KeyboardEvent) {
  if (e.code === 'Space' && playerStore.currentTrack) {
    e.preventDefault()
    playerStore.togglePlay()
  }
}

onMounted(() => {
  const saved = localStorage.getItem('lyricsLayoutMode') as 'full' | 'split' | null
  if (saved) layoutMode.value = saved
  if (playerStore.isPlaying) animateBackground()
  window.addEventListener('keydown', handleKeydown)
  loadLyrics()
})

watch(() => playerStore.currentTrack, () => {
  loadLyrics()
})

onUnmounted(() => {
  if (bgAnimationFrame) cancelAnimationFrame(bgAnimationFrame)
  window.removeEventListener('keydown', handleKeydown)
})

const currentLyrics = computed(() => {
  if (!playerStore.currentTrack) return ''
  if ('lyrics' in playerStore.currentTrack && playerStore.currentTrack.lyrics) {
    return playerStore.currentTrack.lyrics
  }
  return fetchedLyrics.value
})

async function loadLyrics() {
  fetchedLyrics.value = ''
  lyricsSource.value = ''
  if (!playerStore.currentTrack) return

  const track = playerStore.currentTrack

  if (track.lyrics) {
    lyricsSource.value = '内嵌'
    return
  }
  try {
    const lyrics = await getLyrics(track.id)
    if (lyrics) {
      fetchedLyrics.value = lyrics
      lyricsSource.value = '外挂'
    }
  } catch {
    // silent
  }
}

const parsedLyrics = computed(() => {
  if (!currentLyrics.value) return []
  const lines = currentLyrics.value.split('\n')
  const result: { time: number; text: string }[] = []
  const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/
  for (const line of lines) {
    const match = line.match(timeRegex)
    if (match) {
      const mins = parseInt(match[1])
      const secs = parseInt(match[2])
      const ms = parseInt(match[3])
      const time = mins * 60 + secs + ms / 1000
      const text = line.replace(timeRegex, '').trim()
      if (text) result.push({ time, text })
    }
  }
  return result
})

const currentLyricIndex = computed(() => {
  const lyrics = parsedLyrics.value
  if (!lyrics.length) return -1
  for (let i = lyrics.length - 1; i >= 0; i--) {
    if (playerStore.currentTime >= lyrics[i].time) return i
  }
  return -1
})

watch(currentLyricIndex, async (newIndex, oldIndex) => {
  if (newIndex !== oldIndex && lyricsContainer.value) {
    await nextTick()
    const active = lyricsContainer.value.querySelector('.lyric-line.active')
    active?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
})

function seekToLyric(time: number) {
  if (playerStore.duration > 0) playerStore.seekTo(time)
}
</script>

<style scoped>
.lyrics-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  background: var(--bg-primary);
  overflow: hidden;
  color: #fff;
}

.lyrics-bg-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
  filter: blur(60px) brightness(0.7);
}

.lyrics-bg-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 0;
}

.lyrics-header {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(20px);
  flex-shrink: 0;
}

.lyrics-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mode-toggle-btn,
.close-btn {
  background: none;
  border: none;
  color: #fff;
  opacity: 0.7;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s;
}

.mode-toggle-btn:hover,
.close-btn:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.1);
}

.lyrics-tag {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

/* ===== body ===== */
.lyrics-body {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* ===== left panel (split) ===== */
.left-panel {
  flex: 0 0 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 32px;
  padding: 40px;
}

.vinyl-wrapper {
  width: 380px;
  height: 380px;
}

.vinyl-disc {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  position: relative;
  background: radial-gradient(circle, #222 0%, #111 60%, #000 100%);
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
}

.vinyl-disc::before {
  content: '';
  position: absolute;
  inset: 8px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.vinyl-disc::after {
  content: '';
  position: absolute;
  inset: 30%;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.04);
}

.vinyl-disc.spinning {
  animation: spin 8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.vinyl-cover {
  width: 65%;
  height: 65%;
  border-radius: 50%;
  object-fit: cover;
}

.vinyl-hole {
  position: absolute;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #1a1a1a;
  border: 2px solid #333;
  z-index: 1;
}

.track-meta {
  text-align: center;
}

.track-meta h3 {
  margin: 0 0 4px;
  font-size: 22px;
  font-weight: 600;
}

.track-meta p {
  margin: 0;
  font-size: 16px;
  opacity: 0.7;
}

/* ===== controls ===== */
.controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.ctrl-btn {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s;
}

.ctrl-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.play-btn {
  width: 72px;
  height: 72px;
  background: #fff;
  color: #000;
}

.play-btn:hover {
  transform: scale(1.08);
}

.play-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  transform: none;
}

.star-btn {
  color: rgba(255, 255, 255, 0.5);
}

.star-btn:hover {
  color: #f39c12;
}

.star-btn.starred {
  color: #f39c12;
}

.lyrics-controls {
  margin-top: auto;
  padding: 24px 40px;
}

.lyrics-controls .controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
}

.lyrics-controls .slider-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: 16px auto 0;
  width: 100%;
  max-width: 400px;
}

/* ===== slider row ===== */
.slider-row {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  max-width: 300px;
}

.time-label {
  font-size: 12px;
  opacity: 0.6;
  min-width: 36px;
  text-align: center;
  font-variant-numeric: tabular-nums;
}

.seek-slider {
  flex: 1;
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  background: linear-gradient(to right, var(--accent) 0%, var(--accent) var(--seek-pct, 0%), rgba(255, 255, 255, 0.2) var(--seek-pct, 0%), rgba(255, 255, 255, 0.2) 100%);
  border-radius: 2px;
  outline: none;
  cursor: pointer;
}

.seek-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #fff;
  cursor: pointer;
}

.seek-slider::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #fff;
  border: none;
  cursor: pointer;
}

/* ===== right panel (lyrics) ===== */
.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 40px 56px;
}

.full-track-info {
  text-align: center;
  margin-bottom: 28px;
}

.full-track-info h3 {
  margin: 0 0 4px;
  font-size: 24px;
  font-weight: 700;
}

.full-track-info p {
  margin: 0;
  font-size: 16px;
  opacity: 0.7;
}

.lyrics-scroll {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
  align-items: center;
  text-align: center;
}

.lyrics-scroll::-webkit-scrollbar {
  width: 0;
}

.lyric-line {
  font-size: 28px;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.35);
  cursor: pointer;
  padding: 8px 24px;
  border-radius: 8px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
  transform: scale(0.95);
  max-width: 100%;
  word-wrap: break-word;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
}

.lyric-line:hover {
  color: rgba(255, 255, 255, 0.7);
}

.lyric-line.far-active {
  color: rgba(255, 255, 255, 0.5);
  transform: scale(0.98);
}

.lyric-line.near-active {
  color: rgba(255, 255, 255, 0.7);
  transform: scale(1);
}

.lyric-line.active {
  font-size: 38px;
  font-weight: 700;
  color: #fff;
  transform: scale(1.05);
}

.lyric-line.active .lyric-text,
.lyric-line.active {
  text-shadow:
    0 0 15px rgba(232, 93, 74, 0.9),
    0 0 30px rgba(232, 93, 74, 0.6),
    0 0 45px rgba(232, 93, 74, 0.4),
    0 2px 8px rgba(0, 0, 0, 0.8);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {

  0%,
  100% {
    text-shadow:
      0 0 15px rgba(232, 93, 74, 0.9),
      0 0 30px rgba(232, 93, 74, 0.6),
      0 0 45px rgba(232, 93, 74, 0.4),
      0 2px 8px rgba(0, 0, 0, 0.8);
  }

  50% {
    text-shadow:
      0 0 20px rgba(232, 93, 74, 1),
      0 0 40px rgba(232, 93, 74, 0.8),
      0 0 60px rgba(232, 93, 74, 0.5),
      0 2px 8px rgba(0, 0, 0, 0.8);
  }
}

.no-lyrics {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  opacity: 0.4;
}

.no-lyrics p {
  margin: 0;
  font-size: 16px;
}


</style>
