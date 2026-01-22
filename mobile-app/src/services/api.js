import axios from 'axios';
import { Platform } from 'react-native';

// API URL configuration
const getApiUrl = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:8080/api'; // Web browser
  } else if (Platform.OS === 'android') {
    // For physical Android device, use your computer's local IP address
    // For Android emulator, use: http://10.0.2.2:8080/api
    return 'http://172.20.10.3:8080/api';
  } else if (Platform.OS === 'ios') {
    return 'http://localhost:8080/api'; // iOS simulator
  }
  return 'http://localhost:8080/api'; // Default
};

const API_BASE_URL = getApiUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Products
export const getItems = () => api.get('/products');
export const getItem = (id) => api.get(`/products/${id}`);

// Categories (mock for now since backend doesn't have categories yet)
export const getCategories = () => Promise.resolve({ data: [] });

// Consumers
export const getConsumer = (id) => api.get(`/consumers/${id}`);
export const createConsumer = (data) => api.post('/consumers', data);
export const updateConsumer = (id, data) => api.put(`/consumers/${id}`, data);

// Orders
export const getConsumerOrders = (consumerId) => api.get(`/orders/consumer/${consumerId}`);
export const createOrder = (data) => api.post('/orders', data);

// Cart
export const getCart = (consumerId) => api.get(`/cart/consumer/${consumerId}`);
export const addToCart = (data) => api.post('/cart', data);
export const updateCartItem = (cartItemId, quantity) => 
  api.put(`/cart/items/${cartItemId}`, { quantity });
export const removeFromCart = (cartItemId) => api.delete(`/cart/items/${cartItemId}`);

// Auth (placeholder - update based on your auth implementation)
export const login = (credentials) => api.post('/auth/login', credentials);
export const register = (data) => api.post('/auth/register', data);

export default api;
