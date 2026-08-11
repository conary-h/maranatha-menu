import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'

/**
 * Separada de `vite.config.ts` a propósito: la app no debe arrastrar la
 * configuración de pruebas, ni las pruebas el plugin de React (no hace falta,
 * todo lo que se prueba aquí es lógica sin DOM).
 */
export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
    restoreMocks: true,
  },
})
