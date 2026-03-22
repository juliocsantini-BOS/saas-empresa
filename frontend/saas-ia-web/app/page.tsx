import Link from 'next/link';

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] uppercase tracking-[0.24em] text-zinc-300">
      {children}
    </div>
  );
}

function Metric({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
      <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">{label}</div>
      <div className="mt-3 text-2xl font-semibold tracking-tight text-white">{value}</div>
      <div className="mt-2 text-sm leading-6 text-zinc-400">{note}</div>
    </div>
  );
}

function Capability({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.018))] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
      <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Capability</div>
      <div className="mt-4 text-xl font-semibold text-white">{title}</div>
      <div className="mt-2 text-sm leading-7 text-zinc-400">{text}</div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-[#07080D] text-white">
      <div className="mx-auto max-w-[1480px] px-5 py-5 md:px-8 xl:px-10">
        <header className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.018))] px-5 py-4 shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-[linear-gradient(135deg,rgba(139,92,246,0.96),rgba(76,29,149,0.76))] shadow-[0_0_40px_rgba(139,92,246,0.28)]">
                <div className="h-3.5 w-3.5 rounded-full bg-white" />
              </div>
              <div>
                <div className="text-[17px] font-semibold tracking-tight text-white">ELYON OS</div>
                <div className="text-sm text-zinc-500">Enterprise operating system</div>
              </div>
            </div>

            <nav className="flex flex-wrap items-center gap-1.5 text-sm text-zinc-300">
              <a href="#platform" className="rounded-2xl px-3 py-2 hover:bg-white/5">
                Plataforma
              </a>
              <a href="#modules" className="rounded-2xl px-3 py-2 hover:bg-white/5">
                Módulos
              </a>
              <a href="#infrastructure" className="rounded-2xl px-3 py-2 hover:bg-white/5">
                Infraestrutura
              </a>
              <a href="#contact" className="rounded-2xl px-3 py-2 hover:bg-white/5">
                Contato
              </a>
            </nav>
          </div>
        </header>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.25fr,0.75fr]">
          <div className="overflow-hidden rounded-[42px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.24),transparent_22%),radial-gradient(circle_at_78%_18%,rgba(124,58,237,0.16),transparent_16%),linear-gradient(180deg,rgba(12,14,22,0.98),rgba(7,9,15,0.98))] p-7 shadow-[0_30px_90px_rgba(0,0,0,0.28)] md:p-8 xl:p-10">
            <div className="flex flex-wrap items-center gap-2">
              <Pill>AI COMMAND LAYER</Pill>
              <Pill>MULTI-ENTITY READY</Pill>
              <Pill>AWS PATH</Pill>
            </div>

            <div className="mt-8 max-w-5xl">
              <h1 className="text-[42px] font-semibold leading-[0.9] tracking-[-0.07em] text-white md:text-[64px] xl:text-[82px]">
                Uma camada operacional para finanças, CRM, automação e governança empresarial.
              </h1>
              <p className="mt-6 max-w-3xl text-[15px] leading-8 text-zinc-300 md:text-lg">
                A ELYON OS foi desenhada para consolidar command center, módulos críticos
                e copilotos executáveis em uma estrutura única, orientada a operação real.
              </p>
            </div>

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
                Ver estrutura
              </a>
            </div>

            <div className="mt-10 grid gap-4 lg:grid-cols-[0.9fr,1.1fr]">
              <div className="rounded-[30px] border border-white/10 bg-black/20 p-5">
                <div className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">Positioning</div>
                <div className="mt-4 text-2xl font-semibold tracking-tight text-white">
                  Enterprise AI operating system
                </div>
                <div className="mt-3 text-sm leading-7 text-zinc-400">
                  Software orientado a decisão, execução e governança para grupos, operações
                  multi-unidade e times que precisam de uma camada premium de comando.
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <Metric
                  label="Finance"
                  value="Control Tower"
                  note="Treasury, revenue ops, procurement, compliance e CFO autopilot."
                />
                <Metric
                  label="CRM"
                  value="Signal Driven"
                  note="Pipeline, guided selling, workspaces comerciais e intelligence layer."
                />
                <Metric
                  label="Core"
                  value="Structured"
                  note="Empresas, filiais, departamentos, RBAC, auditoria e escala operacional."
                />
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
              <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">Operating thesis</div>
              <div className="mt-4 text-3xl font-semibold tracking-tight text-white">
                Menos ferramentas soltas. Mais uma camada de operação integrada.
              </div>
              <div className="mt-4 text-sm leading-7 text-zinc-400">
                Em vez de fragmentar CRM, finanças, automação e controladoria, a ELYON OS
                reúne os principais domínios em um sistema orientado a command center.
              </div>
            </div>

            <div className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,18,28,0.96),rgba(9,10,16,0.98))] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
              <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">Readiness</div>
              <div className="mt-4 space-y-4">
                <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                  <div className="text-base font-semibold text-white">Domain-first architecture</div>
                  <div className="mt-2 text-sm leading-6 text-zinc-400">
                    Pronta para domínio próprio, presença institucional e ecossistema de integrações.
                  </div>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                  <div className="text-base font-semibold text-white">Cloud expansion path</div>
                  <div className="mt-2 text-sm leading-6 text-zinc-400">
                    Fundamentos para app, API, workers, data layer e rollout em infraestrutura própria.
                  </div>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                  <div className="text-base font-semibold text-white">Provider onboarding</div>
                  <div className="mt-2 text-sm leading-6 text-zinc-400">
                    Base institucional para abrir contas business e ativar Google, Open Finance e parceiros enterprise.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="platform" className="mt-6 grid gap-6 xl:grid-cols-[0.82fr,1.18fr]">
          <div className="rounded-[36px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.015))] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
            <Pill>PLATFORM</Pill>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Construída para operar como software enterprise, não como dashboard decorativo.
            </h2>
            <div className="mt-5 space-y-4 text-sm leading-7 text-zinc-400">
              <p>
                A plataforma foi desenhada para unificar camada executiva, módulos operacionais,
                governança, estrutura multi-unidade e copilotos contextuais.
              </p>
              <p>
                A proposta não é criar mais uma ferramenta isolada, mas uma base para consolidar
                finanças, CRM, workflows e operação em uma única experiência.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Capability
              title="Core operacional"
              text="Empresas, filiais, departamentos, permissões, auditoria e estrutura enterprise como fundação do produto."
            />
            <Capability
              title="Camada de IA"
              text="Copilotos e command interfaces desenhados para execução, contexto operacional e leitura premium."
            />
            <Capability
              title="Execution workspaces"
              text="Domínios orientados a operador para comercial, controladoria, procurement, compliance e treasury."
            />
            <Capability
              title="Integration-ready"
              text="Arquitetura pensada para Open Finance, billing, ERP, email, calendários e expansão para cloud própria."
            />
          </div>
        </section>

        <section id="modules" className="mt-6 rounded-[38px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.014))] p-6 shadow-[0_22px_60px_rgba(0,0,0,0.18)]">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <Pill>MODULE STACK</Pill>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white md:text-4xl">
                Um stack desenhado para operar empresa, não apenas exibir informação.
              </h2>
            </div>
            <div className="max-w-2xl text-sm leading-7 text-zinc-400">
              Módulos independentes, mas conectados por uma mesma linguagem de produto:
              command center, governança, workflows, IA e estrutura multi-entidade.
            </div>
          </div>

          <div className="mt-8 grid gap-4 xl:grid-cols-4">
            <div className="rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.18),transparent_24%),linear-gradient(180deg,rgba(14,15,24,0.96),rgba(9,10,16,0.98))] p-6">
              <div className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">Finance OS</div>
              <div className="mt-4 text-2xl font-semibold text-white">Controladoria premium</div>
              <div className="mt-3 text-sm leading-7 text-zinc-400">
                Treasury, revenue operations, procurement, compliance, BI e CFO autopilot em uma única camada.
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.016))] p-6">
              <div className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">CRM OS</div>
              <div className="mt-4 text-2xl font-semibold text-white">Sales intelligence</div>
              <div className="mt-3 text-sm leading-7 text-zinc-400">
                Pipeline executivo, guided selling, workspaces comerciais e playbooks operacionais.
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.016))] p-6">
              <div className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">Automation OS</div>
              <div className="mt-4 text-2xl font-semibold text-white">Orchestration layer</div>
              <div className="mt-3 text-sm leading-7 text-zinc-400">
                Regras, execuções, gatilhos e automações transversais entre domínios críticos.
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.016))] p-6">
              <div className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">AI Command</div>
              <div className="mt-4 text-2xl font-semibold text-white">Embedded copilots</div>
              <div className="mt-3 text-sm leading-7 text-zinc-400">
                Interfaces conversacionais e decision support para vendas, finanças e operação enterprise.
              </div>
            </div>
          </div>
        </section>

        <section id="infrastructure" className="mt-6 grid gap-6 xl:grid-cols-[1.05fr,0.95fr]">
          <div className="rounded-[36px] border border-white/10 bg-[linear-gradient(180deg,rgba(13,15,22,0.98),rgba(8,10,16,0.98))] p-6 shadow-[0_22px_60px_rgba(0,0,0,0.18)]">
            <Pill>INFRASTRUCTURE</Pill>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Base institucional e técnica para escalar a marca e preparar o rollout em cloud.
            </h2>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Metric
                label="Domain"
                value="elyonos.com.br"
                note="Ponto oficial de presença institucional e distribuição pública do produto."
              />
              <Metric
                label="Cloud Path"
                value="AWS Ready"
                note="Separação prevista entre domínio, app, API, workers, data e integrações."
              />
              <Metric
                label="Provider Onboarding"
                value="Business Setup"
                note="Base pronta para abertura de contas business e ativação de parceiros estratégicos."
              />
              <Metric
                label="Expansion"
                value="Integration First"
                note="Open Finance, ERP, billing, email, identidade e serviços enterprise no roadmap."
              />
            </div>
          </div>

          <div
            id="contact"
            className="rounded-[36px] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.18),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.016))] p-6 shadow-[0_22px_60px_rgba(0,0,0,0.18)]"
          >
            <Pill>CONTACT</Pill>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Uma presença institucional forte para abrir portas com providers e parceiros enterprise.
            </h2>
            <p className="mt-5 text-sm leading-7 text-zinc-400">
              O domínio oficial da ELYON OS já pode sustentar onboarding com Google,
              provedores de Open Finance, billing, ERP, identidade e parceiros de infraestrutura.
            </p>

            <div className="mt-8 space-y-3">
              <div className="rounded-[24px] border border-white/10 bg-black/20 px-4 py-4 text-sm text-zinc-300">
                contato@elyonos.com.br
              </div>
              <div className="rounded-[24px] border border-white/10 bg-black/20 px-4 py-4 text-sm text-zinc-300">
                www.elyonos.com.br
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="mailto:contato@elyonos.com.br"
                className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
              >
                Falar com a equipe
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
