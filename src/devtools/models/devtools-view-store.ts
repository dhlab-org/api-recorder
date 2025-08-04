import { create } from 'zustand';
import type { TTab, TView } from '../types';

const useDevtoolsViewStore = create<TDevtoolsViewState>(set => ({
  view: 'maximized',
  tab: 'all',
  setView: view => set({ view }),
  setTab: tab => set({ tab }),
}));

export { useDevtoolsViewStore };

type TDevtoolsViewState = {
  view: TView;
  tab: TTab;
  setView: (view: TView) => void;
  setTab: (tab: TTab) => void;
};
