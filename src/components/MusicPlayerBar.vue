<template>
  <div class="music-player-bar" v-if="playerStore.currentTrack">
    <div class="player-left">
      <div class="track-cover" @click="$emit('toggle-lyrics')">
        <img v-if="playerStore.currentTrack" :src="playerStore.getTrackCoverArt(playerStore.currentTrack, 60)"
          alt="封面" />
      </div>
      <div class="track-info">
        <span class="track-title">{{ playerStore.currentTrack.title }}</span>
        <span class="track-artist">{{ playerStore.currentTrack.artist }}</span>
      </div>
    </div>

    <div class="player-center">
      <div class="player-controls">
        <button class="control-btn star-btn" :class="{ starred: isFavorite }" @click="toggleFavoriteStatus" title="收藏">
          <AppIcon name="star" :size="16" :filled="isFavorite" />
        </button>
        <button class="control-btn" @click="playerStore.prevTrack" title="上一首">
          <AppIcon name="previous" :size="18" />
        </button>

        <button class="control-btn play-btn" @click="playerStore.togglePlay">
          <AppIcon :name="playerStore.isPlaying ? 'pause' : 'play'" :size="20" />
        </button>

        <button class="control-btn" @click="playerStore.nextTrack" title="下一首">
          <AppIcon name="next" :size="18" />
        </button>

        <button class="control-btn mode-btn" @click="playerStore.cyclePlayMode" :title="playModeTitle">
          <AppIcon :name="playerStore.playMode === 'shuffle' ? 'shuffle' : playerStore.playMode === 'repeat_one' ? 'repeat-one' : playerStore.playMode === 'order' ? 'order' : 'repeat'" :size="16" />
        </button>
      </div>

      <div class="progress-bar">
        <span class="time">{{ formatTime(playerStore.currentTime) }}</span>
        <div class="progress-track" @click="seek">
          <div class="progress-fill" :style="{ width: playerStore.progress + '%' }"></div>
        </div>
        <span class="time">{{ formatTime(playerStore.duration) }}</span>
      </div>
    </div>

    <div class="player-right">
      <div class="volume-control">
        <AppIcon :name="playerStore.volume === 0 ? 'volume-mute' : playerStore.volume < 0.33 ? 'volume-low' : playerStore.volume < 0.66 ? 'volume' : 'volume-high'" :size="16" />
        <input type="range" min="0" max="1" step="0.01" :value="playerStore.volume"
          @input="setVolume" class="volume-slider" :style="{ '--volume-percent': (playerStore.volume * 100) + '%' }" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { usePlayerStore } from '@/stores/player'
import { toggleFavorite } from '@/api/backend'
import AppIcon from '@/components/AppIcon.vue'

const playerStore = usePlayerStore()

defineEmits(['toggle-lyrics'])

const isFavorite = ref(false)

watch(() => playerStore.currentTrack, (track) => {
  if (track && 'favorite' in track) {
    isFavorite.value = track.favorite
  } else {
    isFavorite.value = false
  }
}, { immediate: true })

const playModeTitle = computed(() => {
  const titles = {
    order: '顺序播放',
    shuffle: '随机播放',
    repeat_all: '列表循环',
    repeat_one: '单曲循环',
  }
  return titles[playerStore.playMode]
})

async function toggleFavoriteStatus() {
  if (!playerStore.currentTrack || !('favorite' in playerStore.currentTrack)) return
  const track = playerStore.currentTrack
  try {
    const updated = await toggleFavorite(track.id as number, !track.favorite)
    if (updated) {
      isFavorite.value = updated.favorite
      track.favorite = updated.favorite
    }
  } catch (e) {
    console.error('Failed to toggle favorite:', e)
  }
}

function setVolume(e: Event) {
  const val = parseFloat((e.target as HTMLInputElement).value)
  playerStore.setVolume(val)
}

function seek(e: MouseEvent) {
  const rect = (e.target as HTMLElement).getBoundingClientRect()
  const percent = (e.clientX - rect.left) / rect.width
  playerStore.seekTo(percent * playerStore.duration)
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
</script>

<style scoped>
.music-player-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 72px;
  padding: 0 20px;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border);
  gap: 16px;
}

.player-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  flex: 1;
}

.track-cover {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  overflow: hidden;
  flex-shrink: 0;
  background: var(--bg-tertiary);
  cursor: pointer;
  transition: var(--transition);
}

.track-cover:hover {
  transform: scale(1.05);
}

.track-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.track-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.track-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-artist {
  font-size: 12px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.player-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex: 2;
  max-width: 500px;
}

.player-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.control-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--transition);
}

.control-btn:hover {
  color: var(--text-primary);
}

.play-btn {
  width: 40px;
  height: 40px;
  background: var(--accent);
  color: white;
}

.play-btn:hover {
  background: var(--accent-hover);
  transform: scale(1.05);
}

.mode-btn.active {
  color: var(--accent);
}

.star-btn {
  color: var(--text-muted);
}

.star-btn.starred {
  color: #f39c12;
}

.star-btn:hover {
  color: #f39c12;
}

.lyrics-btn {
  color: var(--text-muted);
}

.lyrics-btn:hover {
  color: var(--accent);
}

.progress-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.time {
  font-size: 11px;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
  min-width: 35px;
}

.progress-track {
  flex: 1;
  height: 4px;
  background: var(--bg-tertiary);
  border-radius: 2px;
  cursor: pointer;
  overflow: hidden;
}

.progress-track:hover {
  height: 6px;
}

.progress-fill {
  height: 100%;
  background: var(--accent);
  border-radius: 2px;
  transition: width 0.1s linear;
}

.player-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex: 1;
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
}

.volume-slider {
  width: 80px;
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  background: linear-gradient(to right, var(--accent) 0%, var(--accent) var(--volume-percent, 80%), var(--bg-tertiary) var(--volume-percent, 80%), var(--bg-tertiary) 100%);
  border-radius: 2px;
  outline: none;
  cursor: pointer;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: white;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
}

.volume-slider::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: white;
  cursor: pointer;
  border: none;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
}


</style>
