import { useCallback, useState } from 'react';
import { getCrmLeadDetails } from './crm.service';
import type { AuthHeaders, CrmLeadDetailsResponse } from './crm.service';
import type { ExtendedLeadItem, LeadActivity, LeadTask } from './types';

export function useLeadDetails(authHeaders: AuthHeaders) {
  const [selectedLead, setSelectedLead] = useState<ExtendedLeadItem | null>(null);
  const [leadActivities, setLeadActivities] = useState<LeadActivity[]>([]);
  const [leadTasks, setLeadTasks] = useState<LeadTask[]>([]);
  const [leadSummary, setLeadSummary] = useState<CrmLeadDetailsResponse['summary'] | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const openLeadDetails = useCallback(
    async (lead: ExtendedLeadItem) => {
      try {
        setSelectedLead(lead);
        setLoadingDetails(true);

        const details = await getCrmLeadDetails(lead.id, authHeaders);

        setSelectedLead(details);
        setLeadActivities(Array.isArray(details.activities) ? details.activities : []);
        setLeadTasks(Array.isArray(details.tasks) ? details.tasks : []);
        setLeadSummary(details.summary ?? null);
      } catch {
        setLeadActivities([]);
        setLeadTasks([]);
        setLeadSummary(null);
      } finally {
        setLoadingDetails(false);
      }
    },
    [authHeaders],
  );

  const closeLeadDetails = useCallback(() => {
    setSelectedLead(null);
    setLeadActivities([]);
    setLeadTasks([]);
    setLeadSummary(null);
    setLoadingDetails(false);
  }, []);

  return {
    closeLeadDetails,
    leadActivities,
    leadSummary,
    leadTasks,
    loadingDetails,
    openLeadDetails,
    selectedLead,
  };
}