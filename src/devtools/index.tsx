import { useDevtoolsViewStore } from './models/devtools-view-store';
import { RecordControllers } from './ui/record-controllers';
import { ResizablePanel } from './ui/resizable-panel';
import { FloatingButton, SizeControllers } from './ui/size-controllers';

const Devtools = () => {
  const { view } = useDevtoolsViewStore();

  return (
    <div>
      {view === 'closed' && <FloatingButton />}
      {view === 'maximized' && (
        <ResizablePanel>
          <div className="flex items-center justify-between border-b border-gray-700 px-4 pb-3 text-sm">
            <RecordControllers />
            <SizeControllers buttons={['minimize', 'close']} />
          </div>

          <div className="h-[calc(100%-72px)] overflow-y-auto p-4 text-xs font-mono leading-tight">
            <div className="text-gray-400">No events yet.</div>
          </div>
        </ResizablePanel>
      )}

      {view === 'minimized' && (
        <div className="fixed bottom-0 left-0 right-0 z-[10000] border-t border-gray-700 bg-gray-900 text-white shadow-2xl flex justify-between items-center px-4 py-3">
          <RecordControllers />
          <SizeControllers buttons={['maximize', 'close']} />
        </div>
      )}
    </div>
  );
};

export { Devtools };
