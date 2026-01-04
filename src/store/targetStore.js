import { create } from 'zustand';

export const useTargetStore = create((set) => ({
  targets: [],
  detectedTargets: [],
  completedTargets: {}, // Initialize as empty object
  currentlyScanning: null,
  
  // Just mark a target as initially detected
  addDetectedTarget: (target) => set(state => ({
    detectedTargets: [...state.detectedTargets.filter(t => 
      t.id !== target.id && t.position.toString() !== target.position.toString()
    ), target]
  })),
  
  // Set the target that's currently being scanned
  setCurrentlyScanning: (target) => set({
    currentlyScanning: target
  }),
  
  // Update this method to ensure soldier targets are properly tracked
  markTargetComplete: (targetType) => {
    // ✅ Ensure targetType is a string
    const type = typeof targetType === 'string' ? targetType : targetType?.type;
    
    if (!type) {
      console.error('[targetStore] Invalid target type:', targetType);
      return;
    }
    
    set((state) => ({
      completedTargets: {
        ...state.completedTargets,
        [type]: (state.completedTargets[type] || 0) + 1
      }
    }));
    
    console.log(`✅ Target completed: ${type}`);
  },
  
  // Reset all targets (for new mission)
  resetTargets: () => set({
    targets: [],
    detectedTargets: [],
    completedTargets: {}, // Reset to empty object
    currentlyScanning: null,
  }),
}));