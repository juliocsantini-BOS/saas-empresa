import { useCallback, useState } from 'react';

import { createCrmLeadActivity } from './crm.service';
import type { AuthHeaders } from './crm.service';
import type { ActivityComposerType, ExtendedLeadItem } from './types';

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

type UseLeadActivityComposerParams = {
  authHeaders: AuthHeaders;
  loadLeads: () => Promise<void>;
  refreshLeadDetails: (lead: ExtendedLeadItem) => Promise<void>;
  setError: (value: string | null) => void;
};

export function useLeadActivityComposer({
  authHeaders,
  loadLeads,
  refreshLeadDetails,
  setError,
}: UseLeadActivityComposerParams) {
  const [activityText, setActivityText] = useState('');
  const [activityType, setActivityType] = useState<ActivityComposerType>('NOTE');
  const [savingActivity, setSavingActivity] = useState(false);

  const submitActivity = useCallback(
    async (lead: ExtendedLeadItem | null) => {
      if (!lead || savingActivity || activityText.trim().length < 2) return;

      try {
        setSavingActivity(true);
        setError(null);

        const now = new Date().toISOString();

        await createCrmLeadActivity(authHeaders, lead.id, {
          type: activityType,
          description: activityText.trim(),
        });

        setActivityText('');
        setActivityType('NOTE');
        await loadLeads();
        await refreshLeadDetails({
          ...lead,
          lastActivityAt: now,
          updatedAt: now,
        });
      } catch (error: unknown) {
        setError(getErrorMessage(error, 'Não foi possível registrar a atividade do lead.'));
      } finally {
        setSavingActivity(false);
      }
    },
    [activityText, activityType, authHeaders, loadLeads, refreshLeadDetails, savingActivity, setError],
  );

  return {
    activityText,
    activityType,
    savingActivity,
    setActivityText,
    setActivityType,
    submitActivity,
  };
}
