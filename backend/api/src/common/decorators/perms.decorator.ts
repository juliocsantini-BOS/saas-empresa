import { SetMetadata } from "@nestjs/common";

export const PERMS_KEY = "perms";

/**
 * Ex: @Perms("branches.read", "users.create")
 */
export const Perms = (...perms: string[]) => SetMetadata(PERMS_KEY, perms);
