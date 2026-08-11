import { readAll, writeAll } from '@/lib/db'
import { blobToDataUrl, dataUrlToBlob } from '@/lib/image'
import { downloadBlob } from '@/lib/share'
import { isBusinessInfo, isMenu, ValidationError } from '@/lib/validation'
import { DEFAULT_BUSINESS } from '@/lib/defaults'
import { todayIso } from '@/lib/date'
import { type BusinessInfo, liveFormatId, liveTemplateId, type Menu, type StoredImage } from '@/types/menu'

/**
 * Menus live only on this device, so the safety net is an explicit backup file
 * the family can keep in WhatsApp or Drive. It is also the migration path if
 * they ever switch phones.
 */

const FORMAT = 'maranatha-menu-backup'
const VERSION = 1
const MAX_BACKUP_BYTES = 200 * 1024 * 1024

interface SerialisedImage {
  id: string
  dataUrl: string
  width: number
  height: number
  focalX: number
  focalY: number
}

interface BackupFile {
  format: typeof FORMAT
  version: number
  exportedAt: string
  business: BusinessInfo
  menus: Menu[]
  images: SerialisedImage[]
}

export async function downloadBackup(): Promise<void> {
  const { menus, business, images } = await readAll()
  const payload: BackupFile = {
    format: FORMAT,
    version: VERSION,
    exportedAt: new Date().toISOString(),
    business,
    menus,
    images: await Promise.all(
      images.map(async (image) => ({
        id: image.id,
        dataUrl: await blobToDataUrl(image.blob),
        width: image.width,
        height: image.height,
        focalX: image.focalX,
        focalY: image.focalY,
      })),
    ),
  }
  const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' })
  downloadBlob(blob, `respaldo-menus-maranatha-${todayIso()}.json`)
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

/** Data URL guard: only decode images, never `data:text/html` or a remote URL. */
function isImageDataUrl(value: unknown): value is string {
  return typeof value === 'string' && /^data:image\/(png|jpeg|webp|avif);base64,[a-z0-9+/=]+$/i.test(value)
}

function isSerialisedImage(value: unknown): value is SerialisedImage {
  if (!isRecord(value)) return false
  const inRange = (n: unknown) => typeof n === 'number' && n >= 0 && n <= 1
  return (
    typeof value.id === 'string' &&
    value.id.length <= 64 &&
    isImageDataUrl(value.dataUrl) &&
    typeof value.width === 'number' &&
    typeof value.height === 'number' &&
    inRange(value.focalX) &&
    inRange(value.focalY)
  )
}

/**
 * A restore file is untrusted input, so every field is checked before anything
 * reaches the database — malformed entries are dropped rather than imported.
 */
export async function restoreBackup(file: File): Promise<{ menus: number; images: number }> {
  if (file.size > MAX_BACKUP_BYTES) {
    throw new ValidationError('El archivo de respaldo es demasiado grande.')
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(await file.text())
  } catch {
    throw new ValidationError('Ese archivo no es un respaldo válido.')
  }

  if (!isRecord(parsed) || parsed.format !== FORMAT) {
    throw new ValidationError('Ese archivo no es un respaldo de Menú Maranatha.')
  }
  if (parsed.version !== VERSION) {
    throw new ValidationError('Ese respaldo viene de otra versión de la aplicación.')
  }

  // La plantilla y el formato se traducen antes de validar: un respaldo hecho
  // cuando existían «Redes» o el 1:1 debe restaurarse completo, no perder esos
  // menús por un id retirado.
  const menus = Array.isArray(parsed.menus)
    ? parsed.menus
        .map((menu: unknown) =>
          isRecord(menu)
            ? {
                ...menu,
                templateId: liveTemplateId(menu.templateId),
                formatId: liveFormatId(menu.formatId),
              }
            : menu,
        )
        .filter(isMenu)
    : []
  if (menus.length === 0) throw new ValidationError('El respaldo no contiene menús válidos.')

  const rawImages = Array.isArray(parsed.images) ? parsed.images.filter(isSerialisedImage) : []
  const images: StoredImage[] = await Promise.all(
    rawImages.map(async (image) => ({
      id: image.id,
      blob: await dataUrlToBlob(image.dataUrl),
      width: image.width,
      height: image.height,
      focalX: image.focalX,
      focalY: image.focalY,
    })),
  )

  const business = isBusinessInfo(parsed.business) ? parsed.business : DEFAULT_BUSINESS

  await writeAll({ menus, images, business })
  return { menus: menus.length, images: images.length }
}
