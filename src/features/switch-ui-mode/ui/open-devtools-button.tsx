import { combineStyles } from '@/shared/lib/utils';
import { Button } from '@/shared/ui';
import { useUiModeStore } from '../models/ui-mode-store';
import { buttonText, devtoolsButton, devtoolsButtonContainer, emojiIcon } from './open-devtools-button.css';

const OpenDevtoolsButton = () => {
  const { setUiMode } = useUiModeStore();

  return (
    <div className={devtoolsButtonContainer}>
      <Button
        onClick={() => setUiMode('maximized')}
        size="sm"
        variant="secondary"
        className={combineStyles(devtoolsButton)}
      >
        <span className={emojiIcon}>🎬</span>
        <span className={buttonText}>API Recorder</span>
      </Button>
    </div>
  );
};

export { OpenDevtoolsButton };
