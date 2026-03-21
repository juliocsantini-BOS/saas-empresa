'use client';

import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3000';

type MeResponse = {
  id: string;
  role: string;
  name?: string | null;
  companyId?: string | null;
  branchId?: string | null;
  departmentId?: string | null;
};

type CompanyProfile = {
  id: string;
  name: string;
  sector?: string | null;
  teamSize?: string | null;
  operationModel?: string | null;
  hasInventory?: string | null;
  salesModel?: string | null;
  financeMaturity?: string | null;
  multiUnit?: string | null;
  mainGoal?: string | null;
  createdAt: string;
};

type UserItem = {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  branchId?: string | null;
  departmentId?: string | null;
};

type BranchItem = {
  id: string;
  name: string;
  companyId: string;
};

type DepartmentItem = {
  id: string;
  name: string;
  companyId: string;
  branchId: string;
};

type AssistantResponse = {
  summary: string;
  recommendation: string;
  nextStep: string;
  tone: string;
};

function getErrorMessage(error: unknown, fallback: string) {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as { response?: unknown }).response === 'object'
  ) {
    const response = (error as {
      response?: {
        data?: {
          message?: string | string[];
        };
      };
    }).response;

    const message = response?.data?.message;

    if (Array.isArray(message)) {
      return message.join(', ');
    }

    if (typeof message === 'string' && message.trim()) {
      return message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z"
        className="fill-[#8B5CF6]"
      />
    </svg>
  );
}

function ArrowUpIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M12 18V6M12 6L7.5 10.5M12 6L16.5 10.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Page() {
  const [me, setMe] = useState<MeResponse | null>(null);
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [branches, setBranches] = useState<BranchItem[]>([]);
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [input, setInput] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [currentAnswer, setCurrentAnswer] = useState<AssistantResponse | null>(null);
  const [displayedAnswer, setDisplayedAnswer] = useState<AssistantResponse | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    async function loadCopilotContext() {
      const token = localStorage.getItem('access_token');

      if (!token) {
        setError('Token nao encontrado.');
        setLoading(false);
        return;
      }

      try {
        const [meRes, companyRes, usersRes, branchesRes, departmentsRes] = await Promise.all([
          axios.get(API_URL + '/v1/auth/me', {
            headers: { Authorization: 'Bearer ' + token },
          }),
          axios.get(API_URL + '/v1/company/current', {
            headers: { Authorization: 'Bearer ' + token },
          }),
          axios.get(API_URL + '/v1/users', {
            headers: { Authorization: 'Bearer ' + token },
          }),
          axios.get(API_URL + '/v1/branches', {
            headers: { Authorization: 'Bearer ' + token },
          }),
          axios.get(API_URL + '/v1/departments', {
            headers: { Authorization: 'Bearer ' + token },
          }),
        ]);

        setMe(meRes.data);
        setCompany(companyRes.data ?? null);
        setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
        setBranches(Array.isArray(branchesRes.data) ? branchesRes.data : []);
        setDepartments(Array.isArray(departmentsRes.data) ? departmentsRes.data : []);
        setError('');
      } catch (err: unknown) {
        setError(getErrorMessage(err, 'Falha ao carregar contexto do copiloto.'));
      } finally {
        setLoading(false);
      }
    }

    loadCopilotContext();
  }, []);

  const stats = useMemo(() => {
    const activeUsers = users.filter((user) => user.isActive).length;
    const inactiveUsers = users.length - activeUsers;

    return {
      activeUsers,
      inactiveUsers,
      branches: branches.length,
      departments: departments.length,
    };
  }, [users, branches, departments]);

  const contextPills = useMemo(() => {
    return [
      company?.name || 'Empresa atual',
      company?.sector || 'Setor nao informado',
      company?.operationModel || 'Operacao nao informada',
      company?.multiUnit === 'sim' ? 'Multi-unidade ativa' : 'Operacao centralizada',
    ];
  }, [company]);

  useEffect(() => {
    const element = textareaRef.current;
    if (!element) return;

    element.style.height = '0px';
    element.style.height = `${Math.min(element.scrollHeight, 160)}px`;
  }, [input]);

  useEffect(() => {
    if (!currentAnswer) {
      setDisplayedAnswer(null);
      return;
    }

    let index = 0;
    const fullText = `${currentAnswer.summary}\n\n${currentAnswer.recommendation}\n\n${currentAnswer.nextStep}`;
    setDisplayedAnswer({
      summary: '',
      recommendation: '',
      nextStep: '',
      tone: currentAnswer.tone,
    });

    const timer = window.setInterval(() => {
      index += 3;
      const partial = fullText.slice(0, index);
      const blocks = partial.split('\n\n');

      setDisplayedAnswer({
        summary: blocks[0] || '',
        recommendation: blocks[1] || '',
        nextStep: blocks[2] || '',
        tone: currentAnswer.tone,
      });

      if (index >= fullText.length) {
        window.clearInterval(timer);
      }
    }, 18);

    return () => window.clearInterval(timer);
  }, [currentAnswer]);

  function buildAssistantReply(question: string): AssistantResponse {
    const q = normalize(question);

    if (q.includes('usuario') || q.includes('usuarios') || q.includes('equipe')) {
      return {
        summary: `Hoje eu leio ${users.length} usuarios cadastrados em ${company?.name || 'sua empresa'}, com ${stats.activeUsers} ativos e ${stats.inactiveUsers} inativos.`,
        recommendation:
          'Minha recomendacao e consolidar a governanca de acessos e usar essa base para ativar fluxos mais inteligentes por equipe, unidade e departamento.',
        nextStep:
          'O proximo passo natural e revisar perfis ativos por funcao e cruzar isso com operacao, permissoes e metas por area.',
        tone: 'Equipe e capacidade operacional',
      };
    }

    if (q.includes('estoque') || q.includes('inventario')) {
      if (company?.hasInventory === 'sim') {
        return {
          summary:
            'Sim. O contexto atual indica operacao com estoque, entao existe aderencia para ativar essa camada no produto.',
          recommendation:
            'Eu priorizaria inventario, reposicao, estoque minimo e integracao direta com vendas para criar um fluxo operacional completo.',
          nextStep:
            'O passo mais forte agora e estruturar o modulo de estoque por unidade e preparar leitura executiva de ruptura, giro e reposicao.',
          tone: 'Ativacao de inventario',
        };
      }

      return {
        summary:
          'Ainda nao vejo estoque como a primeira prioridade para a operacao atual.',
        recommendation:
          'O contexto atual sugere consolidar CRM, atendimento, automacoes e visibilidade executiva antes de abrir uma frente maior de inventario.',
        nextStep:
          'O melhor passo agora e fortalecer a camada comercial e o dashboard executivo para depois ativar estoque com mais clareza.',
        tone: 'Sequencia ideal de modulos',
      };
    }

    if (q.includes('modulo') || q.includes('modulos') || q.includes('prioridade')) {
      if (company?.hasInventory === 'sim') {
        return {
          summary:
            'A prioridade mais inteligente agora e consolidar o eixo comercial e executivo antes de ampliar ainda mais a operacao.',
          recommendation:
            'Minha recomendacao e consolidar CRM e visao executiva, ativar estoque e depois reforcar automacoes e IA operacional.',
          nextStep:
            'Em termos de produto, o proximo ciclo deveria elevar CRM, estoque e analytics ao mesmo padrao visual e funcional.',
          tone: 'Roadmap prioritario',
        };
      }

      return {
        summary:
          'A leitura atual da empresa aponta para consolidacao das frentes mais estrategicas antes de abrir modulos demais.',
        recommendation:
          'Minha recomendacao agora e elevar CRM, copiloto IA e dashboard executivo, depois atacar financeiro e os demais modulos.',
        nextStep:
          'O proximo passo e fechar esse trio como referencia premium do produto e usa-lo como padrao para os outros modulos.',
        tone: 'Priorizacao de produto',
      };
    }

    if (q.includes('filial') || q.includes('filiais') || q.includes('unidade') || q.includes('multi')) {
      if (company?.multiUnit === 'sim' || stats.branches > 1) {
        return {
          summary: `Hoje a empresa esta em leitura multi-unidade. Existem ${stats.branches} filiais registradas e a base organizacional ja aponta para operacao em rede.`,
          recommendation:
            'O ganho natural agora e consolidar indicadores por unidade, comparativos de performance e metas por filial.',
          nextStep:
            'O proximo passo ideal e desenhar uma camada executiva que mostre ranking, faturamento e alertas por filial.',
          tone: 'Leitura de rede operacional',
        };
      }

      return {
        summary: `Hoje a operacao parece centralizada, com ${stats.branches} filial(is) cadastrada(s).`,
        recommendation:
          'O melhor caminho e organizar profundamente a estrutura atual antes de escalar a visao de rede.',
        nextStep:
          'Eu recomendaria primeiro consolidar matriz, unidade, departamentos e acessos para depois abrir uma leitura mais forte de multi-unidade.',
        tone: 'Escalabilidade estrutural',
      };
    }

    if (
      q.includes('execut') ||
      q.includes('faca') ||
      q.includes('execute') ||
      q.includes('crie') ||
      q.includes('ativ')
    ) {
      return {
        summary:
          'Nesta fase eu estou operando como copiloto conversacional e contextual dentro do sistema.',
        recommendation:
          'Ja consigo orientar decisoes, prioridades e proximos passos com base no contexto atual da empresa.',
        nextStep:
          'A proxima evolucao sera permitir execucao de comandos reais dentro do dashboard, como abrir fluxos, disparar acoes e criar estruturas operacionais.',
        tone: 'Capacidade atual do copiloto',
      };
    }

    return {
      summary: `Com base no contexto atual de ${company?.name || 'sua empresa'}, a prioridade central parece ser ${company?.mainGoal || 'eficiencia operacional'}.`,
      recommendation:
        'Eu usaria esse foco para guiar decisao de modulos, organizacao da operacao e proximas automacoes.',
      nextStep:
        'Se quiser, eu posso te orientar sobre usuarios, multi-unidade, estoque ou modulos prioritarios dentro desse mesmo contexto.',
      tone: 'Leitura executiva',
    };
  }

  function submitQuestion(question: string) {
    const trimmed = question.trim();
    if (!trimmed) return;

    setCurrentQuestion(trimmed);
    setCurrentAnswer(buildAssistantReply(trimmed));
    setInput('');
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitQuestion(input);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submitQuestion(input);
    }
  }

  if (loading) {
    return (
      <div className="rounded-[32px] border border-white/10 bg-[#111113] p-6 text-sm text-zinc-300 shadow-[0_0_60px_rgba(139,92,246,0.05)]">
        Carregando copiloto IA...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[32px] border border-red-500/20 bg-red-500/10 p-6 text-sm text-red-300 shadow-[0_0_60px_rgba(139,92,246,0.05)]">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-11rem)] overflow-hidden rounded-[40px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.16),transparent_22%),radial-gradient(circle_at_top_right,rgba(84,147,255,0.12),transparent_20%),linear-gradient(180deg,#0A1118_0%,#0B1118_45%,#091018_100%)] shadow-[0_0_90px_rgba(139,92,246,0.05)]">
      <div className="flex min-h-[calc(100vh-11rem)] flex-col">
        <header className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-[#8B5CF6]/20 bg-[#8B5CF6]/10 shadow-[0_0_30px_rgba(139,92,246,0.14)]">
              <div className="absolute inset-[7px] rounded-[14px] border border-white/10 bg-white/[0.02]" />
              <div className="relative h-4 w-4 rounded-full bg-[linear-gradient(135deg,#8B5CF6,#5D9CFF)] shadow-[0_0_24px_rgba(139,92,246,0.24)]" />
            </div>
            <div>
              <div className="text-lg font-semibold tracking-tight text-white">Copiloto IA</div>
              <div className="text-sm text-zinc-500">
                {company?.name || 'Empresa atual'} - {me?.role || 'Operador'}
              </div>
            </div>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <div className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-zinc-400">
              {contextPills[1]}
            </div>
            <div className="rounded-full border border-[#8B5CF6]/10 bg-[#8B5CF6]/[0.05] px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-[#B8FFD3]">
              {contextPills[3]}
            </div>
          </div>
        </header>

        <div className="flex flex-1 flex-col items-center justify-center px-5 py-14">
          <div className="w-full max-w-5xl">
            {!currentAnswer ? (
              <div className="mx-auto max-w-3xl text-center">
                <div className="relative mx-auto flex h-28 w-28 items-center justify-center">
                  <div className="absolute inset-0 rounded-[36px] border border-white/10 bg-[radial-gradient(circle_at_30%_30%,rgba(139,92,246,0.34),transparent_45%),radial-gradient(circle_at_70%_35%,rgba(93,156,255,0.28),transparent_40%),rgba(255,255,255,0.03)] shadow-[0_0_100px_rgba(139,92,246,0.16)]" />
                  <div className="absolute inset-[10px] rounded-[28px] border border-white/10 bg-[#0C151B]/80 backdrop-blur-xl" />
                  <div className="absolute inset-[22px] rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))]" />
                  <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-[conic-gradient(from_180deg,#8B5CF6,#86FFD3,#5D9CFF,#8B5CF6)] text-[#08110E] shadow-[0_0_40px_rgba(139,92,246,0.24)]">
                    <SparkIcon />
                  </div>
                </div>

                <div className="mt-10 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-zinc-400">
                  <span className="h-2 w-2 rounded-full bg-[#8B5CF6] shadow-[0_0_16px_rgba(196,181,253,0.9)]" />
                  IA operacional ativa
                </div>

                <h2 className="mt-8 text-3xl font-semibold tracking-[-0.045em] text-white md:text-5xl">
                  Como posso ajudar voce hoje?
                </h2>
              </div>
            ) : (
              <div className="mx-auto mb-10 max-w-4xl space-y-5">
                <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] px-6 py-5 shadow-[0_20px_50px_rgba(0,0,0,0.18)]">
                  <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                    Sua pergunta
                  </div>
                  <div className="mt-3 text-lg font-medium text-white">{currentQuestion}</div>
                </div>

                <div className="relative overflow-hidden rounded-[36px] border border-[#8B5CF6]/12 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.22),transparent_42%),radial-gradient(circle_at_top_right,rgba(93,156,255,0.12),transparent_35%),rgba(255,255,255,0.025)] px-6 py-6 shadow-[0_0_80px_rgba(139,92,246,0.06)]">
                  <div className="pointer-events-none absolute inset-x-12 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(139,92,246,0.45),transparent)]" />
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#8B5CF6]/16 bg-[#8B5CF6]/10">
                      <div className="flex h-4 w-4 items-center justify-center rounded-full bg-[linear-gradient(135deg,#8B5CF6,#5D9CFF)] text-[#07100D]">
                        <SparkIcon />
                      </div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-[0.18em] text-[#B8FFD3]">
                        Copiloto IA
                      </div>
                      <div className="text-xs text-zinc-500">Leitura contextual da empresa atual</div>
                    </div>
                  </div>
                  <div className="mb-6 inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-zinc-400">
                    {currentAnswer.tone}
                  </div>

                  <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                    <div className="px-5 py-5">
                      <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                        Resumo
                      </div>
                      <div className="mt-3 text-[15px] leading-8 text-zinc-200">
                        {displayedAnswer?.summary}
                        {!displayedAnswer?.recommendation &&
                        displayedAnswer?.summary !== currentAnswer.summary ? (
                          <span className="ml-1 inline-block h-5 w-[2px] animate-pulse rounded-full bg-[#B8FFD3]" />
                        ) : null}
                      </div>
                    </div>

                    <div className="h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent)]" />

                    <div className="bg-[linear-gradient(180deg,rgba(139,92,246,0.07),rgba(255,255,255,0.015))] px-5 py-5">
                      <div className="text-[11px] uppercase tracking-[0.18em] text-[#B8FFD3]">
                        Recomendacao
                      </div>
                      <div className="mt-3 text-[15px] leading-8 text-zinc-200">
                        {displayedAnswer?.recommendation}
                        {!displayedAnswer?.nextStep &&
                        displayedAnswer?.recommendation !== currentAnswer.recommendation ? (
                          <span className="ml-1 inline-block h-5 w-[2px] animate-pulse rounded-full bg-[#B8FFD3]" />
                        ) : null}
                      </div>
                    </div>

                    <div className="h-px bg-[linear-gradient(90deg,transparent,rgba(93,156,255,0.12),transparent)]" />

                    <div className="bg-[linear-gradient(180deg,rgba(93,156,255,0.08),rgba(255,255,255,0.015))] px-5 py-5">
                      <div className="text-[11px] uppercase tracking-[0.18em] text-[#C7D8FF]">
                        Proximo passo
                      </div>
                      <div className="mt-3 text-[15px] leading-8 text-zinc-200">
                        {displayedAnswer?.nextStep}
                        {displayedAnswer?.nextStep !== currentAnswer.nextStep ? (
                          <span className="ml-1 inline-block h-5 w-[2px] animate-pulse rounded-full bg-[#B8FFD3]" />
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mx-auto mt-8 max-w-4xl">
              <form onSubmit={handleSubmit}>
                <div className="relative overflow-hidden rounded-[40px] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.025))] p-3 shadow-[0_28px_110px_rgba(0,0,0,0.3)] backdrop-blur-xl">
                  <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(139,92,246,0.55),transparent)]" />
                  <div className="pointer-events-none absolute inset-x-16 bottom-0 h-px bg-[linear-gradient(90deg,transparent,rgba(93,156,255,0.18),transparent)]" />
                  <div className="mb-3 flex items-center justify-between px-2">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-zinc-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#8B5CF6]" />
                      Chat operacional
                    </div>
                    <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                      Enter envia
                    </div>
                  </div>

                  <div className="flex items-end gap-3 rounded-[30px] border border-white/8 bg-black/10 px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-zinc-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                      <SparkIcon />
                    </div>

                    <textarea
                      ref={textareaRef}
                      value={input}
                      onChange={(event) => setInput(event.target.value)}
                      onKeyDown={handleKeyDown}
                      rows={2}
                      placeholder="Pergunte qualquer coisa ou descreva a acao que deseja executar..."
                      className="max-h-40 min-h-[3.5rem] flex-1 resize-none bg-transparent px-2 py-2.5 text-[15px] leading-7 text-white outline-none placeholder:text-zinc-500"
                    />

                    <button
                      type="submit"
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#FFFFFF,#D9FBE8)] text-black shadow-[0_0_30px_rgba(255,255,255,0.12)] transition duration-200 hover:scale-[1.03] hover:shadow-[0_0_35px_rgba(217,251,232,0.22)]"
                    >
                      <ArrowUpIcon />
                    </button>
                  </div>
                </div>
              </form>

              <div className="mt-6 flex flex-wrap justify-center gap-3 text-xs text-zinc-500">
                <div className="rounded-full border border-white/10 bg-black/20 px-4 py-2 backdrop-blur-sm">
                  {company?.sector || 'Setor nao informado'}
                </div>
                <div className="rounded-full border border-white/10 bg-black/20 px-4 py-2 backdrop-blur-sm">
                  {company?.operationModel || 'Operacao nao informada'}
                </div>
                <div className="rounded-full border border-white/10 bg-black/20 px-4 py-2 backdrop-blur-sm">
                  {stats.activeUsers} usuarios ativos
                </div>
                <div className="rounded-full border border-white/10 bg-black/20 px-4 py-2 backdrop-blur-sm">
                  {stats.branches} filiais
                </div>
                <div className="rounded-full border border-white/10 bg-black/20 px-4 py-2 backdrop-blur-sm">
                  {stats.departments} departamentos
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
