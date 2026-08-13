# Menú Maranatha

Aplicación web para que **Comida Buffet Maranatha** arme el menú del día y lo comparta
por WhatsApp, Instagram o Facebook en un par de minutos, desde el teléfono.

No necesita servidor, cuenta, contraseña ni variables de entorno.

---

## Cómo se usa

1. **Nuevo menú de hoy** — el primero llega precargado con los platillos y precios que
   el negocio ya usa.
2. Editar nombres, precios, descripciones y fotos.
3. Arrastrar el asa (⣿) para cambiar el orden de los platillos.
4. Marcar un platillo con ⭐ para que salga como «especial de hoy».
5. **Ver y exportar** → elegir diseño → **Compartir menú**.

Los cambios se guardan solos. La barra inferior siempre dice si está `Guardando…`,
`Guardado` o si hubo un error.

---

## Decisiones de arquitectura

### Los datos viven en el dispositivo (IndexedDB)

No hay base de datos ni backend. Los menús, las fotos y los datos del negocio se
guardan en **IndexedDB** del navegador.

Por qué: el producto final es una **imagen** que se comparte, no una página que se
visita. Nada tiene que estar en línea para que funcione. Esto da costo cero,
mantenimiento cero, cero secretos que filtrar, y funciona sin internet.

El precio de esa decisión es que los menús no se sincronizan entre teléfonos y se
pierden si se borran los datos del navegador. Por eso existe **Copia de seguridad**
en *Datos del negocio*: descarga un `.json` con todo (menús, fotos incluidas) que se
puede guardar en WhatsApp o Drive y restaurar en otro dispositivo.

Si algún día hace falta un historial compartido, toda la persistencia está detrás de
la interfaz [`MenuRepository`](src/lib/repository.ts). Escribir una implementación
con Supabase y cambiar una línea en los imports no requiere tocar ni un componente.

### El editor y el menú impreso están separados

Una plantilla es una función pura del menú: sin acceso al almacenamiento, sin
carga de datos, sin saber nada del editor. Por eso los dos pueden evolucionar
por separado.

**Las once plantillas comparten una sola maquetación** (`MenuLayout`) y solo
cambian de paleta ([`src/templates/palettes.ts`](src/templates/palettes.ts)),
que entra como variables CSS en la raíz del lienzo. La hoja de estilo no
contiene ni un color literal.

| Plantilla | Fondo | Acento |
|---|---|---|
| Clásica | papel crema | rojo del logotipo |
| Moderna | tinta oscura | ámbar |
| Jade | verde bosque | oro |
| Marina | azul noche | celeste |
| Menta | verde muy claro | verde profundo |
| Lavanda | lila muy claro | violeta profundo |
| Frambuesa | rosa pálido | frambuesa |
| Cacao | chocolate | caramelo |
| Terracota | barro claro | arcilla quemada |
| Egeo | cal blanca | azul egeo |
| Borgoña | granate | latón |

Las tres últimas no se inventaron desde cero: copian pares de colores que ya
funcionan en locales reales —la cantina mexicana, la taberna griega, la parrilla
de mantel largo— porque son combinaciones probadas en el sitio donde importa,
que es una carta impresa.

Añadir una paleta son tres entradas: `TEMPLATE_IDS`, `PALETTES` y el registro.
Quitarla es lo mismo al revés, más una línea en `RETIRED_TEMPLATE_IDS`
([`src/types/menu.ts`](src/types/menu.ts)): los menús ya guardados con esa
plantilla se traducen a una viva al leerlos, así que ni la vista previa ni una
restauración se rompen por un id que ya no existe. Así se retiró «Redes».

Es una decisión deliberada: mantener una maquetación por diseño multiplicaba el
trabajo de cada corrección —el recorte del ajuste automático, la regla de
descripciones, la de destacados— y con él la superficie donde algo se podía
romper. El registro sigue admitiendo cualquier componente en
`TemplateDefinition.Component`, así que una plantilla con una forma realmente
distinta se añade sin tocar el editor.

### Las fotos se guardan sin recortar

