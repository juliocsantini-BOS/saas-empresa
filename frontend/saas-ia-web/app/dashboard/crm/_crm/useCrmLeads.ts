import { useCallback, useEffect, useMemo, useState } from 'react';
import { getCrmLeads } from './crm.service';
import type {
  AuthHeaders,
  CrmLeadsQueryParams,
  PaginatedCrmLeadsResponse,
} from './crm.service';
import type { ExtendedLeadItem } from './types';

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

const DEFAULT_RESPONSE: PaginatedCrmLeadsResponse = {
  items: [],
  total: 0,
  page: 1,
  pageSize: 20,
  totalPages: 0,
};

export function useCrmLeads(
  authHeaders: AuthHeaders,
  params: CrmLeadsQueryParams = {},
) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] =
    useState<PaginatedCrmLeadsResponse>(DEFAULT_RESPONSE);

  const normalizedParams = useMemo<CrmLeadsQueryParams>(
    () => ({
      q: params.q,
      status: params.status,
      ownerUserId: params.ownerUserId,
      branchId: params.branchId,
      departmentId: params.departmentId,
      source: params.source,
      priority: params.priority,
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 20,
      sortBy: params.sortBy ?? 'updatedAt',
      sortOrder: params.sortOrder ?? 'desc',
    }),
    [
      params.branchId,
      params.departmentId,
      params.ownerUserId,
      params.page,
      params.pageSize,
      params.priority,
      params.q,
      params.sortBy,
      params.sortOrder,
      params.source,
      params.status,
    ],
  );

  const reload = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getCrmLeads(authHeaders, normalizedParams);

      setResponse({
        items: Array.isArray(data?.items) ? data.items : [],
        total: Number(data?.total ?? 0),
        page: Number(data?.page ?? normalizedParams.page ?? 1),
        pageSize: Number(data?.pageSize ?? normalizedParams.pageSize ?? 20),
        totalPages: Number(data?.totalPages ?? 0),
      });
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Não foi possível carregar os leads do CRM.'));
      setResponse(DEFAULT_RESPONSE);
    } finally {
      setLoading(false);
    }
  }, [authHeaders, normalizedParams]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const leads: ExtendedLeadItem[] = response.items;

  return {
    error,
    leads,
    items: response.items,
    loading,
    page: response.page,
    pageSize: response.pageSize,
    reload,
    setError,
    total: response.total,
    totalPages: response.totalPages,
  };
}