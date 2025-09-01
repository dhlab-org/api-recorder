export type TState = {
  originalFetch: typeof window.fetch | null;
  xhrMetaMap: WeakMap<XMLHttpRequest, TXhrMeta>;
};

export type TSocketIOMeta = {
  requestId: string;
  url: string;
  namespace?: string;
};

export type TXhrMeta = {
  method?: string;
  url?: string;
  async?: boolean;
  headers: Record<string, string>;
  body?: unknown;
  requestId?: string;
  start?: number;
  __apiRecorderSuppress?: boolean;
};
