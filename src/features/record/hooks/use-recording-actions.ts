import { useCallback } from 'react';
import { patchFetch, unPatchFetch } from '@/entities/http';
import { useRecordingStore } from '../models/recording-store';

const useRecordingActions = () => {
  const { isRecording, setIsRecording, options, pushEvents } = useRecordingStore();

  const start = useCallback(() => {
    if (isRecording) return;
    patchFetch({ options, pushEvents });
    setIsRecording(true);
  }, [isRecording, setIsRecording, options, pushEvents]);

  const stop = useCallback(() => {
    if (!isRecording) return;
    unPatchFetch();
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
