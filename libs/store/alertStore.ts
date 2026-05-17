import { create } from 'zustand';

interface ToastState {
  message: string | null;
  type: 'success' | 'error' | 'warning' | 'info' | null;
  visible: boolean;
  duration: number; 
}

interface ToastActions {
  showToast: (message: string, type: ToastState['type'], duration?: number) => void;
  hideToast: () => void;
}

const useToastStore = create<ToastState & ToastActions>((set) => ({
  message: null,
  type: null,
  visible: false,
  duration: 3000,

  showToast: (message, type, duration = 3000) => {
    set({ message, type, visible: true, duration });

    setTimeout(() => {
      set({ visible: false, message: null, type: null });
    }, duration);
  },

  hideToast: () => set({ visible: false, message: null, type: null }),
}));

export default useToastStore;