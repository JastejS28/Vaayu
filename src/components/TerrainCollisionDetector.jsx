// import React, { useRef, useEffect } from 'react';
// import { useFrame, useThree } from '@react-three/fiber';
// import { useUAVStore } from '../store/uavStore';
// import * as THREE from 'three';

// const TerrainCollisionDetector = () => {
//   const { scene } = useThree();
  
//   const raycaster = useRef(new THREE.Raycaster());
//   const downVector = new THREE.Vector3(0, -1, 0);
//   const terrainMeshes = useRef([]);
//   const frameCount = useRef(0);
//   const isInitialized = useRef(false);
//   const collisionEnabled = useRef(false);
//   const uavRef = useRef(null);
  
//   // Find terrain meshes on mount and set up collision system
//   useEffect(() => {
//     const findTerrainMeshes = () => {
//       const meshes = [];
      
//       // Find the UAV mesh first to exclude it
//       scene.traverse((object) => {
//         if (object.name === 'UAV' || object.name?.includes('UAV') || 
//             object.userData?.isUAV === true) {
//           uavRef.current = object;
//           console.log('[TerrainCollisionDetector] Found UAV mesh:', object.name);
//         }
//       });
      
//       // Then find terrain meshes
//       scene.traverse((object) => {
//         if (object.isMesh && object.geometry) {
//           // Skip the UAV itself or its children
//           if (uavRef.current && 
//              (object === uavRef.current || object.isDescendantOf?.(uavRef.current))) {
//             return;
//           }
          
//           const isTerrainMesh = (
//             object.userData.isClickableTerrain === true ||
//             object.name === 'terrain' ||
//             object.name?.toLowerCase().includes('terrain') ||
//             object.name?.toLowerCase().includes('mountain') ||
//             object.name?.toLowerCase().includes('ground') ||
//             object.name?.toLowerCase().includes('landscape') ||
//             object.parent?.name?.toLowerCase().includes('terrain') ||
//             object.parent?.name?.toLowerCase().includes('mountain')
//           );
          
//           if (isTerrainMesh) {
//             meshes.push(object);
//           }
//         }
//       });
      
//       terrainMeshes.current = meshes;
//       console.log(`[TerrainCollisionDetector] Found ${meshes.length} terrain meshes`);
//       return meshes.length > 0;
//     };

//     // Initial detection of terrain meshes
//     setTimeout(() => {
//       findTerrainMeshes();
      
//       // Try again after a delay to ensure all meshes are loaded
//       setTimeout(() => {
//         const found = findTerrainMeshes();
//         if (found) {
//           isInitialized.current = true;
//           console.log('[TerrainCollisionDetector] Collision detection ACTIVATED');
//         }
//       }, 2000);
//     }, 1000);
    
//     // Listen for position changes to handle post-spawn grace period
//     const unsubscribe = useUAVStore.subscribe(
//       (state) => state.position,
//       (position, previousPosition) => {
//         if (!previousPosition) return;
        
//         // Check if moved from default/spawn position
//         const isDefault = previousPosition[0] === 0 && previousPosition[1] === 50 && previousPosition[2] === 0;
//         const hasMoved = 
//           Math.abs(position[0] - previousPosition[0]) > 0.5 || 
//           Math.abs(position[1] - previousPosition[1]) > 0.5 || 
//           Math.abs(position[2] - previousPosition[2]) > 0.5;
          
//         // If moving from default position, disable collision briefly
//         if (isDefault && hasMoved) {
//           console.log('[TerrainCollisionDetector] 🚁 Spawn detected - Grace period started');
//           collisionEnabled.current = false;
          
//           // Re-enable after grace period
//           setTimeout(() => {
//             console.log('[TerrainCollisionDetector] ⚠️ Grace period ended - Collision detection enabled');
//             collisionEnabled.current = true;
//           }, 3000); // 3 second grace period
//         }
//       }
//     );
    
//     return () => {
//       unsubscribe();
//     };
//   }, [scene]);

//   // Collision detection in animation frame
//   useFrame(() => {
//     // Only run if initialized and collision is enabled
//     if (!isInitialized.current || !collisionEnabled.current) return;
    