Se validan, se reducen a 1400 px de lado mayor y se recodifican a WebP en el
navegador (sin librerías). Se guardan **enteras**: el recorte lo hace cada template
con `object-fit: cover` más un punto focal editable. Así la misma foto sirve en 4:3,
1:1 o a sangre completa, y el encuadre se puede cambiar cuando sea.

Duplicar un menú comparte las fotos por referencia, así que no cuesta espacio. Las
que dejan de usarse se eliminan con un barrido de alcanzabilidad después de cada
escritura ([`collectGarbage`](src/lib/db.ts)).

### El menú siempre cabe, y si no cabe lo dice

Un menú de 6 platillos y uno de 24 tienen que caber en el mismo lienzo de
1080 × 1920. [`useFitScale`](src/hooks/useFitScale.ts) mide y reduce el contenido de
forma uniforme, como imprimir un afiche más pequeño.

Cuando ni al mínimo legible cabe (por ejemplo, 24 platillos con descripciones
largas), la vista previa muestra un aviso en lugar de recortar platillos en
silencio.

El ajuste no es una simple iteración de punto fijo: cambiar la escala cambia el
ancho de maquetación, que reparte el texto de otra forma, que cambia el alto otra
vez. Iterar a ciegas puede oscilar y, al agotarse los intentos, dejar contenido
fuera del marco. Por eso la búsqueda mantiene un intervalo — `lo` es una escala
que se comprobó que cabe, `hi` una que no — y **siempre termina en `lo`**. Puede
quedar un pelo más pequeño que el óptimo teórico, pero nunca recorta: perder un
platillo en silencio es mucho peor que una letra ligeramente menor.

Con `maxScale > 1` el contenido además **crece** para llenar el marco: un menú
corto se agranda en vez de flotar en un lienzo medio vacío.

### El editor es un espacio de trabajo, no un formulario

Cada platillo ocupa **una línea**: arrastre, foto, nombre, precio y destacado.
Las acciones poco frecuentes (descripción, eliminar) viven en un menú de
desbordamiento. Antes cada fila medía 126 px y un menú de 24 platillos eran más
de 4 000 px de scroll; ahora la fila mide 58 px en escritorio y una sección
completa cabe en pantalla.

El nombre y el precio no envuelven por media query sino por `flex-wrap`: el
nombre conserva una base de 180 px y el precio baja a una segunda línea solo
cuando de verdad no cabe, así que la misma fila sirve en teléfono y en escritorio.

La vista previa en vivo aparece desde 900 px (antes 1200), que es justo el ancho
de la mayoría de ventanas de portátil.

### Versículo del día

El menú impreso ya llevaba un versículo al pie, así que la portada muestra uno
distinto cada día ([`src/lib/verses.ts`](src/lib/verses.ts)) con un botón para
ponerlo en los menús de un toque — sin ese botón sería solo adorno.

La selección está curada alrededor de provisión, gratitud, mesa, trabajo y
familia. El versículo se elige por número de día, así que es **determinista**: no
se repite hasta agotar la lista y todos ven el mismo el mismo día. Todo local,
sin API, funciona sin internet.

El texto usa la **Reina-Valera de dominio público (1909)** con ortografía
modernizada, a propósito, para no depender de una versión con derechos
reservados. Se puede sustituir por otra en Ajustes.

### Las sugerencias de platillos se aprenden solas

El campo de nombre es un autocompletado con dos fuentes
([`src/hooks/useDishSuggestions.ts`](src/hooks/useDishSuggestions.ts)):

1. **Lo que la familia ya escribió**, ordenado por frecuencia de uso. Se recalcula
   después de cada guardado.
2. **Un catálogo semilla** ([`src/lib/dishCatalog.ts`](src/lib/dishCatalog.ts))
   agrupado por tipo de sección, para que el primer día también sea rápido.

La sección se clasifica por el título que escribió el usuario, con coincidencia por
prefijo de palabra: «Bebidas», «Frescos» o «Refrescos» reciben la lista de bebidas.
Los nombres que ya están en el menú actual se excluyen — ofrecer «Pollo al horno»
cuando está tres filas más arriba es ruido, no ayuda.

Es `freeSolo`: el catálogo es un atajo, nunca una restricción.

