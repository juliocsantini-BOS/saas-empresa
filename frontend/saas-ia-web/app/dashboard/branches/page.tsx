'use client';

import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3000';

type BranchItem = {
  id: string;
  name: string;
  companyId: string;
  createdAt?: string;
};

type AuthMe = {
  id: string;
  role: string;
};

export default function BranchesPage() {
  const [branches, setBranches] = useState<BranchItem[]>([]);
  const [viewer, setViewer] = useState<AuthMe | null>(null);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [formName, setFormName] = useState('');
  const [formError, setFormError] = useState('');

  const [selectedBranch, setSelectedBranch] = useState<BranchItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editError, setEditError] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const canCreateBranches =
    viewer?.role === 'ADMIN_MASTER' ||
    viewer?.role === 'ADMIN' ||
    viewer?.role === 'CEO';

  async function loadData() {
    const token = localStorage.getItem('access_token');

    if (!token) {
      setError('Token não encontrado.');
      setLoading(false);
      return;
    }

    try {
      const [meRes, branchesRes] = await Promise.all([
        axios.get(API_URL + '/v1/auth/me', {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        }),
        axios.get(API_URL + '/v1/branches', {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        }),
      ]);

      setViewer(meRes.data);
      setBranches(Array.isArray(branchesRes.data) ? branchesRes.data : []);
      setError('');
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Falha ao carregar filiais.';
      setError(Array.isArray(msg) ? msg.join(', ') : String(msg));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return branches;

    return branches.filter((branch) => {
      return (
        String(branch.name ?? '').toLowerCase().includes(q) ||
        String(branch.companyId ?? '').toLowerCase().includes(q)
      );
    });
  }, [branches, search]);

  function closeCreateModal() {
    setShowCreateModal(false);
    setFormName('');
    setFormError('');
  }

  function openEditModal(branch: BranchItem) {
    setSelectedBranch(branch);
    setEditName(branch.name);
    setEditError('');
    setShowEditModal(true);
  }

  function closeEditModal() {
    setShowEditModal(false);
    setSelectedBranch(null);
    setEditName('');
    setEditError('');
  }

  function openDeleteModal(branch: BranchItem) {
    setSelectedBranch(branch);
    setDeleteError('');
    setShowDeleteModal(true);
  }

  function closeDeleteModal() {
    setShowDeleteModal(false);
    setSelectedBranch(null);
    setDeleteError('');
  }

  async function refreshList() {
    setLoading(true);
    await loadData();
  }

  async function handleCreateBranch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const token = localStorage.getItem('access_token');
    if (!token) {
      setFormError('Token não encontrado.');
      return;
    }

    setCreating(true);
    setFormError('');

    try {
      await axios.post(
        API_URL + '/v1/branches',
        { name: formName },
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        }
      );

      closeCreateModal();
      await refreshList();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Falha ao criar filial.';
      setFormError(Array.isArray(msg) ? msg.join(', ') : String(msg));
    } finally {
      setCreating(false);
    }
  }

  async function handleEditBranch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!selectedBranch) return;

    const token = localStorage.getItem('access_token');
    if (!token) {
      setEditError('Token não encontrado.');
      return;
    }

    setEditing(true);
    setEditError('');

    try {
      await axios.patch(
        API_URL + '/v1/branches/' + selectedBranch.id,
        { name: editName },
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        }
      );

      closeEditModal();
      await refreshList();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Falha ao editar filial.';
      setEditError(Array.isArray(msg) ? msg.join(', ') : String(msg));
    } finally {
      setEditing(false);
    }
  }

  async function handleDeleteBranch() {
    if (!selectedBranch) return;

    const token = localStorage.getItem('access_token');
    if (!token) {
      setDeleteError('Token não encontrado.');
      return;
    }

    setDeleting(true);
    setDeleteError('');

    try {
      await axios.delete(API_URL + '/v1/branches/' + selectedBranch.id, {
        headers: {
          Authorization: 'Bearer ' + token,
        },
      });

      closeDeleteModal();
      await refreshList();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Falha ao excluir filial.';
      setDeleteError(Array.isArray(msg) ? msg.join(', ') : String(msg));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          {canCreateBranches ? (
            <button
              onClick={() => setShowCreateModal(true)}
              className="rounded-2xl bg-[#3BFF8C] px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90"
            >
              Criar filial
            </button>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-400">
              Apenas ADMIN, ADMIN_MASTER e CEO podem criar filiais
            </div>
          )}
        </div>

        <div className="w-full md:w-[320px]">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou companyId..."
            className="w-full rounded-2xl border border-white/10 bg-[#111113] px-4 py-3 text-sm text-white outline-none transition focus:border-[#3BFF8C]/40"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-[#111113] p-5">
          <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Total</div>
          <div className="mt-4 text-3xl font-semibold text-white">{branches.length}</div>
          <div className="mt-2 text-sm text-zinc-400">Filiais retornadas pela API</div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#111113] p-5">
          <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Filtro</div>
          <div className="mt-4 text-3xl font-semibold text-white">{filtered.length}</div>
          <div className="mt-2 text-sm text-zinc-400">Resultado da busca atual</div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#111113] p-5">
          <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Status</div>
          <div className="mt-4 text-3xl font-semibold text-[#3BFF8C]">OK</div>
          <div className="mt-2 text-sm text-zinc-400">Integração com backend ativa</div>
        </div>
      </div>

      <div className="rounded-[32px] border border-white/10 bg-[#111113] p-5 shadow-[0_0_60px_rgba(59,255,140,0.05)]">
        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm text-zinc-300">
            Carregando filiais...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-4 text-sm text-red-300">
            {error}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm text-zinc-300">
            Nenhuma filial encontrada.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-3">
              <thead>
                <tr className="text-left text-xs uppercase tracking-[0.18em] text-zinc-500">
                  <th className="px-4">Nome</th>
                  <th className="px-4">Company ID</th>
                  <th className="px-4">Criado em</th>
                  <th className="px-4">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((branch) => (
                  <tr
                    key={branch.id}
                    className="rounded-2xl border border-white/10 bg-black/20 text-sm text-zinc-300"
                  >
                    <td className="rounded-l-2xl px-4 py-4">
                      <div className="font-medium text-white">{branch.name}</div>
                      <div className="mt-1 break-all text-xs text-zinc-500">{branch.id}</div>
                    </td>
                    <td className="px-4 py-4 break-all text-xs text-zinc-400">{branch.companyId}</td>
                    <td className="px-4 py-4 text-xs text-zinc-400">
                      {branch.createdAt ? new Date(branch.createdAt).toLocaleString('pt-BR') : 'N/A'}
                    </td>
                    <td className="rounded-r-2xl px-4 py-4">
                      {canCreateBranches ? (
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => openEditModal(branch)}
                            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white transition hover:bg-white/10"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => openDeleteModal(branch)}
                            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white transition hover:bg-white/10"
                          >
                            Excluir
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-zinc-500">Sem acesso</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreateModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-xl rounded-[32px] border border-white/10 bg-[#111113] p-6 shadow-[0_0_80px_rgba(59,255,140,0.08)]">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-semibold text-white">Criar filial</h3>
                <p className="mt-1 text-sm text-zinc-500">
                  Adicione uma nova filial à empresa atual
                </p>
              </div>

              <button
                onClick={closeCreateModal}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/10"
              >
                Fechar
              </button>
            </div>

            <form onSubmit={handleCreateBranch} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm text-zinc-400">Nome da filial</label>
                <input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#3BFF8C]/40"
                  placeholder="Ex.: Matriz, Unidade Centro, Filial SP"
                  required
                />
              </div>

              {formError ? (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {formError}
                </div>
              ) : null}

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
                  disabled={creating}
                  className="rounded-2xl bg-[#3BFF8C] px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90 disabled:opacity-60"
                >
                  {creating ? 'Criando...' : 'Criar filial'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {showEditModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-xl rounded-[32px] border border-white/10 bg-[#111113] p-6 shadow-[0_0_80px_rgba(59,255,140,0.08)]">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-semibold text-white">Editar filial</h3>
                <p className="mt-1 text-sm text-zinc-500">{selectedBranch?.name}</p>
              </div>

              <button
                onClick={closeEditModal}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/10"
              >
                Fechar
              </button>
            </div>

            <form onSubmit={handleEditBranch} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm text-zinc-400">Novo nome</label>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#3BFF8C]/40"
                  placeholder="Novo nome da filial"
                  required
                />
              </div>

              {editError ? (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {editError}
                </div>
              ) : null}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-zinc-300 transition hover:bg-white/10"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={editing}
                  className="rounded-2xl bg-[#3BFF8C] px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90 disabled:opacity-60"
                >
                  {editing ? 'Salvando...' : 'Salvar alteração'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {showDeleteModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-xl rounded-[32px] border border-white/10 bg-[#111113] p-6 shadow-[0_0_80px_rgba(59,255,140,0.08)]">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-semibold text-white">Excluir filial</h3>
                <p className="mt-1 text-sm text-zinc-500">{selectedBranch?.name}</p>
              </div>

              <button
                onClick={closeDeleteModal}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/10"
              >
                Fechar
              </button>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm text-zinc-300">
                Esta ação tentará excluir a filial selecionada.
              </div>

              {deleteError ? (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {deleteError}
                </div>
              ) : null}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeDeleteModal}
                  className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-zinc-300 transition hover:bg-white/10"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleDeleteBranch}
                  disabled={deleting}
                  className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:opacity-60"
                >
                  {deleting ? 'Excluindo...' : 'Excluir filial'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
