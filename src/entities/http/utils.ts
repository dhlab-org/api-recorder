export type IgnoreMatcher = Array<string | RegExp> | ((url: string) => boolean);

export const buildIgnore = (ignore?: IgnoreMatcher) => {
  if (!ignore) return (_url: string) => false;

  if (typeof ignore === 'function') return ignore;

  const parts = ignore.map(p => (typeof p === 'string' ? new RegExp(`^${escapeRegex(p)}`) : p));
  return (url: string) => parts.some(re => re.test(url));
};

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const nowMs = () => Date.now();

export const genReqId = () => Math.random().toString(36).slice(2);

/** Headers/객체/배열 → 평범한 레코드 */
export const toHeaderRecord = (
  input: Headers | Record<string, string | number | boolean> | [string, string][] | undefined,
): Record<string, string> | undefined => {
  if (!input) return undefined;

  const out: Record<string, string> = {};
  if (input instanceof Headers) {
    for (const [k, v] of input.entries()) out[k] = v;
    return out;
  }
  if (Array.isArray(input)) {
    for (const [k, v] of input) out[k] = String(v);
    return out;
  }
  for (const [k, v] of Object.entries(input)) out[k] = String(v);
  return out;
};

/** content-type 힌트로 JSON/text 파싱 시도 */
export const tryReadBody = async (res: Response): Promise<unknown | undefined> => {
  const type = res.headers.get('content-type') || '';
  const clone = res.clone();
  try {
    if (type.includes('application/json')) return await clone.json();
    if (type.startsWith('text/')) return await clone.text();
  } catch {
    // ignore
  }
  return undefined;
};

export const parseRawHeaders = (raw: string): Record<string, string> => {
  const out: Record<string, string> = {};
  raw
    .trim()
    .split(/[\r\n]+/)
    .forEach(line => {
      const idx = line.indexOf(':');
      if (idx > -1) {
        const k = line.slice(0, idx).trim().toLowerCase();
        const v = line.slice(idx + 1).trim();
        if (k) out[k] = v;
      }
    });
  return out;
};

/** fetch/XHR 공용 Body 클로너 (사용자 제공 버전 포함) */
export const cloneBody = async (body: BodyInit): Promise<unknown> => {
  if (typeof body === 'string') return body;

  if (body instanceof FormData) {
    const result: Record<string, unknown> = {};
    body.forEach((value, key) => {
      result[key] = value instanceof File ? `[File: ${value.name}]` : value;
    });
    return result;
  }

  if (body instanceof URLSearchParams) {
    return Object.fromEntries(body.entries());
  }

  if (body instanceof ArrayBuffer) {
    return `[Binary data: ${body.byteLength} bytes]`;
  }

  if (body instanceof Uint8Array) {
    return `[Binary data: ${body.byteLength} bytes]`;
  }

  // Blob, ReadableStream 등 기타 케이스
  return '[Unknown body type]';
};
