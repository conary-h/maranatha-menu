import { createTheme } from '@mui/material/styles'
import { ALM, ALM_FONT, ALM_SIZE } from '@/almanac/tokens'

/**
 * Tema de la aplicación, en el mundo del almanaque.
 *
 * Antes este archivo empujaba a MUI hacia una identidad blanda y redondeada:
 * pastillas de radio 999, cuatro radios distintos, superficies elevadas y una
 * tipografía de titular con las esquinas limadas. El inicio se rehízo como un
 * almanaque de taco —papel periódico a dos tintas, radio cero, estructura por
 * filetes y no por sombras— y este tema lleva esa misma disciplina al editor,
 * la vista previa y los ajustes, para que la aplicación deje de hablar dos
 * idiomas al cambiar de pantalla.
 *
 * Lo que NO cambia: `--font-display` y `--font-body` de `tokens.css`. Las
 * plantillas del menú impreso son un artefacto aparte —el entregable real, un
 * lienzo fijo de 1080 × 1920 en CSS Modules, deliberadamente fuera de MUI— y
 * conservan su tipografía. Tocar esas dos variables cambiaría la imagen que se
 * manda por WhatsApp, que es justo lo que nadie pidió cambiar.
 */

/** Todo elemento tocable despeja los 44 px recomendados. */
const TAP = 44

/** El escritorio sobre el que se apoyan las hojas. */
const DESK = '#d9d7c9'

/** Sombra de papel: desplazamiento y difuminado de verdad, nunca un halo. */
const PAPER_LIFT = '0 2px 4px rgb(27 26 21 / 10%), 0 8px 18px rgb(27 26 21 / 10%)'

