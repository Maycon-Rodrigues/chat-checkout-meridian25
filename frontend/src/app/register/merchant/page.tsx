'use client';
import MerchantForm from '../../../components/MerchantForm';

export default function MerchantPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-blue-50">
      <div className="bg-white shadow-md rounded-xl p-8 w-full max-w-md flex flex-col gap-6 border border-gray-200">
        <h2 className="text-2xl font-bold text-center text-gray-800">Seller Information</h2>
        <MerchantForm />
      </div>
    </div>
  );
}
