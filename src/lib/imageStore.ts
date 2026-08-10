import { indexedDbRepository } from '@/lib/db'
import { blobToDataUrl } from '@/lib/image'
import type { StoredImage } from '@/types/menu'

/**
 * In-memory cache of decoded photos, shared by the editor and every template.
 *
 * Photos are handed around as data URLs rather than object URLs: `object:` URLs
 * would have to be revoked by hand (leaking otherwise) and `modern-screenshot`
 * has to inline them again at export time anyway. One decode, reused everywhere.
 */

export interface ResolvedImage {
  id: string
  src: string
  width: number
  height: number
  focalX: number
  focalY: number
}

const cache = new Map<string, Promise<ResolvedImage | undefined>>()
const listeners = new Set<() => void>()
let version = 0

function emit(): void {
  version += 1
  for (const listener of listeners) listener()
}

export function subscribeToImages(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function imagesVersion(): number {
  return version
}

export function loadImage(id: string): Promise<ResolvedImage | undefined> {
  const cached = cache.get(id)
  if (cached) return cached

  const pending = indexedDbRepository
    .getImage(id)
    .then(async (stored) =>
      stored
        ? {
            id: stored.id,
            src: await blobToDataUrl(stored.blob),
            width: stored.width,
            height: stored.height,
            focalX: stored.focalX,
            focalY: stored.focalY,
          }
        : undefined,
    )
    .catch((error: unknown) => {
      console.error(error)
      cache.delete(id) // let a later render retry
      return undefined
    })

  cache.set(id, pending)
  return pending
}

/** Store a freshly processed photo and make it immediately available. */
export async function saveImage(image: StoredImage): Promise<ResolvedImage> {
  await indexedDbRepository.putImage(image)
  const resolved: ResolvedImage = {
    id: image.id,
    src: await blobToDataUrl(image.blob),
    width: image.width,
    height: image.height,
    focalX: image.focalX,
    focalY: image.focalY,
  }
  cache.set(image.id, Promise.resolve(resolved))
  emit()
  return resolved
}

/** Re-frame an existing photo without re-encoding it. */
export async function updateFocalPoint(id: string, focalX: number, focalY: number): Promise<void> {
  const stored = await indexedDbRepository.getImage(id)
  if (!stored) return
  const next: StoredImage = { ...stored, focalX, focalY }
  await indexedDbRepository.putImage(next)
  const resolved = await cache.get(id)
  if (resolved) {
    cache.set(id, Promise.resolve({ ...resolved, focalX, focalY }))
  }
  emit()
}

/** Clears cached decodes — used after restoring a backup. */
export function resetImageCache(): void {
  cache.clear()
  emit()
}
