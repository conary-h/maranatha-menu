---
name: Almanaque Maranatha
description: The application is a tear-off wall almanac — oxblood board, flat tin hanger, two-ink newsprint, zero radius.
colors:
  card: "#3b1009"
  card-deep: "#280a06"
  tin: "#c9c6bb"
  tin-edge: "#e2dfd5"
  tin-dark: "#a5a298"
  desk: "#d9d7c9"
  paper: "#e6e5dc"
  paper-shade: "#dcdacd"
  ink: "#1b1a15"
  ink-deep: "#0d0c09"
  red: "#be1a0d"
  red-pressed: "#a01409"
  ink-muted: "#615d50"
  ink-faint: "#8b8778"
  rule: "#c2bfae"
  keyline: "rgb(27 26 21 / 30%)"
  danger: "#a81f10"
  caution: "#8a5a06"
  ok: "#1c6b45"
size:
  xs: "0.68rem"
  sm: "0.74rem"
  md: "0.82rem"
  lg: "0.95rem"
  xl: "1.05rem"
  xxl: "1.2rem"
typography:
  figure:
    fontFamily: "'Anton', 'Archivo Variable', system-ui, sans-serif"
    fontSize: "clamp(4.5rem, 21vw, 15rem)"
    fontWeight: 400
    lineHeight: 0.76
    letterSpacing: "-0.03em"
    fontVariantNumeric: "lining-nums"
  figure-small:
    fontFamily: "{typography.figure.fontFamily}"
    fontSize: "2rem"
    fontWeight: 400
    lineHeight: 0.85
    fontVariantNumeric: "tabular-nums"
  section-label:
    fontFamily: "{typography.figure.fontFamily}"
    fontSize: "clamp(0.95rem, 2.4vw, 1.5rem)"
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: "0.14em"
  board-label:
    fontFamily: "{typography.figure.fontFamily}"
    fontSize: "0.9rem"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.24em"
  body:
    fontFamily: "'Archivo Variable', system-ui, -apple-system, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 400
    lineHeight: 1.55
  title:
    fontFamily: "{typography.body.fontFamily}"
    fontSize: "1.02rem"
    fontWeight: 600
    lineHeight: 1.25
  marginal:
    fontFamily: "'Archivo Narrow', 'Archivo Variable', system-ui, sans-serif"
    fontSize: "0.74rem"
    fontWeight: 500
    lineHeight: 1.35
    letterSpacing: "0.13em"
    fontVariantNumeric: "tabular-nums"
  control-label:
    fontFamily: "{typography.marginal.fontFamily}"
    fontSize: "0.82rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.14em"
rounded:
  none: "0"
  punch-hole: "50%"
spacing:
  hair: "6px"
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "20px"
  xl: "24px"
  gutter: "28px"
  band: "40px"
  section: "56px"
components:
  button-stamp:
    backgroundColor: "{colors.red}"
    textColor: "{colors.paper}"
    typography: "{typography.control-label}"
    rounded: "{rounded.none}"
    padding: "0 20px"
    height: "52px"
  button-stamp-hover:
    backgroundColor: "{colors.red-pressed}"
    textColor: "{colors.paper}"
  button-stamp-disabled:
    backgroundColor: "{colors.paper-shade}"
    textColor: "{colors.ink-faint}"
  button-stamp-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.control-label}"
    rounded: "{rounded.none}"
    padding: "0 20px"
    height: "52px"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.control-label}"
    rounded: "{rounded.none}"
    padding: "0 20px"
    height: "44px"
  button-quiet:
    backgroundColor: "transparent"
    textColor: "{colors.ink-muted}"
    typography: "{typography.control-label}"
    rounded: "{rounded.none}"
    padding: "0 10px"
    height: "44px"
  button-icon:
    backgroundColor: "transparent"
    textColor: "{colors.ink-muted}"
    rounded: "{rounded.none}"
    padding: "0"
    width: "44px"
    height: "44px"
  ink-stamp:
    backgroundColor: "transparent"
    textColor: "{colors.red}"
    rounded: "{rounded.none}"
    padding: "3px 9px 2px"
  leaf:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "16px 32px 24px"
  torn-leaf-row:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "12px 20px"
  hanger-strip:
    backgroundColor: "{colors.tin}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    height: "60px"
    padding: "0 48px"
  errata-band:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "12px 16px"
  button-contained-neutral:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.control-label}"
    rounded: "{rounded.none}"
    padding: "0 20px"
    height: "44px"
  text-field:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    borderColor: "{colors.rule}"
    rounded: "{rounded.none}"
    padding: "0 14px"
  text-field-focus:
    borderColor: "{colors.ink}"
  toggle-button:
    backgroundColor: "transparent"
    textColor: "{colors.ink-muted}"
    borderColor: "{colors.ink}"
    typography: "{typography.control-label}"
    rounded: "{rounded.none}"
    height: "42px"
  toggle-button-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  dialog:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "16px"
  alert:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "12px 16px"
  chip:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    borderColor: "{colors.rule}"
    rounded: "{rounded.none}"
  tooltip:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.none}"
