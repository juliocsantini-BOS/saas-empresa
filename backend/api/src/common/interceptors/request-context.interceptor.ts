import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable } from "rxjs";
import { RequestContext } from "../request-context/request-context";

@Injectable()
export class RequestContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp();
    const req: any = http.getRequest();

    const requestId =
      req.id || // ✅ pino-http / nestjs-pino
      req.requestId ||
      req.headers?.["x-request-id"] ||
      req.headers?.["x-correlation-id"] ||
      undefined;

    const xf = (req.headers?.["x-forwarded-for"] as string | undefined)?.split(",")[0]?.trim();
    const ip = xf || req.socket?.remoteAddress || req.ip || undefined;

    // req.user só existe depois do JwtAuthGuard (mas no login não tem)
    const user = req.user;

    return RequestContext.run(
      {
        requestId,
        ip,
        userId: user?.id,
        role: user?.role,
        companyId: user?.companyId ?? null,
      },
      () => next.handle(),
    );
  }
}