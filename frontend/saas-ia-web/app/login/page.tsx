'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.elyonos.com.br';

function getErrorMessage(error: unknown, fallback: string) {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as { response?: unknown }).response === 'object'
  ) {
    const response = (error as {
      response?: {
        data?: {
          message?: string | string[];
        };
      };
    }).response;

    const message = response?.data?.message;

    if (Array.isArray(message)) {
      return message.join(', ');
    }

    if (typeof message === 'string' && message.trim()) {
      return message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      router.replace('/dashboard');
    }
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        API_URL + '/v1/auth/login',
        { email, password },
        { withCredentials: true }
      );

      const accessToken = response.data?.access_token;

      if (!accessToken) {
        throw new Error('Token de acesso não retornado.');
      }

      localStorage.setItem('access_token', accessToken);
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Não foi possível entrar na plataforma.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#07080d] px-6 py-10 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-[36px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.18),transparent_28%),linear-gradient(180deg,rgba(12,13,20,0.98),rgba(7,8,13,0.98))] shadow-[0_30px_120px_rgba(0,0,0,0.35)] lg:grid-cols-[1.15fr_0.85fr]">
          <section className="flex flex-col justify-between border-b border-white/10 p-8 lg:border-b-0 lg:border-r lg:p-10">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-[11px] uppercase tracking-[0.28em] text-zinc-300">
                <span className="h-2 w-2 rounded-full bg-violet-300 shadow-[0_0_18px_rgba(196,181,253,0.9)]" />
                Elyon OS
              </div>

              <h1 className="mt-8 max-w-xl text-4xl font-semibold tracking-[-0.06em] text-white md:text-6xl">
                Access the operating layer behind your company.
              </h1>

              <p className="mt-6 max-w-lg text-base leading-8 text-zinc-400">
                Sign in to reach finance, CRM, automations and the executive command
                center in one workspace.
              </p>
            </div>

            <div className="mt-10 grid gap-3 text-sm text-zinc-300 md:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Finance</div>
                <div className="mt-2 font-medium text-white">Treasury, AP/AR and control</div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">CRM</div>
                <div className="mt-2 font-medium text-white">Guided selling and pipeline ops</div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">AI</div>
                <div className="mt-2 font-medium text-white">Operational copilots and automation</div>
              </div>
            </div>
          </section>

          <section className="p-8 lg:p-10">
            <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <div className="text-sm uppercase tracking-[0.24em] text-zinc-500">Login</div>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">
                Enter Elyon OS
              </h2>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Use your company credentials to access the platform.
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                <div>
                  <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-zinc-500">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-violet-400/40"
                    placeholder="you@company.com"
                    autoComplete="email"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-zinc-500">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-violet-400/40"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
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
                  className="w-full rounded-full bg-[linear-gradient(135deg,#f5f3ff,#b197fc)] px-6 py-3.5 text-sm font-semibold text-[#12081d] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? 'Signing in...' : 'Login'}
                </button>
              </form>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-zinc-500">
                <Link href="/" className="text-zinc-400 transition hover:text-white">
                  Back to home
                </Link>
                <Link
                  href="mailto:contato@elyonos.com.br"
                  className="text-zinc-400 transition hover:text-white"
                >
                  Need access?
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