---

# Design System: Almanaque Maranatha

> **Boundary.** This document governs the whole application shell — routes `list`,
> `editor`, `preview` and `settings`, plus the shared chrome. It is carried by
> `src/almanac/tokens.ts` (the materials), `src/theme.ts` (the MUI translation of
> them, and the single largest carrier of the system), and `src/components/AppBar.tsx`
> (the tin hanger, on every route).
>
> **Out of scope in both directions: `src/templates/`.** The exported 1080×1920 menu
> is a separate artifact with its own eleven palettes, its own CSS Modules, and its
> own two typefaces, which it reads from `--font-display` / `--font-body` in
> `src/styles/tokens.css`. Those variables and that stylesheet are template-scoped —
> not dead code, and not this system. The separation is load-bearing: the template is
> the product's deliverable, the image customers actually receive, and it was never
> part of the redesign. **Do not "unify" them.** Changing `tokens.css` changes what
> goes out on WhatsApp.
>
> History: this world was built for the home route first and extended across the app
> afterwards. Anything below that still says "this screen" is describing the home
> specifically; everything in Colors, Typography, Shapes and Components applies app-wide.

## Overview

**Creative North Star: "The Tear-Off Almanac"**

The home screen is not a dashboard of a menu app. It is a physical object hanging on
a kitchen wall: a cheap commercial almanac of the kind given away by a hardware store.
It is made of exactly three materials and nothing else — a full-bleed deep-oxblood
backing board, a flat tin hanger strip punched with two holes at the top edge, and a
pad of grey newsprint leaves printed in two inks. Today's leaf is still attached, so
its perforation is intact and the cut edges of the leaves below show behind it. The
leaves already torn off are stacked underneath the board, grouped by month.

The density is that of a printed sheet, not of an interface. The day figure is the
largest object on the page and carries no label above it, because on an almanac leaf a
number that size is self-evident. The weekday and month sit beside it in red, not
stacked above it, because a kicker over a headline is app grammar and this is print
grammar. Secondary data — day of the year, days remaining, the menu's spec — is packed
into a marginal column ruled off with a hairline, in condensed uppercase, exactly where
an almanac packs its almanac facts. The verse prints in the foot band in the same small
marginal voice, next to where a real one prints the saints' calendar and the moon phase.

Nothing in this world is round, nothing is soft, and nothing glows. Depth exists only
because paper has thickness and a printed sheet casts a shadow on the board behind it.
The world explicitly rejects the arrangement this product category always ships: a
rounded gradient hero, a pill button, and a grid of elevated cards.

Away from the home, the object is disassembled but the materials are the same. The tin
hanger still crosses the top of every route. The oxblood board appears only on the home,
because only the home is the hanging almanac; the interior routes lay their sheets on a
plain **desk** (`{colors.desk}`) instead. Everything else — zero radius, two inks, the
three faces on their three jobs, structure by printed rule instead of by elevation — is
carried into the editor, the preview and the settings by `src/theme.ts`, so the app does
not change language when you leave the portada.

**Key Characteristics:**
- Three materials only: oxblood board, flat tin hanger, two-ink newsprint — on a plain desk when the board is not present. Anything that is not one of those does not belong.
- Zero radius everywhere; the only circles are the two punched holes in the hanger, because a hole is genuinely round.
- Two inks on paper — press black and Sunday red — and nothing else.
- The day figure dominates: one enormous Anton numeral per leaf, unlabelled.
- Deliberate imperfection as material: 3.5% paper grain, −0.7° stamp rotation, a 1.5px same-hue ink offset, a torn edge whose phase shifts row to row.
- Hand-drawn iconography sharing one hard stroke spec (1.75px, square caps, miter joins, no curve of convenience).

## Colors

Two inks printed on grey newsprint, hung on a deep oxblood board with a flat tin strip across the top — the palette is the material list, not a set of brand hues.

### Primary
- **Sunday Red** (`{colors.red}`): the second ink. It carries the weekday, the verse citation, the errata rule, the "HOY"/"AYER" ink stamps, the day figure when the date is a Sunday, every focus ring on paper, and the single stamped primary action. It appears nowhere else. Its pressed state is **Pressed Red** (`{colors.red-pressed}`), used only on hover of the stamped button.

