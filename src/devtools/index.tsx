'use client';

import { useEffect } from 'react';
import { useRecordingStore } from '@/entities/record';
import { createPatchContext } from '@/features/patch';
import { OpenDevtoolsButton, useUiModeStore } from '@/features/switch-ui-mode';
import type { TRecordingOptions } from '@/shared/api';
import { MaximizedView } from './ui/maximized-view';
import { MinimizedView } from './ui/minimized-view';

const ApiRecorderDevtools = ({ ignore }: TRecordingOptions) => {
  const { uiMode } = useUiModeStore();
  const { pushEvents, setOptions } = useRecordingStore();

  useEffect(() => {
    setOptions({ ignore });
  }, [ignore, setOptions]);

  useEffect(() => {
    const patchContext = createPatchContext({ pushEvents });
    patchContext.patchAll();

    return () => {
      patchContext.unpatchAll();
    };
  }, [pushEvents]);

  return (
    <>
      {uiMode === 'closed' && <OpenDevtoolsButton />}
      {uiMode === 'maximized' && <MaximizedView />}
      {uiMode === 'minimized' && <MinimizedView />}
    </>
  );
};

export { ApiRecorderDevtools };
