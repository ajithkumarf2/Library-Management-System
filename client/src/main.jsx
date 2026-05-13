import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import axios from 'axios'

axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
axios.defaults.withCredentials = true

// Add a request interceptor to include the auth token
axios.interceptors.request.use(
    (config) => {
        const adminToken = sessionStorage.getItem('libraAdminToken');
        const userToken = sessionStorage.getItem('libraUserToken');
        
        // If the request is to an admin endpoint, prioritize adminToken
        if (config.url.includes('/admin') && adminToken) {
            config.headers.Authorization = `Bearer ${adminToken}`;
        } 
        // Otherwise, use userToken if available
        else if (userToken) {
            config.headers.Authorization = `Bearer ${userToken}`;
        }
        // Fallback to adminToken if no userToken and not explicitly an admin route
        else if (adminToken) {
            config.headers.Authorization = `Bearer ${adminToken}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)
