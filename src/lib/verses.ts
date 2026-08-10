import { fromIso } from '@/lib/date'

/**
 * Versículo del día.
 *
 * La selección está curada a propósito alrededor de provisión, gratitud, mesa,
 * trabajo y familia: son los temas que le quedan bien a un negocio de comida,
 * y es lo que hace que la sección se sienta pensada y no un versículo al azar.
 *
 * Texto: Reina-Valera de dominio público (1909), con ortografía modernizada
 * («a» en vez de «á», etc.). Se eligió una versión libre a propósito para no
 * depender de un texto con derechos reservados. La familia siempre puede
 * escribir el suyo en Ajustes.
 *
 * Todo es local: sin API, sin red, funciona sin internet.
 */

export interface Verse {
  ref: string
  text: string
}

export const VERSES: readonly Verse[] = [
  { ref: 'Salmos 34:8', text: 'Gustad y ved que es bueno Jehová; dichoso el hombre que confía en él.' },
  { ref: 'Salmos 23:1', text: 'Jehová es mi pastor; nada me faltará.' },
  { ref: 'Salmos 23:5', text: 'Aderezas mesa delante de mí en presencia de mis angustiadores; unges mi cabeza con aceite; mi copa está rebosando.' },
  { ref: 'Salmos 118:24', text: 'Este es el día que hizo Jehová; nos gozaremos y alegraremos en él.' },
  { ref: 'Salmos 107:1', text: 'Alabad a Jehová, porque él es bueno; porque para siempre es su misericordia.' },
  { ref: 'Salmos 127:1', text: 'Si Jehová no edificare la casa, en vano trabajan los que la edifican.' },
  { ref: 'Salmos 128:2', text: 'Cuando comieres el trabajo de tus manos, bienaventurado serás, y te irá bien.' },
  { ref: 'Salmos 145:15', text: 'Los ojos de todos esperan en ti, y tú les das su comida a su tiempo.' },
  { ref: 'Salmos 136:25', text: 'El da mantenimiento a todo ser viviente, porque para siempre es su misericordia.' },
  { ref: 'Salmos 90:17', text: 'Sea la luz de Jehová nuestro Dios sobre nosotros, y la obra de nuestras manos confirma sobre nosotros.' },
  { ref: 'Salmos 37:5', text: 'Encomienda a Jehová tu camino, y espera en él; y él hará.' },
  { ref: 'Salmos 121:2', text: 'Mi socorro viene de Jehová, que hizo los cielos y la tierra.' },
  { ref: 'Salmos 100:4', text: 'Entrad por sus puertas con acción de gracias, por sus atrios con alabanza; alabadle, bendecid su nombre.' },
  { ref: 'Salmos 133:1', text: '¡Mirad cuán bueno y cuán delicioso es habitar los hermanos igualmente en uno!' },
  { ref: 'Proverbios 3:5', text: 'Fíate de Jehová de todo tu corazón, y no estribes en tu prudencia.' },
  { ref: 'Proverbios 16:3', text: 'Encomienda a Jehová tus obras, y tus pensamientos serán afirmados.' },
  { ref: 'Proverbios 22:9', text: 'El ojo misericordioso será bendito, porque dio de su pan al indigente.' },
  { ref: 'Proverbios 15:17', text: 'Mejor es la comida de legumbres donde hay amor, que de buey engordado donde hay odio.' },
  { ref: 'Proverbios 31:15', text: 'Levantóse aun de noche, y dio comida a su familia.' },
  { ref: 'Proverbios 12:11', text: 'El que labra su tierra, se hartará de pan.' },
  { ref: 'Proverbios 11:25', text: 'El alma generosa será prosperada; y el que saciare, él también será saciado.' },
  { ref: 'Eclesiastés 3:13', text: 'Y también que es don de Dios que todo hombre coma y beba, y goce el bien de toda su labor.' },
  { ref: 'Eclesiastés 9:7', text: 'Anda, y come tu pan con gozo, y bebe tu vino con alegre corazón.' },
  { ref: 'Isaías 41:10', text: 'No temas, que yo soy contigo; no desmayes, que yo soy tu Dios que te esfuerzo.' },
  { ref: 'Isaías 40:31', text: 'Los que esperan a Jehová tendrán nuevas fuerzas; levantarán las alas como águilas.' },
  { ref: 'Jeremías 29:11', text: 'Porque yo sé los pensamientos que tengo acerca de vosotros, pensamientos de paz, y no de mal, para daros el fin que esperáis.' },
  { ref: 'Lamentaciones 3:22-23', text: 'Nuevas son cada mañana; grande es tu fidelidad.' },
  { ref: 'Josué 1:9', text: 'Esfuérzate y sé valiente; porque Jehová tu Dios será contigo en donde quiera que fueres.' },
  { ref: 'Deuteronomio 8:10', text: 'Y comerás y te hartarás, y bendecirás a Jehová tu Dios por la buena tierra que te habrá dado.' },
  { ref: 'Mateo 6:11', text: 'Danos hoy nuestro pan cotidiano.' },
  { ref: 'Mateo 6:33', text: 'Mas buscad primeramente el reino de Dios y su justicia, y todas estas cosas os serán añadidas.' },
  { ref: 'Mateo 5:16', text: 'Así alumbre vuestra luz delante de los hombres, para que vean vuestras obras buenas.' },
  { ref: 'Mateo 11:28', text: 'Venid a mí todos los que estáis trabajados y cargados, que yo os haré descansar.' },
  { ref: 'Juan 6:35', text: 'Yo soy el pan de vida; el que a mí viene, nunca tendrá hambre.' },
  { ref: 'Juan 3:16', text: 'Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.' },
  { ref: 'Hechos 20:35', text: 'Más bienaventurada cosa es dar que recibir.' },
  { ref: 'Romanos 12:11', text: 'En el cuidado no perezosos; ardientes en espíritu; sirviendo al Señor.' },
  { ref: 'Filipenses 4:13', text: 'Todo lo puedo en Cristo que me fortalece.' },
  { ref: 'Filipenses 4:19', text: 'Mi Dios pues suplirá todo lo que os falta conforme a sus riquezas en gloria.' },
  { ref: 'Colosenses 3:23', text: 'Y todo lo que hagáis, hacedlo de ánimo, como al Señor, y no a los hombres.' },
  { ref: 'Colosenses 3:17', text: 'Y todo lo que hacéis, sea de palabra o de hecho, hacedlo todo en el nombre del Señor Jesús, dando gracias a Dios.' },
  { ref: '1 Corintios 10:31', text: 'Si pues coméis, o bebéis, o hacéis otra cosa, hacedlo todo a gloria de Dios.' },
  { ref: '1 Tesalonicenses 5:18', text: 'Dad gracias en todo, porque esta es la voluntad de Dios.' },
  { ref: 'Santiago 1:17', text: 'Toda buena dádiva y todo don perfecto es de lo alto, que desciende del Padre de las luces.' },
  { ref: 'Efesios 4:32', text: 'Antes sed los unos con los otros benignos, misericordiosos, perdonándoos unos a otros.' },
]

/**
 * El versículo de una fecha concreta.
 *
 * Recorre la lista por número de día, así que no se repite hasta agotarla y
 * todos ven el mismo versículo el mismo día. Determinista: nada de `Math.random`
 * ni de `Date.now()`, para que el menú guardado ayer siga mostrando lo mismo.
 *
 * `offset` avanza dentro de la misma lista sin tocar la fecha: es lo que hace
 * el botón de refrescar cuando el versículo del día no cae bien en el menú de
 * hoy. Al ser un simple desplazamiento, nunca se sale del catálogo curado.
 */
export function verseOfTheDay(iso: string, offset = 0): Verse {
  const MS_PER_DAY = 86_400_000
  const dayNumber = Math.floor(fromIso(iso).getTime() / MS_PER_DAY)
  const raw = dayNumber + offset
  const index = ((raw % VERSES.length) + VERSES.length) % VERSES.length
  return VERSES[index] ?? VERSES[0]!
}
