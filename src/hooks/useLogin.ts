import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { LoginRequest } from '../types/auth';

interface UseLoginReturn {
  login: (credentials: LoginRequest) => Promise<void>;
  error: string | null;
  isLoading: boolean;
}

export const useLogin = (): UseLoginReturn => {
  const { login: setAuthUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (credentials: LoginRequest) => {
    try {
      setError(null);
      setIsLoading(true);

      const response = await authService.login(credentials);
      setAuthUser(response);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al iniciar sesión. Intenta de nuevo.';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [setAuthUser]);

  return { login, error, isLoading };
};
