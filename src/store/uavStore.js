// // import { create } from 'zustand';
// // import { subscribeWithSelector } from 'zustand/middleware';
// // import * as THREE from 'three';

// // // Create a flag outside the store to break potential circular updates
// // let isUpdating = false;

// // // Create UAV store with the subscribeWithSelector middleware
// // export const useUAVStore = create(
// //   subscribeWithSelector(
// //     (set, get) => ({
// //       // UAV state
// //       position: [0, 50, 0],
// //       rotation: [0, 0, 0],
// //       targetPosition: null,
// //       speed: 0.5,
// //       isCrashed: false,
// //       crashReason: '',
// //       isThermalVision: false,
      
// //       // Actions
// //       setPosition: (newPosition) => {
// //         // Skip if currently processing an update to break circular dependencies
// //         if (isUpdating) return;
        
// //         // Check if position actually changed
// //         const currentPos = get().position;
// //         if (currentPos[0] === newPosition[0] && 
// //             currentPos[1] === newPosition[1] && 
// //             currentPos[2] === newPosition[2]) {
// //           return; // Skip if unchanged
// //         }
        
// //         // Set flag, update state, clear flag
// //         try {
// //           isUpdating = true;
// //           set({ position: newPosition });
// //         } finally {
// //           isUpdating = false;
// //         }
// //       },
      
// //       setRotation: (newRotation) => {
// //         // Skip if currently processing an update
// //         if (isUpdating) return;
        
// //         // Only update if changed
// //         const currentRot = get().rotation;
// //         if (currentRot[0] === newRotation[0] && 
// //             currentRot[1] === newRotation[1] && 
// //             currentRot[2] === newRotation[2]) {
// //           return; 
// //         }
        
// //         try {
// //           isUpdating = true;
// //           set({ rotation: newRotation });
// //         } finally {
// //           isUpdating = false;
// //         }
// //       },
      
// //       setTargetPosition: (newTarget) => {
// //         if (isUpdating) return;
        
// //         // Handle null case
// //         if (newTarget === null) {
// //           if (get().targetPosition === null) return;
// //           set({ targetPosition: null });
// //           return;
// //         }
        
// //         // Compare current and new target
// //         const current = get().targetPosition;
// //         if (current && 
// //             current[0] === newTarget[0] && 
// //             current[1] === newTarget[1] && 
// //             current[2] === newTarget[2]) {
// //           return;
// //         }
        
// //         set({ targetPosition: newTarget });
// //       },
      
// //       setSpeed: (newSpeed) => {
// //         if (get().speed === newSpeed) return;
// //         set({ speed: newSpeed });
// //       },
      
// //       setCrashed: (crashed, reason = '') => {
// //         if (get().isCrashed === crashed) return;
        
// //         try {
// //           isUpdating = true;
// //           set({ 
// //             isCrashed: crashed, 
// //             crashReason: reason,
// //             ...(crashed ? { targetPosition: null } : {})
// //           });
// //         } finally {
// //           isUpdating = false;
// //         }
// //       },
      
// //       setThermalVision: (enabled) => {
// //         if (get().isThermalVision === enabled) return;
// //         set({ isThermalVision: enabled });
// //       },
      
// //       // This method handles movement logic in one place
// //       updatePosition: (delta = 0.016) => {
// //         // Don't update if we're in the middle of another update
// //         if (isUpdating) return;
        
// //         const { position, targetPosition, speed, isCrashed } = get();
        
// //         // Skip if crashed or no target
// //         if (isCrashed || !targetPosition) return;
        
// //         try {
// //           isUpdating = true;
          
// //           // Calculate movement
// //           const currentPos = new THREE.Vector3(...position);
// //           const targetPos = new THREE.Vector3(...targetPosition);
// //           const direction = new THREE.Vector3()
// //             .subVectors(targetPos, currentPos)
// //             .normalize();
          
// //           // Distance to target
// //           const distance = currentPos.distanceTo(targetPos);
          
// //           // Only move if not very close to target
// //           if (distance > 0.5) {
// //             // Step size with delta time for consistent movement speed
// //             const stepSize = Math.min(speed * delta * 60, distance);
            
// //             // New position
// //             const newPos = new THREE.Vector3().copy(currentPos);
// //             newPos.addScaledVector(direction, stepSize);
            
// //             // Update state directly to avoid recursive updates
// //             set({ position: [newPos.x, newPos.y, newPos.z] });
            
