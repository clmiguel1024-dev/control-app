import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/control-app/',
  css: {
    transformer: 'postcss',
    minify: 'esbuild', // Cambia el minificador a esbuild para evitar errores de sintaxis en CSS
  },
})