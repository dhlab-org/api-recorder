import type { TRecEvent } from '@/shared/api';
import type { TEventGroup } from './types';

const shouldIgnoreEvent = (ignore?: TIgnoreMatcher) => {
  if (!ignore) return (_event: TRecEvent, _existingGroups: TEventGroup[]) => false;

  if (typeof ignore === 'function') {
    return (event: TRecEvent, _existingGroups: TEventGroup[]) => {
      if (event.protocol === 'http' && 'url' in event) {
        return ignore(event.url);
      }
      return false;
    };
  }

  const parts = ignore.map(p => (typeof p === 'string' ? new RegExp(`^${escapeRegex(p)}`) : p));

  return (event: TRecEvent, existingGroups: TEventGroup[]) => {
    if (event.protocol === 'http') {
      // 요청
      if ('url' in event) {
        return parts.some(re => re.test(event.url));
      }

      // 응답
      if ('status' in event && !('url' in event)) {
        const existingGroup = existingGroups.find(g => g.requestId === event.requestId);
        if (existingGroup && 'request' in existingGroup) {
          return parts.some(re => re.test(existingGroup.request.url));
        }
      }
    }

    return false;
  };
};

export { shouldIgnoreEvent };

type TIgnoreMatcher = Array<string | RegExp> | ((url: string) => boolean);

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
