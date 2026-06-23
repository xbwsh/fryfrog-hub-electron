<template>
  <div class="ebook-reader" @keydown.esc="$emit('close')" tabindex="0" ref="readerRef">
    <div class="reader-toolbar">
      <button class="toolbar-btn" @click="$emit('close')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
      <div class="toolbar-title">{{ ebookTitle }}</div>
      <div class="toolbar-actions">
        <button class="toolbar-btn" @click="decreaseFontSize" title="缩小字体">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            <line x1="8" y1="11" x2="14" y2="11"/>
          </svg>
        </button>
        <span class="font-size-label">{{ fontSize }}px</span>
        <button class="toolbar-btn" @click="increaseFontSize" title="放大字体">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            <line x1="11" y1="8" x2="11" y2="14"/>
            <line x1="8" y1="11" x2="14" y2="11"/>
          </svg>
        </button>
        <button
          v-if="chapters.length > 0"
          class="toolbar-btn"
          :class="{ active: showChapterPanel }"
          @click="showChapterPanel = !showChapterPanel"
          title="章节列表"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="8" y1="6" x2="21" y2="6"/>
            <line x1="8" y1="12" x2="21" y2="12"/>
            <line x1="8" y1="18" x2="21" y2="18"/>
            <line x1="3" y1="6" x2="3.01" y2="6"/>
            <line x1="3" y1="12" x2="3.01" y2="12"/>
            <line x1="3" y1="18" x2="3.01" y2="18"/>
          </svg>
        </button>
      </div>
    </div>

    <div class="reader-body">
      <div v-if="showChapterPanel && chapters.length > 0" class="chapter-panel">
        <div class="chapter-panel-header">目录</div>
        <div class="chapter-list">
          <div
            v-for="chapter in chapters"
            :key="chapter.chapterNum"
            class="chapter-item"
            :class="{ active: currentChapter === chapter.chapterNum }"
            @click="loadChapter(chapter.chapterNum)"
          >
            {{ chapter.title }}
          </div>
        </div>
      </div>

      <div v-if="loading" class="reader-loading">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>

      <div v-else-if="error" class="reader-error">
        <p>{{ error }}</p>
        <button @click="loadContent">重试</button>
      </div>

      <div
        v-else
        class="reader-content"
        ref="contentRef"
        :style="{ fontSize: fontSize + 'px' }"
        @click="onContentClick"
      >
        <div class="content-inner">
          <h2 v-if="currentChapterTitle" class="chapter-title">{{ currentChapterTitle }}</h2>
          <div v-html="formattedContent"></div>
        </div>
      </div>

      <Transition name="fade">
        <div v-if="!loading && !error && chapters.length > 0 && showNav" class="chapter-nav">
          <button
            class="chapter-nav-btn"
            :disabled="currentChapter <= 1"
            @click.stop="loadChapter(currentChapter - 1)"
          >上一章</button>
          <span class="chapter-nav-label">{{ currentChapter }} / {{ chapters.length }}</span>
          <button
            class="chapter-nav-btn"
            :disabled="currentChapter >= chapters.length"
            @click.stop="loadChapter(currentChapter + 1)"
          >下一章</button>
        </div>
      </Transition>
      <div v-if="chapters.length > 0" class="reading-progress-badge">{{ Math.round(readingProgress) }}%</div>
      <div v-if="chapterHint" class="chapter-hint" :class="chapterHint">{{ chapterHint === 'next' ? '即将切换到下一章...' : '即将切换到上一章...' }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { readEbook, getEbookChapters, getEbookChapterContent, getEpubImageUrl, getEbookProgress, saveEbookProgress } from '@/api/backend'
import type { ChapterInfo } from '@/types/backend'

const props = defineProps<{
  ebookId: number
  ebookTitle: string
  ebookFilePath?: string
}>()

defineEmits<{
  close: []
}>()

const readerRef = ref<HTMLElement>()
const contentRef = ref<HTMLElement>()
const content = ref('')
const loading = ref(false)
const error = ref('')
const fontSize = ref(Number(localStorage.getItem(`ebook-fontsize-${props.ebookId}`)) || 18)
const chapters = ref<ChapterInfo[]>([])
const currentChapter = ref(1)
const showChapterPanel = ref(false)
const showNav = ref(false)
const readingProgress = ref(0)
const chapterHint = ref<'next' | 'prev' | ''>('')
let navTimer: ReturnType<typeof setTimeout> | null = null
let autoAdvanceTimer: ReturnType<typeof setTimeout> | null = null
let autoPrevTimer: ReturnType<typeof setTimeout> | null = null
let lastChapterSwitchTime = 0

function startNavTimer() {
  if (navTimer) clearTimeout(navTimer)
  navTimer = setTimeout(() => { showNav.value = false }, 3000)
}

function toggleNav() {
  showNav.value = !showNav.value
  if (showNav.value) startNavTimer()
}

function onContentClick() {
  toggleNav()
}

function cancelAutoAdvance() {
  if (autoAdvanceTimer) { clearTimeout(autoAdvanceTimer); autoAdvanceTimer = null }
  if (autoPrevTimer) { clearTimeout(autoPrevTimer); autoPrevTimer = null }
  chapterHint.value = ''
}

function onScroll() {
  const el = contentRef.value
  if (!el) return
  const { scrollTop, scrollHeight, clientHeight } = el
  const max = scrollHeight - clientHeight
  const atBottom = max <= 0 || scrollTop >= max - 1
  const atTop = scrollTop <= 1
  const cooledDown = Date.now() - lastChapterSwitchTime > 1500
  const newProgress = atBottom ? 100 : (max > 0 ? Math.min(100, Math.round((scrollTop / max) * 100)) : 0)
  if (newProgress !== readingProgress.value) {
    readingProgress.value = newProgress
    scheduleSave()
  }

  const hasNext = chapters.value.length > 0 && currentChapter.value < chapters.value.length
  const hasPrev = chapters.value.length > 0 && currentChapter.value > 1

  if (atBottom && hasNext && !autoAdvanceTimer) {
    cancelAutoAdvance()
    chapterHint.value = 'next'
    autoAdvanceTimer = setTimeout(() => {
      autoAdvanceTimer = null
      chapterHint.value = ''
      lastChapterSwitchTime = Date.now()
      loadChapter(currentChapter.value + 1)
    }, 1500)
  } else if (atTop && hasPrev && cooledDown && !autoPrevTimer) {
    cancelAutoAdvance()
    chapterHint.value = 'prev'
    autoPrevTimer = setTimeout(() => {
      autoPrevTimer = null
      chapterHint.value = ''
      lastChapterSwitchTime = Date.now()
      loadChapter(currentChapter.value - 1)
    }, 1500)
  } else if (!atBottom && !atTop) {
    cancelAutoAdvance()
  }
}

function attachScrollListener() {
  nextTick(() => {
    contentRef.value?.removeEventListener('scroll', onScroll)
    contentRef.value?.addEventListener('scroll', onScroll)
  })
}

async function loadChapters() {
  try {
    chapters.value = await getEbookChapters(props.ebookId)
  } catch {
    chapters.value = []
  }
}

async function loadChapter(chapterNum: number) {
  if (chapterNum < 1 || chapterNum > chapters.value.length) return
  loading.value = true
  error.value = ''
  currentChapter.value = chapterNum
  readingProgress.value = 0
  try {
    content.value = await getEbookChapterContent(props.ebookId, chapterNum)
  } catch (e) {
    error.value = '加载章节内容失败'
    console.error('Failed to load chapter content:', e)
  } finally {
    loading.value = false
  }
  showChapterPanel.value = false
  contentRef.value?.scrollTo(0, 0)
  showNav.value = false
  cancelAutoAdvance()
  attachScrollListener()
}

async function loadContent() {
  loading.value = true
  error.value = ''
  try {
    if (chapters.value.length === 0) {
      content.value = await readEbook(props.ebookId)
    } else {
      content.value = await getEbookChapterContent(props.ebookId, currentChapter.value)
    }
  } catch (e) {
    error.value = '加载电子书内容失败'
    console.error('Failed to load ebook content:', e)
  } finally {
    loading.value = false
    attachScrollListener()
  }
}

const currentChapterTitle = computed(() => {
  if (chapters.value.length === 0) return ''
  const chapter = chapters.value.find(c => c.chapterNum === currentChapter.value)
  return chapter?.title || ''
})

function rewriteEpubImages(html: string): string {
  const fp = props.ebookFilePath
  if (!fp) return html
  return html.replace(/<img\s+([^>]*?)src="([^"]+)"([^>]*)>/gi, (match, before, src, after) => {
    if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:') || src.startsWith('/api/')) {
      return match
    }
    const imageUrl = getEpubImageUrl(fp, src)
    return `<img ${before}src="${imageUrl}"${after}>`
  })
}

