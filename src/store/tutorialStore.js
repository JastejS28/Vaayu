import { create } from 'zustand';

export const useTutorialStore = create((set, get) => ({
  // Tutorial state
  isTutorialActive: false,
  currentStep: 0,
  tutorialCompleted: false,
  droneType: 'surveillance', // Add drone type to store
  
  // Tutorial steps for surveillance drone
  surveillanceSteps: [
    {
      id: 0,
      title: 'Welcome to UAV Surveillance Mission',
      description: 'This tutorial will guide you through operating a surveillance drone. Click "Next" to begin.',
      highlight: null,
      action: null
    },
    {
      id: 1,
      title: 'Step 1: Spawn Your Drone',
      description: 'Click anywhere on the terrain (green ground) to spawn your surveillance drone at that location.',
      highlight: 'terrain',
      action: 'spawn',
      indicator: 'Click on terrain to spawn drone'
    },
    {
      id: 2,
      title: 'Step 2: Understanding the Dashboard',
      description: 'The top-left panel shows your drone status: Battery, Altitude, Speed, and detected targets.',
      highlight: 'dashboard',
      action: null
    },
    {
      id: 3,
      title: 'Step 3: Locate Targets',
      description: 'Look for red arrows pointing to target locations. These indicate where you need to perform surveillance.',
      highlight: 'target-indicators',
      action: null
    },
    {
      id: 4,
      title: 'Step 4: Move to Target',
      description: 'Click near a target (tank, jeep, or warehouse) to move your drone there. The drone will fly automatically.',
      highlight: 'move',
      action: 'move-to-target',
      indicator: 'Click near target to move drone'
    },
    {
      id: 5,
      title: 'Step 5: Target Detection',
      description: 'When your drone is within 20 units of a target, it will automatically detect it. A green pulse effect will appear.',
      highlight: 'detection',
      action: 'detect-target'
    },
    {
      id: 6,
      title: 'Step 6: Lower Altitude for Surveillance',
      description: 'To complete surveillance, hover over the detected target at LOW altitude (below 15 units). Use altitude controls or click directly above the target.',
      highlight: 'altitude',
      action: 'hover-at-target',
      indicator: 'Lower altitude and hover over target for 10 seconds'
    },
    {
      id: 7,
      title: 'Step 7: Complete Surveillance',
      description: 'Stay hovering over the target for 10 seconds. A progress bar will show your surveillance progress.',
      highlight: 'hover-progress',
      action: 'complete-surveillance'
    },
    {
      id: 8,
      title: 'Step 8: Multiple Targets',
      description: 'Repeat the process for all targets to complete your mission. Watch your battery level!',
      highlight: 'targets-remaining',
      action: null
    },
    {
      id: 9,
      title: 'Mission Complete!',
      description: 'Great job! You now know how to operate a surveillance drone. Try an attack mission next!',
      highlight: null,
      action: 'complete'
    }
  ],
  
  // Tutorial steps for attack drone
  attackSteps: [
    {
      id: 0,
      title: 'Welcome to Attack Drone Mission',
      description: 'Learn to operate an armed UAV and eliminate hostile targets.',
      highlight: null,
      action: null
    },
    {
      id: 1,
      title: 'Step 1: Drone Spawns at Base',
      description: 'Your attack drone automatically spawns at the home base. It\'s armed with missiles and bombs.',
      highlight: 'attack-uav',
      action: null
    },
    {
      id: 2,
      title: 'Step 2: Surveillance First!',
      description: 'IMPORTANT: You must first DETECT targets using surveillance mode before you can attack them. Look for the scan radius (blue circle).',
      highlight: 'scan-radius',
      action: null
    },
    {
      id: 3,
      title: 'Step 3: Detect Targets',
      description: 'Fly near targets to detect them. Once detected, they will appear in your Attack Dashboard.',
      highlight: 'detection',
      action: 'detect-target'
    },
    {
      id: 4,
      title: 'Step 4: Select Target',
      description: 'Click on a detected target in the dashboard to begin target lock sequence.',
      highlight: 'target-list',
      action: 'select-target',
      indicator: 'Click target in dashboard'
    },
    {
      id: 5,
      title: 'Step 5: Target Lock',
      description: 'Wait 3 seconds for target lock to complete. A yellow ring will turn green when locked.',
      highlight: 'lock-progress',
      action: 'wait-lock'
    },
    {
      id: 6,
      title: 'Step 6: Fire Weapon',
      description: 'Once locked, click "Fire Missile" to engage the target. Watch the missile trajectory!',
      highlight: 'fire-button',
      action: 'fire-weapon',
      indicator: 'Click Fire Missile button'
    },
    {
      id: 7,
      title: 'Step 7: Avoid Anti-Aircraft',
      description: 'DANGER: The warehouse has anti-drone defenses! Stay above 20 units altitude or keep distance > 50 units.',
      highlight: 'warehouse',
      action: null
    },
    {
      id: 8,
      title: 'Step 8: Complete Mission',
      description: 'Destroy all targets and return to base to complete your mission!',
      highlight: null,
      action: 'complete'
    }
  ],
  
  // Actions
  setDroneType: (type) => set({ droneType: type }),
  
  startTutorial: (type) => set({
    isTutorialActive: true,
    currentStep: 0,
    tutorialCompleted: false,
    droneType: type || 'surveillance'
  }),
  
  nextStep: () => {
    const { currentStep, droneType, surveillanceSteps, attackSteps } = get();
    const steps = droneType === 'attack' ? attackSteps : surveillanceSteps;
    
    if (currentStep < steps.length - 1) {
      set({ currentStep: currentStep + 1 });
    } else {
      set({ 
        tutorialCompleted: true,
        isTutorialActive: false 
      });
    }
  },
  
  previousStep: () => {
    const { currentStep } = get();
    if (currentStep > 0) {
      set({ currentStep: currentStep - 1 });
    }
  },
  
  skipTutorial: () => set({
    isTutorialActive: false,
    tutorialCompleted: true
  }),
  
  resetTutorial: () => set({
    isTutorialActive: false,
    currentStep: 0,
    tutorialCompleted: false
  }),
  
  // Helper to get current step data
  getCurrentStep: () => {
    const { currentStep, droneType, surveillanceSteps, attackSteps } = get();
    const steps = droneType === 'attack' ? attackSteps : surveillanceSteps;
    return steps[currentStep];
  },
  
  // Auto-advance tutorial based on actions
  checkStepCompletion: (action) => {
    const state = get();
    const currentStepData = state.getCurrentStep();
    if (currentStepData?.action === action) {
      state.nextStep();
    }
  }
}));