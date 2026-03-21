'use client';

import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3000';

type AuditLogItem = {
  id: string;
  createdAt: string;
  requestId?: string | null;
  userId?: string | null;
  companyId?: string | null;
  method: string;
  path: string;
  statusCode: number;
  ip?: string | null;
  userAgent?: string | null;
  durationMs?: number;
  bodyJson?: any;
  queryJson?: any;
  paramsJson?: any;
};

type AuditResponse = {
  meta?: {
    total?: number;
    take?: number;
    skip?: number;
    order?: string;
    effectiveCompanyId?: string | null;
    includePayload?: boolean;
  };
  items?: AuditLogItem[];
};

function prettyJson(value: any) {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export default function Page() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);
  const [includePayload, setIncludePayload] = useState(false);

  async function loadAudit() {
    const token = localStorage.getItem('access_token');

    if (!token) {
      setError('Token não encontrado.');
      setLoading(false);
      return;
    }

    try {
      const url =
        API_URL +
        '/v1/audit-logs?take=50' +
        (includePayload ? '&includePayload=true' : '');

      const res = await axios.get<AuditResponse>(url, {
        headers: {
          Authorization: 'Bearer ' + token,
        },
      });

      const items = Array.isArray(res.data?.items) ? res.data.items : [];
      setLogs(items);
      setError('');
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Falha ao carregar auditoria.';
      setError(Array.isArray(msg) ? msg.join(', ') : String(msg));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setLoading(true);
    loadAudit();
  }, [includePayload]);

  const filteredLogs = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return logs;

    return logs.filter((log) => {
      return (
        String(log.method ?? '').toLowerCase().includes(q) ||
        String(log.path ?? '').toLowerCase().includes(q) ||
        String(log.requestId ?? '').toLowerCase().includes(q) ||
        String(log.userId ?? '').toLowerCase().includes(q) ||
        String(log.companyId ?? '').toLowerCase().includes(q) ||
        String(log.statusCode ?? '').toLowerCase().includes(q) ||
        String(log.ip ?? '').toLowerCase().includes(q)
      );
    });
  }, [logs, search]);

  const stats = useMemo(() => {
    return {
      total: logs.length,
      success: logs.filter((l) => l.statusCode >= 200 && l.statusCode < 300).length,
      clientError: logs.filter((l) => l.statusCode >= 400 && l.statusCode < 500).length,
      serverError: logs.filter((l) => l.statusCode >= 500).length,
    };
  }, [logs]);

  function statusBadge(statusCode: number) {
    if (statusCode >= 200 && statusCode < 300) {
      return 'rounded-full border border-[#8B5CF6]/20 bg-[#8B5CF6]/10 px-3 py-1 text-xs text-[#D8B4FE]';
    }

    if (statusCode >= 400 && statusCode < 500) {
      return 'rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-xs text-yellow-200';
    }

    if (statusCode >= 500) {
      return 'rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs text-red-300';
    }

    return 'rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white';
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl text-sm leading-6 text-zinc-400">
          Central de rastreabilidade, compliance e observabilidade das ações executadas no sistema.
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={includePayload}
              onChange={(e) => setIncludePayload(e.target.checked)}
            />
            Incluir payload
          </label>

          <button
            onClick={() => {
              setLoading(true);
              loadAudit();
            }}
            className="rounded-2xl bg-[#8B5CF6] px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90"
          >
            Atualizar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
          <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Total</div>
          <div className="mt-4 text-3xl font-semibold text-white">{stats.total}</div>
          <div className="mt-2 text-sm text-zinc-400">Logs carregados</div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
          <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">2xx</div>
          <div className="mt-4 text-3xl font-semibold text-[#8B5CF6]">{stats.success}</div>
          <div className="mt-2 text-sm text-zinc-400">Requisições bem-sucedidas</div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
          <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">4xx</div>
          <div className="mt-4 text-3xl font-semibold text-white">{stats.clientError}</div>
          <div className="mt-2 text-sm text-zinc-400">Erros de cliente / permissão</div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
          <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">5xx</div>
          <div className="mt-4 text-3xl font-semibold text-white">{stats.serverError}</div>
          <div className="mt-2 text-sm text-zinc-400">Falhas internas</div>
        </div>
      </div>

      <div className="rounded-[32px] border border-white/10 bg-[#111113] p-5 shadow-[0_0_60px_rgba(139,92,246,0.05)]">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-lg font-semibold text-white">Logs de auditoria</div>
            <div className="mt-1 text-sm text-zinc-500">
              Histórico das ações executadas na plataforma
            </div>
          </div>

          <div className="w-full md:w-[360px]">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por rota, método, userId, requestId..."
              className="w-full rounded-2xl border border-white/10 bg-[#0F1012] px-4 py-3 text-sm text-white outline-none transition focus:border-[#8B5CF6]/40"
            />
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm text-zinc-300">
            Carregando auditoria...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-4 text-sm text-red-300">
            {error}
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm text-zinc-300">
            Nenhum log encontrado.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-3">
              <thead>
                <tr className="text-left text-xs uppercase tracking-[0.18em] text-zinc-500">
                  <th className="px-4">Método</th>
                  <th className="px-4">Rota</th>
                  <th className="px-4">Status</th>
                  <th className="px-4">User ID</th>
                  <th className="px-4">Request ID</th>
                  <th className="px-4">Data</th>
                  <th className="px-4">Detalhes</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="rounded-2xl border border-white/10 bg-black/20 text-sm text-zinc-300"
                  >
                    <td className="px-4 py-4">
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white">
                        {log.method}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <div className="max-w-[280px] break-words text-white">{log.path}</div>
                    </td>

                    <td className="px-4 py-4">
                      <span className={statusBadge(log.statusCode)}>{log.statusCode}</span>
                    </td>

                    <td className="px-4 py-4 text-xs text-zinc-400">
                      <div className="max-w-[180px] break-all">{log.userId || 'N/A'}</div>
                    </td>

                    <td className="px-4 py-4 text-xs text-zinc-400">
                      <div className="max-w-[180px] break-all">{log.requestId || 'N/A'}</div>
                    </td>

                    <td className="px-4 py-4 text-xs text-zinc-400">
                      {log.createdAt ? new Date(log.createdAt).toLocaleString('pt-BR') : 'N/A'}
                    </td>

                    <td className="px-4 py-4">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white transition hover:bg-white/10"
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedLog ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[32px] border border-white/10 bg-[#111113] p-6 shadow-[0_0_80px_rgba(139,92,246,0.08)]">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-semibold text-white">Detalhe do log</h3>
                <p className="mt-1 text-sm text-zinc-500">
                  {selectedLog.method} • {selectedLog.path}
                </p>
              </div>

              <button
                onClick={() => setSelectedLog(null)}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/10"
              >
                Fechar
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Request ID</div>
                <div className="mt-3 break-all text-sm text-white">{selectedLog.requestId || 'N/A'}</div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">User ID</div>
                <div className="mt-3 break-all text-sm text-white">{selectedLog.userId || 'N/A'}</div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Company ID</div>
                <div className="mt-3 break-all text-sm text-white">{selectedLog.companyId || 'N/A'}</div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">IP</div>
                <div className="mt-3 break-all text-sm text-white">{selectedLog.ip || 'N/A'}</div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Status</div>
                <div className="mt-3 text-sm text-white">{selectedLog.statusCode}</div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Duração</div>
                <div className="mt-3 text-sm text-white">
                  {typeof selectedLog.durationMs === 'number' ? selectedLog.durationMs + ' ms' : 'N/A'}
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
                <div className="mb-3 text-xs uppercase tracking-[0.18em] text-zinc-500">User Agent</div>
                <pre className="whitespace-pre-wrap break-words text-xs text-zinc-300">
                  {selectedLog.userAgent || 'N/A'}
                </pre>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
                <div className="mb-3 text-xs uppercase tracking-[0.18em] text-zinc-500">Body JSON</div>
                <pre className="overflow-x-auto whitespace-pre-wrap break-words text-xs text-zinc-300">
                  {selectedLog.bodyJson ? prettyJson(selectedLog.bodyJson) : 'N/A'}
                </pre>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
                <div className="mb-3 text-xs uppercase tracking-[0.18em] text-zinc-500">Query JSON</div>
                <pre className="overflow-x-auto whitespace-pre-wrap break-words text-xs text-zinc-300">
                  {selectedLog.queryJson ? prettyJson(selectedLog.queryJson) : 'N/A'}
                </pre>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
                <div className="mb-3 text-xs uppercase tracking-[0.18em] text-zinc-500">Params JSON</div>
                <pre className="overflow-x-auto whitespace-pre-wrap break-words text-xs text-zinc-300">
                  {selectedLog.paramsJson ? prettyJson(selectedLog.paramsJson) : 'N/A'}
                </pre>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
