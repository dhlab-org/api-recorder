import { Button } from '@/shared/ui';
import { useState } from 'react';
import { ResizablePanel } from './ui/resizable-panel';

type TUiState = 'expanded' | 'minimized' | 'hidden';

const Devtools = () => {
  const [uiState, setUiState] = useState<TUiState>('hidden');

  return (
    <div>
      {uiState === 'hidden' && <FloatingButton open={() => setUiState('expanded')} />}

      {uiState === 'expanded' && (
        <ResizablePanel>
          <div className="flex items-center justify-between border-b border-gray-700 px-4 pb-2 text-sm">
            <div className="flex items-center gap-2 font-semibold">🎬 API Recorder</div>
            <Button size="sm" variant="ghost" onClick={() => setUiState('hidden')}>
              ✕
            </Button>
          </div>

          <div className="h-[calc(100%-72px)] overflow-y-auto p-4 text-xs font-mono leading-tight">
            <div className="text-gray-400">No events yet.</div>
          </div>
        </ResizablePanel>
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
