import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { Role } from "@prisma/client";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { RequirePermissions } from "../common/decorators/require-permissions.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { RolesGuard } from "../common/guards/roles.guard";
import { TenantGuard } from "../common/guards/tenant.guard";
import { FinanceService } from "./finance.service";

@Controller("v1/finance")
@UseGuards(TenantGuard, RolesGuard)
export class FinanceController {
  constructor(private readonly service: FinanceService) {}

  @Get("module")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.read")
  getModule(@CurrentUser() user: any) {
    return this.service.getModule(user);
  }

  @Get("accounts")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.accounts.read")
  listAccounts(@CurrentUser() user: any) {
    return this.service.listAccounts(user);
  }

  @Post("accounts")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.accounts.write")
  createAccount(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createAccount(user, body);
  }

  @Get("bank-accounts")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.bank_accounts.read")
  listBankAccounts(@CurrentUser() user: any) {
    return this.service.listBankAccounts(user);
  }

  @Post("bank-accounts")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.bank_accounts.write")
  createBankAccount(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createBankAccount(user, body);
  }

  @Get("cost-centers")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.cost_centers.read")
  listCostCenters(@CurrentUser() user: any) {
    return this.service.listCostCenters(user);
  }

  @Post("cost-centers")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.cost_centers.write")
  createCostCenter(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createCostCenter(user, body);
  }

  @Get("categories")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.categories.read")
  listCategories(@CurrentUser() user: any) {
    return this.service.listCategories(user);
  }

  @Post("categories")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.categories.write")
  createCategory(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createCategory(user, body);
  }

  @Get("payables")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.payables.read")
  listPayables(@CurrentUser() user: any) {
    return this.service.listPayables(user);
  }

  @Post("payables")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.payables.write")
  createPayable(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createPayable(user, body);
  }

  @Patch("payables/:payableId/pay")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.payables.pay")
  payPayable(@CurrentUser() user: any, @Param("payableId") payableId: string, @Body() body: any) {
    return this.service.payPayable(user, payableId, body);
  }

  @Post("payables/batch-pay")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.payables.batch")
  batchPay(@CurrentUser() user: any, @Body() body: any) {
    return this.service.batchPay(user, body);
  }

  @Get("receivables")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.receivables.read")
  listReceivables(@CurrentUser() user: any) {
    return this.service.listReceivables(user);
  }

  @Post("receivables")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.receivables.write")
  createReceivable(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createReceivable(user, body);
  }

  @Patch("receivables/:receivableId/collect")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.receivables.collect")
  collectReceivable(@CurrentUser() user: any, @Param("receivableId") receivableId: string, @Body() body: any) {
    return this.service.collectReceivable(user, receivableId, body);
  }

  @Post("receivables/:receivableId/reminders")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.receivables.remind")
  sendReminder(@CurrentUser() user: any, @Param("receivableId") receivableId: string, @Body() body: any) {
    return this.service.sendReceivableReminder(user, receivableId, body);
  }

  @Get("transactions")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.transactions.read")
  listTransactions(@CurrentUser() user: any) {
    return this.service.listTransactions(user);
  }

  @Post("transactions")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.transactions.write")
  createTransaction(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createTransaction(user, body);
  }

  @Get("statement-imports")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.reconciliation.read")
  listStatementImports(@CurrentUser() user: any) {
    return this.service.listStatementImports(user);
  }

  @Post("statement-imports")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.reconciliation.write")
  createStatementImport(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createStatementImport(user, body);
  }

  @Post("reconciliation/matches")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.reconciliation.write")
  reconcile(@CurrentUser() user: any, @Body() body: any) {
    return this.service.reconcile(user, body);
  }

  @Post("pix/confirmations")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.receivables.collect", "finance.reconciliation.write")
  confirmPix(@CurrentUser() user: any, @Body() body: any) {
    return this.service.confirmPix(user, body);
  }

  @Get("approval-policies")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.approvals.read")
  listApprovalPolicies(@CurrentUser() user: any) {
    return this.service.listApprovalPolicies(user);
  }

  @Post("approval-policies")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.approvals.write")
  createApprovalPolicy(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createApprovalPolicy(user, body);
  }

  @Get("approval-requests")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.approvals.read")
  listApprovalRequests(@CurrentUser() user: any) {
    return this.service.listApprovalRequests(user);
  }

