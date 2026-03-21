'use client';

import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3000';

type AutomationActionType =
  | 'CREATE_TASK'
  | 'CREATE_ACTIVITY'
  | 'UPDATE_LEAD_STATUS'
  | 'NOTIFY_INTERNAL';

type AutomationTriggerType =
  | 'LEAD_CREATED'
  | 'LEAD_STATUS_CHANGED'
  | 'LEAD_STALE'
  | 'TASK_CREATED'
  | 'TASK_COMPLETED'
  | 'TASK_DUE';

type AutomationRule = {
  id: string;
  name: string;
  description?: string | null;
  module: 'CRM';
  triggerType: AutomationTriggerType;
  isActive: boolean;
  conditionsJson?: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
  companyId: string;
  actions: Array<{
    id: string;
    type: AutomationActionType;
    order: number;
    configJson?: Record<string, any> | null;
  }>;
};

type AutomationExecution = {
  id: string;
  status: 'SUCCESS' | 'FAILED' | 'SKIPPED';
  triggerPayloadJson?: Record<string, any> | null;
  resultJson?: any;
  errorMessage?: string | null;
  createdAt: string;
  companyId: string;
  ruleId: string;
  rule?: {
    id: string;
    name: string;
    triggerType: AutomationTriggerType;
    module: 'CRM';
  };
};

const TRIGGER_LABELS: Record<AutomationTriggerType, string> = {
  LEAD_CREATED: 'Lead criado',
  LEAD_STATUS_CHANGED: 'Status do lead alterado',
  LEAD_STALE: 'Lead parado',
  TASK_CREATED: 'Tarefa criada',
  TASK_COMPLETED: 'Tarefa concluída',
  TASK_DUE: 'Tarefa vencendo/vencida',
};

const ACTION_LABELS: Record<AutomationActionType, string> = {
  CREATE_TASK: 'Criar tarefa',
  CREATE_ACTIVITY: 'Criar atividade',
  UPDATE_LEAD_STATUS: 'Atualizar status do lead',
  NOTIFY_INTERNAL: 'Notificação interna',
};

function getToken() {
  return localStorage.getItem('access_token');
}

function formatDateTime(value?: string | null) {
  if (!value) return 'Sem data';
  return new Date(value).toLocaleString('pt-BR');
}

