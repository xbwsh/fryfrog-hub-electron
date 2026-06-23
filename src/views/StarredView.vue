<template>
  <div class="starred-view">
    <div class="view-header">
      <h1>收藏歌曲</h1>
      <button
        v-if="libraryStore.starredTracks.length > 0"
        class="play-all-btn"
        @click="playAllStarred"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z"/>
        </svg>
        <span>播放全部</span>
      </button>
    </div>

    <TrackList
      :tracks="libraryStore.starredTracks"
      :loading="libraryStore.loading"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useLibraryStore } from '@/stores/library'
import { usePlayerStore } from '@/stores/player'
import TrackList from '@/components/TrackList.vue'

const libraryStore = useLibraryStore()
const playerStore = usePlayerStore()

function playAllStarred() {
  const tracks = libraryStore.starredTracks
  if (tracks.length > 0) {
    playerStore.playTrack(tracks[0], tracks)
  }
}

onMounted(() => {
  libraryStore.loadStarred()
})
</script>

<style scoped>
.starred-view {
  padding: 24px 32px;
  overflow-y: auto;
  height: 100%;
}

.view-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.view-header h1 {
  font-family: var(--font-display);
  font-size: 32px;
  font-weight: 900;
}

.play-all-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
}

.play-all-btn:hover {
  background: #d9534f;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(232, 93, 74, 0.3);
}
</style>
