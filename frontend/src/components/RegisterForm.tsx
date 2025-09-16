import { useState } from 'react';
import { useRegister } from '../hooks/useRegister';

export default function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { handleRegister, loading, error } = useRegister();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleRegister({ email, password });
  };

  return (
    <>
      <h2 className="text-2xl font-bold text-center text-gray-800">Create Account</h2>
      <div className="text-gray-700 text-center mb-2 text-base font-medium">
        To get started, enter your email and password
      </div>
      <form onSubmit={onSubmit} className="flex flex-col gap-4 w-full">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email"
          className="border border-gray-300 p-2 rounded text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Password"
          className="border border-gray-300 p-2 rounded text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
        <button
          type="submit"
          className="bg-blue-700 hover:bg-blue-800 text-white py-2 rounded font-semibold transition-colors duration-150 disabled:opacity-60"
          disabled={loading}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
        {error && <p className="text-center text-red-600 font-medium">{error}</p>}
      </form>
    </>
  );
}