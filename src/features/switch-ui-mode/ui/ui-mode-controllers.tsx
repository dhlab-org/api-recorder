import { Maximize2, Minimize2, X } from 'lucide-react';
import { Button } from '@/shared/ui';
import { useUiModeStore } from '../models/ui-mode-store';

const UiModeControllers = ({ buttons }: TProps) => {
  const { setUiMode } = useUiModeStore();

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

export { UiModeControllers };

type TProps = {
  buttons: ('minimize' | 'maximize' | 'close')[];
};
