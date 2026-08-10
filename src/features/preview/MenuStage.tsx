import { useEffect, useRef, type RefObject } from 'react'
import Box from '@mui/material/Box'
import { useElementWidth } from '@/hooks/useElementWidth'
import type { ImageMap } from '@/hooks/useMenuImages'
import { FORMATS, TEMPLATES } from '@/templates'
import { FIT_FRAME_ATTRIBUTE } from '@/templates/types'
import type { BusinessInfo, Menu } from '@/types/menu'

interface MenuStageProps {
  menu: Menu
  business: BusinessInfo
  images: ImageMap
  /** Points at the un-scaled canvas — this is what the exporter rasterises. */
  captureRef?: RefObject<HTMLDivElement | null>
  className?: string
  /** Fires when the menu is too long to fit even at the smallest readable size. */
  onOverflow?: (clipped: boolean) => void
}

/**
 * Renders a template at its true output size (1080px wide) and scales the whole
 * thing down with a CSS transform to fit whatever space is available.
 *
 * Because the transform lives on this wrapper and not on the canvas, the node
 * handed to the exporter still measures 1080×1920 — which is why an export is
 * genuinely high resolution rather than an upscaled screenshot.
 */
export function MenuStage({
  menu,
  business,
  images,
  captureRef,
  className,
  onOverflow,
}: MenuStageProps) {
  const boxRef = useRef<HTMLDivElement>(null)
  const width = useElementWidth(boxRef)
  const format = FORMATS[menu.formatId]
  const template = TEMPLATES[menu.templateId]
  const scale = width > 0 ? width / format.width : 0

  // Shrink-to-fit has a legibility floor; past it the canvas really does clip.
  // Reporting that is the difference between a warning and a menu that quietly
  // exports without its drinks section.
  useEffect(() => {
    if (!onOverflow) return
    const check = () => {
      const frames = boxRef.current?.querySelectorAll(`[${FIT_FRAME_ATTRIBUTE}]`) ?? []
      // Bounding rects, not scrollHeight: the content is CSS-scaled, so its
      // layout height is deliberately larger than the frame. What matters is
      // the height after the transform.
      onOverflow(
        [...frames].some((frame) => {
          const content = frame.firstElementChild
          if (!content) return false
          return content.getBoundingClientRect().height > frame.getBoundingClientRect().height + 2
        }),
      )
    }
    // Run after the fit passes have settled.
    const timer = setTimeout(check, 250)
    return () => clearTimeout(timer)
  }, [menu, images, width, onOverflow])

  return (
    <Box
      ref={boxRef}
      className={className}
      sx={{
        position: 'relative',
        width: '100%',
        overflow: 'hidden',
        borderRadius: 2,
        bgcolor: 'background.paper',
        boxShadow: 3,
      }}
      style={{ aspectRatio: `${format.width} / ${format.height}` }}
    >
      <Box
        sx={{ position: 'absolute', top: 0, left: 0, transformOrigin: 'top left' }}
        style={{
          width: format.width,
          height: format.height,
          transform: `scale(${scale})`,
          // Hide the un-scaled canvas until we know how much to shrink it.
          visibility: scale > 0 ? 'visible' : 'hidden',
        }}
      >
        <div ref={captureRef}>
          <template.Component menu={menu} business={business} images={images} format={format} />
        </div>
      </Box>
    </Box>
  )
}
