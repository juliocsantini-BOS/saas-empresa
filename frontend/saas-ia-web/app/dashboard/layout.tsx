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
  email?: string | null;
  companyId?: string | null;
  branchId?: string | null;
  departmentId?: string | null;
};

const menuGroups = [
  {
    title: 'Command',
    items: [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Empresas', href: '/dashboard/companies' },
      { label: 'Onboarding IA', href: '/dashboard/onboarding' },
      { label: 'Configurações', href: '/dashboard/settings' },
    ],
  },
  {
    title: 'Core',
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

function getPageTitle(pathname: string) {
  if (pathname === '/dashboard') return 'Dashboard executivo';
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
}

function getUserInitials(user: CurrentUser | null) {
  if (!user?.name?.trim()) return 'EO';
  return user.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

const assistantPrompts = [
  'Resuma a operação do dia.',
  'Aponte gargalos críticos.',
  'Monte um plano executivo.',
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
  const [aiExpanded, setAiExpanded] = useState(false);

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

  const pageTitle = useMemo(() => getPageTitle(pathname), [pathname]);
  const userInitials = useMemo(() => getUserInitials(user), [user]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09090f] text-white">
        <div className="rounded-[28px] border border-white/10 bg-white/[0.03] px-6 py-4 text-sm text-zinc-300">
          Carregando ELYON OS...
        </div>
      </div>
    );
  }

  return (
    <main className="h-screen overflow-hidden bg-[#09090f] text-white">
      <div className="flex h-full overflow-hidden">
        <aside className="hidden h-full w-[236px] shrink-0 border-r border-white/8 bg-[#0d0c16] lg:flex lg:flex-col lg:overflow-hidden">
          <div className="px-3.5 pb-1.5 pt-3.5">
            <div className="flex items-center gap-3 rounded-[20px] border border-white/8 bg-white/[0.03] px-3.5 py-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-[14px] bg-[linear-gradient(180deg,rgba(141,92,246,0.95),rgba(92,52,196,0.95))] text-sm font-semibold text-white">
                EO
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-white">ELYON OS</div>
                <div className="truncate text-[11px] text-zinc-500">AI Business OS</div>
              </div>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col justify-between px-3.5 pb-3">
            <div className="space-y-2.5">
              {menuGroups.map((group) => (
                <div key={group.title}>
                  <div className="mb-1 px-2.5 text-[8px] uppercase tracking-[0.28em] text-zinc-500">
                    {group.title}
                  </div>

                  <nav className="space-y-0.5">
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
                              ? 'flex items-center gap-3 rounded-[15px] border border-violet-300/14 bg-[linear-gradient(180deg,rgba(141,92,246,0.18),rgba(141,92,246,0.08))] px-3.5 py-2.5 text-[12px] font-medium text-white'
                              : 'flex items-center gap-3 rounded-[15px] border border-transparent px-3.5 py-2.5 text-[12px] text-zinc-400 transition hover:border-white/8 hover:bg-white/[0.03] hover:text-white'
                          }
                        >
                          <span
                            className={
                              active
                                ? 'h-2 w-2 rounded-full bg-violet-200 shadow-[0_0_12px_rgba(196,181,253,0.6)]'
                                : 'h-2 w-2 rounded-full bg-zinc-700'
                            }
                          />
                          {item.label}
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 rounded-[14px] border border-white/8 bg-white/[0.03] px-2.5 py-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-[10px] bg-[linear-gradient(180deg,rgba(141,92,246,0.95),rgba(92,52,196,0.95))] text-[10px] font-semibold text-white">
                {userInitials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[10px] font-medium leading-none text-white">{user.name || 'Usuário'}</div>
                <div className="mt-1 truncate text-[9px] leading-none text-zinc-500">{user.role}</div>
              </div>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(74,222,128,0.7)]" />
            </div>
          </div>
        </aside>

        <section className="relative flex min-w-0 flex-1 overflow-hidden">
          <div className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
            <div className="px-4 py-4 md:px-6 xl:px-8">
              <header className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-[28px] border border-white/8 bg-white/[0.03] px-5 py-4">
                <div>
                  <div className="mb-1 text-[10px] uppercase tracking-[0.3em] text-violet-200/60">Workspace</div>
                  <h1 className="text-3xl font-semibold tracking-tight text-white">{pageTitle}</h1>
                  <p className="mt-1 text-sm text-zinc-500">
                    Sistema operacional empresarial guiado por IA, módulos conectados e execução em tempo real.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setAiExpanded((current) => !current)}
                    className="hidden rounded-[18px] border border-violet-300/16 bg-violet-500/10 px-4 py-3 text-sm font-medium text-white transition hover:bg-violet-500/15 xl:inline-flex"
                  >
                    IA
                  </button>

                  <button
                    onClick={logout}
                    className="rounded-[18px] border border-white/10 bg-white px-4 py-3 text-sm font-medium text-black transition hover:bg-zinc-200"
                  >
                    Logout
                  </button>
                </div>
              </header>

              <div>{children}</div>
            </div>
          </div>

          <div
            className={`pointer-events-none absolute inset-y-0 right-0 z-30 hidden w-[296px] xl:block ${
              aiExpanded ? 'translate-x-0 opacity-100' : 'translate-x-[108%] opacity-0'
            } transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]`}
          >
            <div className="pointer-events-auto h-full border-l border-white/8 bg-[#110f1b]/96 backdrop-blur-xl shadow-[-24px_0_80px_rgba(0,0,0,0.42)]">
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b border-white/8 px-4 py-4">
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-[0.22em] text-violet-200/70">IA Assistant</div>
                    <div className="mt-1 truncate text-sm font-medium text-white">Copiloto Elyon</div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setAiExpanded(false)}
                    className="rounded-full border border-white/8 bg-white/[0.04] px-3 py-1.5 text-xs text-zinc-300"
                  >
                    ×
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-3">
                  <div className="flex h-full flex-col">
                    <div className="rounded-[26px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-4 shadow-[0_18px_40px_rgba(0,0,0,0.24)]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[linear-gradient(180deg,rgba(160,102,255,1),rgba(113,58,220,1))] text-[10px] font-semibold text-white">
                            IA
                          </div>
                          <div className="text-xs font-medium text-zinc-300">AI Assistant</div>
                        </div>
                        <span className="rounded-full border border-white/8 bg-white/[0.04] px-2 py-1 text-[10px] text-zinc-400">
                          Go to AI
                        </span>
                      </div>

                      <div className="mt-5">
                        <div className="text-sm text-zinc-400">Boa tarde,</div>
                        <div className="mt-1 text-[30px] font-semibold leading-[1.05] text-white">
                          {user.name?.split(' ')[0] || 'Usuário'}
                        </div>
                      </div>

                      <div className="mt-5 rounded-[22px] border border-white/8 bg-[#181523] p-4">
                        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                          <span className="h-2 w-2 rounded-full bg-violet-300 shadow-[0_0_10px_rgba(196,181,253,0.7)]" />
                          Análise ativa
                        </div>
                        <p className="mt-3 text-sm leading-6 text-zinc-300">
                          Analise tendências, demanda e ritmo da operação para transformar dados em ação executiva.
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2.5">
                      {assistantPrompts.map((prompt) => (
                        <button
                          key={prompt}
                          type="button"
                          className="w-full rounded-[18px] border border-white/8 bg-white/[0.03] px-4 py-3 text-left text-sm text-zinc-300 transition hover:border-violet-300/18 hover:bg-white/[0.05] hover:text-white"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>

                    <div className="mt-auto pt-4">
                      <div className="mb-3 rounded-[18px] border border-white/8 bg-white/[0.03] px-4 py-3 text-xs leading-5 text-zinc-400">
                        Processe insights, comandos e diagnósticos sem sair da tela atual.
                      </div>
                      <button
                        type="button"
                        className="w-full rounded-[18px] bg-[linear-gradient(180deg,#8d5cf6,#6c35d6)] px-4 py-3 text-sm font-medium text-white shadow-[0_16px_36px_rgba(91,33,182,0.25)] transition hover:-translate-y-0.5"
                      >
                        Analisar minha operação
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
