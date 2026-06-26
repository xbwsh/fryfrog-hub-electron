<template>
  <nav class="sidebar" :class="{ 'platform-mac': isMac }">
    <div class="titlebar-area">
      <div class="traffic-lights" v-if="!isMac">
        <button class="traffic-light traffic-close" @click="windowClose" title="关闭">
          <svg width="8" height="8" viewBox="0 0 8 8"><path d="M1 1l6 6M7 1l-6 6" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
        </button>
        <button class="traffic-light traffic-minimize" @click="windowMinimize" title="最小化">
          <svg width="8" height="8" viewBox="0 0 8 8"><path d="M1 4h6" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
        </button>
        <button class="traffic-light traffic-maximize" @click="windowMaximize" title="最大化">
          <svg width="8" height="8" viewBox="0 0 8 8"><rect x="1" y="1" width="6" height="6" rx="0.5" stroke="currentColor" stroke-width="1" fill="none"/></svg>
        </button>
      </div>
      <div class="titlebar-drag"></div>
    </div>
    <div class="sidebar-header">
      <div class="header-info">
        <span class="logo-text">Fryfrog Hub</span>
        <span v-if="connectionStore.showServerAddress" class="server-url">{{ serverDisplay }}</span>
      </div>
    </div>

    <div class="nav-section">
      <h3 class="nav-label">内容</h3>
      <router-link to="/" class="nav-item" active-class="active" :exact="true">
        <AppIcon name="home" :size="20" />
        首页
      </router-link>
      <router-link to="/favorites" class="nav-item" active-class="active">
        <AppIcon name="star" :size="20" />
        收藏
      </router-link>
      <router-link to="/music" class="nav-item" active-class="active">
        <AppIcon name="music-circle" :size="20" />
        音乐
      </router-link>
      <router-link to="/comics" class="nav-item" active-class="active">
        <AppIcon name="book" :size="20" />
        漫画
      </router-link>
      <router-link to="/ebooks" class="nav-item" active-class="active">
        <AppIcon name="book" :size="20" />
        电子书
      </router-link>
      <router-link to="/videos" class="nav-item" active-class="active">
        <AppIcon name="film" :size="20" />
        视频
      </router-link>
    </div>

    <div class="nav-section">
      <h3 class="nav-label">系统</h3>
      <router-link to="/settings" class="nav-item" active-class="active">
        <AppIcon name="settings" :size="20" />
        设置
      </router-link>
      <router-link to="/icons" class="nav-item" active-class="active">
        <AppIcon name="grid" :size="20" />
        图标库
      </router-link>
    </div>

    <div class="sidebar-footer">
      <button class="btn-disconnect" @click="handleDisconnect">
        <AppIcon name="logout" :size="18" />
        退出登录
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useConnectionStore } from '@/stores/connection'
import { useRouter } from 'vue-router'
import AppIcon from '@/components/AppIcon.vue'

const connectionStore = useConnectionStore()
const router = useRouter()
const isMac = navigator.platform.includes('Mac')

const serverDisplay = computed(() => {
  try {
    const url = new URL(connectionStore.backendUrl)
    return url.host
  } catch {
    return connectionStore.backendUrl
  }
})

function windowMinimize() { window.electronAPI?.windowMinimize() }
function windowMaximize() { window.electronAPI?.windowMaximize() }
function windowClose() { window.electronAPI?.windowClose() }

function handleDisconnect() {
  connectionStore.disconnect()
  router.push('/')
}
</script>

<style scoped>
.sidebar {
  width: 150px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  flex-shrink: 0;
  box-sizing: border-box;
}

.titlebar-area {
  display: flex;
  align-items: center;
  height: 36px;
  padding: 0 12px;
  flex-shrink: 0;
}

.sidebar.platform-mac .titlebar-area {
  padding-top: 8px;
  height: 44px;
}

.traffic-lights {
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 11;
  flex-shrink: 0;
  -webkit-app-region: no-drag;
}

.traffic-light {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  color: transparent;
  transition: color 0.15s;
}

.traffic-close {
  background: #ff5f57;
}

.traffic-minimize {
  background: #febc2e;
}

.traffic-maximize {
  background: #28c840;
}

.traffic-lights:hover .traffic-close {
  color: #4d0000;
}

.traffic-lights:hover .traffic-minimize {
  color: #995700;
}

.traffic-lights:hover .traffic-maximize {
  color: #006500;
}

.titlebar-drag {
  flex: 1;
  height: 100%;
  -webkit-app-region: drag;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
}

.logo-text {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
}

.header-info {
  display: flex;
  flex-direction: column;
}

.server-url {
  font-size: 11px;
  color: var(--text-muted);
  font-family: monospace;
}

.nav-section {
  padding: 12px 8px;
}

.nav-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 0 8px 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  margin-bottom: 4px;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: var(--transition);
}

.nav-item:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.nav-item.active {
  background: var(--accent);
  color: white;
}

.sidebar-footer {
  margin-top: auto;
  padding: 16px 8px;
  border-top: 1px solid var(--border);
}

.btn-disconnect {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: var(--transition);
}

.btn-disconnect:hover {
  background: var(--bg-hover);
  color: #ff6b6b;
}
</style>
