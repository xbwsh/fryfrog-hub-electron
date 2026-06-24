import axios from 'axios'
import type {
  MusicTrack,
  Comic,
  ComicSeries,
  PageInfo,
  Ebook,
  VideoDTO,
  SeriesDTO,
  TmdbSearchItem,
  ChapterInfo,
  ApiResponse,
  BackendConfig,
  VideoProgress,
  ComicProgress,
  EbookProgress,
  EbookSeries,
  LibraryRescanResult,
  AnilistMediaItem,
  BangumiItem,
} from '@/types/backend'

const client = axios.create()

let config: BackendConfig = {
  url: '',
  authenticated: false,
}

export function setBackendConfig(newConfig: BackendConfig) {
  config = newConfig
  client.defaults.baseURL = newConfig.url
}

export async function testConnection(): Promise<boolean> {
  try {
    const response = await client.get<ApiResponse<any[]>>('/api/v1/music')
    if (response.data.success) {
      config = {
        url: config.url,
        authenticated: true,
      }
      return true
    }
    return false
  } catch (error) {
    console.error('Backend connection error:', error)
    return false
  }
}

export async function getAllTracks(): Promise<MusicTrack[]> {
  const response = await client.get<ApiResponse<MusicTrack[]>>('/api/v1/music')
  return response.data.data || []
}

export async function getTrackById(id: number): Promise<MusicTrack | undefined> {
  const response = await client.get<ApiResponse<MusicTrack>>(`/api/v1/music/${id}`)
  return response.data.data
}

export async function scanDirectory(path: string): Promise<string> {
  const response = await client.post<ApiResponse<string>>('/api/v1/music/scan', null, {
    params: { path },
  })
  return response.data.data
}

export async function searchByTitle(query: string): Promise<MusicTrack[]> {
  const response = await client.get<ApiResponse<MusicTrack[]>>('/api/v1/music/search/title', {
    params: { q: query },
  })
  return response.data.data || []
}

export async function searchByArtist(query: string): Promise<MusicTrack[]> {
  const response = await client.get<ApiResponse<MusicTrack[]>>('/api/v1/music/search/artist', {
    params: { q: query },
  })
  return response.data.data || []
}

export async function searchMusic(query: string): Promise<MusicTrack[]> {
  const [titleResults, artistResults] = await Promise.all([
    searchByTitle(query),
    searchByArtist(query),
  ])

  const seen = new Set<number>()
  const results: MusicTrack[] = []

  for (const track of [...titleResults, ...artistResults]) {
    if (!seen.has(track.id)) {
      seen.add(track.id)
      results.push(track)
    }
  }

  return results
}

export function getStreamUrl(id: number): string {
  return `${config.url}/api/v1/music/${id}/stream`
}

export function getMusicCoverArtUrl(id: number): string {
  return `${config.url}/api/v1/music/${id}/cover`
}

export async function getLyrics(id: number): Promise<string> {
  const response = await client.get<ApiResponse<string>>(`/api/v1/music/${id}/lyrics`)
  return response.data.data || ''
}

export async function scrapeTrack(id: number): Promise<MusicTrack | undefined> {
  const response = await client.post<ApiResponse<MusicTrack>>(`/api/v1/music/${id}/scrape`)
  return response.data.data
}

export async function scrapeByArtist(artist: string): Promise<MusicTrack[]> {
  const response = await client.post<ApiResponse<MusicTrack[]>>('/api/v1/music/scrape/artist', null, {
    params: { artist },
  })
  return response.data.data || []
}

export async function scrapeAllTracks(): Promise<MusicTrack[]> {
  const response = await client.post<ApiResponse<MusicTrack[]>>('/api/v1/music/scrape/all')
  return response.data.data || []
}

export async function getScrapeStatus(): Promise<number> {
  const response = await client.get<ApiResponse<number>>('/api/v1/music/scrape/status')
  return response.data.data || 0
}

