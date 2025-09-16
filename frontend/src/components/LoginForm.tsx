import { useState } from 'react';
import { useLogin } from '../hooks/useLogin';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { handleLogin, loading, error } = useLogin();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleLogin({ email, password });
    // Redirecionar ou mostrar mensagem de sucesso
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6 w-full">
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Email"
        className="border border-gray-300 p-3 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-base w-full shadow-sm"
      />
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="Password"
        className="border border-gray-300 p-3 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-base w-full shadow-sm"
      />
      <button
        type="submit"
        className="bg-blue-700 hover:bg-blue-800 text-white py-3 rounded-lg font-semibold transition-all duration-150 disabled:opacity-60 shadow-md text-base"
        disabled={loading}
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>
      {error && <p className="text-center text-red-600 font-semibold mt-2 animate-pulse">{error}</p>}
    </form>
  );
}