import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { RequestContext } from "../request-context/request-context";

type AnyObj = Record<string, any>;

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  private safeClone(input: any, maxDepth = 6, maxString = 2000): any {
    const seen = new WeakSet();

    const walk = (v: any, depth: number): any => {
      if (v === null || v === undefined) return v;
      if (typeof v === "string") {
        return v.length > maxString ? v.slice(0, maxString) + "[truncated]" : v;
      }
      if (typeof v === "number" || typeof v === "boolean") return v;
      if (typeof v === "bigint") return v.toString();
      if (typeof v === "function") return "[Function]";
      if (v instanceof Date) return v.toISOString();
      if (typeof v !== "object") return String(v);
      if (seen.has(v)) return "[Circular]";
      seen.add(v);
      if (depth <= 0) return "[MaxDepth]";
      if (Array.isArray(v)) return v.slice(0, 50).map((x) => walk(x, depth - 1));

      const out: AnyObj = {};
      const entries = Object.entries(v).slice(0, 100);
      for (const [k, val] of entries) out[k] = walk(val, depth - 1);
      return out;
    };

    return walk(input, maxDepth);
  }

  private redact(obj: any): any {
    if (!obj) return obj;

    const SENSITIVE_KEYS = new Set([
      "password",
      "pass",
      "senha",
      "token",
      "access_token",
      "refresh_token",
      "authorization",
      "cookie",
      "cookies",
      "secret",
      "client_secret",
      "jwt",
    ]);

    const walk = (v: any): any => {
      if (v === null || v === undefined) return v;
      if (typeof v !== "object") return v;
      if (Array.isArray(v)) return v.map(walk);

      const out: AnyObj = {};
      for (const [k, val] of Object.entries(v)) {
        const key = String(k).toLowerCase();
        if (
          SENSITIVE_KEYS.has(key) ||
          key.includes("token") ||
          key.includes("password") ||
          key.includes("cookie") ||
          key.includes("secret") ||
          key.includes("authorization")
        ) {
          out[k] = "[REDACTED]";
        } else {
          out[k] = walk(val);
        }
      }
      return out;
    };

    return walk(obj);
  }

  private attachAuditMeta(value: any, meta: AnyObj) {
    if (value === null || value === undefined) {
      return { _audit: meta };
    }

    if (typeof value === "object" && !Array.isArray(value)) {
      return {
        ...value,
        _audit: meta,
      };
    }

    return {
      value,
      _audit: meta,
    };
  }

  async log(entry: {
    requestId?: string | null;
    userId?: string | null;
    companyId?: string | null;
    method: string;
    path: string;
    statusCode: number;
    ip?: string | null;
    userAgent?: string | null;
    durationMs: number;
    body?: any;
    query?: any;
    params?: any;
  }) {
    try {
      const ctx = RequestContext.get();

      const auditMeta = {
        requestContextIsSystem: ctx?.isSystem === true,
        systemSource: ctx?.systemSource ?? null,
      };

      const bodySafe = entry.body
        ? this.attachAuditMeta(this.redact(this.safeClone(entry.body)), auditMeta)
        : this.attachAuditMeta(null, auditMeta);

      const querySafe = entry.query
        ? this.attachAuditMeta(this.redact(this.safeClone(entry.query)), auditMeta)
        : this.attachAuditMeta(null, auditMeta);

      const paramsSafe = entry.params
        ? this.attachAuditMeta(this.redact(this.safeClone(entry.params)), auditMeta)
        : this.attachAuditMeta(null, auditMeta);

      await RequestContext.run(
        {
          requestId: entry.requestId ?? undefined,
          userId: entry.userId ?? undefined,
          companyId: entry.companyId ?? null,
          isSystem: true,
          systemSource: "audit.write",
        },
        async () => {
          await this.prisma.auditLog.create({
            data: {
              requestId: entry.requestId ?? null,
              userId: entry.userId ?? null,
              companyId: entry.companyId ?? null,
              method: entry.method,
              path: entry.path,
              statusCode: entry.statusCode,
              ip: entry.ip ?? null,
              userAgent: entry.userAgent ?? null,
              durationMs: entry.durationMs,
              bodyJson: bodySafe,
              queryJson: querySafe,
              paramsJson: paramsSafe,
            },
          });
        },
      );
    } catch (err) {
      console.error("[AUDIT_LOG_ERROR]", err);
    }
  }
}