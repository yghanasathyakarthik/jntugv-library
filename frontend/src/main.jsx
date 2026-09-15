import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import axios from 'axios'

// Set base URL for API calls in production
axios.defaults.baseURL = import.meta.env.VITE_API_URL || '';

// Force bust PWA cache to ensure latest updates are applied immediately
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
    }
  });
  // Clear caches
  caches.keys().then((keyList) => {
    return Promise.all(keyList.map((key) => {
      return caches.delete(key);
    }));
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
