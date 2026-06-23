<template>
  <div class="app-container" v-if="connected">
    <Sidebar />
    <div class="main-area">
      <main class="main-content">
        <router-view />
      </main>
    </div>
  </div>

  <ServerConnect v-else-if="!restoring" @connected="onConnected" />
  <div v-else class="loading-screen">
    <div class="loading-content">
      <div class="loading-icon">🐸</div>
      <p>正在恢复连接...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, nextTick } from 'vue'
import { useConnectionStore } from '@/stores/connection'
import ServerConnect from '@/components/ServerConnect.vue'
import Sidebar from '@/components/Sidebar.vue'
import { useRouter } from 'vue-router'

const connectionStore = useConnectionStore()
const router = useRouter()

const connected = computed(() => connectionStore.connected)
const restoring = ref(false)

async function onConnected() {
  router.push('/')
}

onMounted(async () => {
  restoring.value = true
  const restored = await connectionStore.restoreConnection()
  restoring.value = false

  if (restored) {
    await nextTick()
    router.push('/')
  }
})
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: row;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.main-content {
  flex: 1;
  overflow: auto;
  position: relative;
  background: var(--bg-primary);
}

.loading-screen {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100vw;
  background: var(--bg-primary);
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.loading-icon {
  font-size: 48px;
  color: var(--accent);
  animation: bounce 1s ease-in-out infinite;
  font-family: var(--font-display);
}

.loading-content p {
  color: var(--text-secondary);
  font-size: 14px;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
</style>
