// import React, { useRef, useState, useEffect } from 'react';
// import { useGLTF } from '@react-three/drei';
// import { useUAVStore } from '../store/uavStore';
// import { useFrame } from '@react-three/fiber';
// import * as THREE from 'three';
// import DetectionEffect from './DetectionEffect';
// import DestroyedTarget from './attack-drone/DestroyedTarget';
// import { useAttackDroneStore } from '../store/attackDroneStore';

// const SCAN_RADIUS = 20;

// const Warehouse = ({ position, id = 'warehouse-1' }) => {
//   const { scene } = useGLTF('/models/building/warehouse.glb');
//   const { addTarget, position: uavPosition, targets } = useUAVStore();
//   const { destroyedTargets } = useAttackDroneStore();
//   const alreadyDetected = useRef(false);
//   const [showEffect, setShowEffect] = useState(false);

//   const warehouseId = useRef(`warehouse-${position[0]}-${position[1]}-${position[2]}`);
//   const myArrayRef = useRef([]); // Initialize the ref with an empty array

//   useEffect(() => {
//     if (targets && targets.some(target => target.id === warehouseId.current)) {
//       alreadyDetected.current = true;
//     }
//   }, [targets]);

//   // When setting up the ref
//   useEffect(() => {
//     myArrayRef.current = targets || []; // Always ensure it's at least an empty array
//   }, [targets]);

//   // When using the ref
//   useEffect(() => {
//     // This is now safe because the ref is always at least an empty array
//     const hasMatchingItems = myArrayRef.current.some(item => item.matches);

//     if (hasMatchingItems) {
//       // Do something
//     }
//   }, [targets]);

//   useFrame(() => {
//     if (destroyedTargets.includes(warehouseId.current)) {
//       scene.visible = false;
//       return;
//     } else {
//       scene.visible = true;
//     }

//     if (alreadyDetected.current) return;

//     const warehouseWorldPosition = new THREE.Vector3(...position);
//     const currentUAVPosition = new THREE.Vector3(...uavPosition);
//     const distance = warehouseWorldPosition.distanceTo(currentUAVPosition);

//     if (distance < SCAN_RADIUS) {
//       const isAlreadyMarked = targets.some(target => target.id === warehouseId.current);
//       if (!isAlreadyMarked) {
//         const newTarget = {
//           id: warehouseId.current,
//           position: position,
//           type: 'warehouse',
//         };
//         addTarget(newTarget);
//         alreadyDetected.current = true;
//         setShowEffect(true);
//         setTimeout(() => setShowEffect(false), 3000);
//         console.log('Warehouse automatically marked:', newTarget);
//       }
//     }
//   });

//   if (destroyedTargets.includes(warehouseId.current)) {
//     return <DestroyedTarget position={position} targetType="warehouse" />;
//   }

//   return (
//     <>
//       <primitive object={scene} position={position} scale={[0.7, 0.7, 0.7]} />
//       {showEffect && <DetectionEffect position={position} />}
//     </>
//   );
// };

// useGLTF.preload('/models/building/warehouse.glb');

// export default Warehouse;


import React, { useRef, useState, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { useUAVStore } from '../store/uavStore';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import DetectionEffect from './DetectionEffect';
import DestroyedTarget from './attack-drone/DestroyedTarget';
import { useAttackDroneStore } from '../store/attackDroneStore';

const SCAN_RADIUS = 20;

const Warehouse = ({ position, id = 'warehouse-1' }) => {
  const { scene } = useGLTF('/models/building/warehouse.glb');
  const { addTarget, position: uavPosition, targets } = useUAVStore();
  const { destroyedTargets } = useAttackDroneStore();
  const alreadyDetected = useRef(false);
  const [showEffect, setShowEffect] = useState(false);

  const warehouseId = useRef(`warehouse-${position[0]}-${position[1]}-${position[2]}`);
  const myArrayRef = useRef([]); // Initialize the ref with an empty array

  useEffect(() => {
    if (targets && targets.some(target => target.id === warehouseId.current)) {
      alreadyDetected.current = true;
    }
  }, [targets]);

  // When setting up the ref
  useEffect(() => {
    myArrayRef.current = targets || []; // Always ensure it's at least an empty array
  }, [targets]);

  // When using the ref
  useEffect(() => {
    // This is now safe because the ref is always at least an empty array
    const hasMatchingItems = myArrayRef.current.some(item => item.matches);

    if (hasMatchingItems) {
      // Do something
    }
  }, [targets]);

  useFrame(() => {
    if (destroyedTargets.includes(warehouseId.current)) {
      scene.visible = false;
      return;
    } else {
      scene.visible = true;
    }

    if (alreadyDetected.current) return;

    const warehouseWorldPosition = new THREE.Vector3(...position);
    const currentUAVPosition = new THREE.Vector3(...uavPosition);
    const distance = warehouseWorldPosition.distanceTo(currentUAVPosition);

    if (distance < SCAN_RADIUS) {
      const isAlreadyMarked = targets.some(target => target.id === warehouseId.current);
      if (!isAlreadyMarked) {
        const newTarget = {
          id: warehouseId.current,
          position: position,
          type: 'warehouse',
        };
        addTarget(newTarget);
        alreadyDetected.current = true;
        setShowEffect(true);
        setTimeout(() => setShowEffect(false), 3000);
        console.log('Warehouse automatically marked:', newTarget);
      }
    }
  });

  if (destroyedTargets.includes(warehouseId.current)) {
    return <DestroyedTarget position={position} targetType="warehouse" />;
  }

  return (
    <>
      <primitive object={scene} position={position} scale={[0.7, 0.7, 0.7]} />
      {showEffect && <DetectionEffect position={position} />}
    </>
  );
};

useGLTF.preload('/models/building/warehouse.glb');

export default Warehouse;