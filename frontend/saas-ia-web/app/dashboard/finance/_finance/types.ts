export type FinanceViewer = {
  id: string;
  role: string;
  name?: string | null;
  companyId?: string | null;
  branchId?: string | null;
  departmentId?: string | null;
};

export type FinanceCompanyProfile = {
  id: string;
  name: string;
  sector?: string | null;
  teamSize?: string | null;
  operationModel?: string | null;
  hasInventory?: string | null;
  salesModel?: string | null;
  financeMaturity?: string | null;
  multiUnit?: string | null;
  mainGoal?: string | null;
  createdAt: string;
};

export type FinanceBranch = {
  id: string;
  name: string;
  companyId: string;
};

export type FinanceDepartment = {
  id: string;
  name: string;
  companyId: string;
  branchId: string;
};

export type FinanceUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  branchId?: string | null;
  departmentId?: string | null;
};

export type FinanceContextBundle = {
  viewer: FinanceViewer;
  company: FinanceCompanyProfile | null;
  branches: FinanceBranch[];
  departments: FinanceDepartment[];
  users: FinanceUser[];
};

export type FinanceOverview = {
  asOf: string;
  currency: string;
  cashBalance: number;
  projectedCash30d: number;
  inflows30d: number;
  outflows30d: number;
  overdueReceivables: number;
  payablesNext7d: number;
  approvalBacklog: number;
  grossMarginPct: number;
  automationRatePct: number;
  collectionsEfficiencyPct: number;
  closeReadinessPct: number;
  touchlessRatePct: number;
  runwayMonths: number;
  branchHealthScore: number;
};

export type FinanceAlertSeverity = 'critical' | 'warning' | 'info';

export type FinanceAlert = {
  id: string;
  severity: FinanceAlertSeverity;
  title: string;
  description: string;
  action: string;
};

export type FinanceTaskStatus = 'queue' | 'active' | 'done';

export type FinanceTaskKind =
  | 'approval'
  | 'collection'
  | 'reconciliation'
  | 'close'
  | 'cash';

export type FinanceTask = {
  id: string;
  kind: FinanceTaskKind;
  title: string;
  owner: string;
  dueLabel: string;
  amount?: number;
  status: FinanceTaskStatus;
};

export type FinanceBranchStatus = 'strong' | 'watch' | 'critical';

export type FinanceBranchSnapshot = {
  id: string;
  name: string;
  cashContribution: number;
  marginPct: number;
  receivablesRiskPct: number;
  approvalQueue: number;
  forecastDeltaPct: number;
  collectionsPct: number;
  status: FinanceBranchStatus;
};

export type FinanceWorkspaceStatus = 'ready' | 'active' | 'attention';

export type FinanceWorkspaceCard = {
  id: string;
  title: string;
  subtitle: string;
  primaryMetric: string;
  secondaryMetric: string;
  status: FinanceWorkspaceStatus;
};

export type FinanceExceptionInboxItem = {
  id: string;
  type: string;
  title: string;
  severity: FinanceAlertSeverity;
  owner: string;
  detail: string;
};

export type FinanceGuidedInvestigation = {
  id: string;
  title: string;
  summary: string;
  actionLabel: string;
  riskLevel: string;
};

export type FinanceSuggestedApproval = {
  id: string;
  title: string;
  amount: number;
  owner: string;
  rationale: string;
};

export type FinanceSuggestedNegotiation = {
  id: string;
  title: string;
  vendorId?: string | null;
  savingsPotential: number;
  status: string;
};

export type FinanceCollectionQueueItem = {
  id: string;
  status: string;
  reason: string;
  attempts: number;
};

export type FinancePlaybookSummary = {
  id: string;
  title: string;
  status: string;
  triggerType?: string | null;
};

export type FinanceAutopilotPanel = {
  exceptionInbox: FinanceExceptionInboxItem[];
  copilotRuns: number;
  openCases: number;
  rules: number;
  queuedActions: number;
  approvalGuardrails: number;
  collectionAutomations: number;
  cashRebalances: number;
  guidedInvestigations: FinanceGuidedInvestigation[];
  suggestedApprovals: FinanceSuggestedApproval[];
  suggestedNegotiations: FinanceSuggestedNegotiation[];
  collectionsQueue: FinanceCollectionQueueItem[];
  playbooks: FinancePlaybookSummary[];
};