  @Post("approval-requests")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.approvals.write")
  createApprovalRequest(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createApprovalRequest(user, body);
  }

  @Patch("approval-requests/:requestId/decision")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.approvals.decide")
  decideApprovalRequest(@CurrentUser() user: any, @Param("requestId") requestId: string, @Body() body: any) {
    return this.service.decideApprovalRequest(user, requestId, body);
  }

  @Get("close-periods")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.close.read")
  listClosePeriods(@CurrentUser() user: any) {
    return this.service.listClosePeriods(user);
  }

  @Post("close-periods")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.close.write")
  createClosePeriod(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createClosePeriod(user, body);
  }

  @Get("budgets")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.budgets.read")
  listBudgetPlans(@CurrentUser() user: any) {
    return this.service.listBudgetPlans(user);
  }

  @Post("budgets")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.budgets.write")
  createBudgetPlan(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createBudgetPlan(user, body);
  }

  @Get("forecasts")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.budgets.read")
  listForecastSnapshots(@CurrentUser() user: any) {
    return this.service.listForecastSnapshots(user);
  }

  @Post("forecasts")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.budgets.write")
  createForecastSnapshot(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createForecastSnapshot(user, body);
  }

  @Get("vendors")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.read")
  listVendors(@CurrentUser() user: any) {
    return this.service.listVendors(user);
  }

  @Post("vendors")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  createVendor(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createVendor(user, body);
  }

  @Get("vendor-documents")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.read")
  listVendorDocuments(@CurrentUser() user: any) {
    return this.service.listVendorDocuments(user);
  }

  @Post("vendor-documents")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  createVendorDocument(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createVendorDocument(user, body);
  }

  @Patch("vendor-documents/:documentId/review")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  reviewVendorDocument(@CurrentUser() user: any, @Param("documentId") documentId: string, @Body() body: any) {
    return this.service.reviewVendorDocument(user, documentId, body);
  }

  @Get("procurement-requests")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.read")
  listProcurementRequests(@CurrentUser() user: any) {
    return this.service.listProcurementRequests(user);
  }

  @Post("procurement-requests")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  createProcurementRequest(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createProcurementRequest(user, body);
  }

  @Patch("procurement-requests/:requestId/submit")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  submitProcurementRequest(@CurrentUser() user: any, @Param("requestId") requestId: string) {
    return this.service.submitProcurementRequest(user, requestId);
  }

  @Patch("procurement-requests/:requestId/approve")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.approve")
  approveProcurementRequest(@CurrentUser() user: any, @Param("requestId") requestId: string) {
    return this.service.approveProcurementRequest(user, requestId);
  }

  @Patch("procurement-requests/:requestId/reject")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.approve")
  rejectProcurementRequest(@CurrentUser() user: any, @Param("requestId") requestId: string, @Body() body: any) {
    return this.service.rejectProcurementRequest(user, requestId, body);
  }

  @Post("procurement-requests/:requestId/create-po")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write", "finance.approve")
  createPurchaseOrderFromRequest(@CurrentUser() user: any, @Param("requestId") requestId: string, @Body() body: any) {
    return this.service.createPurchaseOrderFromRequest(user, requestId, body);
  }

  @Get("purchase-orders")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.read")
  listPurchaseOrders(@CurrentUser() user: any) {
    return this.service.listPurchaseOrders(user);
  }

  @Post("purchase-orders")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  createPurchaseOrder(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createPurchaseOrder(user, body);
  }

  @Patch("purchase-orders/:purchaseOrderId/issue")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write", "finance.approve")
  issuePurchaseOrder(@CurrentUser() user: any, @Param("purchaseOrderId") purchaseOrderId: string) {
    return this.service.issuePurchaseOrder(user, purchaseOrderId);
  }

  @Post("purchase-orders/:purchaseOrderId/receipts")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  createGoodsReceipt(@CurrentUser() user: any, @Param("purchaseOrderId") purchaseOrderId: string, @Body() body: any) {
    return this.service.createGoodsReceipt(user, purchaseOrderId, body);
  }

  @Post("purchase-orders/:purchaseOrderId/three-way-match")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  createThreeWayMatch(@CurrentUser() user: any, @Param("purchaseOrderId") purchaseOrderId: string, @Body() body: any) {
    return this.service.createThreeWayMatch(user, purchaseOrderId, body);
  }

  @Get("expense-reports")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.read")
  listExpenseReports(@CurrentUser() user: any) {
    return this.service.listExpenseReports(user);
  }

