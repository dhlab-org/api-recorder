import { create } from 'zustand';
import type { TTab } from '../types';

const useDevtoolsViewStore = create<TDevtoolsViewState>(set => ({
  tab: 'all',

  setTab: tab => set({ tab }),
}));

export { useDevtoolsViewStore };

type TDevtoolsViewState = {
  tab: TTab;

  setTab: (tab: TTab) => void;
};
