import { useCallback, useState } from 'react';

import { getCrmLeadActivities, getCrmLeadTasks } from './crm.service';
import type { AuthHeaders } from './crm.service';
import type { ExtendedLeadItem, LeadActivity, LeadTask } from './types';

export function useLeadDetails(authHeaders: AuthHeaders) {
  const [selectedLead, setSelectedLead] = useState<ExtendedLeadItem | null>(null);
  const [leadActivities, setLeadActivities] = useState<LeadActivity[]>([]);
  const [leadTasks, setLeadTasks] = useState<LeadTask[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const openLeadDetails = useCallback(
    async (lead: ExtendedLeadItem) => {
      try {
        setSelectedLead(lead);
        setLoadingDetails(true);

        const [activitiesData, tasksData] = await Promise.all([
          getCrmLeadActivities(lead.id, authHeaders),
          getCrmLeadTasks(lead.id, authHeaders),
        ]);

        setLeadActivities(Array.isArray(activitiesData) ? activitiesData : []);
        setLeadTasks(Array.isArray(tasksData) ? tasksData : []);
      } catch {
        setLeadActivities([]);
        setLeadTasks([]);
      } finally {
        setLoadingDetails(false);
      }
    },
    [authHeaders],
  );

  return {
    leadActivities,
    leadTasks,
    loadingDetails,
    openLeadDetails,
    selectedLead,
  };
}
