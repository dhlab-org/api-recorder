import { OpenDevtoolsButton, useUiModeStore } from '@/features/switch-ui-mode';
import { MaximizedView } from './ui/maximized-view';
import { MinimizedView } from './ui/minimized-view';

const ApiRecorderDevtools = () => {
  const { uiMode } = useUiModeStore();

  return (
    <>
      {uiMode === 'closed' && <OpenDevtoolsButton />}
      {uiMode === 'maximized' && <MaximizedView />}
      {uiMode === 'minimized' && <MinimizedView />}
    </>
  );
};

export { ApiRecorderDevtools };
