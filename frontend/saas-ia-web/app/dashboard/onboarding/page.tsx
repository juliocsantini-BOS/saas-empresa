'use client';

import { useMemo, useState } from 'react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.elyonos.com.br';

type StepKey = 'identity' | 'profile' | 'operations' | 'review';

type BusinessProfile = {
  companyName: string;
  branchName: string;
  ownerName: string;
  ownerEmail: string;
  ownerPassword: string;
  ownerRole: 'CEO' | 'ADMIN';
  sector: string;
  teamSize: string;
  operationModel: 'produtos' | 'servicos' | 'hibrido';
  hasInventory: 'sim' | 'nao';
  salesModel: string;
  financeMaturity: string;
  multiUnit: 'sim' | 'nao';
  mainGoal: string;
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

const initialProfile: BusinessProfile = {
  companyName: '',
  branchName: 'Matriz',
  ownerName: '',
  ownerEmail: '',
  ownerPassword: '',
  ownerRole: 'CEO',
  sector: 'servicos',
  teamSize: '1-10',
  operationModel: 'servicos',
  hasInventory: 'nao',
  salesModel: 'consultivo',
  financeMaturity: 'medio',
  multiUnit: 'nao',
  mainGoal: 'ganhar eficiencia operacional',
};

const orderedSteps: Array<{ key: StepKey; title: string; description: string }> = [
  {
    key: 'identity',
    title: 'Empresa e owner',
    description: 'Criacao inicial da empresa, unidade base e responsavel principal.',
  },
  {
    key: 'profile',
    title: 'Perfil do negocio',
    description: 'Entendimento inicial da operacao para orientar modulos e configuracao.',
  },
  {
    key: 'operations',
    title: 'Operacao e prioridades',
    description: 'Mapeamento das rotinas que vao guiar o Business OS.',
  },
  {
    key: 'review',
    title: 'Revisao inteligente',
    description: 'Leitura sintetica da empresa antes de criar a estrutura inicial.',
  },
];

export default function OnboardingPage() {
  const [stepIndex, setStepIndex] = useState(0);
  const [profile, setProfile] = useState<BusinessProfile>(initialProfile);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [creating, setCreating] = useState(false);

  const currentStep = orderedSteps[stepIndex];

  const recommendations = useMemo(() => {
    const modules = ['CRM'];

    if (profile.hasInventory === 'sim' || profile.operationModel !== 'servicos') {
      modules.push('Estoque');
    }

    modules.push('Financeiro');

    if (profile.teamSize !== '1-10') {
      modules.push('RH');
    }

    if (profile.salesModel === 'inside-sales' || profile.salesModel === 'consultivo') {
      modules.push('Automacoes');
    }

    const permissions = [
      'CEO / Direcao com visao global',
      profile.multiUnit === 'sim'
        ? 'Gestores por unidade com escopo proprio'
        : 'Gestores por area com escopo local',
      'Equipe operacional com acesso por departamento',
    ];

    const insights = [
      `Modelo operacional identificado: ${profile.operationModel}.`,
      profile.multiUnit === 'sim'
        ? 'A empresa deve priorizar comparativos por unidade e controle consolidado.'
        : 'A operacao parece centralizada e pronta para estrutura por areas.',
      profile.hasInventory === 'sim'
        ? 'Ha indicio claro de necessidade de estoque e previsao de reposicao.'
        : 'A base inicial pode priorizar vendas, atendimento e financeiro antes de inventario.',
    ];

    return { modules, permissions, insights };
  }, [profile]);

  function updateProfile<K extends keyof BusinessProfile>(key: K, value: BusinessProfile[K]) {
    setProfile((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function goNext() {
    setError('');
    setSuccess('');
    setStepIndex((current) => Math.min(current + 1, orderedSteps.length - 1));
  }

  function goBack() {
    setError('');
    setSuccess('');
    setStepIndex((current) => Math.max(current - 1, 0));
  }

  async function handleCreateCompany() {
    const token = localStorage.getItem('access_token');

    if (!token) {
      setError('Token nao encontrado.');
      return;
    }

    setCreating(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(
        API_URL + '/v1/company/onboard',
        {
          name: profile.companyName,
          ownerEmail: profile.ownerEmail,
          ownerName: profile.ownerName,
          ownerPassword: profile.ownerPassword,
          ownerRole: profile.ownerRole,
          branchName: profile.branchName,
          sector: profile.sector,
          teamSize: profile.teamSize,
          operationModel: profile.operationModel,
          hasInventory: profile.hasInventory,
          salesModel: profile.salesModel,
          financeMaturity: profile.financeMaturity,
          multiUnit: profile.multiUnit,
          mainGoal: profile.mainGoal,
        },
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        }
      );

      const createdCompanyId = response.data?.company?.id || 'N/A';
      setSuccess(
        `Empresa criada com sucesso. Company ID: ${createdCompanyId}. A leitura operacional gerada pode agora orientar modulos, permissoes e dashboards.`
      );
      setStepIndex(orderedSteps.length - 1);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Falha ao criar empresa pelo onboarding.'));
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-[36px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.16),transparent_32%),radial-gradient(circle_at_top_right,rgba(84,147,255,0.14),transparent_30%),#0B1118] p-6 shadow-[0_0_70px_rgba(139,92,246,0.06)] md:p-7">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="xl:col-span-8">
            <div className="inline-flex rounded-full border border-[#8B5CF6]/20 bg-[#8B5CF6]/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-[#DDD6FE]">
              Intelligent onboarding
            </div>
            <h2 className="mt-5 max-w-3xl text-3xl font-semibold tracking-tight text-white md:text-4xl">
              A entrada da empresa no sistema comeca pela leitura do negocio, nao apenas pelo cadastro.
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-400 md:text-base">
              Esta primeira versao combina criacao real de empresa com uma camada de entendimento operacional. Assim, o ELYON OS ja nasce orientado por estrutura, modulos e prioridades.
            </p>
          </div>

          <div className="xl:col-span-4">
            <div className="rounded-[28px] border border-white/10 bg-[rgba(5,10,15,0.55)] p-5">
              <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                Etapa atual
              </div>
              <div className="mt-4 text-2xl font-semibold text-white">
                {currentStep.title}
              </div>
              <div className="mt-2 text-sm text-zinc-400">
                {currentStep.description}
              </div>
              <div className="mt-6 space-y-3">
                {orderedSteps.map((step, index) => (
                  <div
                    key={step.key}
                    className={
                      index === stepIndex
                        ? 'rounded-2xl border border-[#8B5CF6]/20 bg-[#8B5CF6]/10 px-4 py-3 text-sm text-white'
                        : 'rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-zinc-400'
                    }
                  >
                    {index + 1}. {step.title}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <div className="rounded-[32px] border border-white/10 bg-[#111113] p-6 shadow-[0_0_60px_rgba(139,92,246,0.05)]">
            {currentStep.key === 'identity' ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm text-zinc-400">Nome da empresa</label>
                  <input
                    value={profile.companyName}
                    onChange={(e) => updateProfile('companyName', e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#8B5CF6]/40"
                    placeholder="Ex.: Acme Business Group"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-zinc-400">Unidade inicial</label>
                  <input
                    value={profile.branchName}
                    onChange={(e) => updateProfile('branchName', e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#8B5CF6]/40"
                    placeholder="Matriz"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-zinc-400">Role do owner</label>
                  <select
                    value={profile.ownerRole}
                    onChange={(e) => updateProfile('ownerRole', e.target.value as 'CEO' | 'ADMIN')}
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#8B5CF6]/40"
                  >
                    <option value="CEO">CEO</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-zinc-400">Nome do owner</label>
                  <input
                    value={profile.ownerName}
                    onChange={(e) => updateProfile('ownerName', e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#8B5CF6]/40"
                    placeholder="Nome do responsavel"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-zinc-400">Email do owner</label>
                  <input
                    type="email"
                    value={profile.ownerEmail}
                    onChange={(e) => updateProfile('ownerEmail', e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#8B5CF6]/40"
                    placeholder="owner@empresa.com"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm text-zinc-400">Senha inicial</label>
                  <input
                    type="password"
                    value={profile.ownerPassword}
                    onChange={(e) => updateProfile('ownerPassword', e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#8B5CF6]/40"
                    placeholder="Senha forte para o owner"
                  />
                </div>
              </div>
            ) : null}

            {currentStep.key === 'profile' ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-zinc-400">Setor</label>
                  <select
                    value={profile.sector}
                    onChange={(e) => updateProfile('sector', e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#8B5CF6]/40"
                  >
                    <option value="servicos">Servicos</option>
                    <option value="comercio">Comercio</option>
                    <option value="industria">Industria</option>
                    <option value="franquias">Franquias</option>
                    <option value="distribuicao">Distribuicao</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-zinc-400">Tamanho da equipe</label>
                  <select
                    value={profile.teamSize}
                    onChange={(e) => updateProfile('teamSize', e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#8B5CF6]/40"
                  >
                    <option value="1-10">1-10</option>
                    <option value="11-50">11-50</option>
                    <option value="51-200">51-200</option>
                    <option value="201+">201+</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-zinc-400">Modelo operacional</label>
                  <select
                    value={profile.operationModel}
                    onChange={(e) => updateProfile('operationModel', e.target.value as BusinessProfile['operationModel'])}
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#8B5CF6]/40"
                  >
                    <option value="produtos">Produtos</option>
                    <option value="servicos">Servicos</option>
                    <option value="hibrido">Hibrido</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-zinc-400">Possui estoque?</label>
                  <select
                    value={profile.hasInventory}
                    onChange={(e) => updateProfile('hasInventory', e.target.value as 'sim' | 'nao')}
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#8B5CF6]/40"
                  >
                    <option value="nao">Nao</option>
                    <option value="sim">Sim</option>
                  </select>
                </div>
              </div>
            ) : null}

            {currentStep.key === 'operations' ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-zinc-400">Como vende hoje?</label>
                  <select
                    value={profile.salesModel}
                    onChange={(e) => updateProfile('salesModel', e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#8B5CF6]/40"
                  >
                    <option value="consultivo">Consultivo</option>
                    <option value="inside-sales">Inside sales</option>
                    <option value="varejo">Varejo</option>
                    <option value="marketplace">Marketplace</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-zinc-400">Maturidade financeira</label>
                  <select
                    value={profile.financeMaturity}
                    onChange={(e) => updateProfile('financeMaturity', e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#8B5CF6]/40"
                  >
                    <option value="baixo">Baixa</option>
                    <option value="medio">Media</option>
                    <option value="alto">Alta</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-zinc-400">Opera com varias unidades?</label>
                  <select
                    value={profile.multiUnit}
                    onChange={(e) => updateProfile('multiUnit', e.target.value as 'sim' | 'nao')}
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#8B5CF6]/40"
                  >
                    <option value="nao">Nao</option>
                    <option value="sim">Sim</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm text-zinc-400">Objetivo principal</label>
                  <input
                    value={profile.mainGoal}
                    onChange={(e) => updateProfile('mainGoal', e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#8B5CF6]/40"
                    placeholder="Ex.: ganhar eficiencia operacional"
                  />
                </div>
              </div>
            ) : null}

            {currentStep.key === 'review' ? (
              <div className="space-y-5">
                <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                  <div className="text-sm font-medium text-white">Resumo inteligente</div>
                  <div className="mt-3 text-sm leading-7 text-zinc-400">
                    Empresa {profile.companyName || 'sem nome definido'} do setor {profile.sector}, com operacao {profile.operationModel}, equipe estimada em {profile.teamSize} e objetivo principal de {profile.mainGoal}.
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                    <div className="text-sm font-medium text-white">Modulos sugeridos</div>
                    <div className="mt-3 space-y-2 text-sm text-zinc-300">
                      {recommendations.modules.map((item) => (
                        <div key={item} className="rounded-2xl border border-white/10 bg-[#111113] px-4 py-3">
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                    <div className="text-sm font-medium text-white">Permissoes iniciais</div>
                    <div className="mt-3 space-y-2 text-sm text-zinc-300">
                      {recommendations.permissions.map((item) => (
                        <div key={item} className="rounded-2xl border border-white/10 bg-[#111113] px-4 py-3">
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                  <div className="text-sm font-medium text-white">Leituras da IA</div>
                  <div className="mt-3 space-y-2 text-sm text-zinc-300">
                    {recommendations.insights.map((item) => (
                      <div key={item} className="rounded-2xl border border-white/10 bg-[#111113] px-4 py-3">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            {error ? (
              <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            ) : null}

            {success ? (
              <div className="mt-5 rounded-2xl border border-[#8B5CF6]/20 bg-[#8B5CF6]/10 px-4 py-3 text-sm text-[#DDD6FE]">
                {success}
              </div>
            ) : null}

            <div className="mt-6 flex flex-wrap justify-between gap-3">
              <button
                type="button"
                onClick={goBack}
                disabled={stepIndex === 0}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-zinc-300 transition hover:bg-white/10 disabled:opacity-40"
              >
                Voltar
              </button>

              <div className="flex flex-wrap gap-3">
                {currentStep.key !== 'review' ? (
                  <button
                    type="button"
                    onClick={goNext}
                    className="rounded-2xl bg-[#8B5CF6] px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90"
                  >
                    Continuar
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleCreateCompany}
                    disabled={creating}
                    className="rounded-2xl bg-[#8B5CF6] px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90 disabled:opacity-60"
                  >
                    {creating ? 'Criando empresa...' : 'Criar empresa com onboarding'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="xl:col-span-4">
          <div className="rounded-[32px] border border-white/10 bg-[#111113] p-5 shadow-[0_0_60px_rgba(79,255,176,0.04)]">
            <div className="mb-4 text-sm font-medium text-white">
              O que esta versao entrega
            </div>

            <div className="space-y-3 text-sm text-zinc-300">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                Cria empresa, owner e unidade inicial usando o endpoint real do backend.
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                Coleta contexto operacional para a proxima fase do Business OS.
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                Gera recomendacoes iniciais de modulos, estrutura e permissoes.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
