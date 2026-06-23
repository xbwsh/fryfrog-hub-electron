<template>
  <div class="video-player" @keydown.esc="handleClose" tabindex="0" ref="playerRef">
    <video
      ref="videoEl"
      :src="streamUrl"
      controls
      autoplay
      class="video-element"
      @loadedmetadata="onMetadataLoaded"
      @timeupdate="onTimeUpdate"
    >
      您的浏览器不支持视频播放
    </video>
    <div class="top-bar">
      <button class="close-btn" @click="handleClose">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
      <span class="video-title">{{ videoTitle }}</span>
      <span v-if="progressPercent > 0 && !watched" class="progress-badge">{{ Math.round(progressPercent) }}%</span>
      <span v-if="watched" class="progress-badge watched">已看完</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { getVideoStreamUrl, getVideoProgress, saveVideoProgress } from '@/api/backend'

const props = defineProps<{
  videoId: number
  videoTitle: string
}>()

const emit = defineEmits<{
  close: []
}>()

const playerRef = ref<HTMLElement>()
const videoEl = ref<HTMLVideoElement>()
const streamUrl = getVideoStreamUrl(props.videoId)
const progressPercent = ref(0)
const watched = ref(false)
let saveTimer: ReturnType<typeof setInterval> | null = null
let duration = 0

function onMetadataLoaded() {
  if (!videoEl.value) return
  duration = videoEl.value.duration
  loadProgress()
}

async function loadProgress() {
  try {
    const progress = await getVideoProgress(props.videoId)
    if (progress && videoEl.value && progress.positionSeconds > 0) {
      const percent = progress.progressPercent || 0
      if (percent >= 90) {
        watched.value = true
        return
      }
      videoEl.value.currentTime = progress.positionSeconds
      progressPercent.value = percent
    }
  } catch (e) {
    console.error('Failed to load video progress:', e)
  }
}

function onTimeUpdate() {
  if (!videoEl.value || duration <= 0) return
  const current = videoEl.value.currentTime
  const percent = (current / duration) * 100
  progressPercent.value = percent
  if (percent >= 90) {
    watched.value = true
  }
}

async function saveProgress() {
  if (!videoEl.value || duration <= 0) return
  const position = videoEl.value.currentTime
  try {
    await saveVideoProgress(props.videoId, Math.floor(position), Math.floor(duration))
  } catch (e) {
    console.error('Failed to save video progress:', e)
  }
}

function handleClose() {
  saveProgress()
  emit('close')
}

onMounted(() => {
  playerRef.value?.focus()
  saveTimer = setInterval(saveProgress, 10000)
})

onUnmounted(() => {
  if (saveTimer) {
    clearInterval(saveTimer)
    saveTimer = null
  }
})
</script>

<style scoped>
.video-player {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: #000;
  outline: none;
}

.video-element {
  width: 100%;
  height: 100%;
  background: #000;
  display: block;
}

.top-bar {
  position: absolute;
  top: 12px;
  left: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 10;
}

.close-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: var(--transition);
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.7);
}

.video-title {
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.8);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.progress-badge {
  font-size: 12px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  color: rgba(255, 255, 255, 0.9);
}

.progress-badge.watched {
  background: rgba(46, 204, 113, 0.6);
}
</style>