  @Post("expense-reports")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  createExpenseReport(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createExpenseReport(user, body);
  }

  @Post("expense-reports/:reportId/items")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  addExpenseItem(@CurrentUser() user: any, @Param("reportId") reportId: string, @Body() body: any) {
    return this.service.addExpenseItem(user, reportId, body);
  }

  @Patch("expense-reports/:reportId/submit")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  submitExpenseReport(@CurrentUser() user: any, @Param("reportId") reportId: string) {
    return this.service.submitExpenseReport(user, reportId);
  }

  @Patch("expense-reports/:reportId/approve")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.approve")
  approveExpenseReport(@CurrentUser() user: any, @Param("reportId") reportId: string) {
    return this.service.approveExpenseReport(user, reportId);
  }

  @Patch("expense-reports/:reportId/reimburse")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write", "finance.approve")
  reimburseExpenseReport(@CurrentUser() user: any, @Param("reportId") reportId: string, @Body() body: any) {
    return this.service.reimburseExpenseReport(user, reportId, body);
  }

  @Get("corporate-cards")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.read")
  listCorporateCards(@CurrentUser() user: any) {
    return this.service.listCorporateCards(user);
  }

  @Post("corporate-cards")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  createCorporateCard(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createCorporateCard(user, body);
  }

  @Get("card-transactions")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.read")
  listCardTransactions(@CurrentUser() user: any) {
    return this.service.listCardTransactions(user);
  }

  @Post("card-transactions")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  createCardTransaction(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createCardTransaction(user, body);
  }

  @Get("erp-connections")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.read")
  listErpConnections(@CurrentUser() user: any) {
    return this.service.listErpConnections(user);
  }

  @Post("erp-connections")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  createErpConnection(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createErpConnection(user, body);
  }

  @Post("erp-connections/:connectionId/sync")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  runErpSync(@CurrentUser() user: any, @Param("connectionId") connectionId: string, @Body() body: any) {
    return this.service.runErpSync(user, connectionId, body);
  }

  @Get("treasury-transfers")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.read")
  listTreasuryTransfers(@CurrentUser() user: any) {
    return this.service.listTreasuryTransfers(user);
  }

  @Post("treasury-transfers")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  createTreasuryTransfer(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createTreasuryTransfer(user, body);
  }

  @Patch("treasury-transfers/:transferId/settle")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write", "finance.approve")
  settleTreasuryTransfer(@CurrentUser() user: any, @Param("transferId") transferId: string, @Body() body: any) {
    return this.service.settleTreasuryTransfer(user, transferId, body);
  }

  @Get("treasury-allocations")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.read")
  listTreasuryAllocations(@CurrentUser() user: any) {
    return this.service.listTreasuryAllocations(user);
  }

  @Post("treasury-allocations")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  createTreasuryAllocation(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createTreasuryAllocation(user, body);
  }

  @Get("cash-position-snapshots")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.read")
  listCashPositionSnapshots(@CurrentUser() user: any) {
    return this.service.listCashPositionSnapshots(user);
  }

  @Post("cash-position-snapshots")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  createCashPositionSnapshot(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createCashPositionSnapshot(user, body);
  }

  @Get("anomaly-insights")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.read")
  listAnomalyInsights(@CurrentUser() user: any) {
    return this.service.listAnomalyInsights(user);
  }

  @Post("anomaly-insights")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  createAnomalyInsight(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createAnomalyInsight(user, body);
  }

  @Get("cash-forecast-runs")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.read")
  listCashForecastRuns(@CurrentUser() user: any) {
    return this.service.listCashForecastRuns(user);
  }

  @Post("cash-forecast-runs")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  createCashForecastRun(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createCashForecastRun(user, body);
  }

  @Get("travel-policies")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.read")
  listTravelPolicies(@CurrentUser() user: any) {
    return this.service.listTravelPolicies(user);
  }

  @Post("travel-policies")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  createTravelPolicy(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createTravelPolicy(user, body);
  }

  @Get("travel-requests")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.read")
  listTravelRequests(@CurrentUser() user: any) {
    return this.service.listTravelRequests(user);
  }

  @Post("travel-requests")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  createTravelRequest(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createTravelRequest(user, body);
  }

