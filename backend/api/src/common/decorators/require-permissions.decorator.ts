import { Perms } from "./perms.decorator";

/**
 * Alias oficial do projeto.
 * Use sempre @RequirePermissions(...) nos controllers.
 */
export const RequirePermissions = (...keys: string[]) => Perms(...keys);