"use client";
import { useUserStore } from "../stores/userStore";
import { useMerchantStore } from "../stores/merchantStore";

export default function Page() {
  const user = useUserStore((state) => state.user);
  const merchant = useMerchantStore((state) => state.merchant);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-blue-50">
      <div className="bg-white shadow-md rounded-xl p-8 w-full max-w-md flex flex-col gap-6 border border-gray-200 text-center">
        <h1 className="text-3xl font-bold text-blue-700 mb-4">
          {merchant?.display_name
            ? `Hello, ${merchant.display_name}!`
            : user
            ? `Welcome, ${user.email}!`
            : "Welcome!"}
        </h1>
        <p className="text-gray-700">This is your dashboard.</p>
      </div>
    </div>
  );
}