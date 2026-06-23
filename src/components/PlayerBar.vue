<template>
  <div class="player-bar">
    <div class="player-left">
      <div class="cover-wrapper" @click="toggleLyricsPanel">
        <img v-if="playerStore.currentTrack" :src="playerStore.getTrackCoverArt(playerStore.currentTrack, 60)"
          class="player-cover" :class="{ rotating: playerStore.isPlaying }" alt="封面" />
        <div class="cover-overlay" v-if="currentLyrics">
          <AppIcon name="edit" :size="20" />
        </div>
      </div>
      <div class="track-info">
        <div class="track-text" v-if="playerStore.currentTrack">
          <span class="track-title">{{ playerStore.currentTrack.title }}</span>
          <span class="track-artist">{{ playerStore.currentTrack.artist }}</span>
        </div>
        <div v-else class="track-text empty">
          <span class="placeholder">选择一首歌曲开始播放</span>
        </div>
        <div v-if="currentLyrics && showLyrics" class="lyrics-preview">
          {{ currentLyrics }}
        </div>
      </div>
    </div>

    <div class="player-center">
      <div class="player-controls">
        <button class="control-btn star-btn" :class="{ starred: isStarred }" @click="toggleStarred" title="收藏">
          <AppIcon name="star" :size="16" :filled="isStarred" />
        </button>
        <button class="control-btn" @click="playerStore.prevTrack" title="上一首">
          <AppIcon name="previous" :size="18" />
        </button>

        <button class="control-btn play-main" @click="playerStore.togglePlay" :disabled="!playerStore.currentTrack">
          <AppIcon :name="playerStore.isPlaying ? 'pause' : 'play'" :size="20" />
        </button>

        <button class="control-btn" @click="playerStore.nextTrack" title="下一首">
          <AppIcon name="next" :size="18" />
        </button>

        <button class="control-btn active" @click="playerStore.cyclePlayMode" :title="playModeTitle">
          <AppIcon :name="playerStore.playMode === 'shuffle' ? 'shuffle' : playerStore.playMode === 'repeat_one' ? 'repeat-one' : playerStore.playMode === 'order' ? 'order' : 'repeat'" :size="16" />
        </button>

      </div>

      <div class="player-progress">
        <span class="time">{{ formatTime(playerStore.currentTime) }}/{{ formatTime(playerStore.duration) }}</span>
        <div class="progress-bar" @click="seekTo($event)">
          <div class="progress-fill" :style="{ width: playerStore.progress + '%' }">
            <div class="progress-thumb"></div>
          </div>
        </div>
      </div>
    </div>

    <div class="player-volume">
      <AppIcon :name="playerStore.volume === 0 ? 'volume-mute' : playerStore.volume > 0.5 ? 'volume' : 'volume-low'" :size="16" />
      <div class="volume-bar" @mousedown="onVolumeMouseDown" @click="onVolumeBarClick">
        <div class="volume-fill" :style="{ width: (playerStore.volume * 100) + '%' }"></div>
        <div class="volume-thumb" :style="{ left: (playerStore.volume * 100) + '%' }"></div>
      </div>
    </div>

  </div>

</template>

<script setup lang="ts">
import { usePlayerStore } from '@/stores/player'
import { useLibraryStore } from '@/stores/library'
import { computed, ref, watch } from 'vue'
import AppIcon from '@/components/AppIcon.vue'

const playerStore = usePlayerStore()
const libraryStore = useLibraryStore()

const emit = defineEmits(['toggle-lyrics'])

const currentLyrics = ref('')
const showLyrics = ref(false)

const isStarred = computed(() => {
  if (!playerStore.currentTrack) return false
  return libraryStore.isTrackStarred(String(playerStore.currentTrack.id))
})

const playModeTitle = computed(() => {
  const titles = {
    order: '顺序播放',
    shuffle: '随机播放',
    repeat_all: '列表循环',
    repeat_one: '单曲循环'
  }
  return titles[playerStore.playMode]
})

