export interface IconItem {
  id: string
  name: string
  nameCn: string
  svg: string
}

const general: IconItem[] = [
  { id: 'play', name: 'Play', nameCn: '播放', svg: '<polygon points="6,3 20,12 6,21"/>' },
  { id: 'pause', name: 'Pause', nameCn: '暂停', svg: '<rect x="5" y="3" width="4" height="18" rx="1"/><rect x="15" y="3" width="4" height="18" rx="1"/>' },
  { id: 'stop', name: 'Stop', nameCn: '停止', svg: '<rect x="4" y="4" width="16" height="16" rx="2"/>' },
  { id: 'rewind', name: 'Rewind', nameCn: '快退', svg: '<polygon points="11,19 2,12 11,5"/><polygon points="22,19 13,12 22,5"/>' },
  { id: 'fast-forward', name: 'Fast Forward', nameCn: '快进', svg: '<polygon points="2,19 11,12 2,5"/><polygon points="13,19 22,12 13,5"/>' },
  { id: 'skip-back', name: 'Skip Back', nameCn: '上一项', svg: '<polygon points="11,19 2,12 11,5"/><line x1="22" y1="5" x2="22" y2="19"/>' },
  { id: 'skip-forward', name: 'Skip Forward', nameCn: '下一项', svg: '<polygon points="13,19 22,12 13,5"/><line x1="2" y1="5" x2="2" y2="19"/>' },
  { id: 'previous', name: 'Previous', nameCn: '上一首', svg: '<polygon points="19,20 9,12 19,4"/><line x1="5" y1="4" x2="5" y2="20"/>' },
  { id: 'next', name: 'Next', nameCn: '下一首', svg: '<polygon points="5,4 15,12 5,20"/><line x1="19" y1="4" x2="19" y2="20"/>' },
  { id: 'volume', name: 'Volume', nameCn: '音量', svg: '<polygon points="11,5 6,9 2,9 2,15 6,15 11,19"/><path d="M13.5 8.5Q16 12 13.5 15.5"/><path d="M16 5.5Q20 12 16 18.5"/>' },
  { id: 'volume-low', name: 'Volume Low', nameCn: '低音量', svg: '<polygon points="11,5 6,9 2,9 2,15 6,15 11,19"/><path d="M13.5 8.5Q16 12 13.5 15.5"/>' },
  { id: 'volume-mute', name: 'Volume Mute', nameCn: '静音', svg: '<polygon points="11,5 6,9 2,9 2,15 6,15 11,19"/><line x1="22" y1="9" x2="16" y2="15"/><line x1="16" y1="9" x2="22" y2="15"/>' },
  { id: 'volume-high', name: 'Volume High', nameCn: '高音量', svg: '<polygon points="11,5 6,9 2,9 2,15 6,15 11,19"/><path d="M13.5 8.5Q16 12 13.5 15.5"/><path d="M16 5.5Q20 12 16 18.5"/><path d="M18.5 3Q23 12 18.5 21"/>' },
  { id: 'heart', name: 'Favorite', nameCn: '收藏', svg: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>' },
  { id: 'bookmark', name: 'Bookmark', nameCn: '书签', svg: '<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>' },
  { id: 'search', name: 'Search', nameCn: '搜索', svg: '<circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/>' },
  { id: 'share', name: 'Share', nameCn: '分享', svg: '<circle cx="18" cy="5" r="3"/><circle cx="18" cy="19" r="3"/><circle cx="6" cy="12" r="3"/><line x1="8.5" y1="10.5" x2="15.5" y2="6.5"/><line x1="8.5" y1="13.5" x2="15.5" y2="17.5"/>' },
  { id: 'download', name: 'Download', nameCn: '下载', svg: '<line x1="12" y1="3" x2="12" y2="17"/><polyline points="7,12 12,17 17,12"/><line x1="4" y1="21" x2="20" y2="21"/>' },
  { id: 'clock', name: 'Clock', nameCn: '时钟', svg: '<circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>' },
  { id: 'settings', name: 'Settings', nameCn: '设置', svg: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>' },
  { id: 'info', name: 'Info', nameCn: '信息', svg: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>' },
  { id: 'cloud', name: 'Cloud', nameCn: '云', svg: '<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>' },
  { id: 'tag', name: 'Tag', nameCn: '标签', svg: '<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>' },
  { id: 'more-horizontal', name: 'More', nameCn: '更多', svg: '<circle cx="6" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="18" cy="12" r="1.5" fill="currentColor"/>' },
  { id: 'home', name: 'Home', nameCn: '首页', svg: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/>' },
  { id: 'user', name: 'User', nameCn: '用户', svg: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>' },
  { id: 'menu', name: 'Menu', nameCn: '菜单', svg: '<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>' },
  { id: 'close', name: 'Close', nameCn: '关闭', svg: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>' },
  { id: 'check', name: 'Check', nameCn: '确认', svg: '<polyline points="20,6 9,17 4,12"/>' },
  { id: 'plus', name: 'Plus', nameCn: '添加', svg: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>' },
  { id: 'minus', name: 'Minus', nameCn: '减少', svg: '<line x1="5" y1="12" x2="19" y2="12"/>' },
  { id: 'edit', name: 'Edit', nameCn: '编辑', svg: '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>' },
  { id: 'trash', name: 'Trash', nameCn: '删除', svg: '<polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>' },
  { id: 'lock', name: 'Lock', nameCn: '锁定', svg: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/><circle cx="12" cy="16" r="1" fill="currentColor"/>' },
  { id: 'unlock', name: 'Unlock', nameCn: '解锁', svg: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.5-1.5"/><circle cx="12" cy="16" r="1" fill="currentColor"/>' },
  { id: 'notification', name: 'Notification', nameCn: '通知', svg: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>' },
  { id: 'calendar', name: 'Calendar', nameCn: '日历', svg: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>' },
  { id: 'folder', name: 'Folder', nameCn: '文件夹', svg: '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>' },
  { id: 'upload', name: 'Upload', nameCn: '上传', svg: '<line x1="12" y1="17" x2="12" y2="3"/><polyline points="7,8 12,3 17,8"/><line x1="4" y1="21" x2="20" y2="21"/>' },
  { id: 'copy', name: 'Copy', nameCn: '复制', svg: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>' },
  { id: 'refresh', name: 'Refresh', nameCn: '刷新', svg: '<polyline points="23,4 23,10 17,10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>' },
  { id: 'filter', name: 'Filter', nameCn: '筛选', svg: '<polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46 22,3"/>' },
  { id: 'help', name: 'Help', nameCn: '帮助', svg: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>' },
  { id: 'arrow-left', name: 'Arrow Left', nameCn: '向左', svg: '<polyline points="15,18 9,12 15,6"/>' },
  { id: 'arrow-right', name: 'Arrow Right', nameCn: '向右', svg: '<polyline points="9,18 15,12 9,6"/>' },
  { id: 'arrow-up', name: 'Arrow Up', nameCn: '向上', svg: '<polyline points="18,15 12,9 6,15"/>' },
  { id: 'arrow-down', name: 'Arrow Down', nameCn: '向下', svg: '<polyline points="6,9 12,15 18,9"/>' },
  { id: 'fullscreen', name: 'Fullscreen', nameCn: '全屏', svg: '<polyline points="8,3 3,3 3,8"/><polyline points="16,3 21,3 21,8"/><polyline points="21,16 21,21 16,21"/><polyline points="3,16 3,21 8,21"/>' },
  { id: 'fullscreen-exit', name: 'Exit Fullscreen', nameCn: '退出全屏', svg: '<polyline points="3,8 3,3 8,3"/><polyline points="21,8 21,3 16,3"/><polyline points="16,21 21,21 21,16"/><polyline points="8,21 3,21 3,16"/>' },
  { id: 'split-horizontal', name: 'Split Horizontal', nameCn: '左右分屏', svg: '<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="3" x2="12" y2="21"/>' },
  { id: 'split-vertical', name: 'Split Vertical', nameCn: '上下分屏', svg: '<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="12" x2="21" y2="12"/>' },
  { id: 'playlist', name: 'Playlist', nameCn: '播放列表', svg: '<line x1="8" y1="5" x2="20" y2="5"/><line x1="8" y1="11" x2="18" y2="11"/><line x1="8" y1="17" x2="16" y2="17"/><circle cx="4.5" cy="16.5" r="1.8"/><line x1="4.5" y1="16.5" x2="4.5" y2="6"/><polyline points="2,7 4.5,5 7,7"/>' },
  { id: 'speaker', name: 'Speaker', nameCn: '扬声器', svg: '<rect x="3" y="4" width="18" height="13" rx="2"/><circle cx="12" cy="10.5" r="4"/><circle cx="12" cy="10.5" r="1.5" fill="currentColor"/>' },
  { id: 'headphones', name: 'Headphones', nameCn: '耳机', svg: '<path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M3 18a2 2 0 0 0 2 2h.5a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1H5a2 2 0 0 0-2 2z"/><path d="M21 18a2 2 0 0 1-2 2h-.5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1H19a2 2 0 0 1 2 2z"/>' },
  { id: 'bluetooth', name: 'Bluetooth', nameCn: '蓝牙', svg: '<polyline points="7,7 17,17 12.5,20.5 12.5,3.5 17,7 7,17"/>' },
  { id: 'cast', name: 'Cast', nameCn: '投屏', svg: '<rect x="2" y="4" width="20" height="12" rx="2"/><path d="M5 20a2 2 0 0 1 2-2"/><path d="M5 17a5 5 0 0 1 5 5"/><path d="M5 14a8 8 0 0 1 8 8"/>' },
  { id: 'grid', name: 'Grid', nameCn: '网格', svg: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>' },
  { id: 'list', name: 'List', nameCn: '列表', svg: '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>' },
  { id: 'logout', name: 'Logout', nameCn: '退出登录', svg: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>' },
  { id: 'music-circle', name: 'Music Circle', nameCn: '音乐', svg: '<circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8" fill="currentColor"/>' },
  { id: 'film', name: 'Film', nameCn: '影视', svg: '<rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/>' },
]

const music: IconItem[] = [
  { id: 'repeat', name: 'Repeat', nameCn: '循环', svg: '<polyline points="17,1 21,5 17,9"/><path d="M3,11V9a4,4,0,0,1,4-4H21"/><polyline points="7,23 3,19 7,15"/><path d="M21,13v2a4,4,0,0,1-4,4H3"/>' },
  { id: 'repeat-one', name: 'Repeat One', nameCn: '单曲循环', svg: '<polyline points="17,1 21,5 17,9"/><path d="M3,11V9a4,4,0,0,1,4-4H21"/><polyline points="7,23 3,19 7,15"/><path d="M21,13v2a4,4,0,0,1-4,4H3"/><text x="12" y="14.5" text-anchor="middle" fill="currentColor" stroke="none" font-size="7" font-family="DM Mono, monospace" font-weight="500">1</text>' },
  { id: 'shuffle', name: 'Shuffle', nameCn: '随机播放', svg: '<polyline points="16,3 21,3 21,8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21,16 21,21 16,21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/>' },
  { id: 'order', name: 'Order', nameCn: '顺序播放', svg: '<line x1="4" y1="4" x2="17" y2="4"/><polyline points="17,1 21,4 17,7"/><line x1="4" y1="12" x2="17" y2="12"/><polyline points="17,9 21,12 17,15"/><line x1="4" y1="20" x2="17" y2="20"/><polyline points="17,17 21,20 17,23"/>' },
  { id: 'music-note', name: 'Music Note', nameCn: '音符', svg: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>' },
  { id: 'album', name: 'Album', nameCn: '专辑', svg: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="1" fill="currentColor"/>' },
  { id: 'equalizer', name: 'Equalizer', nameCn: '均衡器', svg: '<rect x="3" y="14" width="3" height="6" rx="1"/><rect x="8" y="9" width="3" height="11" rx="1"/><rect x="13" y="12" width="3" height="8" rx="1"/><rect x="18" y="5" width="3" height="15" rx="1"/>' },
  { id: 'lyrics', name: 'Lyrics / Mic', nameCn: '歌词', svg: '<path d="M12 1a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v1a7 7 0 0 1-14 0v-1"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>' },
  { id: 'star', name: 'Star', nameCn: '星标', svg: '<polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>' },
]

const comic: IconItem[] = [
  { id: 'speech-bubble', name: 'Speech Bubble', nameCn: '对话气泡', svg: '<path d="M12 21c4.418 0 8-3.364 8-7.5S16.418 6 12 6s-8 3.364-8 7.5c0 1.488.47 2.87 1.28 4.01L3 22l3.5-2.5c1.12.65 2.43 1 3.5 1z"/>' },
  { id: 'thought-bubble', name: 'Thought Bubble', nameCn: '思考气泡', svg: '<circle cx="7" cy="18" r="1.5" fill="currentColor"/><circle cx="4" cy="14" r="2.2"/><circle cx="12" cy="8" r="4"/><path d="M16 8.5c0 2.5-1.8 4.5-4 4.5"/>' },
  { id: 'shout-bubble', name: 'Shout / Star Burst', nameCn: '爆发', svg: '<path d="M12 3l-2.5 5h-6l4.5 4-1.5 6 5.5-4 5.5 4-1.5-6 4.5-4h-6L12 3z"/><line x1="12" y1="14" x2="8" y2="20"/>' },
  { id: 'action-lines', name: 'Action Lines', nameCn: '速度线', svg: '<line x1="4" y1="20" x2="10" y2="4"/><line x1="12" y1="20" x2="14" y2="12"/><line x1="18" y1="20" x2="17" y2="6"/><line x1="20" y1="20" x2="20" y2="10"/>' },
  { id: 'focus-lines', name: 'Focus Lines', nameCn: '集中线', svg: '<line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.5" y1="4.5" x2="7.5" y2="7.5"/><line x1="16.5" y1="16.5" x2="19.5" y2="19.5"/><line x1="4.5" y1="19.5" x2="7.5" y2="16.5"/><line x1="16.5" y1="7.5" x2="19.5" y2="4.5"/>' },
  { id: 'explosion', name: 'Explosion', nameCn: '爆炸', svg: '<path d="M12 3l-3 6-6.5 1 5 5-1 6.5 5.5-3.5 5.5 3.5-1-6.5 5-5-6.5-1L12 3z"/>' },
  { id: 'anger-mark', name: 'Anger Mark', nameCn: '愤怒', svg: '<path d="M8 3l4 4-4 4"/><path d="M16 3l-4 4 4 4"/><line x1="12" y1="13" x2="12" y2="21"/>' },
  { id: 'sweat-drop', name: 'Sweat Drop', nameCn: '汗滴', svg: '<path d="M12 2L6 11c0 4 2.5 7 6 7s6-3 6-7c0-3-2-5.5-6-9z"/>' },
  { id: 'tear', name: 'Tear / Crying', nameCn: '流泪', svg: '<path d="M6 2v4c0 3 2 5 6 5"/><path d="M12 11c4 0 6-2 6-5V2"/><line x1="8" y1="16" x2="8" y2="22"/><line x1="16" y1="16" x2="16" y2="22"/><line x1="12" y1="13" x2="12" y2="18"/>' },
  { id: 'surprised-face', name: 'Surprised Face', nameCn: '惊讶', svg: '<circle cx="12" cy="12" r="9"/><circle cx="9" cy="10" r="1.2" fill="currentColor"/><circle cx="15" cy="10" r="1.2" fill="currentColor"/><ellipse cx="12" cy="16" rx="3" ry="3"/>' },
  { id: 'sparkle', name: 'Sparkle', nameCn: '闪光', svg: '<path d="M12 3l2 5 5.5 1-4 4.5 1 5.5-5.5-3-5.5 3 1-5.5-4-4.5 5.5-1L12 3z"/>' },
  { id: 'lightning', name: 'Lightning', nameCn: '闪电', svg: '<polygon points="13,2 3,14 11,14 9,22 21,10 13,10 15,2"/>' },
  { id: 'fire', name: 'Fire', nameCn: '火焰', svg: '<path d="M12 22c3.5 0 6-2.5 6-6 0-3-3-7.5-6-11.5C9 8.5 6 13 6 16c0 3.5 2.5 6 6 6z"/><path d="M12 22c-1.5 0-3-1-3-3 0-2 2-5 3-7"/>' },
  { id: 'swirl', name: 'Swirl / Dizzy', nameCn: '眩晕', svg: '<path d="M12 21c4 0 7-2.5 7-6s-3-6-7-6-7 2.5-7 6 3 6 7 6z"/><path d="M12 18c2 0 4-1.5 4-4s-2-4-4-4-4 1.5-4 4 2 4 4 4z"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/>' },
  { id: 'crosshair', name: 'Crosshair', nameCn: '准心', svg: '<circle cx="12" cy="12" r="8"/><line x1="12" y1="2" x2="12" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/>' },
  { id: 'skull', name: 'Skull', nameCn: '骷髅', svg: '<circle cx="12" cy="12" r="9"/><circle cx="9" cy="11" r="2"/><circle cx="15" cy="11" r="2"/><line x1="9" y1="17" x2="15" y2="17"/><line x1="12" y1="15" x2="12" y2="19"/><path d="M6 20l2-2h8l2 2"/>' },
  { id: 'ghost', name: 'Ghost', nameCn: '幽灵', svg: '<path d="M12 2a8 8 0 0 0-8 8v10l3-2 3 2 3-2 3 2 3-2v-10a8 8 0 0 0-8-8z"/><circle cx="9.5" cy="11" r="1.2" fill="currentColor"/><circle cx="14.5" cy="11" r="1.2" fill="currentColor"/>' },
  { id: 'fist', name: 'Fist', nameCn: '拳头', svg: '<path d="M7 12V8c0-1.5 1-3 2.5-3S12 6.5 12 8v4"/><path d="M12 12V6c0-1.5 1-3 2.5-3S17 4.5 17 6v6"/><path d="M17 12V10c0-1.5 1-2.5 2.5-2.5S22 8.5 22 10v2c0 5-4 9-9 9h-1c-4 0-8-3-8-8V8"/><line x1="9" y1="16" x2="15" y2="16"/>' },
  { id: 'peace-sign', name: 'Peace / V Sign', nameCn: '和平手势', svg: '<path d="M12 22V10"/><path d="M8 4l4 6 4-6"/><path d="M8 10c-2-2-3-5-1-7.5"/><path d="M16 10c2-2 3-5 1-7.5"/><circle cx="12" cy="17" r="5"/>' },
  { id: 'thumbs-up', name: 'Thumbs Up', nameCn: '点赞', svg: '<path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/><path d="M7 11l3-7c1 0 3 1 3 3v3h5.5a2.5 2.5 0 0 1 2.5 2.5l-1 5.5a2 2 0 0 1-2 1.5H7"/>' },
  { id: 'punch', name: 'Punch', nameCn: '出拳', svg: '<circle cx="18" cy="8" r="4"/><line x1="14" y1="8" x2="4" y2="20"/><line x1="14" y1="14" x2="4" y2="22"/><line x1="4" y1="16" x2="10" y2="8"/>' },
  { id: 'run', name: 'Run / Dash', nameCn: '奔跑', svg: '<circle cx="12" cy="6" r="2"/><path d="M8 22l2-6-2-4 4-2 4 6-1 6"/><line x1="17" y1="8" x2="21" y2="5"/><line x1="17" y1="12" x2="21" y2="14"/>' },
  { id: 'jump', name: 'Jump', nameCn: '跳跃', svg: '<path d="M6 22l4-12 4 4 4-10"/><circle cx="14" cy="6" r="2"/><line x1="12" y1="16" x2="8" y2="22"/>' },
  { id: 'pen', name: 'Pen', nameCn: '画笔', svg: '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>' },
  { id: 'book', name: 'Book', nameCn: '书籍', svg: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>' },
  { id: 'magnifying-glass', name: 'Magnifying Glass', nameCn: '放大镜', svg: '<circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/>' },
  { id: 'camera', name: 'Camera', nameCn: '相机', svg: '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>' },
]

const audiobook: IconItem[] = [
  { id: 'skip-back-15', name: 'Skip Back 15s', nameCn: '后退15秒', svg: '<path d="M14 19l-7-7 7-7"/><line x1="19" y1="5" x2="19" y2="19"/><text x="7" y="14" text-anchor="middle" fill="currentColor" stroke="none" font-size="6" font-family="DM Mono, monospace" font-weight="500">15</text>' },
  { id: 'skip-forward-15', name: 'Skip Forward 15s', nameCn: '前进15秒', svg: '<path d="M10 19l7-7-7-7"/><line x1="5" y1="5" x2="5" y2="19"/><text x="17" y="14" text-anchor="middle" fill="currentColor" stroke="none" font-size="6" font-family="DM Mono, monospace" font-weight="500">15</text>' },
  { id: 'previous-chapter', name: 'Previous Chapter', nameCn: '上一章', svg: '<path d="M18 20l-6-8 6-8"/><line x1="6" y1="4" x2="6" y2="20"/>' },
  { id: 'next-chapter', name: 'Next Chapter', nameCn: '下一章', svg: '<path d="M6 4l6 8-6 8"/><line x1="18" y1="4" x2="18" y2="20"/>' },
  { id: 'audiobook', name: 'Audiobook', nameCn: '有声书', svg: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><path d="M9 10c0-1.1.9-2 2-2h2c1.1 0 2 .9 2 2v4c0 1.1-.9 2-2 2h-2c-1.1 0-2-.9-2-2v-4z"/><path d="M11 10v4"/><line x1="16" y1="13" x2="18" y2="13"/><line x1="16" y1="11" x2="17.5" y2="11"/>' },
  { id: 'sleep-timer', name: 'Sleep Timer', nameCn: '睡眠定时', svg: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/><circle cx="18" cy="10" r="5"/><line x1="18" y1="6" x2="18" y2="10"/><line x1="18" y1="10" x2="20" y2="12"/>' },
  { id: 'voice', name: 'Narrator / Voice', nameCn: '朗读', svg: '<path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>' },
  { id: 'speed', name: 'Speed 1x', nameCn: '倍速', svg: '<circle cx="12" cy="12" r="9"/><polyline points="12,6 12,12 16,14"/><text x="12" y="18.5" text-anchor="middle" fill="currentColor" stroke="none" font-size="5" font-family="DM Mono, monospace" font-weight="600">1x</text>' },
  { id: 'chapters', name: 'Chapters', nameCn: '章节', svg: '<line x1="3" y1="6" x2="21" y2="6"/><circle cx="5" cy="12" r="1.5" fill="currentColor"/><line x1="8" y1="12" x2="21" y2="12"/><circle cx="5" cy="18" r="1.5" fill="currentColor"/><line x1="8" y1="18" x2="17" y2="18"/>' },
]

const ebook: IconItem[] = [
  { id: 'page-prev', name: 'Previous Page', nameCn: '上一页', svg: '<polyline points="16,4 8,12 16,20"/>' },
  { id: 'page-next', name: 'Next Page', nameCn: '下一页', svg: '<polyline points="8,4 16,12 8,20"/>' },
  { id: 'toc', name: 'Table of Contents', nameCn: '目录', svg: '<line x1="8" y1="5" x2="20" y2="5"/><line x1="8" y1="10" x2="18" y2="10"/><line x1="8" y1="15" x2="16" y2="15"/><circle cx="4.5" cy="5" r="1.5" fill="currentColor"/><circle cx="4.5" cy="10" r="1.5" fill="currentColor"/><circle cx="4.5" cy="15" r="1.5" fill="currentColor"/>' },
  { id: 'scroll-mode', name: 'Scroll Mode', nameCn: '滚动模式', svg: '<rect x="4" y="3" width="16" height="18" rx="2"/><line x1="12" y1="7" x2="12" y2="17"/><polyline points="9,9 12,7 15,9"/><polyline points="9,15 12,17 15,15"/>' },
  { id: 'flip-mode', name: 'Flip Page', nameCn: '翻页模式', svg: '<path d="M5 4h7l-2 4h5l-4 8h3"/><path d="M19 4h-4l2 4h-5l4 8h-3"/><line x1="2" y1="20" x2="22" y2="20"/>' },
  { id: 'back-to-top', name: 'Back to Top', nameCn: '回到顶部', svg: '<polyline points="7,12 12,7 17,12"/><line x1="12" y1="7" x2="12" y2="21"/>' },
  { id: 'light-mode', name: 'Light Mode', nameCn: '亮色模式', svg: '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>' },
  { id: 'dark-mode', name: 'Dark Mode', nameCn: '暗色模式', svg: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>' },
  { id: 'font-size', name: 'Font Size', nameCn: '字体大小', svg: '<text x="6" y="16" fill="currentColor" stroke="none" font-size="10" font-family="DM Mono, monospace" font-weight="500">A</text><text x="14" y="18" fill="currentColor" stroke="none" font-size="5" font-family="DM Mono, monospace" font-weight="500">A</text><line x1="10" y1="13" x2="19" y2="4" stroke="currentColor" stroke-width="1.5"/>' },
  { id: 'brightness', name: 'Brightness', nameCn: '亮度', svg: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M4.93 4.93l1.41 1.41"/><path d="M17.66 17.66l1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M6.34 17.66l-1.41 1.41"/><path d="M19.07 4.93l-1.41 1.41"/>' },
  { id: 'highlight', name: 'Highlight', nameCn: '高亮', svg: '<path d="M6 3h12l-2 6h-8L6 3z"/><line x1="8" y1="9" x2="8" y2="21"/><line x1="16" y1="9" x2="16" y2="21"/><line x1="6" y1="15" x2="18" y2="15"/>' },
  { id: 'note', name: 'Note / Annotation', nameCn: '笔记', svg: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/>' },
  { id: 'progress', name: 'Reading Progress', nameCn: '阅读进度', svg: '<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18"/><polyline points="12,3 12,12 16,16"/>' },
  { id: 'chapter-progress', name: 'Chapter Progress', nameCn: '章节进度', svg: '<rect x="3" y="5" width="2" height="14" rx="1"/><rect x="8" y="5" width="2" height="14" rx="1"/><rect x="13" y="5" width="2" height="14" rx="1"/><rect x="18" y="5" width="2" height="10" rx="1"/>' },
  { id: 'bookshelf', name: 'Bookshelf', nameCn: '书架', svg: '<rect x="2" y="3" width="4" height="18" rx="1"/><rect x="8" y="4" width="4" height="16" rx="1"/><rect x="14" y="2" width="4" height="20" rx="1"/><rect x="20" y="5" width="3" height="14" rx="1"/>' },
  { id: 'series', name: 'Series / Collection', nameCn: '系列', svg: '<rect x="3" y="4" width="4" height="16" rx="1"/><rect x="9" y="4" width="4" height="16" rx="1"/><rect x="15" y="4" width="4" height="16" rx="1"/><path d="M7 12h2"/><path d="M13 12h2"/>' },
  { id: 'dictionary', name: 'Dictionary', nameCn: '词典', svg: '<circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/><path d="M6 4v14c0 2 2 3 4 3h8"/>' },
  { id: 'tts', name: 'Text-to-Speech', nameCn: '朗读', svg: '<path d="M6 4h12v16H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><path d="M10 9h4v6h-4z"/><path d="M10 9v6"/><line x1="16" y1="12" x2="18" y2="12"/>' },
  { id: 'lock-orientation', name: 'Lock Orientation', nameCn: '锁定方向', svg: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/><circle cx="12" cy="16" r="1" fill="currentColor"/>' },
]

const video: IconItem[] = [
  { id: 'movie', name: 'Movie', nameCn: '电影', svg: '<rect x="3" y="6" width="18" height="13" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="6" x2="8" y2="10"/><line x1="12" y1="6" x2="12" y2="10"/><line x1="16" y1="6" x2="16" y2="10"/><rect x="4" y="3" width="16" height="3" rx="1"/><circle cx="12" cy="16" r="2.5"/>' },
  { id: 'tv-show', name: 'TV Show', nameCn: '电视剧', svg: '<rect x="3" y="5" width="18" height="13" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="18" x2="12" y2="21"/>' },
  { id: 'episodes', name: 'Episodes', nameCn: '剧集', svg: '<rect x="3" y="3" width="18" height="5" rx="1"/><rect x="3" y="10" width="18" height="5" rx="1"/><rect x="3" y="17" width="18" height="5" rx="1"/><polygon points="10,4.5 10,6.5 13,5.5" fill="currentColor" stroke="none"/><polygon points="10,11.5 10,13.5 13,12.5" fill="currentColor" stroke="none"/>' },
  { id: 'trailer', name: 'Trailer', nameCn: '预告片', svg: '<circle cx="12" cy="12" r="9"/><polygon points="10,8 10,16 17,12"/><circle cx="12" cy="12" r="3" opacity="0.4"/>' },
  { id: 'subtitles', name: 'Subtitles', nameCn: '字幕', svg: '<rect x="3" y="4" width="18" height="13" rx="2"/><line x1="7" y1="12" x2="17" y2="12"/><line x1="6" y1="15" x2="18" y2="15"/>' },
  { id: 'quality', name: 'Quality / HD', nameCn: '画质', svg: '<rect x="3" y="5" width="18" height="13" rx="2"/><text x="12" y="14" text-anchor="middle" fill="currentColor" stroke="none" font-size="7" font-family="DM Mono, monospace" font-weight="600">HD</text>' },
  { id: 'aspect-ratio', name: 'Aspect Ratio', nameCn: '比例', svg: '<rect x="3" y="5" width="18" height="10" rx="1.5"/><rect x="6" y="8" width="12" height="8" rx="1" opacity="0.4"/><line x1="9" y1="2" x2="9" y2="5"/><line x1="15" y1="2" x2="15" y2="5"/><line x1="9" y1="19" x2="9" y2="22"/><line x1="15" y1="19" x2="15" y2="22"/>' },
  { id: 'picture-in-picture', name: 'Picture in Picture', nameCn: '画中画', svg: '<rect x="2" y="4" width="20" height="13" rx="2"/><rect x="13" y="10" width="10" height="6" rx="1.5"/><polygon points="16,12 16,14 19,13"/>' },
  { id: 'danmaku', name: 'Danmaku', nameCn: '弹幕', svg: '<rect x="3" y="4" width="18" height="15" rx="2"/><line x1="5" y1="9" x2="16" y2="9"/><line x1="2" y1="12" x2="19" y2="12"/><line x1="6" y1="15" x2="17" y2="15"/>' },
  { id: 'skip-intro', name: 'Skip Intro', nameCn: '跳过片头', svg: '<polygon points="4,5 12,12 4,19"/><polygon points="12,5 20,12 12,19"/><line x1="20" y1="5" x2="20" y2="19"/><text x="18" y="15" text-anchor="middle" fill="currentColor" stroke="none" font-size="4.5" font-family="DM Mono, monospace" font-weight="500">skip</text>' },
]

export const iconData: Record<string, IconItem[]> = {
  general, music, comic, audiobook, ebook, video,
}

const _iconMap = new Map<string, IconItem>()
for (const cat of Object.values(iconData)) {
  for (const icon of cat) _iconMap.set(icon.id, icon)
}

export function getIcon(id: string): IconItem | undefined {
  return _iconMap.get(id)
}
