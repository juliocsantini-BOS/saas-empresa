import Link from 'next/link';

const navItems = ['Plataforma', 'Solucoes', 'IA', 'Seguranca', 'Contato'];

const trustItems = ['Financeiro', 'Operacoes', 'Governanca', 'Autopilot', 'Compliance', 'Multiunidade'];

const sideStats = [
  { label: 'Health score', value: '94.6' },
  { label: 'Autonomias ativas', value: '28' },
  { label: 'Liquidez projetada', value: 'R$ 8.4M' },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#05060b] text-white">
      <div className="relative isolate min-h-screen">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(162,120,255,0.12),transparent_24%),linear-gradient(180deg,#05060b_0%,#090a12_54%,#05060b_100%)]" />
          <div className="purple-stars absolute inset-0" />
          <div className="absolute left-1/2 top-[4rem] h-[18rem] w-[18rem] -translate-x-1/2 rounded-full bg-violet-400/12 blur-[120px]" />
          <div className="minimal-beam absolute left-1/2 top-[5rem] h-[26rem] w-[3px] -translate-x-1/2 rounded-full" />
          <div className="absolute left-1/2 top-[8rem] h-[20rem] w-[20rem] -translate-x-1/2 rounded-full border border-white/8 opacity-40" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:96px_96px] [mask-image:radial-gradient(circle_at_center,black,transparent_82%)] opacity-60" />
        </div>

        <div className="relative mx-auto max-w-[1520px] px-4 pb-6 pt-5 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(9,10,16,0.96),rgba(6,7,11,0.98))] shadow-[0_40px_180px_rgba(0,0,0,0.62)]">
            <header className="relative z-20 flex flex-col gap-5 px-5 py-5 md:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/14 bg-[linear-gradient(160deg,rgba(227,215,255,0.24),rgba(118,74,255,0.34))]">
                  <div className="h-4 w-4 rounded-full bg-white shadow-[0_0_24px_rgba(255,255,255,0.95)]" />
                </div>
                <div>
                  <p className="text-lg font-semibold tracking-[0.14em] text-white">ELYON OS</p>
                  <p className="text-[11px] uppercase tracking-[0.32em] text-zinc-500">
                    AI Business OS
                  </p>
                </div>
              </div>

              <nav className="mx-auto flex flex-wrap items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] p-1.5">
                <span className="rounded-full bg-white px-4 py-2 text-sm font-medium text-[#090b12]">
                  Inicio
                </span>
                {navItems.map((item) => (
                  <span
                    key={item}
                    className="rounded-full px-4 py-2 text-sm text-zinc-300 hover:bg-white/[0.05] hover:text-white"
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
                  className="rounded-full bg-[linear-gradient(135deg,#faf7ff,#d8beff_44%,#8a5cff)] px-5 py-3 text-sm font-semibold text-[#16091f] shadow-[0_16px_50px_rgba(138,92,255,0.3)]"
                >
                  Solicitar acesso
                </Link>
              </div>
            </header>

            <section className="relative px-5 pb-10 pt-8 md:px-8 lg:px-10 lg:pb-14 lg:pt-12">
              <div className="mx-auto max-w-[980px] text-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] uppercase tracking-[0.3em] text-zinc-300">
                  <span className="h-2 w-2 rounded-full bg-violet-300 shadow-[0_0_16px_rgba(196,181,253,0.95)]" />
                  Camada central de comando empresarial
                </div>

                <h1 className="mx-auto mt-8 max-w-[1080px] text-[3.2rem] font-semibold leading-[0.9] tracking-[-0.09em] text-white md:text-[5rem] xl:text-[6.5rem]">
                  Gestao, governanca
                  <br />
                  e execucao com IA
                  <br />
                  em modo flagship.
                </h1>

                <p className="mx-auto mt-7 max-w-[760px] text-base leading-8 text-zinc-400 md:text-lg">
                  O Elyon OS conecta financeiro, operacoes, estrutura organizacional,
                  automacoes e inteligencia executiva em uma unica camada premium de
                  comando.
                </p>

                <div className="mt-9 flex flex-wrap justify-center gap-4">
                  <Link
                    href="/login"
                    className="rounded-full bg-[linear-gradient(135deg,#faf7ff,#d6bcff_44%,#8a5cff)] px-7 py-4 text-sm font-semibold text-[#16091f] shadow-[0_18px_70px_rgba(138,92,255,0.34)]"
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

              <div className="relative mx-auto mt-16 max-w-[1280px]">
                <div className="absolute left-1/2 top-[1.5rem] h-[14rem] w-[34rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(157,112,255,0.24),transparent_68%)] blur-[80px]" />

                <div className="grid items-start gap-6 xl:grid-cols-[220px_minmax(0,1fr)_220px]">
                  <div className="space-y-4 xl:pt-16">
                    {sideStats.slice(0, 2).map((item) => (
                      <div
                        key={item.label}
                        className="minimal-float rounded-[24px] border border-white/8 bg-white/[0.03] p-5 backdrop-blur-xl"
                      >
                        <p className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">
                          {item.label}
                        </p>
                        <p className="mt-3 text-4xl font-semibold tracking-[-0.08em] text-white">
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="relative">
                    <div className="mx-auto max-w-[860px] rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,11,18,0.98),rgba(7,8,13,0.98))] p-4 shadow-[0_50px_140px_rgba(0,0,0,0.5)]">
                      <div className="rounded-[30px] border border-white/8 bg-[radial-gradient(circle_at_top,rgba(153,112,255,0.14),transparent_34%),linear-gradient(180deg,rgba(14,15,24,0.98),rgba(8,9,15,0.98))] p-5">
                        <div className="flex items-center justify-between rounded-[22px] border border-white/8 bg-white/[0.03] px-5 py-4">
                          <div>
                            <p className="text-[11px] uppercase tracking-[0.32em] text-zinc-500">
                              Elyon Command Center
                            </p>
                            <p className="mt-2 text-sm font-medium text-white">
                              Operacao empresarial sincronizada
                            </p>
                          </div>
                          <div className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-medium text-emerald-100">
                            tempo real
                          </div>
                        </div>

                        <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                          <div className="space-y-4">
                            <div className="rounded-[26px] border border-white/8 bg-white/[0.03] p-5">
                              <p className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">
                                Liquidez index
                              </p>
                              <div className="mt-4 flex items-end justify-between gap-4">
                                <p className="text-6xl font-semibold tracking-[-0.09em] text-white">
                                  86%
                                </p>
                                <div className="h-24 w-24 rounded-full border border-violet-200/15 border-t-violet-200/95 border-r-violet-300/55" />
                              </div>
                            </div>

                            <div className="rounded-[26px] border border-white/8 bg-white/[0.03] p-5">
                              <p className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">
                                Core metrics
                              </p>
                              <div className="mt-5 grid grid-cols-7 items-end gap-2">
                                {[40, 54, 62, 58, 76, 88, 102].map((height, index) => (
                                  <div key={height} className="flex flex-col items-center gap-2">
                                    <div
                                      className={`w-full rounded-full ${
                                        index === 6
                                          ? 'bg-[linear-gradient(180deg,#fff0ff,#9c6dff)] shadow-[0_0_18px_rgba(156,109,255,0.38)]'
                                          : 'bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(128,88,255,0.14))]'
                                      }`}
                                      style={{ height: `${height}px` }}
                                    />
                                    <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-600">
                                      {index + 1}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            {[
                              ['Governanca multiunidade', '8 unidades sob monitoramento'],
                              ['Autopilot de execucao', '28 autonomias ativas'],
                              ['Compliance operacional', '100% conforme nas politicas chave'],
                            ].map(([title, meta]) => (
                              <div
                                key={title}
                                className="minimal-float-delayed rounded-[24px] border border-white/8 bg-white/[0.03] p-5"
                              >
                                <p className="text-sm font-medium text-white">{title}</p>
                                <p className="mt-2 text-sm leading-7 text-zinc-400">{meta}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="mt-5 grid gap-4 md:grid-cols-3">
                          {[
                            ['Financeiro', 'Caixa, cobranca, pagamentos e aprovacoes numa unica camada.'],
                            ['Operacoes', 'Estrutura, fluxo e governanca empresarial conectados.'],
                            ['IA executiva', 'Alertas, recomendacoes e acao assistida por contexto.'],
                          ].map(([title, body]) => (
                            <div
                              key={title}
                              className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4"
                            >
                              <p className="text-sm font-medium text-white">{title}</p>
                              <p className="mt-3 text-sm leading-7 text-zinc-400">{body}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="xl:pt-20">
                    <div className="minimal-float-slow rounded-[24px] border border-white/8 bg-white/[0.03] p-5 backdrop-blur-xl">
                      <p className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">
                        Liquidez projetada
                      </p>
                      <p className="mt-3 text-4xl font-semibold tracking-[-0.08em] text-white">
                        {sideStats[2].value}
                      </p>
                      <p className="mt-2 text-sm leading-7 text-zinc-400">
                        Visibilidade de caixa, recovery e rebalanceamento em um unico cockpit.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="border-t border-white/8 px-5 py-6 md:px-8 lg:px-10">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <p className="text-[11px] uppercase tracking-[0.32em] text-zinc-500">
                  Construido para operacao, comando e crescimento empresarial
                </p>
                <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm font-medium text-zinc-500">
                  {trustItems.map((item) => (
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
