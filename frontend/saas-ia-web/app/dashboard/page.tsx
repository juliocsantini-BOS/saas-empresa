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

export default function DashboardPage() {
  const [me, setMe] = useState<MeResponse | null>(null);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [branches, setBranches] = useState<BranchItem[]>([]);
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadDashboard() {
    const token = localStorage.getItem('access_token');

    if (!token) {
      setError('Token não encontrado.');
      setLoading(false);
      return;
    }

    try {
      const [meRes, usersRes, branchesRes, departmentsRes, auditRes] = await Promise.all([
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
        axios.get(API_URL + '/v1/audit-logs?take=8', {
          headers: { Authorization: 'Bearer ' + token },
        }),
      ]);

      setMe(meRes.data);
      setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
      setBranches(Array.isArray(branchesRes.data) ? branchesRes.data : []);
      setDepartments(Array.isArray(departmentsRes.data) ? departmentsRes.data : []);
      setAuditLogs(Array.isArray(auditRes.data?.items) ? auditRes.data.items : []);
      setError('');
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Falha ao carregar dashboard.';
      setError(Array.isArray(msg) ? msg.join(', ') : String(msg));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
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
    };
  }, [users, branches, departments, auditLogs]);

  function statusBadge(statusCode: number) {
    if (statusCode >= 200 && statusCode < 300) {
      return 'rounded-full border border-[#3BFF8C]/20 bg-[#3BFF8C]/10 px-3 py-1 text-xs text-[#9CFFC2]';
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

    if (log.method === 'POST' && path.includes('/v1/users')) {
      return 'Novo usuário criado';
    }

    if (log.method === 'PATCH' && path.includes('/role')) {
      return 'Perfil de usuário alterado';
    }

    if (log.method === 'PATCH' && path.includes('/status')) {
      return 'Status de usuário atualizado';
    }

    if (log.method === 'POST' && path.includes('/reset-password')) {
      return 'Senha de usuário redefinida';
    }

    if (log.method === 'POST' && path.includes('/v1/branches')) {
      return 'Nova filial criada';
    }

    if (log.method === 'PATCH' && path.includes('/v1/branches/')) {
      return 'Filial atualizada';
    }

    if (log.method === 'DELETE' && path.includes('/v1/branches/')) {
      return 'Filial removida';
    }

    if (log.method === 'POST' && path.includes('/v1/departments')) {
      return 'Novo departamento criado';
    }

    if (log.method === 'PATCH' && path.includes('/v1/departments/')) {
      return 'Departamento atualizado';
    }

    if (log.method === 'DELETE' && path.includes('/v1/departments/')) {
      return 'Departamento removido';
    }

    if (log.method === 'GET' && path.includes('/v1/audit-logs')) {
      return 'Consulta de auditoria';
    }

    if (log.method === 'GET' && path.includes('/v1/users')) {
      return 'Consulta de usuários';
    }

    if (log.method === 'GET' && path.includes('/v1/branches')) {
      return 'Consulta de filiais';
    }

    if (log.method === 'GET' && path.includes('/v1/departments')) {
      return 'Consulta de departamentos';
    }

    return log.method + ' ' + path;
  }

  if (loading) {
    return (
      <div className="rounded-[32px] border border-white/10 bg-[#111113] p-6 text-sm text-zinc-300 shadow-[0_0_60px_rgba(59,255,140,0.05)]">
        Carregando painel executivo...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[32px] border border-red-500/20 bg-red-500/10 p-6 text-sm text-red-300 shadow-[0_0_60px_rgba(59,255,140,0.05)]">
        {error}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
      <div className="xl:col-span-8">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
          <div className="rounded-3xl border border-white/10 bg-[#111113] p-5 shadow-[0_0_40px_rgba(59,255,140,0.04)]">
            <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">
              Pessoas na operação
            </div>
            <div className="mt-4 text-3xl font-semibold text-white">
              {stats.totalUsers}
            </div>
            <div className="mt-2 text-sm text-zinc-400">
              {stats.activeUsers} contas ativas no momento
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#111113] p-5 shadow-[0_0_40px_rgba(59,255,140,0.04)]">
            <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">
              Estrutura física
            </div>
            <div className="mt-4 text-3xl font-semibold text-white">
              {stats.totalBranches}
            </div>
            <div className="mt-2 text-sm text-zinc-400">
              filiais registradas na empresa
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#111113] p-5 shadow-[0_0_40px_rgba(59,255,140,0.04)]">
            <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">
              Setores ativos
            </div>
            <div className="mt-4 text-3xl font-semibold text-white">
              {stats.totalDepartments}
            </div>
            <div className="mt-2 text-sm text-zinc-400">
              departamentos organizados no sistema
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#111113] p-5 shadow-[0_0_40px_rgba(59,255,140,0.04)]">
            <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">
              Saúde do ambiente
            </div>
            <div className="mt-4 text-3xl font-semibold text-[#3BFF8C]">
              OK
            </div>
            <div className="mt-2 text-sm text-zinc-400">
              acesso validado • perfil {me?.role || 'N/A'}
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="rounded-[32px] border border-white/10 bg-[#111113] p-6 shadow-[0_0_60px_rgba(59,255,140,0.05)]">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-zinc-300">
                  Resumo executivo
                </div>
                <div className="mt-1 text-xs text-zinc-500">
                  visão rápida do tenant conectado
                </div>
              </div>

              <div className="rounded-full border border-[#3BFF8C]/20 bg-[#3BFF8C]/10 px-4 py-2 text-xs text-[#A9FFC9]">
                online
              </div>
            </div>

            <div className="space-y-3 text-sm text-zinc-400">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                {stats.activeUsers} usuários ativos operando agora
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                {stats.totalBranches} filiais e {stats.totalDepartments} setores estruturados
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                {stats.totalAuditLogs} ações recentes registradas pela auditoria
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                Tenant atual: {me?.companyId || 'N/A'}
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(59,255,140,0.18),transparent_45%),#0F1012] p-6 shadow-[0_0_60px_rgba(59,255,140,0.05)]">
            <div className="mb-5">
              <div className="text-sm font-medium text-white">
                Indicadores rápidos
              </div>
              <div className="mt-1 text-xs text-zinc-500">
                leitura simplificada da operação
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs text-zinc-500">Contas ativas</div>
                <div className="mt-2 text-2xl font-semibold text-white">
                  {stats.activeUsers}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs text-zinc-500">Contas inativas</div>
                <div className="mt-2 text-2xl font-semibold text-white">
                  {stats.inactiveUsers}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs text-zinc-500">Ações sem erro</div>
                <div className="mt-2 text-2xl font-semibold text-[#3BFF8C]">
                  {stats.auditSuccess}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs text-zinc-500">Alertas / erros</div>
                <div className="mt-2 text-2xl font-semibold text-white">
                  {stats.auditErrors}
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-zinc-300">
              Empresa conectada, estrutura carregada e painel operacional pronto para expansão.
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-[32px] border border-white/10 bg-[#111113] p-6 shadow-[0_0_60px_rgba(59,255,140,0.05)]">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-zinc-300">
                Atividade recente
              </div>
              <div className="mt-1 text-xs text-zinc-500">
                últimas movimentações importantes do sistema
              </div>
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
                      <span className={statusBadge(log.statusCode)}>
                        {log.statusCode}
                      </span>
                    </div>

                    <div className="mt-3 text-sm font-medium text-white">
                      {humanizeAudit(log)}
                    </div>

                    <div className="mt-1 text-xs text-zinc-500">
                      ID do usuário: {log.userId || 'N/A'}
                    </div>
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
        <div className="rounded-[32px] border border-white/10 bg-[#111113] p-5 shadow-[0_0_60px_rgba(59,255,140,0.04)]">
          <div className="mb-4 text-sm font-medium text-white">
            Painel de decisão
          </div>

          <div className="rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_center,rgba(59,255,140,0.18),transparent_55%),#0C0D0F] p-5">
            <div className="text-5xl font-semibold text-white">
              {stats.activeUsers}
            </div>
            <div className="mt-2 text-sm text-zinc-400">
              pessoas ativas usando o sistema neste tenant
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white/5 p-4">
                <div className="text-xs text-zinc-500">Perfil atual</div>
                <div className="mt-1 text-lg font-semibold text-white">
                  {me?.role || 'N/A'}
                </div>
              </div>

              <div className="rounded-2xl bg-white/5 p-4">
                <div className="text-xs text-zinc-500">Tenant</div>
                <div className="mt-1 text-lg font-semibold text-white">
                  {me?.companyId ? 'Ativo' : 'N/A'}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">
              Ações rápidas
            </div>

            <Link
              href="/dashboard/users"
              className="block rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:bg-white/5"
            >
              <div className="text-xs text-zinc-500">Gestão</div>
              <div className="mt-1 text-sm font-medium text-white">
                Abrir usuários e acessos
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

            <Link
              href="/dashboard/automations"
              className="block rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:bg-white/5"
            >
              <div className="text-xs text-zinc-500">Automações</div>
              <div className="mt-1 text-sm font-medium text-white">
                Abrir central de automações
              </div>
            </Link>
          </div>

          <div className="mt-5 rounded-3xl border border-white/10 bg-black/20 p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">
              Snapshot da conta
            </div>

            <div className="mt-4 space-y-3 text-sm text-zinc-300">
              <div className="flex items-center justify-between">
                <span>Usuários inativos</span>
                <span>{stats.inactiveUsers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Logs com erro</span>
                <span>{stats.auditErrors}</span>
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
  );
}

