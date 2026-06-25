import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { MusicTrack, LibraryRescanResult } from '@/types/backend'
import {
  getAllTracks,
  getLyrics,
  rescanMusic,
  rescanComic,
  rescanVideo,
  rescanEbook,
} from '@/api/backend'

export const useLibraryStore = defineStore('library', () => {
  const allTracks = ref<MusicTrack[]>([])
  const starredTracks = ref<MusicTrack[]>([])
  const featuredTracks = ref<MusicTrack[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const currentLyrics = ref('')

  const starredTrackIds = ref<Set<number>>(new Set())

  function isTrackStarred(trackId: string): boolean {
    return starredTrackIds.value.has(Number(trackId))
  }

  async function loadAllTracks() {
    loading.value = true
    error.value = null
    try {
      allTracks.value = await getAllTracks()
    } catch (e) {
      error.value = '加载所有歌曲失败'
    }
    loading.value = false
  }

  async function loadStarred() {
    loading.value = true
    error.value = null
    try {
      // 使用本地存储模拟收藏功能
      const saved = localStorage.getItem('starredTracks')
      if (saved) {
        const ids = JSON.parse(saved) as number[]
        starredTrackIds.value = new Set(ids)
        starredTracks.value = allTracks.value.filter(t => ids.includes(t.id))
      }
    } catch (e) {
      error.value = '加载收藏失败'
    }
    loading.value = false
  }

  async function loadFeatured() {
    try {
      // 随机选择30首歌曲作为推荐
      if (allTracks.value.length > 0) {
        const shuffled = [...allTracks.value].sort(() => 0.5 - Math.random())
        featuredTracks.value = shuffled.slice(0, 30)
      }
    } catch {
      // silent fail
    }
  }

  async function fetchLyrics(_artist: string, _title: string, songId?: string): Promise<string> {
    if (songId) {
      const lyrics = await getLyrics(Number(songId))
      if (lyrics) {
        currentLyrics.value = lyrics
        return lyrics
      }
    }
    return ''
  }

  async function toggleStar(id: string, currentStarred: boolean, _track?: MusicTrack): Promise<boolean> {
    try {
      const trackId = Number(id)
      if (!currentStarred) {
        starredTrackIds.value.add(trackId)
      } else {
        starredTrackIds.value.delete(trackId)
      }
      // 保存到本地存储
      localStorage.setItem('starredTracks', JSON.stringify([...starredTrackIds.value]))
      // 更新starredTracks
      starredTracks.value = allTracks.value.filter(t => starredTrackIds.value.has(t.id))
      return true
    } catch {
      return false
    }
  }

  async function rescan(): Promise<string> {
    loading.value = true
    error.value = null
    try {
      const results = await Promise.allSettled([
        rescanMusic(),
        rescanComic(),
        rescanVideo(),
        rescanEbook(),
      ])
      const messages = results.map((r, i) => {
        const modules = ['音乐', '漫画', '视频', '电子书']
        if (r.status === 'fulfilled') return `${modules[i]}: ${r.value}`
        return `${modules[i]}: 失败`
      })
      return messages.join('\n')
    } catch (e) {
      error.value = '整理媒体库失败'
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    allTracks,
    starredTracks,
    featuredTracks,
    loading,
    error,
    currentLyrics,
    loadAllTracks,
    loadStarred,
    loadFeatured,
    fetchLyrics,
    toggleStar,
    isTrackStarred,
    rescan,
  }
})
