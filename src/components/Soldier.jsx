// import React, { useRef, useState, useEffect } from 'react';
// import { useGLTF } from '@react-three/drei';
// import { useUAVStore } from '../store/uavStore';
// import { useAttackDroneStore } from '../store/attackDroneStore';
// import { useFrame } from '@react-three/fiber';
// import * as THREE from 'three';
// import DetectionEffect from './DetectionEffect';
// import DestroyedTarget from './attack-drone/DestroyedTarget';
// import FireEffect from './attack-drone/FireEffect';


// const SCAN_RADIUS = 20;

// const Soldier = ({ position, id = 'soldier-1' }) => {
//   const { scene } = useGLTF('/models/soldier/soldier.glb');
//   const { addTarget, position: uavPosition, targets } = useUAVStore();
//   const { destroyedTargets } = useAttackDroneStore();
//   const alreadyDetected = useRef(false);
//   const [showEffect, setShowEffect] = useState(false);

//   const soldierId = useRef(`soldier-${position[0]}-${position[1]}-${position[2]}`);

//   useEffect(() => {
//     if (targets && targets.some(target => target.id === soldierId.current)) {
//       alreadyDetected.current = true;
//     }
//   }, [targets]);

//   useFrame(() => {
//     const isDestroyed = destroyedTargets.includes(id) || destroyedTargets.includes(soldierId.current);
//     if (isDestroyed) return;

//     // Detection logic
//     if (!alreadyDetected.current) {
//       const soldierWorldPosition = new THREE.Vector3(...position);
//       const currentUAVPosition = new THREE.Vector3(...uavPosition);
//       const distance = soldierWorldPosition.distanceTo(currentUAVPosition);

//       if (distance < SCAN_RADIUS) {
//         const isAlreadyMarked = targets.some(target => target.id === soldierId.current);

//         if (!isAlreadyMarked) {
//           const newTarget = {
//             id: soldierId.current,
//             position: position,
//             type: 'soldier',
//           };
//           addTarget(newTarget);
//           alreadyDetected.current = true;
//           setShowEffect(true);
//           setTimeout(() => setShowEffect(false), 3000);
//         }
//       }
//     }
//   });

//   const isDestroyed = destroyedTargets.includes(id) || destroyedTargets.includes(soldierId.current);
  
//   if (isDestroyed) {
//     return (
//       <>
//         <DestroyedTarget position={scene.position.toArray()} targetType="soldier" />
//         <FireEffect position={[scene.position.x, scene.position.y + 0.5, scene.position.z]} intensity={0.6} />
//       </>
//     );
//   }

//   return (
//     <>
//       <primitive 
//         object={scene} 
//         position={position}
//         scale={[0.2, 0.2, 0.2]}
//       />
//       {showEffect && <DetectionEffect position={scene.position.toArray()} />}
//     </>
//   );
// };

// useGLTF.preload('/models/soldier/soldier.glb');
// export default Soldier;


import React, { useRef, useState, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { useUAVStore } from '../store/uavStore';
import { useAttackDroneStore } from '../store/attackDroneStore';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import DetectionEffect from './DetectionEffect';
import DestroyedTarget from './attack-drone/DestroyedTarget';
import FireEffect from './attack-drone/FireEffect';


const SCAN_RADIUS = 20;

const Soldier = ({ position, id = 'soldier-1' }) => {
  const { scene } = useGLTF('/models/soldier/soldier.glb');
  const { addTarget, position: uavPosition, targets } = useUAVStore();
  const { destroyedTargets } = useAttackDroneStore();
  const alreadyDetected = useRef(false);
  const [showEffect, setShowEffect] = useState(false);

  const soldierId = useRef(`soldier-${position[0]}-${position[1]}-${position[2]}`);

  useEffect(() => {
    if (targets && targets.some(target => target.id === soldierId.current)) {
      alreadyDetected.current = true;
    }
  }, [targets]);

  useFrame(() => {
    const isDestroyed = destroyedTargets.includes(id) || destroyedTargets.includes(soldierId.current);
    if (isDestroyed) return;

    // Detection logic
    if (!alreadyDetected.current) {
      const soldierWorldPosition = new THREE.Vector3(...position);
      const currentUAVPosition = new THREE.Vector3(...uavPosition);
      const distance = soldierWorldPosition.distanceTo(currentUAVPosition);

      if (distance < SCAN_RADIUS) {
        const isAlreadyMarked = targets.some(target => target.id === soldierId.current);

        if (!isAlreadyMarked) {
          const newTarget = {
            id: soldierId.current,
            position: position,
            type: 'soldier',
          };
          addTarget(newTarget);
          alreadyDetected.current = true;
          setShowEffect(true);
          setTimeout(() => setShowEffect(false), 3000);
        }
      }
    }
  });

  const isDestroyed = destroyedTargets.includes(id) || destroyedTargets.includes(soldierId.current);
  
  if (isDestroyed) {
    return (
      <>
        <DestroyedTarget position={scene.position.toArray()} targetType="soldier" />
        <FireEffect position={[scene.position.x, scene.position.y + 0.5, scene.position.z]} intensity={0.6} />
      </>
    );
  }

  return (
    <>
      <primitive 
        object={scene} 
        position={position}
        scale={[0.2, 0.2, 0.2]}
      />
      {showEffect && <DetectionEffect position={scene.position.toArray()} />}
    </>
  );
};

useGLTF.preload('/models/soldier/soldier.glb');
export default Soldier;