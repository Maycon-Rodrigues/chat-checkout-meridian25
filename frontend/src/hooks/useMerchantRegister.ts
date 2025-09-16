import { useState } from 'react';
import { registerMerchant, MerchantPayload } from '../services/merchantService';
import { useAuthStore } from '../stores/authStore';
import { useUserStore } from '../stores/userStore';

export function useMerchantRegister() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useUserStore((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMerchantRegister = async (payload: Omit<MerchantPayload, 'userId'>) => {
    setLoading(true);
    setError(null);
    try {
      const merchant = await registerMerchant({ ...payload, userId: user?.id || '' }, accessToken!);
      return merchant;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to register merchant');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { handleMerchantRegister, loading, error };
}