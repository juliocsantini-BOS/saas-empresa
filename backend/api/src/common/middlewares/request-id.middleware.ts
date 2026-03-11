import { Injectable, NestMiddleware } from "@nestjs/common";
import { randomUUID } from "crypto";

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    const incoming = req?.headers?.["x-request-id"];

    const rid =
      typeof incoming === "string" && incoming.trim().length > 0
        ? incoming.trim()
        : randomUUID();

    // padrão do seu projeto
    req.requestId = rid;

    // padrão usado pelo Pino
    req.id = rid;

    // retorna no header da resposta
    if (res?.setHeader) {
      res.setHeader("x-request-id", rid);
    }

    next();
  }
}