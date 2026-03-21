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

type CompanyProfile = {
  id: string;
  name: string;
  sector?: string | null;
  teamSize?: string | null;
  operationModel?: string | null;
  hasInventory?: string | null;
  salesModel?: string | null;
  financeMaturity?: string | null;
  multiUnit?: string | null;
  mainGoal?: string | null;
  createdAt: string;
};

type UserItem = {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  branchId?: string | null;
  departmentId?: string | null;
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

export default function Page() {
  const [me, setMe] = useState<MeResponse | null>(null);
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [branches, setBranches] = useState<BranchItem[]>([]);
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadCompanyView() {
      const token = localStorage.getItem('access_token');

      if (!token) {
        setError('Token nao encontrado.');
        setLoading(false);
        return;
      }

      try {
        const [meRes, companyRes, usersRes, branchesRes, departmentsRes] = await Promise.all([
          axios.get(API_URL + '/v1/auth/me', {
            headers: { Authorization: 'Bearer ' + token },
          }),
          axios.get(API_URL + '/v1/company/current', {
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
        setCompany(companyRes.data ?? null);
        setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
        setBranches(Array.isArray(branchesRes.data) ? branchesRes.data : []);
        setDepartments(Array.isArray(departmentsRes.data) ? departmentsRes.data : []);
        setError('');
      } catch (err: unknown) {
        setError(getErrorMessage(err, 'Falha ao carregar modulo de empresas.'));
      } finally {
        setLoading(false);
      }
    }

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
      usersPerBranch: branches.length
        ? Number((users.length / branches.length).toFixed(1))
        : 0,
      departmentsPerBranch: branches.length
        ? Number((departments.length / branches.length).toFixed(1))
        : 0,
      activeRate: users.length ? Math.round((activeUsers / users.length) * 100) : 0,
    };
  }, [users, branches, departments]);

  const branchSnapshots = useMemo(() => {
    return branches.slice(0, 6).map((branch) => {
      const branchUsers = users.filter((user) => user.branchId === branch.id);
      const branchDepartments = departments.filter(
        (department) => department.branchId === branch.id
      );

      return {
        ...branch,
        userCount: branchUsers.length,
        departmentCount: branchDepartments.length,
      };
    });
  }, [branches, departments, users]);

  const readinessItems = useMemo(() => {
    return [
      {
        label: 'Governanca organizacional',
        value: branches.length > 0 && departments.length > 0 ? 'Ativa' : 'Parcial',
      },
      {
        label: 'Estrutura multi-unidade',
        value: branches.length > 1 ? 'Expandindo' : 'Centralizada',
      },
      {
        label: 'Capacidade de onboarding',
        value: departments.length >= branches.length ? 'Pronta' : 'Em preparacao',
      },
    ];
  }, [branches.length, departments.length]);

  const companySignals = useMemo(() => {
    if (!company) {
      return [];
    }

    return [
      { label: 'Nome empresarial', value: company.name || 'Nao informado' },
      { label: 'Setor', value: company.sector || 'Nao informado' },
      { label: 'Time', value: company.teamSize || 'Nao informado' },
      { label: 'Modelo operacional', value: company.operationModel || 'Nao informado' },
      { label: 'Vendas', value: company.salesModel || 'Nao informado' },
      { label: 'Financeiro', value: company.financeMaturity || 'Nao informado' },
    ];
  }, [company]);

  if (loading) {
    return (
      <div className="rounded-[32px] border border-white/10 bg-[#111113] p-6 shadow-[0_0_60px_rgba(139,92,246,0.05)]">
        <div className="text-sm text-zinc-300">Carregando visao da empresa...</div>
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
      <div className="rounded-[36px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.16),transparent_34%),radial-gradient(circle_at_top_right,rgba(84,147,255,0.14),transparent_28%),#0B1118] p-6 shadow-[0_0_70px_rgba(139,92,246,0.06)] md:p-7">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="xl:col-span-8">
            <div className="inline-flex rounded-full border border-[#8B5CF6]/20 bg-[#8B5CF6]/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-[#DDD6FE]">
              Enterprise Structure
            </div>
            <h2 className="mt-5 max-w-3xl text-3xl font-semibold tracking-tight text-white md:text-4xl">
              A empresa atual agora combina estrutura organizacional com um perfil operacional salvo.
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-400 md:text-base">
              Esta camada representa a fundacao do ELYON OS. Aqui a plataforma conecta hierarquia,
              escopo, unidades e contexto de negocio no mesmo tenant.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/dashboard/onboarding"
                className="rounded-2xl bg-[#8B5CF6] px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90"
              >
                Revisar onboarding
              </Link>
              <Link
                href="/dashboard/branches"
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white transition hover:bg-white/10"
              >
                Gerenciar unidades
              </Link>
              <Link
                href="/dashboard/users"
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white transition hover:bg-white/10"
              >
                Revisar equipe
              </Link>
            </div>
          </div>

          <div className="xl:col-span-4">
            <div className="rounded-[28px] border border-white/10 bg-[rgba(5,10,15,0.55)] p-5">
              <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Tenant ativo</div>
              <div className="mt-4 break-all text-lg font-semibold text-white">{me?.companyId || 'N/A'}</div>
              <div className="mt-3 text-sm text-zinc-400">
                {company?.name || 'Empresa atual'} em contexto com perfil {me?.role || 'N/A'} e base ativa de {stats.totalUsers} usuarios.
              </div>
              <div className="mt-6 space-y-3">
                {readinessItems.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-zinc-300"
                  >
                    <span>{item.label}</span>
                    <span className="text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-white/10 bg-[#111113] p-5">
          <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Usuarios</div>
          <div className="mt-4 text-3xl font-semibold text-white">{stats.totalUsers}</div>
          <div className="mt-2 text-sm text-zinc-400">{stats.activeUsers} ativos na empresa</div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#111113] p-5">
          <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Filiais</div>
          <div className="mt-4 text-3xl font-semibold text-white">{stats.totalBranches}</div>
          <div className="mt-2 text-sm text-zinc-400">media de {stats.usersPerBranch} usuarios por unidade</div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#111113] p-5">
          <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Departamentos</div>
          <div className="mt-4 text-3xl font-semibold text-white">{stats.totalDepartments}</div>
          <div className="mt-2 text-sm text-zinc-400">media de {stats.departmentsPerBranch} por unidade</div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#111113] p-5">
          <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Ativacao</div>
          <div className="mt-4 text-3xl font-semibold text-[#8B5CF6]">{stats.activeRate}%</div>
          <div className="mt-2 text-sm text-zinc-400">da base esta ativa no tenant atual</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="space-y-5 xl:col-span-8">
          <div className="rounded-[32px] border border-white/10 bg-[#111113] p-6 shadow-[0_0_60px_rgba(139,92,246,0.05)]">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-zinc-300">Estrutura consolidada</div>
                <div className="mt-1 text-xs text-zinc-500">leitura executiva da organizacao atual</div>
              </div>

              <div className="rounded-full border border-[#8B5CF6]/20 bg-[#8B5CF6]/10 px-4 py-2 text-xs text-[#DDD6FE]">
                core ativo
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                <div className="text-sm font-medium text-white">Identidade operacional</div>
                <div className="mt-5 space-y-3 text-sm text-zinc-400">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    Empresa: <span className="text-white">{company?.name || 'N/A'}</span>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    Perfil atual: <span className="text-white">{me?.role || 'N/A'}</span>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    Tenant atual: <span className="break-all text-white">{me?.companyId || 'N/A'}</span>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    Usuarios ativos: <span className="text-white">{stats.activeUsers}</span>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    Usuarios inativos: <span className="text-white">{stats.inactiveUsers}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.18),transparent_45%),#0F1012] p-5">
                <div className="text-sm font-medium text-white">Perfil da empresa</div>

                {company ? (
                  <div className="mt-5 grid grid-cols-1 gap-3">
                    {companySignals.map((item) => (
                      <div
                        key={item.label}
                        className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                      >
                        <div className="text-xs text-zinc-500">{item.label}</div>
                        <div className="mt-2 text-sm font-medium text-white">{item.value}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm text-zinc-300">
                    O perfil operacional ainda nao foi encontrado para esta empresa.
                  </div>
                )}

                <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-zinc-300">
                  {company?.multiUnit === 'sim'
                    ? 'O onboarding indica operacao multi-unidade, reforcando consolidacao por filial e comparativos de performance.'
                    : 'A base atual esta preparada para crescer em estrutura, dashboards e ativacao gradual de modulos.'}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-[#111113] p-6 shadow-[0_0_60px_rgba(139,92,246,0.05)]">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-zinc-300">Leitura do onboarding</div>
                <div className="mt-1 text-xs text-zinc-500">contexto salvo para orientar a evolucao da empresa</div>
              </div>

              <Link
                href="/dashboard/onboarding"
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-white transition hover:bg-white/10"
              >
                Abrir onboarding
              </Link>
            </div>

            {company ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                  <div className="text-xs uppercase tracking-[0.16em] text-zinc-500">Estoque</div>
                  <div className="mt-3 text-lg font-semibold text-white">
                    {company.hasInventory === 'sim'
                      ? 'Operacao com estoque'
                      : company.hasInventory === 'nao'
                        ? 'Operacao sem estoque'
                        : 'Nao informado'}
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                  <div className="text-xs uppercase tracking-[0.16em] text-zinc-500">Multi-unidade</div>
                  <div className="mt-3 text-lg font-semibold text-white">
                    {company.multiUnit === 'sim'
                      ? 'Rede com unidades'
                      : company.multiUnit === 'nao'
                        ? 'Operacao centralizada'
                        : 'Nao informado'}
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-black/20 p-5 md:col-span-2">
                  <div className="text-xs uppercase tracking-[0.16em] text-zinc-500">Objetivo principal</div>
                  <div className="mt-3 text-lg font-semibold text-white">{company.mainGoal || 'Nao informado'}</div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm text-zinc-300">
                Nenhuma leitura de onboarding encontrada para a empresa atual.
              </div>
            )}
          </div>

          <div className="rounded-[32px] border border-white/10 bg-[#111113] p-6 shadow-[0_0_60px_rgba(139,92,246,0.05)]">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-zinc-300">Unidades da organizacao</div>
                <div className="mt-1 text-xs text-zinc-500">leitura das filiais ja registradas no tenant</div>
              </div>

              <Link
                href="/dashboard/branches"
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-white transition hover:bg-white/10"
              >
                Abrir gestao de filiais
              </Link>
            </div>

            {branchSnapshots.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm text-zinc-300">
                Nenhuma filial encontrada.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {branchSnapshots.map((branch) => (
                  <div key={branch.id} className="rounded-3xl border border-white/10 bg-black/20 p-5">
                    <div className="text-sm font-medium text-white">{branch.name}</div>
                    <div className="mt-1 break-all text-xs text-zinc-500">{branch.id}</div>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl border border-white/10 bg-[#111113] p-3">
                        <div className="text-xs text-zinc-500">Usuarios</div>
                        <div className="mt-2 text-xl font-semibold text-white">{branch.userCount}</div>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-[#111113] p-3">
                        <div className="text-xs text-zinc-500">Departamentos</div>
                        <div className="mt-2 text-xl font-semibold text-white">{branch.departmentCount}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="xl:col-span-4">
          <div className="space-y-5">
            <div className="rounded-[32px] border border-white/10 bg-[#111113] p-5 shadow-[0_0_60px_rgba(79,255,176,0.04)]">
              <div className="mb-4 text-sm font-medium text-white">Acoes relacionadas</div>

              <div className="space-y-3">
                <Link
                  href="/dashboard/onboarding"
                  className="block rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:bg-white/5"
                >
                  <div className="text-xs text-zinc-500">Contexto</div>
                  <div className="mt-1 text-sm font-medium text-white">Abrir onboarding</div>
                </Link>

                <Link
                  href="/dashboard/branches"
                  className="block rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:bg-white/5"
                >
                  <div className="text-xs text-zinc-500">Unidades</div>
                  <div className="mt-1 text-sm font-medium text-white">Abrir filiais</div>
                </Link>

                <Link
                  href="/dashboard/departments"
                  className="block rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:bg-white/5"
                >
                  <div className="text-xs text-zinc-500">Estrutura</div>
                  <div className="mt-1 text-sm font-medium text-white">Abrir departamentos</div>
                </Link>

                <Link
                  href="/dashboard/users"
                  className="block rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:bg-white/5"
                >
                  <div className="text-xs text-zinc-500">Equipe</div>
                  <div className="mt-1 text-sm font-medium text-white">Abrir usuarios</div>
                </Link>
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-[#111113] p-5 shadow-[0_0_60px_rgba(79,255,176,0.04)]">
              <div className="mb-4 text-sm font-medium text-white">Snapshot do tenant</div>

              <div className="space-y-3 text-sm text-zinc-300">
                <div className="flex items-center justify-between">
                  <span>Role atual</span>
                  <span>{me?.role || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Tenant ativo</span>
                  <span>{me?.companyId ? 'Sim' : 'Nao'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Filial vinculada</span>
                  <span>{me?.branchId ? 'Sim' : 'Nao'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Departamento vinculado</span>
                  <span>{me?.departmentId ? 'Sim' : 'Nao'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
