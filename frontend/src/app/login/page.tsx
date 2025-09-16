
'use client';
import LoginForm from '../../components/LoginForm';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-blue-50">
      <div className="bg-white shadow-md rounded-xl p-8 w-full max-w-md flex flex-col gap-6 border border-gray-200">
        <h2 className="text-2xl font-bold text-center text-gray-800">Sign In</h2>
        <LoginForm />
        <div className="text-center text-sm text-gray-700">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-blue-700 hover:underline font-semibold">Register</Link>
        </div>
      </div>
    </div>
  );
}