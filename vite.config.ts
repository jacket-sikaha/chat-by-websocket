import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import { visualizer } from "rollup-plugin-visualizer";
import viteCompression from "vite-plugin-compression";
import svgr from "vite-plugin-svgr";

// const ORIGIN_SERVER = import.meta.env.VITE_ORIGIN_SERVER;
// https://vitejs.dev/config/
// Vite 默认是不加载 .env 文件的，因为这些文件需要在执行完 Vite 配置后才能确定加载哪一个
export default defineConfig(({ mode }) => {
  // 根据当前工作目录中的 `mode` 加载 .env 文件
  // 设置第三个参数为 '' 来加载所有环境变量，而不管是否有 `VITE_` 前缀。
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [
      react(),
      svgr(),
      viteCompression({
        algorithm: "gzip",
        threshold: 10240,
        ext: ".gz",
        filter: (file) => {
          if (file.includes("google6a66598811758c28.html")) {
            return false;
          }
          return /\.(js|mjs|json|css|html)$/i.test(file);
        },
      }),
      env.VITE_OPEN_ANALYSIS === "1" &&
        visualizer({
          filename: "bundle-analysis.html",
        }),
    ],
    resolve: {
      // 启用 Vite 原生的 tsconfig paths 解析（替代插件）
      tsconfigPaths: true,
      // 路径别名由vite-tsconfig-paths插件自动从tsconfig.json读取
      alias: [],
    },
    build: {
      target: "es2020",
      cssCodeSplit: true,
      sourcemap: true,

      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [
              {
                name: "react-vendor",
                test: /node_modules[\\/]react/,
                priority: 20,
              },
              {
                name: "ui-vendor",
                test: /node_modules[\\/]antd/,
                priority: 15,
              },
            ],
          },
          // manualChunks: {
          //   antd: ["antd"],
          //   vendor: ["react", "react-dom", "react-router-dom"],
          //   mui: ["@mui/material", "@mui/icons-material"],
          //   utils: ["axios", "dayjs"],
          // },
          chunkFileNames: "assets/js/[name]-[hash].js",
          assetFileNames: "assets/[ext]/[name]-[hash][extname]",
        },
      },
      // minify: false
    },
    server: {
      proxy: {
        // 字符串简写写法：
        // http://localhost:5173/foo
        // -> http://localhost:4567/foo
        "/foo": "http://localhost:4567",
        // with options: http://localhost:5173/api/bar-> http://jsonplaceholder.typicode.com/bar
        "/api": {
          target: env.VITE_ORIGIN_SERVER,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
        // 正则表达式写法：
        // http://localhost:5173/fallback/
        // -> http://jsonplaceholder.typicode.com/
        "^/fallback/.*": {
          target: "http://jsonplaceholder.typicode.com",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/fallback/, ""),
        },
        // 使用 proxy 实例
        "/api1": {
          target: "http://jsonplaceholder.typicode.com",
          changeOrigin: true,
          configure: (_proxy, _options) => {
            // proxy 是 'http-proxy' 的实例
          },
        },
        // 代理 websockets 或 socket.io 写法：
        // ws://localhost:5173/socket.io
        // -> ws://localhost:5174/socket.io
        // 在使用 `rewriteWsOrigin` 时要特别谨慎，因为这可能会让
        // 代理服务器暴露在 CSRF 攻击之下
        "/socket.io": {
          target: "ws://localhost:5174",
          ws: true,
          rewriteWsOrigin: true,
        },
      },
    },
  };
});
