import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { Home } from '@/routes/Home'
import { PageError } from '@/routes/PageError'

const base = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '')
const router = createBrowserRouter([
  {
    path: '/',
    Component: Home,
    ErrorBoundary: PageError
  }
], { basename: base })

const rootElement = document.getElementById('root')
if (!rootElement)
  throw new Error('Root element with id "root" not found')

createRoot(rootElement).render(
  <>
    <Header />
    <RouterProvider router={router} />
    <Footer />
  </>
)
