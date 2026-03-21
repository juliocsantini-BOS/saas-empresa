'use client';

import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3000';

type Viewer = {
  id: string;
  role: string;
};

type PermissionItem = {
  id: string;
  key: string;
  description?: string | null;
  createdAt?: string;
};

export default function RbacPage() {
  const [viewer, setViewer] = useState<Viewer | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [permissions, setPermissions] = useState<PermissionItem[]>([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [rolePermissions, setRolePermissions] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingRolePerms, setLoadingRolePerms] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const isAdminMaster = viewer?.role === 'ADMIN_MASTER';
  const isAdmin = viewer?.role === 'ADMIN';
  const canManageRbac = isAdminMaster;
  const isProtectedRole = selectedRole === 'ADMIN_MASTER';

  async function loadBase() {
    const token = localStorage.getItem('access_token');

    if (!token) {
      setError('Token não encontrado.');
      setLoading(false);
      return;
    }

    try {
      const [meRes, rolesRes, permissionsRes] = await Promise.all([
        axios.get(API_URL + '/v1/auth/me', {
          headers: { Authorization: 'Bearer ' + token },
        }),
        axios.get(API_URL + '/v1/rbac/roles', {
          headers: { Authorization: 'Bearer ' + token },
        }),
        axios.get(API_URL + '/v1/rbac/permissions', {
          headers: { Authorization: 'Bearer ' + token },
        }),
      ]);

      const fetchedRoles = Array.isArray(rolesRes.data) ? rolesRes.data : [];
      const fetchedPermissions = Array.isArray(permissionsRes.data)
        ? permissionsRes.data
        : [];

      setViewer(meRes.data);
      setRoles(fetchedRoles);
      setPermissions(fetchedPermissions);
      setSelectedRole((prev) => prev || fetchedRoles[0] || '');
      setError('');
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Falha ao carregar RBAC.';
      setError(Array.isArray(msg) ? msg.join(', ') : String(msg));
    } finally {
      setLoading(false);
    }
  }

  async function loadRolePermissions(role: string) {
    const token = localStorage.getItem('access_token');
    if (!token || !role) return;

    try {
      setLoadingRolePerms(true);

      const res = await axios.get(API_URL + '/v1/rbac/roles/' + role + '/permissions', {
        headers: { Authorization: 'Bearer ' + token },
      });

      const data = Array.isArray(res.data) ? res.data : [];
      setRolePermissions(data);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Falha ao carregar permissões do role.';
      setError(Array.isArray(msg) ? msg.join(', ') : String(msg));
    } finally {
      setLoadingRolePerms(false);
    }
  }

  useEffect(() => {
    loadBase();
  }, []);

  useEffect(() => {
    if (selectedRole) {
      loadRolePermissions(selectedRole);
    }
  }, [selectedRole]);

  const filteredPermissions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return permissions;

    return permissions.filter((permission) => {
      return (
        String(permission.key ?? '').toLowerCase().includes(q) ||
        String(permission.description ?? '').toLowerCase().includes(q)
      );
    });
  }, [permissions, search]);

  function hasPermission(permKey: string) {
    return rolePermissions.includes(permKey);
  }

  async function togglePermission(permKey: string, enabled: boolean) {
    const token = localStorage.getItem('access_token');
    if (!token || !selectedRole) return;

    setSaving(true);
    setError('');

    try {
      if (enabled) {
        await axios.delete(
          API_URL + '/v1/rbac/roles/' + selectedRole + '/permissions/' + encodeURIComponent(permKey),
          {
            headers: { Authorization: 'Bearer ' + token },
          }
        );
      } else {
        await axios.post(
          API_URL + '/v1/rbac/roles/' + selectedRole + '/permissions',
          { permKey },
          {
            headers: { Authorization: 'Bearer ' + token },
          }
        );
      }

      await loadRolePermissions(selectedRole);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Falha ao atualizar permission.';
      setError(Array.isArray(msg) ? msg.join(', ') : String(msg));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      {loading ? (
        <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm text-zinc-300">
          Carregando RBAC...
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-4 text-sm text-red-300">
          {error}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
            <div className="rounded-3xl border border-white/10 bg-[#111113] p-5">
              <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Roles</div>
              <div className="mt-4 text-3xl font-semibold text-white">{roles.length}</div>
              <div className="mt-2 text-sm text-zinc-400">Perfis disponíveis no sistema</div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#111113] p-5">
              <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Permissions</div>
              <div className="mt-4 text-3xl font-semibold text-white">{permissions.length}</div>
              <div className="mt-2 text-sm text-zinc-400">Permissões cadastradas</div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#111113] p-5">
              <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Role selecionado</div>
              <div className="mt-4 text-3xl font-semibold text-[#8B5CF6]">
                {selectedRole || 'N/A'}
              </div>
              <div className="mt-2 text-sm text-zinc-400">Perfil visualizado no momento</div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#111113] p-5">
              <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Modo</div>
              <div className="mt-4 text-3xl font-semibold text-white">
                {isAdminMaster ? 'GLOBAL' : 'LEITURA'}
              </div>
              <div className="mt-2 text-sm text-zinc-400">
                {isAdminMaster
                  ? 'Você pode alterar permissões globais'
                  : isAdmin
                  ? 'Admin tenant visualiza o RBAC global'
                  : 'Visualização somente leitura'}
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-[#111113] p-5 shadow-[0_0_60px_rgba(139,92,246,0.05)]">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Arquitetura</div>
                <div className="mt-2 text-sm text-white">RBAC global por role</div>
                <div className="mt-2 text-xs text-zinc-500">
                  Alterações aqui impactam o comportamento padrão do sistema.
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">ADMIN_MASTER</div>
                <div className="mt-2 text-sm text-white">Pode editar</div>
                <div className="mt-2 text-xs text-zinc-500">
                  Responsável por permissões globais da plataforma.
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">ADMIN</div>
                <div className="mt-2 text-sm text-white">Somente leitura</div>
                <div className="mt-2 text-xs text-zinc-500">
                  O dono da empresa visualiza o global, mas não altera a base da plataforma.
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
            <div className="xl:col-span-4">
              <div className="rounded-[32px] border border-white/10 bg-[#111113] p-5 shadow-[0_0_60px_rgba(139,92,246,0.05)]">
                <div className="mb-5">
                  <div className="text-lg font-semibold text-white">Roles</div>
                  <div className="mt-1 text-sm text-zinc-500">
                    Selecione um perfil para visualizar as permissões
                  </div>
                </div>

                <div className="space-y-2">
                  {roles.map((role) => {
                    const active = selectedRole === role;

                    return (
                      <button
                        key={role}
                        onClick={() => setSelectedRole(role)}
                        className={
                          active
                            ? 'w-full rounded-2xl border border-[#8B5CF6]/20 bg-[#8B5CF6]/10 px-4 py-3 text-left text-sm font-medium text-white'
                            : 'w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-left text-sm text-zinc-300 transition hover:bg-white/5'
                        }
                      >
                        {role}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="xl:col-span-8">
              <div className="rounded-[32px] border border-white/10 bg-[#111113] p-5 shadow-[0_0_60px_rgba(139,92,246,0.05)]">
                <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="text-lg font-semibold text-white">
                      Permissions do role {selectedRole || 'N/A'}
                    </div>
                    <div className="mt-1 text-sm text-zinc-500">
                      Visualização centralizada das permissões por perfil
                    </div>
                  </div>

                  <div className="w-full md:w-[320px]">
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Buscar permission..."
                      className="w-full rounded-2xl border border-white/10 bg-[#0F1012] px-4 py-3 text-sm text-white outline-none transition focus:border-[#8B5CF6]/40"
                    />
                  </div>
                </div>

                {loadingRolePerms ? (
                  <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm text-zinc-300">
                    Carregando permissões do role...
                  </div>
                ) : filteredPermissions.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm text-zinc-300">
                    Nenhuma permission encontrada.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredPermissions.map((permission) => {
                      const enabled = hasPermission(permission.key);

                      return (
                        <div
                          key={permission.id}
                          className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-black/20 p-4 md:flex-row md:items-center md:justify-between"
                        >
                          <div>
                            <div className="text-sm font-medium text-white">
                              {permission.key}
                            </div>
                            <div className="mt-1 text-xs text-zinc-500">
                              {permission.description || 'Sem descrição'}
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span
                              className={
                                enabled
                                  ? 'rounded-full border border-[#8B5CF6]/20 bg-[#8B5CF6]/10 px-3 py-1 text-xs text-[#D8B4FE]'
                                  : 'rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1 text-xs text-zinc-300'
                              }
                            >
                              {enabled ? 'Ativa' : 'Inativa'}
                            </span>

                            {canManageRbac ? (
                              <button
                                onClick={() => togglePermission(permission.key, enabled)}
                                disabled={saving || isProtectedRole}
                                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                {enabled ? 'Remover' : 'Adicionar'}
                              </button>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {!isAdminMaster ? (
                  <div className="mt-5 rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-4 text-sm text-blue-200">
                    Esta tela está em modo de visualização. O RBAC global deve ser alterado somente pelo ADMIN_MASTER.
                  </div>
                ) : null}

                {isProtectedRole ? (
                  <div className="mt-5 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-4 text-sm text-yellow-200">
                    O role ADMIN_MASTER está protegido no frontend para evitar alteração acidental.
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
