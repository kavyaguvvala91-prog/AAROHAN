import axios from 'axios';
import { expireAuthSession, getStoredToken } from '../context/AuthContext';

const normalizeBaseUrl = (value, defaultValue = '') => {
  const baseUrl = String(value ?? defaultValue).trim();

  if (!baseUrl) return '';
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
};

const PRIMARY_API_BASE_URL = normalizeBaseUrl(
  import.meta.env.VITE_API_BASE_URL || import.meta.env.REACT_APP_API_URL,
  '/api'
);
const FALLBACK_API_BASE_URL = normalizeBaseUrl(
  import.meta.env.VITE_FALLBACK_API_BASE_URL || import.meta.env.REACT_APP_FALLBACK_API_URL
);
const API_TIMEOUT_MS = Number.parseInt(
  import.meta.env.VITE_API_TIMEOUT_MS || import.meta.env.REACT_APP_API_TIMEOUT_MS || '20000',
  10
);
const REQUEST_TIMEOUT_MS = Number.isFinite(API_TIMEOUT_MS) && API_TIMEOUT_MS > 0 ? API_TIMEOUT_MS : 20000;
const API_STATUS_EVENT = 'college-api-status-change';

let lastApiStatus = {
  source: 'primary',
  isFallbackConfigured: Boolean(FALLBACK_API_BASE_URL),
  baseURL: PRIMARY_API_BASE_URL,
  failedBaseURL: '',
  path: '',
};

const api = axios.create({
  baseURL: PRIMARY_API_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
});

const attachAuthHeader = (config = {}) => {
  const token = getStoredToken();
  const headers = {
    ...(config.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return {
    ...config,
    headers,
  };
};

api.interceptors.request.use((config) => attachAuthHeader(config));

const publishApiStatus = (status) => {
  lastApiStatus = {
    ...lastApiStatus,
    ...status,
    isFallbackConfigured: Boolean(FALLBACK_API_BASE_URL),
  };

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(API_STATUS_EVENT, {
        detail: lastApiStatus,
      })
    );
  }
};

const sleep = (durationMs) => new Promise((resolve) => setTimeout(resolve, durationMs));

const canRetrySameOrigin = (config = {}, error) => {
  const method = String(config.method || 'get').toLowerCase();
  const retryCount = Number(config.__retryCount || 0);

  if (retryCount >= 1) {
    return false;
  }

  if (!['get', 'head', 'options'].includes(method)) {
    return false;
  }

  return error?.code === 'ECONNABORTED';
};

const isAuthenticatedRequest = (config = {}) => {
  const authorizationHeader =
    config?.headers?.Authorization || config?.headers?.authorization || '';

  return String(authorizationHeader).startsWith('Bearer ');
};

const handleUnauthorizedResponse = (error) => {
  if (error?.response?.status !== 401) {
    return;
  }

  if (!isAuthenticatedRequest(error?.config)) {
    return;
  }

  expireAuthSession();
};

const shouldRetryWithFallback = (error) => {
  if (!FALLBACK_API_BASE_URL || FALLBACK_API_BASE_URL === PRIMARY_API_BASE_URL) {
    return false;
  }

  if (error?.config?.baseURL === FALLBACK_API_BASE_URL) {
    return false;
  }

  if (error?.code === 'ERR_NETWORK' || error?.code === 'ECONNABORTED') {
    return true;
  }

  return Boolean(error?.response?.status >= 500);
};

export const getApiErrorMessage = (error, fallback = 'Something went wrong. Please try again.') => {
  if (error?.response?.data?.message) return error.response.data.message;

  if (Array.isArray(error?.response?.data?.errors) && error.response.data.errors.length) {
    return error.response.data.errors
      .map((item) => item?.message)
      .filter(Boolean)
      .join(' ');
  }

  if (typeof error?.response?.data === 'string') {
    const normalizedBody = error.response.data.toLowerCase();
    const contentType = String(error?.response?.headers?.['content-type'] || '').toLowerCase();

    if (contentType.includes('text/html') || normalizedBody.includes('<html')) {
      return `The frontend reached a web page instead of the API. Check the deployed API URL configured for ${PRIMARY_API_BASE_URL || '/api'}.`;
    }
  }

  if (error?.response?.status === 404) {
    return `API endpoint not found. Check the deployed API URL configured for ${PRIMARY_API_BASE_URL || '/api'}.`;
  }

  if (error?.response?.status === 405) {
    return 'This API endpoint does not allow that request method. Check the frontend API base URL and backend routes.';
  }

  if (error?.code === 'ERR_NETWORK') {
    return FALLBACK_API_BASE_URL
      ? 'Network error. Both primary and fallback backends were unavailable.'
      : 'Network error. Please check if backend is running on the configured API URL.';
  }
  if (error?.code === 'ECONNABORTED') return 'Request timed out. Please try again.';
  return fallback;
};

