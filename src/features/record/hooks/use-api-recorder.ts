import { useCallback, useEffect } from 'react';
import { type TRecordingOptions, useRecordingStore } from '../models/recording-store';
import { patchFetch, unPatchFetch } from '../patch/fetch';

const useApiRecorder = (options?: Partial<TRecordingOptions>) => {
  const { isRecording, setIsRecording, clearEvents, setOptions, events } = useRecordingStore();

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

  const getEventStats = useCallback(() => {
    const currentEvents = events;
    const httpEvents = currentEvents.filter(e => e.protocol === 'http');
    const requestEvents = httpEvents.filter(e => e.sender === 'client');
    const responseEvents = httpEvents.filter(e => e.sender === 'server');

    return {
      total: currentEvents.length,
      http: httpEvents.length,
      requests: requestEvents.length,
      responses: responseEvents.length,
    };
  }, [events]);

  useEffect(() => () => stop(), [stop]);

  return {
    isRecording,
    events,

    start,
    stop,
    clear: clearEvents,

    getEventStats,
  };
};

export { useApiRecorder };
