import { combineStyles } from '@/shared/lib/utils';
import { Button } from '@/shared/ui';
import { useRecordingActions } from '../hooks/use-recording-actions';
import { useRecordingStore } from '../models/recording-store';
import {
  buttonTextStyle,
  containerStyle,
  defaultButtonStyle,
  iconContainerStyle,
  playIconStyle,
  recordingButtonStyle,
  recordingIndicatorStyle,
  recordingTextStyle,
  statusContainerStyle,
  statusIndicatorStyle,
  statusTextStyle,
  stopIconStyle,
  toggleButtonStyle,
  waitingIndicatorStyle,
  waitingTextStyle,
} from './toggle-recording-button.css';

const ToggleRecordingButton = () => {
  const { toggle: toggleRecording } = useRecordingActions();
  const { isRecording } = useRecordingStore();

  return (
    <div className={containerStyle}>
      <Button
        size="sm"
        variant={isRecording ? 'destructive' : 'ghost'}
        className={combineStyles(toggleButtonStyle, isRecording ? recordingButtonStyle : defaultButtonStyle)}
        onClick={toggleRecording}
      >
        {isRecording ? (
          <div className={iconContainerStyle}>
            <div className={stopIconStyle} />
          </div>
        ) : (
          <div className={playIconStyle} />
        )}
        <span className={buttonTextStyle}>{isRecording ? '녹화 종료' : '녹화 시작'}</span>
      </Button>

      <div className={statusContainerStyle}>
        <div
          className={combineStyles(statusIndicatorStyle, isRecording ? recordingIndicatorStyle : waitingIndicatorStyle)}
        />
        <span className={combineStyles(statusTextStyle, isRecording ? recordingTextStyle : waitingTextStyle)}>
          {isRecording ? 'LIVE • API 기록 중' : '대기 중'}
        </span>
      </div>
    </div>
  );
};

export { ToggleRecordingButton };