// //             // Update rotation if moving
// //             if (Math.abs(direction.x) > 0.01 || Math.abs(direction.z) > 0.01) {
// //               const angle = Math.atan2(direction.x, direction.z);
// //               if (Math.abs(get().rotation[1] - angle) > 0.01) {
// //                 set({ rotation: [0, angle, 0] });
// //               }
// //             }
// //           } 
// //           else {
// //             // Snap to target and clear it
// //             set({ 
// //               position: [...targetPosition], 
// //               targetPosition: null 
// //             });
// //           }
// //         } finally {
// //           isUpdating = false;
// //         }
// //       }
// //     })
// //   )
// // );

// // // Clean function for external updates
// // export const updateUAVPosition = () => {
// //   useUAVStore.getState().updatePosition();
// // };

// import { create } from 'zustand';
// import { subscribeWithSelector } from 'zustand/middleware';
// import * as THREE from 'three';

// // Helper function for deep array comparison
// const arraysEqual = (a, b) => {
//   if (!a || !b) return a === b;
//   if (a.length !== b.length) return false;
//   return a.every((val, i) => Math.abs(val - b[i]) < 0.001);
// };

// // Create a flag outside the store to break potential circular updates
// let isUpdating = false;

// // Create UAV store with the subscribeWithSelector middleware
// export const useUAVStore = create(
//   subscribeWithSelector(
//     (set, get) => ({
//       // UAV state
//       position: [0, 50, 0],
//       rotation: [0, 0, 0],
//       targetPosition: null,
//       speed: 10,
//       isCrashed: false,
//       crashReason: '',
//       isThermalVision: false,
//       droneType: 'surveillance', // Add drone type to UAV store
//       targets: [], // Add targets array
      
//       // Actions
//       setPosition: (newPosition) => {
//         // Skip if currently processing an update to break circular dependencies
//         if (isUpdating) return;
        
//         // Check if position actually changed using deep comparison
//         const currentPos = get().position;
//         if (arraysEqual(currentPos, newPosition)) {
//           return; // Skip if unchanged
//         }
        
//         set({ position: newPosition });
//       },
      
//       setRotation: (newRotation) => {
//         // Skip if currently processing an update
//         if (isUpdating) return;
        
//         // Only update if changed using deep comparison
//         const currentRot = get().rotation;
//         if (arraysEqual(currentRot, newRotation)) {
//           return; 
//         }
        
//         set({ rotation: newRotation });
//       },
      
//       setTargetPosition: (newTarget) => {
//         if (isUpdating) return;
        
//         // Handle null case
//         if (newTarget === null) {
//           if (get().targetPosition === null) return;
//           set({ targetPosition: null });
//           return;
//         }
        
//         // Compare current and new target using deep comparison
//         const current = get().targetPosition;
//         if (arraysEqual(current, newTarget)) {
//           return;
//         }
        
//         set({ targetPosition: newTarget });
//       },
      
//       setSpeed: (newSpeed) => {
//         if (get().speed === newSpeed) return;
//         set({ speed: newSpeed });
//       },
      
//       setCrashed: (crashed, reason = '') => {
//         if (get().isCrashed === crashed) return;
        
//         set({ 
//           isCrashed: crashed, 
//           crashReason: reason,
//           ...(crashed ? { targetPosition: null } : {})
//         });
//       },
      
//       setThermalVision: (enabled) => {
//         if (get().isThermalVision === enabled) return;
//         set({ isThermalVision: enabled });
//       },
      
//       setDroneType: (type) => {
//         if (get().droneType === type) return;
        
//         // FIXED: Set initial position when switching to attack mode
//         if (type === 'attack') {
//           set({ 
//             droneType: type,
//             position: [-45, 35, -40], // Set initial attack UAV position
//             targetPosition: null // Clear any existing target
//           });
//         } else {
//           set({ droneType: type });
//         }
//       },
      
//       addTarget: (target) => {
//         const currentTargets = get().targets;
//         const exists = currentTargets.some(t => t.id === target.id);
//         if (!exists) {
//           set({ targets: [...currentTargets, target] });
//         }
//       },
      
//       removeTarget: (targetId) => {
//         const currentTargets = get().targets;
//         set({ targets: currentTargets.filter(t => t.id !== targetId) });
//       },
      
