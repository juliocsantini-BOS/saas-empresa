'use client';

import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.elyonos.com.br';

type DepartmentItem = {
  id: string;
  name: string;
  companyId: string;
  branchId: string;
  createdAt?: string;
};

type BranchItem = {
  id: string;
  name: string;
};

type AuthMe = {
  id: string;
  role: string;
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

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
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
  const [formBranchId, setFormBranchId] = useState('');
  const [formError, setFormError] = useState('');

  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editError, setEditError] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const canManageDepartments =
    viewer?.role === 'ADMIN_MASTER' ||
    viewer?.role === 'ADMIN' ||
    viewer?.role === 'CEO';

  async function loadData() {
    const token = localStorage.getItem('access_token');

    if (!token) {
      setError('Token nao encontrado.');
      setLoading(false);
      return;
    }

    try {
      const [meRes, departmentsRes, branchesRes] = await Promise.all([
        axios.get(API_URL + '/v1/auth/me', {
          headers: { Authorization: 'Bearer ' + token },
        }),
        axios.get(API_URL + '/v1/departments', {
          headers: { Authorization: 'Bearer ' + token },
        }),
        axios.get(API_URL + '/v1/branches', {
          headers: { Authorization: 'Bearer ' + token },
        }),
      ]);

      setViewer(meRes.data);
      setDepartments(Array.isArray(departmentsRes.data) ? departmentsRes.data : []);
      setBranches(Array.isArray(branchesRes.data) ? branchesRes.data : []);
      setError('');
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Falha ao carregar departamentos.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const branchNameById = useMemo(() => {
    return new Map(branches.map((branch) => [branch.id, branch.name]));
  }, [branches]);

  const departmentCards = useMemo(() => {
    return departments.map((department) => ({
      ...department,
      branchName: branchNameById.get(department.branchId) || 'Filial nao encontrada',
    }));
  }, [branchNameById, departments]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return departmentCards;

    return departmentCards.filter((department) => {
      return (
        String(department.name ?? '').toLowerCase().includes(q) ||
        String(department.companyId ?? '').toLowerCase().includes(q) ||
        String(department.branchId ?? '').toLowerCase().includes(q) ||
        String(department.branchName ?? '').toLowerCase().includes(q)
      );
    });
  }, [departmentCards, search]);

  function closeCreateModal() {
    setShowCreateModal(false);
    setFormName('');
    setFormBranchId('');
    setFormError('');
  }

  function openEditModal(department: DepartmentItem) {
    setSelectedDepartment(department);
    setEditName(department.name);
    setEditError('');
    setShowEditModal(true);
  }

  function closeEditModal() {
    setShowEditModal(false);
    setSelectedDepartment(null);
    setEditName('');
    setEditError('');
  }

  function openDeleteModal(department: DepartmentItem) {
    setSelectedDepartment(department);
    setDeleteError('');
    setShowDeleteModal(true);
  }

  function closeDeleteModal() {
    setShowDeleteModal(false);
    setSelectedDepartment(null);
    setDeleteError('');
  }

  async function refreshList() {
    setLoading(true);
    await loadData();
  }

  async function handleCreateDepartment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const token = localStorage.getItem('access_token');
    if (!token) {
      setFormError('Token nao encontrado.');
      return;
    }

    setCreating(true);
    setFormError('');

    try {
      await axios.post(
        API_URL + '/v1/departments',
        {
          name: formName,
          branchId: formBranchId,
        },
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        }
      );

      closeCreateModal();
      await refreshList();
    } catch (err: unknown) {
      setFormError(getErrorMessage(err, 'Falha ao criar departamento.'));
    } finally {
      setCreating(false);
    }
  }

  async function handleEditDepartment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!selectedDepartment) return;

    const token = localStorage.getItem('access_token');
    if (!token) {
      setEditError('Token nao encontrado.');
      return;
    }

    setEditing(true);
    setEditError('');

    try {
      await axios.patch(
        API_URL + '/v1/departments/' + selectedDepartment.id,
        { name: editName },
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        }
      );

      closeEditModal();
      await refreshList();
    } catch (err: unknown) {
      setEditError(getErrorMessage(err, 'Falha ao editar departamento.'));
    } finally {
      setEditing(false);
    }
  }

  async function handleDeleteDepartment() {
    if (!selectedDepartment) return;

    const token = localStorage.getItem('access_token');
    if (!token) {
      setDeleteError('Token nao encontrado.');
      return;
    }

    setDeleting(true);
    setDeleteError('');

    try {
      await axios.delete(API_URL + '/v1/departments/' + selectedDepartment.id, {
        headers: {
          Authorization: 'Bearer ' + token,
        },
      });

      closeDeleteModal();
      await refreshList();
    } catch (err: unknown) {
      setDeleteError(getErrorMessage(err, 'Falha ao excluir departamento.'));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-[36px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.15),transparent_32%),#0B1118] p-6 shadow-[0_0_70px_rgba(139,92,246,0.06)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex rounded-full border border-[#8B5CF6]/20 bg-[#8B5CF6]/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-[#DDD6FE]">
              Organization map
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white">
              Departamentos traduzem a estrutura da empresa para dentro do sistema.
            </h2>
            <p className="mt-3 text-sm leading-7 text-zinc-400">
              Eles conectam pessoas, rotinas e responsabilidades por unidade. Quanto melhor essa camada estiver, mais forte fica o onboarding, o RBAC e a operacao dos modulos.
            </p>
          </div>

          <div>
            {canManageDepartments ? (
              <button
                onClick={() => setShowCreateModal(true)}
                className="rounded-2xl bg-[#8B5CF6] px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90"
              >
                Criar departamento
              </button>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-400">
                Apenas ADMIN, ADMIN_MASTER e CEO podem criar departamentos
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-[#111113] p-5">
            <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Total</div>
            <div className="mt-4 text-3xl font-semibold text-white">{departments.length}</div>
            <div className="mt-2 text-sm text-zinc-400">Departamentos retornados pela API</div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#111113] p-5">
            <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Filiais</div>
            <div className="mt-4 text-3xl font-semibold text-white">{branches.length}</div>
            <div className="mt-2 text-sm text-zinc-400">Unidades com contexto organizacional</div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#111113] p-5">
            <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Status</div>
            <div className="mt-4 text-3xl font-semibold text-[#8B5CF6]">OK</div>
            <div className="mt-2 text-sm text-zinc-400">Integracao com backend ativa</div>
          </div>
        </div>

        <div className="w-full md:w-[340px]">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, filial ou IDs..."
            className="w-full rounded-2xl border border-white/10 bg-[#111113] px-4 py-3 text-sm text-white outline-none transition focus:border-[#8B5CF6]/40"
          />
        </div>
      </div>

      <div className="rounded-[32px] border border-white/10 bg-[#111113] p-5 shadow-[0_0_60px_rgba(139,92,246,0.05)]">
        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm text-zinc-300">
            Carregando departamentos...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-4 text-sm text-red-300">
            {error}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm text-zinc-300">
            Nenhum departamento encontrado.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {filtered.map((department) => (
              <div
                key={department.id}
                className="rounded-3xl border border-white/10 bg-black/20 p-5"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="text-sm font-medium text-white">{department.name}</div>
                    <div className="mt-1 text-sm text-zinc-400">{department.branchName}</div>
                    <div className="mt-1 break-all text-xs text-zinc-500">{department.id}</div>
                  </div>

                  <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300">
                    {department.createdAt ? new Date(department.createdAt).toLocaleDateString('pt-BR') : 'Sem data'}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-[#111113] p-4">
                    <div className="text-xs text-zinc-500">Branch ID</div>
                    <div className="mt-2 truncate text-sm font-medium text-white">
                      {department.branchId}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-[#111113] p-4">
                    <div className="text-xs text-zinc-500">Company ID</div>
                    <div className="mt-2 truncate text-sm font-medium text-white">
                      {department.companyId}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {canManageDepartments ? (
                    <>
                      <button
                        onClick={() => openEditModal(department)}
                        className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white transition hover:bg-white/10"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => openDeleteModal(department)}
                        className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white transition hover:bg-white/10"
                      >
                        Excluir
                      </button>
                    </>
                  ) : (
                    <span className="text-xs text-zinc-500">Sem acesso de gestao</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreateModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-xl rounded-[32px] border border-white/10 bg-[#111113] p-6 shadow-[0_0_80px_rgba(139,92,246,0.08)]">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-semibold text-white">Criar departamento</h3>
                <p className="mt-1 text-sm text-zinc-500">
                  Adicione um novo departamento vinculado a uma filial
                </p>
              </div>

              <button
                onClick={closeCreateModal}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/10"
              >
                Fechar
              </button>
            </div>

            <form onSubmit={handleCreateDepartment} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm text-zinc-400">Nome do departamento</label>
                <input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#8B5CF6]/40"
                  placeholder="Ex.: Financeiro, Comercial, Operacoes"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-400">Filial</label>
                <select
                  value={formBranchId}
                  onChange={(e) => setFormBranchId(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#8B5CF6]/40"
                  required
                >
                  <option value="">Selecione uma filial</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
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
                  className="rounded-2xl bg-[#8B5CF6] px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90 disabled:opacity-60"
                >
                  {creating ? 'Criando...' : 'Criar departamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {showEditModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-xl rounded-[32px] border border-white/10 bg-[#111113] p-6 shadow-[0_0_80px_rgba(139,92,246,0.08)]">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-semibold text-white">Editar departamento</h3>
                <p className="mt-1 text-sm text-zinc-500">{selectedDepartment?.name}</p>
              </div>

              <button
                onClick={closeEditModal}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/10"
              >
                Fechar
              </button>
            </div>

            <form onSubmit={handleEditDepartment} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm text-zinc-400">Novo nome</label>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#8B5CF6]/40"
                  placeholder="Novo nome do departamento"
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
                  className="rounded-2xl bg-[#8B5CF6] px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90 disabled:opacity-60"
                >
                  {editing ? 'Salvando...' : 'Salvar alteracao'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {showDeleteModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-xl rounded-[32px] border border-white/10 bg-[#111113] p-6 shadow-[0_0_80px_rgba(139,92,246,0.08)]">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-semibold text-white">Excluir departamento</h3>
                <p className="mt-1 text-sm text-zinc-500">{selectedDepartment?.name}</p>
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
                Esta acao tentara excluir o departamento selecionado.
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
                  onClick={handleDeleteDepartment}
                  disabled={deleting}
                  className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:opacity-60"
                >
                  {deleting ? 'Excluindo...' : 'Excluir departamento'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
