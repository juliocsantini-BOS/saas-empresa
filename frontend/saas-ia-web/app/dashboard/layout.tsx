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
  'Destaque gargalos na execução.',
  'Gerar plano executivo da semana.',
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
        <aside className="hidden h-full w-[248px] shrink-0 border-r border-white/8 bg-[#0d0c16] lg:flex lg:flex-col">
          <div className="px-4 py-5">
            <div className="flex items-center gap-3 rounded-[24px] border border-white/8 bg-white/[0.03] px-3 py-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[linear-gradient(180deg,rgba(141,92,246,0.95),rgba(92,52,196,0.95))] text-sm font-semibold text-white">
                EO
              </div>
              <div>
                <div className="text-sm font-semibold text-white">ELYON OS</div>
                <div className="text-xs text-zinc-500">AI Business OS</div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-4">
            <div className="space-y-5">
              {menuGroups.map((group) => (
                <div key={group.title}>
                  <div className="mb-2 px-2 text-[10px] uppercase tracking-[0.28em] text-zinc-500">
                    {group.title}
                  </div>

                  <nav className="space-y-1.5">
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
                              ? 'flex items-center gap-3 rounded-[18px] border border-violet-300/14 bg-[linear-gradient(180deg,rgba(141,92,246,0.18),rgba(141,92,246,0.08))] px-3 py-3 text-sm font-medium text-white'
                              : 'flex items-center gap-3 rounded-[18px] border border-transparent px-3 py-3 text-sm text-zinc-400 transition hover:border-white/8 hover:bg-white/[0.03] hover:text-white'
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
          </div>

          <div className="border-t border-white/8 p-4">
            <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-3.5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[linear-gradient(180deg,rgba(141,92,246,0.95),rgba(92,52,196,0.95))] text-sm font-semibold text-white">
                  {userInitials}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-white">{user.name || 'Usuário'}</div>
                  <div className="truncate text-xs text-zinc-500">{user.email || user.role}</div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between rounded-[18px] border border-white/8 bg-black/20 px-3 py-2 text-xs text-zinc-400">
                <span>{user.role}</span>
                <span className="rounded-full border border-white/8 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-zinc-300">
                  online
                </span>
              </div>
            </div>
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 overflow-hidden">
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
            className={`hidden h-full shrink-0 border-l border-white/8 bg-[#120f1e] transition-[width] duration-300 xl:block ${
              aiExpanded ? 'w-[318px]' : 'w-[84px]'
            }`}
          >
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-white/8 px-4 py-4">
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-[0.22em] text-violet-200/70">IA Assistant</div>
                  {aiExpanded ? <div className="mt-1 truncate text-sm font-medium text-white">Copiloto Elyon</div> : null}
                </div>

                <button
                  type="button"
                  onClick={() => setAiExpanded((current) => !current)}
                  className="rounded-full border border-white/8 bg-white/[0.04] px-3 py-1.5 text-xs text-zinc-300"
                >
                  {aiExpanded ? '×' : '+'}
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3">
                {aiExpanded ? (
                  <div className="flex h-full flex-col">
                    <div className="rounded-[24px] border border-white/8 bg-white/[0.04] p-4">
                      <div className="text-sm text-zinc-400">Good afternoon,</div>
                      <div className="mt-1 text-3xl font-semibold leading-tight text-white">
                        {user.name?.split(' ')[0] || 'Usuário'}
                      </div>

                      <div className="mt-4 rounded-[20px] border border-white/8 bg-[#1a1628] p-4">
                        <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">Análise</div>
                        <p className="mt-3 text-sm leading-6 text-zinc-300">
                          Analise mercado, execução, demanda e comportamento operacional em tempo real.
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
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
                      <button
                        type="button"
                        className="w-full rounded-[18px] bg-[linear-gradient(180deg,#8d5cf6,#6c35d6)] px-4 py-3 text-sm font-medium text-white shadow-[0_16px_36px_rgba(91,33,182,0.25)] transition hover:-translate-y-0.5"
                      >
                        Analisar minha operação
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full flex-col items-center justify-between py-2">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-violet-300/18 bg-violet-500/14 text-sm font-semibold text-white">
                      IA
                    </div>

                    <div className="space-y-3">
                      <div className="h-10 w-10 rounded-2xl border border-white/8 bg-white/[0.03]" />
                      <div className="h-10 w-10 rounded-2xl border border-white/8 bg-white/[0.03]" />
                      <div className="h-10 w-10 rounded-2xl border border-white/8 bg-white/[0.03]" />
                    </div>

                    <button
                      type="button"
                      onClick={() => setAiExpanded(true)}
                      className="h-11 w-11 rounded-2xl bg-[linear-gradient(180deg,#8d5cf6,#6c35d6)] text-sm font-semibold text-white shadow-[0_16px_36px_rgba(91,33,182,0.25)]"
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
