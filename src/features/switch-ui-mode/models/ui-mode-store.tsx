import { create } from 'zustand';

const useUiModeStore = create<TUiModeState>(set => ({
  uiMode: 'closed',

  setUiMode: uiMode => set({ uiMode }),
}));

export { useUiModeStore };

type TUiModeState = {
  uiMode: TUiMode;

  setUiMode: (uiMode: TUiMode) => void;
};

export type TUiMode = 'maximized' | 'minimized' | 'closed';