//       // This method handles movement logic in one place
//       updatePosition: (delta = 0.016) => {
//         // Don't update if we're in the middle of another update
//         if (isUpdating) return;
        
//         const { position, targetPosition, speed, isCrashed } = get();
        
//         // Skip if crashed or no target
//         if (isCrashed || !targetPosition) return;
        
//         try {
//           isUpdating = true;
          
//           // Calculate movement
//           const currentPos = new THREE.Vector3(...position);
//           const targetPos = new THREE.Vector3(...targetPosition);
//           const direction = new THREE.Vector3()
//             .subVectors(targetPos, currentPos)
//             .normalize();
          
//           // Distance to target
//           const distance = currentPos.distanceTo(targetPos);
          
//           // Only move if not very close to target
//           if (distance > 0.5) {
//             // Step size with delta time for consistent movement speed
//             const stepSize = Math.min(speed * delta * 60, distance);
            
//             // New position
//             const newPos = new THREE.Vector3().copy(currentPos);
//             newPos.addScaledVector(direction, stepSize);
            
//             // Use setPosition to leverage value comparison
//             get().setPosition([newPos.x, newPos.y, newPos.z]);
            
//             // Update rotation if moving
//             if (Math.abs(direction.x) > 0.01 || Math.abs(direction.z) > 0.01) {
//               const angle = Math.atan2(direction.x, direction.z);
//               get().setRotation([0, angle, 0]);
//             }
//           } 
//           else {
//             // Snap to target and clear it
//             get().setPosition([...targetPosition]);
//             get().setTargetPosition(null);
//           }
//         } finally {
//           isUpdating = false;
//         }
//       }
//     })
//   )
// );

// // Clean function for external updates
// export const updateUAVPosition = () => {
//   useUAVStore.getState().updatePosition();
// };





// import { create } from 'zustand';
// import { subscribeWithSelector } from 'zustand/middleware';
// import * as THREE from 'three';

// // Create a flag outside the store to break potential circular updates
// let isUpdating = false;

// // Create UAV store with the subscribeWithSelector middleware
// export const useUAVStore = create(
//   subscribeWithSelector(
//     (set, get) => ({
//       // UAV state
//       position: [0, 50, 0],
//       rotation: [0, 0, 0],
//       targetPosition: null,
//       speed: 0.5,
//       isCrashed: false,
//       crashReason: '',
//       isThermalVision: false,
      
//       // Actions
//       setPosition: (newPosition) => {
//         // Skip if currently processing an update to break circular dependencies
//         if (isUpdating) return;
        
//         // Check if position actually changed
//         const currentPos = get().position;
//         if (currentPos[0] === newPosition[0] && 
//             currentPos[1] === newPosition[1] && 
//             currentPos[2] === newPosition[2]) {
//           return; // Skip if unchanged
//         }
        
//         // Set flag, update state, clear flag
// //         try {
// //           isUpdating = true;
// //           set({ position: newPosition });
// //         } finally {
// //           isUpdating = false;
// //         }
// //       },
      
// //       setRotation: (newRotation) => {
// //         // Skip if currently processing an update
// //         if (isUpdating) return;
        
// //         // Only update if changed
// //         const currentRot = get().rotation;
// //         if (currentRot[0] === newRotation[0] && 
// //             currentRot[1] === newRotation[1] && 
// //             currentRot[2] === newRotation[2]) {
// //           return; 
// //         }
        
// //         try {
// //           isUpdating = true;
// //           set({ rotation: newRotation });
// //         } finally {
// //           isUpdating = false;
// //         }
// //       },
      
// //       setTargetPosition: (newTarget) => {
// //         if (isUpdating) return;
        
// //         // Handle null case
// //         if (newTarget === null) {
// //           if (get().targetPosition === null) return;
// //           set({ targetPosition: null });
// //           return;
// //         }
        
// //         // Compare current and new target
// //         const current = get().targetPosition;
// //         if (current && 
// //             current[0] === newTarget[0] && 
// //             current[1] === newTarget[1] && 
// //             current[2] === newTarget[2]) {
// //           return;
// //         }
        
// //         set({ targetPosition: newTarget });
// //       },
      
// //       setSpeed: (newSpeed) => {
// //         if (get().speed === newSpeed) return;
// //         set({ speed: newSpeed });
// //       },
      
// //       setCrashed: (crashed, reason = '') => {
// //         if (get().isCrashed === crashed) return;
        
