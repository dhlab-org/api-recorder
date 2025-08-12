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
