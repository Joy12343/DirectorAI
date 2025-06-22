// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import path from 'path' // ← 记得加这一行

// https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })


// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import { fileURLToPath } from 'url'
// import { dirname, resolve } from 'path'

// // 获取当前 vite.config.js 的目录
// const __filename = fileURLToPath(import.meta.url)
// const __dirname = dirname(__filename)

// export default defineConfig({
//   plugins: [react()],
//   resolve: {
//     alias: {
//       '@': resolve(__dirname, 'src'),  // ✅ 确保是 frontend/src
//     },
//   },
// })

// console.log("🔍 Alias @ maps to:", resolve(__dirname, 'src'))

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // ⬅️ 这行非常关键
    },
  },
})
