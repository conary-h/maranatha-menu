import { createTheme } from '@mui/material/styles'

/**
 * Brand theme.
 *
 * Material's defaults — sharp-ish corners, uppercase buttons, cool greys, blue
 * primary — would make the editor read as a generic admin dashboard, which is
 * exactly what this product must not look like. Everything below pulls MUI
 * towards the warm, rounded identity of the business's own logo: the logo red
 * as primary, the orange of the printed menu as secondary, a cream ground, and
 * the same two typefaces the exported menu uses.
 */

const BRAND = {
  red: '#be1a0d',
  redDark: '#8f1209',
  redLight: '#d93a26',
  orange: '#e08a1e',
  orangeDark: '#b96c11',
  amber: '#f7c24b',
  cream: '#fff4e4',
  ink: '#241b11',
} as const

const FONT_BODY = "'Plus Jakarta Sans Variable', system-ui, -apple-system, sans-serif"
const FONT_DISPLAY = `'Baloo 2', ${FONT_BODY}`

/** Everything tappable clears the 44px recommended target. */
const TAP = 44

export const theme = createTheme({
  cssVariables: true,
  palette: {
    mode: 'light',
    primary: { main: BRAND.red, dark: BRAND.redDark, light: BRAND.redLight, contrastText: '#fff' },
    secondary: { main: BRAND.orange, dark: BRAND.orangeDark, contrastText: '#fff' },
    error: { main: '#c02717' },
    success: { main: '#1f7a4d' },
    background: { default: '#faf6f0', paper: '#ffffff' },
    text: { primary: BRAND.ink, secondary: '#6d5c48', disabled: '#9c8b76' },
    divider: '#e8ddcd',
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: FONT_BODY,
    h1: { fontFamily: FONT_DISPLAY, fontWeight: 800 },
    h2: { fontFamily: FONT_DISPLAY, fontWeight: 800 },
    h3: { fontFamily: FONT_DISPLAY, fontWeight: 800 },
    h4: { fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: '1.25rem' },
    h5: { fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: '1.1rem' },
    h6: { fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: '1rem' },
    subtitle2: { fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '0.75rem' },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true, variant: 'outlined', color: 'inherit' },
      styleOverrides: {
        root: { borderRadius: 999, minHeight: TAP, paddingInline: 20, gap: 8 },
        sizeSmall: { minHeight: 36, paddingInline: 14, fontSize: '0.85rem' },
        sizeLarge: { minHeight: 52, fontSize: '1.05rem' },
      },
      // MUI v9 has no combined `outlinedInherit` slot; prop matchers replace it.
      variants: [
        {
          props: { variant: 'outlined', color: 'inherit' },
          style: {
            borderColor: '#d6c7b1',
            backgroundColor: '#fff',
            '&:hover': { borderColor: '#c2ae92', backgroundColor: '#fff' },
          },
        },
      ],
    },
    MuiIconButton: {
      styleOverrides: {
        root: { width: TAP, height: TAP, borderRadius: 12 },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: ({ theme: t }) => ({
          border: 0,
          borderRadius: 999,
          minHeight: 38,
          paddingInline: 16,
          textTransform: 'none',
          fontWeight: 600,
          color: t.palette.text.secondary,
          '&.Mui-selected': {
            backgroundColor: t.palette.background.paper,
            color: t.palette.text.primary,
            boxShadow: '0 1px 3px rgb(36 27 17 / 12%)',
            '&:hover': { backgroundColor: t.palette.background.paper },
          },
        }),
      },
    },
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: { backgroundColor: '#f4ede3', borderRadius: 999, padding: 3, gap: 2 },
        grouped: { '&:not(:first-of-type)': { borderRadius: 999 }, '&:first-of-type': { borderRadius: 999 } },
      },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined', fullWidth: true },
    },
    MuiInputBase: {
      styleOverrides: {
        // 16px stops iOS Safari from zooming the page whenever a field is focused.
        input: { fontSize: 16 },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { backgroundColor: '#fff', borderRadius: 12 },
        notchedOutline: { borderColor: '#d6c7b1' },
      },
    },
    MuiInputLabel: {
      styleOverrides: { root: { fontWeight: 600 } },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: { borderRadius: 18 },
        outlined: { borderColor: '#e8ddcd' },
      },
    },
    MuiDialog: {
      styleOverrides: { paper: { borderRadius: 18, margin: 16, width: 'calc(100% - 32px)' } },
    },
    MuiDialogTitle: {
      styleOverrides: { root: { fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: '1.25rem' } },
    },
    MuiAlert: {
      styleOverrides: { root: { borderRadius: 12, fontWeight: 500 } },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 600 } },
    },
    MuiTooltip: {
      defaultProps: { enterTouchDelay: 400 },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          // Double-tap zoom only fights taps in an editor like this one.
          touchAction: 'manipulation',
          WebkitFontSmoothing: 'antialiased',
        },
      },
    },
  },
})
