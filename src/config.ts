export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://dominio-produccion.com'
  : 'http://localhost:5001';

export const CONFIG = {
  API_BASE_URL,
  API: {
    TIMEOUT: 10000, 
    RETRY_ATTEMPTS: 3,
  }
}; 