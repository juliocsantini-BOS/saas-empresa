import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Request, Response } from "express";

@Catch()
export class GlobalHttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request & { requestId?: string }>();
    const res = ctx.getResponse<Response>();

    const requestId =
      (req as any)?.requestId ||
      (req.headers["x-request-id"] as string | undefined) ||
      undefined;

    const path = req.originalUrl || req.url;
    const method = req.method;

    // Default
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: any = "Internal server error";
    let error = "InternalServerError";

    // HttpException (Nest)
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const response = exception.getResponse() as any;

      // Nest pode retornar string ou objeto
      if (typeof response === "string") {
        message = response;
      } else {
        message = response?.message ?? response ?? message;
        error = response?.error ?? exception.name ?? error;
      }
    } else if (exception instanceof Error) {
      // Erro genérico
      message = exception.message || message;
      error = exception.name || error;
    }

    // Normaliza message para string ou array
    // (ValidationPipe geralmente manda array de strings)
    const normalizedMessage =
      Array.isArray(message) || typeof message === "string"
        ? message
        : JSON.stringify(message);

    const payload = {
      statusCode: status,
      error,
      message: normalizedMessage,
      requestId,
      path,
      method,
      ts: new Date().toISOString(),
    };

    // Evita tentar responder duas vezes
    if (res.headersSent) return;

    // Log básico (sem vazar stack pro cliente)
    // stack fica no console/server, não no response
    if (status >= 500) {
      // eslint-disable-next-line no-console
      console.error("[HTTP_ERROR]", {
        requestId,
        path,
        method,
        status,
        error,
        message: normalizedMessage,
        stack: exception instanceof Error ? exception.stack : undefined,
      });
    } else {
      // eslint-disable-next-line no-console
      console.warn("[HTTP_WARN]", {
        requestId,
        path,
        method,
        status,
        error,
        message: normalizedMessage,
      });
    }

    res.status(status).json(payload);
  }
}