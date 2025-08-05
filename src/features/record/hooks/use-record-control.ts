import { useCallback, useEffect } from 'react';
import { type TRecordingOptions, useRecordingStore } from '../models/recording-store';
import { patchFetch, unPatchFetch } from '../patch/fetch';

const useRecordControl = (options?: Partial<TRecordingOptions>) => {
  const { isRecording, setIsRecording, setOptions } = useRecordingStore();

  useEffect(() => {
    if (options) {
      setOptions(options);
    }
  }, [options, setOptions]);

  const start = useCallback(() => {
    if (isRecording) return;
    patchFetch();
    setIsRecording(true);
  }, [isRecording, setIsRecording]);

  const stop = useCallback(() => {
    if (!isRecording) return;
    unPatchFetch();
    setIsRecording(false);
  }, [isRecording, setIsRecording]);

  useEffect(() => () => stop(), [stop]);

  return {
    start,
    stop,
  };
};

export { useRecordControl };
