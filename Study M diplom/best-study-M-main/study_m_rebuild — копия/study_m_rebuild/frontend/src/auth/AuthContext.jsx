import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      const token = localStorage.getItem('study_m_token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get('/users/me');
        setUser(data);
      } catch {
        localStorage.removeItem('study_m_token');
      } finally {
        setLoading(false);
      }
    }
    restoreSession();
  }, []);

  async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('study_m_token', data.access_token);
    setUser(data.user);
    return data.user;
  }

  async function register(payload) {
    return api.post('/auth/register', payload);
  }

  function logout() {
    localStorage.removeItem('study_m_token');
    setUser(null);
  }

  const value = useMemo(() => ({ user, loading, login, register, logout }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
