import Link from 'next/link';

const navItems = ['Home', 'Plataforma', 'Soluções', 'IA', 'Contato'];

const logos = ['Financeiro', 'Operações', 'Compliance', 'Autopilot', 'Governança', 'Multiunidade'];

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
                  Operação empresarial com IA em tempo real
                </div>

                <h1 className="mx-auto mt-8 max-w-[980px] text-[3.25rem] font-semibold leading-[0.95] tracking-[-0.08em] text-white md:text-[5rem] xl:text-[5.8rem]">
                  Inteligência operacional
                  <br />
                  para empresas que
                  <br />
                  executam em escala.
                </h1>

                <p className="mx-auto mt-7 max-w-[760px] text-base leading-8 text-zinc-400 md:text-lg">
                  O Elyon OS unifica financeiro, operações, estrutura organizacional,
                  governança, automações e execução assistida por IA em uma única camada
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
                            <div className="rounded-[20px] border border-violet-200/14 bg-[linear-gradient(135deg,rgba(196,146,255,0.26),rgba(105,58,191,0.2))] px-4 py-3 shadow-[0_14px_40px_rgba(124,58,237,0.18)]">
                              <p className="text-sm font-medium text-white">Dashboard executivo</p>
                              <p className="mt-1 text-xs text-violet-100/70">
                                Camada de comando central
                              </p>
                            </div>
                            {[
                              ['Financeiro', 'Liquidez e caixa'],
                              ['Operações', 'Filiais e execução'],
                              ['Governança', 'Aprovações e trilha'],
                              ['IA executiva', 'Autonomia assistida'],
                            ].map(([label, meta]) => (
                              <div
                                key={label}
                                className="rounded-2xl border border-white/6 bg-white/[0.015] px-4 py-3"
                              >
                                <p className="text-sm text-zinc-100">{label}</p>
                                <p className="mt-1 text-xs text-zinc-500">{meta}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="minimal-float rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
                          <p className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">
                            Health score
                          </p>
                          <div className="mt-3 flex items-end justify-between">
                            <p className="text-4xl font-semibold tracking-[-0.08em] text-white">
                              94.6
                            </p>
                            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-emerald-200">
                              Estavel
                            </span>
                          </div>
                          <div className="mt-4 h-2 rounded-full bg-white/5">
                            <div className="h-full w-[94%] rounded-full bg-[linear-gradient(90deg,#d7c1ff,#8b5cf6)] shadow-[0_0_18px_rgba(139,92,246,0.45)]" />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-3">
                          {[
                            ['R$ 90,3M', 'Liquidez total', '+18,4%', '92% sincronizado'],
                            ['R$ 12,9M', 'Fluxo mensal', '+9,1%', '6 centros ativos'],
                            ['67,3M', 'Execução ativa', '24 filas', '3 alertas críticos'],
                          ].map(([value, label, meta, detail]) => (
                            <div
                              key={label}
                              className="rounded-[22px] border border-white/8 bg-[radial-gradient(circle_at_top,rgba(183,148,255,0.12),transparent_45%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_18px_40px_rgba(0,0,0,0.16)]"
                            >
                              <div className="flex items-center justify-between">
                                <p className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                                  {label}
                                </p>
                                <span className="rounded-full border border-violet-300/20 bg-violet-400/10 px-2.5 py-1 text-[10px] font-medium text-violet-100">
                                  {meta}
                                </span>
                              </div>
                              <p className="mt-4 text-3xl font-semibold tracking-[-0.08em] text-white">
                                {value}
                              </p>
                              <div className="mt-4 flex items-center justify-between">
                                <span className="text-xs text-zinc-500">{detail}</span>
                                <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/5">
                                  <div
                                    className="h-full rounded-full bg-[linear-gradient(90deg,#f0d9ff,#8b5cf6)]"
                                    style={{
                                      width:
                                        label === 'Liquidez total'
                                          ? '82%'
                                          : label === 'Fluxo mensal'
                                            ? '68%'
                                            : '56%',
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="rounded-[28px] border border-violet-200/10 bg-white/[0.03] p-5">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="text-3xl font-semibold tracking-[-0.06em] text-white">
                                Camada de comando
                              </p>
                              <p className="mt-1 text-sm text-zinc-500">
                                Fluxo financeiro, estrutura e execução em um único cockpit.
                              </p>
                            </div>
                            <div className="flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] p-1.5 text-xs text-zinc-300">
                              <span className="rounded-full bg-white px-3 py-1 text-[#090b12]">Weekly</span>
                              <span className="px-3 py-1">Mensal</span>
                              <span className="px-3 py-1">Trimestral</span>
                            </div>
                          </div>

                          <div className="mt-5 flex flex-wrap gap-2">
                            {['Financeiro', 'Operações', 'Governança', 'IA executiva'].map(
                              (item, index) => (
                                <span
                                  key={item}
                                  className={`rounded-full px-3.5 py-2 text-[11px] uppercase tracking-[0.18em] ${
                                    index === 0
                                      ? 'border border-violet-300/20 bg-violet-400/10 text-violet-100'
                                      : 'border border-white/8 bg-white/[0.03] text-zinc-400'
                                  }`}
                                >
                                  {item}
                                </span>
                              ),
                            )}
                          </div>

                          <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1.18fr)_320px]">
                            <div className="rounded-[24px] border border-white/6 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-4">
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                  <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
                                    Fluxo de caixa sincronizado
                                  </p>
                                  <p className="mt-2 text-2xl font-semibold tracking-[-0.06em] text-white">
                                    R$ 120,3M
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="rounded-full border border-violet-300/20 bg-violet-400/10 px-3 py-1 text-[11px] text-violet-100">
                                    +12,7%
                                  </div>
                                  <div className="rounded-full border border-emerald-300/15 bg-emerald-400/10 px-3 py-1 text-[11px] text-emerald-100">
                                    98,2% integrado
                                  </div>
                                </div>
                              </div>

                              <div className="mt-5 rounded-[22px] border border-white/6 bg-[radial-gradient(circle_at_top,rgba(167,139,250,0.18),transparent_48%),linear-gradient(180deg,rgba(10,8,18,0.88),rgba(14,10,26,0.94))] p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="h-2.5 w-2.5 rounded-full bg-violet-300 shadow-[0_0_18px_rgba(196,181,253,0.9)]" />
                                    <span className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                                      Liquidez, caixa e aprovação
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-zinc-600">
                                    <span>Jan</span>
                                    <span>Fev</span>
                                    <span>Mar</span>
                                    <span>Abr</span>
                                    <span>Mai</span>
                                    <span>Jun</span>
                                    <span>Jul</span>
                                    <span>Ago</span>
                                  </div>
                                </div>

                                <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_220px]">
                                  <div className="h-[226px] overflow-hidden rounded-[22px] border border-white/5 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01))] px-3 py-4">
                                    <svg viewBox="0 0 640 240" className="h-full w-full">
                                      <defs>
                                        <linearGradient id="elyonLineStrong" x1="0%" x2="100%" y1="0%" y2="0%">
                                          <stop offset="0%" stopColor="#ddd6fe" />
                                          <stop offset="50%" stopColor="#a855f7" />
                                          <stop offset="100%" stopColor="#f5d0fe" />
                                        </linearGradient>
                                        <linearGradient id="elyonAreaStrong" x1="0%" x2="0%" y1="0%" y2="100%">
                                          <stop offset="0%" stopColor="rgba(168,85,247,0.42)" />
                                          <stop offset="100%" stopColor="rgba(168,85,247,0)" />
                                        </linearGradient>
                                      </defs>
                                      {[36, 82, 128, 174, 220].map((y) => (
                                        <line
                                          key={y}
                                          x1="0"
                                          y1={y}
                                          x2="640"
                                          y2={y}
                                          stroke="rgba(255,255,255,0.06)"
                                          strokeDasharray="5 12"
                                        />
                                      ))}
                                      {[90, 190, 290, 390, 490, 590].map((x) => (
                                        <line
                                          key={x}
                                          x1={x}
                                          y1="0"
                                          x2={x}
                                          y2="240"
                                          stroke="rgba(255,255,255,0.025)"
                                        />
                                      ))}
                                      <path
                                        d="M0 192 C50 188 82 166 124 160 C176 152 220 145 268 149 C318 154 356 124 404 112 C458 98 492 110 540 82 C574 62 602 54 640 36 L640 240 L0 240 Z"
                                        fill="url(#elyonAreaStrong)"
                                      />
                                      <path
                                        d="M0 192 C50 188 82 166 124 160 C176 152 220 145 268 149 C318 154 356 124 404 112 C458 98 492 110 540 82 C574 62 602 54 640 36"
                                        fill="none"
                                        stroke="url(#elyonLineStrong)"
                                        strokeWidth="4"
                                        strokeLinecap="round"
                                      />
                                      <path
                                        d="M0 208 C62 198 120 186 168 176 C222 164 282 156 334 138 C392 118 446 108 508 94 C564 81 603 72 640 60"
                                        fill="none"
                                        stroke="rgba(255,255,255,0.28)"
                                        strokeWidth="2"
                                        strokeDasharray="8 12"
                                        strokeLinecap="round"
                                      />
                                      <circle cx="404" cy="112" r="7" fill="#f5d0fe" />
                                      <circle cx="404" cy="112" r="18" fill="rgba(245,208,254,0.16)" />
                                      <circle cx="540" cy="82" r="8" fill="#f5d0fe" />
                                      <circle cx="540" cy="82" r="20" fill="rgba(245,208,254,0.18)" />
                                      <circle cx="640" cy="36" r="7" fill="#ffffff" />
                                      <circle cx="640" cy="36" r="18" fill="rgba(255,255,255,0.12)" />
                                    </svg>
                                  </div>

                                  <div className="space-y-3">
                                    <div className="rounded-[20px] border border-white/6 bg-black/10 px-4 py-4">
                                      <p className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                                        Fluxo previsto
                                      </p>
                                      <p className="mt-3 text-2xl font-semibold tracking-[-0.06em] text-white">
                                        R$ 8,4M
                                      </p>
                                      <p className="mt-1 text-xs text-zinc-500">
                                        Projeção consolidada para o próximo ciclo
                                      </p>
                                    </div>
                                    <div className="rounded-[20px] border border-white/6 bg-black/10 px-4 py-4">
                                      <p className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                                        Autonomias
                                      </p>
                                      <p className="mt-3 text-2xl font-semibold tracking-[-0.06em] text-white">
                                        28 ativas
                                      </p>
                                      <div className="mt-3 space-y-2">
                                        {[78, 62, 90].map((value) => (
                                          <div key={value} className="h-1.5 rounded-full bg-white/5">
                                            <div
                                              className="h-full rounded-full bg-[linear-gradient(90deg,#ddd6fe,#8b5cf6)]"
                                              style={{ width: `${value}%` }}
                                            />
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="mt-4 grid gap-3 md:grid-cols-3">
                                  {[
                                    ['Pulso operacional', '94.6', 'Excelente'],
                                    ['Governança ativa', '8 unidades', 'tempo real'],
                                    ['Capacidade assistida', '67,3M', 'IA orquestrando'],
                                  ].map(([label, value, meta]) => (
                                    <div
                                      key={label}
                                      className="rounded-2xl border border-white/6 bg-white/[0.03] px-4 py-3"
                                    >
                                      <p className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                                        {label}
                                      </p>
                                      <div className="mt-3 flex items-end justify-between gap-3">
                                        <p className="text-2xl font-semibold tracking-[-0.06em] text-white">
                                          {value}
                                        </p>
                                        <span className="text-xs text-violet-200">{meta}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <div className="rounded-[24px] border border-white/6 bg-white/[0.03] p-4">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium text-white">Command feed</p>
                                  <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                                    ao vivo
                                  </span>
                                </div>
                                <div className="mt-4 space-y-3">
                                  {[
                                    ['Aprovação financeira concluída', 'há 2 min', 'emerald'],
                                    ['Filial São Paulo sincronizada', 'há 6 min', 'violet'],
                                    ['Autopilot de caixa executado', 'há 11 min', 'amber'],
                                    ['Compliance liberado para fechamento', 'há 18 min', 'violet'],
                                  ].map(([title, time, tone]) => (
                                    <div
                                      key={title}
                                      className="rounded-2xl border border-white/6 bg-black/10 px-4 py-3"
                                    >
                                      <div className="flex items-start gap-3">
                                        <span
                                          className={`mt-1.5 h-2.5 w-2.5 rounded-full ${
                                            tone === 'emerald'
                                              ? 'bg-emerald-300 shadow-[0_0_14px_rgba(110,231,183,0.9)]'
                                              : tone === 'amber'
                                                ? 'bg-amber-300 shadow-[0_0_14px_rgba(252,211,77,0.9)]'
                                                : 'bg-violet-300 shadow-[0_0_14px_rgba(196,181,253,0.9)]'
                                          }`}
                                        />
                                        <div>
                                          <p className="text-sm text-zinc-100">{title}</p>
                                          <p className="mt-1 text-xs text-zinc-500">{time}</p>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="rounded-[24px] border border-white/6 bg-white/[0.03] p-4">
                                <p className="text-sm font-medium text-white">Radar executivo</p>
                                <div className="mt-4 grid gap-3">
                                  {[
                                    ['Estrutura operacional', 'Matriz, financeiro e governança conformes'],
                                    ['Compliance', '100% das trilhas críticas sincronizadas'],
                                    ['IA executiva', '3 rotinas sugeridas com impacto imediato'],
                                  ].map(([label, helper]) => (
                                    <div
                                      key={label}
                                      className="rounded-2xl border border-white/6 bg-black/10 px-4 py-3"
                                    >
                                      <p className="text-sm text-zinc-100">{label}</p>
                                      <p className="mt-1 text-xs leading-5 text-zinc-500">{helper}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="minimal-float-delayed rounded-[24px] border border-violet-200/10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_45%),linear-gradient(180deg,rgba(196,146,255,0.28),rgba(92,46,194,0.24))] p-5 shadow-[0_18px_42px_rgba(88,28,135,0.24)]">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-sm font-medium text-white">Liquidez projetada</p>
                              <p className="mt-3 text-4xl font-semibold tracking-[-0.08em] text-white">
                                R$ 8.4M
                              </p>
                            </div>
                            <span className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-zinc-100">
                              Q3
                            </span>
                          </div>
                          <div className="mt-5 flex items-end gap-2">
                            {[42, 58, 76, 60, 88].map((height) => (
                              <div key={height} className="h-20 flex-1 rounded-full bg-white/8 p-1">
                                <div
                                  className="w-full rounded-full bg-[linear-gradient(180deg,#f3e8ff,#8b5cf6)]"
                                  style={{ height: `${height}%`, marginTop: `${100 - height}%` }}
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="minimal-float rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
                          <p className="text-sm font-medium text-white">Autonomias ativas</p>
                          <div className="mt-3 flex items-end justify-between">
                            <p className="text-3xl font-semibold tracking-[-0.08em] text-white">28</p>
                            <span className="text-xs text-zinc-500">+4 esta semana</span>
                          </div>
                          <div className="mt-4 flex gap-2">
                            {[72, 54, 88, 63].map((width) => (
                              <div key={width} className="h-1.5 flex-1 rounded-full bg-white/5">
                                <div
                                  className="h-full rounded-full bg-[linear-gradient(90deg,#cbb3ff,#8b5cf6)]"
                                  style={{ width: `${width}%` }}
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="minimal-float-slow rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
                          <p className="text-sm font-medium text-white">Camada IA</p>
                          <div className="mt-4 space-y-3">
                            {[
                              ['Co-pilot financeiro', '3 rotinas sugeridas'],
                              ['Governança adaptativa', '2 aprovações pendentes'],
                              ['Radar operacional', 'risco baixo'],
                            ].map(([label, meta]) => (
                              <div
                                key={label}
                                className="flex items-center justify-between rounded-2xl border border-white/6 bg-black/10 px-4 py-3"
                              >
                                <span className="text-sm text-zinc-200">{label}</span>
                                <span className="text-xs text-zinc-500">{meta}</span>
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

            <section className="border-t border-white/8 px-5 py-6 md:px-8 lg:px-10">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <p className="text-[11px] uppercase tracking-[0.32em] text-zinc-500">
                  Construído para empresas que operam com ambição, controle e escala
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
