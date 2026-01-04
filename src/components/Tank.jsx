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

// const Tank = ({ position, id = 'tank-1' }) => {
//   const { scene } = useGLTF('/models/tank/tank.glb');
//   const { addTarget, position: uavPosition, targets } = useUAVStore();
//   const { destroyedTargets } = useAttackDroneStore();
//   const alreadyDetected = useRef(false);
//   const [showEffect, setShowEffect] = useState(false);

//   const tankId = useRef(`tank-${position[0]}-${position[1]}-${position[2]}`);

//   useEffect(() => {
//     if (targets && targets.some(target => target.id === tankId.current)) {
//       alreadyDetected.current = true;
//     }
//   }, [targets]);

//   useFrame(() => {
//     if (alreadyDetected.current) return;

//     const tankWorldPosition = new THREE.Vector3(...position);
//     const currentUAVPosition = new THREE.Vector3(...uavPosition);
//     const distance = tankWorldPosition.distanceTo(currentUAVPosition);

//     if (distance < SCAN_RADIUS) {
//       const isAlreadyMarked = targets.some(target => target.id === tankId.current);
//       if (!isAlreadyMarked) {
//         const newTarget = {
//           id: tankId.current,
//           position: position,
//           type: 'tank',
//         };
//         addTarget(newTarget);
//         alreadyDetected.current = true;
//         setShowEffect(true);
//         setTimeout(() => setShowEffect(false), 3000);
//       }
//     }
//   });

//   const isDestroyed = destroyedTargets.includes(id) || destroyedTargets.includes(tankId.current);
  
//   if (isDestroyed) {
//     return (
//       <>
//         <DestroyedTarget position={position} targetType="tank" />
//         <FireEffect position={[position[0], position[1] + 0.2, position[2]]} intensity={1.2} />
//       </>
//     );
//   }

//   return (
//     <>
//       <primitive object={scene} position={position} scale={[0.5, 0.5, 0.5]} />
//       {showEffect && <DetectionEffect position={position} />}
//     </>
//   );
// };

// useGLTF.preload('/models/tank/tank.glb');
// export default Tank;

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

const Tank = ({ position, id = 'tank-1' }) => {
  const { scene } = useGLTF('/models/tank/tank.glb');
  const { addTarget, position: uavPosition, targets } = useUAVStore();
  const { destroyedTargets } = useAttackDroneStore();
  const alreadyDetected = useRef(false);
  const [showEffect, setShowEffect] = useState(false);

  const tankId = useRef(`tank-${position[0]}-${position[1]}-${position[2]}`);

  useEffect(() => {
    if (targets && targets.some(target => target.id === tankId.current)) {
      alreadyDetected.current = true;
    }
  }, [targets]);

  useFrame(() => {
    if (alreadyDetected.current) return;

    const tankWorldPosition = new THREE.Vector3(...position);
    const currentUAVPosition = new THREE.Vector3(...uavPosition);
    const distance = tankWorldPosition.distanceTo(currentUAVPosition);

    if (distance < SCAN_RADIUS) {
      const isAlreadyMarked = targets.some(target => target.id === tankId.current);
      if (!isAlreadyMarked) {
        const newTarget = {
          id: tankId.current,
          position: position,
          type: 'tank',
        };
        addTarget(newTarget);
        alreadyDetected.current = true;
        setShowEffect(true);
        setTimeout(() => setShowEffect(false), 3000);
      }
    }
  });

  const isDestroyed = destroyedTargets.includes(id) || destroyedTargets.includes(tankId.current);
  
  if (isDestroyed) {
    return (
      <>
        <DestroyedTarget position={position} targetType="tank" />
        <FireEffect position={[position[0], position[1] + 0.2, position[2]]} intensity={1.2} />
      </>
    );
  }

  return (
    <>
      <primitive object={scene} position={position} scale={[0.5, 0.5, 0.5]} />
      {showEffect && <DetectionEffect position={position} />}
    </>
  );
};

useGLTF.preload('/models/tank/tank.glb');
export default Tank;