# 🎥 API Recorder

React 애플리케이션에서 다음을 자동으로 수집/시각화하는 개발자 도구입니다.
- HTTP 요청/응답(`fetch`, `XHR`)
- 스트리밍 응답(텍스트 기반 `ReadableStream`)
- `Socket.IO` 송수신 이벤트(선택 설치)

### 📦 설치

```bash
npm install -D @dhlab/api-recorder
# 또는
yarn add -D @dhlab/api-recorder
```

환경
- Node >= 18
- React 18 또는 19
- 선택: Socket.IO 이벤트를 기록하려면 `socket.io-client@^4`를 프로젝트에 설치하세요.

```bash
npm i socket.io-client@^4 --save
# 또는
yarn add socket.io-client@^4
```

## 🔌 빠른 시작

개발 환경에서만 Devtools를 마운트하세요.

```tsx
import { ApiRecorderDevtools } from '@dhlab/api-recorder';

function App() {
  return (
    <>
      {/* ... */}
      {process.env.NODE_ENV === 'development' && (
        <ApiRecorderDevtools />
      )}
    </>
  );
}
```

 

## 🧭 동작 개요

- Devtools가 마운트되면 `fetch`, `XMLHttpRequest`를 패치하여 HTTP 이벤트를 캡처합니다. 언마운트 시 원복합니다.
- 응답 헤더의 `content-type`을 검사하여 텍스트 기반 ReadableStream 여부를 판단하고, 텍스트 청크를 순차 수집합니다. (예: `text/stream`, `application/stream+json`)
- Socket.IO는 `socket.io-client`가 설치된 경우에만 자동 패치되어 송수신 이벤트를 기록합니다. 설치되어 있지 않으면 UI에서 가이드가 표시됩니다.

## ⚙️ 옵션

`ignore?: Array<string | RegExp> | ((url: string) => boolean)`
- 문자열 항목은 접두(prefix) 일치를 정규식으로 변환하여 검사합니다. 예: `"/api"` → `^/api`
- 정규식은 URL에 대해 그대로 검사합니다.
- 함수는 `(url) => boolean`을 반환해야 하며 `true`일 때 해당 HTTP 이벤트(요청/응답)가 무시됩니다.
- 응답 이벤트는 연결된 요청 URL을 기준으로 동일하게 무시됩니다.

예시

```tsx
<ApiRecorderDevtools
  ignore={[
    '/health',                // 접두 일치. '^/health' 로 취급
    /^\/socket\.io\//,      // 정규식 매칭
    url => url.includes('__vite_ping'), // 사용자 함수
  ]}
/>
```

## 🧾 내보내기 포맷(JSON)

내보내기는 요청 단위로 그룹화되어 출력됩니다. 주요 그룹 유형은 다음과 같습니다.

### HTTP(일반)
```json
{
  "type": "http-rest",
  "requestId": "abc123",
  "request": {
    "method": "GET",
    "url": "/api/users",
    "headers": {"accept": "application/json"},
    "body": null,
    "timestamp": 1730000000000
  },
  "response": {
    "status": 200,
    "statusText": "OK",
    "headers": {"content-type": "application/json"},
    "body": [{"id":1,"name":"Ada"}],
    "timestamp": 1730000000123
  },
  "totalDuration": 123
}
```
![화면 기록 2025-08-12 오후 11 19 03](https://github.com/user-attachments/assets/1ae66fe7-30cb-45ea-9066-126088954e64)


### HTTP(Stream)
```json
{
  "type": "http-stream",
  "requestId": "def456",
  "request": {
    "method": "GET",
    "url": "/api/stream",
    "headers": {},
    "body": null,
    "timestamp": 1730000000000
  },
  "response": {
    "status": 200,
    "headers": {"content-type": "text/stream"},
    "timestamp": 1730000000050
  },
  "streamEvents": [
    {"data": "{\"id\":1}\n{\"id\":2}", "delay": 120, "timestamp": 1730000000170, "phase": "message", "type": "message_delta"}
  ],
  "streamStartedAt": 1730000000050,
  "streamEndedAt": 1730000000400
}
```
![화면 기록 2025-08-12 오후 11 18 10](https://github.com/user-attachments/assets/ca162fd4-1ffa-4f97-8128-b6ef848d2073)


### Socket.IO
```json
{
  "type": "socketio",
  "requestId": "ghi789",
  "connection": {
    "url": "wss://example.com/socket.io",
    "namespace": "/chat",
    "timestamp": 1730000000000
  },
  "messages": [
    {"direction": "clientToServer", "event": "join", "data": ["room-1"], "timestamp": 1730000000100},
    {"direction": "serverToClient", "event": "message", "data": [{"text": "hi"}], "timestamp": 1730000000200}
  ],
  "closedAt": 1730000000500
}
```
![화면 기록 2025-08-12 오후 11 16 34](https://github.com/user-attachments/assets/02ce59a4-2889-4c63-a038-19dceef4f10a)


메모
- 본문(body)은 JSON/text만 직렬화됩니다. 바이너리 등은 제외될 수 있습니다.
- 스트림 처리는 텍스트 기반 ReadableStream에 최적화되어 있으며, 포맷에 따라 메시지 경계 인식이 제한될 수 있습니다.

## 📤 무엇이 기록되나요?

- 요청: 메서드, URL, 헤더, 직렬화 가능한 바디, 타임스탬프
- 응답: 상태, 헤더, 직렬화 가능한 바디, 왕복 시간, 스트림 여부
- 스트림: 메시지 `data`, 이전 이벤트 대비 지연 `delay`, `phase`
- Socket.IO: 이벤트 방향, 네임스페이스, 이벤트명, 데이터, 바이너리 여부 힌트

## 🔒 개인정보/보안 유의사항

- 민감 정보가 포함된 헤더/바디는 기록되지 않도록 `ignore`를 활용하거나 서버/클라이언트에서 마스킹하세요.
- 로컬 개발 환경에서만 사용하시길 권장합니다.

## 🧪 개발/빌드

```bash
yarn dev        # 예제/개발 환경 실행
yarn build      # 라이브러리 빌드 (ESM)
yarn lint       # 코드/서식 검사
yarn format     # 포맷팅
```

라이브러리 빌드 산출물
- ESM 번들: `dist/api-recorder.es.js`
- 타입 선언: `dist/main.d.ts`

외부 의존성(번들 제외)
- `react`, `react-dom`, `react/jsx-runtime`, `socket.io-client`

## ❗️제한 사항

- 본문 직렬화는 JSON/text에 한정됩니다. 기타 MIME은 `undefined`일 수 있습니다.
- 스트리밍 처리는 텍스트 기반 ReadableStream에 최적화되어 있으며 `application/stream+json` 등은 포맷에 따라 일부만 수집될 수 있습니다.
- Socket.IO 기록은 `socket.io-client@^4`가 설치된 경우에만 활성화됩니다(선택 의존성).


<br>
<br>

문의/이슈는 저장소 이슈 트래커를 통해 남겨주세요.
