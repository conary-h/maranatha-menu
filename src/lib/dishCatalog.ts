import type { MenuSection } from '@/types/menu'

/**
 * Predefined dish names offered as suggestions while typing.
 *
 * Two sources feed the autocomplete: this seed list, and everything the family
 * has actually typed before (see `useDishSuggestions`). The learned names rank
 * first, so after a couple of weeks the suggestions are *their* menu, not ours
 * — the seed only has to make the first few days quick.
 *
 * Seeded from the business's own printed menu (img/menu-old.jpg) plus the
 * standard repertoire of a Honduran buffet-grill.
 */

export type SectionKind = 'carnes' | 'complementos' | 'refrescos' | 'postres' | 'desayunos' | 'otros'

/** Keywords that map a user-written section title onto a suggestion set. */
const KIND_KEYWORDS: Record<Exclude<SectionKind, 'otros'>, readonly string[]> = {
  carnes: ['carne', 'plato', 'fuerte', 'principal', 'pollo', 'res', 'cerdo', 'mar', 'pescado', 'sopa', 'parrilla', 'grill'],
  complementos: ['complement', 'guarnicion', 'acompan', 'ensalada', 'extra', 'incluid'],
  refrescos: ['refresco', 'bebida', 'jugo', 'frescos', 'liquido', 'tomar'],
  postres: ['postre', 'dulce', 'reposteria'],
  desayunos: ['desayuno', 'mananero'],
}

const SEEDS: Record<SectionKind, readonly string[]> = {
  carnes: [
    'Sopa de caracol',
    'Sopa de res',
    'Sopa de pollo',
    'Sopa marinera',
    'Pollo al horno',
    'Pollo guisado',
    'Pollo a la plancha',
    'Pollo empanizado',
    'Pollo con vegetales',
    'Chuleta de cerdo',
    'Costilla de cerdo frita',
    'Costilla de cerdo BBQ',
    'Carne asada',
    'Carne guisada',
    'Lomo de res con chimichurri',
    'Bistec encebollado',
    'Res a la plancha',
    'Cordon bleu',
    'Milanesa de pollo',
    'Chicharrón',
    'Pescado frito',
    'Filete de pescado',
    'Camarones al ajillo',
    'Fajitas de pollo',
    'Fajitas de res',
    'Carne a la parrilla',
    'Pinchos de pollo',
    'Pinchos de res',
    'Pollo a la parrilla',
    'Chorizo',
    'Salchichas',
    'Hígado encebollado',
    'Lengua en salsa',
    'Mondongo',
  ],
  complementos: [
    'Arroz blanco',
    'Arroz con pollo',
    'Arroz con vegetales',
    'Frijoles',
    'Frijoles fritos',
    'Puré de papa',
    'Papas rostizadas',
    'Papas fritas',
    'Plátano frito',
    'Tajadas',
    'Maduros',
    'Yuca',
    'Vegetales salteados',
    'Vegetales al vapor',
    'Mac and cheese',
    'Ensalada de lechuga',
    'Ensalada de repollo',
    'Ensalada rusa',
    'Ensalada mixta',
    'Curtido',
    'Chismol',
    'Tortillas',
    'Pan',
    'Elote',
    'Espagueti',
    'Queso frito',
    'Aguacate',
  ],
  refrescos: [
    'Pepsi',
    'Coca cola',
    'Canada dry',
    'Fanta',
    'Sprite',
    'Tropical',
    'Jamaica',
    'Maracuyá',
    'Tamarindo',
    'Horchata',
    'Té frío',
    'Nance',
    'Limonada',
    'Naranjada',
    'Refresco de piña',
    'Refresco de melón',
    'Refresco de sandía',
    'Fresco de avena',
    'Agua purificada',
    'Agua mineral',
    'Café',
    'Licuado de banano',
  ],
  postres: [
    'Flan',
    'Tres leches',
    'Gelatina',
    'Pastel de chocolate',
    'Arroz con leche',
    'Budín',
    'Ensalada de frutas',
    'Helado',
  ],
  desayunos: [
    'Desayuno típico',
    'Huevos revueltos',
    'Huevos estrellados',
    'Baleadas',
    'Frijoles con crema',
    'Mantequilla',
    'Queso',
    'Aguacate',
    'Plátano maduro',
    'Café con leche',
  ],
  otros: [],
}

/** Lowercase, unaccented, collapsed — for matching and de-duplicating only. */
export function normalise(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Guesses which suggestion set fits a section from the title the user typed,
 * so a section called "Bebidas" or "Frescos" still gets the drinks list.
 */
export function sectionKind(section: Pick<MenuSection, 'title' | 'priceMode'>): SectionKind {
  // Whole-word prefixes, not substrings: "res" appears inside "refrescos", and
  // matching on substrings would file the drinks under the meat suggestions.
  const words = normalise(section.title).split(/[^a-z0-9]+/).filter(Boolean)
  for (const [kind, keywords] of Object.entries(KIND_KEYWORDS)) {
    const hit = words.some((word) => keywords.some((keyword) => word.startsWith(keyword)))
    if (hit) return kind as SectionKind
  }
  // No title match: an "included" section is almost always the side dishes.
  if (section.priceMode === 'included') return 'complementos'
  return 'otros'
}

export function seedsFor(kind: SectionKind): readonly string[] {
  // "otros" gets everything — better a long list than no help at all.
  if (kind === 'otros') {
    return [...SEEDS.carnes, ...SEEDS.complementos, ...SEEDS.refrescos, ...SEEDS.postres]
  }
  return SEEDS[kind]
}

export const ALL_SEEDS: readonly string[] = [
  ...new Set(Object.values(SEEDS).flat()),
]
