import { create } from 'zustand';

export interface Merchant {
  id: string;
  display_name: string;
  description: string;
  logo_url: string;
}

interface MerchantState {
  merchant: Merchant | null;
  setMerchant: (merchant: Merchant) => void;
}

export const useMerchantStore = create<MerchantState>((set) => ({
  merchant: null,
  setMerchant: (merchant) => set({ merchant }),
}));
