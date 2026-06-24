<template>
  <button class="scan-btn" @click="visible = true">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polyline points="23 4 23 10 17 10"/>
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
    </svg>
    扫描目录
  </button>

  <Teleport to="body">
    <div v-if="visible" class="dialog-overlay" @click.self="visible = false">
      <div class="dialog">
        <h3>{{ title }}</h3>
        <p class="dialog-desc">{{ description }}</p>
        <input
          v-model="scanPath"
          type="text"
          class="dialog-input"
          :placeholder="inputPlaceholder"
          @keyup.enter="handleScan"
        />
        <div class="dialog-actions">
          <button class="dialog-btn cancel" @click="visible = false">取消</button>
          <button class="dialog-btn confirm" :disabled="!scanPath.trim() || scanning" @click="handleScan">
            {{ scanning ? '扫描中...' : '开始扫描' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  title?: string
  description?: string
  inputPlaceholder?: string
}>()

const emit = defineEmits<{
  scan: [path: string]
}>()

const visible = ref(false)
const scanPath = ref('')
const scanning = ref(false)

async function handleScan() {
  if (!scanPath.value.trim()) return
  scanning.value = true
  try {
    emit('scan', scanPath.value)
    visible.value = false
    scanPath.value = ''
  } finally {
    scanning.value = false
  }
}
</script>

<style scoped>
.scan-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 8px 16px;
  font-size: 14px;
  color: var(--text-primary);
  cursor: pointer;
  transition: var(--transition);
  flex-shrink: 0;
  height: 36px;
  box-sizing: border-box;
}

.scan-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 24px;
  width: 400px;
  max-width: 90vw;
}

.dialog h3 {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.dialog-desc {
  margin: 0 0 16px;
  font-size: 13px;
  color: var(--text-muted);
}

.dialog-input {
  width: 100%;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 10px 12px;
  font-size: 14px;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.dialog-input:focus {
  border-color: var(--accent);
  outline: none;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.dialog-btn {
  padding: 8px 16px;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid var(--border);
  transition: var(--transition);
}

.dialog-btn.cancel {
  background: transparent;
  color: var(--text-secondary);
}

.dialog-btn.cancel:hover {
  background: var(--bg-hover);
}

.dialog-btn.confirm {
  background: var(--accent);
  color: white;
  border-color: var(--accent);
}

.dialog-btn.confirm:hover {
  background: var(--accent-hover);
}

.dialog-btn.confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
