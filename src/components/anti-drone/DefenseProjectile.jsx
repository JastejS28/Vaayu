// import React, { useRef, useEffect } from 'react';
// import { useFrame } from '@react-three/fiber';
// import * as THREE from 'three';

// const DefenseProjectile = ({ startPosition, targetPosition, onComplete }) => {
//   const projectileRef = useRef();
//   const startTime = useRef(Date.now());
//   const flightDuration = 1.0; // 1 second flight time
//   const trailPoints = useRef([]);
//   const trailRefs = useRef([]); // Refs for each trail segment

//   useFrame((state) => {
//     if (!projectileRef.current) return;

//     const elapsed = (Date.now() - startTime.current) / 1000;
//     const progress = Math.min(elapsed / flightDuration, 1);

//     // Linear interpolation for position
//     const start = new THREE.Vector3(...startPosition);
//     const end = new THREE.Vector3(...targetPosition);
//     const currentPos = new THREE.Vector3().lerpVectors(start, end, progress);
//     projectileRef.current.position.copy(currentPos);

//     // Add a new point to the trail
//     if (progress < 1) {
//         trailPoints.current.push({
//             position: currentPos.clone(),
//             time: state.clock.elapsedTime
//         });
//         if (trailPoints.current.length > 15) {
//             trailPoints.current.shift();
//         }
//     }
    
//     // Update opacity of existing trail segments
//     trailRefs.current.forEach((ref, index) => {
//         if (ref) {
//             const point = trailPoints.current[index];
//             if (point) {
//                 const age = state.clock.elapsedTime - point.time;
//                 ref.material.opacity = Math.max(0, 0.8 - age * 2);
//             }
//         }
//     });

//     if (progress >= 1) {
//       onComplete?.();
//     }
//   });

//   return (
//     <group>
//       <mesh ref={projectileRef}>
//         <sphereGeometry args={[0.2, 8, 8]} />
//         <meshBasicMaterial color="yellow" />
//       </mesh>
      
//       {/* Render trail points */}
//       {trailPoints.current.map((point, i) => (
//         <mesh key={i} ref={el => trailRefs.current[i] = el} position={point.position}>
//           <sphereGeometry args={[0.1, 4, 4]} />
//           <meshBasicMaterial
//             color="yellow"
//             transparent={true}
//             opacity={0.8} 
//           />
//         </mesh>
//       ))}
//     </group>
//   );
// };

// export default DefenseProjectile;



import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useUAVStore } from '../../store/uavStore';
import { useAttackDroneStore } from '../../store/attackDroneStore';

const DefenseProjectile = ({ startPosition, targetPosition, onComplete }) => {
  const projectileRef = useRef();
  const startTime = useRef(Date.now());
  const flightDuration = 1.0; // 1 second flight time
  const trailPoints = useRef([]);
  const trailRefs = useRef([]); // Refs for each trail segment
  const hasHit = useRef(false);

  // Get UAV store functions
  const { position: uavPosition, droneType, setCrashed } = useUAVStore();
  const { setDroneDamage } = useAttackDroneStore();

  useFrame((state) => {
    if (!projectileRef.current) return;

    const elapsed = (Date.now() - startTime.current) / 1000;
    const progress = Math.min(elapsed / flightDuration, 1);

    // Linear interpolation for position
    const start = new THREE.Vector3(...startPosition);
    const end = new THREE.Vector3(...targetPosition);
    const currentPos = new THREE.Vector3().lerpVectors(start, end, progress);
    projectileRef.current.position.copy(currentPos);

    // REAL-TIME HIT DETECTION: Check for collision during flight, not just at the end
    if (!hasHit.current && uavPosition && droneType === 'attack') {
      const currentUAVPos = new THREE.Vector3(...uavPosition);
      const distance = currentPos.distanceTo(currentUAVPos);
      
      // If missile gets close to UAV during flight, it's a hit
      if (distance < 8) { // 8 unit hit radius for accurate detection
        hasHit.current = true;
        console.log('[DefenseProjectile] HIT! UAV crashed by missile during flight at distance:', distance);
        
        // DEBUG: Check UAV state before setting crash
        console.log('[DefenseProjectile] UAV state before crash:', {
          position: uavPosition,
          droneType: droneType,
          isCrashed: useUAVStore.getState().isCrashed
        });
        
        // Set UAV as crashed
        setCrashed(true, 'Shot down by anti-drone missile');
        
        // DEBUG: Check UAV state after setting crash
        console.log('[DefenseProjectile] UAV state after crash:', {
          isCrashed: useUAVStore.getState().isCrashed,
          crashReason: useUAVStore.getState().crashReason
        });
        
        // Set drone damage for visual effects
        setDroneDamage({
          type: 'missile',
          damage: 100,
          duration: 5000
        });
        
        // Complete the missile immediately on hit
        onComplete?.();
        return;
      }
    }

    // Add a new point to the trail
    if (progress < 1) {
      trailPoints.current.push({
        position: currentPos.clone(),
        time: state.clock.elapsedTime
      });
      if (trailPoints.current.length > 15) {
        trailPoints.current.shift();
      }
    }

    // Update opacity of existing trail segments
    trailRefs.current.forEach((ref, index) => {
      if (ref) {
        const point = trailPoints.current[index];
        if (point) {
          const age = state.clock.elapsedTime - point.time;
          ref.material.opacity = Math.max(0, 0.8 - age * 2);
        }
      }
    });

    // If missile completes flight without hitting, it's a miss
    if (progress >= 1 && !hasHit.current) {
      hasHit.current = true;
      console.log('[DefenseProjectile] MISS! Missile reached target but did not hit UAV');
      onComplete?.();
    }
  });

  return (
    <group>
      <mesh ref={projectileRef}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshBasicMaterial color="yellow" />
      </mesh>
      
      {/* Render trail points */}
      {trailPoints.current.map((point, i) => (
        <mesh key={i} ref={el => trailRefs.current[i] = el} position={point.position}>
          <sphereGeometry args={[0.1, 4, 4]} />
          <meshBasicMaterial
            color="yellow"
            transparent={true}
            opacity={0.8} 
          />
        </mesh>
      ))}
    </group>
  );
};

export default DefenseProjectile;