<script setup lang="ts">
import { ref, computed } from 'vue'
import { iconData, type IconItem } from '@/icons'
import { useThemeStore } from '@/stores/theme'

type CategoryKey = 'general' | 'music' | 'comic' | 'audiobook' | 'ebook' | 'video'

const accentColors: Record<CategoryKey, string> = {
  general: '#b0a89c',
  music: '#e8c547',
  comic: '#f06c6c',
  audiobook: '#e8a047',
  ebook: '#3dd6c8',
  video: '#7e8cf0',
}

const themeStore = useThemeStore()

const isDark = computed(() => themeStore.resolvedTheme === 'dark')

const colorVars = computed(() => {
  if (isDark.value) {
    return {
      '--il-bg': '#0a0a0a',
      '--il-surface': '#141414',
      '--il-surface-hover': '#1e1e1e',
      '--il-border': '#2a2a2a',
      '--il-text': '#e8e4dc',
      '--il-text-muted': '#6a6560',
      '--il-icon-color': '#d4d0c8',
      '--il-icon-id-color': '#3a3a3a',
      '--il-tab-hover-border': '#555',
      '--il-card-shadow': 'rgba(0, 0, 0, 0.4)',
    }
  }
  return {
    '--il-bg': '#f8f5ef',
    '--il-surface': '#fffaf2',
    '--il-surface-hover': '#f5ebe0',
    '--il-border': 'rgba(33, 28, 26, 0.08)',
    '--il-text': '#211c1a',
    '--il-text-muted': '#958982',
    '--il-icon-color': '#625853',
    '--il-icon-id-color': '#c5bdb6',
    '--il-tab-hover-border': '#c5bdb6',
    '--il-card-shadow': 'rgba(80, 55, 35, 0.1)',
  }
})

const tabLabels: Record<CategoryKey, string> = {
  general: '通用 / 系统',
  music: '音乐',
  comic: '漫画',
  audiobook: '有声书',
  ebook: '电子书',
  video: '视频',
}

const tabOrder: CategoryKey[] = ['general', 'music', 'comic', 'audiobook', 'ebook', 'video']

const currentTab = ref<CategoryKey>('general')
const toastMessage = ref('')
const toastVisible = ref(false)
const copiedId = ref('')
let toastTimer: ReturnType<typeof setTimeout> | null = null

const currentIcons = computed(() => (iconData[currentTab.value] || []) as IconItem[])
const currentAccent = computed(() => accentColors[currentTab.value])

function switchTab(key: CategoryKey) {
  if (key === currentTab.value) return
  currentTab.value = key
}