function parseEmbeddedLyrics(lyricsString: string): string {
  try {
    const lyricsData = JSON.parse(lyricsString)
    if (!Array.isArray(lyricsData) || lyricsData.length === 0) return ''

    const lines: string[] = []
    const lyricObj = lyricsData[0]

    if (lyricObj.line && Array.isArray(lyricObj.line)) {
      for (const line of lyricObj.line) {
        if (line.start !== undefined && line.value) {
          const timeMs = line.start
          const mins = Math.floor(timeMs / 60000)
          const secs = Math.floor((timeMs % 60000) / 1000)
          const ms = Math.floor(timeMs % 1000)
          const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`
          lines.push(`[${timeStr}]${line.value}`)
        }
      }
    }

    return lines.join('\n')
  } catch {
    return ''
  }
}

async function loadLyrics() {
  if (!playerStore.currentTrack) return
  currentLyrics.value = ''
  libraryStore.currentLyrics = ''

  if (playerStore.currentTrack.lyrics) {
    const embeddedLyrics = parseEmbeddedLyrics(playerStore.currentTrack.lyrics)
    if (embeddedLyrics) {
      currentLyrics.value = embeddedLyrics
      libraryStore.currentLyrics = embeddedLyrics
      showLyrics.value = true
      return
    }
  }

  try {
    const lyrics = await libraryStore.fetchLyrics(
      playerStore.currentTrack.artist || '',
      playerStore.currentTrack.title || '',
      String(playerStore.currentTrack.id)
    )
    currentLyrics.value = lyrics
    showLyrics.value = currentLyrics.value.length > 0
  } catch {
    showLyrics.value = false
  }
}

async function toggleStarred() {
  if (!playerStore.currentTrack) return
  if (playerStore.currentTrack && 'coverArt' in playerStore.currentTrack) {
    await libraryStore.toggleStar(String(playerStore.currentTrack.id), isStarred.value, playerStore.currentTrack)
  }
}

function toggleLyricsPanel() {
  emit('toggle-lyrics')
}

watch(() => playerStore.currentTrack, () => {
  loadLyrics()
})

function updateVolumeFromMouse(e: MouseEvent) {
  const bar = document.querySelector('.volume-bar') as HTMLElement
  if (!bar) return
  const rect = bar.getBoundingClientRect()
  const percent = (e.clientX - rect.left) / rect.width
  const volume = Math.max(0, Math.min(1, percent))
  playerStore.setVolume(volume)
}

function onVolumeMouseDown(e: MouseEvent) {
  e.preventDefault()
  updateVolumeFromMouse(e)
  document.addEventListener('mousemove', onVolumeMouseMove)
  document.addEventListener('mouseup', onVolumeMouseUp)
}

function onVolumeMouseMove(e: MouseEvent) {
  updateVolumeFromMouse(e)
}

function onVolumeMouseUp() {
  document.removeEventListener('mousemove', onVolumeMouseMove)
  document.removeEventListener('mouseup', onVolumeMouseUp)
}

function onVolumeBarClick(e: MouseEvent) {
  const bar = e.currentTarget as HTMLElement
  const rect = bar.getBoundingClientRect()
  const percent = (e.clientX - rect.left) / rect.width
  const volume = Math.max(0, Math.min(1, percent))
  playerStore.setVolume(volume)
}

function seekTo(e: MouseEvent) {
  const bar = e.currentTarget as HTMLElement
  const rect = bar.getBoundingClientRect()
  const percent = (e.clientX - rect.left) / rect.width
  playerStore.seekTo(percent * playerStore.duration)
}

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

</script>

<style scoped>
.player-bar {
  position: relative;
  height: 80px;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border);
  display: grid;
  grid-template-columns: 280px 1fr 120px;
  align-items: center;
  padding: 0 24px;
  gap: 24px;
  flex-shrink: 0;
}

.player-left {
  display: flex;
  align-items: center;
  gap: 14px;
  overflow: hidden;
}

.track-info {
  flex: 1;
  min-width: 0;
}

.error-message {
  font-size: 12px;
  color: var(--accent);
  width: 100%;
  margin-top: 4px;
}

.player-cover {
  width: 50px;
  height: 50px;
  border-radius: var(--radius-sm);
  object-fit: cover;
  flex-shrink: 0;
}

.track-text {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}

.track-text.empty {
  justify-content: center;
}

.placeholder {
  color: var(--text-muted);
  font-size: 13px;
}

.track-title {
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-artist {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 2px;
}

.player-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.player-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.control-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: var(--text-secondary);
  transition: var(--transition);
}

.control-btn:hover {
  color: var(--text-primary);
  background: var(--bg-hover);
}

.control-btn.active {
  color: var(--accent);
}

.repeat-badge {
  font-size: 9px;
  font-weight: 700;
  position: absolute;
  top: 2px;
  right: 4px;
}

.play-main {
  width: 40px;
  height: 40px;
  background: var(--text-primary);
  color: var(--bg-primary) !important;
}

.play-main:hover {
  transform: scale(1.05);
}

.play-main:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.player-progress {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  max-width: 600px;
}

.time {
  font-size: 12px;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
  min-width: 70px;
  text-align: left;
}

.progress-bar {
  flex: 1;
  height: 4px;
  background: var(--bg-hover);
  border-radius: 2px;
  cursor: pointer;
  position: relative;
  transition: height 0.15s ease;
}

.progress-bar:hover {
  height: 6px;
}

.progress-fill {
  height: 100%;
  background: var(--text-primary);
  border-radius: 2px;
  position: relative;
  transition: width 0.1s linear;
}

.progress-bar:hover .progress-fill {
  background: var(--accent);
}

.progress-thumb {
  position: absolute;
  right: -5px;
  top: 50%;
  transform: translateY(-50%);
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: white;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  opacity: 0;
  transition: opacity 0.15s ease;
}

.progress-bar:hover .progress-thumb {
  opacity: 1;
}

.player-volume {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: flex-end;
}

.volume-bar {
  width: 80px;
  height: 4px;
  background: var(--bg-hover);
  border-radius: 2px;
  cursor: pointer;
  position: relative;
}

.volume-fill {
  height: 100%;
  background: var(--text-primary);
  border-radius: 2px;
  transition: width 0.1s linear;
}

.volume-bar:hover .volume-fill {
  background: var(--accent);
}

.volume-thumb {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--text-primary);
  opacity: 0;
  transition: opacity 0.15s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.volume-bar:hover .volume-thumb {
  opacity: 1;
}

.volume-bar:hover .volume-thumb {
  background: var(--accent);
}

.lyrics-preview {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-style: italic;
}

.control-btn.star-btn:hover {
  color: var(--accent);
  background: rgba(232, 93, 74, 0.1);
}

.control-btn.star-btn.starred {
  color: var(--accent);
}

.cover-wrapper {
  position: relative;
  cursor: pointer;
  border-radius: 50%;
  overflow: hidden;
}

.player-cover {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  transition: transform 0.3s ease;
}

.player-cover.rotating {
  animation: rotate 8s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.cover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
  color: white;
}

.cover-wrapper:hover .cover-overlay {
  opacity: 1;
}

.lyrics-panel-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.lyrics-panel {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  width: 90%;
  max-width: 500px;
  max-height: 70vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}



.lyrics-panel-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  border-bottom: 1px solid var(--border);
  position: relative;
}

.lyrics-panel-cover {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
}

.lyrics-panel-cover.rotating {
  animation: rotate 8s linear infinite;
}

.lyrics-panel-info {
  flex: 1;
}

.lyrics-panel-info h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 4px;
}

.lyrics-panel-info p {
  font-size: 14px;
  color: var(--text-muted);
}
</style>
