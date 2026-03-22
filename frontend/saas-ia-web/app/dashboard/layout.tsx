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
  'Resuma a operação do dia e destaque anomalias financeiras.',
  'Quais aprovações estão travando a execução neste momento?',
  'Monte um plano de ação executivo para a próxima semana.',
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
      <div className="flex min-h-screen items-center justify-center bg-[#07080D] text-white">
        <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] px-6 py-4 text-sm text-zinc-300 shadow-[0_18px_48px_rgba(0,0,0,0.22)]">
          Carregando ELYON OS...
        </div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07080D] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(140,92,246,0.16),transparent_26%),linear-gradient(180deg,#07080D_0%,#090913_52%,#05060B_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.028)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.028)_1px,transparent_1px)] bg-[size:88px_88px] opacity-[0.17] [mask-image:radial-gradient(circle_at_center,black,transparent_84%)]" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[28rem] w-[34rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(143,92,246,0.2),transparent_70%)] blur-[110px]" />

      <div className="relative flex min-h-screen">
        <aside className="hidden w-[244px] shrink-0 border-r border-white/8 bg-[linear-gradient(180deg,rgba(16,13,29,0.92),rgba(11,10,19,0.98))] px-4 py-5 lg:flex lg:flex-col">
          <div className="mb-6 flex items-center gap-3 rounded-[22px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] px-3 py-3 shadow-[0_18px_42px_rgba(0,0,0,0.18)]">
            <div className="flex h-11 w-11 items-center justify-center rounded-[18px] bg-[radial-gradient(circle_at_top,rgba(186,149,255,0.46),rgba(101,54,210,0.42))] shadow-[0_10px_36px_rgba(124,58,237,0.35)]">
              <div className="h-3.5 w-3.5 rounded-full bg-white" />
            </div>

            <div>
              <div className="text-sm font-semibold tracking-tight text-white">ELYON OS</div>
              <div className="text-xs text-zinc-500">AI Business OS</div>
            </div>
          </div>

          <div className="space-y-5">
            {menuGroups.map((group) => (
              <div key={group.title}>
                <div className="mb-2.5 px-2 text-[10px] uppercase tracking-[0.28em] text-zinc-500">
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
                            ? 'flex items-center gap-3 rounded-[20px] border border-violet-300/16 bg-[radial-gradient(circle_at_left,rgba(167,139,250,0.18),transparent_62%),linear-gradient(180deg,rgba(130,80,238,0.18),rgba(82,44,180,0.1))] px-3 py-3 text-sm font-medium text-white shadow-[0_12px_30px_rgba(91,33,182,0.18)]'
                            : 'flex items-center gap-3 rounded-[20px] border border-transparent px-3 py-3 text-sm text-zinc-400 transition duration-200 hover:border-white/8 hover:bg-white/4 hover:text-white'
                        }
                      >
                        <span
                          className={
                            active
                              ? 'h-2 w-2 rounded-full bg-violet-200 shadow-[0_0_16px_rgba(196,181,253,0.65)]'
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

          <div className="mt-auto space-y-3">
            <Link
              href="/dashboard/ai"
              className="flex items-center justify-between rounded-[22px] border border-violet-300/16 bg-[radial-gradient(circle_at_top,rgba(167,139,250,0.16),transparent_55%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] px-4 py-3 text-sm text-zinc-200 shadow-[0_18px_38px_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5 hover:border-violet-300/22"
            >
              <div>
                <div className="text-xs uppercase tracking-[0.22em] text-violet-200/80">IA</div>
                <div className="mt-1 font-medium text-white">Assistente Elyon</div>
              </div>
              <div className="rounded-full border border-white/10 bg-white/6 px-2.5 py-1 text-[11px] text-zinc-300">
                ao vivo
              </div>
            </Link>

            <div className="rounded-[26px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.02))] p-3.5 shadow-[0_18px_46px_rgba(0,0,0,0.2)]">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),rgba(124,58,237,0.3))] text-sm font-semibold text-white shadow-[0_10px_26px_rgba(124,58,237,0.25)]">
                  {userInitials}
                </div>

                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-white">{user.name || 'Usuário ELYON'}</div>
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

        <section className="relative min-w-0 flex-1">
          <div className={`px-4 py-4 transition-all duration-300 md:px-6 xl:px-8 ${aiExpanded ? '2xl:pr-[23rem]' : '2xl:pr-[7.5rem]'}`}>
            <header className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.038),rgba(255,255,255,0.018))] px-5 py-4 shadow-[0_18px_48px_rgba(0,0,0,0.18)]">
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
                  className="hidden rounded-[20px] border border-violet-300/16 bg-[radial-gradient(circle_at_top,rgba(167,139,250,0.16),transparent_65%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] px-4 py-3 text-sm font-medium text-white shadow-[0_12px_28px_rgba(91,33,182,0.14)] transition hover:-translate-y-0.5 hover:border-violet-300/24 2xl:inline-flex"
                >
                  IA
                </button>

                <button
                  onClick={logout}
                  className="rounded-[20px] border border-white/10 bg-white px-4 py-3 text-sm font-medium text-black transition hover:bg-zinc-200"
                >
                  Logout
                </button>
              </div>
            </header>

            <div>{children}</div>
          </div>

          <button
            type="button"
            onClick={() => setAiExpanded((current) => !current)}
            className="fixed bottom-6 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full border border-violet-300/18 bg-[radial-gradient(circle_at_top,rgba(196,181,253,0.28),transparent_56%),linear-gradient(180deg,rgba(117,63,236,0.9),rgba(74,37,164,0.92))] text-sm font-semibold text-white shadow-[0_16px_42px_rgba(91,33,182,0.32)] transition hover:scale-[1.03] 2xl:hidden"
          >
            IA
          </button>

          <div
            className={`pointer-events-none fixed right-4 top-24 z-20 hidden h-[calc(100vh-7rem)] w-[336px] transition-all duration-300 2xl:block ${
              aiExpanded ? 'translate-x-0 opacity-100' : 'translate-x-[18.5rem] opacity-100'
            }`}
          >
            <div className="pointer-events-auto flex h-full flex-col overflow-hidden rounded-[32px] border border-violet-300/12 bg-[radial-gradient(circle_at_top,rgba(167,139,250,0.12),transparent_32%),linear-gradient(180deg,rgba(15,11,27,0.96),rgba(11,10,19,0.98))] shadow-[0_26px_70px_rgba(0,0,0,0.3)]">
              <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.28em] text-violet-200/70">Copiloto</div>
                  <div className="mt-1 text-lg font-semibold text-white">IA assistente</div>
                </div>

                <button
                  type="button"
                  onClick={() => setAiExpanded(false)}
                  className="rounded-full border border-white/8 bg-white/4 px-3 py-1.5 text-xs text-zinc-300 transition hover:bg-white/8"
                >
                  Fechar
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-5">
                <div className="rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-4">
                  <div className="text-sm font-medium text-white">Boa tarde, {user.name?.split(' ')[0] || 'time'}.</div>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    Posso resumir decisões, gerar análises e apoiar a operação em qualquer módulo sem interromper sua tela.
                  </p>
                </div>

                <div className="mt-5 space-y-3">
                  {assistantPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      className="w-full rounded-[22px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] px-4 py-3 text-left text-sm text-zinc-300 transition hover:-translate-y-0.5 hover:border-violet-300/18 hover:text-white"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>

                <div className="mt-5 rounded-[24px] border border-violet-300/12 bg-[radial-gradient(circle_at_top,rgba(167,139,250,0.14),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(0,0,0,0.16))] p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-white">Pulse now</div>
                    <div className="rounded-full border border-white/8 bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-[0.22em] text-zinc-300">
                      ativo
                    </div>
                  </div>
                  <div className="mt-4 space-y-3">
                    <div className="rounded-[18px] border border-white/8 bg-black/20 px-3 py-3">
                      <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">Financeiro</div>
                      <div className="mt-1 text-sm text-white">4 variações relevantes detectadas no fechamento do dia.</div>
                    </div>
                    <div className="rounded-[18px] border border-white/8 bg-black/20 px-3 py-3">
                      <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">Operações</div>
                      <div className="mt-1 text-sm text-white">1 fluxo pede aprovação executiva antes das 18h.</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/8 px-5 py-4">
                <button
                  type="button"
                  className="w-full rounded-[22px] border border-violet-300/16 bg-[radial-gradient(circle_at_top,rgba(196,181,253,0.2),transparent_45%),linear-gradient(180deg,rgba(117,63,236,0.92),rgba(73,36,170,0.94))] px-4 py-3 text-sm font-medium text-white shadow-[0_16px_36px_rgba(91,33,182,0.25)] transition hover:-translate-y-0.5"
                >
                  Abrir workspace da IA
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
