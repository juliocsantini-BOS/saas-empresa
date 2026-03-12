import { useMemo, useState } from 'react';

import type { ExtendedLeadItem } from './types';

export function useCrmBulkSelection(filteredLeads: ExtendedLeadItem[]) {
  const [selectedLeadIdsState, setSelectedLeadIds] = useState<string[]>([]);

  const filteredLeadIds = useMemo(() => filteredLeads.map((lead) => lead.id), [filteredLeads]);
  const selectedLeadIds = useMemo(
    () => selectedLeadIdsState.filter((id) => filteredLeadIds.includes(id)),
    [filteredLeadIds, selectedLeadIdsState],
  );

  function toggleLeadSelection(leadId: string) {
    setSelectedLeadIds((prev) =>
      prev.includes(leadId) ? prev.filter((id) => id !== leadId) : [...prev, leadId],
    );
  }

  function clearSelection() {
    setSelectedLeadIds([]);
  }

  function selectFilteredLeads() {
    setSelectedLeadIds(filteredLeadIds);
  }

  function isLeadSelected(leadId: string) {
    return selectedLeadIds.includes(leadId);
  }

  return {
    clearSelection,
    isLeadSelected,
    selectFilteredLeads,
    selectedLeadIds,
    selectedLeadCount: selectedLeadIds.length,
    toggleLeadSelection,
  };
}
