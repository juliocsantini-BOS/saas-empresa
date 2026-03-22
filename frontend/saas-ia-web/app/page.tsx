import Link from 'next/link';

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="rounded-full px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/6 hover:text-white"
    >
      {children}
    </a>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-[11px] uppercase tracking-[0.26em] text-zinc-300 backdrop-blur-md">
      <span className="h-2 w-2 rounded-full bg-violet-300 shadow-[0_0_18px_rgba(196,181,253,0.9)]" />
      {children}
    </div>
  );
}

function SignalCard({
  title,
  subtitle,
  accent,
}: {
  title: string;
  subtitle: string;
  accent: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.015))] p-4 shadow-[0_14px_40px_rgba(0,0,0,0.22)] backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-[0.22em] text-zinc-500">{subtitle}</div>
        <div
          className="h-2.5 w-2.5 rounded-full shadow-[0_0_18px_rgba(255,255,255,0.35)]"
          style={{ backgroundColor: accent }}
        />
      </div>
      <div className="mt-4 text-lg font-semibold text-white">{title}</div>
    </div>
  );
}

function Capability({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.016))] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
      <div className="text-[11px] uppercase tracking-[0.24em] text-zinc-500">{eyebrow}</div>
      <div className="mt-4 text-2xl font-semibold tracking-tight text-white">{title}</div>
      <div className="mt-3 text-sm leading-7 text-zinc-400">{text}</div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#07080d] text-white">
      <div className="relative mx-auto max-w-[1600px] px-4 py-4 md:px-8 md:py-8">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-[-10%] top-16 h-[420px] w-[420px] rounded-full bg-violet-600/20 blur-[120px]" />
          <div className="absolute right-[-12%] top-10 h-[420px] w-[420px] rounded-full bg-fuchsia-500/20 blur-[140px]" />
          <div className="absolute bottom-[-8%] left-1/2 h-[320px] w-[680px] -translate-x-1/2 rounded-full bg-violet-500/12 blur-[120px]" />
        </div>

        <section className="relative overflow-hidden rounded-[38px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,17,27,0.96),rgba(7,8,13,0.98))] px-5 pb-10 pt-5 shadow-[0_40px_120px_rgba(0,0,0,0.34)] md:px-8 md:pb-14 md:pt-7 xl:px-10">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:88px_88px] opacity-[0.07]" />
          <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.34),transparent)]" />
          <div className="absolute left-[24%] top-[12%] h-[360px] w-[360px] rounded-full bg-violet-500/14 blur-[110px]" />
          <div className="absolute right-[8%] top-[24%] h-[320px] w-[320px] rounded-full bg-pink-500/12 blur-[120px]" />
          <div className="absolute bottom-[18%] left-1/2 h-[220px] w-[520px] -translate-x-1/2 rounded-full bg-white/8 blur-[130px]" />

          <header className="relative z-10 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-[15px] border border-white/10 bg-[linear-gradient(135deg,rgba(157,111,255,0.9),rgba(77,31,145,0.75))] shadow-[0_0_40px_rgba(139,92,246,0.28)]">
                <div className="h-3.5 w-3.5 rounded-full bg-white" />
              </div>
              <div>
                <div className="text-lg font-semibold tracking-tight text-white">ELYON OS</div>
                <div className="text-sm text-zinc-500">Operating system for modern companies</div>
              </div>
            </div>

            <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
              <nav className="flex flex-wrap items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1.5 backdrop-blur-md">
                <NavLink href="#platform">Platform</NavLink>
                <NavLink href="#command">Command</NavLink>
                <NavLink href="#modules">Modules</NavLink>
                <NavLink href="#contact">Contact</NavLink>
              </nav>

              <div className="flex items-center gap-3">
                <a
                  href="#contact"
                  className="rounded-full border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-medium text-white hover:bg-white/[0.08]"
                >
                  Login
                </a>
                <a
                  href="#contact"
                  className="rounded-full bg-[linear-gradient(135deg,#ede9fe,#a78bfa)] px-5 py-3 text-sm font-semibold text-[#130a26] shadow-[0_0_50px_rgba(167,139,250,0.35)] hover:translate-y-[-1px]"
                >
                  Request Access
                </a>
              </div>
            </div>
          </header>

          <div className="relative z-10 mt-10 grid gap-8 xl:grid-cols-[1.05fr,0.95fr] xl:items-start">
            <div className="max-w-[760px]">
              <Badge>Enterprise AI Operating Layer</Badge>

              <div className="mt-8">
                <h1 className="max-w-[900px] text-[52px] font-semibold leading-[0.92] tracking-[-0.075em] text-white md:text-[78px] xl:text-[104px]">
                  Run finance,
                  <br />
                  revenue and
                  <br />
                  operations from
                  <br />
                  one command layer.
                </h1>
                <p className="mt-6 max-w-[600px] text-[15px] leading-8 text-zinc-300 md:text-lg">
                  Elyon OS unifies financial command, CRM execution, governance and embedded
                  AI into a single operating environment designed for modern companies with
                  real operational complexity.
                </p>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#contact"
                  className="rounded-full bg-[linear-gradient(135deg,#f5f3ff,#b197fc)] px-6 py-3.5 text-sm font-semibold text-[#11081f] shadow-[0_0_60px_rgba(177,151,252,0.28)]"
                >
                  Start with Elyon
                </a>
                <a
                  href="#modules"
                  className="rounded-full border border-white/10 bg-white/[0.04] px-6 py-3.5 text-sm font-medium text-white backdrop-blur-md hover:bg-white/[0.08]"
                >
                  Explore modules
                </a>
              </div>

              <div className="mt-10 grid max-w-[620px] gap-3 md:grid-cols-3">
                <SignalCard title="Finance OS" subtitle="Treasury" accent="#a78bfa" />
                <SignalCard title="CRM OS" subtitle="Guided selling" accent="#f0abfc" />
                <SignalCard title="AI Command" subtitle="Execution" accent="#ddd6fe" />
              </div>
            </div>

            <div className="relative min-h-[640px]">
              <div className="absolute right-[4%] top-[6%] z-20 w-[250px] rotate-[9deg] rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0.018))] p-5 shadow-[0_28px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-zinc-400">Performance</div>
                  <div className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-[11px] text-emerald-200">
                    +12.8%
                  </div>
                </div>
                <div className="mt-5 space-y-3">
                  {[
                    ['2021', '34%'],
                    ['2022', '48%'],
                    ['2023', '41%'],
                    ['2024', '67%'],
                    ['2025', '81%'],
                  ].map(([year, value], index) => (
                    <div key={year} className="flex items-center gap-3">
                      <div className="w-10 text-xs text-zinc-500">{year}</div>
                      <div className="h-10 flex-1 overflow-hidden rounded-full bg-white/5">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: value,
                            background:
                              index === 4
                                ? 'linear-gradient(90deg,#e9d5ff,#8b5cf6)'
                                : 'linear-gradient(90deg,rgba(167,139,250,0.9),rgba(59,130,246,0.85))',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="absolute left-[2%] top-[33%] z-20 w-[240px] -rotate-[12deg] rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(17,18,26,0.96),rgba(10,11,17,0.96))] p-5 shadow-[0_22px_58px_rgba(0,0,0,0.32)]">
                <div className="text-sm text-zinc-400">Watchlist</div>
                <div className="mt-4 space-y-3">
                  {[
                    ['Adobe', '$43,862.25', '+4.8%'],
                    ['Netflix', '$2,095.89', '-0.8%'],
                    ['ChatGPT', '$35,618.70', '+2.4%'],
                  ].map(([name, amount, delta]) => (
                    <div key={name} className="rounded-[18px] border border-white/8 bg-white/[0.03] p-3.5">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-white">{name}</div>
                        <div className="text-[11px] text-zinc-500">{delta}</div>
                      </div>
                      <div className="mt-2 text-sm text-zinc-300">{amount}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="absolute inset-x-0 bottom-0 z-10 rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(17,18,27,0.94),rgba(7,8,13,0.98))] p-4 shadow-[0_30px_80px_rgba(0,0,0,0.34)] md:p-5">
                <div className="overflow-hidden rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(9,10,16,0.96),rgba(12,14,24,0.98))]">
                  <div className="flex flex-col gap-4 border-b border-white/8 px-5 py-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[linear-gradient(135deg,rgba(139,92,246,0.3),rgba(255,255,255,0.06))]">
                        <div className="h-2.5 w-2.5 rounded-full bg-violet-200" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">ELYON Command Center</div>
                        <div className="text-xs text-zinc-500">Finance, CRM, automation and governance</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-3 py-2 text-xs text-zinc-400">
                      <span className="rounded-full bg-white/7 px-2 py-1">Multi-entity</span>
                      <span className="rounded-full bg-white/7 px-2 py-1">AI copilots</span>
                      <span className="rounded-full bg-white/7 px-2 py-1">Signal-driven</span>
                    </div>
                  </div>

                  <div className="grid gap-4 p-5 xl:grid-cols-[0.22fr,0.5fr,0.28fr]">
                    <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                      <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">Navigation</div>
                      <div className="mt-4 space-y-2">
                        {['Dashboard', 'Finance OS', 'CRM OS', 'Treasury', 'Compliance'].map((item, index) => (
                          <div
                            key={item}
                            className={`rounded-[16px] px-3 py-2.5 text-sm ${
                              index === 0
                                ? 'border border-violet-400/30 bg-violet-500/10 text-white'
                                : 'text-zinc-400'
                            }`}
                          >
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[24px] border border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.2),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">Cashflow</div>
                          <div className="mt-2 text-3xl font-semibold tracking-tight text-white">$25,156.34</div>
                        </div>
                        <div className="rounded-full bg-emerald-400/14 px-3 py-1.5 text-xs text-emerald-200">
                          +1.97%
                        </div>
                      </div>

                      <div className="mt-6 flex h-[230px] items-end gap-3">
                        {[42, 58, 51, 76, 62, 81, 68].map((height, index) => (
                          <div key={height} className="flex flex-1 flex-col items-center gap-3">
                            <div
                              className="w-full rounded-t-[18px] bg-[linear-gradient(180deg,rgba(196,181,253,0.96),rgba(76,29,149,0.3))] shadow-[0_0_35px_rgba(139,92,246,0.15)]"
                              style={{ height: `${height}%`, opacity: index === 3 ? 1 : 0.82 }}
                            />
                            <div className="text-[11px] text-zinc-500">
                              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'][index]}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                        <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">Execution</div>
                        <div className="mt-4 space-y-3">
                          {[
                            'Revenue retry triggered',
                            'Treasury rebalance suggested',
                            'Vendor risk moved to review',
                          ].map((item) => (
                            <div key={item} className="rounded-[16px] border border-white/8 bg-black/20 px-3 py-3 text-sm text-zinc-300">
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                        <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">Activity</div>
                        <div className="mt-4 space-y-3">
                          {[
                            ['New transactions', '14 pending actions'],
                            ['Compliance hub', '3 evidence packs due'],
                          ].map(([title, text]) => (
                            <div key={title} className="rounded-[16px] border border-white/8 bg-black/20 px-3 py-3">
                              <div className="text-sm font-medium text-white">{title}</div>
                              <div className="mt-1 text-xs text-zinc-500">{text}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-10 border-t border-white/8 pt-6">
            <div className="flex flex-wrap items-center justify-between gap-5 text-sm uppercase tracking-[0.24em] text-zinc-600">
              <span>Command centers for finance-led companies</span>
              <div className="flex flex-wrap items-center gap-7 text-zinc-500">
                <span>Finance OS</span>
                <span>CRM OS</span>
                <span>Revenue Ops</span>
                <span>Compliance</span>
                <span>AI Command</span>
              </div>
            </div>
          </div>
        </section>

        <section id="platform" className="mt-8 grid gap-5 xl:grid-cols-[0.95fr,1.05fr]">
          <Capability
            eyebrow="Platform"
            title="A flagship operating environment designed for real company complexity."
            text="Elyon OS was designed to feel less like fragmented software and more like a premium operating layer where finance, CRM, governance and automation share the same command language."
          />
          <div className="grid gap-5 md:grid-cols-2" id="command">
            <Capability
              eyebrow="Command"
              title="Signal-first control"
              text="Command surfaces built around execution, decision velocity and visibility across finance, commercial and core operations."
            />
            <Capability
              eyebrow="Architecture"
              title="Cloud-scale foundation"
              text="Structured for domain isolation, multi-entity governance, integrations and a future AWS rollout without losing product cohesion."
            />
          </div>
        </section>

        <section id="modules" className="mt-8 grid gap-5 xl:grid-cols-3">
          <Capability
            eyebrow="Finance OS"
            title="Treasury, revenue, procurement and compliance in one premium layer."
            text="Control tower for multi-unit cash, billing, governance, approvals and CFO automation."
          />
          <Capability
            eyebrow="CRM OS"
            title="Commercial workspaces designed for guided execution, not for visual clutter."
            text="Signal-driven pipeline, intelligence surfaces and operator-first sales command."
          />
          <Capability
            eyebrow="AI Command"
            title="Embedded copilots for decisions, investigations and operational movement."
            text="Contextual AI integrated into the core operating system instead of bolted on as decoration."
          />
        </section>

        <section id="contact" className="mt-8 rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.22)] md:p-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-[780px]">
              <Badge>Institutional Presence</Badge>
              <h2 className="mt-6 text-3xl font-semibold tracking-[-0.05em] text-white md:text-5xl">
                A premium front door for provider onboarding, strategic partnerships and market positioning.
              </h2>
              <p className="mt-5 max-w-[620px] text-sm leading-7 text-zinc-400 md:text-base">
                Elyon OS is now ready to operate as an institutional brand presence while the
                full platform infrastructure expands behind it.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="mailto:contato@elyonos.com.br"
                className="rounded-full bg-[linear-gradient(135deg,#f5f3ff,#b197fc)] px-6 py-3.5 text-sm font-semibold text-[#12081d]"
              >
                contato@elyonos.com.br
              </Link>
              <a
                href="https://www.elyonos.com.br"
                className="rounded-full border border-white/10 bg-white/[0.04] px-6 py-3.5 text-sm font-medium text-white"
              >
                www.elyonos.com.br
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
