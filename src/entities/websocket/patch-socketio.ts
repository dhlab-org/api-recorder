import { Socket } from 'socket.io-client';
import { genReqId, nowMs } from '@/entities/http/utils';
import type { TRecEvent } from '@/shared/api';

let patched = false;

const patchSocketIO = ({ pushEvents }: TArgs) => {
  if (patched) return;
  patched = true;

  // Socket.prototype.emit 패치 (클라이언트 → 서버)
  const origEmit = Socket.prototype.emit;
  type EmitParams = Parameters<typeof origEmit>;
  type EmitReturn = ReturnType<typeof origEmit>;
  Socket.prototype.emit = function (this: Socket, ...args: EmitParams): EmitReturn {
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
  Socket.prototype.on = function (this: Socket, ...args: OnParams): OnReturn {
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
  type OnAnyFn = (cb: (event: string, ...args: unknown[]) => void) => Socket;
  const maybeOnAny = (Socket.prototype as unknown as { onAny?: OnAnyFn }).onAny;
  if (maybeOnAny) {
    (Socket.prototype as unknown as { onAny: OnAnyFn }).onAny = function (
      this: Socket,
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

const resolveSocketUrl = (socket: Socket): { url: string; namespace?: string } => {
  const s = socket as unknown as { io?: Record<string, unknown>; nsp?: string };
  const io = s.io;
  const namespace = s.nsp;
  const uri = (getProp(io, 'uri') as string | undefined) || (getProp(io, '_uri') as string | undefined);
  if (uri) {
    return { url: namespace && namespace !== '/' ? `${uri}${namespace}` : uri, namespace };
  }
  const opts = getProp(io, 'opts') as Record<string, unknown> | undefined;
  const hostname = (opts?.hostname as string | undefined) || '';
  const secure = (opts?.secure as boolean | undefined) || false;
  const port = opts?.port as string | number | undefined;
  const path = (opts?.path as string | undefined) || '';
  const scheme = secure ? 'wss' : 'ws';
  const base = hostname ? `${scheme}://${hostname}${port ? `:${port}` : ''}${path}` : '';
  return { url: namespace && namespace !== '/' ? `${base}${namespace}` : base, namespace };
};

const metaMap = new WeakMap<Socket, TSocketMeta>();
const ensureMeta = (socket: Socket): TSocketMeta => {
  let meta = metaMap.get(socket);
  if (!meta) {
    const info = resolveSocketUrl(socket);
    meta = { requestId: genReqId(), url: info.url, namespace: info.namespace };
    metaMap.set(socket, meta);
  }
  return meta;
};
