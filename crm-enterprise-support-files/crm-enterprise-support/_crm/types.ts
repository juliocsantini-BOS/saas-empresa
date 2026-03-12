export type LeadStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'PROPOSAL'
  | 'NEGOTIATION'
  | 'WON'
  | 'LOST';

export type TemperatureFilter = 'ALL' | 'HOT' | 'WARM' | 'COLD';
export type ActivityComposerType = 'NOTE' | 'CALL' | 'MESSAGE' | 'MEETING';
export type LeadPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type UserOption = {
  id: string;
  name: string;
  email?: string | null;
  role?: string;
};

export type BranchOption = {
  id: string;
  name: string;
};

export type DepartmentOption = {
  id: string;
  name: string;
  branchId?: string | null;
};

export type LeadItem = {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  companyName?: string | null;
  notes?: string | null;
  status: LeadStatus;
  companyId: string;
  ownerUserId?: string | null;
  branchId?: string | null;
  departmentId?: string | null;
  dealValue?: string | number | null;
  currency?: string | null;
  probability?: number | null;
  source?: string | null;
  priority?: string | null;
  nextStep?: string | null;
  nextStepDueAt?: string | null;
  expectedCloseDate?: string | null;
  statusChangedAt?: string | null;
  lastActivityAt?: string | null;
  lastContactAt?: string | null;
  wonAt?: string | null;
  lostAt?: string | null;
  lostReason?: string | null;
  ownerUser?: {
    id: string;
    name: string;
    email?: string | null;
  } | null;
  branch?: {
    id: string;
    name: string;
  } | null;
  department?: {
    id: string;
    name: string;
  } | null;
};

export type PipelineResponse = Record<LeadStatus, LeadItem[]>;

export type LeadActivity = {
  id: string;
  createdAt: string;
  type: string;
  description: string;
  user?: {
    id: string;
    name: string;
    email?: string | null;
  } | null;
};

export type LeadTask = {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  description?: string | null;
  dueAt?: string | null;
  completedAt?: string | null;
  assignedUserId?: string | null;
  assignedUser?: {
    id: string;
    name: string;
    email?: string | null;
  } | null;
};

export type PipelineStageSummary = {
  status: LeadStatus;
  count: number;
  value: number;
  forecast: number;
};

export type CrmStats = {
  total: number;
  pipeline: number;
  open: number;
  won: number;
  lost: number;
  contacted: number;
  proposal: number;
  conversionRate: number;
  newThisMonth: number;
  hotLeads: number;
  stalledLeads: number;
  pipelineValue?: number;
  forecastValue?: number;
  averageProbability?: number;
};
