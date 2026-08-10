import type { ComponentType } from 'react'
import type { ImageMap } from '@/hooks/useMenuImages'
import type { BusinessInfo, FormatId, Menu, TemplateId } from '@/types/menu'

/**
 * A template is a pure function of the menu — no store access, no data loading,
 * no editor knowledge. That is the whole reason the editor and the printed
 * menu can evolve separately, and why adding a fourth design is one file plus
 * one registry line.
 */
export interface TemplateProps {
  menu: Menu
  business: BusinessInfo
  /** Photos, already decoded to data URLs so rendering is synchronous. */
  images: ImageMap
  format: MenuFormat
}

export interface MenuFormat {
  id: FormatId
  label: string
  /** Output size in CSS pixels; also the real exported pixel size at scale 1. */
  width: number
  height: number
  hint: string
}

/**
 * Every template must put this attribute on the element whose overflow decides
 * whether the menu fits — the same element it hands to `useFitScale`. It is how
 * the app detects a menu that had to be clipped and warns instead of silently
 * dropping dishes from the export.
 */
export const FIT_FRAME_ATTRIBUTE = 'data-fit-frame'

export interface TemplateDefinition {
  id: TemplateId
  name: string
  description: string
  /** Swatches shown in the picker so the choice is visual, not verbal. */
  swatch: [string, string]
  Component: ComponentType<TemplateProps>
}
