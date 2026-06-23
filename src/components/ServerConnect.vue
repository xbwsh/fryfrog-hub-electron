<template>
  <div class="server-connect">
    <div class="connect-card">
      <div class="logo">
        <div class="logo-icon">🐸</div>
        <h1>Fryfrog Hub</h1>
        <p class="subtitle">登录以继续</p>
      </div>

      <form @submit.prevent="handleLogin" class="connect-form">
        <div class="form-group">
          <label>用户名</label>
          <input v-model="localUsername" type="text" placeholder="请输入用户名" required autofocus />
        </div>

        <div class="form-group">
          <label>密码</label>
          <input v-model="localPassword" type="password" placeholder="请输入密码" required />
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-connect" :disabled="connecting">
            <span v-if="!connecting">登录</span>
            <span v-else class="loading-text">登录中...</span>
          </button>
        </div>

        <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>
        <p class="hint-msg">默认账号: 666 / 密码: 666</p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useConnectionStore } from '@/stores/connection'

const emit = defineEmits<{
  connected: []
}>()

const connectionStore = useConnectionStore()

const localUsername = ref('')
const localPassword = ref('')
const connecting = ref(false)
const errorMsg = ref('')

async function handleLogin() {
  connecting.value = true
  errorMsg.value = ''

  try {
    const success = await connectionStore.login(localUsername.value, localPassword.value)
    if (success) {
      emit('connected')
    } else {
      errorMsg.value = '登录失败'
    }
  } catch {
    errorMsg.value = '登录失败，请稍后重试'
  } finally {
    connecting.value = false
  }
}
</script>

<style scoped>
.server-connect {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: var(--bg-primary);
  position: relative;
}

.server-connect::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -30%;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, var(--accent-glow) 0%, transparent 70%);
  opacity: 0.3;
  pointer-events: none;
}

.connect-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: 48px;
  width: 100%;
  max-width: 400px;
  box-shadow: var(--shadow);
  position: relative;
  z-index: 1;
}

.logo {
  text-align: center;
  margin-bottom: 32px;
}

.logo-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.logo h1 {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 6px;
  letter-spacing: -0.5px;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 14px;
}

.connect-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-group input {
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 12px 14px;
  font-size: 15px;
  color: var(--text-primary);
  transition: var(--transition);
}

.form-group input::placeholder {
  color: var(--text-muted);
}

.form-group input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-glow);
  outline: none;
}

.form-actions {
  margin-top: 6px;
}

.btn-connect {
  width: 100%;
  background: var(--accent);
  color: white;
  border-radius: var(--radius-md);
  padding: 14px;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.3px;
  transition: var(--transition);
}

.btn-connect:hover:not(:disabled) {
  background: var(--accent-hover);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px var(--accent-glow);
}

.btn-connect:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-msg {
  color: #ff6b6b;
  font-size: 13px;
  text-align: center;
}

.hint-msg {
  color: var(--text-muted);
  font-size: 12px;
  text-align: center;
  margin-top: 8px;
}

.loading-text {
  display: inline-block;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>
