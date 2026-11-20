import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { Router } from './router.jsx'
import { StrategyProvider } from './context/StrategyContext.jsx'
import { ProgressProvider } from './context/ProgressContext.jsx'
import './styles.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <StrategyProvider>
      <ProgressProvider>
        <Router>
          <App />
        </Router>
      </ProgressProvider>
    </StrategyProvider>
  </React.StrictMode>
)
