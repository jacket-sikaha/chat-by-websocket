import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createBrowserRouter, createHashRouter } from 'react-router-dom';
import { DefaultRoutes } from './config/route.tsx';
import './index.css';

const router = import.meta.env.DEV
  ? createBrowserRouter(DefaultRoutes)
  : createHashRouter(DefaultRoutes);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
