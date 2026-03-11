type Bucket = {
  hits: number;
  resetAt: number;
};

type HitResult = {
  ok: boolean;
  retryAfterMs: number;
  remaining: number;
  limit: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

function nowMs() {
  return Date.now();
}

function normalizeKeyPart(value: any): string {
  const v = String(value ?? "").trim();
  return v.length > 0 ? v : "unknown";
}

function getOrCreateBucket(key: string, windowMs: number): Bucket {
  const now = nowMs();
  const current = buckets.get(key);

  if (!current || now >= current.resetAt) {
    const fresh = {
      hits: 0,
      resetAt: now + windowMs,
    };
    buckets.set(key, fresh);
    return fresh;
  }

  return current;
}

function cleanupExpiredBuckets() {
  const now = nowMs();
  for (const [key, bucket] of buckets) {
    if (now >= bucket.resetAt) {
      buckets.delete(key);
    }
  }
}

// limpeza automática
setInterval(() => {
  cleanupExpiredBuckets();
}, 60_000);

export function hitRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): HitResult {
  const safeLimit = Number.isFinite(limit) ? Math.max(1, Math.floor(limit)) : 1;
  const safeWindowMs = Number.isFinite(windowMs) ? Math.max(1000, Math.floor(windowMs)) : 60_000;

  const bucket = getOrCreateBucket(key, safeWindowMs);
  const now = nowMs();

  if (bucket.hits >= safeLimit) {
    return {
      ok: false,
      retryAfterMs: Math.max(0, bucket.resetAt - now),
      remaining: 0,
      limit: safeLimit,
      resetAt: bucket.resetAt,
    };
  }

  bucket.hits += 1;
  buckets.set(key, bucket);

  return {
    ok: true,
    retryAfterMs: 0,
    remaining: Math.max(0, safeLimit - bucket.hits),
    limit: safeLimit,
    resetAt: bucket.resetAt,
  };
}

export function buildRateLimitKey(parts: {
  scope: string;
  route?: string;
  ip?: string | null;
  userId?: string | null;
  tenantId?: string | null;
}) {
  const scope = normalizeKeyPart(parts.scope);
  const route = normalizeKeyPart(parts.route ?? "default");
  const ip = normalizeKeyPart(parts.ip ?? "unknown");
  const userId = normalizeKeyPart(parts.userId ?? "anonymous");
  const tenantId = normalizeKeyPart(parts.tenantId ?? "no-tenant");

  return `${scope}|route:${route}|ip:${ip}|user:${userId}|tenant:${tenantId}`;
}

export function hitMultiRateLimit(configs: Array<{
  key: string;
  limit: number;
  windowMs: number;
}>): HitResult {
  let blocked: HitResult | null = null;

  for (const cfg of configs) {
    const result = hitRateLimit(cfg.key, cfg.limit, cfg.windowMs);
    if (!result.ok) {
      blocked = result;
      break;
    }
  }

  if (blocked) return blocked;

  const last = configs[configs.length - 1];
  return {
    ok: true,
    retryAfterMs: 0,
    remaining: -1,
    limit: last?.limit ?? 0,
    resetAt: Date.now(),
  };
}

export function getRateLimitSnapshot() {
  cleanupExpiredBuckets();

  return {
    totalBuckets: buckets.size,
    items: Array.from(buckets.entries())
      .slice(0, 1000)
      .map(([key, bucket]) => ({
        key,
        hits: bucket.hits,
        resetAt: bucket.resetAt,
        retryAfterMs: Math.max(0, bucket.resetAt - Date.now()),
      })),
  };
}