function buildSvg(icon: IconItem) {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${icon.svg}</svg>`
}

async function copySVG(icon: IconItem) {
  const svgCode = buildSvg(icon)
  try {
    await navigator.clipboard.writeText(svgCode)
    showToast(`Copied: ${icon.id}`)
  } catch {
    const textarea = document.createElement('textarea')
    textarea.value = svgCode
    textarea.style.cssText = 'position:fixed;opacity:0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    showToast('Copied!')
  }
  copiedId.value = icon.id
  setTimeout(() => { copiedId.value = '' }, 1800)
}

function showToast(msg: string) {
  if (toastTimer) clearTimeout(toastTimer)
  toastMessage.value = msg
  toastVisible.value = true
  toastTimer = setTimeout(() => { toastVisible.value = false }, 2000)
}
</script>

<template>
  <div class="icon-library-page" :style="colorVars">
    <header class="il-header">
      <h1>SVG 图标 <span>库</span></h1>
      <p>音乐 · 漫画 · 有声书 · 电子书 · 视频 · 系统 · 24×24 · 描边 1.5</p>
    </header>

    <div class="il-tabs">
      <button
        v-for="key in tabOrder"
        :key="key"
        class="il-tab-btn"
        :class="{ active: currentTab === key }"
        :style="currentTab === key ? { background: accentColors[key], borderColor: accentColors[key], color: '#0a0a0a' } : {}"
        @click="switchTab(key)"
      >
        {{ tabLabels[key] }}
      </button>
    </div>

    <div class="il-icon-grid">
      <div
        v-for="icon in currentIcons"
        :key="icon.id"
        class="il-icon-card"
        :class="{ copied: copiedId === icon.id }"
        @click="copySVG(icon)"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          v-html="icon.svg"
        />
        <span class="il-icon-name">{{ icon.nameCn }}</span>
        <span class="il-icon-id">{{ icon.id }}</span>
      </div>
    </div>

    <footer class="il-footer">
      <p>所有图标 · <span>24×24</span> · 描边 1.5 · 圆角端点与连接</p>
      <p style="margin-top:6px;">点击图标复制 SVG 代码到剪贴板</p>
    </footer>

    <div class="il-toast" :class="{ show: toastVisible }">{{ toastMessage }}</div>
  </div>
</template>

<style scoped>
.icon-library-page {
  --il-icon-hover: v-bind(currentAccent);

  position: relative;
  z-index: 1;
  max-width: 1300px;
  margin: 0 auto;
  padding: 40px 30px 80px;
  background: var(--il-bg);
  min-height: 100%;
}

.il-header {
  margin-bottom: 30px;
  text-align: center;
}

.il-header h1 {
  font-family: 'Instrument Serif', serif;
  font-size: 2.8rem;
  font-weight: 400;
  letter-spacing: -0.02em;
  color: var(--il-text);
  line-height: 1.2;
  margin-bottom: 8px;
}

.il-header h1 span {
  color: v-bind(currentAccent);
  font-style: italic;
}

.il-header p {
  font-size: 0.8rem;
  color: var(--il-text-muted);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.il-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 36px;
  justify-content: center;
}

.il-tab-btn {
  background: var(--il-surface);
  border: 1px solid var(--il-border);
  color: var(--il-text-muted);
  font-family: 'DM Mono', monospace;
  font-size: 0.7rem;
  letter-spacing: 0.05em;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: uppercase;
}

.il-tab-btn:hover {
  color: var(--il-text);
  border-color: var(--il-tab-hover-border);
}

.il-tab-btn.active {
  font-weight: 500;
}

.il-icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 12px;
}

.il-icon-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 22px 10px 14px;
  background: var(--il-surface);
  border: 1px solid var(--il-border);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.25s ease;
  position: relative;
}

.il-icon-card:hover {
  background: var(--il-surface-hover);
  border-color: v-bind(currentAccent);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px var(--il-card-shadow), 0 0 0 1px rgba(232, 197, 71, 0.12);
}

.il-icon-card:hover :deep(svg) {
  color: var(--il-icon-hover);
  filter: drop-shadow(0 0 8px rgba(232, 197, 71, 0.12));
}

.il-icon-card:hover .il-icon-name {
  color: v-bind(currentAccent);
}

.il-icon-card::after {
  content: 'Click to copy SVG';
  position: absolute;
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%) translateY(4px);
  background: v-bind(currentAccent);
  color: #0a0a0a;
  font-size: 0.6rem;
  padding: 3px 8px;
  border-radius: 4px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: all 0.2s ease;
  font-weight: 500;
  letter-spacing: 0.04em;
}

.il-icon-card:hover::after {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.il-icon-card.copied::after {
  content: 'Copied!';
  background: #4ade80;
}

.il-icon-card :deep(svg) {
  width: 28px;
  height: 28px;
  color: var(--il-icon-color);
  transition: all 0.25s ease;
  flex-shrink: 0;
}

.il-icon-name {
  font-size: 0.65rem;
  color: var(--il-text-muted);
  text-align: center;
  letter-spacing: 0.04em;
  transition: color 0.25s ease;
  line-height: 1.3;
}

.il-icon-id {
  font-size: 0.55rem;
  color: var(--il-icon-id-color);
  letter-spacing: 0.06em;
}

.il-toast {
  position: fixed;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%) translateY(20px);
  background: v-bind(currentAccent);
  color: #0a0a0a;
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.04em;
  opacity: 0;
  pointer-events: none;
  transition: all 0.3s ease;
  z-index: 999;
}

.il-toast.show {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.il-footer {
  margin-top: 60px;
  padding-top: 24px;
  border-top: 1px solid var(--il-border);
  font-size: 0.7rem;
  color: var(--il-text-muted);
  text-align: center;
  letter-spacing: 0.05em;
}

.il-footer span {
  color: v-bind(currentAccent);
}


</style>
