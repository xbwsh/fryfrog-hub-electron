# Fryfrog Hub - Electron

Fryfrog Hub 桌面客户端，基于 Electron + Vue 3 构建。

## 开发

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build        # 构建渲染进程和主进程
npm run build:mac    # 打包 macOS
npm run build:win    # 打包 Windows
npm run build:linux  # 打包 Linux
```

## 安装

从 [Releases](https://github.com/xbwsh/fryfrog-hub-electron/releases) 下载对应平台的安装包。

### macOS

安装后若提示"应用已损坏"或"无法验证开发者"，请在终端执行：

```bash
xattr -cr /Applications/Fryfrog\ Hub.app
```

## 技术栈

- **框架**：Electron 33 + Vue 3.5 + TypeScript 5.7
- **构建**：electron-vite 2.3
- **状态管理**：Pinia 2.3
- **路由**：Vue Router 4.5（Hash 模式）
- **HTTP**：axios 1.7
