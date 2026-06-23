import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/music',
      name: 'music',
      component: () => import('@/views/MusicView.vue'),
    },
    {
      path: '/favorites',
      name: 'favorites',
      component: () => import('@/views/FavoritesView.vue'),
    },
    {
      path: '/comics',
      name: 'comics',
      component: () => import('@/views/ComicsView.vue'),
    },
    {
      path: '/comics/series/:name',
      name: 'comic-series',
      component: () => import('@/views/ComicSeriesDetailView.vue'),
    },
    {
      path: '/comics/:id',
      name: 'comic-detail',
      component: () => import('@/views/ComicDetailView.vue'),
    },
    {
      path: '/ebooks',
      name: 'ebooks',
      component: () => import('@/views/NovelsView.vue'),
    },
    {
      path: '/ebooks/series/:name',
      name: 'ebook-series',
      component: () => import('@/views/EbookSeriesDetailView.vue'),
    },
    {
      path: '/videos',
      name: 'videos',
      component: () => import('@/views/MoviesView.vue'),
    },
    {
      path: '/videos/:id',
      name: 'video-detail',
      component: () => import('@/views/VideoDetailView.vue'),
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/SettingsView.vue'),
    },
    {
      path: '/icons',
      name: 'icons',
      component: () => import('@/components/IconLibrary.vue'),
    },
  ],
})

export default router
