import { useCallback, useEffect, useState } from 'react';

import { getCrmLeads } from './crm.service';
import type { AuthHeaders } from './crm.service';
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

export function useCrmLeads(authHeaders: AuthHeaders) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leads, setLeads] = useState<ExtendedLeadItem[]>([]);

  const reload = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getCrmLeads(authHeaders);
      setLeads(Array.isArray(data) ? data : []);
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Não foi possível carregar os leads do CRM.'));
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return {
    error,
    leads,
    loading,
    reload,
    setError,
  };
}
