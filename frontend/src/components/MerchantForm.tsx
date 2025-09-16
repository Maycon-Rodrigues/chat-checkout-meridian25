import { useState } from 'react';
import { useMerchantRegister } from '../hooks/useMerchantRegister';
import { useMerchantStore } from '../stores/merchantStore';
import { getMerchant } from '../services/getMerchantService';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

const MerchantForm = () => {
  const [merchant_id, setMerchantId] = useState('');
  const [display_name, setDisplayName] = useState('');
  const [logo_url, setLogoUrl] = useState('');
  const { handleMerchantRegister, loading, error } = useMerchantRegister();
  const setMerchant = useMerchantStore((state) => state.setMerchant);
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const accessToken = useAuthStore((state) => state.accessToken);
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    try {
  const merchant = await handleMerchantRegister({ merchant_id, display_name, logo_url });
      if (!error && merchant && merchant.id) {
        const merchantData = await getMerchant(merchant.id, accessToken!);
        setMerchant(merchantData);
        router.push('/');
      } else {
        setSubmitError(error || 'Failed to register merchant');
      }
    } catch (err) {
      setSubmitError(error || 'Failed to register merchant');
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="text-gray-700 text-center mb-2 text-base font-medium">
        Now fill in your seller information
      </div>
      <form onSubmit={onSubmit} className="flex flex-col gap-6 w-full">
        <input
          type="text"
          value={merchant_id}
          onChange={e => setMerchantId(e.target.value)}
          placeholder="CPF or International ID"
          className="border border-gray-300 p-3 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-base w-full shadow-sm"
        />
        <input
          type="text"
          value={display_name}
          onChange={e => setDisplayName(e.target.value)}
          placeholder="Business Name"
          className="border border-gray-300 p-3 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-base w-full shadow-sm"
        />
        <input
          type="text"
          value={logo_url}
          onChange={e => setLogoUrl(e.target.value)}
          placeholder="Logo URL"
          className="border border-gray-300 p-3 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-base w-full shadow-sm"
        />
        <button
          type="submit"
          className="bg-blue-700 hover:bg-blue-800 text-white py-3 rounded-lg font-semibold transition-all duration-150 disabled:opacity-60 shadow-md text-base"
          disabled={loading}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
        {(error || submitError) && <p className="text-center text-red-600 font-semibold mt-2 animate-pulse">{error || submitError}</p>}
      </form>
    </div>
  );
};

export default MerchantForm;