### Secondary
- **Board Oxblood** (`{colors.card}`): the backing board, full bleed, including `body` while this route is mounted so an iOS scroll bounce never reveals another world's ground. Lit by `BOARD_SHEEN` from the top center, as if by the nail it hangs from. **Deep Board** (`{colors.card-deep}`) is its shadowed edge and the perforation dots. It is drawn from the logo red and then sunk hard, for two reasons that both bind: a board must recede behind the paper it holds, and it must stay far enough from Sunday Red (`{colors.red}`) that the ink on the leaf still reads as an accent instead of dissolving into its own background. An earlier version of this board was chromo green — quieter than it looks on paper, but foreign to a brand whose only colour is red. A commercial taco is printed in the colours of whoever gives it away, and here that is the buffet. The content column is 1120px so the board reads as a margin, not as half the screen.
- **Flat Tin** (`{colors.tin}`, with `{colors.tin-edge}` for its lit top fold and `{colors.tin-dark}` for its cut lower lip): the hanger strip. Flat — the sheen is two hairlines, not a gradient. Never a text color, never on paper.

### Neutral
- **Desk** (`{colors.desk}`): the page ground on every route that is not the home. The board hangs; the interior sheets lie on a desk. It is never used on the home, where the board goes edge to edge.
- **Newsprint Grey** (`{colors.paper}`): every leaf. Grey-raw, never cream — cream is the older theme's ground and reads as a different product.
- **Newsprint Shade** (`{colors.paper-shade}`): the cut edges of the leaves under today's leaf, the illustrated block's backing, skeleton bars, the disabled stamp.
- **Press Black** (`{colors.ink}`): the first ink. Body text, titles, rules, borders, the day figure on any day but Sunday.
- **Paper-Tinted Grey** (`{colors.ink-muted}`): the marginal column, the meta line, the verse body, quiet and icon controls at rest. It is tinted by the paper it prints on, not a neutral grey.
- **Faint Grey** (`{colors.ink-faint}`): disabled control strokes and the empty-plate glyph only.
- **Rule Grey** (`{colors.rule}`): hairline rules printed on paper — the marginal column's left rule, the foot band's top rule, a resting field's outline.
- **Keyline** (`{colors.keyline}`): the 1px outline that separates a saturated color field from the paper it sits on — a template's ink swatch, a picker tile. It exists so a foreign color never touches newsprint directly.
- **Ink Deep** (`{colors.ink-deep}`): one shade past press black, used only for the pressed state of an inked neutral button. It is not a text color.

### Feedback Inks
A two-ink almanac has no vocabulary for "this failed" or "this saved", but an
application must have one. Three inks exist for that and nothing else:

- **Danger** (`{colors.danger}`): errors and destructive confirmation. **Deliberately duller than Sunday Red** (`{colors.red}`) so a failure is never mistaken for the day's accent, and so the accent never reads as alarm.
- **Caution** (`{colors.caution}`): warnings — an ochre out of the paper's own earth family, not a signal yellow.
- **OK** (`{colors.ok}`): success and the saved indicator. A muted earth green — the one place green survives in this world, because no red can say "saved" next to a red accent and a red error.

### Named Rules
**The Three Materials Rule.** Every pixel on this screen is board, tin, or paper. If a new element cannot be described as one of the three, it does not go on this screen.

**The Two Inks Rule.** A leaf carries press black and Sunday red and nothing else. No third accent, no tinted surfaces, no colored state backgrounds. Two things are allowed to break it, both narrowly: a template's own ink swatch, as a 9×9px square with a `{colors.keyline}` outline; and a feedback ink, only when the interface has to report a state the user must act on. A feedback ink is never decoration and never a brand color.

**The Board Sheen Is Material Rule.** `BOARD_SHEEN` — `radial-gradient(120% 70% at 50% -10%, rgb(255 255 255 / 7%) 0%, transparent 60%)` — is the light falling on the board from the nail it hangs on. It is a material, like the grain and the torn edge, not a palette entry: the board colour does not change, only what falls on it. A colour detector will flag the white inside it; that is the correct value and it stays.

**The Faint Ink Rule.** `{colors.ink-faint}` is 2.89:1 on newsprint and is therefore not a text color. It may stroke a disabled control or a decorative glyph; it may never carry a word a user must read. The quiet end of the marginal column is `{colors.ink-muted}` (5.3:1).

**The Board Never Prints Rule.** Text set directly on the board is newsprint at reduced alpha (`rgb(230 229 220 / 82%)` for the archive heading, `/74%` for month rules, `/22%` for their trailing hairline). Ink colors are for paper only.

## Typography

**Display Font:** Anton (latin-400), self-hosted via @fontsource
**Body Font:** Archivo Variable (`wght` axis), self-hosted
**Label/Data Font:** Archivo Narrow (400/500/600), self-hosted

**Character:** Anton is the wood-type condensed grotesque a cheap almanac uses for its
day figure — one weight, no alternatives, enormous or not at all. Archivo is the plain
press face for running text. Archivo Narrow is the marginal face, where an almanac
squeezes its data into a ruled column. Three faces, three jobs, no overlap.

