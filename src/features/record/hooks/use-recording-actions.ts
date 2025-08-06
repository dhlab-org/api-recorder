import { useCallback } from 'react';
import { useRecordingStore } from '../models/recording-store';

const useRecordingActions = () => {
  const { isRecording, setIsRecording } = useRecordingStore();

  const start = useCallback(() => {
    if (isRecording) return;

    setIsRecording(true);
  }, [isRecording, setIsRecording]);

  const stop = useCallback(() => {
    if (!isRecording) return;

    setIsRecording(false);
  }, [isRecording, setIsRecording]);

  const toggle = useCallback(() => {
    if (isRecording) {
      stop();
    } else {
      start();
    }
  }, [isRecording, start, stop]);

  return {
    start,
    stop,
    toggle,
  };
};

export { useRecordingActions };
