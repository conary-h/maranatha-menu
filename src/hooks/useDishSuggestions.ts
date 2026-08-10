import { useEffect, useMemo, useState } from 'react'
import { collectDishNameCounts } from '@/lib/db'
import { normalise, seedsFor, sectionKind } from '@/lib/dishCatalog'
import type { Menu, MenuSection } from '@/types/menu'

/**
 * Suggestion list for a dish-name field.
 *
 * Ranked so that what the family actually cooks comes first: names they have
 * saved before (most-used first), then the seed catalogue for that kind of
 * section. Names already used in the menu being edited are dropped — offering
 * "Pollo al horno" when it is three rows above is noise, not help.
 */

/** Read once per session; the editor mounts often and the data barely changes. */
let cached: Promise<Map<string, { display: string; count: number }>> | undefined

function loadCounts() {
  cached ??= collectDishNameCounts().catch((error: unknown) => {
    console.error(error)
    cached = undefined
    return new Map<string, { display: string; count: number }>()
  })
  return cached
}

/** Called after a save so newly typed names become suggestions straight away. */
export function refreshDishSuggestions(): void {
  cached = undefined
}

export function useDishSuggestions(
  section: Pick<MenuSection, 'title' | 'priceMode' | 'dishes'>,
  menu: Menu | undefined,
): string[] {
  const [learned, setLearned] = useState<{ display: string; count: number }[]>([])

  useEffect(() => {
    let cancelled = false
    void loadCounts().then((counts) => {
      if (cancelled) return
      setLearned([...counts.values()].sort((a, b) => b.count - a.count))
    })
    return () => {
      cancelled = true
    }
  }, [])

  const kind = sectionKind(section)

  // Names already on this menu, so we never suggest a duplicate.
  const usedKey = menu
    ? menu.sections
        .flatMap((current) => current.dishes.map((dish) => normalise(dish.name)))
        .filter(Boolean)
        .sort()
        .join('|')
    : ''

  return useMemo(() => {
    const used = new Set(usedKey ? usedKey.split('|') : [])
    const seen = new Set<string>()
    const result: string[] = []

    const push = (name: string) => {
      const key = normalise(name)
      if (!key || used.has(key) || seen.has(key)) return
      seen.add(key)
      result.push(name)
    }

    for (const entry of learned) push(entry.display)
    for (const name of seedsFor(kind)) push(name)
    return result
  }, [learned, kind, usedKey])
}
