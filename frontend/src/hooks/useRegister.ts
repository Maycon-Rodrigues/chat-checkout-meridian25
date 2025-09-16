import { useState } from 'react';
import { registerUser } from '../services/userService';
import { login } from '../services/authService';
import { useAuthStore } from '../stores/authStore';
import { useUserStore } from '../stores/userStore';
import { RegisterPayload } from '../stores/userTypes';
import { useRouter } from 'next/navigation';

export function useRegister() {
  const setUser = useUserStore((state) => state.setUser);
  const setTokens = useAuthStore((state) => state.setTokens);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleRegister = async (payload: RegisterPayload) => {
    setLoading(true);
    setError(null);
    try {
      const user = await registerUser(payload);
      setUser(user);
      const auth = await login({ email: payload.email, password: payload.password });
      setTokens(auth.access_token, auth.refresh_token);
      router.push('/register/merchant');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return { handleRegister, loading, error };
}