// import React, { useRef, useEffect } from 'react';
// import { useFrame } from '@react-three/fiber';
// import { useGLTF } from '@react-three/drei';
// import { useUAVStore } from '../../store/uavStore';
// import { useAttackDroneStore } from '../../store/attackDroneStore';
// import MissileSystem from './MissileSystem';
// import TargetLockSystem from './TargetLockSystem';
// import MissileLaunch from './WeaponryEffects/MissileLaunch';
// import UavDamageSystem from '../anti-drone/UavDamageSystem';
// import CrashedUAV from './CrashedUAV';

// const AttackUAV = () => {
//   const basePosition = [-45, 35, -40];
//   const { position, rotation, isCrashed } = useUAVStore();
  
//   const { scene } = useGLTF('/models/surveillance-uav/drone.glb');
  
//   const uavRef = useRef();
//   const { 
//     activeMissiles, 
//     updateMissiles, 
//     initTargets, 
//     updateMissionMovement,
//     missionState,
//     droneHealth,
//     updateCrashAnimation
//   } = useAttackDroneStore();
  
//   useEffect(() => {
//     console.log("AttackUAV mounted - initializing targets and position");
//     initTargets();
    
//     const currentPos = useUAVStore.getState().position;
    
//     const isAtDefaultPosition = 
//       Math.abs(currentPos[0]) < 0.1 && 
//       Math.abs(currentPos[1] - 50) < 0.1 && 
//       Math.abs(currentPos[2]) < 0.1;
    
//     if (isAtDefaultPosition) {
//       console.log("Spawning attack UAV at base position:", basePosition);
//       useUAVStore.getState().setPosition(basePosition);
//     }
//   }, [initTargets]);
  
//   useFrame((state, delta) => {
//     // Check both crash states
//     const isCrashState = isCrashed || missionState === 'crashed';
    
//     if (isCrashState) {
//       // Update crash animation
//       updateCrashAnimation(delta);
//       return;
//     }
    
//     if (!uavRef.current) return;
    
//     // Update UAV position based on store
//     if (position && position.length === 3) {
//       uavRef.current.position.set(...position);
//     }
    
//     // Update UAV rotation based on store
//     if (rotation && rotation.length === 3) {
//       uavRef.current.rotation.set(...rotation);
//     }
    
//     // Update attack mission movement - DISABLED, handled in UAVController
//     // updateMissionMovement(delta);
    
//     // Update missiles in flight
//     updateMissiles(delta);
//   });
  
//   // Render crashed UAV if crashed
//   if (isCrashed || missionState === 'crashed') {
//     console.log('[AttackUAV] ✅ RENDERING CrashedUAV with position:', position);
//     return <CrashedUAV position={position} />;
//   }
  
//   console.log('[AttackUAV] Rendering normal UAV, missionState:', missionState);
  
//   return (
//     <>
//       {scene ? (
//         <primitive 
//           ref={uavRef}
//           object={scene.clone()}
//           scale={[0.08, 0.08, 0.08]}
//           castShadow
//         />
//       ) : (
//         <mesh ref={uavRef}>
//           <boxGeometry args={[1, 0.2, 1]} />
//           <meshStandardMaterial color="red" />
//         </mesh>
//       )}
      
//       <UavDamageSystem position={position} />
      
//       {(missionState === 'moving' || missionState === 'returning') && (
//         <mesh position={[0, -0.5, -1.5]} scale={[0.5, 0.5, 2]}>
//           <coneGeometry args={[1, 2, 16]} />
//           <meshBasicMaterial color="#ff6600" transparent opacity={0.7} />
//         </mesh>
//       )}
      
//       <MissileSystem />
//       <TargetLockSystem />
      
//       {activeMissiles.filter(m => m.flightProgress < 0.1).map(missile => (
//         <MissileLaunch 
//           key={missile.id} 
//           position={missile.position} 
//         />
//       ))}
//     </>
//   );
// };

// useGLTF.preload('/models/surveillance-uav/drone.glb');

// export default AttackUAV;


import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { useUAVStore } from '../../store/uavStore';
import { useAttackDroneStore } from '../../store/attackDroneStore';
import MissileSystem from './MissileSystem';
import TargetLockSystem from './TargetLockSystem';
import MissileLaunch from './WeaponryEffects/MissileLaunch';
import UavDamageSystem from '../anti-drone/UavDamageSystem';
import CrashedUAV from './CrashedUAV';

const AttackUAV = () => {
  const basePosition = [-45, 35, -40];
  const { position, rotation, isCrashed } = useUAVStore();
  
  const { scene } = useGLTF('/models/surveillance-uav/drone.glb');
  
  const uavRef = useRef();
  const { 
    activeMissiles, 
    updateMissiles, 
    initTargets, 
    updateMissionMovement,
    missionState,
    droneHealth,
    updateCrashAnimation
  } = useAttackDroneStore();
  
  useEffect(() => {
    console.log("AttackUAV mounted - initializing targets and position");
    initTargets();
    
    const currentPos = useUAVStore.getState().position;
    
    const isAtDefaultPosition = 
      Math.abs(currentPos[0]) < 0.1 && 
      Math.abs(currentPos[1] - 50) < 0.1 && 
      Math.abs(currentPos[2]) < 0.1;
    
    if (isAtDefaultPosition) {
      console.log("Spawning attack UAV at base position:", basePosition);
      useUAVStore.getState().setPosition(basePosition);
    }
  }, [initTargets]);
  
  useFrame((state, delta) => {
    // Check both crash states
    const isCrashState = isCrashed || missionState === 'crashed';
    
    if (isCrashState) {
      // Update crash animation
      updateCrashAnimation(delta);
      return;
    }
    
    if (!uavRef.current) return;
    
    // Update UAV position based on store
    if (position && position.length === 3) {
      uavRef.current.position.set(...position);
    }
    
    // Update UAV rotation based on store
    if (rotation && rotation.length === 3) {
      uavRef.current.rotation.set(...rotation);
    }
    
    // Update attack mission movement - DISABLED, handled in UAVController
    // updateMissionMovement(delta);
    
    // Update missiles in flight
    updateMissiles(delta);
  });
  
  // Render crashed UAV if crashed
  if (isCrashed || missionState === 'crashed') {
    console.log('[AttackUAV] ✅ RENDERING CrashedUAV with position:', position);
    return <CrashedUAV position={position} />;
  }
  
  console.log('[AttackUAV] Rendering normal UAV, missionState:', missionState);
  
  return (
    <>
      {scene ? (
        <primitive 
          ref={uavRef}
          object={scene.clone()}
          scale={[0.08, 0.08, 0.08]}
          castShadow
        />
      ) : (
        <mesh ref={uavRef}>
          <boxGeometry args={[1, 0.2, 1]} />
          <meshStandardMaterial color="red" />
        </mesh>
      )}
      
      <UavDamageSystem position={position} />
      
      {(missionState === 'moving' || missionState === 'returning') && (
        <mesh position={[0, -0.5, -1.5]} scale={[0.5, 0.5, 2]}>
          <coneGeometry args={[1, 2, 16]} />
          <meshBasicMaterial color="#ff6600" transparent opacity={0.7} />
        </mesh>
      )}
      
      <MissileSystem />
      <TargetLockSystem />
      
      {activeMissiles.filter(m => m.flightProgress < 0.1).map(missile => (
        <MissileLaunch 
          key={missile.id} 
          position={missile.position} 
        />
      ))}
    </>
  );
};

useGLTF.preload('/models/surveillance-uav/drone.glb');

export default AttackUAV;