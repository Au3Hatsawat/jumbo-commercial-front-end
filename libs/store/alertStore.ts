import { create } from 'zustand';

// กำหนด Type ของ Alert
interface ToastState {
  message: string | null;
  type: 'success' | 'error' | 'warning' | 'info' | null;
  visible: boolean;
  duration: number; // ระยะเวลาแสดงผล (ms)
}

interface ToastActions {
  // ฟังก์ชันสำหรับสั่งให้ Alert แสดงผล
  showToast: (message: string, type: ToastState['type'], duration?: number) => void;
  // ฟังก์ชันสำหรับซ่อน Alert
  hideToast: () => void;
}

const useToastStore = create<ToastState & ToastActions>((set) => ({
  message: null,
  type: null,
  visible: false,
  duration: 3000,

  showToast: (message, type, duration = 3000) => {
    set({ message, type, visible: true, duration });

    // ตั้งเวลาให้ซ่อน Alert โดยอัตโนมัติ
    setTimeout(() => {
      set({ visible: false, message: null, type: null });
    }, duration);
  },

  hideToast: () => set({ visible: false, message: null, type: null }),
}));

export default useToastStore;