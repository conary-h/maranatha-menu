import { useRef } from 'react'
import { fitStyle, useFitScale } from '@/hooks/useFitScale'
import { formatLongDate } from '@/lib/date'
import type { MenuSection } from '@/types/menu'
import { LOGO_ALT, LOGO_SRC } from './logo'
import { paletteVars, type Palette } from './palettes'
import {
  featuredOf,
  hasPriceOverrides,
  photoOf,
  photoStyle,
  priceLabel,
  printableDescription,
  printableSections,
  printableVerse,
  sectionBadge,
} from './shared'
import type { TemplateProps } from './types'
import { WhatsappMark } from './WhatsappMark'
import styles from './MenuLayout.module.css'

/**
 * La maquetación del menú impreso, compartida por las tres plantillas.
 *
 * Cabecera con logotipo y fecha → especial del día → secciones → versículo y
 * WhatsApp. Lo único que distingue a «Clásica», «Moderna» y «Redes» es la
 * paleta, que entra como variables CSS en la raíz.
 */
export function MenuLayout({
  menu,
  business,
  images,
  format,
  palette,
}: TemplateProps & { palette: Palette }) {
  const frameRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  // Hasta 1.12: un menú corto crece un poco para no flotar en medio de la
  // página. La búsqueda con intervalo garantiza que nunca recorte.
  const fit = useFitScale(frameRef, contentRef, [menu, images, format.id], { maxScale: 1.12 })

  const sections = printableSections(menu)
  const verse = printableVerse(menu, business)
  const featured = featuredOf(menu)
  const featuredPhoto = featured ? photoOf(featured.dish, images) : undefined
  const featuredPrice = featured
    ? priceLabel(featured.dish, featured.section, business.currency)
    : undefined
  const featuredDescription = featured
    ? printableDescription(featured.dish, featured.section)
    : undefined

  return (
    <div
      className={styles.root}
      data-format={format.id}
      style={{ width: format.width, height: format.height, ...paletteVars(palette) }}
    >
      <header className={styles.header}>
        <div className={styles.logoPlate}>
          <img className={styles.logo} src={LOGO_SRC} alt={LOGO_ALT} />
        </div>
        <span className={styles.kicker}>{menu.title}</span>
        <h1 className={styles.date}>{formatLongDate(menu.date)}</h1>
        <div className={styles.rule} aria-hidden="true">
          <span className={styles.ruleLine} />
          <span className={styles.ruleDot} />
          <span className={styles.ruleLine} />
        </div>
      </header>

      <div className={styles.frame} ref={frameRef} data-fit-frame="true">
        <div className={styles.content} ref={contentRef} style={fitStyle(fit)}>
          {featured ? (
            <div className={styles.hero}>
              {featuredPhoto ? (
                <img
                  className={styles.heroPhoto}
                  src={featuredPhoto.src}
                  style={photoStyle(featuredPhoto)}
                  alt=""
                />
              ) : null}
              <div
                className={[styles.heroCard, !featuredPhoto && styles.heroCardNoPhoto]
                  .filter(Boolean)
                  .join(' ')}
              >
                <div className={styles.heroText}>
                  <span className={styles.heroKicker}>Especial de hoy</span>
                  <p className={styles.heroName}>{featured.dish.name}</p>
                  {featuredDescription ? (
                    <p className={styles.heroDescription}>{featuredDescription}</p>
                  ) : null}
                </div>
                {featuredPrice ? <span className={styles.heroPrice}>{featuredPrice}</span> : null}
              </div>
            </div>
          ) : null}

          {sections.map((section) => (
            <Section
              key={section.id}
              section={section}
              currency={business.currency}
              images={images}
              skipDishId={featured?.dish.id}
            />
          ))}
        </div>
      </div>

      <footer className={styles.footer}>
        {verse ? (
          <p className={styles.verse}>
            “{verse.text}”
            {verse.ref ? <span className={styles.verseRef}>{verse.ref}</span> : null}
          </p>
        ) : null}
        <div className={styles.contact}>
          <WhatsappMark />
          <span>{business.phone}</span>
        </div>
        {business.footerNote ? <p className={styles.footNote}>{business.footerNote}</p> : null}
      </footer>
    </div>
  )
}

interface SectionProps {
  section: MenuSection
  currency: string
  images: TemplateProps['images']
  skipDishId: string | undefined
}

function Section({ section, currency, images, skipDishId }: SectionProps) {
  const badge = sectionBadge(section, currency)
  const mixedPrices = hasPriceOverrides(section)
  // El especial ya tiene su propio bloque arriba; repetirlo parece un error.
  const dishes = section.dishes.filter((dish) => dish.id !== skipDishId)
  if (dishes.length === 0) return null

  return (
    <section className={styles.section}>
      <div className={styles.sectionHead}>
        <h2 className={styles.sectionTitle}>{section.title}</h2>
        <span className={styles.sectionLine} />
        {badge ? <span className={styles.badge}>{badge}</span> : null}
      </div>
      {section.note ? <p className={styles.note}>{section.note}</p> : null}

      {section.priceMode === 'included' ? (
        <div className={styles.chips}>
          {dishes.map((dish) => {
            const photo = photoOf(dish, images)
            return (
              <span className={styles.chip} key={dish.id}>
                {photo ? (
                  <img className={styles.chipThumb} src={photo.src} style={photoStyle(photo)} alt="" />
                ) : null}
                {dish.name}
              </span>
            )
          })}
        </div>
      ) : section.priceMode === 'flat' ? (
        // Dos columnas de nombres mientras el precio sea uno solo: lo dice el
        // rótulo. En cuanto alguno se sale del precio común, cada uno imprime
        // el suyo —incluidos los que siguen en el precio de la sección—.
        <div className={styles.columns}>
          {dishes.map((dish) => (
            <span className={styles.columnItem} key={dish.id}>
              {dish.name}
              {mixedPrices ? (
                <span className={styles.columnPrice}>
                  {priceLabel(dish, section, currency)}
                </span>
              ) : null}
            </span>
          ))}
        </div>
      ) : (
        <div className={styles.rows}>
          {dishes.map((dish) => {
            const photo = photoOf(dish, images)
            const price = priceLabel(dish, section, currency)
            const description = printableDescription(dish, section)
            return (
              <div className={styles.row} key={dish.id}>
                {photo ? (
                  <img className={styles.thumb} src={photo.src} style={photoStyle(photo)} alt="" />
                ) : null}
                <div className={styles.rowBody}>
                  <div className={styles.rowTop}>
                    <span className={styles.name}>{dish.name}</span>
                    <span className={styles.leader} aria-hidden="true" />
                    {price ? <span className={styles.price}>{price}</span> : null}
                  </div>
                  {description ? <p className={styles.description}>{description}</p> : null}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
