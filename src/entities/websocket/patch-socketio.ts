import { Socket } from 'socket.io-client';
import type { TRecEvent } from '@/shared/api';

let patched = false;

const patchSocketIO = ({ pushEvents }: TArgs) => {
  if (patched) return;
  patched = true;

  // Socket.prototype.emit 패치
  const origEmit = Socket.prototype.emit;
  Socket.prototype.emit = function (event: any, ...args: any[]) {
    pushEvents({
      id: `${Math.random().toString(36).slice(2)}-req`,
      sender: 'client',
      protocol: 'socketio',
      event: String(event),
      data: args,
      delayMs: 0,
    });
    return origEmit.call(this, event, ...args);
  };

  // Socket.prototype.on 패치 (수신 이벤트 가로채기)
  const origOn = Socket.prototype.on;
  Socket.prototype.on = function (event: any, listener: (...args: any[]) => void) {
    const wrappedListener = (...args: any[]) => {
      pushEvents({
        id: `${Math.random().toString(36).slice(2)}-res`,
        sender: 'server',
        protocol: 'socketio',
        event: String(event),
        data: args,
        delayMs: 0,
      });
      return listener.apply(this, args);
    };
    return origOn.call(this, event, wrappedListener);
  };

  // Socket.prototype.onAny 패치 (모든 이벤트 가로채기)
  const origOnAny = (Socket.prototype as any).onAny;
  if (origOnAny) {
    (Socket.prototype as any).onAny = function (cb: any) {
      const wrapped = (event: string, ...args: any[]) => {
        pushEvents({
          id: `${Math.random().toString(36).slice(2)}-res`,
          sender: 'server',
          protocol: 'socketio',
          event,
          data: args,
          delayMs: 0,
        });
        cb(event, ...args);
      };
      return origOnAny.call(this, wrapped);
    };
  }
};

export { patchSocketIO };

type TArgs = {
  pushEvents: (e: TRecEvent) => void;
};
