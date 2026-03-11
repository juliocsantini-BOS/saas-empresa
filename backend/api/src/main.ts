import "dotenv/config";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { Logger } from "nestjs-pino";
import { AppModule } from "./app.module";
import { RequestIdMiddleware } from "./common/middlewares/request-id.middleware";
import { RequestContextInterceptor } from "./common/interceptors/request-context.interceptor";
import { AuditInterceptor } from "./common/interceptors/audit.interceptor";
import { MetricsInterceptor } from "./common/interceptors/metrics.interceptor";
import { AuditService } from "./common/audit/audit.service";
import { MetricsService } from "./metrics/metrics.service";
import { GlobalHttpExceptionFilter } from "./common/filters/http-exception.filter";
import { RequestIdResponseInterceptor } from "./common/interceptors/request-id-response.interceptor";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  app.useLogger(app.get(Logger));

  app.use(cookieParser());
  app.use(require("express").json({ limit: process.env.BODY_LIMIT ?? "1mb" }));
  app.use(
    require("express").urlencoded({
      extended: true,
      limit: process.env.BODY_LIMIT ?? "1mb",
    })
  );

  const isProd = process.env.NODE_ENV === "production";

  app.use(
    helmet({
      contentSecurityPolicy: isProd ? undefined : false,
      crossOriginEmbedderPolicy: isProd ? undefined : false,
    })
  );

  app.use((req, res, next) => new RequestIdMiddleware().use(req, res, next));

  const httpApp: any = app.getHttpAdapter().getInstance();
  if (httpApp && typeof httpApp.set === "function") {
    httpApp.set("trust proxy", 1);
  }

  const auditService = app.get(AuditService);
  const metricsService = app.get(MetricsService);

  app.useGlobalInterceptors(
    new RequestContextInterceptor(),
    new MetricsInterceptor(metricsService),
    new AuditInterceptor(auditService),
    new RequestIdResponseInterceptor()
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
    })
  );

  app.useGlobalFilters(new GlobalHttpExceptionFilter());

  const devOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
  ];

  const prodOrigins = (process.env.CORS_ORIGINS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const allowedOrigins = isProd ? prodOrigins : devOrigins;

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"), false);
    },
    credentials: true,
  });

  const port = Number(process.env.PORT || 3000);
  await app.listen(port, "0.0.0.0");

  app.get(Logger).log(
    `API listening on port ${port} (NODE_ENV=${process.env.NODE_ENV ?? "undefined"})`
  );
}
bootstrap();