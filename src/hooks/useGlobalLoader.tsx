import { create } from 'zustand';

interface GlobalLoaderState {
  isLoading: boolean;
  loadingCount: number;
  startLoading: () => void;
  stopLoading: () => void;
  setLoading: (loading: boolean) => void;
}

export const useGlobalLoader = create<GlobalLoaderState>((set, get) => ({
  isLoading: false,
  loadingCount: 0,
  startLoading: () => {
    const newCount = get().loadingCount + 1;
    set({ loadingCount: newCount, isLoading: true });
  },
  stopLoading: () => {
    const newCount = Math.max(0, get().loadingCount - 1);
    set({ loadingCount: newCount, isLoading: newCount > 0 });
  },
  setLoading: (loading: boolean) => set({ isLoading: loading, loadingCount: loading ? 1 : 0 }),
}));
