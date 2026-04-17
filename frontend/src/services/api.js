import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

export const getApiErrorMessage = (error, fallback = 'Something went wrong. Please try again.') => {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.code === 'ERR_NETWORK') return 'Network error. Please check if backend is running on port 5000.';
  if (error?.code === 'ECONNABORTED') return 'Request timed out. Please try again.';
  return fallback;
};

export const fetchColleges = async () => {
  const { data } = await api.get('/colleges');
  return data;
};

export const fetchRecommendations = async (payload) => {
  const { data } = await api.post('/recommend', payload);
  return data;
};

export const fetchFilteredColleges = async (params) => {
  const { data } = await api.get('/colleges/filter', { params });
  return data;
};

export const fetchComparedColleges = async (colleges) => {
  const { data } = await api.post('/compare', { colleges });
  return data;
};

export default api;
