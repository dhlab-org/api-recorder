import { Button } from '@/shared/ui';
import { useUiModeStore } from '../models/ui-mode-store';

const OpenDevtoolsButton = () => {
  const { setUiMode } = useUiModeStore();

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

export { OpenDevtoolsButton };
