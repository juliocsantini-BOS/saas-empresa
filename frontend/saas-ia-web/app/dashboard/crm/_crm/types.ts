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

export type SalesTargetPeriod =
  | 'DAILY'
  | 'WEEKLY'
  | 'MONTHLY'
  | 'QUARTERLY'
  | 'YEARLY'
  | 'MONTH'
  | 'QUARTER'
  | 'YEAR';

export type CrmSavedViewFilters = {
  searchTerm: string;
  statusFilter: 'ALL' | LeadStatus;
  temperatureFilter: TemperatureFilter;
  priorityFilter: 'ALL' | LeadPriority;
  sourceFilter: string;
  ownerFilter: string;
  branchFilter: string;
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
  page?: string;
  pageSize?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'expectedCloseDate' | 'lastActivityAt';
  sortOrder?: 'asc' | 'desc';
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
  accountId?: string | null;
  contactId?: string | null;
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
  forecastCategory?: 'PIPELINE' | 'BEST_CASE' | 'COMMIT' | 'CLOSED' | null;
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
  account?: {
    id: string;
    name: string;
  } | null;
  contact?: {
    id: string;
    fullName: string;
    email?: string | null;
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
  accountId: string;
  contactId: string;
  forecastCategory: string;
  dealValue: string;
  currency: string;
  probability: string;
  source: string;
  sourceDetail: string;
  priority: string;
  competitor: string;
  wonReason: string;
  lostReason: string;
  nextStep: string;
  nextStepDueAt: string;
  nextMeetingAt: string;
  expectedCloseDate: string;
  ownerUserId: string;
  branchId: string;
  departmentId: string;
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
  accountId: string;
  contactId: string;
  forecastCategory: string;
  dealValue: string;
  currency: string;
  probability: string;
  source: string;
  sourceDetail: string;
  priority: string;
  competitor: string;
  wonReason: string;
  lostReason: string;
  nextStep: string;
  nextStepDueAt: string;
  nextMeetingAt: string;
  expectedCloseDate: string;
  ownerUserId: string;
  branchId: string;
  departmentId: string;
};

export type CreateLeadTaskForm = {
  title: string;
  description: string;
  dueAt: string;
  assignedUserId?: string;
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

export type CrmAnalyticsResponse = {
  items: ExtendedLeadItem[];
  total: number;
};

export type PipelineStageSummary = {
  status: LeadStatus;
  count: number;
  value: number;
  forecast: number;
};

export type LeadGuidanceLevel = 'critical' | 'high' | 'medium' | 'low';

export type LeadGuidance = {
  score: number;
  level: LeadGuidanceLevel;
  title: string;
  reason: string;
  action: string;
  signal: string;
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

export type CrmSalesTarget = {
  id: string;
  createdAt: string;
  updatedAt: string;
  companyId: string;
  branchId?: string | null;
  departmentId?: string | null;
  userId?: string | null;
  periodType: SalesTargetPeriod;
  periodStart: string;
  periodEnd: string;
  targetValue?: string | number | null;
  targetDeals?: number | null;
  branch?: {
    id: string;
    name: string;
  } | null;
  department?: {
    id: string;
    name: string;
  } | null;
  user?: {
    id: string;
    name: string;
    email?: string | null;
  } | null;
};

export type CreateCrmSalesTargetInput = {
  branchId?: string;
  departmentId?: string;
  userId?: string;
  periodType: SalesTargetPeriod;
  periodStart: string;
  periodEnd: string;
  targetValue?: number;
  targetDeals?: number;
};

export type CrmPipelineStage = {
  id: string;
  name: string;
  order: number;
  color?: string | null;
  isActive: boolean;
  isSystemStage: boolean;
  statusBase: LeadStatus;
  createdAt?: string;
  updatedAt?: string;
};

export type CrmPipeline = {
  id: string;
  name: string;
  description?: string | null;
  isDefault: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  stages: CrmPipelineStage[];
};

export type CrmAccount = {
  id: string;
  name: string;
  legalName?: string | null;
  website?: string | null;
  industry?: string | null;
  companySize?: string | null;
  city?: string | null;
  state?: string | null;
  notes?: string | null;
  contacts?: CrmContact[];
};

export type CrmContact = {
  id: string;
  firstName: string;
  lastName?: string | null;
  fullName: string;
  email?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  jobTitle?: string | null;
  isPrimary?: boolean;
};

export type CrmMailbox = {
  id: string;
  provider: string;
  label: string;
  emailAddress: string;
  isActive: boolean;
  syncStatus: string;
  lastSyncAt?: string | null;
  errorMessage?: string | null;
};

export type CrmIntegrationCatalogItem = {
  provider: string;
  label: string;
  category: string;
  connectionMode: string;
  channelType: string;
  scopes: string[];
  defaultIdentifierPlaceholder: string;
  webhookSupported?: boolean;
  requiredEnv?: string[];
};

export type CrmChannelIntegration = {
  id: string;
  provider: string;
  category: string;
  connectionMode: string;
  status: string;
  label: string;
  channelIdentifier?: string | null;
  externalAccountId?: string | null;
  externalPageId?: string | null;
  externalBusinessId?: string | null;
  scopes: string[];
  authUrl?: string | null;
  callbackUrl?: string | null;
  webhookUrl?: string | null;
  webhookVerifyToken?: string | null;
  webhookSecret?: string | null;
  errorMessage?: string | null;
  lastSyncAt?: string | null;
  lastInboundAt?: string | null;
};

export type CrmOmnichannelMessage = {
  id: string;
  channelType: string;
  direction: string;
  status: string;
  body: string;
  senderName?: string | null;
  senderHandle?: string | null;
  recipientHandle?: string | null;
  sentAt?: string | null;
  receivedAt?: string | null;
  integration?: {
    id: string;
    provider: string;
    label: string;
  } | null;
};

export type CrmEmailTemplate = {
  id: string;
  name: string;
  subject: string;
  body: string;
  category?: string | null;
  isActive: boolean;
};

export type CrmSequence = {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  steps: CrmSequenceStep[];
};

export type CrmSequenceStep = {
  id: string;
  order: number;
  type: string;
  subject?: string | null;
  body?: string | null;
  taskTitle?: string | null;
  dueInDays: number;
};

export type CrmEmailMessage = {
  id: string;
  subject: string;
  body: string;
  direction: string;
  syncSource: string;
  fromEmail?: string | null;
  toEmail?: string | null;
  sentAt?: string | null;
  receivedAt?: string | null;
};

export type CrmQuote = {
  id: string;
  number: string;
  title: string;
  status: string;
  currency: string;
  subtotal?: string | number | null;
  discount?: string | number | null;
  total?: string | number | null;
  validUntil?: string | null;
};

export type CrmDocument = {
  id: string;
  title: string;
  type: string;
  signatureStatus: string;
  fileUrl?: string | null;
  provider?: string | null;
  sentAt?: string | null;
  openedAt?: string | null;
  signedAt?: string | null;
};

export type CrmRoutingRule = {
  id: string;
  name: string;
  isActive: boolean;
  priority: number;
  strategy: string;
  source?: string | null;
};

export type CrmConversationInsight = {
  id: string;
  sourceType: string;
  transcriptText?: string | null;
  summaryText?: string | null;
  coachingNotes?: string | null;
  sentimentScore?: number | null;
};

export type CrmForecastSnapshot = {
  id: string;
  label: string;
  periodStart: string;
  periodEnd: string;
  pipelineValue: string | number;
  bestCaseValue: string | number;
  commitValue: string | number;
  closedValue: string | number;
  gapToTarget?: string | number | null;
  notes?: string | null;
};
