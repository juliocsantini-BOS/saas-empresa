export const PERMISSIONS = [
  { key: "users.read", description: "Listar usuarios" },
  { key: "users.create", description: "Criar usuarios" },
  { key: "users.update", description: "Atualizar usuarios" },
  { key: "users.disable", description: "Desativar usuarios" },

  { key: "branches.read", description: "Listar branches" },
  { key: "branches.create", description: "Criar branches" },

  { key: "company.create", description: "Criar company" },
  { key: "company.read", description: "Ver company" },

  { key: "audit.read", description: "Ler audit logs" },
  { key: "crm.read.own", description: "Ver apenas os proprios leads do CRM" },
  { key: "crm.read.department", description: "Ver leads do proprio departamento no CRM" },
  { key: "crm.read.branch", description: "Ver leads da propria filial no CRM" },
  { key: "crm.read.company", description: "Ver todos os leads da empresa no CRM" },
  { key: "crm.values.read", description: "Ver valores e forecast do CRM" },
  { key: "crm.loss_reasons.read", description: "Ver motivos de perda do CRM" },
  { key: "crm.leads.edit", description: "Editar leads do CRM" },
  { key: "crm.leads.status", description: "Alterar status de leads do CRM" },
  { key: "crm.leads.close", description: "Marcar leads como ganhos ou perdidos" },
  { key: "crm.activities.create", description: "Criar atividades de leads no CRM" },
  { key: "crm.tasks.create", description: "Criar tarefas de leads no CRM" },
  { key: "crm.tasks.update", description: "Concluir ou reabrir tarefas de leads no CRM" },
  { key: "crm.bulk.update", description: "Executar acoes em lote no CRM" },
  { key: "crm.saved_views.create", description: "Criar visualizacoes salvas do CRM" },
  { key: "crm.saved_views.delete", description: "Excluir visualizacoes salvas do CRM" },
] as const;

export type PermissionKey = (typeof PERMISSIONS)[number]["key"];
