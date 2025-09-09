import { useRecordingStore } from '@/entities/record';
import { combineStyles } from '@/shared/lib/utils';
import { Button } from '@/shared/ui';
import {
  buttonText,
  devtoolsButton,
  devtoolsButtonContainer,
  emojiIcon,
  recordingIndicatorStyle,
} from '../css/open-devtools-button.css';
import { useUiModeStore } from '../models/ui-mode-store';

const OpenDevtoolsButton = () => {
  const { setUiMode } = useUiModeStore();
  const { isRecording } = useRecordingStore();

  return (
    <div className={devtoolsButtonContainer}>
      <Button
        onClick={() => setUiMode('maximized')}
        size="sm"
        variant="secondary"
        className={combineStyles(devtoolsButton)}
      >
        {isRecording ? <div className={recordingIndicatorStyle} /> : <span className={emojiIcon}>🎬</span>}
        <span className={buttonText}>API Recorder</span>
      </Button>
    </div>
  );
};

export { OpenDevtoolsButton };
