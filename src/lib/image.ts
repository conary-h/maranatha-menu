import { createId } from '@/lib/id'
import type { StoredImage } from '@/types/menu'

/**
 * Photos are processed entirely in the browser: validate → decode → downscale →
 * re-encode. They are stored *uncropped*; templates cover-crop with
 * `object-position`, so the framing stays editable forever and one photo can be
 * reused at 4:3, 1:1 or full-bleed without a second copy.
 */

const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
  'image/avif',
] as const

export const ACCEPT_ATTRIBUTE = 'image/jpeg,image/png,image/webp,image/heic,image/heif,image/avif'

/** Before decoding. Generous — the whole point is that we shrink it ourselves. */
const MAX_UPLOAD_BYTES = 20 * 1024 * 1024

/** Longest side after processing. 1400px covers a full-bleed photo at 3× export. */
const MAX_DIMENSION = 1400
const WEBP_QUALITY = 0.82
const JPEG_QUALITY = 0.85

export class ImageError extends Error {
  override readonly name = 'ImageError'
}

function describeBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function validateFile(file: File): void {
  if (file.size === 0) throw new ImageError('El archivo está vacío.')
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new ImageError(
      `La foto pesa ${describeBytes(file.size)}. El máximo es ${describeBytes(MAX_UPLOAD_BYTES)}.`,
    )
  }
  const type = file.type.toLowerCase()
  // An empty type is allowed: some Android pickers omit it. The decode below is
  // the real check — anything that is not an image simply fails to decode.
  if (type !== '' && !ACCEPTED_IMAGE_TYPES.includes(type as (typeof ACCEPTED_IMAGE_TYPES)[number])) {
    throw new ImageError('Ese archivo no es una foto. Usa JPG, PNG o WEBP.')
  }
}

async function decode(file: File): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(file)
  } catch (cause) {
    throw new ImageError(
      'No se pudo leer la foto. Si viene de un iPhone, prueba a compartirla como JPG.',
      { cause },
    )
  }
}

function fitWithin(width: number, height: number, max: number): { width: number; height: number } {
  const scale = Math.min(1, max / Math.max(width, height))
  return { width: Math.round(width * scale), height: Math.round(height * scale) }
}

async function encode(canvas: HTMLCanvasElement): Promise<Blob> {
  const toBlob = (type: string, quality: number) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality))

  const webp = await toBlob('image/webp', WEBP_QUALITY)
  // Safari < 14 and a few Android WebViews silently fall back to PNG here, which
  // would be far heavier than the original — so check what we actually got.
  if (webp && webp.type === 'image/webp') return webp

  const jpeg = await toBlob('image/jpeg', JPEG_QUALITY)
  if (jpeg) return jpeg
  throw new ImageError('El navegador no pudo procesar la foto.')
}

/** Validate, downscale and re-encode a picked file into a storable image. */
export async function processImageFile(file: File): Promise<StoredImage> {
  validateFile(file)
  const bitmap = await decode(file)
  try {
    const { width, height } = fitWithin(bitmap.width, bitmap.height, MAX_DIMENSION)
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')
    if (!context) throw new ImageError('El navegador no pudo procesar la foto.')
    context.drawImage(bitmap, 0, 0, width, height)
    const blob = await encode(canvas)
    // Free the backing store immediately; phones are tight on memory.
    canvas.width = 0
    canvas.height = 0
    return { id: createId('img'), blob, width, height, focalX: 0.5, focalY: 0.5 }
  } finally {
    bitmap.close()
  }
}

/** `object-position` value for a stored image's focal point. */
export function focalPosition(image: Pick<StoredImage, 'focalX' | 'focalY'>): string {
  return `${(image.focalX * 100).toFixed(1)}% ${(image.focalY * 100).toFixed(1)}%`
}

/**
 * Blob → data URL. `modern-screenshot` has to inline every image before it can
 * rasterise, and handing it a ready data URL removes any fetch during capture.
 */
export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const { result } = reader
      if (typeof result === 'string') resolve(result)
      else reject(new ImageError('No se pudo leer la fotografía guardada.'))
    }
    reader.onerror = () => reject(new ImageError('No se pudo leer la fotografía guardada.'))
    reader.readAsDataURL(blob)
  })
}

export async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const response = await fetch(dataUrl)
  return response.blob()
}
