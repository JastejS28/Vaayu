// // import React, { useRef, useEffect } from 'react';
// // import { useUAVStore } from '../store/uavStore';
// // import { useFrame } from '@react-three/fiber';
// // import { useGLTF } from '@react-three/drei';

// // const UAV = (props) => {
// //   // Get position and rotation from the UAV store, but don't get functions that change state
// //   const position = useUAVStore((state) => state.position);
// //   const rotation = useUAVStore((state) => state.rotation);
// //   const isCrashed = useUAVStore((state) => state.isCrashed);
  
// //   // Reference to the UAV model
// //   const modelRef = useRef();
  
// //   // Mark UAV to avoid collision detection with itself
// //   useEffect(() => {
// //     if (modelRef.current) {
// //       // Mark the UAV and all its children
// //       modelRef.current.userData.isUAV = true;
// //       modelRef.current.name = "UAV_Main";
      
// //       modelRef.current.traverse(child => {
// //         child.userData.isUAV = true;
// //         if (child.isMesh && !child.name.includes('UAV')) {
// //           child.name = `UAV_${child.name || 'Part'}`;
// //         }
// //       });
      
// //       console.log('[UAV] Marked UAV mesh and its children for collision exclusion');
// //     }
// //   }, []);

// //   useFrame(() => {
// //     if (!modelRef.current) return;
    
// //     // If crashed, make UAV shake and don't move
// //     if (isCrashed) {
// //       if (modelRef.current) {
// //         modelRef.current.rotation.x = rotation[0] + Math.sin(Date.now() * 0.01) * 0.2;
// //         modelRef.current.rotation.z = rotation[2] + Math.cos(Date.now() * 0.01) * 0.2;
// //         modelRef.current.position.set(...position);
// //       }
// //       return;
// //     }
    
// //     // Simply update the model position/rotation from the store
// //     // without calling updatePosition() again
// //     modelRef.current.position.set(...position);
// //     modelRef.current.rotation.set(rotation[0], rotation[1] + Math.PI, rotation[2]);
// //   });
  
// //   return (
// //     <group 
// //       ref={modelRef}
// //       userData={{ isUAV: true }}
// //       {...props} // Pass through any other props
// //     >
// //       <primitive 
// //         object={useGLTF('/models/drone/uav.glb').scene.clone()}
// //         scale={[3, 3, 3]}
// //         castShadow
// //       />
// //     </group>
// //   );
// // };

// // export default UAV;


// import React, { useRef, useEffect } from 'react';
// import { useUAVStore } from '../store/uavStore';
// import { useFrame, useThree } from '@react-three/fiber';
// import { useGLTF } from '@react-three/drei';
// import * as THREE from 'three';

// const UAV = (props) => {
//   // Get position and rotation from the UAV store
//   const position = useUAVStore((state) => state.position);
//   const rotation = useUAVStore((state) => state.rotation);
//   const isCrashed = useUAVStore((state) => state.isCrashed);
//   const targetPosition = useUAVStore((state) => state.targetPosition);
//   const speed = useUAVStore((state) => state.speed);
  
//   // Reference to the UAV model
//   const modelRef = useRef();
  
//   // Mark UAV to avoid collision detection with itself
//   useEffect(() => {
//     if (modelRef.current) {
//       // Mark the UAV and all its children
//       modelRef.current.userData.isUAV = true;
//       modelRef.current.name = "UAV_Main";
      
//       modelRef.current.traverse(child => {
//         child.userData.isUAV = true;
//         if (child.isMesh && !child.name.includes('UAV')) {
//           child.name = `UAV_${child.name || 'Part'}`;
//         }
//       });
      
//       console.log('[UAV] Marked UAV mesh and its children for collision exclusion');
//     }
//   }, []);

//   useFrame(() => {
//     if (!modelRef.current) return;
    
//     // If crashed, make UAV shake and don't move
//     if (isCrashed) {
//       if (modelRef.current) {
//         modelRef.current.rotation.x = rotation[0] + Math.sin(Date.now() * 0.01) * 0.2;
//         modelRef.current.rotation.z = rotation[2] + Math.cos(Date.now() * 0.01) * 0.2;
//         modelRef.current.position.set(...position);
//       }
//       return;
//     }
    