  @Patch("travel-requests/:requestId/submit")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  submitTravelRequest(@CurrentUser() user: any, @Param("requestId") requestId: string) {
    return this.service.submitTravelRequest(user, requestId);
  }

  @Patch("travel-requests/:requestId/approve")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.approve")
  approveTravelRequest(@CurrentUser() user: any, @Param("requestId") requestId: string) {
    return this.service.approveTravelRequest(user, requestId);
  }

  @Patch("travel-requests/:requestId/reject")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.approve")
  rejectTravelRequest(@CurrentUser() user: any, @Param("requestId") requestId: string, @Body() body: any) {
    return this.service.rejectTravelRequest(user, requestId, body);
  }

  @Get("travel-bookings")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.read")
  listTravelBookings(@CurrentUser() user: any) {
    return this.service.listTravelBookings(user);
  }

  @Post("travel-bookings")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  createTravelBooking(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createTravelBooking(user, body);
  }

  @Patch("travel-bookings/:bookingId/reconcile")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  reconcileTravelBooking(@CurrentUser() user: any, @Param("bookingId") bookingId: string, @Body() body: any) {
    return this.service.reconcileTravelBooking(user, bookingId, body);
  }

  @Get("travel-advances")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.read")
  listTravelAdvances(@CurrentUser() user: any) {
    return this.service.listTravelAdvances(user);
  }

  @Post("travel-advances")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  createTravelAdvance(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createTravelAdvance(user, body);
  }

  @Patch("travel-advances/:advanceId/settle")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.approve", "finance.write")
  settleTravelAdvance(@CurrentUser() user: any, @Param("advanceId") advanceId: string, @Body() body: any) {
    return this.service.settleTravelAdvance(user, advanceId, body);
  }

  @Get("billing-plans")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.read")
  listBillingPlans(@CurrentUser() user: any) {
    return this.service.listBillingPlans(user);
  }

  @Post("billing-plans")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  createBillingPlan(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createBillingPlan(user, body);
  }

  @Get("invoices")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.read")
  listInvoices(@CurrentUser() user: any) {
    return this.service.listInvoices(user);
  }

  @Post("invoices")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  createInvoice(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createInvoice(user, body);
  }

  @Get("tax-profiles")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.read")
  listTaxProfiles(@CurrentUser() user: any) {
    return this.service.listTaxProfiles(user);
  }

  @Post("tax-profiles")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  createTaxProfile(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createTaxProfile(user, body);
  }

  @Get("revenue-schedules")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.read")
  listRevenueSchedules(@CurrentUser() user: any) {
    return this.service.listRevenueSchedules(user);
  }

  @Post("revenue-schedules")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  createRevenueSchedule(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createRevenueSchedule(user, body);
  }

  @Get("recovery-cases")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.read")
  listRecoveryCases(@CurrentUser() user: any) {
    return this.service.listRecoveryCases(user);
  }

  @Post("recovery-cases")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  createRecoveryCase(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createRecoveryCase(user, body);
  }

  @Patch("recovery-cases/:recoveryCaseId/advance")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  advanceRecoveryCase(@CurrentUser() user: any, @Param("recoveryCaseId") recoveryCaseId: string, @Body() body: any) {
    return this.service.advanceRecoveryCase(user, recoveryCaseId, body);
  }

  @Get("close-evidences")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.read")
  listCloseEvidences(@CurrentUser() user: any) {
    return this.service.listCloseEvidences(user);
  }

  @Post("close-evidences")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  createCloseEvidence(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createCloseEvidence(user, body);
  }

  @Patch("close-evidences/:evidenceId/verify")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.approve")
  verifyCloseEvidence(@CurrentUser() user: any, @Param("evidenceId") evidenceId: string, @Body() body: any) {
    return this.service.verifyCloseEvidence(user, evidenceId, body);
  }

  @Get("global-entities")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.read")
  listGlobalEntities(@CurrentUser() user: any) {
    return this.service.listGlobalEntities(user);
  }

  @Post("global-entities")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  createGlobalEntity(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createGlobalEntity(user, body);
  }

  @Get("country-policies")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.read")
  listCountryPolicies(@CurrentUser() user: any) {
    return this.service.listCountryPolicies(user);
  }

  @Post("country-policies")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  createCountryPolicy(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createCountryPolicy(user, body);
  }

  @Get("plan-drivers")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.read")
  listPlanDrivers(@CurrentUser() user: any) {
    return this.service.listPlanDrivers(user);
  }

