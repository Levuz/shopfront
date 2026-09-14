import axios from 'axios';

export const BASE_URL =
  import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
});

/* ------------------------------------------------ request interceptor */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

/* ----------------------------------------------- response interceptor */
let refreshPromise = null;

function forceLogout() {
  localStorage.removeItem('access');
  localStorage.removeItem('refresh');
  localStorage.removeItem('user');
  if (!window.location.pathname.startsWith('/login')) {
    window.location.replace('/login');
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config || {};
    const status = error.response?.status;
    const url = original.url || '';

    const isAuthCall =
      url.includes('/auth/login') ||
      url.includes('/auth/refresh') ||
      url.includes('/auth/register');

    if (status === 401 && !original._retry && !isAuthCall) {
      const refresh = localStorage.getItem('refresh');
      if (!refresh) {
        forceLogout();
        return Promise.reject(error);
      }

      original._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = axios
            .post(`${BASE_URL}/auth/refresh/`, { refresh })
            .then((res) => {
              localStorage.setItem('access', res.data.access);
              if (res.data.refresh) {
                localStorage.setItem('refresh', res.data.refresh);
              }
              return res.data.access;
            })
            .finally(() => {
              refreshPromise = null;
            });
        }

        const newAccess = await refreshPromise;
        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${newAccess}`;
        return api(original);
      } catch (refreshError) {
        forceLogout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;