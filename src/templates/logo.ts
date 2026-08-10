import logoDataUrl from '@/assets/logo-maranatha.png?inline'

/**
 * The logo is inlined as a data URL at build time.
 *
 * Exporting rasterises the DOM, and anything still being fetched at that moment
 * shows up as a hole in the picture. A data URL removes the fetch entirely, so
 * the logo is guaranteed present in every export — worth ~43 kB in the bundle.
 */
export const LOGO_SRC: string = logoDataUrl
export const LOGO_ALT = 'Comida Buffet Maranatha'
