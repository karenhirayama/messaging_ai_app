import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react({
      babel: {
        plugins: [
          ['babel-plugin-react-compiler']
        ]
      }
    })
  ],
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom']
  }
})