import type { TSingleEvent } from '@/entities/event';
import { patchFetch } from './core/patch-fetch';
import { patchSocketIO } from './core/patch-socketio';
import { patchXHR } from './core/patch-xhr';
import type { TState } from './types';

const createPatchContext = ({ pushEvent }: TArgs) => {
  const state: TState = {
    originalFetch: null,
    xhrMetaMap: new WeakMap(),
  };

  return {
    patchAll: () => {
      patchFetch({ state, pushEvent });
      patchXHR({ state, pushEvent });
      patchSocketIO({ pushEvent });
    },
    unpatchAll: () => {
      const g = globalThis as unknown as {
        __API_RECORDER_ORIGINAL_FETCH?: typeof window.fetch;
        __API_RECORDER_PATCHED?: { fetch: boolean; xhr: boolean; socketio: boolean };
        __API_RECORDER_SOCKETIO_PATCHING?: boolean;
      };

      const originalFetch = g.__API_RECORDER_ORIGINAL_FETCH || state.originalFetch;
      if (originalFetch) {
        window.fetch = originalFetch;
      }
      state.originalFetch = null;

      if (g.__API_RECORDER_PATCHED) {
        g.__API_RECORDER_PATCHED.fetch = false;
        g.__API_RECORDER_PATCHED.xhr = false;
        g.__API_RECORDER_PATCHED.socketio = false;
      }
      g.__API_RECORDER_SOCKETIO_PATCHING = false;

      // WeakMap은 자동으로 GC되므로 별도 정리 불필요
    },
  };
};

export { createPatchContext };

type TArgs = {
  pushEvent: (event: TSingleEvent) => void;
};
