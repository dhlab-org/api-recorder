export type TBaseEvent = {
  /** 내부 식별자 (파일 내 유일) */
  id: string;
  /** 같은 요청/연결 단위를 묶는 키
   * - HTTP: 요청/응답/스트림 이벤트를 하나로 묶음
   * - Socket.IO: 하나의 소켓 연결 단위를 묶음
   */
  requestId: string;
  /** 발생 시각 (ms) – 리스트 정렬/타임라인 표시에 사용 */
  timestamp: number;
};

// ================= HTTP Events =================
export type THttpRequestEvent = TBaseEvent & {
  kind: 'http-request';
  /** 'GET' | 'POST' | ... */
  method: string;
  /** 요청 URL */
  url: string;
  /** 요청 헤더 – 있는 그대로(직렬화 가능한 형태) */
  headers?: Record<string, string>;
  /** 요청 바디 – JSON/text만 직렬화, 그 외는 undefined */
  body?: unknown;
};

export type THttpRestResponseEvent = TBaseEvent & {
  kind: 'http-rest-response';
  /** 응답 URL (요청 URL과 동일) */
  url: string;
  /** HTTP status code & text */
  status: number;
  statusText?: string;
  /** 응답 헤더 – 있는 그대로(직렬화 가능한 형태) */
  headers?: Record<string, string>;
  /** 응답 바디 – JSON/text만 직렬화, 스트리밍이면 undefined */
  body?: unknown;
  /** 요청-응답 왕복 시간(ms) */
  delayMs?: number;
  /** 에러 상황 표시용 (fetch 예외 등) */
  error?: boolean;
};

export type THttpStreamChunkEvent = TBaseEvent & {
  kind: 'http-stream-chunk';
  /** 스트림이 연결된 엔드포인트 */
  url: string;
  /** data 필드(원본 그대로 직렬화) */
  data: unknown;
  /** 이 이벤트까지의 상대 지연(ms) */
  delayMs?: number;
  /** 스트림 라이프사이클 힌트 */
  phase?: 'open' | 'message' | 'error' | 'close';
  /** SSE 이벤트 타입 */
  type?: string;
  /** 응답 정보 (첫 번째 청크에만 포함) */
  response?: {
    status: number;
    statusText?: string;
    headers?: Record<string, string>;
  };
};

// ================= Socket.IO Events =================
export type TSocketIOEvent = TBaseEvent & {
  kind: 'socketio';
  /** 소켓 엔드포인트 (예: ws://..., wss://...) */
  url: string;
  /** 메시지 방향 */
  direction: 'clientToServer' | 'serverToClient';
  /** 네임스페이스 (기본 '/') */
  namespace?: string;
  /** 이벤트명 (예: 'message', 'join', 'typing') */
  event: string;
  /** 전송 데이터 – Socket.IO는 보통 배열 페이로드 */
  data: unknown[];
  /** 바이너리 여부 표식(있으면 UI에서 길이/hex 등으로 표시) */
  isBinary?: boolean;
  /** 연결 오류 정보 (connect_error 이벤트일 때만 사용) */
  reject?: {
    /** 오류 메시지 */
    message: string;
    /** 연결 시도 후 경과 시간(ms) */
    afterMs?: number;
    /** 오류 코드 */
    code?: string;
  };
};

export type TSingleEvent = THttpRequestEvent | THttpRestResponseEvent | THttpStreamChunkEvent | TSocketIOEvent;
