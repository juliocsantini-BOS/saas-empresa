export const PERMISSIONS = [
  { key: "users.read", description: "Listar usuários" },
  { key: "users.create", description: "Criar usuários" },
  { key: "users.update", description: "Atualizar usuários" },
  { key: "users.disable", description: "Desativar usuários" },

  { key: "branches.read", description: "Listar branches" },
  { key: "branches.create", description: "Criar branches" },

  { key: "company.create", description: "Criar company" },
  { key: "company.read", description: "Ver company" },

  { key: "audit.read", description: "Ler audit logs" },
] as const;

export type PermissionKey = (typeof PERMISSIONS)[number]["key"];