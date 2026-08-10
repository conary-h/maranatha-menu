/// <reference types="vite/client" />

/** Assets imported with `?inline` become data URLs — see src/templates/logo.ts. */
declare module '*?inline' {
  const src: string
  export default src
}
