import { create } from 'zustand';

export const useCameraStore = create((set, get) => ({
  // Camera modes: 'third-person', 'first-person', 'down-facing'
  cameraMode: 'third-person',
  
  // Camera settings for each mode
  cameraSettings: {
  'third-person': {
  offset: [0, 15, -1], // Increased the negative Z-offset to move the camera further back
  lookAtOffset: [0, 0, 5],
  fov: 65
}

,
    'first-person': {
      offset: [0, 5, 12], // Move camera slightly above and ahead of nose
      lookAtOffset: [0, 0, 20],
      fov: 90
    },
    'down-facing': {
      offset: [0, -2, 0],
      lookAtOffset: [0, -20, 0],
      fov: 60
    }
  },
  
  // Crash-specific camera settings (more dramatic angles)
  crashCameraSettings: {
    'third-person': {
      offset: [5, 8, -12], // Offset angle for dramatic crash view
      lookAtOffset: [0, 0, 0], // Look at crashed UAV
      fov: 85 // Wider FOV for crash drama
    },
    'first-person': {
      offset: [0, 1, 1], // Inside the crashed UAV
      lookAtOffset: [0, 0, 10], // Look ahead (more chaotic)
      fov: 110 // Wide angle for disorientation
    },
    'down-facing': {
      offset: [0, -1, 0], // Lower position
      lookAtOffset: [0, -15, 0], // Look down at crash site
      fov: 70
    }
  },
  
  setCameraMode: (mode) => {
    if (['third-person', 'first-person', 'down-facing'].includes(mode)) {
      console.log("Switching to camera mode:", mode);
      set({ cameraMode: mode });
    }
  },
  
  getCurrentSettings: () => {
    const { cameraMode, cameraSettings, crashCameraSettings } = get();
    // For now, always return normal settings - crash effects are handled in CameraController
    return cameraSettings[cameraMode];
  }
}));