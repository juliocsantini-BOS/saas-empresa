'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.elyonos.com.br';

type CurrentUser = {
  id: string;
  role: string;
  name?: string | null;
  companyId?: string | null;
  branchId?: string | null;
  departmentId?: string | null;
};

const menuGroups = [
  {
    title: 'Command',
    items: [
      { label: 'Dashboard Executivo', href: '/dashboard' },
      { label: 'Empresas', href: '/dashboard/companies' },
      { label: 'Onboarding IA', href: '/dashboard/onboarding' },
      { label: 'Configurações', href: '/dashboard/settings' },
    ],
  },
  {
    title: 'Core Operacional',
    items: [
      { label: 'Usuários', href: '/dashboard/users' },
      { label: 'Filiais', href: '/dashboard/branches' },
      { label: 'Departamentos', href: '/dashboard/departments' },
      { label: 'RBAC', href: '/dashboard/rbac' },
      { label: 'Auditoria', href: '/dashboard/audit' },
    ],
  },
  {
    title: 'Módulos',
    items: [
      { label: 'CRM', href: '/dashboard/crm' },
      { label: 'Financeiro', href: '/dashboard/finance' },
      { label: 'Automações', href: '/dashboard/automations' },
      { label: 'Copiloto IA', href: '/dashboard/ai' },
    ],
  },
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
    if (pathname === '/dashboard') return 'Dashboard Executivo';
    if (pathname.startsWith('/dashboard/users')) return 'Usuários';
    if (pathname.startsWith('/dashboard/branches')) return 'Filiais';
    if (pathname.startsWith('/dashboard/departments')) return 'Departamentos';
    if (pathname.startsWith('/dashboard/companies')) return 'Empresas';
    if (pathname.startsWith('/dashboard/onboarding')) return 'Onboarding IA';
    if (pathname.startsWith('/dashboard/rbac')) return 'RBAC';
    if (pathname.startsWith('/dashboard/crm')) return 'CRM';
    if (pathname.startsWith('/dashboard/finance')) return 'Financeiro';
    if (pathname.startsWith('/dashboard/automations')) return 'Automações';
    if (pathname.startsWith('/dashboard/ai')) return 'Copiloto IA';
    if (pathname.startsWith('/dashboard/audit')) return 'Auditoria';
    if (pathname.startsWith('/dashboard/settings')) return 'Configurações';
    return 'ELYON OS';
  }, [pathname]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#081018] text-white">
        <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-sm text-zinc-300">
          Carregando ELYON OS...
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#07080D] text-white">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="w-full border-b border-white/10 bg-[linear-gradient(180deg,rgba(10,11,18,0.98),rgba(13,14,24,0.94))] px-3 py-5 lg:w-[208px] lg:shrink-0 lg:border-b-0 lg:border-r lg:px-3">
          <div className="mb-5 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#8B5CF6]/15 shadow-[0_0_40px_rgba(139,92,246,0.18)]">
              <div className="h-4 w-4 rounded-full bg-[#8B5CF6]" />
            </div>
            <div>
              <div className="text-[14px] font-semibold tracking-tight">ELYON OS</div>
              <div className="text-xs text-zinc-500">Enterprise AI command layer</div>
            </div>
          </div>

          <div className="space-y-4">
            {menuGroups.map((group) => (
              <div key={group.title}>
                <div className="mb-2.5 text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                  {group.title}
                </div>

                <nav className="space-y-1">
                  {group.items.map((item) => {
                    const active =
                      pathname === item.href ||
                      (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'));

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={
                          active
                            ? 'block w-full rounded-2xl border border-[#8B5CF6]/20 bg-[linear-gradient(90deg,rgba(139,92,246,0.12),rgba(69,160,255,0.05))] px-2.5 py-2.5 text-left text-[12.5px] font-medium text-white shadow-[0_0_30px_rgba(139,92,246,0.07)]'
                            : 'block w-full rounded-2xl px-2.5 py-2.5 text-left text-[12.5px] text-zinc-400 transition hover:bg-white/5 hover:text-white'
                        }
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>

        </aside>

        <section className="flex-1 px-4 py-5 md:px-6 xl:px-8">
          <header className="mb-8 flex items-start justify-between gap-4 rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.015))] px-5 py-4 shadow-[0_18px_40px_rgba(0,0,0,0.16)]">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-white">
                {pageTitle}
              </h1>
              <p className="mt-1 text-sm text-zinc-500">
                Sistema operacional empresarial guiado por IA, módulos e estrutura multi-unidade
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-zinc-300">
                {user.name || user.role}
              </div>

              <div className="hidden rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-zinc-300 md:block">
                {user.role}
              </div>

              <button
                onClick={logout}
                className="rounded-2xl border border-white/10 bg-white px-4 py-3 text-sm font-medium text-black transition hover:bg-zinc-200"
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
