import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LayoutState {
    isContained: boolean;
    toggleContained: () => void;
}

export const useLayoutStore = create<LayoutState>()(
    persist(
        (set) => ({
            isContained: false,
            toggleContained: () =>
                set((state) => ({ isContained: !state.isContained })),
        }),
        {
            name: 'layout-storage',
        },
    ),
);
