'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';

const API_URL = 'http://localhost:3000';

type MeResponse = {
  id: string;
  role: string;
  companyId?: string | null;
  branchId?: string | null;
  departmentId?: string | null;
};

type UserItem = {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
};

type BranchItem = {
  id: string;
  name: string;
  companyId: string;
  createdAt?: string;
};

type DepartmentItem = {
  id: string;
  name: string;
  companyId: string;
  branchId: string;
  createdAt?: string;
};

export default function Page() {
  const [me, setMe] = useState<MeResponse | null>(null);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [branches, setBranches] = useState<BranchItem[]>([]);
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadCompanyView() {
    const token = localStorage.getItem('access_token');

    if (!token) {
      setError('Token não encontrado.');
      setLoading(false);
      return;
    }

    try {
      const [meRes, usersRes, branchesRes, departmentsRes] = await Promise.all([
        axios.get(API_URL + '/v1/auth/me', {
          headers: { Authorization: 'Bearer ' + token },
        }),
        axios.get(API_URL + '/v1/users', {
          headers: { Authorization: 'Bearer ' + token },
        }),
        axios.get(API_URL + '/v1/branches', {
          headers: { Authorization: 'Bearer ' + token },
        }),
        axios.get(API_URL + '/v1/departments', {
          headers: { Authorization: 'Bearer ' + token },
        }),
      ]);

      setMe(meRes.data);
      setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
      setBranches(Array.isArray(branchesRes.data) ? branchesRes.data : []);
      setDepartments(Array.isArray(departmentsRes.data) ? departmentsRes.data : []);
      setError('');
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Falha ao carregar módulo de empresas.';
      setError(Array.isArray(msg) ? msg.join(', ') : String(msg));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCompanyView();
  }, []);

  const stats = useMemo(() => {
    const activeUsers = users.filter((user) => user.isActive).length;
    const inactiveUsers = users.filter((user) => !user.isActive).length;

    return {
      totalUsers: users.length,
      activeUsers,
      inactiveUsers,
      totalBranches: branches.length,
      totalDepartments: departments.length,
    };
  }, [users, branches, departments]);

  if (loading) {
    return (
      <div className="rounded-[32px] border border-white/10 bg-[#111113] p-6 shadow-[0_0_60px_rgba(59,255,140,0.05)]">
        <div className="text-sm text-zinc-300">Carregando visão da empresa...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[32px] border border-red-500/20 bg-red-500/10 p-6 shadow-[0_0_60px_rgba(59,255,140,0.05)]">
        <div className="text-sm text-red-300">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
        <div className="rounded-3xl border border-white/10 bg-[#111113] p-5">
          <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">
            Tenant ativo
          </div>
          <div className="mt-4 break-all text-lg font-semibold text-white">
            {me?.companyId || 'N/A'}
          </div>
          <div className="mt-2 text-sm text-zinc-400">
            Empresa atualmente carregada no token
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#111113] p-5">
          <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">
            Usuários
          </div>
          <div className="mt-4 text-3xl font-semibold text-white">
            {stats.totalUsers}
          </div>
          <div className="mt-2 text-sm text-zinc-400">
            {stats.activeUsers} ativos na empresa
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#111113] p-5">
          <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">
            Filiais
          </div>
          <div className="mt-4 text-3xl font-semibold text-white">
            {stats.totalBranches}
          </div>
          <div className="mt-2 text-sm text-zinc-400">
            Estrutura física cadastrada
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#111113] p-5">
          <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">
            Departamentos
          </div>
          <div className="mt-4 text-3xl font-semibold text-white">
            {stats.totalDepartments}
          </div>
          <div className="mt-2 text-sm text-zinc-400">
            Setores organizados no tenant
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <div className="rounded-[32px] border border-white/10 bg-[#111113] p-6 shadow-[0_0_60px_rgba(59,255,140,0.05)]">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-zinc-300">
                  Resumo da empresa
                </div>
                <div className="mt-1 text-xs text-zinc-500">
                  visão consolidada do tenant conectado
                </div>
              </div>

              <div className="rounded-full border border-[#3BFF8C]/20 bg-[#3BFF8C]/10 px-4 py-2 text-xs text-[#A9FFC9]">
                ativo
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                <div className="text-sm font-medium text-white">
                  Identidade operacional
                </div>

                <div className="mt-5 space-y-3 text-sm text-zinc-400">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    Perfil atual: <span className="text-white">{me?.role || 'N/A'}</span>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    Tenant atual: <span className="break-all text-white">{me?.companyId || 'N/A'}</span>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    Usuários ativos: <span className="text-white">{stats.activeUsers}</span>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    Usuários inativos: <span className="text-white">{stats.inactiveUsers}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(59,255,140,0.18),transparent_45%),#0F1012] p-5">
                <div className="text-sm font-medium text-white">
                  Estrutura empresarial
                </div>

                <div className="mt-5 space-y-4">
                  <div>
                    <div className="mb-2 flex items-center justify-between text-xs text-zinc-400">
                      <span>Filiais registradas</span>
                      <span>{stats.totalBranches}</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10">
                      <div
                        className="h-2 rounded-full bg-[#3BFF8C]"
                        style={{ width: Math.max(12, Math.min(100, stats.totalBranches * 20)) + '%' }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between text-xs text-zinc-400">
                      <span>Departamentos</span>
                      <span>{stats.totalDepartments}</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10">
                      <div
                        className="h-2 rounded-full bg-[#3BFF8C]"
                        style={{ width: Math.max(12, Math.min(100, stats.totalDepartments * 12)) + '%' }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between text-xs text-zinc-400">
                      <span>Usuários ativos</span>
                      <span>{stats.activeUsers}</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10">
                      <div
                        className="h-2 rounded-full bg-[#3BFF8C]"
                        style={{
                          width: users.length
                            ? Math.max(12, (stats.activeUsers / users.length) * 100) + '%'
                            : '12%',
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-zinc-300">
                  Esta página usa somente dados reais já disponíveis no backend.
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-[32px] border border-white/10 bg-[#111113] p-6 shadow-[0_0_60px_rgba(59,255,140,0.05)]">
            <div className="mb-6 text-sm font-medium text-zinc-300">
              Últimas filiais cadastradas
            </div>

            {branches.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm text-zinc-300">
                Nenhuma filial encontrada.
              </div>
            ) : (
              <div className="space-y-3">
                {branches.slice(0, 5).map((branch) => (
                  <div
                    key={branch.id}
                    className="rounded-3xl border border-white/10 bg-black/20 p-4"
                  >
                    <div className="text-sm font-medium text-white">{branch.name}</div>
                    <div className="mt-1 break-all text-xs text-zinc-500">{branch.id}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="xl:col-span-4">
          <div className="rounded-[32px] border border-white/10 bg-[#111113] p-5 shadow-[0_0_60px_rgba(59,255,140,0.04)]">
            <div className="mb-4 text-sm font-medium text-white">
              Ações relacionadas
            </div>

            <div className="space-y-3">
              <Link
                href="/dashboard/users"
                className="block rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:bg-white/5"
              >
                <div className="text-xs text-zinc-500">Gestão</div>
                <div className="mt-1 text-sm font-medium text-white">
                  Abrir usuários
                </div>
              </Link>

              <Link
                href="/dashboard/branches"
                className="block rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:bg-white/5"
              >
                <div className="text-xs text-zinc-500">Estrutura</div>
                <div className="mt-1 text-sm font-medium text-white">
                  Abrir filiais
                </div>
              </Link>

              <Link
                href="/dashboard/departments"
                className="block rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:bg-white/5"
              >
                <div className="text-xs text-zinc-500">Estrutura</div>
                <div className="mt-1 text-sm font-medium text-white">
                  Abrir departamentos
                </div>
              </Link>

              <Link
                href="/dashboard/audit"
                className="block rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:bg-white/5"
              >
                <div className="text-xs text-zinc-500">Compliance</div>
                <div className="mt-1 text-sm font-medium text-white">
                  Abrir auditoria
                </div>
              </Link>
            </div>

            <div className="mt-5 rounded-3xl border border-white/10 bg-black/20 p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                Snapshot do tenant
              </div>

              <div className="mt-4 space-y-3 text-sm text-zinc-300">
                <div className="flex items-center justify-between">
                  <span>Role atual</span>
                  <span>{me?.role || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Tenant ativo</span>
                  <span>{me?.companyId ? 'Sim' : 'Não'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Filial vinculada</span>
                  <span>{me?.branchId ? 'Sim' : 'Não'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Departamento vinculado</span>
                  <span>{me?.departmentId ? 'Sim' : 'Não'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
