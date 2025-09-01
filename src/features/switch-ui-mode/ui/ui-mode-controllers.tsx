import { Maximize2, Minimize2, X } from 'lucide-react';
import { combineStyles } from '@/shared/lib/utils';
import { Button } from '@/shared/ui';
import { closeButton, controlButton, controllersContainer } from '../css/ui-mode-controllers.css';
import { useUiModeStore } from '../models/ui-mode-store';

const UiModeControllers = ({ buttons }: TProps) => {
  const { setUiMode } = useUiModeStore();

  return (
    <div className={controllersContainer}>
      {buttons.includes('minimize') && (
        <Button
          size="icon"
          variant="ghost"
          className={combineStyles(controlButton)}
          onClick={() => setUiMode('minimized')}
        >
          <Minimize2 />
        </Button>
      )}
      {buttons.includes('maximize') && (
        <Button
          size="icon"
          variant="ghost"
          className={combineStyles(controlButton)}
          onClick={() => setUiMode('maximized')}
        >
          <Maximize2 />
        </Button>
      )}
      {buttons.includes('close') && (
        <Button size="icon" variant="ghost" className={combineStyles(closeButton)} onClick={() => setUiMode('closed')}>
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
