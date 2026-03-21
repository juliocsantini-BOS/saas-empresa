'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const API_URL = 'http://localhost:3000';

export default function Home() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setError('');

    try {
      const res = await axios.post(API_URL + '/v1/auth/login', {
        email: email,
        password: password,
      });

      const token = res.data?.access_token;

      if (!token) {
        throw new Error('Token não retornado');
      }

      localStorage.setItem('access_token', token);
      router.push('/dashboard');
    } catch (err: unknown) {
      const maybeAxios = err as {
        response?: { data?: { message?: string | string[] } };
        message?: string;
      };
      const msg =
        maybeAxios?.response?.data?.message ||
        maybeAxios?.message ||
        'Falha ao fazer login';

      setError(Array.isArray(msg) ? msg.join(', ') : String(msg));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0B0B0C] text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-[#111113] p-8 shadow-[0_0_60px_rgba(139,92,246,0.06)]">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#8B5CF6]/15 shadow-[0_0_30px_rgba(139,92,246,0.18)]">
            <div className="h-6 w-6 rounded-full bg-[#8B5CF6]" />
          </div>

          <h1 className="text-3xl font-bold tracking-tight">
            ELYON OS
          </h1>

          <p className="mt-2 text-sm text-zinc-400">
            Sistema operacional empresarial com inteligência artificial
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm text-zinc-400">
              E-mail
            </label>
            <input
              type="email"
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-[#8B5CF6]/40"
              placeholder="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-400">
              Senha
            </label>
            <input
              type="password"
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-[#8B5CF6]/40"
              placeholder="senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error ? (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-white px-4 py-3 font-semibold text-black transition hover:bg-zinc-200 disabled:opacity-60"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </main>
  );
}