//     // Update the model position/rotation from the store
//     modelRef.current.position.set(...position);
//     modelRef.current.rotation.set(rotation[0], rotation[1] + Math.PI, rotation[2]);
//   });
  
//   return (
//     <group 
//       ref={modelRef}
//       userData={{ isUAV: true }}
//       {...props} // Pass through any other props
//     >
//       <primitive 
//         object={useGLTF('/models/drone/uav.glb').scene.clone()}
//         scale={[3, 3, 3]}
//         castShadow
//       />
//     </group>
//   );
// };

// export default UAV;


// import React, { useRef, useEffect } from 'react';
// import { useUAVStore } from '../store/uavStore';
// import { useFrame } from '@react-three/fiber';
// import { useGLTF } from '@react-three/drei';

// const UAV = (props) => {
//   // Get position and rotation from the UAV store, but don't get functions that change state
//   const position = useUAVStore((state) => state.position);
//   const rotation = useUAVStore((state) => state.rotation);
//   const isCrashed = useUAVStore((state) => state.isCrashed);
  
//   // Reference to the UAV model
//   const modelRef = useRef();
  
//   // Mark UAV to avoid collision detection with itself
//   useEffect(() => {
//     if (modelRef.current) {
//       // Mark the UAV and all its children
//       modelRef.current.userData.isUAV = true;
//       modelRef.current.name = "UAV_Main";
      
//       modelRef.current.traverse(child => {
//         child.userData.isUAV = true;
//         if (child.isMesh && !child.name.includes('UAV')) {
//           child.name = `UAV_${child.name || 'Part'}`;
//         }
//       });
      
//       console.log('[UAV] Marked UAV mesh and its children for collision exclusion');
//     }
//   }, []);

//   useFrame((state, delta) => {
//     if (!modelRef.current) return;
    
//     // If crashed, implement realistic crash physics
//     if (isCrashed) {
//       if (modelRef.current) {
//         const time = Date.now() * 0.001; // Convert to seconds
//         const crashTime = time * 2; // Speed up crash animation
        
//         // Get current position from store
//         const currentPos = [...position];
        
//         // FIXED: Faster falling with gravity acceleration
//         const fallSpeed = 15; // Increased fall speed
//         const gravity = 9.8;
//         const fallAcceleration = gravity * delta * fallSpeed;
        
//         // Update Y position (falling down) - ensure it updates the store
//         if (currentPos[1] > 5) { // Don't fall below ground level
//           currentPos[1] -= fallAcceleration;
//           // Update store position so camera can follow
//           useUAVStore.getState().setPosition(currentPos);
//         }
        
//         // FIXED: Realistic spinning/tumbling motion
//         const spinSpeed = 3; // Rotation speed multiplier
//         modelRef.current.rotation.x = rotation[0] + Math.sin(crashTime * spinSpeed) * 0.8;
//         modelRef.current.rotation.y = rotation[1] + Math.PI + (crashTime * spinSpeed * 0.7);
//         modelRef.current.rotation.z = rotation[2] + Math.cos(crashTime * spinSpeed * 1.2) * 0.6;
        
//         // FIXED: Circular motion while falling for realism
//         const circleRadius = 2;
//         const circleSpeed = 2;
//         const circleX = Math.sin(crashTime * circleSpeed) * circleRadius;
//         const circleZ = Math.cos(crashTime * circleSpeed) * circleRadius;
        
//         // Apply position with circular motion
//         modelRef.current.position.set(
//           currentPos[0] + circleX,
//           currentPos[1],
//           currentPos[2] + circleZ
//         );
//       }
//       return;
//     }
    
//     // Simply update the model position/rotation from the store
//     // without calling updatePosition() again
//     modelRef.current.position.set(...position);
//     modelRef.current.rotation.set(rotation[0], rotation[1] + Math.PI, rotation[2]);
//   });
  
//   return (
//     <group 
//       ref={modelRef}
//       userData={{ isUAV: true }}
//       {...props} // Pass through any other props
//     >
//       <primitive 
//         object={useGLTF('/models/drone/uav.glb').scene.clone()}
//         scale={[3, 3, 3]}
//         castShadow
//       />
//     </group>
//   );
// };

