import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { finalize } from "rxjs/operators";
import { MetricsService } from "../../metrics/metrics.service";

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metrics: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() !== "http") {
      return next.handle();
    }

    const http = context.switchToHttp();
    const req: any = http.getRequest();
    const res: any = http.getResponse();

    const method = String(req?.method ?? "GET").toUpperCase();
    const path = String(req?.route?.path ?? req?.originalUrl ?? req?.url ?? "");
    const startedAt = Date.now();

    const shouldSkip = path.startsWith("/metrics");

    if (shouldSkip) {
      return next.handle();
    }

    return next.handle().pipe(
      finalize(() => {
        const statusCode =
          Number(res?.statusCode) && Number.isFinite(Number(res?.statusCode))
            ? Number(res.statusCode)
            : 200;

        const durationMs = Date.now() - startedAt;

        this.metrics.record({
          method,
          path,
          statusCode,
          durationMs,
        });
      }),
    );
  }
}