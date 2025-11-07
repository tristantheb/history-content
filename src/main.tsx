import React from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { Home } from '@/routes/Home'

import '@public/index.css'

const base = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '')

const router = createBrowserRouter([
  { path: '/', element: <Home /> }
], { basename: base })

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element with id "root" not found')
}

createRoot(rootElement).render(
  <div
    className={'bg-white text-stone-950 dark:bg-stone-900 dark:text-white min-h-screen'}>
    <React.StrictMode>
      <Header />
      <RouterProvider router={router} />
      <Footer />
    </React.StrictMode>
  </div>
)
