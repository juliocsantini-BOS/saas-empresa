import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#07080d] text-white">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-6 py-16">
        <header className="mb-20 flex items-center justify-between gap-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-[11px] uppercase tracking-[0.28em] text-zinc-300">
            <span className="h-2 w-2 rounded-full bg-violet-300 shadow-[0_0_18px_rgba(196,181,253,0.9)]" />
            Elyon OS
          </div>

          <nav className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-full border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-zinc-200"
            >
              Login
            </Link>
            <Link
              href="mailto:contato@elyonos.com.br"
              className="rounded-full bg-[linear-gradient(135deg,#f5f3ff,#b197fc)] px-5 py-2.5 text-sm font-semibold text-[#12081d]"
            >
              Contact
            </Link>
          </nav>
        </header>

        <div className="max-w-4xl">
          <h1 className="text-5xl font-semibold tracking-[-0.06em] text-white md:text-7xl">
            Enterprise operating system for finance, CRM and AI-led execution.
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-zinc-400 md:text-lg">
            Elyon OS consolidates command, governance and operator workspaces into a
            single premium environment for modern companies.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/login"
              className="rounded-full bg-[linear-gradient(135deg,#f5f3ff,#b197fc)] px-6 py-3.5 text-sm font-semibold text-[#12081d]"
            >
              Open platform
            </Link>
            <Link
              href="mailto:contato@elyonos.com.br"
              className="rounded-full border border-white/10 bg-white/[0.05] px-6 py-3.5 text-sm font-medium text-white"
            >
              contato@elyonos.com.br
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
