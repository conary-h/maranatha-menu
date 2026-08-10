import { useRef } from 'react'
import { WhatsappMark } from './WhatsappMark'
import { formatLongDate } from '@/lib/date'
import { fitStyle, useFitScale } from '@/hooks/useFitScale'
import type { MenuSection } from '@/types/menu'
import { LOGO_ALT, LOGO_SRC } from './logo'
import {
  featuredOf,
  photoOf,
  photoStyle,
  priceLabel,
  printableDescription,
  printableSections,
  sectionBadge,
} from './shared'
import type { TemplateProps } from './types'
import styles from './ClassicTemplate.module.css'

/**
 * Classic — cream paper, display serif-weight headings, dotted price leaders.
 * The leader is the point: it ties every price to its own dish, which is the
 * single worst failure of the menu this replaces.
 */
export function ClassicTemplate({ menu, business, images, format }: TemplateProps) {
  const frameRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const fit = useFitScale(frameRef, contentRef, [menu, images, format.id])

  const sections = printableSections(menu)
  const featured = featuredOf(menu)
  const featuredPhoto = featured ? photoOf(featured.dish, images) : undefined

  return (
    <div
      className={styles.root}
      data-format={format.id}
      style={{ width: format.width, height: format.height }}
    >
      <header className={styles.header}>
        <img className={styles.logo} src={LOGO_SRC} alt={LOGO_ALT} />
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
                  {printableDescription(featured.dish, featured.section) ? (
                    <p className={styles.heroDescription}>
                      {printableDescription(featured.dish, featured.section)}
                    </p>
                  ) : null}
                </div>
                {priceLabel(featured.dish, featured.section, business.currency) ? (
                  <span className={styles.heroPrice}>
                    {priceLabel(featured.dish, featured.section, business.currency)}
                  </span>
                ) : null}
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
        {business.verseText ? (
          <p className={styles.verse}>
            “{business.verseText}”<span className={styles.verseRef}>{business.verseRef}</span>
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
  // The featured dish already has its own hero block; repeating it reads as an error.
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
        <div className={styles.columns}>
          {dishes.map((dish) => (
            <span className={styles.columnItem} key={dish.id}>
              {dish.name}
            </span>
          ))}
        </div>
      ) : (
        <div className={styles.rows}>
          {dishes.map((dish) => {
            const photo = photoOf(dish, images)
            const price = priceLabel(dish, section, currency)
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
                  {dish.description ? <p className={styles.description}>{dish.description}</p> : null}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
