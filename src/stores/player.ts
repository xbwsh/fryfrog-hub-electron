import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { MusicTrack } from '@/types/backend'
import { getStreamUrl, getMusicCoverArtUrl } from '@/api/backend'

type AnyTrack = MusicTrack

export const usePlayerStore = defineStore('player', () => {
  const currentTrack = ref<AnyTrack | null>(null)
  const queue = ref<AnyTrack[]>([])
  const currentIndex = ref(-1)
  const isPlaying = ref(false)
  const volume = ref(0.8)
  const playMode = ref<'order' | 'shuffle' | 'repeat_all' | 'repeat_one'>('order')
  const currentObjectUrl = ref<string | null>(null)
  const downloadEnabled = ref(false)
  const downloadedTracks = ref<Map<string, string>>(new Map())
  const currentTime = ref(0)
  const duration = ref(0)
  const isLoading = ref(false)
  const error = ref('')

  const audio = ref<HTMLAudioElement | null>(null)
  const animFrameId = ref<number | null>(null)
  const progress = computed(() => duration.value > 0 ? (currentTime.value / duration.value) * 100 : 0)

  function updateTime() {
    if (audio.value) {
      currentTime.value = audio.value.currentTime
    }
    if (isPlaying.value && audio.value) {
      animFrameId.value = requestAnimationFrame(updateTime)
    }
  }

  function startTrackingTime() {
    if (animFrameId.value === null && audio.value && isPlaying.value) {
      animFrameId.value = requestAnimationFrame(updateTime)
    }
  }

  function initAudio() {
    if (!audio.value) {
      audio.value = new Audio()
      audio.value.volume = volume.value

      audio.value.addEventListener('loadedmetadata', () => {
        duration.value = audio.value?.duration || 0
      })

      audio.value.addEventListener('loadeddata', () => {
        duration.value = audio.value?.duration || 0
      })

      audio.value.addEventListener('canplay', () => {
        duration.value = audio.value?.duration || 0
        if (isLoading.value && isPlaying.value) {
          audio.value?.play().catch(e => {
            console.error('Playback failed:', e)
          })
        }
      })

      audio.value.addEventListener('ended', () => {
        handleTrackEnded()
      })

      audio.value.addEventListener('error', (e) => {
        isPlaying.value = false
        isLoading.value = false
        const target = e.target as HTMLAudioElement
        error.value = `播放错误: ${target.error?.message || '未知错误'}`
        console.error('Audio error:', target.error)
      })

      audio.value.addEventListener('stalled', () => {
        console.warn('Audio stalled')
      })

      audio.value.addEventListener('suspend', () => {
        console.warn('Audio suspend')
      })
    }
  }

  async function playTrack(track: AnyTrack, trackList?: AnyTrack[]) {
    initAudio()
    isLoading.value = true
    error.value = ''
    currentTime.value = 0
    duration.value = 0

    if (trackList) {
      queue.value = trackList
      currentIndex.value = trackList.findIndex(t => String(t.id) === String(track.id))
    }

    currentTrack.value = track
    
    if (audio.value) {
      try {
        audio.value.pause()
        audio.value.currentTime = 0
        
        if (currentObjectUrl.value) {
          URL.revokeObjectURL(currentObjectUrl.value)
          currentObjectUrl.value = null
        }
        
        let streamUrl: string
        streamUrl = getStreamUrl(track.id as number)

        audio.value.src = streamUrl
        audio.value.load()
        isPlaying.value = true
        await audio.value.play()
        startTrackingTime()
      } catch (e) {
        isPlaying.value = false
        error.value = '播放失败，请检查服务器配置'
        console.error('Play error:', e)
      }
    }
    isLoading.value = false
  }

  function setDownloadEnabled(val: boolean) {
    downloadEnabled.value = val
    localStorage.setItem('downloadEnabled', String(val))
  }

  function loadDownloadedTracks() {
    try {
      const saved = localStorage.getItem('downloadedTracks')
      if (saved) {
        const data = JSON.parse(saved)
        downloadedTracks.value = new Map(Object.entries(data))
      }
      const enabled = localStorage.getItem('downloadEnabled')
      if (enabled !== null) {
        downloadEnabled.value = enabled === 'true'
      }
      const savedPlayMode = localStorage.getItem('playMode')
      if (savedPlayMode) {
        playMode.value = savedPlayMode as 'order' | 'shuffle' | 'repeat_all' | 'repeat_one'
      }
    } catch (e) {
      console.warn('Failed to load downloaded tracks from localStorage:', e)
    }
  }

  function togglePlay() {
    if (!audio.value || !currentTrack.value) return
    if (isPlaying.value) {
      audio.value.pause()
      isPlaying.value = false
      if (animFrameId.value !== null) {
        cancelAnimationFrame(animFrameId.value)
        animFrameId.value = null
      }
    } else {
      const playPromise = audio.value.play()
      if (playPromise) {
        playPromise.catch(() => {
          isPlaying.value = false
          error.value = '播放失败，请重新点击或检查浏览器音频权限'
        })
      }
      isPlaying.value = true
      startTrackingTime()
    }
  }

  function nextTrack() {
    if (queue.value.length === 0 || currentIndex.value < 0) return
    let nextIndex: number

    if (playMode.value === 'shuffle') {
      nextIndex = Math.floor(Math.random() * queue.value.length)
    } else {
      nextIndex = currentIndex.value + 1
      if (nextIndex >= queue.value.length) {
        if (playMode.value === 'repeat_all' || playMode.value === 'repeat_one') {
          nextIndex = 0
        } else {
          nextIndex = -1
        }
      }
    }

    if (nextIndex >= 0 && nextIndex < queue.value.length) {
      playTrack(queue.value[nextIndex], queue.value)
    } else {
      isPlaying.value = false
    }
  }

  function prevTrack() {
    if (queue.value.length === 0 || currentIndex.value < 0) return
    if (currentTime.value > 3) {
      audio.value?.pause()
      currentTime.value = 0
      return
    }
    let prevIndex = currentIndex.value - 1
    if (prevIndex < 0) {
      if (playMode.value === 'repeat_all' || playMode.value === 'repeat_one') {
        prevIndex = queue.value.length - 1
      } else {
        prevIndex = 0
      }
    }
    playTrack(queue.value[prevIndex], queue.value)
  }

  function handleTrackEnded() {
    stopTimeTracking()
    if (playMode.value === 'repeat_one') {
      if (audio.value) {
        audio.value.currentTime = 0
        isPlaying.value = true
        const playPromise = audio.value.play()
        if (playPromise) {
          playPromise.then(() => {
            startTrackingTime()
          }).catch((e) => {
            console.error('Repeat one play failed:', e)
            isPlaying.value = false
          })
        } else {
          startTrackingTime()
        }
      }
    } else {
      if (currentObjectUrl.value) {
        URL.revokeObjectURL(currentObjectUrl.value)
        currentObjectUrl.value = null
      }
      nextTrack()
    }
  }

  function setVolume(val: number) {
    volume.value = val
    if (audio.value) {
      audio.value.volume = val
    }
  }

  function seekTo(time: number) {
    if (audio.value) {
      audio.value.currentTime = time
      currentTime.value = time
    }
  }

  function stopTimeTracking() {
    if (animFrameId.value !== null) {
      cancelAnimationFrame(animFrameId.value)
      animFrameId.value = null
    }
  }

  function setPlayMode(mode: 'order' | 'shuffle' | 'repeat_all' | 'repeat_one') {
    playMode.value = mode
    localStorage.setItem('playMode', mode)
  }

  function cyclePlayMode() {
    const modes: ('order' | 'shuffle' | 'repeat_all' | 'repeat_one')[] = ['order', 'shuffle', 'repeat_all', 'repeat_one']
    const modeIndex = modes.indexOf(playMode.value)
    playMode.value = modes[(modeIndex + 1) % modes.length]
    localStorage.setItem('playMode', playMode.value)
  }

  function getTrackCoverArt(track: AnyTrack, _size = 300): string {
    return getMusicCoverArtUrl(track.id)
  }

  function getTrackId(track: AnyTrack): string {
    return String(track.id)
  }

  return {
    currentTrack,
    queue,
    isPlaying,
    volume,
    playMode,
    downloadEnabled,
    downloadedTracks,
    currentTime,
    duration,
    isLoading,
    error,
    progress,
    playTrack,
    togglePlay,
    nextTrack,
    prevTrack,
    setVolume,
    seekTo,
    setPlayMode,
    cyclePlayMode,
    setDownloadEnabled,
    loadDownloadedTracks,
    getTrackCoverArt,
    getTrackId,
  }
})
