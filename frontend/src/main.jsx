import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

// Override global fetch untuk secara otomatis mengirimkan header Ngrok Bypass
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  let [resource, config] = args;
  if (typeof resource === 'string' && resource.includes('ngrok-free.dev')) {
    config = config || {};
    config.headers = {
      ...config.headers,
      'ngrok-skip-browser-warning': '69420',
    };
  }
  return originalFetch(resource, config);
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