export async function getAllComics(): Promise<Comic[]> {
  const response = await client.get<ApiResponse<Comic[]>>('/api/v1/comic')
  return response.data.data || []
}

export async function getComicSeries(): Promise<ComicSeries[]> {
  const response = await client.get<ApiResponse<ComicSeries[]>>('/api/v1/comic/series')
  return response.data.data || []
}

export async function getComicById(id: number): Promise<Comic | undefined> {
  const response = await client.get<ApiResponse<Comic>>(`/api/v1/comic/${id}`)
  return response.data.data
}

export async function toggleComicFavorite(id: number, status: boolean): Promise<Comic | undefined> {
  const response = await client.put<ApiResponse<Comic>>(`/api/v1/comic/${id}/favorite`, null, {
    params: { status },
  })
  return response.data.data
}

export async function getComicFavorites(): Promise<Comic[]> {
  const response = await client.get<ApiResponse<Comic[]>>('/api/v1/comic/favorites')
  return response.data.data || []
}

export async function scanComicDirectory(path: string): Promise<string> {
  const response = await client.post<ApiResponse<string>>('/api/v1/comic/scan', null, {
    params: { path },
  })
  return response.data.data
}

export async function searchComicByTitle(query: string): Promise<Comic[]> {
  const response = await client.get<ApiResponse<Comic[]>>('/api/v1/comic/search/title', {
    params: { q: query },
  })
  return response.data.data || []
}

export async function searchComicByAuthor(query: string): Promise<Comic[]> {
  const response = await client.get<ApiResponse<Comic[]>>('/api/v1/comic/search/author', {
    params: { q: query },
  })
  return response.data.data || []
}

export async function searchComics(query: string): Promise<Comic[]> {
  const [titleResults, authorResults] = await Promise.all([
    searchComicByTitle(query),
    searchComicByAuthor(query),
  ])

  const seen = new Set<number>()
  const results: Comic[] = []

  for (const comic of [...titleResults, ...authorResults]) {
    if (!seen.has(comic.id)) {
      seen.add(comic.id)
      results.push(comic)
    }
  }

  return results
}

export function getComicCoverUrl(id: number): string {
  return `${config.url}/api/v1/comic/${id}/cover`
}

export function getComicCoverUrlWithCache(id: number, updatedAt?: string): string {
  return updatedAt
    ? `${config.url}/api/v1/comic/${id}/cover?t=${updatedAt}`
    : `${config.url}/api/v1/comic/${id}/cover`
}

export async function getComicPages(id: number): Promise<PageInfo[]> {
  const response = await client.get<ApiResponse<PageInfo[]>>(`/api/v1/comic/${id}/pages`)
  return response.data.data || []
}

export function getComicPageImageUrl(id: number, pageNum: number): string {
  return `${config.url}/api/v1/comic/${id}/pages/${pageNum}`
}

export async function getAllEbooks(): Promise<Ebook[]> {
  const response = await client.get<ApiResponse<Ebook[]>>('/api/v1/ebook')
  return response.data.data || []
}

export async function getEbookById(id: number): Promise<Ebook | undefined> {
  const response = await client.get<ApiResponse<Ebook>>(`/api/v1/ebook/${id}`)
  return response.data.data
}

export async function toggleEbookFavorite(id: number, status: boolean): Promise<Ebook | undefined> {
  const response = await client.put<ApiResponse<Ebook>>(`/api/v1/ebook/${id}/favorite`, null, {
    params: { status },
  })
  return response.data.data
}

export async function getEbookFavorites(): Promise<Ebook[]> {
  const response = await client.get<ApiResponse<Ebook[]>>('/api/v1/ebook/favorites')
  return response.data.data || []
}

export async function searchEbookByTitle(query: string): Promise<Ebook[]> {
  const response = await client.get<ApiResponse<Ebook[]>>('/api/v1/ebook/search/title', {
    params: { q: query },
  })
  return response.data.data || []
}

