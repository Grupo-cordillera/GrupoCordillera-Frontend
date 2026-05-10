import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { User, AuthContextType, LoginResponse } from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem('authToken')
  );
  const [loading, setLoading] = useState(false);

  const login = useCallback((response: LoginResponse) => {
    const userData: User = {
      nombre: response.nombre,
      correo: response.correo,
      direccion: response.direccion,
      telefono: response.telefono,
      rol: response.rol,
    };

    setUser(userData);
    setToken(response.jwt);
    localStorage.setItem('authToken', response.jwt);
    localStorage.setItem('user', JSON.stringify(userData));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }, []);

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    login,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
