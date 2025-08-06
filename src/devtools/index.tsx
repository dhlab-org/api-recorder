import { useEffect } from 'react';
import { patchFetch, unPatchFetch } from '@/entities/http';
import { patchSocketIO } from '@/entities/websocket';
import { useRecordingStore } from '@/features/record';
import { OpenDevtoolsButton, useUiModeStore } from '@/features/switch-ui-mode';
import { MaximizedView } from './ui/maximized-view';
import { MinimizedView } from './ui/minimized-view';

const ApiRecorderDevtools = () => {
  const { uiMode } = useUiModeStore();
  const { options, pushEvents } = useRecordingStore();

  useEffect(() => {
    patchFetch({ options, pushEvents });
    patchSocketIO({ pushEvents });

    return () => {
      unPatchFetch();
    };
  }, [options, pushEvents]);

  return (
    <>
      {uiMode === 'closed' && <OpenDevtoolsButton />}
      {uiMode === 'maximized' && <MaximizedView />}
      {uiMode === 'minimized' && <MinimizedView />}
    </>
  );
};

export { ApiRecorderDevtools };