const formattedContent = computed(() => {
  const raw = content.value
  if (raw.includes('<') && (raw.includes('</p>') || raw.includes('</div>') || raw.includes('<img'))) {
    return rewriteEpubImages(raw)
  }
  return raw
    .split('\n')
    .map(line => `<p>${line || '&nbsp;'}</p>`)
    .join('')
})

function increaseFontSize() {
  if (fontSize.value < 32) {
    fontSize.value += 2
    localStorage.setItem(`ebook-fontsize-${props.ebookId}`, String(fontSize.value))
  }
}

function decreaseFontSize() {
  if (fontSize.value > 12) {
    fontSize.value -= 2
    localStorage.setItem(`ebook-fontsize-${props.ebookId}`, String(fontSize.value))
  }
}

async function loadProgress() {
  try {
    const progress = await getEbookProgress(props.ebookId)
    if (progress && !progress.completed && chapters.value.length > 0) {
      currentChapter.value = Math.min(progress.currentChapter, chapters.value.length)
      readingProgress.value = progress.chapterProgressPercent
      return progress.chapterProgressPercent
    }
  } catch (e) {
    console.error('Failed to load ebook progress:', e)
  }
  return 0
}

let progressTimer: ReturnType<typeof setTimeout> | null = null

function scheduleSave() {
  if (progressTimer) clearTimeout(progressTimer)
  progressTimer = setTimeout(() => {
    if (chapters.value.length > 0) {
      saveEbookProgress(props.ebookId, currentChapter.value, chapters.value.length).catch(
        e => console.error('Failed to save ebook progress:', e)
      )
    }
  }, 1500)
}

