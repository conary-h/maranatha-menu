import { useRef } from 'react'
import { formatLongDate, relativeDayLabel } from '@/lib/date'
import { fitStyle, useFitScale } from '@/hooks/useFitScale'
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
import { WhatsappMark } from './WhatsappMark'
import styles from './SocialTemplate.module.css'

/**
 * Redes — pensada para leerse como miniatura en una lista de chats.
 *
 * Es la plantilla con menos elementos y la tipografía más grande de las tres:
 * los precios son texto rojo en vez de insignias oscuras, las secciones son
 * etiquetas con regla en vez de pastillas, y los complementos y refrescos van
 * como lista corrida. Todo eso existe por la misma razón: WhatsApp recomprime
 * la imagen, y lo pequeño y de bajo contraste es lo primero que se pierde.
 */
export function SocialTemplate({ menu, business, images, format }: TemplateProps) {
  const frameRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  // Hasta 1.25: un menú corto crece para llenar el panel en vez de flotar en
  // medio, y de paso queda con letra aún más grande.
  const fit = useFitScale(frameRef, contentRef, [menu, images, format.id], { maxScale: 1.25 })

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
                    <span className={styles.sectionRule} />
                    {badge ? <span className={styles.badge}>{badge}</span> : null}
                  </div>
                  {section.note ? <p className={styles.note}>{section.note}</p> : null}

                  {section.priceMode === 'per-item' ? (
                    <div className={styles.rows}>
                      {section.dishes.map((dish) => {
                        const photo = photoOf(dish, images)
                        const price = priceLabel(dish, section, business.currency)
                        const description = printableDescription(dish, section)
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
                              <div className={styles.rowTop}>
                                <span className={styles.name}>
                                  {dish.featured ? (
                                    <span className={styles.star} aria-hidden="true">
                                      ★{' '}
                                    </span>
                                  ) : null}
                                  {dish.name}
                                </span>
                                <span className={styles.leader} aria-hidden="true" />
                                {price ? <span className={styles.price}>{price}</span> : null}
                              </div>
                              {description ? (
                                <p className={styles.description}>{description}</p>
                              ) : null}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className={styles.inlineList}>
                      {section.dishes.map((dish) => (
                        <span className={styles.inlineItem} key={dish.id}>
                          {dish.name}
                        </span>
                      ))}
                    </p>
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
    </div>
  )
}