### Hierarchy
- **Figure** (Anton 400, `clamp(4.5rem, 21vw, 15rem)`, line-height 0.76, `-0.03em`, lining numerals): the day of the month on today's leaf. One per screen. Red on Sundays, press black otherwise.
- **Figure Small** (Anton 400, 2rem/0.85, tabular numerals): the day of the month in an archive row's corner block.
- **Section Label** (Anton 400, `clamp(0.95rem, 2.4vw, 1.5rem)`/1.05, `0.14em`, uppercase): the weekday (red) and month (ink) beside the figure; the year at the head of the marginal column (1.6rem, `0.06em`); the blank-leaf headline (1.05rem); the errata title (0.68rem, `0.2em`).
- **Board Label** (Anton 400, 0.9rem/1, `0.24em`, uppercase): the archive heading printed on the board.
- **Title** (Archivo 600, 1.02rem/1.25): an archive row's menu title. Single line, ellipsized; never wraps.
- **Body** (Archivo 400, 0.95rem/1.55): blank-leaf prose (max 46ch) and the verse (italic, max 68ch, `text-wrap: pretty`).
- **Marginal** (Archivo Narrow 500, 0.74rem/1.35, `0.13em`, uppercase, tabular numerals): the marginal column. The archive meta line is the same voice one step down — 0.66rem/`0.06em` on phone, 0.72rem/`0.1em` from `sm` up.
- **Control Label** (Archivo Narrow 600, 0.82rem/1, `0.14em`, uppercase): all buttons. Stamped variants step up to 0.92rem; the quiet variant relaxes to `0.12em`.

### Named Rules
**The Unlabelled Figure Rule.** The day figure never gets a kicker, an eyebrow, or a caption above it. Supporting date words sit beside it, baseline-aligned to its foot. Nothing is stacked over a headline on this screen.

**The Shared Baseline Rule.** The date lockup is laid out **inline, not with flexbox**, and its parts align on `vertical-align: baseline`. The figure carries `line-height: 0.76`, so its box is far shorter than its glyph and the number's foot falls below the box's bottom edge: any box-based alignment (`align-items: flex-end`, a hand-tuned `padding`) leaves the words visibly floating above the figure, and the error scales with the clamp. The word stack is an `inline-block`, whose baseline is that of its **last** line, which is why the month — not the weekday — is the line that sits on the figure's foot. Never re-solve this with a magic offset; the offset would have to guess Anton's descender and would drift at every viewport width.

**The Marginal Voice Rule.** Every fact that is not the date, the title, or an action is set in Archivo Narrow, uppercase, letterspaced, tabular. Counts, dates and specs align in columns because an almanac's data column aligns.

**The One Figure Rule.** Anton is for numerals and short uppercase labels only. It never sets a sentence. In MUI terms it is `h1`–`h6`, and `h4`–`h6` are uppercase and letterspaced because at those sizes Anton is a rótulo, not a headline.

**The Six-Step Ramp Rule.** Interface type comes from `ALM_SIZE`: `{size.xs}` `{size.sm}` `{size.md}` `{size.lg}` `{size.xl}` `{size.xxl}`. Six steps, no more. Before it existed the theme had drifted into near-duplicates — 0.72 and 0.74, 0.86, 0.92 and 0.95 — which distinguish nothing and only make the system harder to hold. Two things sit outside the ramp on purpose and only these two: the day figure's `clamp(4.5rem, 21vw, 15rem)`, because it is the object the world exists for, and the 16px floor on text inputs, which stops iOS Safari zooming the page on focus.

## Layout

A single centered column, `max-width: 940px`, gutters of 12px on phone and 24px from
`md`, with `pb: calc(64px + env(safe-area-inset-bottom, 0px))`. The board fills
`100dvh` minimum. Above it, the 60px hanger strip is sticky at `top: 0` (`z-index: 20`).

Today's leaf is a three-column grid on desktop — figure lockup / marginal column /
illustrated block (`auto minmax(0,1fr) auto`, column gap 28px) — and a two-column grid
on phone (`minmax(0,1fr) auto`), where the marginal column drops under the figure and
the illustrated block spans both rows on the right. The marginal column stretches the
full height of the leaf on desktop with `justify-content: space-between`, so the year
sits at its head and the data at its foot with the hairline running the whole way; it
is never anchored to the foot alone. Within it the phone reverses source order: the
menu spec comes first (`order: 0`), the almanac facts second, because two lines of
trivia may not outrank the actionable line on a small screen. The illustrated block is
110 / 148 / 172px wide across `xs` / `sm` / `md`.