//     // Only check every 30 frames for performance
//     frameCount.current = (frameCount.current + 1) % 30;
//     if (frameCount.current !== 0) return;
    
//     const { position, isCrashed, setCrashed } = useUAVStore.getState();
    
//     // Don't check if already crashed
//     if (isCrashed) return;
    
//     // Create position vector
//     const uavPos = new THREE.Vector3(...position);
    
//     // Set up the raycaster with specific layer filtering
//     raycaster.current.layers.set(0); // Only detect default layer
//     raycaster.current.set(uavPos, downVector);
//     raycaster.current.far = 100; // Detect terrain up to 100 units below
    
//     // Debug visualization
//     if (frameCount.current === 0) {
//       console.log(`[TerrainCollisionDetector] Checking collision for UAV at Y=${position[1].toFixed(2)}`);
//     }
    
//     // CRITICAL FIX: Exclude UAV from intersections by filtering the results
//     const intersections = raycaster.current.intersectObjects(terrainMeshes.current, true)
//       .filter(hit => {
//         // Debug which object was hit
//         console.log(`  -> Hit object: ${hit.object.name}, distance: ${hit.distance.toFixed(2)}`);
        
//         // Return true only for terrain objects (excluding UAV and its parts)
//         return !hit.object.name?.includes('UAV') && 
//                !hit.object.parent?.name?.includes('UAV') &&
//                hit.object.userData.isUAV !== true;
//       });
    
//     if (intersections.length > 0) {
//       const terrainHeight = intersections[0].point.y;
//       const uavAltitude = uavPos.y;
//       const clearance = uavAltitude - terrainHeight;
      
//       console.log(`[TerrainCollisionDetector] Ground clearance: ${clearance.toFixed(2)} units to ${intersections[0].object.name}`);
      
//       // Crash if UAV is too close to terrain
//       if (clearance < 2.5) {
//         console.error(`💥 UAV CRASHED INTO TERRAIN! Clearance: ${clearance.toFixed(2)} units`);
//         console.log(`Terrain height: ${terrainHeight}, UAV altitude: ${uavAltitude}`);
//         setCrashed(true, 'UAV CRASHED - Terrain collision detected!');
//       }
//     } else {
//       console.log(`[TerrainCollisionDetector] No terrain detected below UAV`);
//     }
//   });

//   // Simple debug visualization
//   useFrame(() => {
//     if (frameCount.current !== 0) return;
//     const { position } = useUAVStore.getState();
//     if (position[1] < 30) {
//       console.log(`[Debug] WARNING - UAV flying low: ${position[1].toFixed(1)} units`);
//     }
//   });

//   return null;
// };

// export default TerrainCollisionDetector;


import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useUAVStore } from '../store/uavStore';
import { useMissionStore } from '../store/missionStore';
import * as THREE from 'three';

