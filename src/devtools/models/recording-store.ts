import { create } from 'zustand';

const useRecordingStore = create<TRecordingState>(set => ({
  isRecording: false,
  setIsRecording: isRecording => set({ isRecording }),
}));

export { useRecordingStore };

type TRecordingState = {
  isRecording: boolean;
  setIsRecording: (isRecording: boolean) => void;
};