### Modelo de datos: secciones, no una lista plana

El menú real no es una lista de platillos con precio: «Complementos» van incluidos
sin precio y «Refrescos» tienen un precio único. Por eso el precio se modela en la
**sección** (`per-item` | `included` | `flat`), no en cada platillo.

---

Los **complementos no llevan descripción ni pueden ser el especial del día**:
son acompañamientos incluidos con el almuerzo, no platillos que se vendan o se
anuncien. **Solo los platillos con precio propio pueden ser el especial del
día**: un refresco que cuesta lo mismo que los otros nueve tampoco es algo que
se anuncie. Las reglas viven en `allowsDescription()` y `allowsFeatured()`
([`src/lib/menuOps.ts`](src/lib/menuOps.ts)): el editor no ofrece el campo ni la
estrella, cambiar una sección a «Incluidos» borra lo que tuviera, y
`printableDescription()` y `featuredOf()` protegen además a los menús guardados
antes del cambio.

## Qué mejora respecto al menú anterior

Del menú actual (`img/menu-old.jpg`):

| Antes | Ahora |
|---|---|
| Los precios se desalineaban de los platillos y era imposible saber qué costaba qué | Cada precio va unido a su platillo con una línea punteada |
| «Complementos» sin precio, sin explicar | Se marcan explícitamente como **Incluidos** |
| Sin fecha, siendo el menú *del día* | La fecha es el titular |
| Letra chica ilegible | Jerarquía tipográfica y contraste revisados |
| Tres tipografías mezcladas | Dos tipografías con roles claros |

---

## Pruebas

```bash
npm test          # una pasada
npm run test:watch
npm run verify    # tipos + lint + pruebas + build, en ese orden
```

123 pruebas sobre **Vitest**, sin DOM y sin navegador: todo lo que se prueba es
lógica pura o IndexedDB simulado con `fake-indexeddb`. Corren en menos de medio
segundo, así que no hay excusa para no correrlas antes de subir.

No cubren la interfaz a propósito. Lo que cubren es lo que **ya se rompió alguna
vez** o lo que rompería en silencio:

| Qué | Por qué |
|---|---|
| `stepFit` | El ajuste automático llegó a recortar contenido: la iteración oscilaba y se quedaba en una escala que no cabía. Se prueba contra modelos de alto adversarios —saltos, escaleras— exigiendo una sola propiedad: **nunca terminar en una escala que recorte**. |
| `menuOps` | Las reglas que hemos ido cambiando: qué se borra al cambiar el modo de precio, quién puede ser el especial del día, que duplicar comparta la foto en vez de copiarla. |
| `isMenu` / `isBusinessInfo` | Son la puerta de entrada de los archivos de respaldo, que son entrada no confiable. |
| `restoreBackup` | Rechazo de archivos corruptos, de otra versión y de `data:` URLs que no son imágenes. |
| Recolector de fotos | Las imágenes se comparten por referencia; un barrido mal hecho borra una foto en uso o acumula huérfanas. |
| `date` | `new Date('2026-08-10')` se interpreta como UTC y en Honduras imprimiría «9 de agosto». |
| `sectionKind` | La palabra `res` casaba dentro de «Refrescos» y las bebidas recibían sugerencias de carnes. |

Tres de estas pruebas fallaron al escribirlas y las tres delataron algo real: dos
funciones que ya no existían y un nombre de prueba que describía un
comportamiento que el código no tiene.

Lo que **no** está cubierto y hay que seguir mirando a mano: los componentes, la
exportación a imagen y PDF (necesita navegador de verdad) y el comportamiento en
un teléfono real.

---

## Ejecutar en local

Requiere **Node 20.19+** (hay un `.nvmrc` con la versión usada).

```bash
nvm use            # opcional, si usas nvm
npm install
npm run dev        # http://localhost:5173
```

Otros comandos:

```bash
npm run build      # typecheck + build de producción a dist/
npm run preview    # sirve dist/ localmente
npm run lint       # ESLint
npm run typecheck  # solo TypeScript
```

---

## Desplegar en Vercel

```bash
npm i -g vercel
vercel
```

