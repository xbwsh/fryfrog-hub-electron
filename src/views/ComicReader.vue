<template>
  <div class="comic-reader" @keydown="handleKeydown" tabindex="0" ref="readerRef">
    <div class="reader-toolbar">
      <button class="toolbar-btn" @click="$emit('close')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
      <div class="toolbar-title">{{ comicTitle }}</div>
      <div class="toolbar-info">{{ currentPage }} / {{ totalPages }}</div>
      <div class="toolbar-actions">
        <button class="toolbar-btn" @click="toggleFitMode" :title="fitMode === 'width' ? '适应高度' : '适应宽度'">
          <svg v-if="fitMode === 'width'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 3 21 3 21 9"/>
            <polyline points="9 21 3 21 3 15"/>
            <line x1="21" y1="3" x2="14" y2="10"/>
            <line x1="3" y1="21" x2="10" y2="14"/>
          </svg>
          <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="4 7 4 4 20 4 20 7"/>
            <line x1="9" y1="20" x2="15" y2="20"/>
            <line x1="12" y1="4" x2="12" y2="20"/>
          </svg>
        </button>
        <button class="toolbar-btn" @click="toggleDirection" :title="direction === 'vertical' ? '切换左右翻页' : '切换上下翻页'">
          {{ direction === 'vertical' ? '↕' : '↔' }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="reader-loading">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>

    <div
      v-else-if="direction === 'vertical'"
      class="reader-scroll"
      ref="scrollContainer"
      @scroll="handleScroll"
    >
      <div
        v-for="page in pages"
        :key="page.pageNum"
        class="scroll-page"
        :data-page="page.pageNum"
      >
        <img
          :src="getComicPageImageUrl(comicId, page.pageNum)"
          :alt="`第${page.pageNum}页`"
          :class="['page-image', fitMode]"
          @load="onImageLoad"
        />
      </div>
    </div>

    <div v-else class="reader-swipe">
      <div class="swipe-page">
        <img
          :src="getComicPageImageUrl(comicId, currentPage)"
          :alt="`第${currentPage}页`"
          :class="['page-image', fitMode]"
        />
      </div>
      <div class="swipe-nav">
        <button class="nav-btn" @click="prevPage" :disabled="currentPage <= 1">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <span class="nav-info">{{ currentPage }} / {{ totalPages }}</span>
        <button class="nav-btn" @click="nextPage" :disabled="currentPage >= totalPages">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import type { PageInfo } from '@/types/backend'
import { getComicPages, getComicPageImageUrl, getComicProgress, saveComicProgress } from '@/api/backend'

const props = defineProps<{
  comicId: number
  comicTitle: string
  startPage?: number
}>()

defineEmits<{
  close: []
}>()

const readerRef = ref<HTMLElement>()
const scrollContainer = ref<HTMLElement>()
const pages = ref<PageInfo[]>([])
const loading = ref(false)
const currentPage = ref(props.startPage || 1)
const totalPages = ref(0)
const fitMode = ref<'width' | 'height'>(
  (localStorage.getItem(`comic-fitmode-${props.comicId}`) as 'width' | 'height') || 'width'
)
const direction = ref<'vertical' | 'horizontal'>('vertical')
const initialScrollDone = ref(false)

async function loadPages() {
  loading.value = true
  try {
    pages.value = await getComicPages(props.comicId)
    totalPages.value = pages.value.length

    let startPage = props.startPage || 1
    if (!props.startPage) {
      const progress = await getComicProgress(props.comicId)
      if (progress && !progress.completed) {
        startPage = progress.currentPage
      }
    }

    currentPage.value = Math.min(startPage, totalPages.value)
    loading.value = false
    await nextTick()
    scrollToPage(currentPage.value)
  } catch (e) {
    console.error('Failed to load comic pages:', e)
    loading.value = false
  }
}

async function saveProgress() {
  if (totalPages.value > 0) {
    try {
      await saveComicProgress(props.comicId, currentPage.value, totalPages.value)
    } catch (e) {
      console.error('Failed to save comic progress:', e)
    }
  }
}

let progressTimer: ReturnType<typeof setTimeout> | null = null

function scheduleSave() {
  if (progressTimer) clearTimeout(progressTimer)
  progressTimer = setTimeout(saveProgress, 1000)
}

function scrollToPage(pageNum: number) {
  if (!scrollContainer.value) return
  const el = scrollContainer.value.querySelector(`[data-page="${pageNum}"]`)
  if (el) {
    initialScrollDone.value = false
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setTimeout(() => { initialScrollDone.value = true }, 500)
  }
}

function handleScroll() {
  if (!initialScrollDone.value) return
  if (!scrollContainer.value) return
  const container = scrollContainer.value
  const scrollTop = container.scrollTop
  const children = Array.from(container.querySelectorAll('[data-page]')) as HTMLElement[]

  for (const child of children) {
    if (child.offsetTop + child.offsetHeight / 2 > scrollTop) {
      const pageNum = Number(child.dataset.page)
      if (pageNum !== currentPage.value) {
        currentPage.value = pageNum
        scheduleSave()
      }
      break
    }
  }
}

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--
    scheduleSave()
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    scheduleSave()
  }
}

function toggleFitMode() {
  fitMode.value = fitMode.value === 'width' ? 'height' : 'width'
  localStorage.setItem(`comic-fitmode-${props.comicId}`, fitMode.value)
}

function toggleDirection() {
  const current = currentPage.value
  direction.value = direction.value === 'vertical' ? 'horizontal' : 'vertical'
  if (direction.value === 'horizontal') {
    currentPage.value = current
  } else {
    nextTick(() => scrollToPage(currentPage.value))
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (direction.value === 'horizontal') {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      prevPage()
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      nextPage()
    }
  }
  if (e.key === 'Escape') {
    props.comicTitle // just a trick to emit
  }
}

function onImageLoad() {
  // image loaded
}

onMounted(() => {
  loadPages()
  readerRef.value?.focus()
})

onUnmounted(() => {
  saveProgress()
  if (progressTimer) clearTimeout(progressTimer)
})
</script>

<style scoped>
.comic-reader {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: #0a0a0a;
  display: flex;
  flex-direction: column;
  outline: none;
}

.reader-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
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
  color: rgba(255, 255, 255, 0.7);
  transition: var(--transition);
}

.toolbar-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.toolbar-title {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.toolbar-info {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  flex-shrink: 0;
}

.toolbar-actions {
  display: flex;
  gap: 4px;
}

.reader-loading {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: rgba(255, 255, 255, 0.5);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.reader-scroll {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.scroll-page {
  width: 100%;
  display: flex;
  justify-content: center;
}

.page-image {
  display: block;
  max-width: 100%;
}

.page-image.width {
  width: 100%;
  height: auto;
}

.page-image.height {
  height: 100vh;
  width: auto;
  max-width: 100%;
}

.reader-swipe {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.swipe-page {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.swipe-page .page-image {
  max-height: calc(100vh - 100px);
  max-width: 100%;
  object-fit: contain;
}

.swipe-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.8);
}

.nav-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.7);
  transition: var(--transition);
}

.nav-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.nav-info {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  min-width: 60px;
  text-align: center;
}


</style>
