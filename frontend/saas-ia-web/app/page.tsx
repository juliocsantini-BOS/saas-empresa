import Link from 'next/link';

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-violet-200">
      {children}
    </div>
  );
}

function StatCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.035] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.16)]">
      <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">{label}</div>
      <div className="mt-4 text-3xl font-semibold tracking-tight text-white">{value}</div>
      <div className="mt-2 text-sm leading-6 text-zinc-400">{detail}</div>
    </div>
  );
}

function ModuleCard({
  title,
  detail,
  accent,
}: {
  title: string;
  detail: string;
  accent: string;
}) {
  return (
    <div className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.2)]">
      <div className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl ${accent}`}>
        <div className="h-3 w-3 rounded-full bg-white" />
      </div>
      <div className="mt-5 text-xl font-semibold text-white">{title}</div>
      <div className="mt-2 text-sm leading-6 text-zinc-400">{detail}</div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-[#07080D] text-white">
      <div className="mx-auto max-w-[1440px] px-6 py-6 md:px-8 xl:px-10">
        <header className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.02))] px-5 py-4 shadow-[0_24px_60px_rgba(0,0,0,0.18)] backdrop-blur-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,rgba(139,92,246,0.9),rgba(99,102,241,0.7))] shadow-[0_0_40px_rgba(139,92,246,0.28)]">
                <div className="h-4 w-4 rounded-full bg-white" />
              </div>
              <div>
                <div className="text-[18px] font-semibold tracking-tight text-white">ELYON OS</div>
                <div className="text-sm text-zinc-500">Enterprise AI operating system</div>
              </div>
            </div>

            <nav className="flex flex-wrap items-center gap-2 text-sm text-zinc-300">
              <a href="#platform" className="rounded-2xl px-3 py-2 hover:bg-white/5">
                Plataforma
              </a>
              <a href="#modules" className="rounded-2xl px-3 py-2 hover:bg-white/5">
                Módulos
              </a>
              <a href="#architecture" className="rounded-2xl px-3 py-2 hover:bg-white/5">
                Arquitetura
              </a>
              <a href="#contact" className="rounded-2xl px-3 py-2 hover:bg-white/5">
                Contato
              </a>
            </nav>
          </div>
        </header>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
          <div className="rounded-[40px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.24),transparent_26%),radial-gradient(circle_at_top_right,rgba(124,58,237,0.16),transparent_18%),linear-gradient(180deg,rgba(12,14,22,0.98),rgba(8,10,16,0.98))] p-7 shadow-[0_32px_80px_rgba(0,0,0,0.28)] md:p-8">
            <Eyebrow>AI BUSINESS INFRASTRUCTURE</Eyebrow>

            <h1 className="mt-5 max-w-5xl text-[40px] font-semibold leading-[0.95] tracking-[-0.06em] text-white md:text-[58px] xl:text-[72px]">
              Um sistema operacional empresarial para finanças, vendas, operação e automação executiva.
            </h1>

            <p className="mt-6 max-w-3xl text-base leading-8 text-zinc-300 md:text-lg">
              A ELYON OS foi desenhada para consolidar command center, copilotos,
              workflows, governança multi-unidade e inteligência operacional em uma
              única camada de produto.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#contact"
                className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
              >
                Solicitar acesso
              </a>
              <a
                href="#modules"
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
              >
                Explorar módulos
              </a>
            </div>

            <div className="mt-10 grid gap-3 md:grid-cols-3">
              <div className="rounded-[26px] border border-white/10 bg-black/20 p-4">
                <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Positioning</div>
                <div className="mt-3 text-lg font-semibold text-white">Enterprise AI OS</div>
                <div className="mt-2 text-sm leading-6 text-zinc-400">
                  Plataforma para operação, finanças, CRM, governança e automação.
                </div>
              </div>
              <div className="rounded-[26px] border border-white/10 bg-black/20 p-4">
                <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Readiness</div>
                <div className="mt-3 text-lg font-semibold text-white">Multi-entity ready</div>
                <div className="mt-2 text-sm leading-6 text-zinc-400">
                  Estrutura pronta para grupos, filiais, departamentos e operação distribuída.
                </div>
              </div>
              <div className="rounded-[26px] border border-white/10 bg-black/20 p-4">
                <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Direction</div>
                <div className="mt-3 text-lg font-semibold text-white">Built for scale</div>
                <div className="mt-2 text-sm leading-6 text-zinc-400">
                  Base preparada para integrações, copilotos operacionais e arquitetura cloud.
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            <StatCard
              label="Operating Model"
              value="Command Layer"
              detail="Um cockpit premium para concentrar visão executiva, módulos críticos e decisões operacionais."
            />
            <StatCard
              label="Finance + Revenue"
              value="Enterprise Ready"
              detail="Camada financeira construída para treasury, compliance, autopilot, procurement e revenue operations."
            />
            <StatCard
              label="CRM + AI"
              value="Sales Intelligence"
              detail="CRM guiado por prioridades, playbooks, workspaces e copiloto comercial conectado à operação."
            />
          </div>
        </section>

        <section id="platform" className="mt-6 grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
          <div className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.015))] p-6 shadow-[0_22px_60px_rgba(0,0,0,0.2)]">
            <Eyebrow>WHY ELYON</Eyebrow>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Construída para operar como software enterprise, não como dashboard isolado.
            </h2>
            <div className="mt-5 space-y-4 text-sm leading-7 text-zinc-400">
              <p>
                A plataforma foi desenhada para unificar camada executiva, módulos
                operacionais, governança, estrutura multi-unidade e copilotos de IA.
              </p>
              <p>
                Em vez de criar ferramentas separadas, a ELYON OS centraliza finanças,
                CRM, workflows e controladoria em um único sistema com leitura premium.
              </p>
            </div>
          </div>

          <div className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,16,25,0.9),rgba(9,10,16,0.96))] p-6 shadow-[0_22px_60px_rgba(0,0,0,0.2)]">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[28px] border border-white/10 bg-black/20 p-5">
                <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Core</div>
                <div className="mt-3 text-xl font-semibold text-white">Structure first</div>
                <div className="mt-2 text-sm leading-6 text-zinc-400">
                  Empresas, filiais, departamentos, permissões, auditoria e governança como fundação.
                </div>
              </div>
              <div className="rounded-[28px] border border-white/10 bg-black/20 p-5">
                <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">AI Layer</div>
                <div className="mt-3 text-xl font-semibold text-white">Copilots embedded</div>
                <div className="mt-2 text-sm leading-6 text-zinc-400">
                  Assistentes operacionais, guided workflows e command experiences dentro do produto.
                </div>
              </div>
              <div className="rounded-[28px] border border-white/10 bg-black/20 p-5">
                <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Execution</div>
                <div className="mt-3 text-xl font-semibold text-white">Operator workflows</div>
                <div className="mt-2 text-sm leading-6 text-zinc-400">
                  Workspaces de execução para comercial, controladoria, procurement e compliance.
                </div>
              </div>
              <div className="rounded-[28px] border border-white/10 bg-black/20 p-5">
                <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Expansion</div>
                <div className="mt-3 text-xl font-semibold text-white">Integration-ready</div>
                <div className="mt-2 text-sm leading-6 text-zinc-400">
                  Preparada para Open Finance, providers de billing, email, ERP e infraestrutura cloud.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="modules" className="mt-6">
          <div className="rounded-[36px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] p-6 shadow-[0_22px_60px_rgba(0,0,0,0.2)]">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <Eyebrow>MODULE STACK</Eyebrow>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-4xl">
                  Módulos desenhados para uma operação enterprise de ponta a ponta.
                </h2>
              </div>
              <div className="max-w-xl text-sm leading-7 text-zinc-400">
                Uma arquitetura orientada a command center, com módulos premium que podem
                operar de forma isolada ou dentro de um operating system completo.
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <ModuleCard
                title="Finance OS"
                detail="Controladoria, treasury, autopilot, compliance, procurement e revenue operations em um cockpit unificado."
                accent="bg-[linear-gradient(135deg,rgba(139,92,246,0.9),rgba(99,102,241,0.72))]"
              />
              <ModuleCard
                title="CRM OS"
                detail="Pipeline executivo, guided selling, workspaces comerciais e inteligência operacional conectada."
                accent="bg-[linear-gradient(135deg,rgba(124,58,237,0.9),rgba(168,85,247,0.72))]"
              />
              <ModuleCard
                title="Automation OS"
                detail="Playbooks, regras, execuções, orquestração de eventos e automação transversal entre módulos."
                accent="bg-[linear-gradient(135deg,rgba(109,40,217,0.92),rgba(76,29,149,0.76))]"
              />
              <ModuleCard
                title="AI Command"
                detail="Copilotos contextuais para vendas, finanças e operação com foco em execução de alto valor."
                accent="bg-[linear-gradient(135deg,rgba(91,33,182,0.95),rgba(79,70,229,0.72))]"
              />
            </div>
          </div>
        </section>

        <section id="architecture" className="mt-6 grid gap-6 xl:grid-cols-[1.05fr,0.95fr]">
          <div className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(14,16,23,0.94),rgba(9,11,18,0.96))] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.2)]">
            <Eyebrow>ARCHITECTURE</Eyebrow>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Preparada para domínio próprio, cloud, integrações reais e expansão internacional.
            </h2>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-[26px] border border-white/10 bg-black/20 p-5">
                <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Domain layer</div>
                <div className="mt-3 text-xl font-semibold text-white">elyonos.com.br</div>
                <div className="mt-2 text-sm leading-6 text-zinc-400">
                  Marca, presença institucional e ponto oficial de distribuição do produto.
                </div>
              </div>
              <div className="rounded-[26px] border border-white/10 bg-black/20 p-5">
                <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Cloud path</div>
                <div className="mt-3 text-xl font-semibold text-white">AWS-ready</div>
                <div className="mt-2 text-sm leading-6 text-zinc-400">
                  Estrutura pensada para operar em cloud própria com separação entre app, API e serviços.
                </div>
              </div>
              <div className="rounded-[26px] border border-white/10 bg-black/20 p-5">
                <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Integrations</div>
                <div className="mt-3 text-xl font-semibold text-white">Open Finance + ERP + AI</div>
                <div className="mt-2 text-sm leading-6 text-zinc-400">
                  Direcionamento para provedores financeiros, billing, email, calendários e ecossistemas enterprise.
                </div>
              </div>
              <div className="rounded-[26px] border border-white/10 bg-black/20 p-5">
                <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Positioning</div>
                <div className="mt-3 text-xl font-semibold text-white">Built for scale</div>
                <div className="mt-2 text-sm leading-6 text-zinc-400">
                  Produto desenhado para crescer de SaaS premium para uma stack operacional completa.
                </div>
              </div>
            </div>
          </div>

          <div
            id="contact"
            className="rounded-[34px] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.18),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.2)]"
          >
            <Eyebrow>CONTACT</Eyebrow>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Uma base institucional forte para abrir contas, validar integrações e expandir a operação.
            </h2>
            <p className="mt-5 text-sm leading-7 text-zinc-400">
              O domínio oficial da ELYON OS já pode ser usado como presença institucional da marca
              para onboarding de providers, criação de contas business e posicionamento inicial do produto.
            </p>

            <div className="mt-8 space-y-3">
              <div className="rounded-[24px] border border-white/10 bg-black/20 px-4 py-4 text-sm text-zinc-300">
                contato@elyonos.com.br
              </div>
              <div className="rounded-[24px] border border-white/10 bg-black/20 px-4 py-4 text-sm text-zinc-300">
                elyonos.com.br
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="mailto:contato@elyonos.com.br"
                className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
              >
                Falar com a equipe
              </Link>
              <a
                href="#top"
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
              >
                Voltar ao topo
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
