import { useDevtoolsViewStore } from './models/devtools-view-store';
import { MaximizedView } from './ui/maximized-view';
import { MinimizedView } from './ui/minimized-view';
import { FloatingButton } from './ui/size-controllers';

const Devtools = () => {
  const { view } = useDevtoolsViewStore();

  return (
    <div>
      {view === 'closed' && <FloatingButton />}
      {view === 'maximized' && <MaximizedView />}
      {view === 'minimized' && <MinimizedView />}
    </div>
  );
};

export { Devtools };