Below the leaf, the archive is a list of month groups (`margin-bottom: 28px` each). Each
group's month rule is sticky at `top: 60px` — flush under the hanger — on the board
color, so it never floats over paper. Rows are separated by a 13px top margin that the
torn edge occupies.

Archive rows never wrap: `flex-wrap: nowrap` on the row, the icon cluster, and the meta
line. On phone the row's horizontal padding drops to 10px, the corner block narrows from
52px to 42px, and prose is abbreviated ("24 plat." instead of "24 platillos") rather than
allowed to reflow. A wrapping row was 180px tall and thirty menus were five thousand
pixels of scroll.

Rhythm is the 8px MUI scale used in a small set of steps: 6, 8, 12, 16, 20, 24, 28, 40, 56.
Every tappable target clears 44px (`min-height: 44px` on the button root, 44×44 for the
icon variant), per the product's accessibility commitment.

### Named Rules
**The No-Wrap Row Rule.** An archive row is one line of leaf. Nothing in it wraps to a
second line; shrink the type, abbreviate the prose, or drop a redundant control instead.

**The Sticky Under Tin Rule.** Sticky month rules stop at 60px, the hanger's height, and
carry the board color. Two sticky layers never overlap.

## Elevation & Depth

There is no elevation system. There is paper on a board. Every shadow in this world is
either the cast shadow of a sheet lying on the backing card or the offset of a badly
registered second ink; there are no ambient, tonal, or focus glows, and no surface is
"raised" by anything but being physically on top of another.

### Shadow Vocabulary
- **Today's leaf** (`LEAF_SHADOW`): the attached leaf, standing slightly off the board. The only two-layer shadow in the world.
- **Torn leaf / blank leaf** (`SHEET_SHADOW`): any detached sheet in the archive.
- **Hanger strip** (`box-shadow: 0 2px 6px rgb(18 28 23 / 18%)`): the tin casting onto the board below it.
- **Leaf-edge highlight** (`STACK_EDGE_SHADOW`): the visible cut edges of the three sheets under today's leaf.
- **Stamp misregistration** (`box-shadow: 1.5px 1.5px 0 rgb(190 26 13 / 32%)` on the stamped primary; `1.5px 1.5px 0 rgb(27 26 21 / 20%)` on its uninked twin; `0.5px 0.5px 0 rgb(190 26 13 / 30%)` on the ink stamp): a same-hue offset of the ink itself, not a drop shadow.

### Named Rules
**The Misregistration Rule.** The stamped button's offset is fixed at 1.5px/1.5px in the button's own hue at ≤32% alpha, and the ink stamp's at 0.5px. It is press misregistration and it stays at that size. It must never grow, never darken, never gain blur, and never turn into a hard black offset — at any larger value it stops reading as cheap two-ink printing and becomes a neobrutalist drop shadow, which this world is not.

**The Cast-Shadow-Only Rule.** All shadows are board-tinted black (`rgb(26 6 3 / …)`, exported as `LEAF_SHADOW` / `SHEET_SHADOW` / `STACK_EDGE_SHADOW` so they cannot drift apart from the board colour) and vertical: they are the board receiving light from above. No hover lift, no focus glow, no colored ambience. Hover changes ink or a 4–7% wash, never elevation.

## Shapes

Radius is zero everywhere, without exception on any rectangle: buttons, leaves, rows,
the illustrated block, the errata band, skeletons, swatches. Where a nested component
arrives with its own radius (the live menu preview inside the illustrated block), the
block strips it: `& > * { border-radius: 0; box-shadow: none; }`. Paper does not have
rounded corners and a cheap press does not round a rule.

The only circles in the world are the two holes punched through the hanger, because a
hole is genuinely round — a 10px disc of ink at 42% with an inset shadow and a light
brow along its lower edge. That is a real object with round geometry, not a decision
about corners, which is why it does not contradict the rule.

Borders are printed rules: 2px ink for a button or the illustrated block, 2px red for a
stamp, 3px red for the errata band's top rule, 1px `{colors.rule}` for hairlines on paper,
1px `{colors.tin-dark}` under the hanger, 1px `rgb(27 26 21 / 30%)` outlining an ink swatch.

Three authored materials give the paper its edges:
- **Paper grain** — an inline `feTurbulence` fractal-noise SVG (`baseFrequency 0.9`, 4 octaves, stitched) laid over every sheet at **3.5% on today's leaf, 3% on archive rows, 16% with `mix-blend-mode: multiply` inside a stamped button**. Above that it stops being paper and becomes noise on a flat color.
- **Perforation** — `radial-gradient(circle at center, {colors.card} 0 1.6px, transparent 1.7px) repeat-x left center / 9px 4px` on a 12px band at the top of today's leaf. Round holes punched through to the board, not a dashed line.
- **Torn edge** — a repeating 96×10 SVG mask with a 4px-amplitude irregular profile, several stretches deliberately flat, applied to a 12px pseudo-element above each archive row. The mask position advances `(index * 29) % 96` px per row so no two tears are identical. High regular teeth would read as pinking shears, not torn paper.

