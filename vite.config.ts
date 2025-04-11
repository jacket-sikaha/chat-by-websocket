import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import vitePluginImp from 'vite-plugin-imp';

// const ORIGIN_SERVER = import.meta.env.VITE_ORIGIN_SERVER;
// https://vitejs.dev/config/
// Vite 默认是不加载 .env 文件的，因为这些文件需要在执行完 Vite 配置后才能确定加载哪一个
export default defineConfig(({ command, mode }) => {
  // 根据当前工作目录中的 `mode` 加载 .env 文件
  // 设置第三个参数为 '' 来加载所有环境变量，而不管是否有 `VITE_` 前缀。
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [
      react(),
      vitePluginImp({
        libList: [
          // 按需引入 antd
          {
            libName: 'antd',
            style(name) {
              // use less
              return `antd/es/${name}/style/index.js`;
            }
          }
        ]
      })
    ],
    server: {
      proxy: {
        // string shorthand: http://localhost:5173/foo -> http://localhost:4567/foo
        '/foo': 'http://localhost:4567',
        // with options: http://localhost:5173/api/bar-> http://jsonplaceholder.typicode.com/bar
        '/api': {
          target: env.VITE_ORIGIN_SERVER,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        },
        // with RegEx: http://localhost:5173/fallback/ -> http://jsonplaceholder.typicode.com/
        '^/fallback/.*': {
          target: 'http://jsonplaceholder.typicode.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/fallback/, '')
        },
        // Proxying websockets or socket.io: ws://localhost:5173/socket.io -> ws://localhost:5174/socket.io
        '/socket.io': {
          target: 'ws://localhost:5174',
          ws: true
        }
      }
    }
  };
});