// //         try {
// //           isUpdating = true;
// //           set({ 
// //             isCrashed: crashed, 
// //             crashReason: reason,
// //             ...(crashed ? { targetPosition: null } : {})
// //           });
// //         } finally {
// //           isUpdating = false;
// //         }
// //       },
      
// //       setThermalVision: (enabled) => {
// //         if (get().isThermalVision === enabled) return;
// //         set({ isThermalVision: enabled });
// //       },
      
// //       // This method handles movement logic in one place
// //       updatePosition: (delta = 0.016) => {
// //         // Don't update if we're in the middle of another update
// //         if (isUpdating) return;
        
// //         const { position, targetPosition, speed, isCrashed } = get();
        
// //         // Skip if crashed or no target
// //         if (isCrashed || !targetPosition) return;
        
// //         try {
// //           isUpdating = true;
          
// //           // Calculate movement
// //           const currentPos = new THREE.Vector3(...position);
// //           const targetPos = new THREE.Vector3(...targetPosition);
// //           const direction = new THREE.Vector3()
// //             .subVectors(targetPos, currentPos)
// //             .normalize();
          
// //           // Distance to target
// //           const distance = currentPos.distanceTo(targetPos);
          
// //           // Only move if not very close to target
// //           if (distance > 0.5) {
// //             // Step size with delta time for consistent movement speed
// //             const stepSize = Math.min(speed * delta * 60, distance);
            
// //             // New position
// //             const newPos = new THREE.Vector3().copy(currentPos);
// //             newPos.addScaledVector(direction, stepSize);
            
// //             // Update state directly to avoid recursive updates
// //             set({ position: [newPos.x, newPos.y, newPos.z] });
            
// //             // Update rotation if moving
// //             if (Math.abs(direction.x) > 0.01 || Math.abs(direction.z) > 0.01) {
// //               const angle = Math.atan2(direction.x, direction.z);
// //               if (Math.abs(get().rotation[1] - angle) > 0.01) {
// //                 set({ rotation: [0, angle, 0] });
// //               }
// //             }
// //           } 
// //           else {
// //             // Snap to target and clear it
// //             set({ 
// //               position: [...targetPosition], 
// //               targetPosition: null 
// //             });
// //           }
// //         } finally {
// //           isUpdating = false;
// //         }
// //       }
// //     })
// //   )
// // );

// // // Clean function for external updates
// // export const updateUAVPosition = () => {
// //   useUAVStore.getState().updatePosition();
// };

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import * as THREE from 'three';

// Helper function for deep array comparison
const arraysEqual = (a, b) => {
  if (!a || !b) return a === b;
  if (a.length !== b.length) return false;
  return a.every((val, i) => Math.abs(val - b[i]) < 0.001);
};

// Create a flag outside the store to break potential circular updates
let isUpdating = false;

