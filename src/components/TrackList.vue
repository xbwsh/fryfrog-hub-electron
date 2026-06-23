<template>
  <div class="track-list-container">
    <div class="track-list-header">
      <span>#</span>
      <span class="col-title">标题</span>
      <span class="col-album">专辑</span>
      <span class="col-duration">时长</span>
    </div>

    <div class="track-list" v-if="tracks.length > 0">
      <div
        v-for="(track, index) in tracks"
        :key="track.id"
        class="track-row"
        :class="{ playing: playerStore.currentTrack?.id === track.id }"
        @click="playTrack(track)"
      >
        <span class="track-number">
          <span v-if="playerStore.currentTrack?.id === track.id && playerStore.isPlaying">
            ♪
          </span>
          <span v-else>{{ index + 1 }}</span>
        </span>
        <span class="col-title">
          <span class="track-name">{{ track.title }}</span>
          <span class="track-artist">{{ track.artist }}</span>
        </span>
        <span class="col-album">{{ track.album }}</span>
        <span class="col-duration">{{ formatDuration(track.durationSeconds) }}</span>
      </div>
    </div>

    <div v-else-if="loading" class="empty-state">
      <div class="loading-spinner">加载中...</div>
    </div>

    <div v-else class="empty-state">
      <p>暂无歌曲</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MusicTrack } from '@/types/backend'
import { usePlayerStore } from '@/stores/player'

const props = defineProps<{
  tracks: MusicTrack[]
  loading?: boolean
}>()

const playerStore = usePlayerStore()

function formatDuration(seconds: number): string {
  if (!seconds) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function playTrack(track: MusicTrack) {
  playerStore.playTrack(track, props.tracks)
}
</script>

<style scoped>
.track-list-container {
  flex: 1;
  overflow-y: auto;
}

.track-list-header {
  display: grid;
  grid-template-columns: 40px 1fr 200px 60px;
  padding: 8px 16px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-muted);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  background: var(--bg-primary);
  z-index: 1;
}

.track-list {
  padding: 4px 0;
}

.track-row {
  display: grid;
  grid-template-columns: 40px 1fr 200px 60px;
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  transition: var(--transition);
  cursor: pointer;
}

.track-row:hover {
  background: var(--bg-hover);
}

.track-row.playing {
  background: rgba(232, 93, 74, 0.08);
}

.track-number {
  color: var(--text-muted);
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.track-row:hover .track-number {
  color: var(--text-secondary);
}

.col-title {
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow: hidden;
}

.track-name {
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-artist {
  font-size: 12px;
  color: var(--text-muted);
}

.track-row.playing .track-name {
  color: var(--accent);
}

.col-album {
  font-size: 13px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.col-duration {
  font-size: 13px;
  color: var(--text-muted);
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--text-muted);
  font-size: 14px;
}

.loading-spinner {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
</style>
