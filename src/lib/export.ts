/**
 * Rasterising the finished menu.
 *
 * The template renders at its real social-media size (1080px wide) inside the
 * page; the on-screen preview only *looks* small because an outer wrapper is
 * CSS-scaled. Capture is told that design size explicitly and multiplies it up,
 * which is why exports are genuinely crisp rather than upscaled screenshots.
 */

export type ExportKind = 'png' | 'jpg' | 'pdf'

export class ExportError extends Error {
  override readonly name = 'ExportError'
}

export interface ExportResult {
  blob: Blob
  filename: string
  mimeType: string
}

/** The canvas's true design size, in CSS pixels. */
export interface ExportSize {
  width: number
  height: number
}

const JPEG_QUALITY = 0.92
/** Hard ceiling so a 9:16 export can't blow up memory on an older phone. */
const MAX_PIXELS = 14_000_000

interface DeviceMemoryNavigator extends Navigator {
  deviceMemory?: number
}

/** 2x looks noticeably crisper after WhatsApp re-compresses; back off if RAM is tight. */
function pickScale(size: ExportSize): number {
  const memory = (navigator as DeviceMemoryNavigator).deviceMemory
  const preferred = memory !== undefined && memory <= 4 ? 1.5 : 2
  const pixels = size.width * size.height
  if (pixels === 0) throw new ExportError('La vista previa aún no está lista. Intenta de nuevo.')
  const maxScale = Math.sqrt(MAX_PIXELS / pixels)
  return Math.max(1, Math.min(preferred, maxScale))
}

async function capture(node: HTMLElement, size: ExportSize): Promise<HTMLCanvasElement> {
  // Rasterising before the display font is ready produces a fallback-font image.
  await document.fonts.ready
  // Loaded on demand: nothing before the first export needs the rasteriser.
  const { domToCanvas } = await import('modern-screenshot')
  try {
    return await domToCanvas(node, {
      // The design size must be passed explicitly. Left to itself the library
      // measures with `getBoundingClientRect()`, which includes the CSS
      // transform the preview uses to shrink the canvas on screen — the export
      // would silently come out at preview resolution instead of 1080-wide.
      width: size.width,
      height: size.height,
      scale: pickScale(size),
      backgroundColor: '#ffffff',
      fetch: { bypassingCache: true },
    })
  } catch (cause) {
    throw new ExportError('No se pudo generar la imagen del menú.', { cause })
  }
}

function canvasToBlob(canvas: HTMLCanvasElement, mimeType: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new ExportError('No se pudo generar el archivo.'))),
      mimeType,
      quality,
    )
  })
}

function releaseCanvas(canvas: HTMLCanvasElement): void {
  canvas.width = 0
  canvas.height = 0
}

/** A4-height page, width following the design's aspect ratio: no letterboxing. */
function pageSizePt(canvas: HTMLCanvasElement): [number, number] {
  const LONG_SIDE_PT = 842
  const aspect = canvas.width / canvas.height
  return aspect >= 1 ? [LONG_SIDE_PT, LONG_SIDE_PT / aspect] : [LONG_SIDE_PT * aspect, LONG_SIDE_PT]
}

async function toPdf(canvas: HTMLCanvasElement): Promise<Blob> {
  // ~350 kB of library that only matters the moment someone taps "PDF".
  const { jsPDF } = await import('jspdf')
  const [widthPt, heightPt] = pageSizePt(canvas)
  const doc = new jsPDF({
    orientation: widthPt >= heightPt ? 'landscape' : 'portrait',
    unit: 'pt',
    format: [widthPt, heightPt],
    compress: true,
  })
  doc.addImage(
    canvas.toDataURL('image/jpeg', JPEG_QUALITY),
    'JPEG',
    0,
    0,
    widthPt,
    heightPt,
    undefined,
    'FAST',
  )
  return doc.output('blob')
}

function exportFilename(kind: ExportKind, date: string): string {
  return `menu-maranatha-${date}.${kind}`
}

export async function exportMenu(
  node: HTMLElement,
  kind: ExportKind,
  date: string,
  size: ExportSize,
): Promise<ExportResult> {
  const canvas = await capture(node, size)
  try {
    const filename = exportFilename(kind, date)
    switch (kind) {
      case 'png':
        return { blob: await canvasToBlob(canvas, 'image/png'), filename, mimeType: 'image/png' }
      case 'jpg':
        return {
          blob: await canvasToBlob(canvas, 'image/jpeg', JPEG_QUALITY),
          filename,
          mimeType: 'image/jpeg',
        }
      case 'pdf':
        return { blob: await toPdf(canvas), filename, mimeType: 'application/pdf' }
    }
  } finally {
    releaseCanvas(canvas)
  }
}
