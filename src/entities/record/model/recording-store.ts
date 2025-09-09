import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type TRecordingState = {
  isRecording: boolean;

  setIsRecording: (isRecording: boolean) => void;

  toggleRecording: () => void;
};

const useRecordingStore = create<TRecordingState>()(
  persist(
    (set, get) => ({
      isRecording: false,

      setIsRecording: isRecording => set({ isRecording }),

      toggleRecording: () => {
        const { isRecording } = get();
        set({ isRecording: !isRecording });
      },
    }),
    {
      name: 'api-recorder:recording',
      skipHydration: false,
    },
  ),
);

export { useRecordingStore };
