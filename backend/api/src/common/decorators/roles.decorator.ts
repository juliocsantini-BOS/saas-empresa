import { SetMetadata } from "@nestjs/common";
import { Role } from "@prisma/client";

export const ROLES_KEY = "roles";

/**
 * Enterprise:
 * - Tipado com enum Role do Prisma
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
