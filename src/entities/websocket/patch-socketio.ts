import { genReqId, nowMs } from '@/entities/http/utils';
import type { TRecEvent } from '@/shared/api';
import { isSocketIOAvailable } from './ui/socketio-install-prompt';

let patched = false;

const socketMetaMap = new WeakMap<any, TSocketMeta>();

const patchSocketIO = ({ pushEvents }: TArgs) => {
  if (patched) return;

  if (!isSocketIOAvailable()) {
    console.warn('socket.io-client is not installed. Socket.IO recording is disabled.');
    patched = true;
    return;
  }

  try {
    const { Socket } = require('socket.io-client');

    patched = true;

    // Socket.prototype.emit 패치 (클라이언트 → 서버)
    const origEmit = Socket.prototype.emit;
    type EmitParams = Parameters<typeof origEmit>;
    type EmitReturn = ReturnType<typeof origEmit>;
    Socket.prototype.emit = function (this: any, ...args: EmitParams): EmitReturn {
      const [ev, ...rest] = args as [string | symbol, ...unknown[]];
      const meta = ensureMeta(this);
      const ts = nowMs();
      pushEvents({
        id: `${meta.requestId}-c2s-${ts}`,
        protocol: 'socketio',
        requestId: meta.requestId,
        timestamp: ts,
        url: meta.url,
        direction: 'clientToServer',
        namespace: meta.namespace,
        event: String(ev),
        data: rest,
      });
      return origEmit.apply(this, args as unknown as EmitParams);
    };

    // Socket.prototype.on 패치 (서버 → 클라이언트)
    const origOn = Socket.prototype.on;
    type OnParams = Parameters<typeof origOn>;
    type OnReturn = ReturnType<typeof origOn>;
    Socket.prototype.on = function (this: any, ...args: OnParams): OnReturn {
      const [ev, listener] = args as [string | symbol, (...listenerArgs: unknown[]) => void];
      const wrappedListener = (...listenerArgs: unknown[]) => {
        const meta = ensureMeta(this);
        const ts = nowMs();
        pushEvents({
          id: `${meta.requestId}-s2c-${ts}`,
          protocol: 'socketio',
          requestId: meta.requestId,
          timestamp: ts,
          url: meta.url,
          direction: 'serverToClient',
          namespace: meta.namespace,
          event: String(ev),
          data: listenerArgs,
        });
        return (listener as (...a: unknown[]) => unknown).apply(this as unknown as object, listenerArgs);
      };
      return origOn.call(this, ev as OnParams[0], wrappedListener as OnParams[1]);
    };

    // Socket.prototype.onAny 패치 (옵션: 모든 서버 → 클라이언트 이벤트 가로채기)
    type OnAnyFn = (cb: (event: string, ...args: unknown[]) => void) => any;
    const maybeOnAny = (Socket.prototype as unknown as { onAny?: OnAnyFn }).onAny;
    if (maybeOnAny) {
      (Socket.prototype as unknown as { onAny: OnAnyFn }).onAny = function (
        this: any,
        cb: (event: string, ...args: unknown[]) => void,
      ) {
        const wrapped = (event: string, ...args: unknown[]) => {
          const meta = ensureMeta(this);
          const ts = nowMs();
          pushEvents({
            id: `${meta.requestId}-s2c-${ts}`,
            protocol: 'socketio',
            requestId: meta.requestId,
            timestamp: ts,
            url: meta.url,
            direction: 'serverToClient',
            namespace: meta.namespace,
            event,
            data: args,
          });
          cb(event, ...args);
        };
        return maybeOnAny.call(this, wrapped);
      } as OnAnyFn;
    }
  } catch (error) {
    console.warn('Failed to patch Socket.IO:', error);
    patched = true;
  }
};

export { patchSocketIO };

type TArgs = {
  pushEvents: (e: TRecEvent) => void;
};

type TSocketMeta = {
  requestId: string;
  url: string;
  namespace?: string;
};

const getProp = (obj: unknown, key: string): unknown =>
  obj && typeof obj === 'object' ? (obj as Record<string, unknown>)[key] : undefined;

const resolveSocketUrl = (socket: any): { url: string; namespace?: string } => {
  // Socket.IO의 내부 구조에서 URL과 네임스페이스 추출
  const io = getProp(socket, 'io') as unknown as { uri: string; nsp: string };
  if (io?.uri) {
    return {
      url: io.uri,
      namespace: io.nsp !== '/' ? io.nsp : undefined,
    };
  }

  // fallback: 기본값
  return {
    url: 'ws://localhost',
    namespace: undefined,
  };
};

const ensureMeta = (socket: any): TSocketMeta => {
  if (!socketMetaMap.has(socket)) {
    const { url, namespace } = resolveSocketUrl(socket);
    const meta: TSocketMeta = {
      requestId: genReqId(),
      url,
      namespace,
    };
    socketMetaMap.set(socket, meta);
  }

  return socketMetaMap.get(socket)!;
};
