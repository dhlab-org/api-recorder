import { Button } from '@/shared/ui';
import { Maximize2, Minimize2, X } from 'lucide-react';
import { useDevtoolsViewStore } from '../models/devtools-view-store';

const SizeControllers = ({ buttons }: TProps) => {
  const { setUiMode } = useDevtoolsViewStore();

  return (
    <div className="flex gap-2">
      {buttons.includes('minimize') && (
        <Button
          size="sm"
          variant="ghost"
          className="rounded-full h-5 w-5 hover:bg-green-300"
          onClick={() => setUiMode('minimized')}
        >
          <Minimize2 />
        </Button>
      )}
      {buttons.includes('maximize') && (
        <Button
          size="sm"
          variant="ghost"
          className="rounded-full h-5 w-5 hover:bg-green-300"
          onClick={() => setUiMode('maximized')}
        >
          <Maximize2 />
        </Button>
      )}
      {buttons.includes('close') && (
        <Button
          size="sm"
          variant="ghost"
          className="rounded-full h-5 w-5 hover:bg-red-400"
          onClick={() => setUiMode('closed')}
        >
          <X />
        </Button>
      )}
    </div>
  );
};

const FloatingButton = () => {
  const { setUiMode } = useDevtoolsViewStore();

  return (
    <div className="fixed right-4 z-[10001] transition-all duration-300 bottom-4">
      <Button
        onClick={() => setUiMode('maximized')}
        size="sm"
        variant="secondary"
        className="gap-2 bg-gray-900 text-white hover:bg-gray-800 border border-gray-700 shadow-lg"
      >
        <span className="text-lg">🎬</span>
        <span className="text-sm font-medium">API Recorder</span>
      </Button>
    </div>
  );
};

export { SizeControllers, FloatingButton };

type TProps = {
  buttons: ('minimize' | 'maximize' | 'close')[];
};