const TerrainCollisionDetector = () => {
  const { scene } = useThree();
  
  const raycaster = useRef(new THREE.Raycaster());
  const downVector = new THREE.Vector3(0, -1, 0);
  const terrainMeshes = useRef([]);
  const frameCount = useRef(0);
  const isInitialized = useRef(false);
  const collisionEnabled = useRef(false);
  const uavRef = useRef(null);
  
  // Find terrain meshes on mount and set up collision system
  useEffect(() => {
    const findTerrainMeshes = () => {
      const meshes = [];
      
      // Find the UAV mesh first to exclude it
      scene.traverse((object) => {
        if (object.name === 'UAV' || object.name?.includes('UAV') || 
            object.userData?.isUAV === true) {
          uavRef.current = object;
          console.log('[TerrainCollisionDetector] Found UAV mesh:', object.name);
        }
      });
      
      // Then find terrain meshes
      scene.traverse((object) => {
        if (object.isMesh && object.geometry) {
          // Skip the UAV itself or its children
          if (uavRef.current && 
             (object === uavRef.current || object.isDescendantOf?.(uavRef.current))) {
            return;
          }
          
          const isTerrainMesh = (
            object.userData.isClickableTerrain === true ||
            object.name === 'terrain' ||
            object.name?.toLowerCase().includes('terrain') ||
            object.name?.toLowerCase().includes('mountain') ||
            object.name?.toLowerCase().includes('ground') ||
            object.name?.toLowerCase().includes('landscape') ||
            object.parent?.name?.toLowerCase().includes('terrain') ||
            object.parent?.name?.toLowerCase().includes('mountain')
          );
          
          if (isTerrainMesh) {
            meshes.push(object);
          }
        }
      });
      
      terrainMeshes.current = meshes;
      console.log(`[TerrainCollisionDetector] Found ${meshes.length} terrain meshes`);
      return meshes.length > 0;
    };

    // Initial detection of terrain meshes
    setTimeout(() => {
      findTerrainMeshes();
      
      // Try again after a delay to ensure all meshes are loaded
      setTimeout(() => {
        const found = findTerrainMeshes();
        if (found) {
          isInitialized.current = true;
          console.log('[TerrainCollisionDetector] Collision detection ACTIVATED');
        }
      }, 2000);
    }, 1000);
    
    // Listen for position changes to handle post-spawn grace period
    const unsubscribe = useUAVStore.subscribe(
      (state) => state.position,
      (position, previousPosition) => {
        if (!previousPosition) return;
        
        // Check if moved from default/spawn position
        const isDefault = previousPosition[0] === 0 && previousPosition[1] === 50 && previousPosition[2] === 0;
        const hasMoved = 
          Math.abs(position[0] - previousPosition[0]) > 0.5 || 
          Math.abs(position[1] - previousPosition[1]) > 0.5 || 
          Math.abs(position[2] - previousPosition[2]) > 0.5;
          
        // If moving from default position, disable collision briefly
        if (isDefault && hasMoved) {
          console.log('[TerrainCollisionDetector] 🚁 Spawn detected - Grace period started');
          collisionEnabled.current = false;
          
          // Re-enable after grace period
          setTimeout(() => {
            console.log('[TerrainCollisionDetector] ⚠️ Grace period ended - Collision detection enabled');
            collisionEnabled.current = true;
          }, 3000); // 3 second grace period
        }
      }
    );
    
    return () => {
      unsubscribe();
    };
  }, [scene]);

  // Collision detection in animation frame
  useFrame(() => {
    // Only run if initialized and collision is enabled
    if (!isInitialized.current || !collisionEnabled.current) return;
    
    // Only check every 30 frames for performance
    frameCount.current = (frameCount.current + 1) % 30;
    if (frameCount.current !== 0) return;
    
    const { position, isCrashed, setCrashed } = useUAVStore.getState();
    const { isHovering } = useMissionStore.getState();
    
    // Don't check if already crashed
    if (isCrashed) return;
    
    // Create position vector
    const uavPos = new THREE.Vector3(...position);
    
    // Set up the raycaster with specific layer filtering
    raycaster.current.layers.set(0); // Only detect default layer
    raycaster.current.set(uavPos, downVector);
    raycaster.current.far = 100; // Detect terrain up to 100 units below
    
    // Filtered intersections
    const intersections = raycaster.current.intersectObjects(terrainMeshes.current, true)
      .filter(hit => {
        // Return true only for terrain objects (excluding UAV and its parts)
        return !hit.object.name?.includes('UAV') && 
               !hit.object.parent?.name?.includes('UAV') &&
               hit.object.userData.isUAV !== true;
      });
    
    if (intersections.length > 0) {
      const terrainHeight = intersections[0].point.y;
      const uavAltitude = uavPos.y;
      const clearance = uavAltitude - terrainHeight;
      
      // Use a smaller clearance threshold during hover mode
      const minClearance = isHovering ? 1.5 : 3.0;
      
      // Crash if UAV is too close to terrain
      if (clearance < minClearance) {
        console.error(`💥 UAV CRASHED INTO TERRAIN! Clearance: ${clearance.toFixed(2)} units`);
        console.log(`Terrain height: ${terrainHeight}, UAV altitude: ${uavAltitude}`);
        setCrashed(true, 'UAV CRASHED - Terrain collision detected!');
      }
    }
  });

  // Simple debug visualization
  useFrame(() => {
    if (frameCount.current !== 0) return;
    const { position } = useUAVStore.getState();
    if (position[1] < 30) {
      console.log(`[Debug] WARNING - UAV flying low: ${position[1].toFixed(1)} units`);
    }
  });

  return null;
};

export default TerrainCollisionDetector;