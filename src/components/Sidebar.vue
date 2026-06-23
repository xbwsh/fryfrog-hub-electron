<template>
  <nav class="sidebar">
    <div class="titlebar-drag"></div>
    <div class="sidebar-header">
      <div class="header-info">
        <span class="logo-text">Fryfrog Hub</span>
        <span class="server-url">{{ serverDisplay }}</span>
      </div>
    </div>

    <div class="nav-section">
      <h3 class="nav-label">内容</h3>
      <router-link to="/" class="nav-item" active-class="active" :exact="true">
        <AppIcon name="home" :size="20" />
        首页
      </router-link>
      <router-link to="/music" class="nav-item" active-class="active">
        <AppIcon name="music-circle" :size="20" />
        音乐
      </router-link>
      <router-link to="/favorites" class="nav-item" active-class="active">
        <AppIcon name="star" :size="20" />
        收藏
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

const serverDisplay = computed(() => {
  try {
    const url = new URL(connectionStore.backendUrl)
    return url.host
  } catch {
    return connectionStore.backendUrl
  }
})

function handleDisconnect() {
  connectionStore.disconnect()
  router.push('/')
}
</script>

<style scoped>
.sidebar {
  width: 200px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  flex-shrink: 0;
  padding-top: 36px;
  box-sizing: border-box;
}

.titlebar-drag {
  position: fixed;
  top: 0;
  left: 0;
  width: 200px;
  height: 36px;
  -webkit-app-region: drag;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
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
