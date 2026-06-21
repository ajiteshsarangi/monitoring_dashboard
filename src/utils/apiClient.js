import axios from 'axios';

// Centralized Axios client for BlueGrid Dashboard API connections
const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  timeout: 5000 // 5 seconds request timeout
});

export default apiClient;
