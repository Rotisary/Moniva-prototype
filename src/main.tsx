import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { DemoDataProvider } from '@/store/demo-data'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <DemoDataProvider>
        <App />
      </DemoDataProvider>
      <Toaster theme="light" position="bottom-right" className="toaster group print:hidden" />
    </BrowserRouter>
  </StrictMode>,
)
