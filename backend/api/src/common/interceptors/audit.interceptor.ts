import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { finalize } from "rxjs/operators";
import { AuditService } from "../audit/audit.service";

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly audit: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() !== "http") {
      return next.handle();
    }

    const http = context.switchToHttp();
    const req: any = http.getRequest();
    const res: any = http.getResponse();

    const method = String(req?.method ?? "GET").toUpperCase();
    const path = String(req?.originalUrl ?? req?.url ?? "");
    const startedAt = Date.now();

    const shouldSkip =
      method === "OPTIONS" ||
      path.startsWith("/health") ||
      path.startsWith("/v1/admin/health");

    if (shouldSkip) {
      return next.handle();
    }

    // ✅ captura cedo para não depender do ALS no finalize
    const requestId =
      req?.id ||
      req?.requestId ||
      req?.headers?.["x-request-id"] ||
      req?.headers?.["x-correlation-id"] ||
      null;

    const userId = req?.user?.id ?? null;
    const companyId = req?.user?.companyId ?? null;

    const xf = (req?.headers?.["x-forwarded-for"] as string | undefined)
      ?.split(",")[0]
      ?.trim();

    const ip =
      xf ||
      req?.socket?.remoteAddress ||
      req?.ip ||
      null;

    const userAgent =
      req?.headers?.["user-agent"] ? String(req.headers["user-agent"]) : null;

    return next.handle().pipe(
      finalize(() => {
        const statusCode =
          Number(res?.statusCode) && Number.isFinite(Number(res?.statusCode))
            ? Number(res.statusCode)
            : 200;

        const durationMs = Date.now() - startedAt;

        void this.audit.log({
          requestId,
          userId,
          companyId,
          method,
          path,
          statusCode,
          ip,
          userAgent,
          durationMs,
          body: req?.body,
          query: req?.query,
          params: req?.params,
        });
      }),
    );
  }
}