import axios from 'axios';
import { API_URL } from './constants';
import type {
  FinanceModuleData,
} from './types';

export async function loadFinanceModule(headers: Record<string, string>): Promise<FinanceModuleData> {
  const response = await axios.get<FinanceModuleData>(`${API_URL}/v1/finance/module`, { headers });
  return response.data;
}

async function runFinanceCommand(
  path: string,
  headers: Record<string, string>,
  body: Record<string, unknown> = {},
) {
  const response = await axios.post(`${API_URL}${path}`, body, { headers });
  return response.data;
}

export function runFinanceCopilotAutopilot(headers: Record<string, string>) {
  return runFinanceCommand('/v1/finance/autopilot/copilot', headers);
}

export function runFinanceRevenueOps(headers: Record<string, string>) {
  return runFinanceCommand('/v1/finance/autopilot/revenue', headers);
}

export function runFinanceGlobalOps(headers: Record<string, string>) {
  return runFinanceCommand('/v1/finance/autopilot/global', headers);
}

export function runFinanceVendorGovernance(headers: Record<string, string>) {
  return runFinanceCommand('/v1/finance/autopilot/vendors', headers);
}

export function runFinanceBiRefresh(headers: Record<string, string>) {
  return runFinanceCommand('/v1/finance/autopilot/bi-refresh', headers);
}

export function runFinanceComplianceSweep(headers: Record<string, string>) {
  return runFinanceCommand('/v1/finance/autopilot/compliance', headers);
}
