import { API_URL } from '../utils/api';

export interface MerchantPayload {
  userId: string;
  merchant_id: string;
  display_name: string;
  logo_url: string;
}

export async function registerMerchant(payload: MerchantPayload, token: string) {
  const res = await fetch(`${API_URL}/merchant`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to register merchant');
  return res.json();
}