import { create } from 'zustand';

import type { ChloeMsg } from '@/services/chloe';

type State = {
  open: boolean;
  messages: ChloeMsg[];
  pending: boolean;
  /** Screens playing a full-screen intro hide the launcher while they run. */
  hiddenBy: number;
  setOpen: (open: boolean) => void;
  push: (m: ChloeMsg) => void;
  setPending: (pending: boolean) => void;
  hide: () => () => void;
};

/** The conversation lives for the session, across pages. */
export const useChloe = create<State>()((set) => ({
  open: false,
  messages: [],
  pending: false,
  hiddenBy: 0,
  setOpen: (open) => set({ open }),
  push: (m) => set((s) => ({ messages: [...s.messages, m] })),
  setPending: (pending) => set({ pending }),
  // Returns a release that only counts once, however often it's called.
  hide: () => {
    set((s) => ({ hiddenBy: s.hiddenBy + 1 }));
    let released = false;
    return () => {
      if (released) return;
      released = true;
      set((s) => ({ hiddenBy: Math.max(0, s.hiddenBy - 1) }));
    };
  },
}));
