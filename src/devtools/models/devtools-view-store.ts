import { create } from 'zustand';
import type { TTab, TUiMode } from '../types';

const useDevtoolsViewStore = create<TDevtoolsViewState>(set => ({
  uiMode: 'maximized',
  tab: 'all',
  setUiMode: uiMode => set({ uiMode }),
  setTab: tab => set({ tab }),
}));

export { useDevtoolsViewStore };

type TDevtoolsViewState = {
  uiMode: TUiMode;
  tab: TTab;
  setUiMode: (uiMode: TUiMode) => void;
  setTab: (tab: TTab) => void;
};
