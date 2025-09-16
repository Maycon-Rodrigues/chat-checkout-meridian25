import { useState } from 'react';
import { login } from '../services/authService';
import { useAuthStore } from '../stores/authStore';
import { LoginPayload } from '../services/authService';

export function useLogin() {
  const setTokens = useAuthStore((state) => state.setTokens);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (payload: LoginPayload) => {
    setLoading(true);
    setError(null);
    try {
      const { access_token, refresh_token } = await login(payload);
      setTokens(access_token, refresh_token);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return { handleLogin, loading, error };
}