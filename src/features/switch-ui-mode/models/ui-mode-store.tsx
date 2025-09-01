import { create } from 'zustand';

type TUiModeState = {
  uiMode: TUiMode;

  setUiMode: (uiMode: TUiMode) => void;
};

const useUiModeStore = create<TUiModeState>(set => ({
  uiMode: 'closed',

  setUiMode: uiMode => set({ uiMode }),
}));

export { useUiModeStore };

export type TUiMode = 'maximized' | 'minimized' | 'closed';