onMounted(async () => {
  readerRef.value?.focus()
  await loadChapters()
  const savedProgress = await loadProgress()
  await loadContent()
  if (savedProgress > 0) {
    nextTick(() => {
      if (contentRef.value) {
        const scrollHeight = contentRef.value.scrollHeight - contentRef.value.clientHeight
        contentRef.value.scrollTop = (scrollHeight * savedProgress) / 100
      }
    })
  }
})

onUnmounted(() => {
  contentRef.value?.removeEventListener('scroll', onScroll)
  cancelAutoAdvance()
  if (navTimer) clearTimeout(navTimer)
  if (progressTimer) clearTimeout(progressTimer)
  if (chapters.value.length > 0) {
    saveEbookProgress(props.ebookId, currentChapter.value, chapters.value.length).catch(
      e => console.error('Failed to save ebook progress on unmount:', e)
    )
  }
})
</script>

<style scoped>
.ebook-reader {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: var(--bg-primary);
  display: flex;
  flex-direction: column;
  outline: none;
}

.reader-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
  z-index: 10;
  padding-top: 44px;
  -webkit-app-region: drag;
}

.reader-toolbar button,
.reader-toolbar span {
  -webkit-app-region: no-drag;
}

.toolbar-btn {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  transition: var(--transition);
}

.toolbar-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.toolbar-btn.active {
  background: var(--accent);
  color: white;
}

.toolbar-title {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.font-size-label {
  font-size: 12px;
  color: var(--text-muted);
  min-width: 36px;
  text-align: center;
}

.reader-body {
  flex: 1;
  display: flex;
  overflow: hidden;
  position: relative;
}

.chapter-panel {
  width: 260px;
  flex-shrink: 0;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chapter-panel-header {
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.chapter-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.chapter-item {
  padding: 10px 16px;
  font-size: 13px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: var(--transition);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chapter-item:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.chapter-item.active {
  color: var(--accent);
  font-weight: 500;
  background: var(--bg-hover);
}

.reader-loading,
.reader-error {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: var(--text-secondary);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.reader-error button {
  background: var(--accent);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
}

.reader-error button:hover {
  background: var(--accent-hover);
}

.reader-content {
  flex: 1;
  overflow-y: auto;
  padding: 40px;
}

.content-inner {
  max-width: 720px;
  margin: 0 auto;
  line-height: 1.8;
  color: var(--text-primary);
}

.chapter-title {
  font-size: 1.1em;
  font-weight: 500;
  color: var(--text-secondary);
  text-align: center;
  margin-bottom: 1.5em;
  text-indent: 0;
}

.content-inner :deep(p) {
  margin-bottom: 0.8em;
  text-indent: 2em;
}

.content-inner :deep(p:first-child) {
  text-indent: 0;
}

.chapter-nav {
  position: fixed;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 6px 20px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
  z-index: 10;
}

.chapter-nav-btn {
  background: none;
  border: none;
  padding: 4px 12px;
  font-size: 12px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: var(--transition);
  border-radius: var(--radius-md);
}

.chapter-nav-btn:hover:not(:disabled) {
  color: var(--text-primary);
  background: var(--bg-hover);
}

.chapter-nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.chapter-nav-label {
  font-size: 12px;
  color: var(--text-muted);
  min-width: 50px;
  text-align: center;
}

.reading-progress-badge {
  position: fixed;
  bottom: 12px;
  right: 16px;
  font-size: 11px;
  color: var(--text-muted);
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 2px 8px;
  opacity: 0.7;
  z-index: 5;
  pointer-events: none;
}

.chapter-hint {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  color: var(--text-secondary);
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 4px 14px;
  z-index: 15;
  pointer-events: none;
  animation: hintPulse 1.5s ease infinite;
}

.chapter-hint.next {
  bottom: 48px;
}

.chapter-hint.prev {
  top: 60px;
}

@keyframes hintPulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}


</style>
