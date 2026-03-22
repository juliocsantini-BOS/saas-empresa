import Link from 'next/link';

const navItems = ['Plataforma', 'Solucoes', 'IA', 'Seguranca', 'Contato'];

const capabilityCards = [
  {
    eyebrow: 'Gestao financeira',
    title: 'Liquidez, cobranca e procurement em uma camada unica.',
    body: 'Caixa, aprovacoes, pagamentos, dunning e inteligencia financeira operando no mesmo cockpit.',
  },
  {
    eyebrow: 'Operacoes e estrutura',
    title: 'Multiempresa, filiais, centros de decisao e execucao conectados.',
    body: 'Estrutura organizacional, owners, areas e rotinas fluindo com visibilidade executiva.',
  },
  {
    eyebrow: 'Governanca e compliance',
    title: 'Permissoes, rastreabilidade e guardrails desde a base.',
    body: 'RBAC, trilha de auditoria e aprovacao por excecao sem virar um ERP engessado.',
  },
  {
    eyebrow: 'Execucao com IA',
    title: 'A camada operacional que transforma insight em acao.',
    body: 'Autopilots, alertas, orchestration e command feeds guiando a operacao em tempo real.',
  },
];

const trustItems = ['Multiunidade', 'Financeiro', 'Governanca', 'Autopilot', 'Compliance', 'AI Command'];

const metricCards = [
  { label: 'Autonomias ativas', value: '28', accent: 'violet' },
  { label: 'Health score', value: '94.6', accent: 'emerald' },
  { label: 'Liquidez projetada', value: 'R$ 8.4M', accent: 'rose' },
];

