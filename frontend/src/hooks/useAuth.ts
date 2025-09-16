import { useAuthStore } from '../stores/authStore';
import { login, refreshToken, LoginPayload } from '../services/authService';
import { useState } from 'react';

export function useAuth() {
  const { setTokens, logout, accessToken, refreshToken: refreshTokenValue } = useAuthStore();
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

  const handleRefresh = async () => {
    if (!refreshTokenValue) return;
    setLoading(true);
    try {
      const { access_token } = await refreshToken(refreshTokenValue);
      setTokens(access_token, refreshTokenValue);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Refresh failed');
      }
      logout();
    } finally {
      setLoading(false);
    }
  };

  return { accessToken, handleLogin, handleRefresh, logout, loading, error };
}