const requestWithFallback = async (config, { allowFallback = false } = {}) => {
  try {
    const response = await api.request(config);

    publishApiStatus({
      source: 'primary',
      baseURL: response.config?.baseURL || PRIMARY_API_BASE_URL,
      failedBaseURL: '',
      path: response.config?.url || '',
    });

    return response;
  } catch (error) {
    if (canRetrySameOrigin(config, error)) {
      await sleep(800);

      return api.request({
        ...config,
        __retryCount: Number(config.__retryCount || 0) + 1,
      });
    }

    if (!allowFallback || !shouldRetryWithFallback(error)) {
      handleUnauthorizedResponse(error);
      throw error;
    }

    try {
      const response = await axios.request(
        attachAuthHeader({
          ...config,
          baseURL: FALLBACK_API_BASE_URL,
          timeout: config.timeout ?? api.defaults.timeout,
        })
      );

      publishApiStatus({
        source: 'fallback',
        baseURL: response.config?.baseURL || FALLBACK_API_BASE_URL,
        failedBaseURL: error?.config?.baseURL || PRIMARY_API_BASE_URL,
        path: response.config?.url || '',
      });

      return response;
    } catch (fallbackError) {
      handleUnauthorizedResponse(fallbackError);
      throw fallbackError;
    }
  }
};

const unwrap = async (config, options) => {
  const { data } = await requestWithFallback(config, options);
  return data;
};

export const fetchColleges = (params = {}) =>
  unwrap({ method: 'get', url: '/colleges', params }, { allowFallback: true });
export const fetchRecommendations = (payload) =>
  unwrap({ method: 'post', url: '/recommend', data: payload }, { allowFallback: true });
export const fetchFilteredColleges = (params = {}) =>
  unwrap({ method: 'get', url: '/colleges/filter', params }, { allowFallback: true });
export const fetchComparedColleges = (colleges) =>
  unwrap({ method: 'post', url: '/compare', data: { colleges } }, { allowFallback: true });
export const registerUser = (payload) =>
  unwrap({ method: 'post', url: '/auth/register', data: payload });
export const loginUser = (payload) =>
  unwrap({ method: 'post', url: '/auth/login', data: payload });
export const fetchFavorites = () => unwrap({ method: 'get', url: '/favorites' });
export const addFavorite = (collegeId) =>
  unwrap({ method: 'post', url: '/favorites', data: { collegeId } });
export const removeFavorite = (collegeId) =>
  unwrap({ method: 'delete', url: `/favorites/${collegeId}` });
export const sendChatMessage = (payload) =>
  unwrap({ method: 'post', url: '/chat', data: payload });
export const fetchCollegeDetails = (name) =>
  unwrap({ method: 'get', url: '/college-details', params: { name } }, { allowFallback: true });
export const fetchNearbyPlaces = (name) =>
  unwrap({ method: 'get', url: '/nearby', params: { name } }, { allowFallback: true });

export const getApiStatus = () => ({
  ...lastApiStatus,
  primaryBaseURL: PRIMARY_API_BASE_URL,
  fallbackBaseURL: FALLBACK_API_BASE_URL,
});

export const subscribeToApiStatus = (callback) => {
  if (typeof window === 'undefined' || typeof callback !== 'function') {
    return () => {};
  }

  const handler = (event) => {
    callback(event.detail);
  };

  window.addEventListener(API_STATUS_EVENT, handler);

  return () => {
    window.removeEventListener(API_STATUS_EVENT, handler);
  };
};

// Backward-compatible aliases for older page variants that still exist in the repo.
export const getAllColleges = fetchColleges;
export const getRecommendations = fetchRecommendations;
export const getFilteredColleges = fetchFilteredColleges;
export const compareColleges = fetchComparedColleges;

export default api;