  @Post("plan-drivers")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  createPlanDriver(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createPlanDriver(user, body);
  }

  @Get("plan-scenarios")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.read")
  listPlanScenarios(@CurrentUser() user: any) {
    return this.service.listPlanScenarios(user);
  }

  @Post("plan-scenarios")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  createPlanScenario(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createPlanScenario(user, body);
  }

  @Get("copilot-insights")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.read")
  listCopilotInsights(@CurrentUser() user: any) {
    return this.service.listCopilotInsights(user);
  }

  @Post("copilot-insights")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  createCopilotInsight(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createCopilotInsight(user, body);
  }

  @Get("copilot-playbooks")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.read")
  listCopilotPlaybooks(@CurrentUser() user: any) {
    return this.service.listCopilotPlaybooks(user);
  }

  @Post("copilot-playbooks")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  createCopilotPlaybook(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createCopilotPlaybook(user, body);
  }

  @Patch("copilot-playbooks/:playbookId/execute")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write", "finance.approve")
  executeCopilotPlaybook(@CurrentUser() user: any, @Param("playbookId") playbookId: string, @Body() body: any) {
    return this.service.executeCopilotPlaybook(user, playbookId, body);
  }

  @Post("copilot/investigations")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write", "finance.approve")
  openCopilotInvestigation(@CurrentUser() user: any, @Body() body: any) {
    return this.service.openCopilotInvestigation(user, body);
  }

  @Post("copilot/cost-cut")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write", "finance.approve")
  suggestCostCut(@CurrentUser() user: any, @Body() body: any) {
    return this.service.suggestCostCut(user, body);
  }

  @Post("copilot/recovery")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write", "finance.approve")
  triggerRecoveryActions(@CurrentUser() user: any, @Body() body: any) {
    return this.service.triggerRecoveryActions(user, body);
  }

  @Post("copilot/cash-allocation")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write", "finance.approve")
  recommendCashAllocation(@CurrentUser() user: any, @Body() body: any) {
    return this.service.recommendCashAllocation(user, body);
  }

  @Get("usage-meters")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.read")
  listUsageMeters(@CurrentUser() user: any) {
    return this.service.listUsageMeters(user);
  }

  @Post("usage-meters")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  createUsageMeter(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createUsageMeter(user, body);
  }

  @Get("usage-events")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.read")
  listUsageEvents(@CurrentUser() user: any) {
    return this.service.listUsageEvents(user);
  }

  @Post("usage-events")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  createUsageEvent(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createUsageEvent(user, body);
  }

  @Get("revenue-subledger")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.read")
  listRevenueSubledgerEntries(@CurrentUser() user: any) {
    return this.service.listRevenueSubledgerEntries(user);
  }

  @Post("revenue-subledger")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  createRevenueSubledgerEntry(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createRevenueSubledgerEntry(user, body);
  }

  @Get("revenue-connectors")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.read")
  listRevenueConnectors(@CurrentUser() user: any) {
    return this.service.listRevenueConnectors(user);
  }

  @Post("revenue-connectors")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  createRevenueConnector(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createRevenueConnector(user, body);
  }

  @Patch("revenue-connectors/:connectorId/sync")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  syncRevenueConnector(@CurrentUser() user: any, @Param("connectorId") connectorId: string, @Body() body: any) {
    return this.service.syncRevenueConnector(user, connectorId, body);
  }

  @Post("billing-plans/:billingPlanId/run")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  runBillingCycle(@CurrentUser() user: any, @Param("billingPlanId") billingPlanId: string, @Body() body: any) {
    return this.service.runBillingCycle(user, billingPlanId, body);
  }

  @Patch("billing-plans/:billingPlanId/cancel")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  cancelBillingPlan(@CurrentUser() user: any, @Param("billingPlanId") billingPlanId: string, @Body() body: any) {
    return this.service.cancelBillingPlan(user, billingPlanId, body);
  }

  @Get("fx-rates")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.read")
  listFxRates(@CurrentUser() user: any) {
    return this.service.listFxRates(user);
  }

  @Post("fx-rates")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  createFxRate(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createFxRate(user, body);
  }

  @Get("international-reimbursements")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.read")
  listInternationalReimbursements(@CurrentUser() user: any) {
    return this.service.listInternationalReimbursements(user);
  }

  @Post("international-reimbursements")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  createInternationalReimbursement(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createInternationalReimbursement(user, body);
  }

