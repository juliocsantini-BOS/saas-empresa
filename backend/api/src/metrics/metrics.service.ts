import { Injectable } from "@nestjs/common";

type RouteMetric = {
  count: number;
  totalMs: number;
  minMs: number;
  maxMs: number;
};

@Injectable()
export class MetricsService {
  private startedAt = new Date();

  private totalRequests = 0;
  private status2xx = 0;
  private status4xx = 0;
  private status5xx = 0;

  private routes = new Map<string, RouteMetric>();

  record(params: {
    method: string;
    path: string;
    statusCode: number;
    durationMs: number;
  }) {
    const method = String(params.method ?? "GET").toUpperCase();
    const path = String(params.path ?? "");
    const statusCode = Number(params.statusCode ?? 0);
    const durationMs = Number(params.durationMs ?? 0);

    this.totalRequests += 1;

    if (statusCode >= 200 && statusCode < 300) this.status2xx += 1;
    else if (statusCode >= 400 && statusCode < 500) this.status4xx += 1;
    else if (statusCode >= 500) this.status5xx += 1;

    const key = `${method} ${path}`;
    const prev = this.routes.get(key);

    if (!prev) {
      this.routes.set(key, {
        count: 1,
        totalMs: durationMs,
        minMs: durationMs,
        maxMs: durationMs,
      });
      return;
    }

    prev.count += 1;
    prev.totalMs += durationMs;
    prev.minMs = Math.min(prev.minMs, durationMs);
    prev.maxMs = Math.max(prev.maxMs, durationMs);

    this.routes.set(key, prev);
  }

  getJson() {
    const routes = Array.from(this.routes.entries())
      .map(([route, metric]) => ({
        route,
        count: metric.count,
        avgMs: metric.count > 0 ? Number((metric.totalMs / metric.count).toFixed(2)) : 0,
        minMs: metric.minMs,
        maxMs: metric.maxMs,
      }))
      .sort((a, b) => b.count - a.count);

    return {
      ok: true,
      startedAt: this.startedAt.toISOString(),
      uptimeSec: Math.floor((Date.now() - this.startedAt.getTime()) / 1000),
      totals: {
        requests: this.totalRequests,
        status2xx: this.status2xx,
        status4xx: this.status4xx,
        status5xx: this.status5xx,
      },
      routes,
    };
  }

  getPrometheusText() {
    const lines: string[] = [];

    lines.push("# HELP app_requests_total Total HTTP requests");
    lines.push("# TYPE app_requests_total counter");
    lines.push(`app_requests_total ${this.totalRequests}`);

    lines.push("# HELP app_requests_2xx_total Total HTTP 2xx responses");
    lines.push("# TYPE app_requests_2xx_total counter");
    lines.push(`app_requests_2xx_total ${this.status2xx}`);

    lines.push("# HELP app_requests_4xx_total Total HTTP 4xx responses");
    lines.push("# TYPE app_requests_4xx_total counter");
    lines.push(`app_requests_4xx_total ${this.status4xx}`);

    lines.push("# HELP app_requests_5xx_total Total HTTP 5xx responses");
    lines.push("# TYPE app_requests_5xx_total counter");
    lines.push(`app_requests_5xx_total ${this.status5xx}`);

    lines.push("# HELP app_uptime_seconds App uptime in seconds");
    lines.push("# TYPE app_uptime_seconds gauge");
    lines.push(`app_uptime_seconds ${Math.floor((Date.now() - this.startedAt.getTime()) / 1000)}`);

    for (const [route, metric] of this.routes.entries()) {
      const safeRoute = route.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
      const avg = metric.count > 0 ? metric.totalMs / metric.count : 0;

      lines.push(`app_route_requests_total{route="${safeRoute}"} ${metric.count}`);
      lines.push(`app_route_avg_ms{route="${safeRoute}"} ${avg.toFixed(2)}`);
      lines.push(`app_route_min_ms{route="${safeRoute}"} ${metric.minMs}`);
      lines.push(`app_route_max_ms{route="${safeRoute}"} ${metric.maxMs}`);
    }

    return lines.join("\n");
  }
}