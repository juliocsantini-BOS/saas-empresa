import { useEffect, useMemo, useState } from 'react';

import { getMyCrmPermissions } from './crm.service';
import type { AuthHeaders } from './crm.service';

type UseCrmPermissionsResult = {
  canEditLead: boolean;
  canChangeLeadStatus: boolean;
  canMarkLeadOutcome: boolean;
  canCreateActivities: boolean;
  canCreateTasks: boolean;
  canUpdateTasks: boolean;
  canUseBulkActions: boolean;
  canCreateSavedViews: boolean;
  canDeleteSavedViews: boolean;
  canSeeValues: boolean;
  canSeeLostReasons: boolean;
};

export function useCrmPermissions(authHeaders: AuthHeaders): UseCrmPermissionsResult {
  const [permissionKeys, setPermissionKeys] = useState<string[]>([]);

  useEffect(() => {
    let active = true;

    async function loadPermissions() {
      try {
        const permissions = await getMyCrmPermissions(authHeaders);
        if (active) {
          setPermissionKeys(Array.isArray(permissions) ? permissions : []);
        }
      } catch {
        if (active) {
          setPermissionKeys([]);
        }
      }
    }

    void loadPermissions();

    return () => {
      active = false;
    };
  }, [authHeaders]);

  return useMemo(() => {
    const permissionSet = new Set(permissionKeys);

    return {
      canEditLead: permissionSet.has('crm.leads.edit'),
      canChangeLeadStatus: permissionSet.has('crm.leads.status'),
      canMarkLeadOutcome: permissionSet.has('crm.leads.close'),
      canCreateActivities: permissionSet.has('crm.activities.create'),
      canCreateTasks: permissionSet.has('crm.tasks.create'),
      canUpdateTasks: permissionSet.has('crm.tasks.update'),
      canUseBulkActions: permissionSet.has('crm.bulk.update'),
      canCreateSavedViews: permissionSet.has('crm.saved_views.create'),
      canDeleteSavedViews: permissionSet.has('crm.saved_views.delete'),
      canSeeValues: permissionSet.has('crm.values.read'),
      canSeeLostReasons: permissionSet.has('crm.loss_reasons.read'),
    };
  }, [permissionKeys]);
}
