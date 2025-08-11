export type THTTPRestGroup = {
  requestId: string;
  type: 'http-rest';
  request: THTTPRequest;
  response?: THTTPResponse;
  /** 요청 시작부터 응답 완료까지의 총 시간(ms) */
  totalDuration?: number;
};

export type THTTPStreamGroup = {
  requestId: string;
  type: 'http-stream';
  /** 초기 HTTP 요청 */
  request: THTTPRequest;
  /** 스트리밍 응답 헤더 정보 */
  response?: THTTPResponse;
  /** 스트리밍 이벤트들 (SSE 메시지들) */
  streamEvents: TStreamChunk[];
  /** 요청 시작부터 스트림 종료까지의 총 시간(ms) */
  totalDuration?: number;
  /** 스트림 시작 시각 */
  streamStartedAt?: number;
  /** 스트림 종료 시각 */
  streamEndedAt?: number;
};

export type THTTPRequest = {
  method: string;
  url: string;
  headers: Record<string, string>;
  body: unknown;
  timestamp: number;
};

export type THTTPResponse = {
  status: number;
  statusText?: string;
  headers?: Record<string, string>;
  body?: unknown;
  error?: {
    message: string;
    type: 'network' | 'http' | 'timeout' | 'abort';
    details?: unknown;
  };
  timestamp: number;
};

export type TStreamChunk = {
  event: string;
  data?: unknown;
  delay?: number;
  timestamp: number;
  phase?: 'open' | 'message' | 'error' | 'close';
};

export type TSocketIOGroup = {
  requestId: string;
  type: 'socketio';
  /** 연결 정보 */
  connection: {
    url: string;
    namespace?: string;
    timestamp: number;
  };
  /** 해당 연결의 모든 메시지들 */
  messages: TMessage[];
  /** 연결 종료 시각 (마지막 이벤트 기준) */
  closedAt?: number;
};

export type TMessage = {
  direction: 'clientToServer' | 'serverToClient';
  event: string;
  data: unknown[];
  timestamp: number;
  isBinary?: boolean;
};

export type TEventGroup = THTTPRestGroup | THTTPStreamGroup | TSocketIOGroup;
