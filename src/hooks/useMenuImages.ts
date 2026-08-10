import { useEffect, useState, useSyncExternalStore } from 'react'
import { imagesVersion, loadImage, subscribeToImages, type ResolvedImage } from '@/lib/imageStore'
import type { Menu } from '@/types/menu'

export type ImageMap = ReadonlyMap<string, ResolvedImage>

const EMPTY: ImageMap = new Map()

function imageKeyOf(menu: Menu | undefined): string {
  if (!menu) return ''
  const ids = new Set<string>()
  for (const section of menu.sections) {
    for (const dish of section.dishes) {
      if (dish.imageId) ids.add(dish.imageId)
    }
  }
  return [...ids].sort().join(',')
}

interface Resolved {
  key: string
  version: number
  images: ImageMap
}

/**
 * Resolves every photo a menu references.
 *
 * Templates render synchronously from the returned map, so an export can never
 * capture a half-loaded picture — which is also why `isLoading` gates the
 * export buttons rather than merely showing a spinner.
 */
export function useMenuImages(menu: Menu | undefined): { images: ImageMap; isLoading: boolean } {
  const version = useSyncExternalStore(subscribeToImages, imagesVersion, () => 0)
  const key = imageKeyOf(menu)
  const [resolved, setResolved] = useState<Resolved>({ key: '', version: -1, images: EMPTY })

  useEffect(() => {
    if (key === '') return
    let cancelled = false
    void Promise.all(key.split(',').map(loadImage)).then((entries) => {
      if (cancelled) return
      const next = new Map<string, ResolvedImage>()
      for (const image of entries) {
        if (image) next.set(image.id, image)
      }
      setResolved({ key, version, images: next })
    })
    return () => {
      cancelled = true
    }
  }, [key, version])

  if (key === '') return { images: EMPTY, isLoading: false }

  const isFresh = resolved.key === key && resolved.version === version
  // Keep showing the previous photos while the new set decodes: the preview
  // stays stable instead of flashing empty frames on every edit.
  return { images: resolved.images, isLoading: !isFresh }
}
