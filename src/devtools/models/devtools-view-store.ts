import { create } from 'zustand';

const useDevtoolsViewStore = create<TDevtoolsViewState>(set => ({
  view: 'maximized',
  setView: view => set({ view }),
}));

export { useDevtoolsViewStore };

type TDevtoolsViewState = {
  view: 'maximized' | 'minimized' | 'closed';
  setView: (view: TDevtoolsViewState['view']) => void;
};
