import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { useAsyncData } from '@/hooks/useAsync'
import { indexedDbRepository } from '@/lib/db'
import { DEFAULT_BUSINESS } from '@/lib/defaults'
import type { BusinessInfo } from '@/types/menu'

interface BusinessContextValue {
  business: BusinessInfo
  isLoading: boolean
  save: (info: BusinessInfo) => Promise<void>
}

const BusinessContext = createContext<BusinessContextValue | undefined>(undefined)

/**
 * Business details are read by every template on every render, so they are
 * loaded once at the root instead of re-fetched per screen. If storage is
 * unavailable the app still works, falling back to the details transcribed
 * from the current printed menu.
 */
export function BusinessProvider({ children }: { children: ReactNode }) {
  const { data, isLoading } = useAsyncData(() => indexedDbRepository.getBusiness(), [])
  const [saved, setSaved] = useState<BusinessInfo | undefined>(undefined)

  const save = useCallback(async (info: BusinessInfo) => {
    await indexedDbRepository.saveBusiness(info)
    setSaved(info)
  }, [])

  const business = saved ?? data ?? DEFAULT_BUSINESS

  const value = useMemo<BusinessContextValue>(
    () => ({ business, isLoading, save }),
    [business, isLoading, save],
  )

  return <BusinessContext.Provider value={value}>{children}</BusinessContext.Provider>
}

export function useBusiness(): BusinessContextValue {
  const context = useContext(BusinessContext)
  if (!context) throw new Error('useBusiness debe usarse dentro de <BusinessProvider>')
  return context
}
