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

// const Jeep = ({ position, id = 'jeep-1' }) => {
//   const { scene } = useGLTF('/models/jeep/jeep.glb');
//   const { addTarget, position: uavPosition, targets } = useUAVStore();
//   const { destroyedTargets } = useAttackDroneStore();
//   const alreadyDetected = useRef(false);
//   const [showEffect, setShowEffect] = useState(false);

//   const jeepId = useRef(`jeep-${position[0]}-${position[1]}-${position[2]}`);

//   useEffect(() => {
//     if (targets && targets.some(target => target.id === jeepId.current)) {
//       alreadyDetected.current = true;
//     }
//   }, [targets]);

//   useFrame(() => {
//     if (alreadyDetected.current) return;

//     const jeepWorldPosition = new THREE.Vector3(...position);
//     const currentUAVPosition = new THREE.Vector3(...uavPosition);
//     const distance = jeepWorldPosition.distanceTo(currentUAVPosition);

//     if (distance < SCAN_RADIUS) {
//       const isAlreadyMarked = targets.some(target => target.id === jeepId.current);
//       if (!isAlreadyMarked) {
//         const newTarget = {
//           id: jeepId.current,
//           position: position,
//           type: 'jeep',
//         };
//         addTarget(newTarget);
//         alreadyDetected.current = true;
//         setShowEffect(true);
//         setTimeout(() => setShowEffect(false), 3000);
//       }
//     }
//   });

//   const isDestroyed = destroyedTargets.includes(id) || destroyedTargets.includes(jeepId.current);
  
//   if (isDestroyed) {
//     return (
//       <>
//         <DestroyedTarget position={position} targetType="jeep" />
//         <FireEffect position={[position[0], position[1] + 0.3, position[2]]} intensity={0.8} />
//       </>
//     );
//   }

//   return (
//     <>
//       <primitive object={scene} position={position} scale={[0.03, 0.03, 0.03]} />
//       {showEffect && <DetectionEffect position={position} />}
//     </>
//   );
// };

// useGLTF.preload('/models/jeep/jeep.glb');
// export default Jeep;


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

const Jeep = ({ position, id = 'jeep-1' }) => {
  const { scene } = useGLTF('/models/jeep/jeep.glb');
  const { addTarget, position: uavPosition, targets } = useUAVStore();
  const { destroyedTargets } = useAttackDroneStore();
  const alreadyDetected = useRef(false);
  const [showEffect, setShowEffect] = useState(false);

  const jeepId = useRef(`jeep-${position[0]}-${position[1]}-${position[2]}`);

  useEffect(() => {
    if (targets && targets.some(target => target.id === jeepId.current)) {
      alreadyDetected.current = true;
    }
  }, [targets]);

  useFrame(() => {
    if (alreadyDetected.current) return;

    const jeepWorldPosition = new THREE.Vector3(...position);
    const currentUAVPosition = new THREE.Vector3(...uavPosition);
    const distance = jeepWorldPosition.distanceTo(currentUAVPosition);

    if (distance < SCAN_RADIUS) {
      const isAlreadyMarked = targets.some(target => target.id === jeepId.current);
      if (!isAlreadyMarked) {
        const newTarget = {
          id: jeepId.current,
          position: position,
          type: 'jeep',
        };
        addTarget(newTarget);
        alreadyDetected.current = true;
        setShowEffect(true);
        setTimeout(() => setShowEffect(false), 3000);
      }
    }
  });

  const isDestroyed = destroyedTargets.includes(id) || destroyedTargets.includes(jeepId.current);
  
  if (isDestroyed) {
    return (
      <>
        <DestroyedTarget position={position} targetType="jeep" />
        <FireEffect position={[position[0], position[1] + 0.3, position[2]]} intensity={0.8} />
      </>
    );
  }

  return (
    <>
      <primitive object={scene} position={position} scale={[0.03, 0.03, 0.03]} />
      {showEffect && <DetectionEffect position={position} />}
    </>
  );
};

useGLTF.preload('/models/jeep/jeep.glb');
export default Jeep;