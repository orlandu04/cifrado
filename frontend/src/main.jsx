/**
 * Punto de entrada del frontend.
 *
 * Monta React sobre el contenedor #root definido en index.html y carga los
 * estilos globales. StrictMode ayuda a detectar efectos con limpieza
 * incorrecta durante el desarrollo.
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