export const theme = createTheme({
  cssVariables: true,
  palette: {
    mode: 'light',
    primary: { main: ALM.red, dark: '#8f1209', light: '#d93a26', contrastText: ALM.paper },
    // El rojo hondo del cartón de respaldo, disponible para el resto de la app.
    secondary: { main: ALM.card, dark: ALM.cardDeep, light: '#1a5d43', contrastText: ALM.paper },
    error: { main: ALM.danger },
    success: { main: ALM.ok },
    background: { default: DESK, paper: ALM.paper },
    text: { primary: ALM.ink, secondary: ALM.inkMuted, disabled: ALM.inkFaint },
    divider: ALM.rule,
  },
  // Cero. La única curva del mundo son los remaches del fleje, y esos se
  // dibujan a mano porque un remache sí es redondo.
  shape: { borderRadius: 0 },
  typography: {
    fontFamily: ALM_FONT.text,
    // Anton para los titulares y los rótulos: es la letra de la cifra del día,
    // y una hoja de almanaque no tiene una segunda voz de titular.
    h1: { fontFamily: ALM_FONT.figure, fontWeight: 400, letterSpacing: '-0.02em' },
    h2: { fontFamily: ALM_FONT.figure, fontWeight: 400, letterSpacing: '-0.01em' },
    h3: { fontFamily: ALM_FONT.figure, fontWeight: 400 },
    h4: {
      fontFamily: ALM_FONT.figure,
      fontWeight: 400,
      fontSize: ALM_SIZE.xxl,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
    },
    h5: {
      fontFamily: ALM_FONT.figure,
      fontWeight: 400,
      fontSize: ALM_SIZE.xl,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
    },
    h6: {
      fontFamily: ALM_FONT.figure,
      fontWeight: 400,
      fontSize: ALM_SIZE.lg,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
    },
    subtitle2: {
      fontFamily: ALM_FONT.data,
      fontWeight: 600,
      letterSpacing: '0.18em',
      textTransform: 'uppercase',
      fontSize: ALM_SIZE.sm,
    },
    button: {
      fontFamily: ALM_FONT.data,
      fontWeight: 600,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
    },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true, disableRipple: true, variant: 'outlined', color: 'inherit' },
      styleOverrides: {
        root: { borderRadius: 0, minHeight: TAP, paddingInline: 20, gap: 8, fontSize: ALM_SIZE.md },
        sizeSmall: { minHeight: 38, paddingInline: 14, fontSize: ALM_SIZE.sm },
        sizeLarge: { minHeight: 52, fontSize: ALM_SIZE.lg },
        // Contenido: la tinta se desplaza medio milímetro del filete, que es
        // el fuera de registro de cualquier impresión barata a dos tintas.
        // Sin giro: el giro es del sello de la portada, y aquí dentro se
        // trabaja, no se anuncia.
        contained: { boxShadow: `1.5px 1.5px 0 rgb(27 26 21 / 22%)` },
        containedPrimary: { boxShadow: `1.5px 1.5px 0 rgb(190 26 13 / 32%)` },
        outlined: { borderWidth: 2, '&:hover': { borderWidth: 2 } },
      },
      variants: [
        {
          // Este emparejamiento es el botón corriente de la app. Antes se
          // pintaba de blanco, lo que dejaba texto blanco sobre blanco en
          // cuanto alguien lo ponía sobre una superficie oscura.
          props: { variant: 'outlined', color: 'inherit' },
          style: {
            borderColor: ALM.ink,
            color: ALM.ink,
            backgroundColor: 'transparent',
            '&:hover': { borderColor: ALM.ink, backgroundColor: 'rgb(27 26 21 / 7%)' },
            '&.Mui-disabled': { borderColor: ALM.inkFaint, color: ALM.inkFaint },
          },
        },
        {
          // El relleno neutro de MUI es un gris de sistema que sobre papel se
          // lee como un botón apagado —«Guardar cambios» parecía deshabilitado—.
          // Aquí el neutro con peso es la tinta negra.
          props: { variant: 'contained', color: 'inherit' },
          style: {
            backgroundColor: ALM.ink,
            color: ALM.paper,
            '&:hover': { backgroundColor: ALM.inkDeep },
            '&.Mui-disabled': { backgroundColor: ALM.paperShade, color: ALM.inkFaint },
          },
        },
      ],
    },
    MuiIconButton: {
      defaultProps: { disableRipple: true },
      styleOverrides: {
        root: {
          width: TAP,
          height: TAP,
          borderRadius: 0,
          color: ALM.inkMuted,
          '&:hover': { color: ALM.ink, backgroundColor: 'rgb(27 26 21 / 7%)' },
        },
      },
    },
    MuiToggleButton: {
      defaultProps: { disableRipple: true },
      styleOverrides: {
        root: {
          border: `2px solid ${ALM.ink}`,
          borderRadius: 0,
          minHeight: 42,
          paddingInline: 16,
          fontFamily: ALM_FONT.data,
          fontWeight: 600,
          fontSize: ALM_SIZE.sm,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: ALM.inkMuted,
          // Seleccionar es entintar: el estado activo se rellena de tinta, no
          // se levanta con una sombra.
          '&.Mui-selected': {
            backgroundColor: ALM.ink,
            color: ALM.paper,
            '&:hover': { backgroundColor: ALM.ink },
          },
        },
      },
    },
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: { borderRadius: 0, gap: 0 },
        grouped: {
          borderRadius: 0,
          '&:not(:first-of-type)': { borderRadius: 0, marginLeft: -2 },
          '&:first-of-type': { borderRadius: 0 },
        },
      },
    },
    MuiTextField: { defaultProps: { variant: 'outlined', fullWidth: true } },
    MuiInputBase: {
      styleOverrides: {
        // 16px stops iOS Safari from zooming the page whenever a field is focused.
        input: { fontSize: 16, fontVariantNumeric: 'tabular-nums' },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: ALM.paper,
          borderRadius: 0,
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: ALM.inkMuted },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderWidth: 2, borderColor: ALM.ink },
        },
        notchedOutline: { borderColor: ALM.rule },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontFamily: ALM_FONT.data,
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          fontSize: ALM_SIZE.md,
          '&.Mui-focused': { color: ALM.ink },
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: { root: { fontFamily: ALM_FONT.data, letterSpacing: '0.04em' } },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
        rounded: { borderRadius: 0 },
        outlined: { borderColor: ALM.rule },
        elevation1: { boxShadow: PAPER_LIFT },
        elevation2: { boxShadow: PAPER_LIFT },
        elevation3: { boxShadow: PAPER_LIFT },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: 0, margin: 16, width: 'calc(100% - 32px)', boxShadow: PAPER_LIFT },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontFamily: ALM_FONT.figure,
          fontWeight: 400,
          fontSize: ALM_SIZE.xl,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        // Filete arriba, como una fe de erratas: una franja de color al canto
        // es la muletilla que este mundo no usa.
        root: {
          borderRadius: 0,
          fontWeight: 500,
          borderTop: '3px solid currentColor',
          backgroundColor: ALM.paper,
        },
        standardError: { color: ALM.danger },
        standardWarning: { color: ALM.caution },
        standardSuccess: { color: ALM.ok },
        standardInfo: { color: ALM.inkMuted },
        message: { color: ALM.ink },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          fontFamily: ALM_FONT.data,
          fontWeight: 600,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          fontSize: ALM_SIZE.xs,
        },
        outlined: { borderColor: ALM.rule },
      },
    },
    MuiTooltip: {
      defaultProps: { enterTouchDelay: 400 },
      styleOverrides: {
        tooltip: {
          borderRadius: 0,
          backgroundColor: ALM.ink,
          color: ALM.paper,
          fontFamily: ALM_FONT.data,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          fontSize: ALM_SIZE.xs,
        },
      },
    },
    MuiSnackbarContent: { styleOverrides: { root: { borderRadius: 0 } } },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          // Double-tap zoom only fights taps in an editor like this one.
          touchAction: 'manipulation',
          WebkitFontSmoothing: 'antialiased',
        },
        // Las superficies que no dibujamos también son del diseño: selección,
        // cursor, anillo de foco y barras de scroll salen del navegador sin
        // pertenecer a ningún sistema si no se les dice lo contrario.
        '::selection': { backgroundColor: ALM.red, color: ALM.paper },
        ':root': { accentColor: ALM.red, caretColor: ALM.ink },
        ':focus-visible': { outline: `2px solid ${ALM.red}`, outlineOffset: 2 },
        '*': { scrollbarColor: `${ALM.inkFaint} transparent`, scrollbarWidth: 'thin' },
      },
    },
  },
})
