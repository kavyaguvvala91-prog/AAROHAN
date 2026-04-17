import axios from 'axios';
import { getStoredToken } from '../context/AuthContext';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = getStoredToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const getApiErrorMessage = (error, fallback = 'Something went wrong. Please try again.') => {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.code === 'ERR_NETWORK') return 'Network error. Please check if backend is running on port 5000.';
  if (error?.code === 'ECONNABORTED') return 'Request timed out. Please try again.';
  return fallback;
};

const unwrap = async (request) => {
  const { data } = await request;
  return data;
};

export const fetchColleges = (params = {}) => unwrap(api.get('/colleges', { params }));
export const fetchRecommendations = (payload) => unwrap(api.post('/recommend', payload));
export const fetchFilteredColleges = (params = {}) => unwrap(api.get('/colleges/filter', { params }));
export const fetchComparedColleges = (colleges) => unwrap(api.post('/compare', { colleges }));
export const registerUser = (payload) => unwrap(api.post('/auth/register', payload));
export const loginUser = (payload) => unwrap(api.post('/auth/login', payload));
export const fetchFavorites = () => unwrap(api.get('/favorites'));
export const addFavorite = (collegeId) => unwrap(api.post('/favorites', { collegeId }));
export const removeFavorite = (collegeId) => unwrap(api.delete(`/favorites/${collegeId}`));
export const sendChatMessage = (payload) => unwrap(api.post('/chat', payload));
export const fetchCollegeDetails = (name) =>
  unwrap(api.get('/college-details', { params: { name } }));
export const fetchNearbyPlaces = (name) =>
  unwrap(api.get('/nearby', { params: { name } }));

// Backward-compatible aliases for older page variants that still exist in the repo.
export const getAllColleges = fetchColleges;
export const getRecommendations = fetchRecommendations;
export const getFilteredColleges = fetchFilteredColleges;
export const compareColleges = fetchComparedColleges;

export default api;
