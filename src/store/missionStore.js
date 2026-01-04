import { create } from 'zustand';

export const useMissionStore = create((set, get) => ({
  missionStatus: 'planning', // planning, active, completed, failed
  missionFailReason: '', // Reason for mission failure
  objectives: {
    hoverTime: 0,            // We won't use this for mission completion anymore
    requiredSurveillanceTime: 0, // Set to 0 as we're not using it
  },
  missionTimeRemaining: 120, // Default 2 minutes mission time
  missionMaxTime: 120,       // Default 2 minutes 
  isHovering: false,         // Is UAV currently hovering
  currentTarget: null,       // Current target being hovered over
  
  startMission: () => set({ 
    missionStatus: 'active', 
    missionTimeRemaining: get().missionMaxTime,
    missionFailReason: '',
    objectives: {
      ...get().objectives,
      hoverTime: 0
    }
  }),
  
  completeMission: (status) => set({ missionStatus: status }),
  
  failMission: (reason) => {
    console.log('[MissionStore] Mission Failed:', reason);
    set({ 
      missionStatus: 'failed',
      missionFailReason: reason 
    });
  },
  
  resetMission: () => {
    // Reset mission store state
    set({ 
      missionStatus: 'planning', 
      missionFailReason: '',
      objectives: {
        hoverTime: 0,
        requiredSurveillanceTime: 0
      },
      missionTimeRemaining: 120,
      isHovering: false,
      currentTarget: null
    });

    // Reset UAV battery when mission is reset
    if (typeof window !== 'undefined') {
      import('./uavStore').then(({ useUAVStore }) => {
        const { setBattery } = useUAVStore.getState();
        setBattery(100); // Reset battery to full
      });
    }
  },
  
  updateMissionTime: (delta) => {
    const { missionStatus, missionTimeRemaining } = get();
    
    if (missionStatus === 'active') {
      const newTime = Math.max(0, missionTimeRemaining - delta);
      set({ missionTimeRemaining: newTime });
      
      // Auto-fail mission if time runs out
      if (newTime <= 0) {
        set({ missionStatus: 'failed' });
      }
    }
  },
  
  updateHoverTime: (delta) => {
    const { objectives } = get();
    set({
      objectives: {
        ...objectives,
        hoverTime: objectives.hoverTime + delta
      }
    });
  },
  
  setIsHovering: (value) => set({ isHovering: value }),
  
  setCurrentTarget: (target) => set({ currentTarget: target }),
  
  setMissionMaxTime: (time) => set({ 
    missionMaxTime: time,
    missionTimeRemaining: time
  })
}));