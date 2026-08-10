import type { BusinessInfo, Menu, MenuSummary, StoredImage } from '@/types/menu'

/**
 * Everything the UI is allowed to know about persistence.
 *
 * The app ships with an IndexedDB implementation (`src/lib/db.ts`): menus live
 * on the device, cost nothing, work offline and need no secrets. If the family
 * ever needs a shared history across phones, a Supabase-backed implementation
 * of this same interface can be dropped in without touching a single component.
 */
export interface MenuRepository {
  listMenus(): Promise<MenuSummary[]>
  getMenu(id: string): Promise<Menu | undefined>
  saveMenu(menu: Menu): Promise<void>
  deleteMenu(id: string): Promise<void>

  getImage(id: string): Promise<StoredImage | undefined>
  putImage(image: StoredImage): Promise<void>

  getBusiness(): Promise<BusinessInfo>
  saveBusiness(info: BusinessInfo): Promise<void>
}

export class StorageError extends Error {
  override readonly name = 'StorageError'
  constructor(
    message: string,
    override readonly cause?: unknown,
  ) {
    super(message)
  }
}
