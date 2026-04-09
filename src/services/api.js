import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api',
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const login = (username, password) => 
    api.post('/token/', { username, password });

export const fetchRawLots = () => api.get('/production/raw-lots/');
export const createRawLot = (data) => api.post('/production/raw-lots/', data);
export const createSteamingBatch = (data) => api.post('/production/steaming/', data);
// ... etc.