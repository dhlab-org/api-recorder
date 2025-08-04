import { Button } from '@/shared/ui';
import { useState } from 'react';
import type { TUiState } from './types';
import { ResizablePanel } from './ui/resizable-panel';
import { SizeControllers } from './ui/size-controllers';
import { RecordControllers } from './ui/record-controllers';

const Devtools = () => {
  const [uiState, setUiState] = useState<TUiState>('closed');

  return (
    <div>
      {uiState === 'closed' && <FloatingButton open={() => setUiState('maximized')} />}

      {uiState === 'maximized' && (
        <ResizablePanel>
          <div className="flex items-center justify-between border-b border-gray-700 px-4 pb-3 text-sm">
            <RecordControllers />
            <SizeControllers buttons={['minimize', 'close']} setUiState={setUiState} />
          </div>

          <div className="h-[calc(100%-72px)] overflow-y-auto p-4 text-xs font-mono leading-tight">
            <div className="text-gray-400">No events yet.</div>
          </div>
        </ResizablePanel>
      )}

      {uiState === 'minimized' && (
        <div className="fixed bottom-0 left-0 right-0 z-[10000] border-t border-gray-700 bg-gray-900 text-white shadow-2xl flex justify-between px-4 py-3">
          <div className="font-semibold">🎬 API Recorder</div>
          <SizeControllers buttons={['maximize', 'close']} setUiState={setUiState} />
        </div>
      )}
    </div>
  );
};

export { Devtools };

const FloatingButton = ({ open }: { open: () => void }) => (
  <div className="fixed right-4 z-[10001] transition-all duration-300 bottom-4">
    <Button
      onClick={open}
      size="sm"
      variant="secondary"
      className="gap-2 bg-gray-900 text-white hover:bg-gray-800 border border-gray-700 shadow-lg"
    >
      <span className="text-lg">🎬</span>
      <span className="text-sm font-medium">API Recorder</span>
    </Button>
  </div>
);
