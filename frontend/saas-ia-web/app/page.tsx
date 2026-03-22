import Link from 'next/link';

const proofLogos = [
  'Finance',
  'CRM',
  'Treasury',
  'Automation',
  'Compliance',
  'AI Ops',
];

const commandCards = [
  {
    title: 'Command Layer',
    text: 'One surface to direct financial, commercial and operator workflows across every entity.',
    accent: 'from-fuchsia-400/55 via-violet-400/35 to-transparent',
  },
  {
    title: 'Execution Intelligence',
    text: 'Autonomous copilots prepare actions, route exceptions and keep operators in control.',
    accent: 'from-cyan-300/45 via-sky-400/20 to-transparent',
  },
  {
    title: 'Governance by Default',
    text: 'RBAC, auditability and approval evidence embedded into every workflow and every decision.',
    accent: 'from-emerald-300/45 via-lime-200/20 to-transparent',
  },
];

const modules = [
  'Enterprise Finance',
  'CRM Command',
  'Treasury Cockpit',
  'Autopilot Workflows',
  'Compliance Hub',
  'Multi-entity Operations',
];

const statTiles = [
  ['14', 'active workspaces'],
  ['09', 'guarded approvals'],
  ['05', 'entities monitored'],
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#05060b] text-white">
      <div className="relative isolate">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-[-16rem] h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-fuchsia-500/18 blur-[170px]" />
          <div className="absolute right-[-8rem] top-[5rem] h-[28rem] w-[28rem] rounded-full bg-violet-500/18 blur-[150px]" />
          <div className="absolute left-[-10rem] top-[18rem] h-[26rem] w-[26rem] rounded-full bg-cyan-400/12 blur-[145px]" />
          <div className="absolute inset-x-0 top-0 h-[44rem] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.11),transparent_34%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:92px_92px] [mask-image:radial-gradient(circle_at_center,black,transparent_84%)]" />
          <div className="absolute left-1/2 top-[20rem] h-[40rem] w-[56rem] -translate-x-1/2 rounded-full border border-white/8 opacity-40 blur-[1px]" />
          <div className="absolute left-1/2 top-[12rem] h-[28rem] w-[60rem] -translate-x-1/2 bg-[radial-gradient(circle_at_center,rgba(144,109,255,0.12),transparent_60%)] blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-[1440px] px-4 py-4 sm:px-6 lg:px-8">
          <div className="rounded-[34px] border border-white/8 bg-[linear-gradient(180deg,rgba(10,11,18,0.92),rgba(6,7,12,0.94))] shadow-[0_30px_140px_rgba(0,0,0,0.58)] backdrop-blur-2xl before:pointer-events-none before:absolute before:inset-[1px] before:rounded-[33px] before:border before:border-white/[0.03] before:content-['']">
            <header className="flex flex-col gap-5 border-b border-white/8 px-5 py-5 md:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/12 bg-[linear-gradient(160deg,rgba(205,180,255,0.24),rgba(89,62,206,0.4))] shadow-[0_0_50px_rgba(161,123,255,0.28)]">
                  <div className="h-4 w-4 rounded-full bg-white shadow-[0_0_22px_rgba(255,255,255,0.95)]" />
                </div>
                <div>
                  <p className="text-lg font-semibold tracking-[0.14em] text-white">ELYON OS</p>
                  <p className="text-xs uppercase tracking-[0.34em] text-zinc-500">
                    Enterprise AI command layer
                  </p>
                </div>
              </div>

              <nav className="flex flex-wrap items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                {['Platform', 'Modules', 'Architecture', 'Security'].map((item) => (
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
                  className="rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-medium text-zinc-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                >
                  Login
                </Link>
                <Link
                  href="mailto:contato@elyonos.com.br"
                  className="rounded-full bg-[linear-gradient(135deg,#fbf7ff,#b38cff_56%,#8a5cff)] px-5 py-3 text-sm font-semibold text-[#120817] shadow-[0_14px_50px_rgba(167,124,255,0.3)]"
                >
                  Contact
                </Link>
              </div>
            </header>

            <section className="relative px-5 pb-8 pt-10 md:px-8 lg:px-10 lg:pb-10 lg:pt-14">
              <div className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(480px,0.95fr)] lg:items-start">
                <div className="max-w-[760px]">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] uppercase tracking-[0.28em] text-zinc-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                    <span className="h-2 w-2 rounded-full bg-violet-300 shadow-[0_0_22px_rgba(196,181,253,0.95)]" />
                    Operating system for modern companies
                  </div>

                  <h1 className="mt-8 max-w-[900px] text-[3.2rem] font-semibold leading-[0.92] tracking-[-0.082em] text-white md:text-[5rem] xl:text-[6.35rem]">
                    Direct finance,
                    <br />
                    CRM and AI execution
                    <br />
                    from a single
                    <span className="bg-[linear-gradient(135deg,#ffffff,#c9b7ff_40%,#8cdcff_88%)] bg-clip-text text-transparent">
                      {' '}
                      flagship surface.
                    </span>
                  </h1>

                  <div className="mt-8 grid max-w-[860px] gap-5 md:grid-cols-[minmax(0,1fr)_280px]">
                    <p className="text-base leading-8 text-zinc-400 md:text-lg">
                      Elyon OS unifies operational control, governance, financial execution
                      and enterprise copilots into a premium environment built for companies
                      that need real coordination, not another fragmented stack.
                    </p>

                    <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                      <p className="text-xs uppercase tracking-[0.26em] text-zinc-500">
                        Live operating posture
                      </p>
                      <div className="mt-4 flex items-end justify-between">
                        <div>
                          <p className="text-3xl font-semibold tracking-[-0.06em] text-white">
                            +38%
                          </p>
                          <p className="mt-1 text-sm text-zinc-400">
                            faster exception handling
                          </p>
                        </div>
                        <div className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-medium text-emerald-200">
                          real-time visibility
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-10 flex flex-wrap gap-4">
                    <Link
                      href="/login"
                      className="rounded-full bg-[linear-gradient(135deg,#fbf7ff,#d1bcff_42%,#8a5cff)] px-7 py-4 text-sm font-semibold text-[#120817] shadow-[0_16px_60px_rgba(163,121,255,0.32)] hover:-translate-y-0.5 hover:shadow-[0_22px_70px_rgba(163,121,255,0.42)]"
                    >
                      Enter platform
                    </Link>
                    <Link
                      href="mailto:contato@elyonos.com.br"
                      className="rounded-full border border-white/10 bg-white/[0.04] px-7 py-4 text-sm font-medium text-zinc-100 hover:border-white/18 hover:bg-white/[0.07]"
                    >
                      contato@elyonos.com.br
                    </Link>
                  </div>

                  <div className="mt-14">
                    <p className="text-xs uppercase tracking-[0.34em] text-zinc-500">
                      Core capability zones
                    </p>
                    <div className="mt-5 flex flex-wrap gap-3">
                      {modules.map((module) => (
                        <span
                          key={module}
                          className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-zinc-200"
                        >
                          {module}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="relative mx-auto w-full max-w-[620px] lg:max-w-none">
                  <div className="absolute left-1/2 top-10 h-[18rem] w-[18rem] -translate-x-1/2 rounded-full bg-violet-500/18 blur-[120px]" />
                  <div className="absolute left-1/2 top-0 h-[28rem] w-[3px] -translate-x-1/2 bg-[linear-gradient(180deg,rgba(255,255,255,0),rgba(207,180,255,0.95),rgba(255,255,255,0))] opacity-75 blur-[1px]" />
                  <div className="absolute right-8 top-10 h-28 w-28 rounded-full border border-white/10 bg-white/[0.04] shadow-[0_0_40px_rgba(190,160,255,0.15)]" />
                  <div className="absolute left-2 top-28 h-20 w-20 rounded-[24px] border border-white/10 bg-white/[0.05] shadow-[0_18px_40px_rgba(0,0,0,0.35)]" />
                  <div className="hero-orb absolute right-[-1rem] top-[12rem] hidden h-36 w-36 rounded-full md:block" />

                  <div className="relative rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(19,20,33,0.88),rgba(7,8,15,0.92))] p-4 shadow-[0_24px_120px_rgba(0,0,0,0.55)]">
                    <div className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(12,14,24,0.96),rgba(7,9,16,0.98))] p-4">
                      <div className="flex items-center justify-between rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                        <div>
                          <p className="text-xs uppercase tracking-[0.26em] text-zinc-500">
                            Command Center
                          </p>
                          <p className="mt-1 text-sm font-medium text-white">
                            Enterprise control layer
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,0.92)]" />
                          <span className="text-xs uppercase tracking-[0.24em] text-zinc-400">
                            live
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                        <div className="rounded-[26px] border border-white/8 bg-[radial-gradient(circle_at_top,rgba(175,131,255,0.16),transparent_42%),linear-gradient(180deg,rgba(17,18,30,0.98),rgba(11,13,21,0.98))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                                Unified Operating Score
                              </p>
                              <p className="mt-3 text-5xl font-semibold tracking-[-0.07em] text-white">
                                94
                              </p>
                            </div>
                            <div className="rounded-full border border-violet-300/20 bg-violet-300/10 px-3 py-1 text-xs text-violet-100">
                              +12 this week
                            </div>
                          </div>

                          <div className="mt-8 grid grid-cols-7 items-end gap-2">
                            {[42, 54, 63, 58, 74, 82, 96].map((height, index) => (
                              <div key={height} className="flex flex-col items-center gap-2">
                                <div
                                  className={`w-full rounded-full ${
                                    index === 6
                                      ? 'bg-[linear-gradient(180deg,#f3ebff,#8a5cff)]'
                                      : 'bg-[linear-gradient(180deg,rgba(236,228,255,0.9),rgba(124,93,255,0.18))]'
                                  }`}
                                  style={{ height: `${height}px` }}
                                />
                                <span className="text-[10px] uppercase tracking-[0.26em] text-zinc-600">
                                  {index + 1}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                            <p className="text-xs uppercase tracking-[0.26em] text-zinc-500">
                              Active priorities
                            </p>
                            <div className="mt-4 space-y-3">
                              {[
                                ['Revenue recovery', '8 exceptions'],
                                ['Treasury balance', '2 actions ready'],
                                ['Approval queue', '14 pending'],
                              ].map(([label, value]) => (
                                <div
                                  key={label}
                                  className="flex items-center justify-between rounded-2xl border border-white/8 bg-black/20 px-3 py-3"
                                >
                                  <span className="text-sm text-zinc-200">{label}</span>
                                  <span className="text-xs uppercase tracking-[0.22em] text-zinc-500">
                                    {value}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="rounded-[24px] border border-white/8 bg-[linear-gradient(160deg,rgba(15,77,70,0.58),rgba(9,15,18,0.96))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs uppercase tracking-[0.26em] text-emerald-200/70">
                                  Autonomous execution
                                </p>
                                <p className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-white">
                                  31 flows armed
                                </p>
                              </div>
                              <div className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs text-emerald-100">
                                guardrails active
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-4 md:grid-cols-3">
                        {commandCards.map((card) => (
                          <article
                            key={card.title}
                            className="relative overflow-hidden rounded-[24px] border border-white/8 bg-white/[0.03] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                          >
                            <div
                              className={`pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b ${card.accent}`}
                            />
                            <p className="relative text-sm font-medium text-white">{card.title}</p>
                            <p className="relative mt-3 text-sm leading-7 text-zinc-400">
                              {card.text}
                            </p>
                          </article>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
                      <div className="rounded-[26px] border border-white/8 bg-white/[0.03] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                        <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">
                          Cross-functional command
                        </p>
                        <div className="mt-4 space-y-3">
                          {[
                            ['Finance autopilot', 'Recovery plan prepared'],
                            ['CRM execution', 'Pipeline risk surfaced'],
                            ['Audit & RBAC', 'Evidence pack complete'],
                          ].map(([label, value]) => (
                            <div
                              key={label}
                              className="rounded-[20px] border border-white/8 bg-black/20 px-4 py-4"
                            >
                              <p className="text-sm font-medium text-white">{label}</p>
                              <p className="mt-1 text-sm text-zinc-400">{value}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-[26px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">
                              Operations radar
                            </p>
                            <p className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-white">
                              Company-wide command continuity
                            </p>
                          </div>
                          <div className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs uppercase tracking-[0.24em] text-zinc-400">
                            24/7 layer
                          </div>
                        </div>

                        <div className="mt-8 grid gap-4 sm:grid-cols-3">
                          {statTiles.map(([value, label], index) => (
                            <div
                              key={label}
                              className={`rounded-[22px] border border-white/8 px-4 py-5 ${
                                index === 1
                                  ? 'bg-[linear-gradient(180deg,rgba(157,111,255,0.18),rgba(0,0,0,0.18))]'
                                  : 'bg-black/20'
                              }`}
                            >
                              <p className="text-3xl font-semibold tracking-[-0.06em] text-white">
                                {value}
                              </p>
                              <p className="mt-2 text-sm text-zinc-400">{label}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="border-t border-white/8 px-5 py-6 md:px-8 lg:px-10">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <p className="text-xs uppercase tracking-[0.34em] text-zinc-500">
                  Built for finance, command and AI-led operations
                </p>
                <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm font-medium text-zinc-500">
                  {proofLogos.map((logo) => (
                    <span key={logo}>{logo}</span>
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