export async function searchEbookByAuthor(query: string): Promise<Ebook[]> {
  const response = await client.get<ApiResponse<Ebook[]>>('/api/v1/ebook/search/author', {
    params: { q: query },
  })
  return response.data.data || []
}

export async function searchEbooks(query: string): Promise<Ebook[]> {
  const [titleResults, authorResults] = await Promise.all([
    searchEbookByTitle(query),
    searchEbookByAuthor(query),
  ])
  const seen = new Set<number>()
  const results: Ebook[] = []
  for (const book of [...titleResults, ...authorResults]) {
    if (!seen.has(book.id)) {
      seen.add(book.id)
      results.push(book)
    }
  }
  return results
}

export function getEbookCoverUrl(id: number): string {
  return `${config.url}/api/v1/ebook/${id}/cover`
}

export function getEbookCoverImageUrl(path: string): string {
  return `${config.url}/api/v1/ebook/cover-image?path=${encodeURIComponent(path)}`
}

export async function getEbookSeries(): Promise<EbookSeries[]> {
  const response = await client.get<ApiResponse<EbookSeries[]>>('/api/v1/ebook/series')
  return response.data.data || []
}

export function getEbookDownloadUrl(id: number): string {
  return `${config.url}/api/v1/ebook/${id}/download`
}

export async function readEbook(id: number): Promise<string> {
  const response = await client.get<string>(`/api/v1/ebook/${id}/read`)
  return response.data
}

export async function getEbookChapters(id: number): Promise<ChapterInfo[]> {
  const response = await client.get<ApiResponse<ChapterInfo[]>>(`/api/v1/ebook/${id}/chapters`)
  return response.data.data || []
}

export async function getEbookChapterContent(id: number, chapterNum: number): Promise<string> {
  const response = await client.get<string>(`/api/v1/ebook/${id}/chapters/${chapterNum}`)
  return response.data
}

export function getEpubImageUrl(filePath: string, file: string): string {
  return `${config.url}/api/v1/ebook/epub-image?filePath=${encodeURIComponent(filePath)}&file=${encodeURIComponent(file)}`
}

export async function scanEbookDirectory(path: string): Promise<string> {
  const response = await client.post<ApiResponse<string>>('/api/v1/ebook/scan', null, {
    params: { path },
  })
  return response.data.data
}

export async function getAllVideos(): Promise<VideoDTO[]> {
  const response = await client.get<ApiResponse<VideoDTO[]>>('/api/v1/video')
  return response.data.data || []
}

export async function getVideoById(id: number): Promise<VideoDTO | undefined> {
  const response = await client.get<ApiResponse<VideoDTO>>(`/api/v1/video/${id}`)
  return response.data.data
}

export async function toggleVideoFavorite(id: number, status: boolean): Promise<VideoDTO | undefined> {
  const response = await client.put<ApiResponse<VideoDTO>>(`/api/v1/video/${id}/favorite`, null, {
    params: { status },
  })
  return response.data.data
}

export async function getVideoFavorites(): Promise<VideoDTO[]> {
  const response = await client.get<ApiResponse<VideoDTO[]>>('/api/v1/video/favorites')
  return response.data.data || []
}

export async function searchVideoByTitle(query: string): Promise<VideoDTO[]> {
  const response = await client.get<ApiResponse<VideoDTO[]>>('/api/v1/video/search/title', {
    params: { q: query },
  })
  return response.data.data || []
}

export async function searchVideoByDirector(query: string): Promise<VideoDTO[]> {
  const response = await client.get<ApiResponse<VideoDTO[]>>('/api/v1/video/search/director', {
    params: { q: query },
  })
  return response.data.data || []
}

export async function searchVideos(query: string): Promise<VideoDTO[]> {
  const [titleResults, directorResults] = await Promise.all([
    searchVideoByTitle(query),
    searchVideoByDirector(query),
  ])
  const seen = new Set<number>()
  const results: VideoDTO[] = []
  for (const video of [...titleResults, ...directorResults]) {
    if (!seen.has(video.id)) {
      seen.add(video.id)
      results.push(video)
    }
  }
  return results
}

