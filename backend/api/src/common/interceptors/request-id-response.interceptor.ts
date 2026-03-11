import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable } from "rxjs";

@Injectable()
export class RequestIdResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const req: any = ctx.getRequest();
    const res: any = ctx.getResponse();

    const requestId = req?.requestId;
    if (requestId && res?.setHeader) {
      res.setHeader("x-request-id", requestId);
    }

    return next.handle();
  }
}