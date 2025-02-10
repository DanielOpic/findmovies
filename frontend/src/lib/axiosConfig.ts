import axios from 'axios';

// Konfiguracja Axios z adresem backendu
const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api', // Zmień na URL swojego backendu
  timeout: 5000, // Timeout po 5 sekundach
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;