  @Get("local-payouts")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.read")
  listLocalPayouts(@CurrentUser() user: any) {
    return this.service.listLocalPayouts(user);
  }

  @Post("local-payouts")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  createLocalPayout(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createLocalPayout(user, body);
  }

  @Get("intercompany-transfers")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.read")
  listIntercompanyTransfers(@CurrentUser() user: any) {
    return this.service.listIntercompanyTransfers(user);
  }

  @Post("intercompany-transfers")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  createIntercompanyTransfer(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createIntercompanyTransfer(user, body);
  }

  @Get("consolidation-snapshots")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.read")
  listConsolidationSnapshots(@CurrentUser() user: any) {
    return this.service.listConsolidationSnapshots(user);
  }

  @Post("consolidation-snapshots")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  createConsolidationSnapshot(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createConsolidationSnapshot(user, body);
  }

  @Get("tax-jurisdictions")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.read")
  listTaxJurisdictions(@CurrentUser() user: any) {
    return this.service.listTaxJurisdictions(user);
  }

  @Post("tax-jurisdictions")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  createTaxJurisdiction(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createTaxJurisdiction(user, body);
  }

  @Get("tax-trails")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.read")
  listTaxTrails(@CurrentUser() user: any) {
    return this.service.listTaxTrails(user);
  }

  @Post("tax-trails")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  createTaxTrail(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createTaxTrail(user, body);
  }

  @Patch("vendors/:vendorId/portal")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  activateVendorPortal(@CurrentUser() user: any, @Param("vendorId") vendorId: string, @Body() body: any) {
    return this.service.activateVendorPortal(user, vendorId, body);
  }

  @Get("vendor-kyc")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.read")
  listVendorKycReviews(@CurrentUser() user: any) {
    return this.service.listVendorKycReviews(user);
  }

  @Post("vendor-kyc")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  createVendorKycReview(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createVendorKycReview(user, body);
  }

  @Get("vendor-contracts")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.read")
  listVendorContracts(@CurrentUser() user: any) {
    return this.service.listVendorContracts(user);
  }

  @Post("vendor-contracts")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  createVendorContract(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createVendorContract(user, body);
  }

  @Get("vendor-benchmarks")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.read")
  listVendorBenchmarks(@CurrentUser() user: any) {
    return this.service.listVendorBenchmarks(user);
  }

  @Post("vendor-benchmarks")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  createVendorBenchmark(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createVendorBenchmark(user, body);
  }

  @Get("warehouse-connections")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.read")
  listWarehouseConnections(@CurrentUser() user: any) {
    return this.service.listWarehouseConnections(user);
  }

  @Post("warehouse-connections")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  createWarehouseConnection(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createWarehouseConnection(user, body);
  }

  @Get("metric-snapshots")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.read")
  listMetricSnapshots(@CurrentUser() user: any) {
    return this.service.listMetricSnapshots(user);
  }

  @Post("metric-snapshots")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  createMetricSnapshot(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createMetricSnapshot(user, body);
  }

  @Get("revenue-cohorts")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.read")
  listRevenueCohorts(@CurrentUser() user: any) {
    return this.service.listRevenueCohorts(user);
  }

  @Post("revenue-cohorts")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  createRevenueCohort(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createRevenueCohort(user, body);
  }

  @Get("unit-benchmarks")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.read")
  listUnitBenchmarks(@CurrentUser() user: any) {
    return this.service.listUnitBenchmarks(user);
  }

  @Post("unit-benchmarks")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  createUnitBenchmark(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createUnitBenchmark(user, body);
  }

  @Get("security/sso")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.read")
  listSsoConfigs(@CurrentUser() user: any) {
    return this.service.listSsoConfigs(user);
  }

  @Post("security/sso")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  createSsoConfig(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createSsoConfig(user, body);
  }

  @Get("security/scim")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.read")
  listScimProvisions(@CurrentUser() user: any) {
    return this.service.listScimProvisions(user);
  }

  @Post("security/scim")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  createScimProvision(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createScimProvision(user, body);
  }

  @Get("security/retention")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.read")
  listRetentionPolicies(@CurrentUser() user: any) {
    return this.service.listRetentionPolicies(user);
  }

  @Post("security/retention")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  createRetentionPolicy(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createRetentionPolicy(user, body);
  }

  @Get("security/audit-exports")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.read")
  listAuditExports(@CurrentUser() user: any) {
    return this.service.listAuditExports(user);
  }

