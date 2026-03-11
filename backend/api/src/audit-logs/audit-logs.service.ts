import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

type Order = "asc" | "desc";

function toInt(v: any, def: number) {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function toBool(v: any): boolean | undefined {
  if (v === undefined || v === null) return undefined;
  const s = String(v).toLowerCase().trim();
  if (s === "true" || s === "1" || s === "yes" || s === "y") return true;
  if (s === "false" || s === "0" || s === "no" || s === "n") return false;
  return undefined;
}

function toDate(v: any): Date | undefined {
  if (!v) return undefined;
  const d = new Date(String(v));
  return isNaN(d.getTime()) ? undefined : d;
}

@Injectable()
export class AuditLogsService {
  constructor(private prisma: PrismaService) {}

  private baseSelect(includePayload: boolean) {
    return includePayload
      ? {
          id: true,
          createdAt: true,
          requestId: true,
          userId: true,
          companyId: true,
          method: true,
          path: true,
          statusCode: true,
          ip: true,
          userAgent: true,
          durationMs: true,
          bodyJson: true,
          queryJson: true,
          paramsJson: true,
        }
      : {
          id: true,
          createdAt: true,
          requestId: true,
          userId: true,
          companyId: true,
          method: true,
          path: true,
          statusCode: true,
          ip: true,
          userAgent: true,
          durationMs: true,
        };
  }

  async list(params: {
    requesterRole: string;
    requesterCompanyId?: string | null;
    take?: any;
    skip?: any;
    order?: any;
    includePayload?: any;
    companyId?: any;
    userId?: any;
    method?: any;
    path?: any;
    statusCode?: any;
    ip?: any;
    hasBody?: any;
    from?: any;
    to?: any;
  }) {
    const take = clamp(toInt(params.take, 50), 1, 200);
    const skip = clamp(toInt(params.skip, 0), 0, 10_000_000);
    const order: Order =
      String(params.order || "desc").toLowerCase() === "asc" ? "asc" : "desc";
    const includePayload = toBool(params.includePayload) === true;

    const requesterRole = String(params.requesterRole || "");
    const requesterCompanyId = params.requesterCompanyId ?? null;

    let effectiveCompanyId: string | null = null;

    if (requesterRole === "ADMIN_MASTER") {
      if (params.companyId && String(params.companyId).trim().length > 0) {
        effectiveCompanyId = String(params.companyId).trim();
      } else {
        effectiveCompanyId = null;
      }
    } else {
      effectiveCompanyId = requesterCompanyId ? String(requesterCompanyId) : null;
    }

    const where: any = {};

    if (effectiveCompanyId) where.companyId = effectiveCompanyId;
    if (params.userId) where.userId = String(params.userId).trim();
    if (params.method) where.method = String(params.method).trim().toUpperCase();
    if (params.path) {
      where.path = { contains: String(params.path).trim(), mode: "insensitive" };
    }
    if (params.ip) {
      where.ip = { contains: String(params.ip).trim(), mode: "insensitive" };
    }

    if (
      params.statusCode !== undefined &&
      params.statusCode !== null &&
      String(params.statusCode).trim() !== ""
    ) {
      const sc = toInt(params.statusCode, NaN);
      if (Number.isFinite(sc)) where.statusCode = sc;
    }

    const hb = toBool(params.hasBody);
    if (hb === true) where.bodyJson = { not: null };
    if (hb === false) where.bodyJson = null;

    const from = toDate(params.from);
    const to = toDate(params.to);

    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = from;
      if (to) where.createdAt.lte = to;
    }

    const select = this.baseSelect(includePayload);

    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: order },
        take,
        skip,
        select,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      meta: { total, take, skip, order, effectiveCompanyId, includePayload },
      items,
    };
  }

  async getById(
    id: string,
    params: { requesterRole: string; requesterCompanyId?: string | null; includePayload?: any },
  ) {
    const requesterRole = String(params.requesterRole || "");
    const requesterCompanyId = params.requesterCompanyId ?? null;
    const includePayload = toBool(params.includePayload) === true;

    const row = await this.prisma.auditLog.findUnique({
      where: { id },
      select: this.baseSelect(includePayload),
    });

    if (!row) return null;

    if (requesterRole !== "ADMIN_MASTER") {
      if (
        requesterCompanyId &&
        row.companyId &&
        String(row.companyId) !== String(requesterCompanyId)
      ) {
        return "__FORBIDDEN__";
      }
    }

    return row;
  }

  async deleteById(id: string) {
    return this.prisma.auditLog.delete({ where: { id } });
  }

  async purge(params: { days: number; companyId?: string | null }) {
    const days = clamp(toInt(params.days, 0), 1, 3650);
    const before = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const where: any = { createdAt: { lt: before } };
    if (params.companyId) where.companyId = String(params.companyId);

    const res = await this.prisma.auditLog.deleteMany({ where });
    return { deleted: res.count, before, companyId: params.companyId ?? null };
  }
}