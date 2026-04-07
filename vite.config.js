import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import fs from 'node:fs'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    {
      name: 'copy-lp-folder',
      closeBundle() {
        const src = path.resolve(process.cwd(), 'lp');
        const dest = path.resolve(process.cwd(), 'dist', 'lp');
        if (fs.existsSync(src)) {
          fs.cpSync(src, dest, { recursive: true });
          console.log('✓ Copied lp/ to dist/lp/');
        }
      }
    },
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-192.png', 'icon-512-real.png', 'icon-512.png', 'icon.svg'],
      workbox: {
        navigateFallbackDenylist: [/^\/katsudo-log\/lp\//, /\/help\.html$/],
      },
      manifest: {
        name: 'LogNote',
        short_name: 'LogNote',
        description: 'LogNote - 記録アプリ',
        theme_color: '#2E5C55',
        background_color: '#FDFBF7',
        display: 'standalone',
        start_url: '.',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icon-512-real.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icon-512-real.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      }
    })
  ],
  base: mode === 'production' ? '/katsudo-log/' : '/',
}))