export function getVideoCoverUrl(id: number): string {
  return `${config.url}/api/v1/video/${id}/cover`
}

export function getVideoPosterUrl(id: number): string {
  return `${config.url}/api/v1/video/${id}/poster`
}

export function getVideoFanartUrl(id: number): string {
  return `${config.url}/api/v1/video/${id}/fanart`
}

export function getVideoStreamUrl(id: number): string {
  return `${config.url}/api/v1/video/${id}/stream`
}

export async function scanVideoDirectory(path: string): Promise<string> {
  const response = await client.post<ApiResponse<string>>('/api/v1/video/scan', null, {
    params: { path },
  })
  return response.data.data
}

export async function cleanupVideoRecords(): Promise<Record<string, number>> {
  const response = await client.post<ApiResponse<Record<string, number>>>('/api/v1/video/cleanup')
  return response.data.data
}

export async function checkTmdbStatus(): Promise<boolean> {
  const response = await client.get<ApiResponse<boolean>>('/api/v1/video/tmdb/status')
  return response.data.data
}

export async function searchTmdb(query: string): Promise<TmdbSearchItem[]> {
  const response = await client.get<ApiResponse<TmdbSearchItem[]>>('/api/v1/video/tmdb/search', {
    params: { q: query },
  })
  return response.data.data || []
}

export async function bindTmdb(id: number, tmdbId: number, mediaType: string): Promise<VideoDTO | undefined> {
  const response = await client.post<ApiResponse<VideoDTO>>(`/api/v1/video/${id}/tmdb/bind`, null, {
    params: { tmdbId, mediaType },
  })
  return response.data.data
}

export async function autoScrapeAll(): Promise<VideoDTO[]> {
  const response = await client.post<ApiResponse<VideoDTO[]>>('/api/v1/video/tmdb/auto-scrape')
  return response.data.data || []
}

export async function getNfoContent(id: number): Promise<string> {
  const response = await client.get<ApiResponse<string>>(`/api/v1/video/${id}/nfo`)
  return response.data.data
}

export async function generateNfo(id: number): Promise<Record<string, string>> {
  const response = await client.post<ApiResponse<Record<string, string>>>(`/api/v1/video/${id}/nfo`)
  return response.data.data
}

export async function downloadVideoCovers(id: number): Promise<Record<string, string>> {
  const response = await client.post<ApiResponse<Record<string, string>>>(`/api/v1/video/${id}/covers`)
  return response.data.data
}

export async function getVideoProgress(id: number): Promise<VideoProgress | null> {
  const response = await client.get<ApiResponse<VideoProgress>>(`/api/v1/video/${id}/progress`)
  return response.data.data || null
}

export async function saveVideoProgress(id: number, position: number, duration: number): Promise<VideoProgress> {
  const response = await client.put<ApiResponse<VideoProgress>>(`/api/v1/video/${id}/progress`, null, {
    params: { position, duration },
  })
  return response.data.data
}

export async function deleteVideoProgress(id: number): Promise<void> {
  await client.delete<ApiResponse<void>>(`/api/v1/video/${id}/progress`)
}

export async function getComicProgress(id: number): Promise<ComicProgress | null> {
  const response = await client.get<ApiResponse<ComicProgress>>(`/api/v1/comic/${id}/progress`)
  return response.data.data || null
}

export async function saveComicProgress(id: number, currentPage: number, totalPages: number): Promise<ComicProgress> {
  const response = await client.put<ApiResponse<ComicProgress>>(`/api/v1/comic/${id}/progress`, null, {
    params: { page: currentPage, totalPages },
  })
  return response.data.data
}

