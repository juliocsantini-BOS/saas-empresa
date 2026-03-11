'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3000';

type CurrentUser = {
  id: string;
  role: string;
  companyId?: string | null;
  branchId?: string | null;
  departmentId?: string | null;
};

const menuItems = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Empresas', href: '/dashboard/companies' },
  { label: 'Usuários', href: '/dashboard/users' },
  { label: 'Filiais', href: '/dashboard/branches' },
  { label: 'Departamentos', href: '/dashboard/departments' },
  { label: 'RBAC', href: '/dashboard/rbac' },
  { label: 'CRM', href: '/dashboard/crm' },
  { label: 'Financeiro', href: '/dashboard/finance' },
  { label: 'Automação IA', href: '/dashboard/ai' },
  { label: 'Auditoria', href: '/dashboard/audit' },
  { label: 'Configurações', href: '/dashboard/settings' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');

    if (!token) {
      router.push('/');
      return;
    }

    axios
      .get(API_URL + '/v1/auth/me', {
        headers: {
          Authorization: 'Bearer ' + token,
        },
      })
      .then((res) => {
        setUser(res.data);
      })
      .catch(() => {
        localStorage.removeItem('access_token');
        router.push('/');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router]);

  function logout() {
    localStorage.removeItem('access_token');
    router.push('/');
  }

  const pageTitle = useMemo(() => {
    if (pathname === '/dashboard') return 'Dashboard';
    if (pathname.startsWith('/dashboard/users')) return 'Usuários';
    if (pathname.startsWith('/dashboard/branches')) return 'Filiais';
    if (pathname.startsWith('/dashboard/departments')) return 'Departamentos';
    if (pathname.startsWith('/dashboard/companies')) return 'Empresas';
    if (pathname.startsWith('/dashboard/rbac')) return 'RBAC';
    if (pathname.startsWith('/dashboard/crm')) return 'CRM';
    if (pathname.startsWith('/dashboard/finance')) return 'Financeiro';
    if (pathname.startsWith('/dashboard/ai')) return 'Automação IA';
    if (pathname.startsWith('/dashboard/audit')) return 'Auditoria';
    if (pathname.startsWith('/dashboard/settings')) return 'Configurações';
    return 'IA Business OS';
  }, [pathname]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#0B0B0C] text-white flex items-center justify-center">
        <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-sm text-zinc-300">
          Carregando IA Business OS...
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0B0B0C] text-white">
      <div className="flex min-h-screen">
        <aside className="w-[290px] border-r border-white/10 bg-[#0E0E10] px-5 py-6">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#3BFF8C]/15 shadow-[0_0_30px_rgba(59,255,140,0.18)]">
              <div className="h-5 w-5 rounded-full bg-[#3BFF8C]" />
            </div>
            <div>
              <div className="text-lg font-semibold tracking-tight">IA Business OS</div>
              <div className="text-xs text-zinc-500">Enterprise AI Platform</div>
            </div>
          </div>

          <div className="mb-6 text-[11px] uppercase tracking-[0.22em] text-zinc-500">
            Principal
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    active
                      ? 'block w-full rounded-2xl border border-[#3BFF8C]/20 bg-[linear-gradient(90deg,rgba(59,255,140,0.12),rgba(59,255,140,0.04))] px-4 py-3 text-left text-sm font-medium text-white shadow-[0_0_30px_rgba(59,255,140,0.08)]'
                      : 'block w-full rounded-2xl px-4 py-3 text-left text-sm text-zinc-400 transition hover:bg-white/5 hover:text-white'
                  }
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.03] p-4">
            <div className="mb-2 text-sm font-semibold text-white">
              IA copiloto empresarial
            </div>
            <div className="mb-4 text-xs leading-5 text-zinc-400">
              Em breve, seu assistente operacional vai analisar setores, usuários, rotinas e métricas em tempo real.
            </div>
            <div className="rounded-2xl bg-[#3BFF8C]/10 px-4 py-3 text-xs text-[#9CFFC2]">
              Modo premium ativado
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-white/10 bg-black/20 p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">
              Sessão
            </div>
            <div className="mt-3 space-y-2 text-sm">
              <div className="text-white">{user.role}</div>
              <div className="break-all text-zinc-500">{user.id}</div>
            </div>
          </div>
        </aside>

        <section className="flex-1 px-8 py-6">
          <header className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-white">
                {pageTitle}
              </h1>
              <p className="mt-1 text-sm text-zinc-500">
                Sistema operacional empresarial com inteligência artificial
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="hidden rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300 md:block">
                {user.role}
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300">
                {user.companyId ? 'Tenant ativo' : 'Sem tenant'}
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300">
                {user.branchId ? 'Filial definida' : 'Sem filial'}
              </div>

              <button
                onClick={logout}
                className="rounded-2xl bg-white px-4 py-3 text-sm font-medium text-black transition hover:bg-zinc-200"
              >
                Logout
              </button>
            </div>
          </header>

          {children}
        </section>
      </div>
    </main>
  );
}