// export default UAV;


import React, { useRef, useEffect } from 'react';
import { useUAVStore } from '../store/uavStore';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

const UAV = (props) => {
  // Get position and rotation from the UAV store
  const position = useUAVStore((state) => state.position);
  const rotation = useUAVStore((state) => state.rotation);
  const isCrashed = useUAVStore((state) => state.isCrashed);
  const targetPosition = useUAVStore((state) => state.targetPosition);
  const speed = useUAVStore((state) => state.speed);
  
  // DEBUG: Monitor crash state changes
  useEffect(() => {
    console.log('[UAV] Crash state changed:', isCrashed);
    if (isCrashed) {
      console.log('[UAV] UAV is now CRASHED - should start falling!');
    }
  }, [isCrashed]);
  
  // Reference to the UAV model
  const modelRef = useRef();
  
  // Mark UAV to avoid collision detection with itself
  useEffect(() => {
    if (modelRef.current) {
      // Mark the UAV and all its children
      modelRef.current.userData.isUAV = true;
      modelRef.current.name = "UAV_Main";
      
      modelRef.current.traverse(child => {
        child.userData.isUAV = true;
        if (child.isMesh && !child.name.includes('UAV')) {
          child.name = `UAV_${child.name || 'Part'}`;
        }
      });
      
      console.log('[UAV] Marked UAV mesh and its children for collision exclusion');
    }
  }, []);

  useFrame((state, delta) => {
    if (!modelRef.current) return;
    

    
    // If crashed, implement realistic crash physics
    if (isCrashed) {
      console.log('[UAV] Executing crash physics - UAV should be falling');
      
      if (modelRef.current) {
        const time = Date.now() * 0.001; // Convert to seconds
        const crashTime = time * 2; // Speed up crash animation
        
        // Get current position from store
        const currentPos = [...position];
        
        // FIXED: Much faster falling with realistic gravity acceleration
        const fallSpeed = 50; // Significantly increased fall speed
        const gravity = 9.8;
        const fallAcceleration = gravity * delta * fallSpeed;
        
        // Update Y position (falling down) - ensure it updates the store
        if (currentPos[1] > 5) { // Don't fall below ground level
          currentPos[1] -= fallAcceleration;
          // CRITICAL: Update store position immediately so camera can follow
          useUAVStore.getState().setPosition(currentPos);
        } else {
          // Ensure UAV stops at ground level
          currentPos[1] = 5;
          useUAVStore.getState().setPosition(currentPos);
        }
        
        // FIXED: More dramatic spinning/tumbling motion
        const spinSpeed = 5; // Increased rotation speed multiplier
        modelRef.current.rotation.x = rotation[0] + Math.sin(crashTime * spinSpeed) * 1.2;
        modelRef.current.rotation.y = rotation[1] + Math.PI + (crashTime * spinSpeed * 1.0);
        modelRef.current.rotation.z = rotation[2] + Math.cos(crashTime * spinSpeed * 1.5) * 1.0;
        
        // FIXED: More dramatic circular motion while falling
        const circleRadius = 3;
        const circleSpeed = 3;
        const circleX = Math.sin(crashTime * circleSpeed) * circleRadius;
        const circleZ = Math.cos(crashTime * circleSpeed) * circleRadius;
        
        // Apply position with circular motion and update store for camera tracking
        const finalPos = [
          currentPos[0] + circleX,
          currentPos[1],
          currentPos[2] + circleZ
        ];
        
        modelRef.current.position.set(...finalPos);
        
        // CRITICAL: Update store with final position including circular motion
        useUAVStore.getState().setPosition(finalPos);
      }
      return;
    }
    
    // Update the model position/rotation from the store
    modelRef.current.position.set(...position);
    modelRef.current.rotation.set(rotation[0], rotation[1] + Math.PI, rotation[2]);
  });
  
  return (
    <group 
      ref={modelRef}
      userData={{ isUAV: true }}
      {...props} // Pass through any other props
    >
      <primitive 
        object={useGLTF('/models/drone/uav.glb').scene.clone()}
        scale={[3, 3, 3]}
        castShadow
      />
    </group>
  );
};

export default UAV;