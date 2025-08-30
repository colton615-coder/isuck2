import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const repoName =
  (process.env.GITHUB_REPOSITORY && process.env.GITHUB_REPOSITORY.split('/')[1]) || ''
const isCI = !!process.env.GITHUB_ACTIONS

export default defineConfig({
  plugins: [react()],
  base: isCI ? `/${repoName}/` : '/',
  server: { port: 5173 },
  build: { sourcemap: true }
})