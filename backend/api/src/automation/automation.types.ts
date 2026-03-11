export type AutomationEventInput = {
  companyId: string;
  module: "CRM";
  triggerType:
    | "LEAD_CREATED"
    | "LEAD_STATUS_CHANGED"
    | "LEAD_STALE"
    | "TASK_CREATED"
    | "TASK_COMPLETED"
    | "TASK_DUE";
  payload: Record<string, any>;
};
