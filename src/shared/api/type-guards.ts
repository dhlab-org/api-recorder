import type { THttpRequestEvent, THttpResponseEvent, TRecEvent, TSSEEvent, TSocketIOEvent } from './events';

export const isHttpRequest = (event: TRecEvent): event is THttpRequestEvent =>
  event.protocol === 'http' && event.sender === 'client';

export const isHttpResponse = (event: TRecEvent): event is THttpResponseEvent =>
  event.protocol === 'http' && event.sender === 'server';

export const isSocketIOEvent = (event: TRecEvent): event is TSocketIOEvent => event.protocol === 'socketio';

export const isSSEEvent = (event: TRecEvent): event is TSSEEvent => event.protocol === 'sse';
