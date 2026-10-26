import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    hmr: {
      clientPort: Number(process.env.HMR_CLIENT_PORT) || 443,
    },
  },
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, './src') },
      { find: /^@colyseus\/msgpackr$/, replacement: path.resolve(__dirname, 'node_modules/@colyseus/msgpackr/dist/index-no-eval.cjs') },
    ],
  },
})
