import { Button } from '@/shared/ui';
import { Maximize2, Minimize2, X } from 'lucide-react';
import type { Dispatch } from 'react';
import type { TUiState } from '../types';

const SizeControllers = ({ buttons, setUiState }: TProps) => {
  return (
    <div className="flex gap-2">
      {buttons.includes('minimize') && (
        <Button
          size="sm"
          variant="ghost"
          className="rounded-full h-5 w-5 hover:bg-green-300"
          onClick={() => setUiState('minimized')}
        >
          <Minimize2 />
        </Button>
      )}
      {buttons.includes('maximize') && (
        <Button
          size="sm"
          variant="ghost"
          className="rounded-full h-5 w-5 hover:bg-green-300"
          onClick={() => setUiState('maximized')}
        >
          <Maximize2 />
        </Button>
      )}
      {buttons.includes('close') && (
        <Button
          size="sm"
          variant="ghost"
          className="rounded-full h-5 w-5 hover:bg-red-400"
          onClick={() => setUiState('hidden')}
        >
          <X />
        </Button>
      )}
    </div>
  );
};

export { SizeControllers };

type TProps = {
  buttons: ('minimize' | 'maximize' | 'close')[];
  setUiState: Dispatch<React.SetStateAction<TUiState>>;
};