export default function AutomationsPage() {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [executions, setExecutions] = useState<AutomationExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingRule, setCreatingRule] = useState(false);
  const [runningMaintenance, setRunningMaintenance] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState('');

  const [formName, setFormName] = useState('Follow-up automático após proposta');
  const [formDescription, setFormDescription] = useState('Cria tarefa e activity quando lead entra em proposta');
  const [formTriggerType, setFormTriggerType] = useState<AutomationTriggerType>('LEAD_STATUS_CHANGED');
  const [formToStatus, setFormToStatus] = useState('PROPOSAL');
  const [formTaskTitle, setFormTaskTitle] = useState('Fazer follow-up com {{leadName}}');
  const [formTaskDescription, setFormTaskDescription] = useState('Automação criou esta tarefa.');
  const [formTaskDueInDays, setFormTaskDueInDays] = useState('2');
  const [formCreateActivity, setFormCreateActivity] = useState(true);
  const [formActivityDescription, setFormActivityDescription] = useState('Automação executada para {{leadName}}.');

  async function loadData() {
    const token = getToken();

    if (!token) {
      setError('Token não encontrado.');
      setLoading(false);
      return;
    }

    try {
      const [rulesRes, executionsRes] = await Promise.all([
        axios.get(API_URL + '/v1/automation/rules', {
          headers: { Authorization: 'Bearer ' + token },
        }),
        axios.get(API_URL + '/v1/automation/executions', {
          headers: { Authorization: 'Bearer ' + token },
        }),
      ]);

      setRules(Array.isArray(rulesRes.data) ? rulesRes.data : []);
      setExecutions(Array.isArray(executionsRes.data) ? executionsRes.data : []);
      setError('');
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Falha ao carregar automações.';
      setError(Array.isArray(msg) ? msg.join(', ') : String(msg));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const stats = useMemo(() => {
    return {
      totalRules: rules.length,
      activeRules: rules.filter((rule) => rule.isActive).length,
      totalExecutions: executions.length,
      successExecutions: executions.filter((item) => item.status === 'SUCCESS').length,
      failedExecutions: executions.filter((item) => item.status === 'FAILED').length,
    };
  }, [rules, executions]);

  function closeCreateModal() {
    setShowCreateModal(false);
  }

  async function handleCreateRule(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const token = getToken();

    if (!token) {
      setError('Token não encontrado.');
      return;
    }

    setCreatingRule(true);
    setError('');

    try {
      const actions: any[] = [
        {
          type: 'CREATE_TASK',
          order: 0,
          configJson: {
            title: formTaskTitle,
            description: formTaskDescription,
            dueInDays: Number(formTaskDueInDays || '0'),
          },
        },
      ];

      if (formCreateActivity) {
        actions.push({
          type: 'CREATE_ACTIVITY',
          order: 1,
          configJson: {
            type: 'NOTE',
            description: formActivityDescription,
          },
        });
      }

      await axios.post(
        API_URL + '/v1/automation/rules',
        {
          name: formName,
          description: formDescription,
          module: 'CRM',
          triggerType: formTriggerType,
          isActive: true,
          conditionsJson:
            formTriggerType === 'LEAD_STATUS_CHANGED'
              ? { toStatus: formToStatus }
              : {},
          actions,
        },
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        }
      );

      closeCreateModal();
      setLoading(true);
      await loadData();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Falha ao criar regra.';
      setError(Array.isArray(msg) ? msg.join(', ') : String(msg));
    } finally {
      setCreatingRule(false);
    }
  }

  async function handleRunMaintenance() {
    const token = getToken();

    if (!token) {
      setError('Token não encontrado.');
      return;
    }

    setRunningMaintenance(true);
    setError('');

    try {
      await axios.post(
        API_URL + '/v1/automation/run/maintenance',
        {},
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        }
      );

      await loadData();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Falha ao rodar manutenção.';
      setError(Array.isArray(msg) ? msg.join(', ') : String(msg));
    } finally {
      setRunningMaintenance(false);
    }
  }

  function executionBadge(status: AutomationExecution['status']) {
    if (status === 'SUCCESS') {
      return 'rounded-full border border-[#8B5CF6]/20 bg-[#8B5CF6]/10 px-3 py-1 text-xs text-[#D8B4FE]';
    }

    if (status === 'FAILED') {
      return 'rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs text-red-300';
    }

    return 'rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-xs text-yellow-200';
  }

  if (loading) {
    return (
      <div className="rounded-[32px] border border-white/10 bg-[#111113] p-6 text-sm text-zinc-300">
        Carregando automações...
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
        <div className="rounded-3xl border border-white/10 bg-[#111113] p-5">
          <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">
            Regras
          </div>
          <div className="mt-4 text-3xl font-semibold text-white">
            {stats.totalRules}
          </div>
          <div className="mt-2 text-sm text-zinc-400">
            automações cadastradas
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#111113] p-5">
          <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">
            Ativas
          </div>
          <div className="mt-4 text-3xl font-semibold text-[#8B5CF6]">
            {stats.activeRules}
          </div>
          <div className="mt-2 text-sm text-zinc-400">
            regras ligadas
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#111113] p-5">
          <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">
            Execuções
          </div>
          <div className="mt-4 text-3xl font-semibold text-white">
            {stats.totalExecutions}
          </div>
          <div className="mt-2 text-sm text-zinc-400">
            histórico recente
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#111113] p-5">
          <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">
            Sucesso
          </div>
          <div className="mt-4 text-3xl font-semibold text-[#8B5CF6]">
            {stats.successExecutions}
          </div>
          <div className="mt-2 text-sm text-zinc-400">
            {stats.failedExecutions} falhas registradas
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-4 text-sm text-red-300">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <div className="rounded-[32px] border border-white/10 bg-[#111113] p-6">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-lg font-semibold text-white">
                  Regras de automação
                </div>
                <div className="mt-1 text-sm text-zinc-500">
                  Configure ações automáticas para CRM e operação
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleRunMaintenance}
                  disabled={runningMaintenance}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition hover:bg-white/10 disabled:opacity-60"
                >
                  {runningMaintenance ? 'Rodando...' : 'Rodar manutenção'}
                </button>

                <button
                  onClick={() => setShowCreateModal(true)}
                  className="rounded-2xl bg-[#8B5CF6] px-4 py-3 text-sm font-semibold text-black transition hover:opacity-90"
                >
                  Nova regra
                </button>
              </div>
            </div>

            {rules.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-black/20 p-5 text-sm text-zinc-400">
                Nenhuma regra cadastrada ainda.
              </div>
            ) : (
              <div className="space-y-4">
                {rules.map((rule) => (
                  <div
                    key={rule.id}
                    className="rounded-3xl border border-white/10 bg-black/20 p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-medium text-white">
                          {rule.name}
                        </div>
                        <div className="mt-1 text-sm text-zinc-500">
                          {rule.description || 'Sem descrição'}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white">
                          {TRIGGER_LABELS[rule.triggerType]}
                        </span>
                        <span
                          className={
                            rule.isActive
                              ? 'rounded-full border border-[#8B5CF6]/20 bg-[#8B5CF6]/10 px-3 py-1 text-xs text-[#D8B4FE]'
                              : 'rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300'
                          }
                        >
                          {rule.isActive ? 'Ativa' : 'Inativa'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="rounded-2xl border border-white/10 bg-[#111113] p-4">
                        <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                          Condições
                        </div>
                        <pre className="mt-3 whitespace-pre-wrap break-words text-xs text-zinc-300">
{JSON.stringify(rule.conditionsJson || {}, null, 2)}
                        </pre>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-[#111113] p-4">
                        <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                          Ações
                        </div>
                        <div className="mt-3 space-y-2">
                          {rule.actions.map((action) => (
                            <div
                              key={action.id}
                              className="rounded-2xl border border-white/10 bg-black/20 px-3 py-3 text-sm text-zinc-300"
                            >
                              <div className="font-medium text-white">
                                {action.order + 1}. {ACTION_LABELS[action.type]}
                              </div>
                              <pre className="mt-2 whitespace-pre-wrap break-words text-xs text-zinc-500">
{JSON.stringify(action.configJson || {}, null, 2)}
                              </pre>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 text-xs text-zinc-500">
                      Criada em {formatDateTime(rule.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-5 rounded-[32px] border border-white/10 bg-[#111113] p-6">
            <div className="mb-6">
              <div className="text-lg font-semibold text-white">
                Execuções recentes
              </div>
              <div className="mt-1 text-sm text-zinc-500">
                Histórico do motor de automação
              </div>
            </div>

            {executions.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-black/20 p-5 text-sm text-zinc-400">
                Nenhuma execução encontrada.
              </div>
            ) : (
              <div className="space-y-3">
                {executions.slice(0, 12).map((item) => (
                  <div
                    key={item.id}
                    className="rounded-3xl border border-white/10 bg-black/20 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={executionBadge(item.status)}>
                            {item.status}
                          </span>
                          <span className="text-sm font-medium text-white">
                            {item.rule?.name || 'Regra'}
                          </span>
                        </div>

                        <div className="mt-2 text-xs text-zinc-500">
                          {item.rule?.triggerType
                            ? TRIGGER_LABELS[item.rule.triggerType]
                            : 'Sem trigger'}
                        </div>

                        {item.errorMessage ? (
                          <div className="mt-2 text-sm text-red-300">
                            {item.errorMessage}
                          </div>
                        ) : null}
                      </div>

                      <div className="text-xs text-zinc-500">
                        {formatDateTime(item.createdAt)}
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                      <div className="rounded-2xl border border-white/10 bg-[#111113] p-3">
                        <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                          Payload
                        </div>
                        <pre className="mt-2 whitespace-pre-wrap break-words text-xs text-zinc-300">
{JSON.stringify(item.triggerPayloadJson || {}, null, 2)}
                        </pre>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-[#111113] p-3">
                        <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                          Resultado
                        </div>
                        <pre className="mt-2 whitespace-pre-wrap break-words text-xs text-zinc-300">
{JSON.stringify(item.resultJson || {}, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="xl:col-span-4">
          <div className="rounded-[32px] border border-white/10 bg-[#111113] p-5">
            <div className="mb-4 text-sm font-medium text-white">
              Inteligência operacional
            </div>

            <div className="space-y-3">
              <div className="rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.14),transparent_70%),rgba(255,255,255,0.02)] p-5">
                <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                  Automação enterprise
                </div>
                <div className="mt-3 text-sm leading-6 text-zinc-300">
                  Seu sistema já executa regras com trigger, ações encadeadas e log de execução.
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                  Melhor uso agora
                </div>
                <div className="mt-3 space-y-3 text-sm text-zinc-300">
                  <div>• criar follow-up automático ao entrar em proposta</div>
                  <div>• sinalizar lead parado</div>
                  <div>• gerar tarefa automática ao vencer prazo</div>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                  Próxima evolução
                </div>
                <div className="mt-3 space-y-3 text-sm text-zinc-300">
                  <div>• builder visual com blocos</div>
                  <div>• edição completa de regras</div>
                  <div>• IA sugerindo automações</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showCreateModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-3xl rounded-[32px] border border-white/10 bg-[#111113] p-6 shadow-[0_0_80px_rgba(139,92,246,0.08)]">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-semibold text-white">Nova regra</h3>
                <p className="mt-1 text-sm text-zinc-500">
                  Configure uma automação premium para o CRM
                </p>
              </div>

              <button
                onClick={closeCreateModal}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/10"
              >
                Fechar
              </button>
            </div>

            <form onSubmit={handleCreateRule} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-zinc-400">Nome da regra</label>
                  <input
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#8B5CF6]/40"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-zinc-400">Trigger</label>
                  <select
                    value={formTriggerType}
                    onChange={(e) => setFormTriggerType(e.target.value as AutomationTriggerType)}
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#8B5CF6]/40"
                  >
                    <option value="LEAD_STATUS_CHANGED">Status do lead alterado</option>
                    <option value="LEAD_CREATED">Lead criado</option>
                    <option value="LEAD_STALE">Lead parado</option>
                    <option value="TASK_CREATED">Tarefa criada</option>
                    <option value="TASK_COMPLETED">Tarefa concluída</option>
                    <option value="TASK_DUE">Tarefa vencendo/vencida</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm text-zinc-400">Descrição</label>
                  <input
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#8B5CF6]/40"
                  />
                </div>

                {formTriggerType === 'LEAD_STATUS_CHANGED' ? (
                  <div>
                    <label className="mb-2 block text-sm text-zinc-400">Status de destino</label>
                    <select
                      value={formToStatus}
                      onChange={(e) => setFormToStatus(e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#8B5CF6]/40"
                    >
                      <option value="NEW">NEW</option>
                      <option value="CONTACTED">CONTACTED</option>
                      <option value="PROPOSAL">PROPOSAL</option>
                      <option value="NEGOTIATION">NEGOTIATION</option>
                      <option value="WON">WON</option>
                      <option value="LOST">LOST</option>
                    </select>
                  </div>
                ) : null}

                <div>
                  <label className="mb-2 block text-sm text-zinc-400">Prazo da tarefa (dias)</label>
                  <input
                    value={formTaskDueInDays}
                    onChange={(e) => setFormTaskDueInDays(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#8B5CF6]/40"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm text-zinc-400">Título da tarefa</label>
                  <input
                    value={formTaskTitle}
                    onChange={(e) => setFormTaskTitle(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#8B5CF6]/40"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm text-zinc-400">Descrição da tarefa</label>
                  <textarea
                    value={formTaskDescription}
                    onChange={(e) => setFormTaskDescription(e.target.value)}
                    className="min-h-[100px] w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#8B5CF6]/40"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 flex items-center gap-3 text-sm text-zinc-400">
                    <input
                      type="checkbox"
                      checked={formCreateActivity}
                      onChange={(e) => setFormCreateActivity(e.target.checked)}
                    />
                    Criar activity automática também
                  </label>
                </div>

                {formCreateActivity ? (
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm text-zinc-400">Descrição da activity</label>
                    <textarea
                      value={formActivityDescription}
                      onChange={(e) => setFormActivityDescription(e.target.value)}
                      className="min-h-[100px] w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#8B5CF6]/40"
                    />
                  </div>
                ) : null}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-zinc-300 transition hover:bg-white/10"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={creatingRule}
                  className="rounded-2xl bg-[#8B5CF6] px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90 disabled:opacity-60"
                >
                  {creatingRule ? 'Criando...' : 'Criar regra'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
