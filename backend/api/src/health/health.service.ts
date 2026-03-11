import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import Redis from "ioredis";

@Injectable()
export class HealthService {
  private redis: Redis;

  constructor(private prisma: PrismaService) {
    this.redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
      maxRetriesPerRequest: 1,
    });
  }

  async check() {
    const startedAt = Date.now();

    // DB check
    await this.prisma.$queryRaw`SELECT 1`;

    // Redis check
    const pong = await this.redis.ping();
    if (pong !== "PONG") throw new Error("Redis not OK");

    return {
      ok: true,
      uptimeSec: Math.floor(process.uptime()),
      ms: Date.now() - startedAt,
      db: "ok",
      redis: "ok",
      ts: new Date().toISOString(),
    };
  }
}
