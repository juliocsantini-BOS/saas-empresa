import { useCallback, useState } from 'react';

import { createCrmLeadActivity } from './crm.service';
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

type UseLeadNotesParams = {
  authHeaders: AuthHeaders;
  loadLeads: () => Promise<void>;
  refreshLeadDetails: (lead: ExtendedLeadItem) => Promise<void>;
  setError: (value: string | null) => void;
};

export function useLeadNotes({
  authHeaders,
  loadLeads,
  refreshLeadDetails,
  setError,
}: UseLeadNotesParams) {
  const [noteText, setNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  const submitNote = useCallback(
    async (lead: ExtendedLeadItem | null) => {
      if (!lead || savingNote || noteText.trim().length < 2) return;

      try {
        setSavingNote(true);
        setError(null);

        const now = new Date().toISOString();

        await createCrmLeadActivity(authHeaders, lead.id, {
          type: 'NOTE',
          description: noteText.trim(),
        });

        setNoteText('');
        await loadLeads();
        await refreshLeadDetails({
          ...lead,
          lastActivityAt: now,
          updatedAt: now,
        });
      } catch (error: unknown) {
        setError(getErrorMessage(error, 'Não foi possível adicionar a nota ao lead.'));
      } finally {
        setSavingNote(false);
      }
    },
    [authHeaders, loadLeads, noteText, refreshLeadDetails, savingNote, setError],
  );

  return {
    noteText,
    savingNote,
    setNoteText,
    submitNote,
  };
}
