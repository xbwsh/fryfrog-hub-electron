import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './styles/main.css'
import { usePlayerStore } from './stores/player'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)

const playerStore = usePlayerStore()
playerStore.loadDownloadedTracks()

app.mount('#app')
