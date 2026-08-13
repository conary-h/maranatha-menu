# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

La familia que atiende **Comida Buffet Maranatha**, un buffet de comida corriente en
Honduras. No son diseñadores ni usuarios técnicos.

El trabajo se reparte entre dos escenas que pesan **igual**: el menú se arma sentado
en escritorio, con tiempo, antes de abrir; y se revisa o se comparte desde el
teléfono. Ninguna de las dos es la escena secundaria, así que el diseño tiene que
rendir de verdad en ambas y no puede optimizarse para una a costa de la otra.

## Product Purpose

Armar el menú del día y compartirlo por WhatsApp, Instagram o Facebook en un par de
minutos.

El entregable final es **una imagen** (1080 × 1920), no una página que alguien
visita. El éxito es que el menú de hoy salga publicado a tiempo, legible y con los
precios correctos.

## Positioning

Funciona sin servidor, sin cuenta, sin contraseña y sin variables de entorno. Todo
vive en el dispositivo (IndexedDB): costo cero, mantenimiento cero, cero secretos que
filtrar, y sigue funcionando sin internet.

La exportación no es una captura de pantalla escalada: la plantilla se renderiza a su
tamaño real de 1080 × 1920 y se rasteriza a esa resolución.

## Operating Context

- **Ritual diario.** Un menú por día. El punto de partida habitual es duplicar uno
  anterior, no empezar en blanco.
- **Los menús viejos sí se consultan.** Para recordar precios, saber qué se sirvió tal
  día o repetir un menú de hace semanas. La lista de guardados es una herramienta de
  consulta real, no solo una red de seguridad: tiene que poder navegarse cuando haya
  decenas de menús acumulados.
- **El menú impreso anterior** (`img/menu-old.jpg`) llevaba un versículo al pie. Es el
  origen del versículo que hoy ofrece la app.
- **Copia de seguridad manual.** Como no hay sincronización, *Datos del negocio*
  descarga un `.json` con todo (menús y fotos) para guardarlo en WhatsApp o Drive y
  restaurarlo en otro dispositivo.

## Capabilities and Constraints

- Persistencia **local exclusivamente** (IndexedDB tras la interfaz `MenuRepository`).
  Decisión explícita y sostenida del usuario: no proponer base de datos ni
  sincronización.
- Once plantillas que comparten una sola maquetación (`MenuLayout`) y solo cambian de
  paleta. La hoja de estilo del lienzo no contiene ni un color literal.
- El precio se modela en la **sección**, no en el platillo: `per-item`, `included`
  (complementos) o `flat` (precio único). Los complementos no llevan descripción ni
  pueden ser el especial del día.
- Las fotos se guardan enteras (1400 px de lado mayor, WebP); el recorte lo hace cada
  plantilla con punto focal editable.
- El contenido se escala para caber siempre en el lienzo; cuando ni al mínimo legible
  cabe, se avisa en lugar de recortar en silencio.
- Exportación a PNG, JPG y PDF, más compartir por la Web Share API con descarga como
  alternativa.
- Sin conexión: nada depende de una API en tiempo de ejecución.

## Brand Commitments

- Nombre: **Comida Buffet Maranatha**.
- **El logotipo es innegociable** y tiene que estar visible al abrir la aplicación
  (`src/assets/logo-maranatha.png`, inlineado como data URL para que nunca falte en
  una exportación).
- El usuario **no** declaró vinculantes el versículo del día, la vista previa en la
  portada ni la lista de guardados tal como están hoy. Son funciones reales del
  producto, pero su tratamiento en el inicio está abierto.

## Evidence on Hand

- Logotipo real: `src/assets/logo-maranatha.png` / `public/logo-maranatha.png`.
- El menú impreso que se venía usando: `img/menu-old.jpg`.
- 46 versículos curados (provisión, gratitud, mesa, trabajo, familia) en
  `src/lib/verses.ts`, texto Reina-Valera 1909 de dominio público con ortografía
  modernizada — elegida a propósito para no depender de una versión con derechos.
- Catálogo semilla de platillos por tipo de sección: `src/lib/dishCatalog.ts`.
- Precios y platillos reales precargados en el primer menú: `src/lib/defaults.ts`.
- No hay testimonios, métricas de uso, ni clientes que citar. No inventarlos.

## Product Principles

1. **El producto es la imagen que se comparte.** Toda la interfaz existe para que esa
   imagen salga bien y salga hoy.
2. **Nada depende de estar en línea ni de una cuenta.** Cualquier función que exija
   servidor contradice el producto.
3. **Duplicar antes que crear.** El camino corriente es partir de lo de ayer, y la
   interfaz debe tratarlo como el camino principal, no como un atajo.
4. **El historial se consulta.** Los menús viejos son datos útiles, no basura
   acumulada.
5. **Escritorio y teléfono pesan igual.** Ninguna de las dos escenas es la de repuesto.

## Accessibility & Inclusion

Todo elemento tocable despeja los 44 px recomendados (`TAP` en `src/theme.ts`). La
interfaz está íntegramente en español de Honduras.
