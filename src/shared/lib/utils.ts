export const combineStyles = (...styles: (string | undefined | null | false)[]) => {
  return styles.filter(Boolean).join(' ');
};

export const stringifyMaybe = (v: unknown, pretty = true) => {
  try {
    if (typeof v === 'string') {
      if (pretty) {
        try {
          return JSON.stringify(JSON.parse(v), null, 2);
        } catch {
          return v;
        }
      }
      return v;
    }
    return pretty ? JSON.stringify(v, null, 2) : JSON.stringify(v);
  } catch {
    return String(v ?? '');
  }
};

export const fmt = (ts: number) => new Date(ts).toLocaleTimeString();
