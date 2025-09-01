import type { TSingleEvent, TSocketIOEvent } from '@/entities/event';
import type { TSocketIOMeta } from '../types';

const patchSocketIO = ({ pushEvent }: TArgs) => {
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

      patchSocketEmit({ Socket, pushEvent });
      patchSocketOn({ Socket, pushEvent });
      patchSocketOnAny({ Socket, pushEvent });
    } catch {
      patched.socketio = true;
    } finally {
      g.__API_RECORDER_SOCKETIO_PATCHING = false;
    }
  })();
};

export { patchSocketIO };

const patchSocketEmit = ({ Socket, pushEvent }: TPatchArgs) => {
  const g = globalThis as unknown as { __API_RECORDER_SOCKET_ORIG_EMIT?: typeof Socket.prototype.emit };
  if (!g.__API_RECORDER_SOCKET_ORIG_EMIT) {
    g.__API_RECORDER_SOCKET_ORIG_EMIT = Socket.prototype.emit;
  }
  const origEmit = g.__API_RECORDER_SOCKET_ORIG_EMIT;
  type EmitParams = Parameters<typeof origEmit>;
  type EmitReturn = ReturnType<typeof origEmit>;

  Socket.prototype.emit = function (this: typeof Socket.prototype, ...args: EmitParams): EmitReturn {
    const [ev, ...rest] = args as [string | symbol, ...unknown[]];
    const meta = ensureMeta({ socket: this });
    const ts = Date.now();

    const socketEvent: TSocketIOEvent = {
      id: `${meta.requestId}-c2s-${ts}`,
      kind: 'socketio',
      requestId: meta.requestId,
      timestamp: ts,
      url: meta.url,
      direction: 'clientToServer',
      namespace: meta.namespace,
      event: String(ev),
      data: rest,
    };
    pushEvent(socketEvent);

    return origEmit.apply(this, args as unknown as EmitParams);
  };
};

const patchSocketOn = ({ Socket, pushEvent }: TPatchArgs) => {
  const gOn = globalThis as unknown as { __API_RECORDER_SOCKET_ORIG_ON?: typeof Socket.prototype.on };
  if (!gOn.__API_RECORDER_SOCKET_ORIG_ON) {
    gOn.__API_RECORDER_SOCKET_ORIG_ON = Socket.prototype.on;
  }
  const origOn = gOn.__API_RECORDER_SOCKET_ORIG_ON;
  type OnParams = Parameters<typeof origOn>;
  type OnReturn = ReturnType<typeof origOn>;

  Socket.prototype.on = function (this: typeof Socket.prototype, ...args: OnParams): OnReturn {
    const [ev, listener] = args as [string | symbol, (...listenerArgs: unknown[]) => void];

    const wrappedListener = (...listenerArgs: unknown[]) => {
      const meta = ensureMeta({ socket: this });
      const ts = Date.now();

      if (String(ev) === 'connect_error') {
        // connect_error 이벤트를 reject 필드와 함께 기록
        const errorData = listenerArgs[0] as Error;

        const errorEvent: TSocketIOEvent = {
          id: `${meta.requestId}-s2c-${ts}`,
          kind: 'socketio',
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
        };
        pushEvent(errorEvent);
        return (listener as (...a: unknown[]) => unknown).apply(this as unknown as object, listenerArgs);
      }

      const socketEvent: TSocketIOEvent = {
        id: `${meta.requestId}-s2c-${ts}`,
        kind: 'socketio',
        requestId: meta.requestId,
        timestamp: ts,
        url: meta.url,
        direction: 'serverToClient',
        namespace: meta.namespace,
        event: String(ev),
        data: listenerArgs,
      };
      pushEvent(socketEvent);

      return (listener as (...a: unknown[]) => unknown).apply(this as unknown as object, listenerArgs);
    };

    return origOn.call(this, ev as OnParams[0], wrappedListener as OnParams[1]);
  };
};

const patchSocketOnAny = ({ Socket, pushEvent }: TPatchArgs) => {
  type OnAnyFn = (cb: (event: string, ...args: unknown[]) => void) => unknown;
  const maybeOnAny = (Socket.prototype as unknown as { onAny?: OnAnyFn }).onAny;

  if (!maybeOnAny) return;

  const gAny = globalThis as unknown as { __API_RECORDER_SOCKET_ORIG_ONANY?: OnAnyFn };
  if (!gAny.__API_RECORDER_SOCKET_ORIG_ONANY) {
    gAny.__API_RECORDER_SOCKET_ORIG_ONANY = maybeOnAny;
  }
  const origOnAny = gAny.__API_RECORDER_SOCKET_ORIG_ONANY;

  (Socket.prototype as unknown as { onAny: OnAnyFn }).onAny = function (
    this: typeof Socket.prototype,
    cb: (event: string, ...args: unknown[]) => void,
  ) {
    const wrapped = (event: string, ...args: unknown[]) => {
      const meta = ensureMeta({ socket: this });
      const ts = Date.now();

      const socketEvent: TSocketIOEvent = {
        id: `${meta.requestId}-s2c-${ts}`,
        kind: 'socketio',
        requestId: meta.requestId,
        timestamp: ts,
        url: meta.url,
        direction: 'serverToClient',
        namespace: meta.namespace,
        event,
        data: args,
      };
      pushEvent(socketEvent);

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
    const { url, namespace } = resolveSocketUrl(socket);
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
  pushEvent: (event: TSingleEvent) => void;
};

type TPatchArgs = {
  Socket: any;
  pushEvent: (event: TSingleEvent) => void;
};
