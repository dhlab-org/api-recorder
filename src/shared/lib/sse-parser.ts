const createSSEParser = (options: TOptions): TSSEParser => {
  const { onEvent, onRetry, onComment } = options;

  let pendingLine = '';

  let currentDataLines: string[] = [];
  let currentEventName: string | undefined;
  let currentId: string | undefined;
  let currentRetry: number | undefined;

  const dispatchEventIfAny = () => {
    if (currentDataLines.length === 0 && !currentEventName && !currentId && currentRetry === undefined) {
      return;
    }
    const data = currentDataLines.join('\n');
    const msg: TParsedSSEMessage = { data };
    if (currentEventName) msg.event = currentEventName;
    if (currentId !== undefined) msg.id = currentId;
    if (currentRetry !== undefined) msg.retry = currentRetry;
    onEvent(msg);
    currentDataLines = [];
    currentEventName = undefined;
    currentId = undefined;
    currentRetry = undefined;
  };

  const processFieldLine = (line: string) => {
    const colonIndex = line.indexOf(':');
    let field: string;
    let value = '';
    if (colonIndex === -1) {
      field = line;
    } else {
      field = line.slice(0, colonIndex);
      value = line.slice(colonIndex + 1);
      if (value.startsWith(' ')) value = value.slice(1);
    }

    switch (field) {
      case 'data':
        currentDataLines.push(value);
        break;
      case 'event':
        currentEventName = value;
        break;
      case 'id':
        currentId = value;
        break;
      case 'retry': {
        const ms = Number.parseInt(value, 10);
        if (Number.isFinite(ms) && ms >= 0) {
          currentRetry = ms;
          if (onRetry) onRetry(ms);
        }
        break;
      }
      default:
        break;
    }
  };

  const processLine = (rawLine: string) => {
    const line = rawLine.endsWith('\r') ? rawLine.slice(0, -1) : rawLine;
    if (line === '') {
      dispatchEventIfAny();
      return;
    }
    if (line.startsWith(':')) {
      if (onComment) onComment(line.slice(1));
      return;
    }
    processFieldLine(line);
  };

  const feed = (chunk: string) => {
    if (!chunk) return;
    const buffer = pendingLine + chunk;
    const lines = buffer.split('\n');
    pendingLine = lines.pop() ?? '';
    for (const l of lines) processLine(l);
  };

  const reset = (opts?: { consume?: boolean }) => {
    const consume = !!opts?.consume;
    if (consume) {
      if (pendingLine) {
        processLine(pendingLine);
        pendingLine = '';
      }
      dispatchEventIfAny();
    }
    pendingLine = '';
    currentDataLines = [];
    currentEventName = undefined;
    currentId = undefined;
    currentRetry = undefined;
  };

  return { feed, reset };
};

export { createSSEParser };

type TOptions = {
  onEvent: (msg: TParsedSSEMessage) => void;
  onRetry?: (ms: number) => void;
  onComment?: (comment: string) => void;
};

type TParsedSSEMessage = {
  id?: string;
  event?: string;
  data: string;
  retry?: number;
};

type TSSEParser = {
  feed: (chunk: string) => void;
  reset: (opts?: { consume?: boolean }) => void;
};
