import { create } from 'zustand';

export const useUiStore = create((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2);
    const entry = { id, duration: 5000, ...toast };
    set((s) => ({ toasts: [...s.toasts, entry] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, entry.duration);
  },
  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
