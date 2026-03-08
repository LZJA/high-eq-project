import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";

const plugins = [react(), tailwindcss(), jsxLocPlugin()];

export default defineConfig({
  plugins,
  // 生产环境基础路径（如果部署在子路径如 /app，改为 '/app/'）
  base: '/',
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
    // 生成源码映射（可选，方便调试）
    sourcemap: false,
    // 资源内联限制
    assetsInlineLimit: 4096,
    // CSS 代码拆分
    cssCodeSplit: true,
    // 构建后文件名哈希
    rollupOptions: {
      output: {
        manualChunks: {
          // 将 React 相关库打包成单独的 chunk
          'react-vendor': ['react', 'react-dom'],
          // 将 Radix UI 组件库打包成单独的 chunk
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-select', '@radix-ui/react-tabs'],
        },
      },
    },
  },
  server: {
    port: 3000,
    strictPort: false,
    host: true,
    allowedHosts: [
      "localhost",
      "127.0.0.1",
    ],
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
    // 开发环境 API 代理到后端
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});
