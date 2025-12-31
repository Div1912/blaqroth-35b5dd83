import { create } from 'zustand';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface GlobalLoaderState {
  isLoading: boolean;
  loadingCount: number;
  hasShownInitialLoader: boolean;
  startLoading: () => void;
  stopLoading: () => void;
  setLoading: (loading: boolean) => void;
  setHasShownInitialLoader: () => void;
}

const useLoaderStore = create<GlobalLoaderState>((set, get) => ({
  isLoading: true, // Start with loading true for initial page load
  loadingCount: 1,
  hasShownInitialLoader: false,
  startLoading: () => {
    const newCount = get().loadingCount + 1;
    set({ loadingCount: newCount, isLoading: true });
  },
  stopLoading: () => {
    const newCount = Math.max(0, get().loadingCount - 1);
    set({ loadingCount: newCount, isLoading: newCount > 0 });
  },
  setLoading: (loading: boolean) => set({ isLoading: loading, loadingCount: loading ? 1 : 0 }),
  setHasShownInitialLoader: () => set({ hasShownInitialLoader: true }),
}));

export const useGlobalLoader = () => {
  const location = useLocation();
  const store = useLoaderStore();

  // Show loader on every route change
  useEffect(() => {
    store.setLoading(true);
    
    // Simulate page load time - adjust as needed
    const timer = setTimeout(() => {
      store.setLoading(false);
      if (!store.hasShownInitialLoader) {
        store.setHasShownInitialLoader();
      }
    }, 1800); // Show loader for 1.8 seconds

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return store;
};
