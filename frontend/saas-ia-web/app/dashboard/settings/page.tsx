'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.elyonos.com.br';

type MeResponse = {
  id: string;
  role: string;
  companyId?: string | null;
  branchId?: string | null;
  departmentId?: string | null;
};

export default function Page() {
  const router = useRouter();

  const [user, setUser] = useState<MeResponse | null>(null);
  const [backendStatus, setBackendStatus] = useState<'online' | 'offline'>('offline');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadData() {
    const token = localStorage.getItem('access_token');

    if (!token) {
      router.push('/');
      return;
    }

    try {
      const res = await axios.get(API_URL + '/v1/auth/me', {
        headers: {
          Authorization: 'Bearer ' + token,
        },
      });

      setUser(res.data);
      setBackendStatus('online');
      setError('');
    } catch (err: any) {
      setBackendStatus('offline');
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Falha ao carregar configurações.';
      setError(Array.isArray(msg) ? msg.join(', ') : String(msg));
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem('access_token');
    router.push('/');
  }

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="rounded-[32px] border border-white/10 bg-[#111113] p-6 shadow-[0_0_60px_rgba(139,92,246,0.05)]">
        <div className="text-sm text-zinc-300">Carregando configurações...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[32px] border border-red-500/20 bg-red-500/10 p-6 shadow-[0_0_60px_rgba(139,92,246,0.05)]">
        <div className="text-sm text-red-300">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
        <div className="rounded-3xl border border-white/10 bg-[#111113] p-5">
          <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Usuário</div>
          <div className="mt-4 break-all text-sm text-white">{user?.id || 'N/A'}</div>
          <div className="mt-2 text-sm text-zinc-400">Sessão autenticada no painel</div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#111113] p-5">
          <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Role</div>
          <div className="mt-4 text-3xl font-semibold text-[#8B5CF6]">
            {user?.role || 'N/A'}
          </div>
          <div className="mt-2 text-sm text-zinc-400">Perfil atual carregado</div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#111113] p-5">
          <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Tenant</div>
          <div className="mt-4 break-all text-sm text-white">{user?.companyId || 'Nenhum'}</div>
          <div className="mt-2 text-sm text-zinc-400">Empresa vinculada ao token</div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#111113] p-5">
          <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Backend</div>
          <div className="mt-4">
            {backendStatus === 'online' ? (
              <span className="rounded-full border border-[#8B5CF6]/20 bg-[#8B5CF6]/10 px-3 py-1 text-xs text-[#D8B4FE]">
                online
              </span>
            ) : (
              <span className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs text-red-300">
                offline
              </span>
            )}
          </div>
          <div className="mt-2 text-sm text-zinc-400">Status atual da conexão</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <div className="rounded-[32px] border border-white/10 bg-[#111113] p-6 shadow-[0_0_60px_rgba(139,92,246,0.05)]">
            <div className="mb-6">
              <div className="text-lg font-semibold text-white">Informações da sessão</div>
              <div className="mt-1 text-sm text-zinc-500">
                Dados carregados do usuário autenticado no sistema
              </div>
            </div>

            <div className="space-y-3 text-sm text-zinc-300">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span>Role</span>
                <span>{user?.role || 'N/A'}</span>
              </div>

              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span>Empresa</span>
                <span className="max-w-[55%] break-all text-right">
                  {user?.companyId || 'Nenhuma vinculada'}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span>Filial</span>
                <span className="max-w-[55%] break-all text-right">
                  {user?.branchId || 'Nenhuma'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span>Departamento</span>
                <span className="max-w-[55%] break-all text-right">
                  {user?.departmentId || 'Nenhum'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-[32px] border border-white/10 bg-[#111113] p-6 shadow-[0_0_60px_rgba(139,92,246,0.05)]">
            <div className="mb-6">
              <div className="text-lg font-semibold text-white">Parâmetros atuais</div>
              <div className="mt-1 text-sm text-zinc-500">
                Base administrativa do ambiente carregado
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Segurança</div>
                <div className="mt-4 text-2xl font-semibold text-white">Ativa</div>
                <div className="mt-2 text-sm text-zinc-400">Autenticação e sessão válidas</div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Ambiente</div>
                <div className="mt-4 text-2xl font-semibold text-white">Local</div>
                <div className="mt-2 text-sm text-zinc-400">Execução do frontend em desenvolvimento</div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">API</div>
                <div className="mt-4 text-2xl font-semibold text-white">3000</div>
                <div className="mt-2 text-sm text-zinc-400">Backend conectado em localhost</div>
              </div>
            </div>
          </div>
        </div>

        <div className="xl:col-span-4">
          <div className="rounded-[32px] border border-white/10 bg-[#111113] p-5 shadow-[0_0_60px_rgba(59,255,140,0.04)]">
            <div className="mb-4 text-sm font-medium text-white">Segurança</div>

            <div className="space-y-3">
              <button
                onClick={logout}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition hover:bg-white/10"
              >
                Encerrar sessão
              </button>
            </div>

            <div className="mt-5 rounded-3xl border border-white/10 bg-black/20 p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                Snapshot
              </div>

              <div className="mt-4 space-y-3 text-sm text-zinc-300">
                <div className="flex items-center justify-between">
                  <span>Backend</span>
                  <span>{backendStatus}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Tenant ativo</span>
                  <span>{user?.companyId ? 'Sim' : 'Não'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Filial definida</span>
                  <span>{user?.branchId ? 'Sim' : 'Não'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Departamento definido</span>
                  <span>{user?.departmentId ? 'Sim' : 'Não'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