  @Post("security/audit-exports")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  createAuditExport(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createAuditExport(user, body);
  }

  @Get("security/segregation")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.read")
  listSegregationPolicies(@CurrentUser() user: any) {
    return this.service.listSegregationPolicies(user);
  }

  @Post("security/segregation")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  createSegregationPolicy(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createSegregationPolicy(user, body);
  }

  @Get("approval-evidences")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.read")
  listApprovalEvidences(@CurrentUser() user: any) {
    return this.service.listApprovalEvidences(user);
  }

  @Post("approval-evidences")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  createApprovalEvidence(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createApprovalEvidence(user, body);
  }

  @Patch("approval-evidences/:evidenceId/verify")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write", "finance.approve")
  verifyApprovalEvidence(@CurrentUser() user: any, @Param("evidenceId") evidenceId: string, @Body() body: any) {
    return this.service.verifyApprovalEvidence(user, evidenceId, body);
  }

  @Get("billing-plan-versions")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.read")
  listBillingPlanVersions(@CurrentUser() user: any) {
    return this.service.listBillingPlanVersions(user);
  }

  @Post("billing-plan-versions")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  createBillingPlanVersion(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createBillingPlanVersion(user, body);
  }

  @Get("customer-credits")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.read")
  listCustomerCreditBalances(@CurrentUser() user: any) {
    return this.service.listCustomerCreditBalances(user);
  }

  @Post("customer-credits")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  createCustomerCreditBalance(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createCustomerCreditBalance(user, body);
  }

  @Get("rate-cards")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.read")
  listRateCards(@CurrentUser() user: any) {
    return this.service.listRateCards(user);
  }

  @Post("rate-cards")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  createRateCard(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createRateCard(user, body);
  }

  @Get("invoice-retries")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.read")
  listInvoiceRetryAttempts(@CurrentUser() user: any) {
    return this.service.listInvoiceRetryAttempts(user);
  }

  @Post("invoice-retries")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  createInvoiceRetryAttempt(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createInvoiceRetryAttempt(user, body);
  }

  @Get("workforce-plans")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.read")
  listWorkforcePlans(@CurrentUser() user: any) {
    return this.service.listWorkforcePlans(user);
  }

  @Post("workforce-plans")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  createWorkforcePlan(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createWorkforcePlan(user, body);
  }

  @Get("scenario-merges")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.read")
  listScenarioMerges(@CurrentUser() user: any) {
    return this.service.listScenarioMerges(user);
  }

  @Post("scenario-merges")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  createScenarioMerge(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createScenarioMerge(user, body);
  }

  @Get("variance-explanations")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.read")
  listVarianceExplanations(@CurrentUser() user: any) {
    return this.service.listVarianceExplanations(user);
  }

  @Post("variance-explanations")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  createVarianceExplanation(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createVarianceExplanation(user, body);
  }

  @Get("planning-collaboration")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.read")
  listPlanningCollaborations(@CurrentUser() user: any) {
    return this.service.listPlanningCollaborations(user);
  }

  @Post("planning-collaboration")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  createPlanningCollaboration(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createPlanningCollaboration(user, body);
  }

  @Get("procurement-signals")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.read")
  listProcurementSignals(@CurrentUser() user: any) {
    return this.service.listProcurementSignals(user);
  }

  @Post("procurement-signals")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  createProcurementSignal(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createProcurementSignal(user, body);
  }

  @Get("copilot-runs")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.read")
  listCopilotRuns(@CurrentUser() user: any) {
    return this.service.listCopilotRuns(user);
  }

  @Get("copilot-cases")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.read")
  listCopilotCases(@CurrentUser() user: any) {
    return this.service.listCopilotCases(user);
  }

  @Post("copilot-cases")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  createCopilotCase(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createCopilotCase(user, body);
  }

  @Get("dunning-policies")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.read")
  listDunningPolicies(@CurrentUser() user: any) {
    return this.service.listDunningPolicies(user);
  }

  @Post("dunning-policies")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  createDunningPolicy(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createDunningPolicy(user, body);
  }

  @Get("invoice-lifecycle")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.read")
  listInvoiceLifecycleEvents(@CurrentUser() user: any) {
    return this.service.listInvoiceLifecycleEvents(user);
  }