export async function deleteComicProgress(id: number): Promise<void> {
  await client.delete<ApiResponse<void>>(`/api/v1/comic/${id}/progress`)
}

export async function getEbookProgress(id: number): Promise<EbookProgress | null> {
  const response = await client.get<ApiResponse<EbookProgress>>(`/api/v1/ebook/${id}/progress`)
  return response.data.data || null
}

export async function saveEbookProgress(id: number, currentChapter: number, totalChapters: number): Promise<EbookProgress> {
  const response = await client.put<ApiResponse<EbookProgress>>(`/api/v1/ebook/${id}/progress`, null, {
    params: { page: currentChapter, totalPages: totalChapters },
  })
  return response.data.data
}

export async function deleteEbookProgress(id: number): Promise<void> {
  await client.delete<ApiResponse<void>>(`/api/v1/ebook/${id}/progress`)
}

export async function getAllSeries(): Promise<SeriesDTO[]> {
  const response = await client.get<ApiResponse<SeriesDTO[]>>('/api/v1/video/series')
  return response.data.data || []
}

export async function getSeriesById(id: number): Promise<SeriesDTO | undefined> {
  const response = await client.get<ApiResponse<SeriesDTO>>(`/api/v1/video/series/${id}`)
  return response.data.data
}

export function getSeriesPosterUrl(id: number): string {
  return `${config.url}/api/v1/video/series/${id}/poster`
}

export function getSeriesFanartUrl(id: number): string {
  return `${config.url}/api/v1/video/series/${id}/fanart`
}

export async function toggleFavorite(id: number, status: boolean): Promise<MusicTrack | undefined> {
  const response = await client.put<ApiResponse<MusicTrack>>(`/api/v1/music/${id}/favorite`, null, {
    params: { status },
  })
  return response.data.data
}

export async function getFavorites(): Promise<MusicTrack[]> {
  const response = await client.get<ApiResponse<MusicTrack[]>>('/api/v1/music/favorites')
  return response.data.data || []
}

export async function rescanLibrary(): Promise<LibraryRescanResult> {
  const response = await client.post<ApiResponse<LibraryRescanResult>>('/api/v1/library/rescan')
  return response.data.data
}

export async function searchAnilistComics(query: string): Promise<AnilistMediaItem[]> {
  const response = await client.get<ApiResponse<AnilistMediaItem[]>>('/api/v1/comic/anilist/search', {
    params: { q: query },
  })
  return response.data.data || []
}

export async function bindAnilistMetadata(comicId: number, anilistId: number, bindSeries?: boolean): Promise<Comic | undefined> {
  const response = await client.post<ApiResponse<Comic>>(`/api/v1/comic/${comicId}/anilist/bind`, null, {
    params: { anilistId, ...(bindSeries !== undefined ? { bindSeries } : {}) },
  })
  return response.data.data
}

export async function searchBangumiComics(query: string): Promise<BangumiItem[]> {
  const response = await client.get<ApiResponse<BangumiItem[]>>('/api/v1/comic/bangumi/search', {
    params: { q: query },
  })
  return response.data.data || []
}

export async function bindBangumiMetadata(comicId: number, bangumiId: number, bindSeries?: boolean): Promise<Comic | undefined> {
  const response = await client.post<ApiResponse<Comic>>(`/api/v1/comic/${comicId}/bangumi/bind`, null, {
    params: { bangumiId, ...(bindSeries !== undefined ? { bindSeries } : {}) },
  })
  return response.data.data
}

export async function autoScrapeComics(): Promise<string> {
  const response = await client.post<ApiResponse<string>>('/api/v1/comic/auto-scrape')
  return response.data.data
}

export async function organizeComics(): Promise<string> {
  const response = await client.post<ApiResponse<string>>('/api/v1/comic/organize')
  return response.data.data
}

export async function getAnilistStatus(): Promise<boolean> {
  const response = await client.get<ApiResponse<boolean>>('/api/v1/comic/anilist/status')
  return response.data.data
}


