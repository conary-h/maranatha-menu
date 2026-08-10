import { useRef } from 'react'
import { WhatsappMark } from './WhatsappMark'
import { formatLongDate, relativeDayLabel } from '@/lib/date'
import { fitStyle, useFitScale } from '@/hooks/useFitScale'
import { LOGO_ALT, LOGO_SRC } from './logo'
import { photoOf, photoStyle, priceLabel, printableSections, sectionBadge } from './shared'
import type { TemplateProps } from './types'
import styles from './SocialTemplate.module.css'

/**
 * Social — brand gradient, oversized type, one green call-to-action.
 * Built to survive WhatsApp compression and still be readable as a thumbnail,
 * so it carries fewer, larger elements than the other two.
 */
export function SocialTemplate({ menu, business, images, format }: TemplateProps) {
  const frameRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const fit = useFitScale(frameRef, contentRef, [menu, images, format.id])

  const sections = printableSections(menu)
  const kicker = relativeDayLabel(menu.date) ?? menu.title

  return (
    <div
      className={styles.root}
      data-format={format.id}
      style={{ width: format.width, height: format.height }}
    >
      <header className={styles.header}>
        <div className={styles.logoPlate}>
          <img className={styles.logo} src={LOGO_SRC} alt={LOGO_ALT} />
        </div>
        <span className={styles.kicker}>{kicker}</span>
        <h1 className={styles.date}>{formatLongDate(menu.date)}</h1>
      </header>

      <div className={styles.panel}>
        <div className={styles.frame} ref={frameRef} data-fit-frame="true">
          <div className={styles.content} ref={contentRef} style={fitStyle(fit)}>
            {sections.map((section) => {
              const badge = sectionBadge(section, business.currency)
              return (
                <section className={styles.section} key={section.id}>
                  <div className={styles.sectionHead}>
                    <h2 className={styles.sectionTitle}>{section.title}</h2>
                    {badge ? <span className={styles.badge}>{badge}</span> : null}
                  </div>
                  {section.note ? <p className={styles.note}>{section.note}</p> : null}

                  {section.priceMode === 'per-item' ? (
                    <div className={styles.rows}>
                      {section.dishes.map((dish) => {
                        const photo = photoOf(dish, images)
                        const price = priceLabel(dish, section, business.currency)
                        return (
                          <div
                            className={[styles.row, dish.featured && styles.featured]
                              .filter(Boolean)
                              .join(' ')}
                            key={dish.id}
                          >
                            {photo ? (
                              <img
                                className={styles.thumb}
                                src={photo.src}
                                style={photoStyle(photo)}
                                alt=""
                              />
                            ) : null}
                            <div className={styles.rowBody}>
                              <p className={styles.name}>
                                {dish.featured ? (
                                  <span className={styles.star} aria-hidden="true">
                                    ★{' '}
                                  </span>
                                ) : null}
                                {dish.name}
                              </p>
                              {dish.description ? (
                                <p className={styles.description}>{dish.description}</p>
                              ) : null}
                            </div>
                            {price ? <span className={styles.price}>{price}</span> : null}
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className={styles.chips}>
                      {section.dishes.map((dish) => (
                        <span className={styles.chip} key={dish.id}>
                          {dish.name}
                        </span>
                      ))}
                    </div>
                  )}
                </section>
              )
            })}
          </div>
        </div>
      </div>

      <footer className={styles.footer}>
        <span className={styles.contact}>
          <WhatsappMark />
          {business.phone}
        </span>
        {business.footerNote ? <p className={styles.footNote}>{business.footerNote}</p> : null}
      </footer>
      <div className={styles.bottomPad} />
    </div>
  )
}