O desde el panel de Vercel: **Add New → Project → importar el repositorio**.

Vercel detecta Vite automáticamente. La configuración necesaria ya está en
[`vercel.json`](vercel.json):

- `rewrites` para que cualquier ruta sirva `index.html`.
- `Cache-Control` inmutable para los assets con hash.

**No hay variables de entorno que configurar.** Si en el futuro se agrega Supabase,
se documentarán aquí.

En Vercel conviene fijar la versión de Node en *Settings → General → Node.js Version*
a **22.x**.

---

## Dependencias y por qué

| Paquete | Para qué | Nota |
|---|---|---|
| `react`, `react-dom` | UI | — |
| `@mui/material`, `@mui/icons-material`, `@emotion/*` | Sistema de componentes del editor | Decisión explícita del proyecto. Cuesta ~100 KB gz, pero da `Autocomplete`, diálogos y accesibilidad ya probados |
| `@dnd-kit/*` | Arrastrar y soltar platillos | El drag & drop nativo de HTML5 no funciona con el dedo, y móvil es el caso principal |
| `idb` (1.3 kB) | Envoltorio de IndexedDB | Las fotos se guardan como `Blob`; `localStorage` no sirve |
| `modern-screenshot` | DOM → PNG de alta resolución | Se carga solo al exportar |
| `jspdf` | PDF | Se carga solo al tocar «PDF» |
| `@fontsource/*` | Tipografías **auto-alojadas** | Con Google Fonts por CDN, la exportación a imagen sale con tipografía de reserva por CORS |

Deliberadamente **sin**: Tailwind, React Router (hay un router de 40 líneas para
4 pantallas), librería de formularios, librería de recorte, Zod.

### Dos sistemas de estilo, a propósito

- **El editor** usa MUI, con un tema de marca en [`src/theme.ts`](src/theme.ts):
  rojo del logo como `primary`, botones tipo píldora sin mayúsculas, fondo crema y
  las mismas dos tipografías del menú impreso. Sin ese tema, MUI se ve como un
  panel administrativo genérico, que es justo lo que el producto no debe parecer.
- **Los tres diseños del menú** siguen en CSS Modules sobre un lienzo fijo de
  1080 px. No es inconsistencia: la exportación rasteriza el DOM, y esos diseños
  no deben depender de estilos inyectados en tiempo de ejecución ni del tamaño de
  icono relativo de MUI. Un template es CSS puro y píxeles absolutos.

---

## Estructura

```
src/
  components/   Composiciones sobre MUI (TopBar, ConfirmDialog, Toast, Feedback)
  theme.ts      Tema de marca de MUI
  features/
    menus/      Lista e historial de menús
    editor/     Editor: secciones, platillos, fotos, drag & drop
    preview/    Lienzo, selector de plantilla y exportación
    business/   Datos del negocio y respaldo
  templates/    Diseño del menú final: una maquetación y ocho paletas
  hooks/        Router, autoguardado, ajuste de escala, sugerencias, carga asíncrona
  lib/          Persistencia, imágenes, exportación, validación, fechas
  types/        Modelo de dominio
```

---

## Seguridad

- Las fotos se validan por tipo MIME y tamaño (máx. 20 MB) y, sobre todo, se
  **decodifican**: lo que no es una imagen no pasa.
- Los archivos de respaldo son JSON de origen no confiable: cada campo se valida
  con guardas de tipo en tiempo de ejecución antes de tocar la base
  ([`src/lib/validation.ts`](src/lib/validation.ts)), y solo se aceptan `data:` URLs
  de imagen.
- Todo menú se valida estructuralmente antes de persistirse.
- No hay secretos en el frontend porque no hay servicios externos.
- No hay autenticación porque el producto no la necesita: los datos son locales al
  dispositivo. Añadirla más adelante implica la capa `MenuRepository`, no la UI.

---

## Pendiente

- **GIF/vídeo animado**: investigado, no implementado. Ver notas de la entrega.
- Sincronización entre dispositivos (adaptador de Supabase sobre `MenuRepository`).
- Un menú de 24 platillos con descripciones largas puede no caber ni al mínimo
  legible; la app avisa en vez de recortar en silencio.
