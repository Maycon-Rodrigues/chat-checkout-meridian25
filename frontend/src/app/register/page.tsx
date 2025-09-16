'use client';
import RegisterForm from '../../components/RegisterForm';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-blue-50">
      <div className="bg-white shadow-md rounded-xl p-8 w-full max-w-md flex flex-col gap-6 border border-gray-200">
        <RegisterForm />
        <div className="text-center text-sm text-gray-700">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-700 hover:underline font-semibold">Sign In</Link>
        </div>
      </div>
    </div>
  );
}