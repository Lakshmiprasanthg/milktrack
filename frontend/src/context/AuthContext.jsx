/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useCallback } from 'react';

export const AuthContext = createContext();

const readStoredAuth = () => {
  if (typeof window === 'undefined') {
    return { admin: null, token: null };
  }

  const token = localStorage.getItem('token');
  const admin = localStorage.getItem('admin');

  if (!token || !admin) {
    return { admin: null, token: null };
  }

  try {
    return { token, admin: JSON.parse(admin) };
  } catch {
    return { admin: null, token: null };
  }
};

export const AuthProvider = ({ children }) => {
  const initialAuth = readStoredAuth();
  const [admin, setAdmin] = useState(initialAuth.admin);
  const [token, setToken] = useState(initialAuth.token);
  const [loading] = useState(false);

  const login = useCallback((data) => {
    const { admin: adminData, token: authToken } = data;
    setAdmin(adminData);
    setToken(authToken);
    localStorage.setItem('token', authToken);
    localStorage.setItem('admin', JSON.stringify(adminData));
  }, []);

  const logout = useCallback(() => {
    setAdmin(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
  }, []);

  const value = {
    admin,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
