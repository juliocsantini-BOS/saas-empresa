import Link from 'next/link';

const navItems = ['Home', 'Platform', 'Solutions', 'Security', 'Contact'];

const trustItems = ['Finance', 'CRM', 'Treasury', 'Governance', 'Automation', 'AI Ops'];

const floatingMetrics = [
  { label: 'Operating score', value: '94', tone: 'violet' },
  { label: 'Recovery lift', value: '+38%', tone: 'emerald' },
  { label: 'Live entities', value: '05', tone: 'sky' },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#06070c] text-white">
      <div className="relative isolate min-h-screen">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-[-18rem] h-[42rem] w-[42rem] -translate-x-1/2 rounded-full bg-violet-500/18 blur-[180px]" />
          <div className="absolute right-[-10rem] top-[7rem] h-[28rem] w-[28rem] rounded-full bg-fuchsia-500/12 blur-[140px]" />
          <div className="absolute left-[-9rem] bottom-[10rem] h-[24rem] w-[24rem] rounded-full bg-cyan-400/10 blur-[130px]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.028)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.028)_1px,transparent_1px)] bg-[size:84px_84px] [mask-image:radial-gradient(circle_at_center,black,transparent_82%)]" />
          <div className="absolute inset-x-0 top-0 h-[30rem] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.1),transparent_42%)]" />
        </div>

        <div className="relative mx-auto max-w-[1500px] px-4 py-4 sm:px-6 lg:px-8">
          <div className="rounded-[38px] border border-white/8 bg-[linear-gradient(180deg,rgba(10,11,18,0.94),rgba(6,7,12,0.98))] shadow-[0_30px_160px_rgba(0,0,0,0.62)]">
            <header className="flex flex-col gap-5 px-5 py-5 md:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/12 bg-[linear-gradient(160deg,rgba(211,194,255,0.24),rgba(91,61,206,0.42))]">
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
                {navItems.map((item, index) => (
                  <span
                    key={item}
                    className={`rounded-full px-4 py-2 text-sm ${
                      index === 0
                        ? 'bg-white text-[#090b13]'
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
                  className="rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-medium text-zinc-100"
                >
                  Login
                </Link>
                <Link
                  href="mailto:contato@elyonos.com.br"
                  className="rounded-full bg-[linear-gradient(135deg,#fbf7ff,#d2bcff_44%,#8a5cff)] px-5 py-3 text-sm font-semibold text-[#120817] shadow-[0_14px_60px_rgba(163,121,255,0.26)]"
                >
                  Contact
                </Link>
              </div>
            </header>

            <section className="px-4 pb-4 md:px-6 lg:px-8 lg:pb-8">
              <div className="relative overflow-hidden rounded-[32px] border border-white/8 bg-[linear-gradient(180deg,rgba(11,12,20,0.88),rgba(8,9,14,0.96))] px-6 pb-8 pt-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] md:px-8 lg:px-10 lg:pb-10 lg:pt-10">
                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute left-1/2 top-[3rem] h-[24rem] w-[24rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(196,181,253,0.34),rgba(138,92,246,0.12)_38%,transparent_72%)] blur-[30px]" />
                  <div className="absolute left-1/2 top-[4rem] h-[28rem] w-[2px] -translate-x-1/2 bg-[linear-gradient(180deg,rgba(255,255,255,0),rgba(219,204,255,0.95),rgba(255,255,255,0))] opacity-80" />
                </div>

                <div className="relative z-10">
                  <div className="mx-auto flex max-w-[860px] flex-col items-center text-center">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] uppercase tracking-[0.28em] text-zinc-300">
                      <span className="h-2 w-2 rounded-full bg-violet-300 shadow-[0_0_18px_rgba(196,181,253,0.95)]" />
                      Flagship command surface
                    </div>

                    <h1 className="mt-8 max-w-[1100px] text-[3.1rem] font-semibold leading-[0.9] tracking-[-0.085em] text-white md:text-[5rem] xl:text-[6.15rem]">
                      The enterprise operating system
                      <br />
                      for finance, CRM and
                      <br />
                      AI-led execution.
                    </h1>

                    <p className="mt-7 max-w-[720px] text-base leading-8 text-zinc-400 md:text-lg">
                      Elyon OS brings together command, governance and operator execution in
                      a single premium environment built for modern companies running at
                      scale.
                    </p>

                    <div className="mt-9 flex flex-wrap justify-center gap-4">
                      <Link
                        href="/login"
                        className="rounded-full bg-[linear-gradient(135deg,#fbf7ff,#d2bcff_44%,#8a5cff)] px-7 py-4 text-sm font-semibold text-[#120817] shadow-[0_16px_70px_rgba(163,121,255,0.3)]"
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
                  </div>

                  <div className="relative mx-auto mt-14 max-w-[1180px]">
                    <div className="grid gap-5 xl:grid-cols-[240px_minmax(0,1fr)_260px] xl:items-end">
                      <div className="order-2 xl:order-1 xl:pb-8">
                        <div className="space-y-4">
                          {[
                            ['Command continuity', 'Multi-entity control across finance and execution.'],
                            ['Autopilot ready', 'Guardrails, approvals and evidence already embedded.'],
                          ].map(([title, text]) => (
                            <div
                              key={title}
                              className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5 backdrop-blur-xl"
                            >
                              <p className="text-sm font-medium text-white">{title}</p>
                              <p className="mt-3 text-sm leading-7 text-zinc-400">{text}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="order-1 xl:order-2">
                        <div className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,16,28,0.98),rgba(8,9,14,0.98))] p-4 shadow-[0_28px_120px_rgba(0,0,0,0.55)]">
                          <div className="rounded-[26px] border border-white/8 bg-[radial-gradient(circle_at_top,rgba(175,131,255,0.16),transparent_34%),linear-gradient(180deg,rgba(16,18,31,0.98),rgba(9,11,18,0.98))] p-5">
                            <div className="flex items-center justify-between rounded-[20px] border border-white/8 bg-white/[0.03] px-4 py-3">
                              <div>
                                <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">
                                  Elyon Command
                                </p>
                                <p className="mt-2 text-sm font-medium text-white">
                                  Unified operating posture
                                </p>
                              </div>
                              <div className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-medium text-emerald-100">
                                live
                              </div>
                            </div>

                            <div className="mt-5 grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
                              <div className="rounded-[24px] border border-white/8 bg-black/20 p-5">
                                <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">
                                  Operating score
                                </p>
                                <div className="mt-4 flex items-end justify-between gap-4">
                                  <p className="text-6xl font-semibold tracking-[-0.09em] text-white">
                                    94
                                  </p>
                                  <span className="rounded-full border border-violet-300/20 bg-violet-300/10 px-3 py-1 text-xs font-medium text-violet-100">
                                    +12 this week
                                  </span>
                                </div>

                                <div className="mt-8 grid grid-cols-7 items-end gap-2">
                                  {[36, 47, 55, 61, 73, 86, 98].map((height, index) => (
                                    <div key={height} className="flex flex-col items-center gap-2">
                                      <div
                                        className={`w-full rounded-full ${
                                          index === 6
                                            ? 'bg-[linear-gradient(180deg,#f5efff,#8a5cff)]'
                                            : 'bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(124,93,255,0.18))]'
                                        }`}
                                        style={{ height: `${height}px` }}
                                      />
                                      <span className="text-[10px] uppercase tracking-[0.22em] text-zinc-600">
                                        {index + 1}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="space-y-4">
                                {[
                                  ['Revenue recovery', '8 exceptions in queue'],
                                  ['Treasury rebalance', '2 actions prepared'],
                                  ['Approval routing', '14 items pending'],
                                ].map(([label, meta], index) => (
                                  <div
                                    key={label}
                                    className={`rounded-[22px] border border-white/8 p-4 ${
                                      index === 1
                                        ? 'bg-[linear-gradient(180deg,rgba(118,240,199,0.12),rgba(255,255,255,0.02))]'
                                        : 'bg-white/[0.03]'
                                    }`}
                                  >
                                    <p className="text-sm font-medium text-white">{label}</p>
                                    <p className="mt-2 text-sm text-zinc-400">{meta}</p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="mt-5 grid gap-4 md:grid-cols-3">
                              {[
                                ['Finance command', 'Cash, procurement and approvals in one lane.'],
                                ['CRM execution', 'Pipeline risk and action surfaces in real time.'],
                                ['Governance', 'RBAC, audit and approval evidence by default.'],
                              ].map(([title, text]) => (
                                <div
                                  key={title}
                                  className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4"
                                >
                                  <p className="text-sm font-medium text-white">{title}</p>
                                  <p className="mt-3 text-sm leading-7 text-zinc-400">{text}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="order-3 xl:pb-10">
                        <div className="space-y-4">
                          {floatingMetrics.map((item) => (
                            <div
                              key={item.label}
                              className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5"
                            >
                              <p className="text-xs uppercase tracking-[0.26em] text-zinc-500">
                                {item.label}
                              </p>
                              <p className="mt-3 text-4xl font-semibold tracking-[-0.08em] text-white">
                                {item.value}
                              </p>
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
