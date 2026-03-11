import { AsyncLocalStorage } from "node:async_hooks";

export type RequestContextData = {
  requestId?: string;
  ip?: string;
  userId?: string;
  role?: string;
  companyId?: string | null;
  isSystem?: boolean;
  systemSource?: string | null;
  [key: string]: any;
};

const als = new AsyncLocalStorage<RequestContextData>();

export const RequestContext = {
  run<T>(data: RequestContextData, fn: () => T) {
    return als.run(data, fn);
  },

  get(): RequestContextData {
    return als.getStore() ?? {};
  },

  set(patch: Partial<RequestContextData>) {
    const store = als.getStore();
    if (store) {
      Object.assign(store, patch);
      return;
    }
    als.enterWith({ ...(patch as any) });
  },
};