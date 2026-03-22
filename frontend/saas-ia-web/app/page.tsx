import Link from 'next/link';

const navItems = ['Home', 'Plataforma', 'Solucoes', 'IA', 'Contato'];

const logos = ['Financeiro', 'Operacoes', 'Compliance', 'Autopilot', 'Governanca', 'Multiunidade'];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#05060b] text-white">
      <div className="relative isolate min-h-screen">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(180,138,255,0.2),transparent_22%),linear-gradient(180deg,#070812_0%,#090916_45%,#06070d_100%)]" />
          <div className="purple-stars absolute inset-0" />
          <div className="absolute inset-x-0 top-0 h-[16rem] bg-[radial-gradient(circle_at_top,rgba(194,163,255,0.18),transparent_60%)]" />
          <div className="absolute left-1/2 top-[8.5rem] h-[30rem] w-[34rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(141,92,246,0.34),transparent_72%)] blur-[120px]" />
          <div className="absolute left-1/2 top-[11rem] h-[3px] w-[30rem] -translate-x-1/2 rounded-full bg-[linear-gradient(90deg,transparent,rgba(215,194,255,0.95),transparent)] blur-sm" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:110px_110px] [mask-image:radial-gradient(circle_at_center,black,transparent_84%)] opacity-40" />
        </div>

        <div className="relative mx-auto max-w-[1500px] px-4 pb-6 pt-5 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-[34px] border border-violet-200/12 bg-[linear-gradient(180deg,rgba(10,10,18,0.98),rgba(7,8,14,0.98))] shadow-[0_50px_220px_rgba(0,0,0,0.62)]">
            <header className="relative z-20 flex flex-col gap-5 px-5 py-5 md:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-violet-200/12 bg-[linear-gradient(160deg,rgba(226,214,255,0.22),rgba(130,78,255,0.36))] shadow-[0_0_32px_rgba(130,78,255,0.16)]">
                  <div className="h-4 w-4 rounded-full bg-white shadow-[0_0_22px_rgba(255,255,255,0.9)]" />
                </div>
                <div>
                  <p className="text-lg font-semibold tracking-[0.14em] text-white">ELYON OS</p>
                  <p className="text-[11px] uppercase tracking-[0.32em] text-zinc-500">
                    AI Business OS
                  </p>
                </div>
              </div>

              <nav className="mx-auto flex flex-wrap items-center gap-2 rounded-full border border-violet-200/12 bg-white/[0.05] px-2 py-1.5 shadow-[0_0_40px_rgba(141,92,246,0.08)]">
                {navItems.map((item, index) => (
                  <span
                    key={item}
                    className={`rounded-full px-4 py-2 text-sm ${
                      index === 0
                        ? 'bg-white text-[#090b12] font-medium'
                        : 'text-zinc-300 hover:bg-white/[0.05] hover:text-white'
                    }`}
                  >
                    {item}
                  </span>
                ))}
              </nav>

              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium text-zinc-100"
                >
                  Login
                </Link>
                <Link
                  href="mailto:contato@elyonos.com.br"
                  className="rounded-full bg-[linear-gradient(135deg,#efe6ff,#b688ff_50%,#7c3aed)] px-5 py-3 text-sm font-semibold text-[#14081d] shadow-[0_16px_50px_rgba(124,58,237,0.34)]"
                >
                  Solicitar acesso
                </Link>
              </div>
            </header>

            <section className="relative px-5 pb-10 pt-8 md:px-8 lg:px-10 lg:pb-14 lg:pt-10">
              <div className="mx-auto max-w-[940px] text-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-violet-200/12 bg-white/[0.04] px-4 py-2 text-[11px] uppercase tracking-[0.3em] text-zinc-300">
                  <span className="h-2 w-2 rounded-full bg-violet-300 shadow-[0_0_16px_rgba(196,181,253,0.95)]" />
                  Operacao empresarial com IA em tempo real
                </div>

                <h1 className="mx-auto mt-8 max-w-[980px] text-[3.25rem] font-semibold leading-[0.95] tracking-[-0.08em] text-white md:text-[5rem] xl:text-[5.8rem]">
                  Inteligencia operacional
                  <br />
                  para empresas que
                  <br />
                  executam em escala.
                </h1>

                <p className="mx-auto mt-7 max-w-[760px] text-base leading-8 text-zinc-400 md:text-lg">
                  O Elyon OS unifica financeiro, operacoes, estrutura organizacional,
                  governanca, automacoes e execucao assistida por IA em uma unica camada
                  premium de comando.
                </p>

                <div className="mt-9 flex flex-wrap justify-center gap-4">
                  <Link
                    href="/login"
                    className="rounded-full bg-[linear-gradient(135deg,#f6f1ff,#c9a7ff_46%,#8a5cff)] px-7 py-4 text-sm font-semibold text-[#170920] shadow-[0_18px_80px_rgba(138,92,255,0.3)]"
                  >
                    Entrar na plataforma
                  </Link>
                  <Link
                    href="mailto:contato@elyonos.com.br"
                    className="rounded-full border border-white/10 bg-white/[0.03] px-7 py-4 text-sm font-medium text-zinc-100"
                  >
                    Falar com especialista
                  </Link>
                </div>
              </div>

              <div className="relative mx-auto mt-14 max-w-[1240px]">
                <div className="absolute inset-x-[6%] top-0 h-4 rounded-full bg-violet-300/80 blur-[16px]" />
                <div className="absolute inset-x-[18%] top-[3px] h-[2px] rounded-full bg-white/90 blur-[3px]" />

                <div className="relative rounded-[34px] border border-violet-200/16 bg-[linear-gradient(180deg,rgba(20,13,37,0.98),rgba(7,8,14,0.98))] p-3 shadow-[0_60px_180px_rgba(0,0,0,0.56),0_0_100px_rgba(132,78,255,0.14)]">
                  <div className="rounded-[30px] border border-violet-200/12 bg-[radial-gradient(circle_at_top,rgba(157,112,255,0.18),transparent_28%),linear-gradient(180deg,rgba(18,12,34,0.98),rgba(10,10,18,0.98))] p-5">
                    <div className="flex items-center justify-between border-b border-white/8 pb-5">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-violet-400/20" />
                        <div>
                          <p className="text-sm font-medium text-white">ELYON OS</p>
                          <p className="text-xs text-zinc-500">Dashboard executivo</p>
                        </div>
                      </div>
                      <div className="rounded-full border border-white/8 bg-white/[0.03] px-4 py-2 text-xs text-zinc-300">
                        tempo real
                      </div>
                    </div>

                    <div className="mt-5 grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)_280px]">
                      <div className="space-y-4">
                        <div className="rounded-[24px] border border-violet-200/10 bg-white/[0.03] p-5">
                          <div className="space-y-3 text-sm text-zinc-400">
                            <div className="rounded-2xl bg-violet-400/18 px-4 py-3 text-white">
                              Dashboard executivo
                            </div>
                            <div className="rounded-2xl border border-white/6 px-4 py-3">Financeiro</div>
                            <div className="rounded-2xl border border-white/6 px-4 py-3">Operacoes</div>
                            <div className="rounded-2xl border border-white/6 px-4 py-3">Governanca</div>
                            <div className="rounded-2xl border border-white/6 px-4 py-3">IA executiva</div>
                          </div>
                        </div>

                        <div className="minimal-float rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
                          <p className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">
                            Health score
                          </p>
                          <p className="mt-3 text-4xl font-semibold tracking-[-0.08em] text-white">
                            94.6
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-3">
                          {[
                            ['R$ 90,3M', 'Liquidez total'],
                            ['R$ 12,9M', 'Fluxo mensal'],
                            ['67,3M', 'Execucao ativa'],
                          ].map(([value, label]) => (
                            <div
                              key={label}
                              className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4"
                            >
                              <p className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                                {label}
                              </p>
                              <p className="mt-4 text-3xl font-semibold tracking-[-0.08em] text-white">
                                {value}
                              </p>
                            </div>
                          ))}
                        </div>

                        <div className="rounded-[28px] border border-violet-200/10 bg-white/[0.03] p-5">
                          <div className="flex items-center justify-between">
                            <p className="text-3xl font-semibold tracking-[-0.06em] text-white">
                              Dashboard
                            </p>
                            <div className="rounded-full border border-white/8 px-3 py-1 text-xs text-zinc-300">
                              Weekly
                            </div>
                          </div>

                          <div className="mt-6 flex h-[300px] items-end gap-3">
                            {[26, 38, 34, 48, 42, 58, 88].map((height, index) => (
                              <div key={height} className="flex flex-1 flex-col items-center gap-3">
                                <div
                                  className={`w-full rounded-full ${
                                    index === 6
                                      ? 'bg-[linear-gradient(180deg,#fffaff,#d4bbff_44%,#8a5cff)] shadow-[0_0_24px_rgba(138,92,255,0.42)]'
                                      : 'bg-[linear-gradient(180deg,rgba(255,255,255,0.86),rgba(130,87,255,0.18))]'
                                  }`}
                                  style={{ height: `${height}%` }}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="minimal-float-delayed rounded-[24px] border border-violet-200/10 bg-[linear-gradient(180deg,rgba(196,146,255,0.28),rgba(92,46,194,0.24))] p-5">
                          <p className="text-sm font-medium text-white">Liquidez projetada</p>
                          <p className="mt-3 text-4xl font-semibold tracking-[-0.08em] text-white">
                            R$ 8.4M
                          </p>
                        </div>

                        <div className="minimal-float rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
                          <p className="text-sm font-medium text-white">Autonomias ativas</p>
                          <p className="mt-3 text-3xl font-semibold tracking-[-0.08em] text-white">28</p>
                        </div>

                        <div className="minimal-float-slow rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
                          <p className="text-sm font-medium text-white">Posicoes estrategicas</p>
                          <p className="mt-3 text-sm leading-7 text-zinc-400">
                            Financeiro, governanca, operacoes e IA executiva em um unico
                            cockpit operacional.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="border-t border-white/8 px-5 py-6 md:px-8 lg:px-10">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <p className="text-[11px] uppercase tracking-[0.32em] text-zinc-500">
                  Construido para empresas que operam com ambicao, controle e escala
                </p>
                <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm font-medium text-zinc-500">
                  {logos.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