### Named Rules
**The Zero Radius Rule.** Every corner in this world is square. If a child component brings a radius, the parent removes it.

**The Real Round Rule.** A circle is permitted only where the depicted object is round in life. Today that is the two punched holes, and nothing else.

**The Bottom Edge Is Guillotined Rule.** Only the top edge of a torn leaf is ragged. The bottom is a clean cut, because that is where the sheet below was still attached.

## Components

Two layers, and it matters which is which.

**On the home**, the controls are authored, not MUI. A Material ripple inside a paper
world is a graft that shows. An almanac button is an impression: it sinks a hair on
press, like a stamp against a table.

**Everywhere else**, the same vocabulary is spoken through MUI, translated once in
`src/theme.ts`. Ripples are off, radius is zero, the faces and the ink are the same, and
the theme's `MuiCssBaseline` also dresses the surfaces the browser would otherwise paint
by itself — text selection, caret, accent colour, focus ring and scrollbars. That block
is the cheapest signal that a page was built rather than assembled, and it is the one
most easily lost in a refactor: keep it.

### Buttons
One 44px-minimum box with five printings selected by `data-variant`, all sharing
Archivo Narrow 600 uppercase at `0.14em`, zero radius, and a 90ms `cubic-bezier(0.2,0,0,1)`
transform. **There is no color transition** — ink does not fade in. The only motion is the
press: `translateY(1.5px)` on `:active`.

- **Shape:** square (0 radius), 2px ink border, 0 20px padding, 44px minimum height.
- **Stamp (primary):** red ground, red border, newsprint text, 52px tall, 0.92rem, rotated `-0.7deg`, grain overlay at 16% multiply, misregistration offset per the Elevation rule. Hover deepens the ground to Pressed Red; active becomes `rotate(-0.7deg) translateY(1.5px)`; focus-visible rings 2px ink at 3px offset; disabled goes to shade ground, faint border, no offset. **One per screen.**
- **Stamp Ghost (secondary):** the same stamp, uninked — no fill, ink border, ink text, an ink-hued 1.5px offset at 20%. It is the primary's genuine pair (used for "Duplicar el último", which the product treats as the ordinary path, not a shortcut), so it keeps the same box, tilt and grain.
- **Outline:** the resting form. Ink border, transparent ground, 44px. Hover washes `rgb(27 26 21 / 7%)`. Used for inline confirmations, where it can be restroked in red.
- **Quiet:** no border, 0 10px padding, muted ink at `0.12em`. Hover goes to full ink. Used for "Otro" and for a confirmation's "No".
- **Focus:** 2px red outline at 3px offset on paper; the stamped variant swaps to ink so red does not ring red.

**MUI equivalents** (`theme.components.MuiButton`), for the interior routes: `contained`
+ `primary` is the stamp without the tilt — the tilt belongs to the portada's signature
action, and inside the app you work rather than announce. `contained` + `inherit` is an
**inked neutral** (`{colors.ink}` ground, newsprint text, `{colors.ink-deep}` on hover),
declared as a prop-matcher because MUI's own neutral fill is a system grey that dies on
newsprint — it made "Guardar cambios" read as disabled. `outlined` + `inherit` is the
resting form; it is also a prop-matcher, and it is what fixed a long-standing bug where
the pairing forced a white ground and produced white text on white.

### Icon Buttons
44×44, borderless, muted ink, with a hand-drawn 20px glyph. Hover takes the glyph to full
ink over a 7% ink wash. Every one carries an `aria-label` naming the menu's long date.

### Iconography
Nine authored glyphs (settings, edit, view, duplicate, delete, arrow-right, plus, refresh,
empty-plate) on a 24×24 viewbox sharing **one stroke spec: 1.75px, `stroke-linecap: square`,
`stroke-linejoin: miter`, `currentColor`, no fill.** No curve of convenience — the gear is
an eight-tooth straight-sided wheel, not a lobed corona. The hard profile is what makes
them siblings of the type on the leaf. No icon font, no icon package.

### Cards / Containers (the leaf)
- **Corner Style:** square.
- **Background:** newsprint with a 3.5% grain overlay.
- **Shadow:** the two-layer cast shadow; see Elevation.
- **Border:** none. A leaf is defined by its shadow and its perforation, not by a stroke.
- **Internal Padding:** 20px / 32px horizontal (`xs` / `md`), 8–12px top, 20–24px bottom.
- **Detail:** three 10px shade bars at insets 10/6/3px and rising 3px offsets sit above the leaf as the cut edges of the pad. Three is the count — more becomes a deck of cards.

