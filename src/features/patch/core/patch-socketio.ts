import type { TRecEvent } from '@/shared/api';
import type { TSocketIOMeta } from '../types';

const patchSocketIO = ({ pushEvents }: TArgs) => {
  const g = globalThis as unknown as {
    __API_RECORDER_PATCHED?: { fetch: boolean; xhr: boolean; socketio: boolean };
    __API_RECORDER_SOCKETIO_PATCHING?: boolean;
    __API_RECORDER_HAS_SOCKET_IO?: boolean;
  };

  let patched = g.__API_RECORDER_PATCHED;
  if (!patched) {
    patched = { fetch: false, xhr: false, socketio: false };
    g.__API_RECORDER_PATCHED = patched;
  }
  if (patched.socketio || g.__API_RECORDER_SOCKETIO_PATCHING) return;

  g.__API_RECORDER_SOCKETIO_PATCHING = true;

  void (async () => {
    try {
      const { Socket } = await import('socket.io-client');

      g.__API_RECORDER_HAS_SOCKET_IO = true;
      patched.socketio = true;

      patchSocketEmit({ Socket, pushEvents });
      patchSocketOn({ Socket, pushEvents });
      patchSocketOnAny({ Socket, pushEvents });
    } catch (error) {
      console.warn('Failed to patch Socket.IO:', error);
      patched.socketio = true;
    } finally {
      g.__API_RECORDER_SOCKETIO_PATCHING = false;
    }
  })();
};

export { patchSocketIO };

const patchSocketEmit = ({ Socket, pushEvents }: TPatchArgs) => {
  const g = globalThis as unknown as { __API_RECORDER_SOCKET_ORIG_EMIT?: typeof Socket.prototype.emit };
  if (!g.__API_RECORDER_SOCKET_ORIG_EMIT) {
    g.__API_RECORDER_SOCKET_ORIG_EMIT = Socket.prototype.emit;
  }
  const origEmit = g.__API_RECORDER_SOCKET_ORIG_EMIT;
  type EmitParams = Parameters<typeof origEmit>;
  type EmitReturn = ReturnType<typeof origEmit>;

  Socket.prototype.emit = function (this: any, ...args: EmitParams): EmitReturn {
    const [ev, ...rest] = args as [string | symbol, ...unknown[]];
    const meta = ensureMeta({ socket: this });
    const ts = Date.now();

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
};

const patchSocketOn = ({ Socket, pushEvents }: TPatchArgs) => {
  const gOn = globalThis as unknown as { __API_RECORDER_SOCKET_ORIG_ON?: typeof Socket.prototype.on };
  if (!gOn.__API_RECORDER_SOCKET_ORIG_ON) {
    gOn.__API_RECORDER_SOCKET_ORIG_ON = Socket.prototype.on;
  }
  const origOn = gOn.__API_RECORDER_SOCKET_ORIG_ON;
  type OnParams = Parameters<typeof origOn>;
  type OnReturn = ReturnType<typeof origOn>;

  Socket.prototype.on = function (this: any, ...args: OnParams): OnReturn {
    const [ev, listener] = args as [string | symbol, (...listenerArgs: unknown[]) => void];

    const wrappedListener = (...listenerArgs: unknown[]) => {
      const meta = ensureMeta({ socket: this });
      const ts = Date.now();

      if (String(ev) === 'connect_error') {
        // connect_error 이벤트를 reject 필드와 함께 기록
        const errorData = listenerArgs[0] as Error;

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
          reject: {
            message: errorData?.message || 'Connection failed',
            afterMs: 1000,
            code: errorData?.name || 'CONNECT_ERROR',
          },
        });
        return (listener as (...a: unknown[]) => unknown).apply(this as unknown as object, listenerArgs);
      }

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
};

const patchSocketOnAny = ({ Socket, pushEvents }: TPatchArgs) => {
  type OnAnyFn = (cb: (event: string, ...args: unknown[]) => void) => any;
  const maybeOnAny = (Socket.prototype as unknown as { onAny?: OnAnyFn }).onAny;

  if (!maybeOnAny) return;

  const gAny = globalThis as unknown as { __API_RECORDER_SOCKET_ORIG_ONANY?: OnAnyFn };
  if (!gAny.__API_RECORDER_SOCKET_ORIG_ONANY) {
    gAny.__API_RECORDER_SOCKET_ORIG_ONANY = maybeOnAny;
  }
  const origOnAny = gAny.__API_RECORDER_SOCKET_ORIG_ONANY;

  (Socket.prototype as unknown as { onAny: OnAnyFn }).onAny = function (
    this: any,
    cb: (event: string, ...args: unknown[]) => void,
  ) {
    const wrapped = (event: string, ...args: unknown[]) => {
      const meta = ensureMeta({ socket: this });
      const ts = Date.now();

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

    return origOnAny.call(this, wrapped);
  } as OnAnyFn;
};

const getProp = (obj: unknown, key: string): unknown =>
  obj && typeof obj === 'object' ? (obj as Record<string, unknown>)[key] : undefined;

const resolveSocketUrl = (socket: unknown): { url: string; namespace?: string } => {
  const io = getProp(socket, 'io') as { uri?: string; nsp?: string } | undefined;

  if (io?.uri) {
    return {
      url: io.uri,
      namespace: io.nsp !== '/' ? io.nsp : undefined,
    };
  }

  return { url: 'ws://localhost', namespace: undefined };
};

const ensureMeta = ({ socket }: { socket: unknown }): TSocketIOMeta => {
  const g = globalThis as unknown as { __API_RECORDER_SOCKETIO_META?: WeakMap<object, TSocketIOMeta> };
  if (!g.__API_RECORDER_SOCKETIO_META) g.__API_RECORDER_SOCKETIO_META = new WeakMap();
  const map = g.__API_RECORDER_SOCKETIO_META;

  const key = socket && typeof socket === 'object' ? (socket as object) : ({} as object);
  let meta = map.get(key);
  if (!meta) {
    const { url, namespace } = resolveSocketUrl(socket as any);
    meta = {
      requestId: Math.random().toString(36).slice(2),
      url,
      namespace,
    };
    map.set(key, meta);
  }
  return meta;
};

type TArgs = {
  pushEvents: (event: TRecEvent) => void;
};

type TPatchArgs = {
  Socket: any;
  pushEvents: (event: TRecEvent) => void;
};