export type FinanceRevenuePanel = {
  usageMeters: number;
  usageEvents: number;
  activePlans: number;
  draftInvoices: number;
  overdueInvoices: number;
  subledgerEntries: number;
  connectors: number;
  smartNotesCoverage: number;
  billingPlanVersions: number;
  customerCredits: number;
  rateCards: number;
  retryAttempts: number;
  dunningPolicies: number;
  lifecycleEvents: number;
  billingPortals: number;
  usageSnapshots: number;
  paymentSessions: number;
  creditApplications: number;
  retryPolicies: number;
};

export type FinanceEmployeeExperience = {
  travelPolicies: number;
  activeTrips: number;
  activeBookings: number;
  unsettledAdvances: number;
  expenseReports: number;
  pendingExpenseReports: number;
  corporateCards: number;
  assistantMoments: string[];
};

export type FinanceDataPlatform = {
  warehouseConnections: number;
  metricSnapshots: number;
  revenueCohorts: number;
  unitBenchmarks: number;
  scenarioCount: number;
  driverCount: number;
  workforcePlans: number;
  scenarioMerges: number;
  openVarianceExplanations: number;
  collaborationThreads: number;
  planningCycles: number;
  headcountLines: number;
  scenarioComparisons: number;
};

export type FinanceGlobalPanel = {
  globalEntities: number;
  countryPolicies: number;
  fxExposures: number;
  intercompanySettlements: number;
  taxRegistrations: number;
  pendingPayouts: number;
  pendingReimbursements: number;
  fxAutomationRuns: number;
  payoutBatches: number;
  settlementLines: number;
  taxRules: number;
  entityBalances: number;
};

export type FinanceCompliancePanel = {
  sso: number;
  scim: number;
  retentionPolicies: number;
  auditExports: number;
  segregationPolicies: number;
  highSeveritySod: number;
  pendingApprovalEvidences: number;
  complianceRuns: number;
  controlExceptions: number;
  sodEnforcements: number;
  evidencePacks: number;
  retentionExecutions: number;
  auditPackages: number;
};

export type FinanceProcurementIntelligence = {
  vendorDocsPending: number;
  procurementQueue: number;
  purchaseOrders: number;
  mismatchSignals: number;
  fraudSignals: number;
  overbillingWatch: number;
  openSignals: number;
  investigations: number;
  ocrLineItems: number;
  vendorScorecards: number;
  matchResults: number;
  fraudRuns: number;
  dynamicScores: number;
  negotiationOpportunities: number;
};

export type FinanceAiPriority = {
  id: string;
  label: string;
  title: string;
  description: string;
  impact: string;
};

export type FinanceInnovation = {
  id: string;
  title: string;
  description: string;
  maturity: string;
  outcome: string;
};

export type FinanceScenario = {
  id: string;
  title: string;
  description: string;
  cashDelta: number;
  marginDelta: number;
  backlogDelta: number;
  automationDelta: number;
};

export type FinanceScenarioOutcome = {
  projectedCash30d: number;
  grossMarginPct: number;
  approvalBacklog: number;
  automationRatePct: number;
  runwayMonths: number;
};

export type FinanceModuleData = {
  context: FinanceContextBundle;
  overview: FinanceOverview;
  branchSnapshots: FinanceBranchSnapshot[];
  workspaces: FinanceWorkspaceCard[];
  autopilot: FinanceAutopilotPanel;
  revenuePanel: FinanceRevenuePanel;
  employeeExperience: FinanceEmployeeExperience;
  dataPlatform: FinanceDataPlatform;
  globalPanel: FinanceGlobalPanel;
  compliancePanel: FinanceCompliancePanel;
  procurementIntelligence: FinanceProcurementIntelligence;
  alerts: FinanceAlert[];
  tasks: FinanceTask[];
  aiPriorities: FinanceAiPriority[];
  innovations: FinanceInnovation[];
  scenarios: FinanceScenario[];
};