### Ink Stamp
A rubber stamp, rotated `-2.5deg` by default: 2px red border, red Anton 0.78rem at `0.16em`
uppercase, 3px 9px 2px padding, a 0.5px red offset. It carries relative-day badges ("HOY",
"AYER") and travels inline with the row title, never on the meta line. Nothing else may
wear it.

### Fields, Toggles and Surfaces (interior routes)
Translated once in `src/theme.ts`, never re-styled per screen.

- **Text field:** newsprint ground, square, a `{colors.rule}` hairline at rest that goes to `{colors.ink-muted}` on hover and to a **2px ink** rule on focus. The label is Archivo Narrow uppercase; inputs carry `font-variant-numeric: tabular-nums` and a 16px floor.
- **Toggle button:** a 2px ink box, muted ink at rest. **Selecting is inking**: the active state fills solid ink with newsprint text. It never lifts, glows, or takes a shadow. Grouped toggles overlap their borders by −2px so a run of them reads as one printed rule.
- **Paper:** square, `background-image: none`, `outlined` on the hairline; elevations 1–3 all collapse to a single paper lift (`0 2px 4px` + `0 8px 18px` ink-black), because there is one physical relationship — a sheet on a ground — not a five-step elevation scale.
- **Dialog:** square paper, an Anton uppercase title. Used only outside the home.
- **Alert:** paper ground with a **3px rule across its top** in the feedback ink, message text in press black — the errata band's grammar, applied system-wide. Never a colored left edge, never a tinted fill.
- **Chip:** square, Archivo Narrow uppercase at `{size.xs}`, hairline border.
- **Tooltip:** solid ink ground, newsprint text, square, uppercase.

### Navigation (the hanger strip)
**Flat, not shiny.** An earlier version stacked an eight-stop vertical gradient, uneven
laminate bands, a dashed crimp seam and two domed rivets on octagonal plates. Four
relief signals at once do not read as cheap tin; they read as 2008 brushed chrome. What
remains is the whole material: a flat tone, one light hairline at the folded top edge,
one dark line at the cut lower lip, and two punched holes (a 10px dark disc with an
inset shadow and a light lower brow, so it reads as a hole rather than a speck). The
strip's drop shadow is short, because a bar with a heavy shadow floats like a toolbar.

Shared by **every route** via `src/components/AppBar.tsx`, which exports `HANGER_H = 60`
so sticky things below it can stop flush against it. On the home it carries the die-stamped
logo through a `brand` slot, with the route title kept as a visually hidden `h1`; elsewhere
it carries a back chevron, an Anton uppercase title, and an optional Archivo Narrow subtitle.
Where a route is a two-column grid, the strip sits **above** the grid and spans the viewport —
inside a column it would leave a punched hole dangling mid-page and the aside without a top edge.

A sticky 60px tin strip with a 1px `{colors.tin-dark}` lower border. The two holes are
fixed-size elements 18px in from each side, so no stretch deforms them. The logo is die-stamped at the left (26/30px tall) — an almanac
carries its giver's mark on the strip, not on a leaf that gets thrown away — and a single
settings icon button sits at the right.

### Archive Row (signature)
A newsprint slip with a torn top edge, a phase-shifted tear, and 3% grain. Layout: a fixed
42/52px corner block (Anton figure over an Archivo Narrow weekday abbreviation, both red on
Sundays), then the title with its ink stamp, then the meta line (dish count · ink swatch ·
template name), then the control cluster. The **title is a stretched link** — a bare button
whose `::after` covers the whole row — so the entire slip opens the editor without nesting
buttons; focus draws a 2px red outline inset 3px around the row, and hovering the row
washes it 4%. The right-hand controls sit at `z-index: 1` above the stretched link and stay
independently clickable. On phone only the pencil is dropped, since the whole slip already
goes to the editor; "Ver y compartir" stays, because the phone is exactly the scene where an
old menu gets shared from the counter.

### States
- **Skeleton:** two paper slips, 45%×20 and 28%×12 shade bars, no tear mask. Loading paper is still paper.
- **Blank leaf:** a centered sheet with the 40px empty-plate glyph in faint ink, an Anton uppercase headline, and one 46ch paragraph of Archivo. This is the only place on the screen that explains itself — today's leaf never carries explanatory prose, because the person opening it opens it daily.
- **Errata band:** a paper band with a **3px red rule across its top**, an Anton 0.68rem "Fe de erratas" line in red, then the message. A printed correction announces itself with a rule over the text, not a colored strip down its edge.
- **Delete confirmation:** inline, in the row itself — a red-restroked outline button and a quiet "No" that takes focus — replacing the icon cluster. The home never opens a Material dialog; a wall almanac has no modals.

