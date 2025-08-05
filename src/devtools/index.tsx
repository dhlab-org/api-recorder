import { useDevtoolsViewStore } from './models/devtools-view-store';
import { MaximizedView } from './ui/maximized-view';
import { MinimizedView } from './ui/minimized-view';
import { FloatingButton } from './ui/size-controllers';

const Devtools = () => {
  const { uiMode } = useDevtoolsViewStore();

  return (
    <>
      {uiMode === 'closed' && <FloatingButton />}
      {uiMode === 'maximized' && <MaximizedView />}
      {uiMode === 'minimized' && <MinimizedView />}
    </>
  );
};

export { Devtools };
