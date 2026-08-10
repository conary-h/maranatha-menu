import { Fragment, useRef } from 'react'
import { WhatsappMark } from './WhatsappMark'
import { formatDayMonth, formatWeekday } from '@/lib/date'
import { fitStyle, useFitScale } from '@/hooks/useFitScale'
import type { Dish, FormatId, MenuSection } from '@/types/menu'
import { LOGO_ALT, LOGO_SRC } from './logo'
import {
  photoOf,
  photoStyle,
  priceLabel,
  printableDescription,
  printableSections,
  sectionBadge,
} from './shared'
import type { TemplateProps } from './types'
import styles from './ModernTemplate.module.css'

/** How many photo cards each canvas can carry before the layout gets cramped. */
const MAX_CARDS: Record<FormatId, number> = { story: 5, post: 4, square: 3 }

interface CardEntry {
  dish: Dish
  section: MenuSection
  src: string
  objectPosition: string
}

/**
 * Modern — dark ground, photographs doing the selling.
 *
 * Dishes that have a photo are lifted out of their list into cards; the card
 * carries the name and price, so nothing is lost and nothing is printed twice.
 */
export function ModernTemplate({ menu, business, images, format }: TemplateProps) {
  const frameRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const fit = useFitScale(frameRef, contentRef, [menu, images, format.id])

  const sections = printableSections(menu)
  const limit = MAX_CARDS[format.id]

  const candidates: CardEntry[] = []
  for (const section of sections) {
    for (const dish of section.dishes) {
      const photo = photoOf(dish, images)
      if (photo) {
        candidates.push({
          dish,
          section,
          src: photo.src,
          objectPosition: photoStyle(photo).objectPosition,
        })
      }
    }
  }
  // The highlighted dish always earns a card, and always the wide one.
  candidates.sort((a, b) => Number(Boolean(b.dish.featured)) - Number(Boolean(a.dish.featured)))
  const cards = candidates.slice(0, limit)
  const carded = new Set(cards.map((card) => card.dish.id))

  // The grid is two columns; an odd number of half-cards would leave a visible
  // hole, so the last one stretches across instead.
  const halfCount = cards.filter((card) => !card.dish.featured).length
  const lastHalfIndex = halfCount % 2 === 1 ? cards.length - 1 : -1

  const [firstWord, ...restWords] = menu.title.split(' ')

  return (
    <div
      className={styles.root}
      data-format={format.id}
      style={{ width: format.width, height: format.height }}
    >
      <header className={styles.header}>
        <img className={styles.logo} src={LOGO_SRC} alt={LOGO_ALT} />
        <div className={styles.dateBlock}>
          <span className={styles.weekday}>{formatWeekday(menu.date)}</span>
          <span className={styles.day}>{formatDayMonth(menu.date)}</span>
        </div>
      </header>

      <h1 className={styles.title}>
        {firstWord}
        {restWords.length > 0 ? <span className={styles.titleAccent}> {restWords.join(' ')}</span> : null}
      </h1>

      <div className={styles.frame} ref={frameRef} data-fit-frame="true">
        <div className={styles.content} ref={contentRef} style={fitStyle(fit)}>
          {cards.length > 0 ? (
            <div className={styles.cards}>
              {cards.map((card, index) => {
                const price = priceLabel(card.dish, card.section, business.currency)
                const wide = card.dish.featured === true || index === lastHalfIndex
                return (
                  <article
                    key={card.dish.id}
                    className={[styles.card, wide && styles.cardWide].filter(Boolean).join(' ')}
                  >
                    <img
                      className={styles.cardPhoto}
                      src={card.src}
                      style={{ objectPosition: card.objectPosition }}
                      alt=""
                    />
                    <div className={styles.cardScrim} />
                    <div className={styles.cardBody}>
                      <div className={styles.cardText}>
                        {card.dish.featured ? <span className={styles.cardTag}>Especial</span> : null}
                        <p className={styles.cardName}>{card.dish.name}</p>
                        {wide && printableDescription(card.dish, card.section) ? (
                          <p className={styles.cardDescription}>
                            {printableDescription(card.dish, card.section)}
                          </p>
                        ) : null}
                      </div>
                      {price ? <span className={styles.cardPrice}>{price}</span> : null}
                    </div>
                  </article>
                )
              })}
            </div>
          ) : null}

          {sections.map((section) => {
            const dishes = section.dishes.filter((dish) => !carded.has(dish.id))
            if (dishes.length === 0) return null
            const badge = sectionBadge(section, business.currency)
            return (
              <section className={styles.section} key={section.id}>
                <div className={styles.sectionHead}>
                  <h2 className={styles.sectionTitle}>{section.title}</h2>
                  <span className={styles.sectionLine} />
                  {badge ? <span className={styles.badge}>{badge}</span> : null}
                </div>
                {section.note ? <p className={styles.note}>{section.note}</p> : null}

                {section.priceMode === 'per-item' ? (
                  <div className={styles.rows}>
                    {dishes.map((dish) => {
                      const price = priceLabel(dish, section, business.currency)
                      return (
                        <div className={styles.row} key={dish.id}>
                          <span className={styles.name}>{dish.name}</span>
                          <span className={styles.leader} aria-hidden="true" />
                          {price ? <span className={styles.price}>{price}</span> : null}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className={styles.inlineList}>
                    {dishes.map((dish, index) => (
                      <Fragment key={dish.id}>
                        {index > 0 ? (
                          <span className={styles.inlineSep} aria-hidden="true">
                            •
                          </span>
                        ) : null}
                        {dish.name}
                      </Fragment>
                    ))}
                  </p>
                )}
              </section>
            )
          })}
        </div>
      </div>

      <footer className={styles.footer}>
        <span className={styles.contact}>
          <WhatsappMark />
          {business.phone}
        </span>
        {business.footerNote ? <p className={styles.footNote}>{business.footerNote}</p> : null}
      </footer>
    </div>
  )
}
