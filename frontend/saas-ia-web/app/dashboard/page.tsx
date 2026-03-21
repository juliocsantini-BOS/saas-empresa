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
};

type BranchItem = {
  id: string;
  name: string;
  companyId: string;
};

type DepartmentItem = {
  id: string;
  name: string;
  companyId: string;
  branchId: string;
};

type AuditLogItem = {
  id: string;
  createdAt: string;
  requestId?: string | null;
  userId?: string | null;
  companyId?: string | null;
  method: string;
  path: string;
  statusCode: number;
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

export default function DashboardPage() {
  const [me, setMe] = useState<MeResponse | null>(null);
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [branches, setBranches] = useState<BranchItem[]>([]);
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDashboard() {
      const token = localStorage.getItem('access_token');

      if (!token) {
        setError('Token não encontrado.');
        setLoading(false);
        return;
      }

      try {
        const [meRes, companyRes, usersRes, branchesRes, departmentsRes, auditRes] =
          await Promise.all([
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
            axios.get(API_URL + '/v1/audit-logs?take=8', {
              headers: { Authorization: 'Bearer ' + token },
            }),
          ]);

        setMe(meRes.data);
        setCompany(companyRes.data ?? null);
        setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
        setBranches(Array.isArray(branchesRes.data) ? branchesRes.data : []);
        setDepartments(Array.isArray(departmentsRes.data) ? departmentsRes.data : []);
        setAuditLogs(Array.isArray(auditRes.data?.items) ? auditRes.data.items : []);
        setError('');
      } catch (err: unknown) {
        setError(getErrorMessage(err, 'Falha ao carregar dashboard.'));
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const stats = useMemo(() => {
    const activeUsers = users.filter((user) => user.isActive).length;
    const inactiveUsers = users.filter((user) => !user.isActive).length;
    const auditSuccess = auditLogs.filter(
      (log) => log.statusCode >= 200 && log.statusCode < 300
    ).length;
    const auditErrors = auditLogs.filter((log) => log.statusCode >= 400).length;

    return {
      totalUsers: users.length,
      activeUsers,
      inactiveUsers,
      totalBranches: branches.length,
      totalDepartments: departments.length,
      totalAuditLogs: auditLogs.length,
      auditSuccess,
      auditErrors,
      usersPerBranch: branches.length
        ? Number((users.length / branches.length).toFixed(1))
        : 0,
      departmentsPerBranch: branches.length
        ? Number((departments.length / branches.length).toFixed(1))
        : 0,
      organizationCoverage: branches.length
        ? Math.min(100, Math.round((departments.length / branches.length) * 35))
        : 8,
      activeUserRate: users.length
        ? Math.round((activeUsers / users.length) * 100)
        : 0,
    };
  }, [users, branches, departments, auditLogs]);

  const branchSnapshots = useMemo(() => {
    return branches.slice(0, 4).map((branch) => {
      const branchDepartments = departments.filter(
        (department) => department.branchId === branch.id
      );

      return {
        ...branch,
        departmentCount: branchDepartments.length,
      };
    });
  }, [branches, departments]);

  const profileSignals = useMemo(() => {
    if (!company) {
      return [];
    }

    return [
      { label: 'Empresa', value: company.name || 'Não informada' },
      { label: 'Setor', value: company.sector || 'Não informado' },
      { label: 'Operação', value: company.operationModel || 'Não informada' },
      {
        label: 'Multi-unidade',
        value:
          company.multiUnit === 'sim'
            ? 'Sim'
            : company.multiUnit === 'nao'
            ? 'Não'
              : 'Não informado',
      },
      { label: 'Financeiro', value: company.financeMaturity || 'Não informado' },
      { label: 'Objetivo', value: company.mainGoal || 'Não informado' },
    ];
  }, [company]);

  const aiPriorities = useMemo(() => {
    const isMultiUnit = company?.multiUnit === 'sim';
    const hasInventory = company?.hasInventory === 'sim';

    return [
      {
        title:
          isMultiUnit || stats.totalBranches > 1
            ? 'Consolidar visão entre unidades'
            : 'Expandir estrutura multi-unidade',
        description:
          isMultiUnit || stats.totalBranches > 1
            ? 'O perfil da empresa pede comparativos por filial, consolidação executiva e metas por unidade.'
            : 'Sua operação ainda parece centralizada. O próximo ganho é preparar matriz, filiais e escopos de gestão.',
      },
      {
        title:
          stats.auditErrors > 0
            ? 'Reduzir falhas operacionais'
            : 'Ativar camadas de analytics',
        description:
          stats.auditErrors > 0
            ? `Existem ${stats.auditErrors} eventos recentes com erro. Vale estabilizar a base antes de escalar automações.`
            : 'A base parece estável para ganhar dashboards analíticos, alertas e recomendações orientadas por IA.',
      },
      {
        title: hasInventory ? 'Conectar operação com estoque' : 'Ativar módulos sugeridos',
        description: hasInventory
          ? 'O onboarding indica operação com estoque. Vale priorizar inventário, reposição e integração com vendas.'
          : 'O perfil operacional salvo já permite orientar os próximos módulos e prioridades do Business OS.',
      },
    ];
  }, [company, stats]);

  function statusBadge(statusCode: number) {
    if (statusCode >= 200 && statusCode < 300) {
      return 'rounded-full border border-[#8B5CF6]/20 bg-[#8B5CF6]/10 px-3 py-1 text-xs text-[#DDD6FE]';
    }

    if (statusCode >= 400 && statusCode < 500) {
      return 'rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-xs text-yellow-200';
    }

    if (statusCode >= 500) {
      return 'rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs text-red-300';
    }

    return 'rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white';
  }

  function humanizeAudit(log: AuditLogItem) {
    const path = log.path || '';

    if (log.method === 'POST' && path.includes('/v1/users')) return 'Novo usuário criado';
    if (log.method === 'PATCH' && path.includes('/role')) return 'Perfil de usuário alterado';
    if (log.method === 'PATCH' && path.includes('/status')) return 'Status de usuário atualizado';
    if (log.method === 'POST' && path.includes('/reset-password')) return 'Senha redefinida';
    if (log.method === 'POST' && path.includes('/v1/branches')) return 'Nova filial criada';
    if (log.method === 'PATCH' && path.includes('/v1/branches/')) return 'Filial atualizada';
    if (log.method === 'DELETE' && path.includes('/v1/branches/')) return 'Filial removida';
    if (log.method === 'POST' && path.includes('/v1/departments')) return 'Novo departamento criado';
    if (log.method === 'PATCH' && path.includes('/v1/departments/')) return 'Departamento atualizado';
    if (log.method === 'DELETE' && path.includes('/v1/departments/')) return 'Departamento removido';
    if (log.method === 'GET' && path.includes('/v1/audit-logs')) return 'Consulta de auditoria';
    if (log.method === 'GET' && path.includes('/v1/users')) return 'Consulta de usuários';
    if (log.method === 'GET' && path.includes('/v1/branches')) return 'Consulta de filiais';
    if (log.method === 'GET' && path.includes('/v1/departments')) return 'Consulta de departamentos';

    return log.method + ' ' + path;
  }

  if (loading) {
    return (
      <div className="rounded-[32px] border border-white/10 bg-[#111113] p-6 text-sm text-zinc-300 shadow-[0_0_60px_rgba(139,92,246,0.05)]">
        Carregando painel executivo...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[32px] border border-red-500/20 bg-red-500/10 p-6 text-sm text-red-300 shadow-[0_0_60px_rgba(139,92,246,0.05)]">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.18),transparent_30%),radial-gradient(circle_at_top_right,rgba(84,147,255,0.10),transparent_22%),linear-gradient(180deg,rgba(10,13,20,0.98),rgba(7,9,14,0.98))] p-5 shadow-[0_22px_80px_rgba(0,0,0,0.28)]">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
          <div className="xl:col-span-8">
            <div className="inline-flex rounded-full border border-[#8B5CF6]/20 bg-[#8B5CF6]/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-[#DDD6FE]">
              ELYON OS
            </div>
            <h2 className="mt-4 max-w-3xl text-[28px] font-semibold leading-[1.02] tracking-[-0.04em] text-white md:text-[38px]">
              Um command center executivo para operar empresa, unidades, equipes e módulos sem sair da primeira dobra.
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400 md:text-[15px]">
              A fundação atual já sustenta tenant, filiais, departamentos, permissões e auditoria.
              Agora o painel também usa o perfil operacional salvo no onboarding para orientar a leitura executiva.
            </p>

            <div className="mt-4 flex flex-wrap gap-2.5">
              <Link
                href="/dashboard/companies"
                className="rounded-2xl bg-[#8B5CF6] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Ver empresa atual
              </Link>
              <Link
                href="/dashboard/onboarding"
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white transition hover:bg-white/10"
              >
                Revisar onboarding
              </Link>
              <Link
                href="/dashboard/crm"
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white transition hover:bg-white/10"
              >
                Abrir CRM
              </Link>
            </div>
          </div>

          <div className="xl:col-span-4">
            <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(0,0,0,0.14))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                Command snapshot
              </div>
              <div className="mt-3 text-[48px] font-semibold tracking-[-0.05em] text-white">
                {stats.activeUserRate}%
              </div>
              <div className="mt-1 text-sm text-zinc-400">
                da base de usuários está ativa na operação atual
              </div>

              <div className="mt-5 space-y-2.5">
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm text-zinc-300">
                  <span>Empresa</span>
                  <span className="text-white">{company?.name || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm text-zinc-300">
                  <span>Perfil atual</span>
                  <span className="text-white">{me?.role || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm text-zinc-300">
                  <span>Tenant</span>
                  <span className="text-white">{me?.companyId ? 'Ativo' : 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm text-zinc-300">
                  <span>Filial no contexto</span>
                  <span className="text-white">{me?.branchId ? 'Sim' : 'Não'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(0,0,0,0.14))] p-4 shadow-[0_18px_48px_rgba(0,0,0,0.16)]">
          <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Pessoas na operação</div>
          <div className="mt-4 text-3xl font-semibold text-white">{stats.totalUsers}</div>
          <div className="mt-2 text-sm text-zinc-400">{stats.activeUsers} contas ativas no momento</div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(0,0,0,0.14))] p-4 shadow-[0_18px_48px_rgba(0,0,0,0.16)]">
          <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Unidades operacionais</div>
          <div className="mt-4 text-3xl font-semibold text-white">{stats.totalBranches}</div>
          <div className="mt-2 text-sm text-zinc-400">média de {stats.usersPerBranch} usuários por filial</div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(0,0,0,0.14))] p-4 shadow-[0_18px_48px_rgba(0,0,0,0.16)]">
          <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Estrutura organizacional</div>
          <div className="mt-4 text-3xl font-semibold text-white">{stats.totalDepartments}</div>
          <div className="mt-2 text-sm text-zinc-400">média de {stats.departmentsPerBranch} departamentos por filial</div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(0,0,0,0.14))] p-4 shadow-[0_18px_48px_rgba(0,0,0,0.16)]">
          <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Saúde do ambiente</div>
          <div className="mt-4 text-3xl font-semibold text-[#8B5CF6]">OK</div>
          <div className="mt-2 text-sm text-zinc-400">{stats.auditSuccess} eventos recentes sem erro</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="space-y-4 xl:col-span-8">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(0,0,0,0.14))] p-5 shadow-[0_18px_48px_rgba(0,0,0,0.16)]">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-zinc-300">Leitura executiva</div>
                  <div className="mt-1 text-xs text-zinc-500">visão rápida da empresa atual</div>
                </div>

                <div className="rounded-full border border-[#8B5CF6]/20 bg-[#8B5CF6]/10 px-4 py-2 text-xs text-[#DDD6FE]">
                  online
                </div>
              </div>

              <div className="space-y-2.5 text-sm text-zinc-400">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3.5">
                  Empresa atual: {company?.name || 'N/A'}
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3.5">
                  {stats.totalBranches} unidades e {stats.totalDepartments} setores estruturam a operação atual
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3.5">
                  {stats.activeUsers} usuários ativos e {stats.inactiveUsers} inativos compõem o tenant conectado
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3.5">
                  {stats.totalAuditLogs} ações recentes registradas, com {stats.auditErrors} alertas ou falhas
                </div>
              </div>
            </div>

            <div className="rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.18),transparent_45%),linear-gradient(180deg,rgba(15,16,18,0.98),rgba(10,11,18,0.96))] p-5 shadow-[0_18px_48px_rgba(0,0,0,0.16)]">
              <div className="mb-4">
                <div className="text-sm font-medium text-white">Maturidade do core</div>
                <div className="mt-1 text-xs text-zinc-500">leitura da base operacional disponível hoje</div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-xs text-zinc-400">
                  <span>Cobertura organizacional</span>
                  <span>{stats.organizationCoverage}%</span>
                </div>
                <div className="h-3 rounded-full bg-white/10">
                  <div
                    className="h-3 rounded-full bg-[linear-gradient(90deg,#8B5CF6,#5D9CFF)]"
                    style={{ width: `${stats.organizationCoverage}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2.5">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-3.5">
                  <div className="text-xs text-zinc-500">Setor</div>
                  <div className="mt-2 text-2xl font-semibold text-white">{company?.sector || 'N/A'}</div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-3.5">
                  <div className="text-xs text-zinc-500">Ativação</div>
                  <div className="mt-2 text-2xl font-semibold text-white">{stats.activeUserRate}%</div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-3.5">
                  <div className="text-xs text-zinc-500">Operação</div>
                  <div className="mt-2 text-2xl font-semibold text-white">{company?.operationModel || 'N/A'}</div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-3.5">
                  <div className="text-xs text-zinc-500">Próxima camada</div>
                  <div className="mt-2 text-2xl font-semibold text-white">
                    {company?.hasInventory === 'sim' ? 'Estoque' : 'IA Ops'}
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-zinc-300">
                A plataforma agora consegue usar o perfil operacional salvo para orientar módulos, prioridades e visão executiva.
              </div>
            </div>
          </div>

          <div className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(0,0,0,0.14))] p-5 shadow-[0_18px_48px_rgba(0,0,0,0.16)]">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-zinc-300">Perfil operacional salvo</div>
                <div className="mt-1 text-xs text-zinc-500">contexto vindo do onboarding inteligente</div>
              </div>

              <Link
                href="/dashboard/onboarding"
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-white transition hover:bg-white/10"
              >
                Revisar onboarding
              </Link>
            </div>

            {company ? (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {profileSignals.map((item) => (
                  <div key={item.label} className="rounded-3xl border border-white/10 bg-black/20 p-4">
                    <div className="text-xs uppercase tracking-[0.16em] text-zinc-500">{item.label}</div>
                    <div className="mt-2.5 text-base font-semibold text-white">{item.value}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm text-zinc-300">
                Perfil operacional ainda não encontrado para esta empresa.
              </div>
            )}
          </div>

          <div className="rounded-[32px] border border-white/10 bg-[#111113] p-6 shadow-[0_0_60px_rgba(139,92,246,0.05)]">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-zinc-300">Estrutura multi-unidade</div>
                <div className="mt-1 text-xs text-zinc-500">leitura inicial das unidades ja cadastradas</div>
              </div>

              <Link
                href="/dashboard/branches"
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-white transition hover:bg-white/10"
              >
                Gerenciar filiais
              </Link>
            </div>

            {branchSnapshots.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm text-zinc-300">
                Nenhuma unidade cadastrada ainda.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {branchSnapshots.map((branch) => (
                  <div key={branch.id} className="rounded-3xl border border-white/10 bg-black/20 p-5">
                    <div className="text-sm font-medium text-white">{branch.name}</div>
                    <div className="mt-1 break-all text-xs text-zinc-500">{branch.id}</div>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl border border-white/10 bg-[#111113] p-3">
                        <div className="text-xs text-zinc-500">Departamentos</div>
                        <div className="mt-2 text-xl font-semibold text-white">{branch.departmentCount}</div>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-[#111113] p-3">
                        <div className="text-xs text-zinc-500">Tenant</div>
                        <div className="mt-2 text-sm font-medium text-white">ativo</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-[32px] border border-white/10 bg-[#111113] p-6 shadow-[0_0_60px_rgba(139,92,246,0.05)]">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-zinc-300">Atividade recente</div>
                <div className="mt-1 text-xs text-zinc-500">ultimas movimentacoes importantes do sistema</div>
              </div>

              <Link
                href="/dashboard/audit"
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-white transition hover:bg-white/10"
              >
                Ver auditoria completa
              </Link>
            </div>

            {auditLogs.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm text-zinc-300">
                Nenhuma atividade recente encontrada.
              </div>
            ) : (
              <div className="space-y-3">
                {auditLogs.slice(0, 6).map((log) => (
                  <div
                    key={log.id}
                    className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-black/20 p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={statusBadge(log.statusCode)}>{log.statusCode}</span>
                      </div>

                      <div className="mt-3 text-sm font-medium text-white">{humanizeAudit(log)}</div>

                      <div className="mt-1 text-xs text-zinc-500">ID do usuario: {log.userId || 'N/A'}</div>
                    </div>

                    <div className="text-xs text-zinc-500">
                      {log.createdAt ? new Date(log.createdAt).toLocaleString('pt-BR') : 'N/A'}
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
              <div className="mb-4 text-sm font-medium text-white">Prioridades sugeridas pela IA</div>

              <div className="space-y-3">
                {aiPriorities.map((item) => (
                  <div key={item.title} className="rounded-3xl border border-white/10 bg-black/20 p-4">
                    <div className="text-sm font-medium text-white">{item.title}</div>
                    <div className="mt-2 text-sm leading-6 text-zinc-400">{item.description}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-[#111113] p-5 shadow-[0_0_60px_rgba(79,255,176,0.04)]">
              <div className="mb-4 text-sm font-medium text-white">Acoes rapidas</div>

              <div className="space-y-3">
                <Link
                  href="/dashboard/companies"
                  className="block rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:bg-white/5"
                >
                  <div className="text-xs text-zinc-500">Empresa</div>
                  <div className="mt-1 text-sm font-medium text-white">Abrir empresa atual</div>
                </Link>

                <Link
                  href="/dashboard/branches"
                  className="block rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:bg-white/5"
                >
                  <div className="text-xs text-zinc-500">Estrutura</div>
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
                  href="/dashboard/automations"
                  className="block rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:bg-white/5"
                >
                  <div className="text-xs text-zinc-500">Automacoes</div>
                  <div className="mt-1 text-sm font-medium text-white">Abrir central de automacoes</div>
                </Link>
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-[#111113] p-5 shadow-[0_0_60px_rgba(79,255,176,0.04)]">
              <div className="mb-4 text-sm font-medium text-white">Snapshot da conta</div>

              <div className="space-y-3 text-sm text-zinc-300">
                <div className="flex items-center justify-between">
                  <span>Usuarios inativos</span>
                  <span>{stats.inactiveUsers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Logs com erro</span>
                  <span>{stats.auditErrors}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Filial vinculada</span>
                  <span>{me?.branchId ? 'Sim' : 'Nao'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Departamento vinculado</span>
                  <span>{me?.departmentId ? 'Sim' : 'Nao'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Escopo do operador</span>
                  <span>{me?.role || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
