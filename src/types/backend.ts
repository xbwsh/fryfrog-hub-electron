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
  coverSource: string | null
  lyrics: string
  lyricsSource: string | null
  label: string | null
  catalogNumber: string | null
  releaseDate: string | null
  musicBrainzId: string | null
  artistImage: string | null
  artistBio: string | null
  scrapeStatus: string | null
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
  seriesSummary: string | null
  rating: number | null
  serializationStart: string | null
  releaseDate: string | null
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
  rating: number | null
  summary: string | null
  releaseDate: string | null
  favorite: boolean
}

export interface ComicSeries {
  name: string
  author: string
  coverArtPath: string
  coverUrl: string
  seriesSummary: string | null
  serializationStart: string | null
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
  originalTitle: string | null
  director: string | null
  actors: string | null
  genre: string | null
  year: number | null
  durationMinutes: number | null
  overview: string | null
  fileName: string
  fileSize: number
  videoCodec: string | null
  audioCodec: string | null
  resolution: string | null
  frameRate: number | null
  bitrateKbps: number | null
  format: string
  favorite: boolean
  tmdbId: number | null
  mediaType: string | null
  posterUrl: string | null
  backdropUrl: string | null
  imdbId: string | null
  rating: number | null
  voteCount: number | null
  metadataSource: string
  metadataUpdatedAt: string | null
  metadataDir: string | null
  nfoPath: string | null
  posterPath: string | null
  fanartPath: string | null
  scraped: boolean
  isSeries: boolean
  seriesId: number | null
  seriesTitle: string | null
  seasonNumber: number | null
  episodeNumber: number | null
  watchPosition: number | null
  watchProgressPercent: number | null
  watched: boolean | null
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

export interface AnilistMediaTitle {
  bestTitle: string
  romaji: string
  english: string
  native: string
}

export interface AnilistCoverImage {
  large: string
  medium: string
}

export interface AnilistStartDate {
  year: number
  month: number
  day: number
}

export interface AnilistStaffNode {
  name: { first: string; last: string; full: string }
}

export interface AnilistStaffEdge {
  node: AnilistStaffNode
  role: string
}

export interface AnilistMediaItem {
  id: number
  title: AnilistMediaTitle
  coverImage: AnilistCoverImage
  description: string
  meanScore: number
  genres: string[]
  startDate: AnilistStartDate
  volumes: number
  status: string
  type: string
  staff: { edges: AnilistStaffEdge[] }
}

export interface BangumiItem {
  id: number
  name: string
  name_cn: string
  summary: string
  score: number
  tags: string[]
  author: string
  cover: string
}

export interface ComicCharacter {
  id: number
  name: string
  originalName: string | null
  imageUrl: string | null
  imagePath: string | null
  description: string | null
  role: string | null
  source: string
}

export interface VideoActor {
  id: number
  videoId: number
  name: string
  character: string | null
  imagePath: string | null
  imageUrl: string | null
  sourceActorId: number | null
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
  originalTitle: string | null
  overview: string | null
  mediaType: string | null
  tmdbId: number | null
  rating: number | null
  year: number | null
  posterUrl: string | null
  backdropUrl: string | null
  seasonNumber: number | null
  totalEpisodes: number
  episodeCount: number
  metadataDir: string | null
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

export interface SystemSetting {
  id: number
  key: string
  value: string
  description: string | null
  createdAt: string
  updatedAt: string
}

export interface TmdbStatus {
  configured: boolean
  language: string
  'image-size': string
  'auto-scrape': boolean
  'include-adult': boolean
}
