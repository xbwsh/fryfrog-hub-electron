export interface MusicTrack {
  id: number
  createdAt: string
  updatedAt: string
  title: string
  artist: string
  album: string
  albumArtist: string
  trackNumber: number
  discNumber: number
  year: number
  genre: string
  filePath: string
  fileName: string
  fileSize: number
  durationSeconds: number
  bitrateKbps: number
  format: string
  coverArtPath: string
  lyrics: string
  favorite: boolean
}

export interface Comic {
  id: number
  createdAt: string
  updatedAt: string
  title: string
  author: string
  series: string
  volume: number
  year: number
  genre: string
  summary: string
  filePath: string
  fileName: string
  fileSize: number
  pageCount: number
  format: string
  coverArtPath: string
  thumbnailDirPath: string
  favorite: boolean
}

export interface ComicVolume {
  id: number
  volume: number
  title: string
  author: string
  series: string
  year: number
  pageCount: number
  coverArtPath: string
  filePath: string
  fileName: string
  favorite: boolean
}

export interface ComicSeries {
  name: string
  author: string
  coverArtPath: string
  volumeCount: number
  comics: ComicVolume[]
}

export interface PageInfo {
  pageNum: number
  fileName: string
}

export interface EbookSeries {
  name: string
  author: string
  coverArtPath: string
  volumeCount: number
  books: Ebook[]
}

export interface Ebook {
  id: number
  createdAt: string
  updatedAt: string
  title: string
  author: string
  publisher: string
  isbn: string
  year: number
  genre: string | null
  description: string
  filePath: string
  fileName: string
  fileSize: number
  format: string
  pageCount: number
  language: string
  coverArtPath: string
  favorite: boolean
}

export interface VideoDTO {
  id: number
  title: string
  originalTitle: string
  director: string
  actors: string
  genre: string
  year: number
  durationMinutes: number
  overview: string
  fileName: string
  fileSize: number
  videoCodec: string
  audioCodec: string
  resolution: string
  frameRate: number
  bitrateKbps: number
  format: string
  favorite: boolean
  tmdbId: number
  mediaType: string
  posterUrl: string
  backdropUrl: string
  imdbId: string
  rating: number
  voteCount: number
  metadataSource: string
  metadataUpdatedAt: string
  metadataDir: string
  nfoPath: string
  posterPath: string
  fanartPath: string
  scraped: boolean
  isSeries: boolean
  seriesId: number
  seriesTitle: string
  seasonNumber: number
  episodeNumber: number
  watchPosition: number
  watchProgressPercent: number
  watched: boolean
}

export interface VideoProgress {
  videoId: number
  positionSeconds: number
  durationSeconds: number
  completed: boolean
  progressPercent: number
  updatedAt: string
}

export interface ComicProgress {
  comicId: number
  currentPage: number
  totalPages: number
  completed: boolean
  progressPercent: number
  updatedAt: string
}

export interface EbookProgress {
  ebookId: number
  currentChapter: number
  chapterProgressPercent: number
  completed: boolean
  updatedAt: string
}

export interface SeriesDTO {
  id: number
  title: string
  originalTitle: string
  overview: string
  mediaType: string
  tmdbId: number
  rating: number
  year: number
  posterUrl: string
  backdropUrl: string
  seasonNumber: number
  totalEpisodes: number
  episodeCount: number
  metadataDir: string
  episodes: VideoDTO[]
}

export interface TmdbSearchItem {
  id: number
  year: number
  title: string
  original_title: string
  name: string
  original_name: string
  overview: string
  release_date: string
  first_air_date: string
  poster_path: string
  backdrop_path: string
  genre_ids: number[]
  vote_average: number
  vote_count: number
  media_type: string
  popularity: number
}

export interface ChapterInfo {
  chapterNum: number
  title: string
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface BackendConfig {
  url: string
  authenticated: boolean
}

export interface ModuleRescanResult {
  cleanedCount: number
  scanStatus: string
}

export interface LibraryRescanResult {
  music: ModuleRescanResult
  comic: ModuleRescanResult
  ebook: ModuleRescanResult
  video: ModuleRescanResult
}
