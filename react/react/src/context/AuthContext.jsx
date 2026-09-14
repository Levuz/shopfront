import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const persist = (data) => {
    localStorage.setItem('access', data.access);
    localStorage.setItem('refresh', data.refresh);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const login = useCallback(async (username, password) => {
    const { data } = await api.post('/auth/login/', { username, password });
    persist(data);
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    await api.post('/auth/register/', payload);
    return login(payload.username, payload.password);
  }, [login]);

  const logout = useCallback(() => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const isAuthenticated = !!user;
  const isAdmin = !!user?.is_admin || !!user?.is_staff;

  const value = useMemo(
    () => ({ user, setUser, login, register, logout, isAuthenticated, isAdmin }),
    [user, login, register, logout, isAuthenticated, isAdmin]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};