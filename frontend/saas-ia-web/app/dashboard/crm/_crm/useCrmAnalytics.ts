import { useCallback, useEffect, useMemo, useState } from 'react';
import { getCrmAnalytics } from './crm.service';
import type {
  AuthHeaders,
  CrmAnalyticsApiResponse,
  CrmLeadsQueryParams,
} from './crm.service';

function getErrorMessage(error: unknown, fallback: string) {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof error.response === 'object' &&
    error.response !== null &&
    'data' in error.response &&
    typeof error.response.data === 'object' &&
    error.response.data !== null &&
    'message' in error.response.data &&
    typeof error.response.data.message === 'string'
  ) {
    return error.response.data.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

const DEFAULT_RESPONSE: CrmAnalyticsApiResponse = {
  items: [],
  total: 0,
};

export function useCrmAnalytics(
  authHeaders: AuthHeaders,
  params: CrmLeadsQueryParams = {},
) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<CrmAnalyticsApiResponse>(DEFAULT_RESPONSE);

  const normalizedParams = useMemo<CrmLeadsQueryParams>(
    () => ({
      q: params.q,
      status: params.status,
      ownerUserId: params.ownerUserId,
      branchId: params.branchId,
      departmentId: params.departmentId,
      source: params.source,
      priority: params.priority,
      temperatureFilter: params.temperatureFilter,
      openTasksOnly: params.openTasksOnly,
      stalledOnly: params.stalledOnly,
      overdueNextStepOnly: params.overdueNextStepOnly,
      probabilityMin: params.probabilityMin,
      probabilityMax: params.probabilityMax,
      dealValueMin: params.dealValueMin,
      dealValueMax: params.dealValueMax,
      createdAtFrom: params.createdAtFrom,
      createdAtTo: params.createdAtTo,
      expectedCloseDateFrom: params.expectedCloseDateFrom,
      expectedCloseDateTo: params.expectedCloseDateTo,
      accountId: params.accountId,
      contactId: params.contactId,
      forecastCategory: params.forecastCategory,
      sortBy: params.sortBy ?? 'updatedAt',
      sortOrder: params.sortOrder ?? 'desc',
    }),
    [
      params.accountId,
      params.branchId,
      params.contactId,
      params.createdAtFrom,
      params.createdAtTo,
      params.dealValueMax,
      params.dealValueMin,
      params.departmentId,
      params.expectedCloseDateFrom,
      params.expectedCloseDateTo,
      params.forecastCategory,
      params.openTasksOnly,
      params.overdueNextStepOnly,
      params.ownerUserId,
      params.priority,
      params.probabilityMax,
      params.probabilityMin,
      params.q,
      params.sortBy,
      params.sortOrder,
      params.source,
      params.stalledOnly,
      params.status,
      params.temperatureFilter,
    ],
  );

  const reload = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCrmAnalytics(authHeaders, normalizedParams);
      setResponse({
        items: Array.isArray(data?.items) ? data.items : [],
        total: Number(data?.total ?? 0),
      });
    } catch (analyticsError: unknown) {
      setError(getErrorMessage(analyticsError, 'Nao foi possivel carregar os analytics do CRM.'));
      setResponse(DEFAULT_RESPONSE);
    } finally {
      setLoading(false);
    }
  }, [authHeaders, normalizedParams]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return {
    error,
    items: response.items,
    loading,
    reload,
    setError,
    total: response.total,
  };
}
