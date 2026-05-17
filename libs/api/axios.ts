import axios from 'axios';

export const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined in environment variables.");
}

const api = axios.create({
  baseURL: BASE_URL, 
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, 
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const path = window.location.pathname; 
    
    const pathLocale = path.split('/')[1]; 
    
    const supportedLocales = ['th', 'en'];
    const locale = supportedLocales.includes(pathLocale) ? pathLocale : 'th';
    
    config.headers['Accept-Language'] = locale;
  }
  
  return config;
});

export default api;