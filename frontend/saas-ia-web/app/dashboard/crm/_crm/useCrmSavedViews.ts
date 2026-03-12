import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  createCrmSavedView,
  deleteCrmSavedView,
  getCrmSavedViews,
} from './crm.service';
import type { AuthHeaders } from './crm.service';
import type { CrmSavedView, CrmSavedViewFilters } from './types';

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

type UseCrmSavedViewsParams = {
  authHeaders: AuthHeaders;
  currentFilters: CrmSavedViewFilters;
  applySavedFilters: (filters: CrmSavedViewFilters) => void;
  setError: (value: string | null) => void;
};

export function useCrmSavedViews({
  authHeaders,
  currentFilters,
  applySavedFilters,
  setError,
}: UseCrmSavedViewsParams) {
  const [savedViews, setSavedViews] = useState<CrmSavedView[]>([]);
  const [loadingSavedViews, setLoadingSavedViews] = useState(true);
  const [savingSavedView, setSavingSavedView] = useState(false);
  const [deletingViewId, setDeletingViewId] = useState<string | null>(null);
  const [selectedViewId, setSelectedViewId] = useState('ALL');
  const [newViewName, setNewViewName] = useState('');

  const currentFiltersKey = useMemo(() => JSON.stringify(currentFilters), [currentFilters]);

  const loadSavedViews = useCallback(async () => {
    try {
      setLoadingSavedViews(true);
      const data = await getCrmSavedViews(authHeaders);
      setSavedViews(Array.isArray(data) ? data : []);
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Não foi possível carregar as visualizações salvas.'));
    } finally {
      setLoadingSavedViews(false);
    }
  }, [authHeaders, setError]);

  useEffect(() => {
    void loadSavedViews();
  }, [loadSavedViews]);

  useEffect(() => {
    if (selectedViewId === 'ALL') return;
    const selectedView = savedViews.find((item) => item.id === selectedViewId);
    if (!selectedView) {
      setSelectedViewId('ALL');
      return;
    }

    if (JSON.stringify(selectedView.filters) !== currentFiltersKey) {
      setSelectedViewId('ALL');
    }
  }, [currentFiltersKey, savedViews, selectedViewId]);

  const applyViewById = useCallback(
    (viewId: string) => {
      if (viewId === 'ALL') {
        setSelectedViewId('ALL');
        return;
      }

      const selectedView = savedViews.find((item) => item.id === viewId);
      if (!selectedView) return;

      applySavedFilters(selectedView.filters);
      setSelectedViewId(selectedView.id);
    },
    [applySavedFilters, savedViews],
  );

  const saveCurrentView = useCallback(async () => {
    const name = newViewName.trim();
    if (!name) return;

    try {
      setSavingSavedView(true);
      setError(null);

      const savedView = await createCrmSavedView(authHeaders, {
        name,
        filters: currentFilters,
      });

      setSavedViews((prev) => [savedView, ...prev]);
      setNewViewName('');
      setSelectedViewId(savedView.id);
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Não foi possível salvar a visualização.'));
    } finally {
      setSavingSavedView(false);
    }
  }, [authHeaders, currentFilters, newViewName, setError]);

  const deleteView = useCallback(
    async (viewId: string) => {
      try {
        setDeletingViewId(viewId);
        setError(null);
        await deleteCrmSavedView(authHeaders, viewId);
        setSavedViews((prev) => prev.filter((item) => item.id !== viewId));
        if (selectedViewId === viewId) {
          setSelectedViewId('ALL');
        }
      } catch (error: unknown) {
        setError(getErrorMessage(error, 'Não foi possível excluir a visualização.'));
      } finally {
        setDeletingViewId(null);
      }
    },
    [authHeaders, selectedViewId, setError],
  );

  return {
    applyViewById,
    deleteView,
    deletingViewId,
    loadingSavedViews,
    newViewName,
    saveCurrentView,
    savedViews,
    savingSavedView,
    selectedViewId,
    setNewViewName,
  };
}
