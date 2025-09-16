import { API_URL } from '../utils/api';

export async function getMerchant(id: string, token: string) {
  const res = await fetch(`${API_URL}/merchant/${id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Failed to fetch merchant');
  return res.json();
}
