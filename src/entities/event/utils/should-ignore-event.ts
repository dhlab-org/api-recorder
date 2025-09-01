import type { TSingleEvent } from '../model/single-events.types';

const shouldIgnoreEvent = (event: TSingleEvent, ignore?: TIgnoreMatcher): boolean => {
  if (!ignore || !event.url) return false;

  if (typeof ignore === 'function') {
    return ignore(event.url);
  }

  const parts = ignore.map(p => (typeof p === 'string' ? new RegExp(`^${escapeRegex(p)}`) : p));
  return parts.some(re => re.test(event.url));
};

export { shouldIgnoreEvent };

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

type TIgnoreMatcher = Array<string | RegExp> | ((url: string) => boolean);
