# Chat by WebSocket

> 基于 Socket.IO 构建的实时文件传输助手，支持大文件分片上传/下载、在线用户同步与断线重连。

[![Deploy](https://github.com/jacket-sikaha/chat-by-websocket/actions/workflows/deploy.yml/badge.svg)](https://github.com/jacket-sikaha/chat-by-websocket/actions/workflows/deploy.yml) [![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**Demo**: [https://ws.lee-sikaha.cloudns.ch](https://ws.lee-sikaha.cloudns.ch)

---

## 目录

- [技术栈](#技术栈)
- [核心设计](#核心设计)
- [功能特性](#功能特性)
- [项目结构](#项目结构)
- [安装与启动](#安装与启动)
- [构建部署](#构建部署)
- [配置说明](#配置说明)
- [API 概览](#api-概览)
- [开发记录](#开发记录)
- [License](#license)

---

## 技术栈

| 层       | 技术                                                |
| -------- | --------------------------------------------------- |
| 框架     | React 19 + TypeScript                               |
| 构建工具 | Vite 8                                              |
| 实时通信 | Socket.IO 4 (WebSocket)                             |
| 状态管理 | Zustand 5 + Immer                                   |
| UI 组件  | Ant Design 6 / Ant Design X / MUI 7 / TailwindCSS 3 |
| HTTP     | Axios                                               |
| 代码质量 | ESLint 9 + Prettier (organize-imports, tailwindcss) |
| CI/CD    | GitHub Actions → GitHub Pages                       |
| 容器化   | Docker                                              |

---

## 核心设计

### 架构概览

```
┌─────────────┐     WebSocket      ┌──────────────────┐
│   Browser    │ ◄──────────────►   │   Node Server    │
│  (React SPA) │     Socket.IO      │  (Socket.IO +    │
│             │                     │   Express)       │
└──────┬──────┘                     └────────┬─────────┘
       │ HTTP (Axios)                        │
       └──────────────────┬──────────────────┘
                          ▼
                  ┌──────────────────┐
                  │  File Storage    │
                  │  (文件系统)      │
                  └──────────────────┘
```

### 消息传输模型

消息通过 WebSocket 实时推送，类型分为文本和文件两种，由 `ChatMsgType` 枚举标示：

```typescript
enum ChatMsgType {
  str = 0, // 文本消息
  file = 1, // 文件消息
  other = 2
}
```

每条消息结构包含唯一 ID、类型、来源标识符（socketId）以及对应的载荷。来源标识符用于前端渲染时区分"自己"和"他人"的消息气泡位置。

### 文件上传流程

```
用户选择文件
    │
    ▼
Antd Attachments 组件触发 customRequest
    │
    ├── 创建 AbortController（支持取消上传）
    │
    ▼
Axios POST /api/share-file/upload (FormData)
    │
    ├── onUploadProgress 实时回调进度
    │       └── 更新 Zustand store → 气泡组件实时展示百分比
    │
    ▼
上传成功 → 服务端返回文件 fid
    │
    ▼
通过 WebSocket emit 'msg' 广播文件信息（含 fid）
    │
    ▼
其他在线用户收到消息 → 可点击下载
```

### 文件下载流程

```
用户点击文件气泡
    │
    ▼
downloadingFile Set 做去重（节流）
    │
    ▼
Axios POST /api/share-file/download-stream (responseType: blob)
    │
    ├── onDownloadProgress 实时回调进度
    │       └── 更新 Zustand store → 气泡组件实时展示百分比
    │
    ▼
下载完成 → URL.createObjectURL 创建临时链接 → 触发 <a>.click 下载
    │
    ▼
URL.revokeObjectURL 清理内存
```

### 在线用户同步

连接建立后，客户端向服务端发送 `connected-users` 事件，服务端广播当前所有已连接 socket 的 ID 列表。前端以 10 秒为间隔轮询同步，确保在线列表准确。

### 断线重连

Socket.IO 内置的 reconnection 机制，配合自定义 `reconnect_attempt` 事件监听：

- 尝试重连时显示 "正在重连" 全屏遮罩
- 超过 10 次尝试后提示 "重连失败"
- 重连成功后通过 socket ID 的变化校正消息归属

### 状态管理

使用 Zustand + `createSelectors` 工具函数自动生成选择器，避免不必要的组件重渲染：

```typescript
// store/utils.ts - 自动生成 selector hooks
const useChatUsersStore = createSelectors(useChatUsersStoreBase);
// 使用时直接按字段选取
const users = useChatUsersStore.use.users();
```

结合 Immer 实现高效的不可变状态更新。

### 工程化实践

- **代码分割**: Vite rolldownOptions 将 react 和 antd 分离为独立 chunk
- **构建产物压缩**: `vite-plugin-compression` 对 JS/CSS/HTML 产出 gzip
- **路由懒加载**: History 页面通过 `React.lazy` + `Suspense` 延迟加载
- **路径别名**: TypeScript paths 自动解析，无需额外插件
- **代码风格**: Prettier 自动排序 TailwindCSS class 和清理无用 import

---

## 功能特性

- [x] **实时消息**: 文本消息通过 WebSocket 即时推送
- [x] **文件传输**: 支持最大 500MB 文件，单次最多 3 个
- [x] **上传进度**: 基于 Axios onUploadProgress 实时显示百分比
- [x] **下载进度**: 基于 Axios onDownloadProgress 实时显示百分比
- [x] **取消上传**: 通过 AbortController 中断进行中的上传
- [x] **在线用户**: 实时同步在线用户列表，展示人数
- [x] **断线重连**: 自动重连 + 用户友好提示
- [x] **下载防抖**: 对同一文件的多次下载进行去重
- [x] **消息历史**: 独立的"我收到的信息"页面，支持文件重新下载
- [x] **文本复制**: 历史消息文本一键复制

---

## 项目结构

```
chat-by-websocket/
├── .github/workflows/
│   ├── deploy.yml          # GitHub Pages CI/CD
│   └── docker.yml          # Docker 构建
├── src/
│   ├── components/
│   │   ├── online-info-icon.tsx   # 在线人数图标
│   │   ├── users-drawer.tsx       # 在线用户抽屉
│   │   ├── loading.tsx            # 全局加载组件
│   │   └── ellipsis-middle.tsx    # 文本中间省略组件
│   ├── config/
│   │   └── route.tsx              # 路由配置（含懒加载）
│   ├── pages/
│   │   ├── index/index.tsx        # 主聊天页
│   │   └── history/index.tsx      # 消息历史页
│   ├── services/
│   │   └── file.ts                # 文件上传/下载 API
│   ├── socket/
│   │   └── index.ts               # Socket.IO 连接与事件管理
│   ├── store/
│   │   ├── index.ts               # Zustand stores（消息/用户）
│   │   └── utils.ts               # createSelectors 工具
│   ├── utils/
│   │   ├── index.ts               # downloadBlob / 速率格式化
│   │   ├── request.ts             # Axios 实例与拦截器
│   │   └── bubble-config.tsx      # 气泡渲染配置
│   ├── App.tsx                    # 应用根组件
│   ├── main.tsx                   # 应用入口
│   └── index.css                  # 全局样式
├── Dockerfile
├── index.html
├── vite.config.ts                 # Vite 配置（代理/构建优化）
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── eslint.config.js
├── .prettierrc.cjs
└── package.json
```

---

## 安装与启动

### 前置要求

- Node.js >= 18
- pnpm >= 8

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/jacket-sikaha/chat-by-websocket.git
cd chat-by-websocket

# 安装依赖
pnpm install

# 启动开发服务器（默认 http://localhost:5173）
pnpm dev
```

项目默认会代理 `/api` 请求到 `VITE_ORIGIN_SERVER` 指定的服务端地址，按需在 `.env` 文件中配置：

```bash
# .env 或 .env.local
VITE_ORIGIN_SERVER=http://your-server-address
VITE_OPEN_ANALYSIS=1   # 可选，开启 bundle 分析
```

> 开发模式下前端使用 `createBrowserRouter`，生产部署（GitHub Pages）自动切换为 `createHashRouter`。

---

## 构建部署

```bash
# 构建生产版本
pnpm build

# 本地预览构建产物
pnpm preview
```

---

## 配置说明

### 环境变量

| 变量                 | 说明                            | 默认值     |
| -------------------- | ------------------------------- | ---------- |
| `VITE_ORIGIN_SERVER` | 后端服务地址（WebSocket + API） | 无（必填） |
| `VITE_OPEN_ANALYSIS` | 是否开启构建产物分析            | `0`        |

### 构建优化配置

```typescript
// vite.config.ts - 代码分割
rolldownOptions: {
  output: {
    codeSplitting: {
      groups: [
        { name: 'react-vendor', test: /node_modules[\\/]react/, priority: 20 },
        { name: 'ui-vendor', test: /node_modules[\\/]antd/, priority: 15 }
      ];
    }
  }
}
```

---

## API 概览

以下为前端调用的后端接口约定。

### 上传文件

```
POST /api/share-file/upload
Content-Type: multipart/form-data

Body:
  file:   File
  userId: string

Response:
  { id: string }  // 文件 fid
```

### 下载文件（流式）

```
POST /api/share-file/download-stream
Content-Type: application/json

Body:
  userId: string
  fid:    string

Response: binary (Blob)
```

### WebSocket 事件

| 事件                | 方向       | 说明                       |
| ------------------- | ---------- | -------------------------- |
| `msg`               | 双向       | 发送/接收消息              |
| `connected-users`   | 双向       | 获取/同步在线用户列表      |
| `connect`           | 客户端监听 | 连接建立                   |
| `disconnect`        | 客户端监听 | 连接断开                   |
| `reconnect_attempt` | 客户端监听 | 重连尝试（内置自动重连后） |

---

### 开发记录

- 2025/6/19 连接完成同步在线人数数据，避免某一方因为数据不同步，消息列表渲染一个空指针组件导致页面崩溃
- 2025/6/18 解决断线重连的提示问题，消息列表因为socketid的变化导致的显示错位问题
- 2025/12/20 替换后端新服务器域名

---

## License

[MIT](LICENSE) © 2023 sikaha
