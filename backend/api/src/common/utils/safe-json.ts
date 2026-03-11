const SENSITIVE_KEYS = new Set([
  "password",
  "pass",
  "senha",
  "token",
  "refresh_token",
  "access_token",
  "authorization",
  "cookie",
]);

function redact(value: any): any {
  if (value == null) return value;

  if (Array.isArray(value)) return value.map(redact);

  if (typeof value === "object") {
    const out: any = {};
    for (const [k, v] of Object.entries(value)) {
      const key = String(k).toLowerCase();
      if (SENSITIVE_KEYS.has(key)) out[k] = "[REDACTED]";
      else out[k] = redact(v);
    }
    return out;
  }

  return value;
}

export function safeJson(obj: any): any {
  try {
    return redact(obj);
  } catch {
    return undefined;
  }
}
