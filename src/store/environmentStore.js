import { create } from 'zustand';

export const useEnvironmentStore = create((set, get) => ({
  environmentMode: 'day', // 'day', 'night', or 'rain'
  
  // Wind gust state
  isWindGustActive: false,
  windGustStartTime: null,
  windGustDuration: 1.5, // Duration in seconds (fixed at 1.5s)
  lastWindGustTime: 0, // Track when last wind gust occurred
  
  setEnvironmentMode: (mode) => {
    if (mode === 'day' || mode === 'night' || mode === 'rain') {
      console.log("Setting environment mode to:", mode);
      set({ environmentMode: mode });
    } else {
      console.error("Invalid environment mode:", mode);
    }
  },

  // Trigger a wind gust event
  triggerWindGust: () => {
    const now = Date.now();
    const { isWindGustActive, lastWindGustTime } = get();
    
    // Prevent triggering if already active or too soon after last gust (minimum 5 seconds between gusts)
    if (isWindGustActive || (now - lastWindGustTime) < 5000) {
      return false;
    }

    console.log('[Environment] Wind gust event started');
    set({ 
      isWindGustActive: true,
      windGustStartTime: now,
      lastWindGustTime: now
    });

    // Auto-stop after duration
    setTimeout(() => {
      const current = get();
      if (current.isWindGustActive && current.windGustStartTime === now) {
        get().stopWindGust();
      }
    }, get().windGustDuration * 1000);

    return true;
  },

  // Stop the wind gust event
  stopWindGust: () => {
    const { isWindGustActive } = get();
    if (isWindGustActive) {
      console.log('[Environment] Wind gust event ended');
      set({ 
        isWindGustActive: false,
        windGustStartTime: null
      });
    }
  },

  // Check if wind gust is currently active
  getWindGustActive: () => get().isWindGustActive,

  // Reset wind gust state
  resetWindGust: () => {
    set({
      isWindGustActive: false,
      windGustStartTime: null,
      lastWindGustTime: 0
    });
  }
}));
