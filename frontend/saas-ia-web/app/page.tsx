import Link from 'next/link';

const navItems = ['Platform', 'Finance', 'CRM', 'Security'];

const metrics = [
  { value: '05', label: 'entities under command' },
  { value: '31', label: 'autopilot flows armed' },
  { value: '94', label: 'operating score' },
];

const modules = [
  'Enterprise Finance',
  'Treasury Command',
  'CRM Execution',
  'RBAC + Audit',
  'AI Copilot',
  'Multi-unit Ops',
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#05060b] text-white">
      <div className="relative isolate min-h-screen">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-[-16rem] h-[38rem] w-[38rem] -translate-x-1/2 rounded-full bg-violet-500/16 blur-[170px]" />
          <div className="absolute right-[-6rem] top-[4rem] h-[24rem] w-[24rem] rounded-full bg-fuchsia-500/12 blur-[130px]" />
          <div className="absolute left-[-10rem] bottom-[8rem] h-[22rem] w-[22rem] rounded-full bg-cyan-400/8 blur-[120px]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:84px_84px] [mask-image:radial-gradient(circle_at_center,black,transparent_82%)]" />
          <div className="absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_40%)]" />
        </div>

        <div className="relative mx-auto max-w-[1480px] px-4 py-4 sm:px-6 lg:px-8">
          <div className="rounded-[34px] border border-white/8 bg-[linear-gradient(180deg,rgba(10,11,18,0.94),rgba(6,7,12,0.98))] shadow-[0_30px_140px_rgba(0,0,0,0.62)] backdrop-blur-2xl">
            <header className="flex flex-col gap-5 px-5 py-5 md:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/12 bg-[linear-gradient(160deg,rgba(214,196,255,0.24),rgba(87,58,210,0.42))]">
                  <div className="h-4 w-4 rounded-full bg-white shadow-[0_0_24px_rgba(255,255,255,0.95)]" />
                </div>
                <div>
                  <p className="text-lg font-semibold tracking-[0.14em] text-white">ELYON OS</p>
                  <p className="text-xs uppercase tracking-[0.34em] text-zinc-500">
                    Enterprise AI operating system
                  </p>
                </div>
              </div>

              <nav className="flex flex-wrap items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] p-1.5">
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
                  className="rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-medium text-zinc-100"
                >
                  Login
                </Link>
                <Link
                  href="mailto:contato@elyonos.com.br"
                  className="rounded-full bg-[linear-gradient(135deg,#fbf7ff,#ccb5ff_44%,#8a5cff)] px-5 py-3 text-sm font-semibold text-[#120817] shadow-[0_16px_60px_rgba(163,121,255,0.28)]"
                >
                  Contact
                </Link>
              </div>
            </header>

            <section className="relative px-5 pb-8 pt-6 md:px-8 lg:px-10 lg:pb-10 lg:pt-8">
              <div className="grid gap-8 xl:grid-cols-[minmax(0,1.03fr)_minmax(520px,0.97fr)] xl:items-center">
                <div className="max-w-[760px] pt-6">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] uppercase tracking-[0.28em] text-zinc-300">
                    <span className="h-2 w-2 rounded-full bg-violet-300 shadow-[0_0_20px_rgba(196,181,253,0.95)]" />
                    Flagship control surface
                  </div>

                  <h1 className="mt-8 text-[3.2rem] font-semibold leading-[0.9] tracking-[-0.085em] text-white md:text-[5rem] xl:text-[6.2rem]">
                    Run finance,
                    <br />
                    CRM and AI operations
                    <br />
                    from one command layer.
                  </h1>

                  <p className="mt-8 max-w-[640px] text-base leading-8 text-zinc-400 md:text-lg">
                    Elyon OS replaces fragmented operator stacks with a premium environment
                    for decision-making, execution, governance and enterprise copilots.
                  </p>

                  <div className="mt-10 flex flex-wrap gap-4">
                    <Link
                      href="/login"
                      className="rounded-full bg-[linear-gradient(135deg,#fbf7ff,#ccb5ff_44%,#8a5cff)] px-7 py-4 text-sm font-semibold text-[#120817] shadow-[0_16px_60px_rgba(163,121,255,0.28)]"
                    >
                      Enter platform
                    </Link>
                    <Link
                      href="mailto:contato@elyonos.com.br"
                      className="rounded-full border border-white/10 bg-white/[0.04] px-7 py-4 text-sm font-medium text-zinc-100"
                    >
                      contato@elyonos.com.br
                    </Link>
                  </div>

                  <div className="mt-14 grid gap-4 sm:grid-cols-3">
                    {metrics.map((item) => (
                      <div
                        key={item.label}
                        className="rounded-[24px] border border-white/8 bg-white/[0.03] px-5 py-5"
                      >
                        <p className="text-4xl font-semibold tracking-[-0.08em] text-white">
                          {item.value}
                        </p>
                        <p className="mt-2 text-sm text-zinc-400">{item.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-12">
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

                <div className="relative">
                  <div className="absolute left-1/2 top-1/2 h-[24rem] w-[24rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/18 blur-[130px]" />
                  <div className="absolute left-1/2 top-[3rem] h-[22rem] w-[2px] -translate-x-1/2 bg-[linear-gradient(180deg,rgba(255,255,255,0),rgba(213,190,255,0.95),rgba(255,255,255,0))]" />

                  <div className="relative rounded-[36px] border border-white/10 bg-[linear-gradient(180deg,rgba(16,18,30,0.96),rgba(7,9,16,0.98))] p-4 shadow-[0_30px_120px_rgba(0,0,0,0.5)]">
                    <div className="rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-5">
                      <div className="flex items-center justify-between rounded-[22px] border border-white/8 bg-black/20 px-4 py-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">
                            Elyon Command
                          </p>
                          <p className="mt-2 text-xl font-semibold tracking-[-0.05em] text-white">
                            Unified operating posture
                          </p>
                        </div>
                        <div className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-medium text-emerald-100">
                          live
                        </div>
                      </div>

                      <div className="mt-5 grid gap-4 lg:grid-cols-[1.12fr_0.88fr]">
                        <div className="rounded-[26px] border border-white/8 bg-[radial-gradient(circle_at_top,rgba(180,144,255,0.18),transparent_38%),linear-gradient(180deg,rgba(17,19,31,0.98),rgba(10,12,20,0.98))] p-5">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">
                                Operating score
                              </p>
                              <p className="mt-3 text-6xl font-semibold tracking-[-0.09em] text-white">
                                94
                              </p>
                            </div>
                            <div className="rounded-full border border-violet-300/20 bg-violet-300/10 px-3 py-1 text-xs font-medium text-violet-100">
                              +12 this week
                            </div>
                          </div>

                          <div className="mt-8 grid grid-cols-7 items-end gap-2">
                            {[36, 48, 56, 62, 71, 85, 98].map((height, index) => (
                              <div key={height} className="flex flex-col items-center gap-2">
                                <div
                                  className={`w-full rounded-full ${
                                    index === 6
                                      ? 'bg-[linear-gradient(180deg,#f5efff,#8a5cff)]'
                                      : 'bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(124,93,255,0.18))]'
                                  }`}
                                  style={{ height: `${height}px` }}
                                />
                                <span className="text-[10px] uppercase tracking-[0.24em] text-zinc-600">
                                  {index + 1}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                            <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
                              Execution queue
                            </p>
                            <div className="mt-4 space-y-3">
                              {[
                                ['Revenue recovery', '8 exceptions'],
                                ['Treasury rebalance', '2 actions ready'],
                                ['Approval queue', '14 pending'],
                              ].map(([label, value]) => (
                                <div
                                  key={label}
                                  className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3"
                                >
                                  <p className="text-sm font-medium text-white">{label}</p>
                                  <p className="mt-1 text-xs uppercase tracking-[0.22em] text-zinc-500">
                                    {value}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="rounded-[24px] border border-white/8 bg-[linear-gradient(160deg,rgba(14,74,66,0.62),rgba(9,15,18,0.98))] p-4">
                            <p className="text-xs uppercase tracking-[0.24em] text-emerald-200/70">
                              Autonomous operations
                            </p>
                            <p className="mt-3 text-3xl font-semibold tracking-[-0.06em] text-white">
                              31 flows armed
                            </p>
                            <p className="mt-2 text-sm text-zinc-300/80">
                              Guardrails, approvals and evidence wired into every execution lane.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 grid gap-4 md:grid-cols-3">
                        {[
                          [
                            'Finance command',
                            'Cash, approvals, procurement and recovery orchestrated from a single layer.',
                          ],
                          [
                            'CRM execution',
                            'Pipeline risk, tasks and commercial playbooks surfaced in real time.',
                          ],
                          [
                            'Governance by default',
                            'RBAC, auditability and approval evidence embedded into the operating surface.',
                          ],
                        ].map(([title, text], index) => (
                          <div
                            key={title}
                            className={`rounded-[24px] border border-white/8 p-5 ${
                              index === 1
                                ? 'bg-[linear-gradient(180deg,rgba(148,111,255,0.16),rgba(255,255,255,0.03))]'
                                : 'bg-white/[0.03]'
                            }`}
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
            </section>

            <section className="border-t border-white/8 px-5 py-6 md:px-8 lg:px-10">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <p className="text-xs uppercase tracking-[0.34em] text-zinc-500">
                  Built for finance, command and AI-led operations
                </p>
                <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm font-medium text-zinc-500">
                  {['Finance', 'CRM', 'Treasury', 'Automation', 'Compliance', 'AI Ops'].map(
                    (item) => (
                      <span key={item}>{item}</span>
                    ),
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
