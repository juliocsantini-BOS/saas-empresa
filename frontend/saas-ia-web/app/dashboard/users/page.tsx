'use client';

import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.elyonos.com.br';

type UserItem = {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  companyId?: string | null;
  branchId?: string | null;
  departmentId?: string | null;
  createdAt?: string;
};

type BranchItem = {
  id: string;
  name: string;
};

type DepartmentItem = {
  id: string;
  name: string;
  branchId: string;
};

type AuthMe = {
  id: string;
  role: string;
  companyId?: string | null;
  branchId?: string | null;
  departmentId?: string | null;
};

const ROLE_OPTIONS = [
  'ADMIN',
  'CEO',
  'CFO',
  'CMO',
  'SALES',
  'FINANCE',
  'SUPPORT',
  'USER',
];

export default function UsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [branches, setBranches] = useState<BranchItem[]>([]);
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [viewer, setViewer] = useState<AuthMe | null>(null);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [savingRole, setSavingRole] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);

  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState('USER');
  const [formBranchId, setFormBranchId] = useState('');
  const [formDepartmentId, setFormDepartmentId] = useState('');
  const [formError, setFormError] = useState('');

  const [roleValue, setRoleValue] = useState('USER');
  const [roleError, setRoleError] = useState('');

  const [statusValue, setStatusValue] = useState(true);
  const [statusError, setStatusError] = useState('');

  const [passwordValue, setPasswordValue] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const canCreateUsers =
    viewer?.role === 'ADMIN_MASTER' || viewer?.role === 'ADMIN';

  const canManageUsers =
    viewer?.role === 'ADMIN_MASTER' || viewer?.role === 'ADMIN';

  async function loadData() {
    const token = localStorage.getItem('access_token');

    if (!token) {
      setError('Token não encontrado.');
      setLoading(false);
      return;
    }

    try {
      const [meRes, usersRes, branchesRes, departmentsRes] = await Promise.all([
        axios.get(API_URL + '/v1/auth/me', {
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

      setViewer(meRes.data);
      setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
      setBranches(Array.isArray(branchesRes.data) ? branchesRes.data : []);
      setDepartments(Array.isArray(departmentsRes.data) ? departmentsRes.data : []);
      setError('');
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Falha ao carregar usuários.';
      setError(Array.isArray(msg) ? msg.join(', ') : String(msg));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return users;

    return users.filter((user) => {
      return (
        String(user.name ?? '').toLowerCase().includes(q) ||
        String(user.email ?? '').toLowerCase().includes(q) ||
        String(user.role ?? '').toLowerCase().includes(q)
      );
    });
  }, [users, search]);

  const filteredDepartments = useMemo(() => {
    if (!formBranchId) return departments;
    return departments.filter((department) => department.branchId === formBranchId);
  }, [departments, formBranchId]);

  function resetCreateForm() {
    setFormName('');
    setFormEmail('');
    setFormPassword('');
    setFormRole('USER');
    setFormBranchId('');
    setFormDepartmentId('');
    setFormError('');
  }

  function closeCreateModal() {
    setShowCreateModal(false);
    resetCreateForm();
  }

  function openCreateModal() {
    resetCreateForm();
    setShowCreateModal(true);
  }

  function closeRoleModal() {
    setShowRoleModal(false);
    setSelectedUser(null);
    setRoleValue('USER');
    setRoleError('');
  }

  function openRoleModal(user: UserItem) {
    setSelectedUser(user);
    setRoleValue(user.role);
    setRoleError('');
    setShowRoleModal(true);
  }

  function closeStatusModal() {
    setShowStatusModal(false);
    setSelectedUser(null);
    setStatusValue(true);
    setStatusError('');
  }

  function openStatusModal(user: UserItem) {
    setSelectedUser(user);
    setStatusValue(!user.isActive);
    setStatusError('');
    setShowStatusModal(true);
  }

  function closePasswordModal() {
    setShowPasswordModal(false);
    setSelectedUser(null);
    setPasswordValue('');
    setPasswordError('');
  }

  function openPasswordModal(user: UserItem) {
    setSelectedUser(user);
    setPasswordValue('');
    setPasswordError('');
    setShowPasswordModal(true);
  }

  async function refreshList() {
    setLoading(true);
    await loadData();
  }

  async function handleCreateUser(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const token = localStorage.getItem('access_token');
    if (!token) {
      setFormError('Token não encontrado.');
      return;
    }

    setCreating(true);
    setFormError('');

    try {
      const payload: Record<string, string> = {
        name: formName,
        email: formEmail,
        password: formPassword,
        role: formRole,
      };

      if (formBranchId) payload.branchId = formBranchId;
      if (formDepartmentId) payload.departmentId = formDepartmentId;

      await axios.post(API_URL + '/v1/users', payload, {
        headers: {
          Authorization: 'Bearer ' + token,
        },
      });

      closeCreateModal();
      await refreshList();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Falha ao criar usuário.';
      setFormError(Array.isArray(msg) ? msg.join(', ') : String(msg));
    } finally {
      setCreating(false);
    }
  }

  async function handleUpdateRole(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!selectedUser) return;

    const token = localStorage.getItem('access_token');
    if (!token) {
      setRoleError('Token não encontrado.');
      return;
    }

    setSavingRole(true);
    setRoleError('');

    try {
      await axios.patch(
        API_URL + '/v1/users/' + selectedUser.id + '/role',
        { role: roleValue },
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        }
      );

      closeRoleModal();
      await refreshList();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Falha ao atualizar role.';
      setRoleError(Array.isArray(msg) ? msg.join(', ') : String(msg));
    } finally {
      setSavingRole(false);
    }
  }

  async function handleUpdateStatus(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!selectedUser) return;

    const token = localStorage.getItem('access_token');
    if (!token) {
      setStatusError('Token não encontrado.');
      return;
    }

    setSavingStatus(true);
    setStatusError('');

    try {
      await axios.patch(
        API_URL + '/v1/users/' + selectedUser.id + '/status',
        { isActive: statusValue },
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        }
      );

      closeStatusModal();
      await refreshList();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Falha ao atualizar status.';
      setStatusError(Array.isArray(msg) ? msg.join(', ') : String(msg));
    } finally {
      setSavingStatus(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!selectedUser) return;

    const token = localStorage.getItem('access_token');
    if (!token) {
      setPasswordError('Token não encontrado.');
      return;
    }

    setSavingPassword(true);
    setPasswordError('');

    try {
      await axios.post(
        API_URL + '/v1/users/' + selectedUser.id + '/reset-password',
        { password: passwordValue },
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        }
      );

      closePasswordModal();
      await refreshList();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Falha ao resetar senha.';
      setPasswordError(Array.isArray(msg) ? msg.join(', ') : String(msg));
    } finally {
      setSavingPassword(false);
    }
  }

  function isSelf(user: UserItem) {
    return user.id === viewer?.id;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          {canCreateUsers ? (
            <button
              onClick={openCreateModal}
              className="rounded-2xl bg-[#8B5CF6] px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90"
            >
              Criar usuário
            </button>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-400">
              Apenas ADMIN e ADMIN_MASTER podem criar usuários
            </div>
          )}
        </div>

        <div className="w-full md:w-[320px]">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, e-mail ou role..."
            className="w-full rounded-2xl border border-white/10 bg-[#111113] px-4 py-3 text-sm text-white outline-none transition focus:border-[#8B5CF6]/40"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
        <div className="rounded-3xl border border-white/10 bg-[#111113] p-5">
          <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Total</div>
          <div className="mt-4 text-3xl font-semibold text-white">{users.length}</div>
          <div className="mt-2 text-sm text-zinc-400">Usuários retornados pela API</div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#111113] p-5">
          <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Ativos</div>
          <div className="mt-4 text-3xl font-semibold text-[#8B5CF6]">
            {users.filter((u) => u.isActive).length}
          </div>
          <div className="mt-2 text-sm text-zinc-400">Contas habilitadas</div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#111113] p-5">
          <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Inativos</div>
          <div className="mt-4 text-3xl font-semibold text-white">
            {users.filter((u) => !u.isActive).length}
          </div>
          <div className="mt-2 text-sm text-zinc-400">Contas desabilitadas</div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#111113] p-5">
          <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Filtro</div>
          <div className="mt-4 text-3xl font-semibold text-white">{filteredUsers.length}</div>
          <div className="mt-2 text-sm text-zinc-400">Resultado atual da busca</div>
        </div>
      </div>

      <div className="rounded-[32px] border border-white/10 bg-[#111113] p-5 shadow-[0_0_60px_rgba(139,92,246,0.05)]">
        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm text-zinc-300">
            Carregando usuários...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-4 text-sm text-red-300">
            {error}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm text-zinc-300">
            Nenhum usuário encontrado.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-3">
              <thead>
                <tr className="text-left text-xs uppercase tracking-[0.18em] text-zinc-500">
                  <th className="px-4">Nome</th>
                  <th className="px-4">E-mail</th>
                  <th className="px-4">Role</th>
                  <th className="px-4">Status</th>
                  <th className="px-4">Filial</th>
                  <th className="px-4">Departamento</th>
                  <th className="px-4">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="rounded-2xl border border-white/10 bg-black/20 text-sm text-zinc-300"
                  >
                    <td className="rounded-l-2xl px-4 py-4">
                      <div className="font-medium text-white">{user.name}</div>
                      <div className="mt-1 break-all text-xs text-zinc-500">{user.id}</div>
                    </td>

                    <td className="px-4 py-4">{user.email}</td>

                    <td className="px-4 py-4">
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white">
                        {user.role}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      {user.isActive ? (
                        <span className="rounded-full border border-[#8B5CF6]/20 bg-[#8B5CF6]/10 px-3 py-1 text-xs text-[#D8B4FE]">
                          Ativo
                        </span>
                      ) : (
                        <span className="rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1 text-xs text-zinc-300">
                          Inativo
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-4 text-xs text-zinc-400">{user.branchId || 'N/A'}</td>

                    <td className="px-4 py-4 text-xs text-zinc-400">
                      {user.departmentId || 'N/A'}
                    </td>

                    <td className="rounded-r-2xl px-4 py-4">
                      {canManageUsers ? (
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => openRoleModal(user)}
                            disabled={isSelf(user)}
                            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Role
                          </button>

                          <button
                            onClick={() => openStatusModal(user)}
                            disabled={isSelf(user) && user.isActive}
                            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {user.isActive ? 'Desativar' : 'Ativar'}
                          </button>

                          <button
                            onClick={() => openPasswordModal(user)}
                            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white transition hover:bg-white/10"
                          >
                            Senha
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
          <div className="w-full max-w-2xl rounded-[32px] border border-white/10 bg-[#111113] p-6 shadow-[0_0_80px_rgba(139,92,246,0.08)]">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-semibold text-white">Criar usuário</h3>
                <p className="mt-1 text-sm text-zinc-500">
                  Preencha os dados para adicionar um novo usuário
                </p>
              </div>

              <button
                onClick={closeCreateModal}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/10"
              >
                Fechar
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-zinc-400">Nome</label>
                  <input
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#8B5CF6]/40"
                    placeholder="Nome do usuário"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-zinc-400">E-mail</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#8B5CF6]/40"
                    placeholder="email@empresa.com"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-zinc-400">Senha</label>
                  <input
                    type="password"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#8B5CF6]/40"
                    placeholder="Senha forte"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-zinc-400">Role</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#8B5CF6]/40"
                  >
                    {ROLE_OPTIONS.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-zinc-400">Filial</label>
                  <select
                    value={formBranchId}
                    onChange={(e) => {
                      setFormBranchId(e.target.value);
                      setFormDepartmentId('');
                    }}
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#8B5CF6]/40"
                  >
                    <option value="">Sem filial</option>
                    {branches.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-zinc-400">Departamento</label>
                  <select
                    value={formDepartmentId}
                    onChange={(e) => setFormDepartmentId(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#8B5CF6]/40"
                  >
                    <option value="">Sem departamento</option>
                    {filteredDepartments.map((department) => (
                      <option key={department.id} value={department.id}>
                        {department.name}
                      </option>
                    ))}
                  </select>
                </div>
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
                  {creating ? 'Criando...' : 'Criar usuário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {showRoleModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-xl rounded-[32px] border border-white/10 bg-[#111113] p-6 shadow-[0_0_80px_rgba(139,92,246,0.08)]">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-semibold text-white">Alterar role</h3>
                <p className="mt-1 text-sm text-zinc-500">
                  {selectedUser?.name} • {selectedUser?.email}
                </p>
              </div>

              <button
                onClick={closeRoleModal}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/10"
              >
                Fechar
              </button>
            </div>

            <form onSubmit={handleUpdateRole} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm text-zinc-400">Nova role</label>
                <select
                  value={roleValue}
                  onChange={(e) => setRoleValue(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#8B5CF6]/40"
                >
                  {ROLE_OPTIONS.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              {roleError ? (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {roleError}
                </div>
              ) : null}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeRoleModal}
                  className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-zinc-300 transition hover:bg-white/10"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={savingRole}
                  className="rounded-2xl bg-[#8B5CF6] px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90 disabled:opacity-60"
                >
                  {savingRole ? 'Salvando...' : 'Salvar role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {showStatusModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-xl rounded-[32px] border border-white/10 bg-[#111113] p-6 shadow-[0_0_80px_rgba(139,92,246,0.08)]">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-semibold text-white">
                  {statusValue ? 'Ativar usuário' : 'Desativar usuário'}
                </h3>
                <p className="mt-1 text-sm text-zinc-500">
                  {selectedUser?.name} • {selectedUser?.email}
                </p>
              </div>

              <button
                onClick={closeStatusModal}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/10"
              >
                Fechar
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-zinc-300">
                {statusValue
                  ? 'Este usuário será ativado e poderá acessar o sistema novamente.'
                  : 'Este usuário será desativado e perderá acesso ao sistema.'}
              </div>

              {statusError ? (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {statusError}
                </div>
              ) : null}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeStatusModal}
                  className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-zinc-300 transition hover:bg-white/10"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={savingStatus}
                  className="rounded-2xl bg-[#8B5CF6] px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90 disabled:opacity-60"
                >
                  {savingStatus ? 'Salvando...' : statusValue ? 'Ativar' : 'Desativar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {showPasswordModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-xl rounded-[32px] border border-white/10 bg-[#111113] p-6 shadow-[0_0_80px_rgba(139,92,246,0.08)]">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-semibold text-white">Resetar senha</h3>
                <p className="mt-1 text-sm text-zinc-500">
                  {selectedUser?.name} • {selectedUser?.email}
                </p>
              </div>

              <button
                onClick={closePasswordModal}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/10"
              >
                Fechar
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm text-zinc-400">Nova senha</label>
                <input
                  type="password"
                  value={passwordValue}
                  onChange={(e) => setPasswordValue(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#8B5CF6]/40"
                  placeholder="Digite a nova senha"
                  required
                />
              </div>

              {passwordError ? (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {passwordError}
                </div>
              ) : null}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closePasswordModal}
                  className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-zinc-300 transition hover:bg-white/10"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={savingPassword}
                  className="rounded-2xl bg-[#8B5CF6] px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90 disabled:opacity-60"
                >
                  {savingPassword ? 'Salvando...' : 'Resetar senha'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