  @Post("invoice-lifecycle")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  createInvoiceLifecycleEvent(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createInvoiceLifecycleEvent(user, body);
  }

  @Get("billing-portals")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.read")
  listCustomerBillingPortals(@CurrentUser() user: any) {
    return this.service.listCustomerBillingPortals(user);
  }

  @Post("billing-portals")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  createCustomerBillingPortal(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createCustomerBillingPortal(user, body);
  }

  @Get("procurement-investigations")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.read")
  listProcurementInvestigations(@CurrentUser() user: any) {
    return this.service.listProcurementInvestigations(user);
  }

  @Post("procurement-investigations")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  createProcurementInvestigation(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createProcurementInvestigation(user, body);
  }

  @Get("ocr-line-items")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.read")
  listOcrLineItems(@CurrentUser() user: any) {
    return this.service.listOcrLineItems(user);
  }

  @Post("ocr-line-items")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  createOcrLineItem(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createOcrLineItem(user, body);
  }

  @Get("vendor-scorecards")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.read")
  listVendorScorecards(@CurrentUser() user: any) {
    return this.service.listVendorScorecards(user);
  }

  @Post("vendor-scorecards")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  createVendorScorecard(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createVendorScorecard(user, body);
  }

  @Get("planning-cycles")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.read")
  listPlanningCycles(@CurrentUser() user: any) {
    return this.service.listPlanningCycles(user);
  }

  @Post("planning-cycles")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  createPlanningCycle(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createPlanningCycle(user, body);
  }

  @Get("headcount-lines")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.read")
  listHeadcountPlanLines(@CurrentUser() user: any) {
    return this.service.listHeadcountPlanLines(user);
  }

  @Post("headcount-lines")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  createHeadcountPlanLine(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createHeadcountPlanLine(user, body);
  }

  @Get("scenario-comparisons")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.read")
  listScenarioComparisons(@CurrentUser() user: any) {
    return this.service.listScenarioComparisons(user);
  }

  @Post("scenario-comparisons")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  createScenarioComparison(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createScenarioComparison(user, body);
  }

  @Get("fx-exposures")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.read")
  listFxExposures(@CurrentUser() user: any) {
    return this.service.listFxExposures(user);
  }

  @Post("fx-exposures")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  createFxExposure(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createFxExposure(user, body);
  }

  @Get("intercompany-settlements")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.read")
  listIntercompanySettlements(@CurrentUser() user: any) {
    return this.service.listIntercompanySettlements(user);
  }

  @Post("intercompany-settlements")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  createIntercompanySettlement(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createIntercompanySettlement(user, body);
  }

  @Get("tax-registrations")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.read")
  listTaxRegistrations(@CurrentUser() user: any) {
    return this.service.listTaxRegistrations(user);
  }

  @Post("tax-registrations")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  createTaxRegistration(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createTaxRegistration(user, body);
  }

  @Get("compliance-runs")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.read")
  listComplianceRuns(@CurrentUser() user: any) {
    return this.service.listComplianceRuns(user);
  }

  @Get("control-exceptions")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.read")
  listControlExceptions(@CurrentUser() user: any) {
    return this.service.listControlExceptions(user);
  }

  @Post("control-exceptions")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  createControlException(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createControlException(user, body);
  }

  @Post("autopilot/copilot")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write", "finance.approve")
  runCopilotAutopilot(@CurrentUser() user: any, @Body() body: any) {
    return this.service.runCopilotAutopilot(user, body);
  }

  @Post("autopilot/revenue")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  runRevenueOps(@CurrentUser() user: any, @Body() body: any) {
    return this.service.runRevenueOps(user, body);
  }

  @Post("autopilot/global")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  runGlobalFinanceOps(@CurrentUser() user: any, @Body() body: any) {
    return this.service.runGlobalFinanceOps(user, body);
  }

  @Post("autopilot/vendors")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  runVendorGovernance(@CurrentUser() user: any, @Body() body: any) {
    return this.service.runVendorGovernance(user, body);
  }

  @Post("autopilot/bi-refresh")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write")
  runBiRefresh(@CurrentUser() user: any, @Body() body: any) {
    return this.service.runBiRefresh(user, body);
  }

  @Post("autopilot/compliance")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.FINANCE)
  @RequirePermissions("finance.write", "finance.approve")
  runComplianceSweep(@CurrentUser() user: any, @Body() body: any) {
    return this.service.runComplianceSweep(user, body);
  }
}
