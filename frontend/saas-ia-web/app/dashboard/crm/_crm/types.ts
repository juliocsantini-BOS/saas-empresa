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
export type BooleanFilter = 'ALL' | 'YES';

export type CrmSavedViewFilters = {
  searchTerm: string;
  statusFilter: 'ALL' | LeadStatus;
  temperatureFilter: TemperatureFilter;
  priorityFilter: 'ALL' | LeadPriority;
  sourceFilter: string;
  ownerFilter: string;
  departmentFilter: string;
  openTasksOnly: BooleanFilter;
  stalledOnly: BooleanFilter;
  overdueNextStepOnly: BooleanFilter;
  probabilityMin: string;
  probabilityMax: string;
  dealValueMin: string;
  dealValueMax: string;
  createdAtFrom: string;
  createdAtTo: string;
  expectedCloseDateFrom: string;
  expectedCloseDateTo: string;
};

export type CrmSavedView = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  filters: CrmSavedViewFilters;
};

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
  whatsapp?: string | null;
  email?: string | null;
  companyName?: string | null;
  jobTitle?: string | null;
  website?: string | null;
  city?: string | null;
  state?: string | null;
  industry?: string | null;
  companySize?: string | null;
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
  sourceDetail?: string | null;
  priority?: string | null;
  competitor?: string | null;
  wonReason?: string | null;
  nextStep?: string | null;
  nextStepDueAt?: string | null;
  nextMeetingAt?: string | null;
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
  tasks?: Array<{
    id: string;
  }>;
};

export type ExtendedLeadItem = LeadItem & {
  dealValue?: string | number | null;
  currency?: string | null;
  probability?: number | null;
  source?: string | null;
  sourceDetail?: string | null;
  priority?: string | null;
  competitor?: string | null;
  wonReason?: string | null;
  nextStep?: string | null;
  nextStepDueAt?: string | null;
  nextMeetingAt?: string | null;
  expectedCloseDate?: string | null;
  lastActivityAt?: string | null;
  lastContactAt?: string | null;
  wonAt?: string | null;
  lostAt?: string | null;
  lostReason?: string | null;
};

export type CreateLeadForm = {
  name: string;
  phone: string;
  whatsapp: string;
  email: string;
  companyName: string;
  jobTitle: string;
  website: string;
  city: string;
  state: string;
  industry: string;
  companySize: string;
  notes: string;
  dealValue: string;
  probability: string;
  source: string;
  sourceDetail: string;
  priority: string;
  competitor: string;
  wonReason: string;
  nextStep: string;
  nextMeetingAt: string;
  expectedCloseDate: string;
};

export type EditLeadForm = {
  name: string;
  phone: string;
  whatsapp: string;
  email: string;
  companyName: string;
  jobTitle: string;
  website: string;
  city: string;
  state: string;
  industry: string;
  companySize: string;
  notes: string;
  dealValue: string;
  probability: string;
  source: string;
  sourceDetail: string;
  priority: string;
  competitor: string;
  wonReason: string;
  nextStep: string;
  nextMeetingAt: string;
  expectedCloseDate: string;
};

export type CreateLeadTaskForm = {
  title: string;
  description: string;
  dueAt: string;
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
