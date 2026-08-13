---
version: 1
slug: "src-features-menus-menulistpage-tsx"
primary_target: "src/features/menus/MenuListPage.tsx"
related_targets: ["src/features/menus/TodayLeaf.tsx","src/features/menus/VerseOfTheDay.tsx"]
---

## Scope

La pantalla de inicio (ruta `list`): la hoja de hoy, el acceso al menú del día y el
archivo de menús anteriores.

Visitor mode: **Operate**.

Nota de alcance: el mundo del almanaque ya **no** se detiene en el borde de esta
pantalla. Tras construirla, se extendió al editor, la vista previa y los ajustes a
través de `src/theme.ts` y del fleje compartido en `src/components/AppBar.tsx`. Lo que
sigue fuera, y a propósito, son las plantillas del menú impreso (`src/templates/`).

## Audience and job

La familia que atiende Comida Buffet Maranatha. Escritorio y teléfono pesan igual.
El trabajo al abrir es uno de tres, en este orden de frecuencia: seguir con el menú
de hoy, partir de uno anterior, o consultar un menú viejo para recordar un precio o
qué se sirvió tal día.

## Action and content

Acción principal única: entrar al menú de hoy (continuarlo si existe, crearlo si no).
Acción secundaria del mismo peso: duplicar el último, ofrecida solo los días sin menú
—un día que ya tiene menú, duplicar el último copiaría hoy sobre hoy y fabricaría la
colisión de fechas que el editor evita a propósito—.
Contenido real: la fecha de hoy, la vista previa del menú destacado, el archivo con
fecha, título, número de platillos y plantilla, y el versículo del día.

## Constraints

- El logotipo es innegociable y va visible al abrir, troquelado en el fleje.
- Todo local; ningún dato de esta pantalla viene de la red.
- Objetivos tocables ≥ 44 px.
- El archivo tiene que seguir siendo navegable con decenas de menús acumulados.

## Chosen direction

**Almanaque de Taco** — el calendario de taco colgado en casas y comedores. Una hoja
por día sobre un cartón de respaldo, fleje de hojalata arriba, perforado de arranque,
papel periódico a dos tintas. La fecha es el titular porque en un almanaque siempre lo
fue; el versículo va al pie de la hoja porque es donde el almanaque lo ha impreso
siempre; los menús guardados son las hojas ya arrancadas, agrupadas por mes.

Semilla del reparto: `2f0490db`, carta IMPECCABLE'S PICK sobre la asignada.

## Memorable moment

**Arrancar la hoja.** Entrar al menú de hoy no es una transición de página: el
perforado se rompe y la hoja se levanta y gira un grado antes de que cambie la ruta.
Un solo momento de movimiento en toda la pantalla; el resto es papel quieto.

## Unresolved

- Búsqueda o índice de meses en el archivo. Hoy se resuelve agrupando por mes con
  rótulos pegajosos bajo el fleje, que basta para un año; más allá haría falta buscar.
  Se dejó fuera por ser una función de navegación nueva, no una corrección de esta
  composición.
- El diálogo de confirmación y el Toast siguen siendo superficies de MUI. Heredan el
  tema —radio cero, papel, tinta— pero no se rehicieron en el vocabulario del mundo.