// Create UAV store with the subscribeWithSelector middleware
export const useUAVStore = create(
  subscribeWithSelector(
    (set, get) => ({
      // UAV state
      position: [0, 50, 0],
      rotation: [0, 0, 0],
      targetPosition: null,
      speed: 10,
      isCrashed: false,
      crashReason: '',
      isThermalVision: false,
      droneType: 'surveillance', // Add drone type to UAV store
      targets: [], // Add targets array
      battery: 100, // Battery percentage (0-100)
      uavStatus: 'idle', // idle, transit, hovering, attack, crashed
      terrainHeightMap: null, // This should be set from Terrain component
      
      // Actions
      setPosition: (newPosition) => {
        // Skip if currently processing an update to break circular dependencies
        if (isUpdating) return;
        
        // Check if position actually changed using deep comparison
        const currentPos = get().position;
        if (arraysEqual(currentPos, newPosition)) {
          return; // Skip if unchanged
        }
        
        set({ position: newPosition });
      },
      
      setRotation: (newRotation) => {
        // Skip if currently processing an update
        if (isUpdating) return;
        
        // Only update if changed using deep comparison
        const currentRot = get().rotation;
        if (arraysEqual(currentRot, newRotation)) {
          return; 
        }
        
        set({ rotation: newRotation });
      },
      
      setTargetPosition: (newTarget) => {
        if (isUpdating) return;
        
        // Handle null case
        if (newTarget === null) {
          if (get().targetPosition === null) return;
          set({ targetPosition: null });
          return;
        }
        
        // Compare current and new target using deep comparison
        const current = get().targetPosition;
        if (arraysEqual(current, newTarget)) {
          return;
        }
        
        set({ targetPosition: newTarget });
      },
      
      setSpeed: (newSpeed) => {
        if (get().speed === newSpeed) return;
        set({ speed: newSpeed });
      },
      
      setCrashed: (crashed) => {
        set({ isCrashed: crashed });
      },
      
      setThermalVision: (enabled) => {
        if (get().isThermalVision === enabled) return;
        set({ isThermalVision: enabled });
      },
      
      setDroneType: (type) => {
        if (get().droneType === type) return;
        
        // FIXED: Set initial position when switching to attack mode
        if (type === 'attack') {
          set({ 
            droneType: type,
            position: [-45, 35, -40], // Set initial attack UAV position
            targetPosition: null // Clear any existing target
          });
        } else {
          set({ droneType: type });
        }
      },
      
      addTarget: (target) => {
        const currentTargets = get().targets;
        const exists = currentTargets.some(t => t.id === target.id);
        if (!exists) {
          set({ targets: [...currentTargets, target] });
        }
      },
      
      removeTarget: (targetId) => {
        const currentTargets = get().targets;
        set({ targets: currentTargets.filter(t => t.id !== targetId) });
      },

      // Battery management
      setBattery: (value) => {
        const clampedValue = Math.max(0, Math.min(100, value));
        if (get().battery === clampedValue) return;
        
        set({ battery: clampedValue });
        
        // Check for power loss
        if (clampedValue <= 0 && !get().isCrashed) {
          get().setCrashed(true, 'Battery Depleted - Power Loss');
          
          // Import and call mission store's failMission
          // We need to do this dynamically to avoid circular dependencies
          if (typeof window !== 'undefined') {
            import('./missionStore').then(({ useMissionStore }) => {
              const { failMission, missionStatus } = useMissionStore.getState();
              if (missionStatus === 'active') {
                failMission('Battery Depleted - UAV Lost Power');
              }
            });
          }
          
          console.log('[UAVStore] Battery depleted - UAV crashed, mission failed');
        }
      },

      drainBattery: (amount) => {
        const currentBattery = get().battery;
        get().setBattery(currentBattery - amount);
      },

      setUAVStatus: (status) => {
        if (get().uavStatus === status) return;
        set({ uavStatus: status });
        console.log('[UAVStore] UAV status changed to:', status);
      },
      
      setTerrainHeightMap: (heightMapFunc) => set({ terrainHeightMap: heightMapFunc }),
      
      // This method handles movement logic in one place
      updatePosition: (delta = 0.016) => {
        // Don't update if we're in the middle of another update
        if (isUpdating) return;
        
        const { position, targetPosition, speed, isCrashed } = get();
        
        // If crashed, the movement is handled by the UAV component's useFrame loop
        // for realistic physics. The store's updatePosition should not interfere.
        // if (isCrashed) {
        //   return;
        // }

        // If there is no target, do not run the movement logic
        if (!targetPosition) {
          return;
        }

        try {
          isUpdating = true;
          
          // Calculate movement
          const currentPos = new THREE.Vector3(...position);
          const targetPos = new THREE.Vector3(...targetPosition);
          const direction = new THREE.Vector3()
            .subVectors(targetPos, currentPos)
            .normalize();
          
          // Distance to target
          const distance = currentPos.distanceTo(targetPos);
          
          // Only move if not very close to target
          if (distance > 0.5) {
            // Step size with delta time for consistent movement speed
            const stepSize = Math.min(speed * delta * 60, distance);
            
            // New position
            const newPos = new THREE.Vector3().copy(currentPos);
            newPos.addScaledVector(direction, stepSize);
            
            // Use setPosition to leverage value comparison
            get().setPosition([newPos.x, newPos.y, newPos.z]);
            
            // Update rotation if moving
            if (Math.abs(direction.x) > 0.01 || Math.abs(direction.z) > 0.01) {
              const angle = Math.atan2(direction.x, direction.z);
              get().setRotation([0, angle, 0]);
            }
          } 
          else {
            // Snap to target and clear it
            get().setPosition([...targetPosition]);
            get().setTargetPosition(null);
          }
        } finally {
          isUpdating = false;
        }
      }
    })
  )
);

// Clean function for external updates
export const updateUAVPosition = () => {
  useUAVStore.getState().updatePosition();
};