const commandFeed = [
  ['Rebalanceamento', '2 acoes prontas para execucao'],
  ['Recovery financeiro', '8 cobrancas prioritarias detectadas'],
  ['Governanca', '0 gaps criticos em politicas chave'],
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#05060b] text-white">
      <div className="relative isolate min-h-screen">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_14%,rgba(162,120,255,0.15),transparent_26%),radial-gradient(circle_at_14%_26%,rgba(255,94,177,0.09),transparent_20%),radial-gradient(circle_at_86%_24%,rgba(133,92,255,0.12),transparent_22%),linear-gradient(180deg,#06070d_0%,#090a13_44%,#05060b_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:92px_92px] [mask-image:radial-gradient(circle_at_center,black,transparent_78%)] opacity-60" />
          <div className="hero-noise absolute inset-0 opacity-40" />
          <div className="beam-core absolute left-1/2 top-[4.5rem] h-[28rem] w-[6px] -translate-x-1/2 rounded-full" />
          <div className="beam-glow absolute left-1/2 top-[3rem] h-[38rem] w-[28rem] -translate-x-1/2" />
          <div className="orb-shell absolute left-1/2 top-[10rem] h-[24rem] w-[24rem] -translate-x-1/2 rounded-full" />
          <div className="absolute left-1/2 top-[23rem] h-[28rem] w-[28rem] -translate-x-1/2 rounded-full border border-white/8 opacity-40" />
          <div className="absolute left-1/2 top-[28rem] h-[36rem] w-[36rem] -translate-x-1/2 rounded-full border border-white/6 opacity-20" />
        </div>

        <div className="relative mx-auto max-w-[1540px] px-4 pb-6 pt-5 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,11,18,0.96),rgba(7,8,13,0.98))] shadow-[0_40px_180px_rgba(0,0,0,0.65)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_30%)]" />

            <header className="relative z-20 flex flex-col gap-5 px-5 py-5 md:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/14 bg-[linear-gradient(160deg,rgba(227,215,255,0.25),rgba(118,74,255,0.38))] shadow-[0_12px_40px_rgba(126,87,255,0.25)]">
                  <div className="h-4 w-4 rounded-full bg-white shadow-[0_0_22px_rgba(255,255,255,0.95)]" />
                </div>
                <div>
                  <p className="text-lg font-semibold tracking-[0.14em] text-white">ELYON OS</p>
                  <p className="text-[11px] uppercase tracking-[0.32em] text-zinc-500">
                    AI Business OS
                  </p>
                </div>
              </div>

              <nav className="mx-auto flex flex-wrap items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
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
                  className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium text-zinc-100 backdrop-blur-xl"
                >
                  Login
                </Link>
                <Link
                  href="mailto:contato@elyonos.com.br"
                  className="rounded-full bg-[linear-gradient(135deg,#f6f0ff,#d8beff_42%,#8a5cff)] px-5 py-3 text-sm font-semibold text-[#170a22] shadow-[0_18px_60px_rgba(138,92,255,0.35)]"
                >
                  Solicitar acesso
                </Link>
              </div>
            </header>

            <section className="relative z-10 px-5 pb-8 pt-4 md:px-8 lg:px-10 lg:pb-12">
              <div className="grid items-start gap-12 xl:grid-cols-[minmax(0,560px)_minmax(0,1fr)]">
                <div className="relative z-20 pt-8 lg:pt-14">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] uppercase tracking-[0.3em] text-zinc-300">
                    <span className="h-2 w-2 rounded-full bg-violet-300 shadow-[0_0_16px_rgba(196,181,253,0.95)]" />
                    Camada empresarial de comando com IA
                  </div>

                  <h1 className="mt-8 max-w-[780px] text-[3.2rem] font-semibold leading-[0.9] tracking-[-0.09em] text-white md:text-[5rem] xl:text-[6.35rem]">
                    O sistema operacional para empresas que operam em modo flagship.
                  </h1>

                  <p className="mt-7 max-w-[590px] text-base leading-8 text-zinc-400 md:text-lg">
                    O Elyon OS conecta gestao, financeiro, governanca, operacoes,
                    automacoes e inteligencia executiva em uma unica camada viva de
                    execucao.
                  </p>

                  <div className="mt-9 flex flex-wrap gap-4">
                    <Link
                      href="/login"
                      className="rounded-full bg-[linear-gradient(135deg,#faf7ff,#d6bcff_44%,#8a5cff)] px-7 py-4 text-sm font-semibold text-[#16091f] shadow-[0_18px_80px_rgba(138,92,255,0.34)]"
                    >
                      Entrar na plataforma
                    </Link>
                    <Link
                      href="mailto:contato@elyonos.com.br"
                      className="rounded-full border border-white/10 bg-white/[0.03] px-7 py-4 text-sm font-medium text-zinc-100 backdrop-blur-xl"
                    >
                      Falar com especialista
                    </Link>
                  </div>

                  <div className="mt-10 grid gap-4 sm:grid-cols-3">
                    {metricCards.map((item) => (
                      <div
                        key={item.label}
                        className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                      >
                        <p className="text-[11px] uppercase tracking-[0.25em] text-zinc-500">
                          {item.label}
                        </p>
                        <p
                          className={`mt-3 text-3xl font-semibold tracking-[-0.08em] ${
                            item.accent === 'emerald'
                              ? 'text-emerald-200'
                              : item.accent === 'rose'
                                ? 'text-rose-100'
                                : 'text-white'
                          }`}
                        >
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative min-h-[760px] xl:min-h-[840px]">
                  <div className="floating-card absolute left-0 top-[8rem] z-20 w-[210px] rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(22,18,36,0.88),rgba(13,12,21,0.92))] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.4)] backdrop-blur-xl">
                    <p className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">
                      Health score
                    </p>
                    <p className="mt-3 text-4xl font-semibold tracking-[-0.08em] text-white">
                      94.2
                    </p>
                    <p className="mt-2 text-sm text-zinc-400">Excelente postura operacional</p>
                  </div>

                  <div className="floating-card-delayed absolute right-0 top-[7rem] z-20 w-[210px] rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(24,16,40,0.88),rgba(14,12,24,0.92))] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.4)] backdrop-blur-xl">
                    <p className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">
                      Automacoes
                    </p>
                    <p className="mt-3 text-4xl font-semibold tracking-[-0.08em] text-white">23</p>
                    <p className="mt-2 text-sm text-zinc-400">Ativas na camada de execucao</p>
                  </div>

                  <div className="floating-card-slow absolute bottom-[8rem] left-[3rem] z-20 w-[220px] rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(19,17,34,0.9),rgba(12,11,20,0.94))] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.44)] backdrop-blur-xl">
                    <p className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">
                      Fluxo de caixa
                    </p>
                    <p className="mt-3 text-3xl font-semibold tracking-[-0.08em] text-white">
                      R$ 8.4M
                    </p>
                    <p className="mt-2 text-sm text-zinc-400">Liquidez projetada para 30 dias</p>
                  </div>

                  <div className="absolute inset-x-0 top-[10rem] mx-auto h-[70%] max-w-[840px]">
                    <div className="perspective-[2400px] relative h-full">
                      <div className="absolute inset-x-[4%] top-0 h-[92%] rotate-[-8deg] rounded-[42px] border border-white/12 bg-[linear-gradient(180deg,rgba(12,13,20,0.98),rgba(7,8,14,0.98))] p-4 shadow-[0_60px_160px_rgba(0,0,0,0.56)]">
                        <div className="absolute inset-x-[18%] top-[-1.4rem] h-[6rem] rounded-full bg-[radial-gradient(circle,rgba(255,149,74,0.8),rgba(255,125,54,0.18)_38%,transparent_74%)] blur-[26px]" />
                        <div className="absolute inset-x-[8%] top-[-0.2rem] h-[2px] bg-[linear-gradient(90deg,transparent,rgba(255,183,120,0.9),transparent)]" />

                        <div className="relative h-full rounded-[34px] border border-white/8 bg-[radial-gradient(circle_at_top,rgba(160,120,255,0.16),transparent_30%),linear-gradient(180deg,rgba(15,16,26,0.98),rgba(8,9,15,0.98))] p-5">
                          <div className="flex items-center justify-between rounded-[22px] border border-white/8 bg-white/[0.03] px-5 py-4">
                            <div>
                              <p className="text-[11px] uppercase tracking-[0.32em] text-zinc-500">
                                Elyon Command Center
                              </p>
                              <p className="mt-2 text-sm font-medium text-white">
                                Operacao empresarial unificada
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="h-2.5 w-2.5 rounded-full bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,0.95)]" />
                              <span className="text-xs uppercase tracking-[0.26em] text-zinc-500">
                                ao vivo
                              </span>
                            </div>
                          </div>

                          <div className="mt-5 grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
                            <div className="space-y-4">
                              <div className="rounded-[28px] border border-white/8 bg-white/[0.03] p-5">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">
                                      Liquidez index
                                    </p>
                                    <p className="mt-3 text-5xl font-semibold tracking-[-0.08em] text-white">
                                      86%
                                    </p>
                                  </div>
                                  <div className="h-28 w-28 rounded-full border border-white/10 bg-[radial-gradient(circle,rgba(255,255,255,0.12),transparent_60%)] p-3">
                                    <div className="h-full w-full rounded-full border border-violet-200/15 border-t-violet-200/90 border-r-violet-300/55" />
                                  </div>
                                </div>
                              </div>

                              <div className="rounded-[28px] border border-white/8 bg-white/[0.03] p-5">
                                <p className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">
                                  Core metrics
                                </p>
                                <div className="mt-5 grid grid-cols-7 items-end gap-2">
                                  {[42, 56, 68, 62, 78, 91, 106].map((height, index) => (
                                    <div key={height} className="flex flex-col items-center gap-2">
                                      <div
                                        className={`w-full rounded-full ${
                                          index === 6
                                            ? 'bg-[linear-gradient(180deg,#fff0ff,#9c6dff)] shadow-[0_0_18px_rgba(156,109,255,0.4)]'
                                            : 'bg-[linear-gradient(180deg,rgba(255,255,255,0.7),rgba(128,88,255,0.14))]'
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
                              <div className="rounded-[28px] border border-white/8 bg-white/[0.03] p-5">
                                <p className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">
                                  Estrutura empresarial
                                </p>
                                <div className="mt-5 space-y-3">
                                  {[
                                    ['Holding', '5 entidades sincronizadas'],
                                    ['Matriz', '14 areas operacionais'],
                                    ['Filiais', '8 unidades rastreadas'],
                                  ].map(([title, meta]) => (
                                    <div
                                      key={title}
                                      className="flex items-center justify-between rounded-[18px] border border-white/8 bg-black/20 px-4 py-3"
                                    >
                                      <div>
                                        <p className="text-sm font-medium text-white">{title}</p>
                                        <p className="text-xs text-zinc-500">{meta}</p>
                                      </div>
                                      <span className="h-2.5 w-2.5 rounded-full bg-violet-300 shadow-[0_0_12px_rgba(196,181,253,0.95)]" />
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(133,92,255,0.12),rgba(255,255,255,0.02))] p-5">
                                <p className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">
                                  Command feed
                                </p>
                                <div className="mt-4 space-y-3">
                                  {commandFeed.map(([title, meta]) => (
                                    <div key={title} className="rounded-[18px] border border-white/8 bg-black/20 px-4 py-3">
                                      <p className="text-sm font-medium text-white">{title}</p>
                                      <p className="mt-1 text-xs leading-6 text-zinc-400">{meta}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="mt-5 grid gap-4 md:grid-cols-3">
                            {[
                              ['Governanca', 'Aprovacoes, trilha de auditoria e guardrails operando juntos.'],
                              ['Autopilot', 'Recuperacao, reconciliacao e playbooks por excecao.'],
                              ['Compliance', 'Visibilidade de risco sem matar a velocidade da execucao.'],
                            ].map(([title, text]) => (
                              <div
                                key={title}
                                className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4"
                              >
                                <p className="text-sm font-medium text-white">{title}</p>
                                <p className="mt-3 text-sm leading-7 text-zinc-400">{text}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="border-t border-white/8 px-5 py-8 md:px-8 lg:px-10">
              <div className="grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.32em] text-zinc-500">
                    Construido para operar em alta intensidade
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {capabilityCards.map((card) => (
                    <div
                      key={card.eyebrow}
                      className="rounded-[28px] border border-white/8 bg-white/[0.03] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                    >
                      <p className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">
                        {card.eyebrow}
                      </p>
                      <p className="mt-4 text-xl font-semibold leading-8 tracking-[-0.05em] text-white">
                        {card.title}
                      </p>
                      <p className="mt-4 text-sm leading-7 text-zinc-400">{card.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="border-t border-white/8 px-5 py-6 md:px-8 lg:px-10">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <p className="text-[11px] uppercase tracking-[0.32em] text-zinc-500">
                  Elyon OS conecta a camada inteira de gestao empresarial
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
