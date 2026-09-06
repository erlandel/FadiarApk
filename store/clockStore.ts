import { create } from 'zustand';

type ClockState = {
  currentTime: number;
  _interval: ReturnType<typeof setInterval> | null;
  startClock: () => void;
  stopClock: () => void;
};

export const useClockStore = create<ClockState>((set, get) => ({
  currentTime: Date.now(),
  _interval: null,

  startClock: () => {
    if (get()._interval) return;
    const interval = setInterval(() => {
      set({ currentTime: Date.now() });
    }, 1000);
    set({ _interval: interval });
  },

  stopClock: () => {
    const interval = get()._interval;
    if (interval) {
      clearInterval(interval);
      set({ _interval: null });
    }
  },
}));

export default useClockStore;