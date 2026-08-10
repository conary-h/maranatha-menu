import type { ExportResult } from '@/lib/export'

export type ShareOutcome = 'shared' | 'downloaded' | 'cancelled'

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.rel = 'noopener'
  document.body.append(anchor)
  anchor.click()
  anchor.remove()
  // Revoking immediately can cancel the download in Safari.
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
}

function toFile(result: ExportResult): File {
  return new File([result.blob], result.filename, { type: result.mimeType })
}

function canShareFiles(result: ExportResult): boolean {
  if (typeof navigator.share !== 'function' || typeof navigator.canShare !== 'function') return false
  try {
    return navigator.canShare({ files: [toFile(result)] })
  } catch {
    return false
  }
}

/**
 * On a phone this opens the native sheet — WhatsApp, Instagram, Photos — which
 * is the whole point of the product. Everywhere else it falls back to a plain
 * download, so the button never dead-ends.
 */
export async function shareOrDownload(result: ExportResult, title: string): Promise<ShareOutcome> {
  if (canShareFiles(result)) {
    try {
      await navigator.share({ files: [toFile(result)], title })
      return 'shared'
    } catch (error) {
      // The user closing the share sheet is a normal outcome, not a failure.
      if (error instanceof DOMException && error.name === 'AbortError') return 'cancelled'
      // Anything else (e.g. NotAllowedError) still deserves the file.
    }
  }
  downloadBlob(result.blob, result.filename)
  return 'downloaded'
}

/** Opens WhatsApp with a prefilled caption; the image is attached by the user. */
export function whatsappShareUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`
}
