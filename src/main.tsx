import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Self-hosted so the exporter can inline them: a CDN font would be blocked by
// CORS when rasterising and the menu would export in a fallback typeface.
import '@fontsource/baloo-2/latin-700.css'
import '@fontsource/baloo-2/latin-800.css'
import '@fontsource/baloo-2/latin-ext-700.css'
import '@fontsource/baloo-2/latin-ext-800.css'
import '@fontsource-variable/plus-jakarta-sans/wght.css'

import '@/styles/global.css'
import { App } from '@/App'

const container = document.getElementById('root')
if (!container) throw new Error('No se encontró el elemento #root')

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
