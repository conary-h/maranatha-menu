import Button from '@mui/material/Button'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { EmptyState } from '@/components/Feedback'
import { IconOffRoute } from '@/almanac/AlmanacUi'
import { ToastProvider } from '@/components/Toast'
import { paths, useNavigate, useRoute } from '@/hooks/useRoute'
import { theme } from '@/theme'
import { BusinessProvider } from '@/features/business/BusinessContext'
import { BusinessSettingsPage } from '@/features/business/BusinessSettingsPage'
import { MenuEditorPage } from '@/features/editor/MenuEditorPage'
import { MenuListPage } from '@/features/menus/MenuListPage'
import { PreviewPage } from '@/features/preview/PreviewPage'

function Routes() {
  const route = useRoute()
  const navigate = useNavigate()

  switch (route.name) {
    case 'list':
      return <MenuListPage />
    case 'editor':
      // Keyed so switching menus remounts the editor with clean local state.
      return <MenuEditorPage key={route.menuId} menuId={route.menuId} />
    case 'preview':
      return <PreviewPage key={route.menuId} menuId={route.menuId} />
    case 'settings':
      return <BusinessSettingsPage />
    case 'notFound':
      return (
        <EmptyState
          icon={<IconOffRoute />}
          title="Página no encontrada"
          action={
            <Button variant="contained" onClick={() => navigate(paths.list())}>
              Ir a mis menús
            </Button>
          }
        />
      )
  }
}

export function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
        <ToastProvider>
          <BusinessProvider>
            <Routes />
          </BusinessProvider>
        </ToastProvider>
      </ErrorBoundary>
    </ThemeProvider>
  )
}
