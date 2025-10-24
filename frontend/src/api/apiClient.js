import axios from 'axios';

// Get the base URL
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Create a new Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

export default apiClient;