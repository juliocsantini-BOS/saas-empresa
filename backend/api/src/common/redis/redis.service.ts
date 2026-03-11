import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import Redis from "ioredis";

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client!: Redis;

  onModuleInit() {
    const url = process.env.REDIS_URL || "redis://localhost:6379";

    this.client = new Redis(url, {
      // produção: mantenha estável atrás de rede ruim
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: false,
    });
  }

  onModuleDestroy() {
    try {
      return this.client?.quit?.();
    } catch {
      // ignore
    }
  }

  get raw() {
    return this.client;
  }

  async getJson<T>(key: string): Promise<T | null> {
    const v = await this.client.get(key);
    if (!v) return null;
    try {
      return JSON.parse(v) as T;
    } catch {
      return null;
    }
  }

  async setJson(key: string, value: any, ttlSec: number) {
    const payload = JSON.stringify(value);
    if (ttlSec > 0) {
      await this.client.set(key, payload, "EX", ttlSec);
    } else {
      await this.client.set(key, payload);
    }
  }

  async del(key: string) {
    await this.client.del(key);
  }

  /**
   * ✅ NOVO: remove várias keys por pattern usando SCAN (seguro em produção).
   * Ex: await redis.delPattern("rbac:perms:v2:COMPANY_ID:*")
   */
  async delPattern(pattern: string): Promise<number> {
    let cursor = "0";
    let deleted = 0;

    do {
      const [next, keys] = await this.client.scan(
        cursor,
        "MATCH",
        pattern,
        "COUNT",
        200,
      );

      cursor = next;

      if (keys.length > 0) {
        const n = await this.client.del(...keys);
        deleted += n;
      }
    } while (cursor !== "0");

    return deleted;
  }
}