### Motion
Three motions exist. The press (`transform 90ms cubic-bezier(0.2,0,0,1)`, `translateY(1.5px)`).
The tear: on primary activation today's leaf runs `alm-tear` — 190ms, `cubic-bezier(0.3,0,0.1,1)`,
dipping 3px and rotating `-0.4deg` before lifting to `-26px / -1.4deg` at zero opacity, with the
perforation fading to 25% — then navigates. It respects `prefers-reduced-motion: reduce` by
navigating immediately, and self-restores after 900ms if the route did not change, so a failed
save never leaves the primary action invisible. Nothing else animates.

## Do's and Don'ts

### Do:
- **Do** build any new element out of board, tin, or newsprint. If it is none of the three, it does not belong on this screen.
- **Do** keep every corner square (0 radius), and strip a nested child's radius at the parent when one arrives.
- **Do** print in two inks only: press black and Sunday red on newsprint.
- **Do** set data — counts, dates, specs, control labels — in Archivo Narrow, uppercase, letterspaced, tabular.
- **Do** keep exactly one stamped primary action per screen; everything else is stamp-ghost, outline, quiet, or icon.
- **Do** hold the paper grain at 3–3.5% on sheets (16% multiply inside a stamped button). Above that it is noise, not paper.
- **Do** confirm destructive actions inline on the row, and keep every tap target at 44px.
- **Do** cast shadows with the exported `LEAF_SHADOW` / `SHEET_SHADOW` / `STACK_EDGE_SHADOW`, board-tinted and straight down; they are the board receiving light from the nail. Never re-inline them — a change of board colour must move them too.
- **Do** draw new icons at 1.75px stroke, square caps, miter joins, on a 24×24 box, with no curve of convenience.
- **Do** vary the torn-edge mask phase per row so no two tears repeat.

### Don't:
- **Don't** round anything. The two punched holes are round because a hole is round; that is a depicted object, not a corner style.
- **Don't** let the stamp's 1.5px misregistration grow, darken, blur, or turn black. At any larger value it stops being press misregistration and becomes a drop shadow this world has no room for.
- **Don't** set a kicker, eyebrow, or label above the day figure, or above any headline here. Supporting words sit beside the figure.
- **Don't** use `{colors.ink-faint}` for text a user must read (2.89:1). Strokes and decorative glyphs only.
- **Don't** introduce a third ink, a tinted state background, or a colored surface; a template's ink swatch is the only saturated exception and only as a 9×9px outlined square.
- **Don't** use cream. Cream is the older MUI theme's ground; this paper is grey-raw.
- **Don't** open a Material dialog, ripple, pill button, or elevated card **on the home**. On interior routes MUI is allowed, but only as the theme dresses it.
- **Don't** use an emoji as an icon anywhere. `EmptyState.icon` takes a `ReactNode` precisely so it receives an authored glyph; an emoji is painted by the operating system in its own colour and stroke and belongs to no design system.
- **Don't** let an archive row wrap to a second line. Shrink type, abbreviate, or drop a control that the stretched link already covers.
- **Don't** put explanatory prose on today's leaf. The explanation lives in the blank-leaf state, where it is needed once.
- **Don't** use an icon font or an icon package; every glyph is authored SVG in the shared stroke spec.
- **Don't** import `src/styles/tokens.css` values into this world, and **don't export this world's tokens into `src/templates/`**. That stylesheet's `--font-display` / `--font-body` belong to the printed menu alone; changing them changes the image customers receive.

## Known Gaps

**No month index or jump in the archive.** The archive groups torn leaves by month with
sticky month rules, which carries roughly a year of menus legibly, but PRODUCT.md records
that old menus are genuinely consulted and that the list must stay navigable at dozens of
accumulated menus. Beyond a year, finding a specific month means scrolling. This was scored
unresolved-but-declared across two finish-review rounds and is recorded here deliberately:
resolving it is a **new navigation feature** (an index, a jump control, or a year filter and
its own place in this world's form language), not a correction to this composition. A future
run adding it should design it as board furniture — printed on the board, in the marginal
voice — not as a control bar on the paper.

**The confirm dialog and the toast are still MUI surfaces.** `src/components/ConfirmDialog.tsx`
and `src/components/Toast.tsx` inherit the theme — square, newsprint, ink, the alert's top
rule — so they no longer contradict the world, but they were never rebuilt in its own
vocabulary the way the home's controls were. The home avoids the dialog entirely by
confirming inline on the row; the interior routes still open it. A future pass should
either author them as paper surfaces or decide that the theme's dressing is enough.

**`src/styles/tokens.css` still carries the previous system** — cream ground, pill radii,
the Baloo display face, a five-step radius scale. It is not dead code and not this system:
`src/templates/MenuLayout.module.css` reads `--font-display` and `--font-body` from it, and
nothing else does. Left in place deliberately. Do not "clean it up".
