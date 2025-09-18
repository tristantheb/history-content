import React from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import '../index.css';
import Home from './routes/Home.jsx';
import StatusSVG from './routes/StatusSVG.jsx';

const base = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '');

const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/status-svg', element: <StatusSVG /> },
], { basename: base });

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
