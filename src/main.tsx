import React from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import '../index.css'
import Home from './routes/Home'
import StatusSVG from './routes/StatusSVG'

const base = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '')

const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/status-svg', element: <StatusSVG /> }
], { basename: base })

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element with id "root" not found')
}

createRoot(rootElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
