'use client';

import { useEffect } from 'react';
import { useEventStore } from '@/entities/event';
import { useRecordingStore } from '@/entities/record';
import { createPatchContext } from '@/features/patch';
import { OpenDevtoolsButton, useUiModeStore } from '@/features/switch-ui-mode';
import { MaximizedView } from './ui/maximized-view';
import { MinimizedView } from './ui/minimized-view';

const ApiRecorderDevtools = ({ ignore }: TDevtoolOptions) => {
  const { uiMode } = useUiModeStore();
  const { setIgnore, pushEvent } = useEventStore();

  useEffect(() => {
    setIgnore(ignore);
  }, [ignore, setIgnore]);

  useEffect(() => {
    const patchContext = createPatchContext({
      pushEvent: event => {
        const { isRecording } = useRecordingStore.getState();
        if (isRecording) pushEvent(event);
      },
    });

    patchContext.patchAll();

    return () => {
      patchContext.unpatchAll();
    };
  }, [pushEvent]);

  return (
    <>
      {uiMode === 'closed' && <OpenDevtoolsButton />}
      {uiMode === 'maximized' && <MaximizedView />}
      {uiMode === 'minimized' && <MinimizedView />}
    </>
  );
};

export { ApiRecorderDevtools };

type TDevtoolOptions = {
  ignore?: (string | RegExp)[];
};
