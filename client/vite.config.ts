import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const nonBlockingCss = {
  name: 'non-blocking-css',
  transformIndexHtml(html: string) {
    return html.replace(
      /<link rel="stylesheet" crossorigin href="([^"]+)">/g,
      '<link rel="preload" as="style" onload="this.onload=null;this.rel=\'stylesheet\'" href="$1"><noscript><link rel="stylesheet" href="$1"></noscript>'
    )
  },
}

export default defineConfig({
  plugins: [react(), tailwindcss(), nonBlockingCss],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})