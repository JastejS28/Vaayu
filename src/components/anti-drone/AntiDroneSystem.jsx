// // components/anti-drone/AntiDroneSystem.jsx
// import React, { useEffect, useRef, useState } from 'react';
// import { useUAVStore } from '../../store/uavStore';
// import { useAttackDroneStore } from '../../store/attackDroneStore';
// import DefenseRadar from './DefenseRadar';
// import AntiAircraftGun from './AntiAircraftGun';
// import DefenseProjectile from './DefenseProjectile';
// import DefenseBomb from './DefenseBomb';
// import * as THREE from 'three';

// const RADAR_RADIUS = 50; // Detection range
// const MIN_SAFE_ALTITUDE = 20; // Below this height, UAV is undetectable

// const AntiDroneSystem = ({ position, baseId }) => {
//   const { position: uavPosition, droneType } = useUAVStore();
//   const { missionState, setDroneDamage } = useAttackDroneStore();
  
//   const [isUavDetected, setIsUavDetected] = useState(false);
//   const [isDefenseActive, setIsDefenseActive] = useState(false);
//   const [targetPosition, setTargetPosition] = useState(null);
//   const [projectiles, setProjectiles] = useState([]);
//   const [bombs, setBombs] = useState([]);
//   const lastFireTime = useRef(Date.now()); // Initialize to prevent immediate fire on mount
//   const lastBombTime = useRef(Date.now()); // Initialize to prevent immediate fire on mount
//   const defenseSystemActive = useRef(true);
//   const prevTargetRef = useRef(null); // Ref to store the previous target position
//   const logRef = useRef({
//     lastLog: 0,
//     count: 0
//   });
  
//   // Check for UAV detection
//   useEffect(() => {
//     if (!uavPosition || droneType !== 'attack') {
//       if (isDefenseActive) { // If UAV is lost or changes type, deactivate
//         console.log("[AntiDroneSystem] UAV lost or no longer attack type. Deactivating defense.");
//         setIsDefenseActive(false);
//         setTargetPosition(null);
//         setIsUavDetected(false);
//       }
//       return;
//     }
    
//     const basePos = new THREE.Vector3(...position);
//     const uavPos = new THREE.Vector3(...uavPosition);
//     const distance = basePos.distanceTo(uavPos);
//     const uavAltitude = uavPos.y;
    
//     const isDetected = distance < RADAR_RADIUS && uavAltitude > MIN_SAFE_ALTITUDE;
    
//     if (isDetected && !isUavDetected) { // UAV just got detected
//         console.log("[AntiDroneSystem] UAV DETECTED at", uavPosition, "Distance:", distance.toFixed(2));
//     } else if (!isDetected && isUavDetected) { // UAV just got lost
//         console.log("[AntiDroneSystem] UAV LOST. Was at", targetPosition);
//     }
//     setIsUavDetected(isDetected);
    
//     if (isDetected && defenseSystemActive.current) {
//       if (!isDefenseActive) {
//         console.log("[AntiDroneSystem] Activating defense. Target:", uavPosition);
//       }
//       setIsDefenseActive(true);
//       setTargetPosition([...uavPosition]);
//     } else if (!isDetected && isDefenseActive) {
//       console.log("[AntiDroneSystem] Deactivating defense due to loss of detection.");
//       setIsDefenseActive(false);
//       setTargetPosition(null);
//     }
//   }, [uavPosition, position, droneType]); // REMOVED state that is set inside the effect

//   // Generate bombs and projectiles when defense is active
//   useEffect(() => {
//     if (!isDefenseActive || !targetPosition) {
//       // console.log("[AntiDroneSystem] Bomb/Projectile useEffect: SKIPPING - Defense not active or no target.");
//       return;
//     }
//     if (process.env.NODE_ENV === 'development' && targetPosition !== prevTargetRef.current) {
//       prevTargetRef.current = targetPosition;
//       console.log("[AntiDroneSystem] Target updated:", targetPosition);
//     }

//     const intervalId = setInterval(() => {
//       const now = Date.now();
      
//       // Fire projectile every 3 seconds
//       if (now - lastFireTime.current > 3000) {
//         lastFireTime.current = now;
//         const newProjectile = {
//           id: `projectile-${now}`,
//           startPosition: [...position], 
//           targetPosition: [...targetPosition] // Use the current targetPosition
//         };
//         setProjectiles(prev => [...prev, newProjectile]);
//         console.log("[AntiDroneSystem] Firing projectile:", newProjectile.id, "Target:", newProjectile.targetPosition);
//       }
      
//       // Drop bomb every 1.5 seconds for testing
//       if (now - lastBombTime.current > 1500) { // REDUCED INTERVAL
//         lastBombTime.current = now;
        
//         // FIX: Use the targetPosition from the component's state, not an undefined 'get' function.
//         const currentTarget = targetPosition; 
//         if (!currentTarget) {
//             console.log("[AntiDroneSystem] Bomb drop skipped: targetPosition is null.");
//             return;
//         }

//         const bombDropPosition = [
//           currentTarget[0], 
//           currentTarget[1] + 80, 
//           currentTarget[2]
//         ];
//         const newBomb = {
//           id: `bomb-${now}`,
//           startPosition: bombDropPosition,
//           targetPosition: [...currentTarget]
//         };
        
//         console.log("🔴 [AntiDroneSystem] DROPPING BOMB:", {
//           id: newBomb.id,
//           from: bombDropPosition,
//           to: newBomb.targetPosition,
//           bombsInStateBefore: bombs.length // Log current bombs length before update
//         });
        
//         setBombs(prevBombs => {
//           const updatedBombs = [...prevBombs, newBomb];
//           console.log("   💣 [AntiDroneSystem] Bombs state updated. New count:", updatedBombs.length);
//           return updatedBombs;
//         });
//       }
//     }, 500); // Check conditions every 500ms

//     return () => {
//       clearInterval(intervalId);
//     };
//   // Ensure dependencies are correct for re-running this effect if targetPosition changes
//   // or defense status changes. `position` is the defense system's own position.
//   // REMOVED `bombs` from dependency array to prevent infinite loop.
//   }, [isDefenseActive, targetPosition, position]);

//   // Clean up old projectiles and bombs
//   useEffect(() => {
//     const cleanupIntervalId = setInterval(() => {
//       // console.log("[AntiDroneSystem] Cleanup Effect: Current bombs:", bombs.length, "Current projectiles:", projectiles.length);
      
//       setProjectiles(prev => prev.filter(p => {
//         const projectileTime = parseInt(p.id.split('-').pop());
//         return Date.now() - projectileTime < 5000;
//       }));
      
//       setBombs(prev => prev.filter(b => {
//         const bombTime = parseInt(b.id.split('-').pop());
//         return Date.now() - bombTime < 10000; // Keep bombs for 10 seconds
//       }));
//     }, 5000);
    
//     return () => {
//       console.log("[AntiDroneSystem] Cleanup Effect: Clearing interval.");
//       clearInterval(cleanupIntervalId);
//     };
//   }, []); // This effect should run once on mount and clean up on unmount.
//            // Dependencies `bombs` and `projectiles` would cause it to re-run too often.

//   // Handle projectile completion
//   const handleProjectileComplete = (id) => {
//     console.log("[AntiDroneSystem] Projectile completed:", id);
//     setProjectiles(prev => prev.filter(p => p.id !== id));
//   };
  
//   // Handle bomb completion
//   const handleBombComplete = (id) => {
//     console.log("[AntiDroneSystem] Bomb explosion completed:", id);
//     setBombs(prev => prev.filter(b => b.id !== id));
//   };
  
//   // Replace frequent console.logs with this conditional logging helper
//   const conditionalLog = (message, data) => {
//     const now = Date.now();
//     if (now - logRef.current.lastLog > 5000) { // Log at most every 5 seconds
//       logRef.current.lastLog = now;
//       logRef.current.count = 0;
//       console.log(`[AntiDroneSystem] ${message}`, data);
//     } else {
//       logRef.current.count++;
//       // Only log the count on console every 100 skipped logs
//       if (logRef.current.count % 100 === 0) {
//         console.log(`[AntiDroneSystem] Skipped ${logRef.current.count} similar logs in last 5s`);
//       }
//     }
//   };

//   return (
//     <group position={position}>
//       {/* Base defense radar visualization */}
//       <DefenseRadar 
//         radius={RADAR_RADIUS} 
//         isActive={defenseSystemActive.current}
//         isTargetDetected={isUavDetected}
//       />
      
//       {/* Anti-aircraft gun - only show when UAV detected */}
//       {isDefenseActive && targetPosition && (
//         <AntiAircraftGun 
//           targetPosition={targetPosition} 
//           onFire={() => {}}
//         />
//       )}
      
//       {/* Projectiles in flight - give world coordinates */}
//       {projectiles.map(projectile => (
//         <DefenseProjectile
//           key={projectile.id}
//           startPosition={[
//             position[0], 
//             position[1] + 2,  
//             position[2]
//           ]}
//           targetPosition={projectile.targetPosition}
//           onComplete={() => handleProjectileComplete(projectile.id)}
//         />
//       ))}
      
//       {/* Bombs dropping - ensure they're rendered */}
//       {bombs.map(bomb => {
//         // This console.log will confirm if the map function is being called
//         // console.log("[AntiDroneSystem] Rendering DefenseBomb component for bomb ID:", bomb.id); 
//         return (
//           <DefenseBomb
//             key={bomb.id}
//             startPosition={bomb.startPosition}
//             targetPosition={bomb.targetPosition}
//             onComplete={() => handleBombComplete(bomb.id)}
//           />
//         );
//       })}
//     </group>
//   );
// };

// export default AntiDroneSystem;



// components/anti-drone/AntiDroneSystem.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useUAVStore } from '../../store/uavStore';
import { useAttackDroneStore } from '../../store/attackDroneStore';
import DefenseRadar from './DefenseRadar';
import AntiAircraftGun from './AntiAircraftGun';
import DefenseProjectile from './DefenseProjectile';
import DefenseBomb from './DefenseBomb';
import * as THREE from 'three';

const RADAR_RADIUS = 50; // Detection range
const MIN_SAFE_ALTITUDE = 20; // Below this height, UAV is undetectable

const AntiDroneSystem = ({ position, baseId }) => {
  const { position: uavPosition, droneType } = useUAVStore();
  const { missionState, setDroneDamage } = useAttackDroneStore();
  
  const [isUavDetected, setIsUavDetected] = useState(false);
  const [isDefenseActive, setIsDefenseActive] = useState(false);
  const [targetPosition, setTargetPosition] = useState(null);
  const [projectiles, setProjectiles] = useState([]);
  const [bombs, setBombs] = useState([]);
  const lastFireTime = useRef(Date.now()); // Initialize to prevent immediate fire on mount
  const lastBombTime = useRef(Date.now()); // Initialize to prevent immediate fire on mount
  const defenseSystemActive = useRef(true);
  const prevTargetRef = useRef(null); // Ref to store the previous target position
  const logRef = useRef({
    lastLog: 0,
    count: 0
  });
  const manualFireRef = useRef(false); // Track manual firing
  
  // Listen for manual defense activation
  useEffect(() => {
    const handleManualDefenseActivation = (event) => {
      console.log('[AntiDroneSystem] Manual defense activation received:', event.detail);
      
      // Check if UAV is in range and above minimum altitude
      if (uavPosition && droneType === 'attack') {
        const basePos = new THREE.Vector3(...position);
        const uavPos = new THREE.Vector3(...uavPosition);
        const distance = basePos.distanceTo(uavPos);
        const uavAltitude = uavPos.y;
        
        if (distance < RADAR_RADIUS && uavAltitude > MIN_SAFE_ALTITUDE) {
          console.log('[AntiDroneSystem] Manual missile launch authorized - UAV in range');
          console.log('[AntiDroneSystem] UAV details:', { position: uavPosition, altitude: uavAltitude, distance: distance });
          
          // Fire missile immediately
          const now = Date.now();
          const newProjectile = {
            id: `manual-projectile-${now}`,
            startPosition: [...position],
            targetPosition: [...uavPosition]
          };
          setProjectiles(prev => [...prev, newProjectile]);
          console.log('[AntiDroneSystem] Manual missile fired:', newProjectile.id, 'from:', position, 'to:', uavPosition);
          
          // Set manual fire flag to prevent automatic firing for a short time
          manualFireRef.current = true;
          setTimeout(() => {
            manualFireRef.current = false;
          }, 3000);
        } else {
          console.log('[AntiDroneSystem] Manual missile launch denied - UAV out of range or too low');
        }
      } else {
        console.log('[AntiDroneSystem] Manual missile launch denied - no attack UAV detected');
      }
    };
    
    window.addEventListener('manualDefenseActivation', handleManualDefenseActivation);
    
    return () => {
      window.removeEventListener('manualDefenseActivation', handleManualDefenseActivation);
    };
  }, [uavPosition, droneType, position]);
  
  // Check for UAV detection
  useEffect(() => {
    if (!uavPosition || droneType !== 'attack') {
      if (isDefenseActive) { // If UAV is lost or changes type, deactivate
        console.log("[AntiDroneSystem] UAV lost or no longer attack type. Deactivating defense.");
        setIsDefenseActive(false);
        setTargetPosition(null);
        setIsUavDetected(false);
      }
      return;
    }
    
    const basePos = new THREE.Vector3(...position);
    const uavPos = new THREE.Vector3(...uavPosition);
    const distance = basePos.distanceTo(uavPos);
    const uavAltitude = uavPos.y;
    
    const isDetected = distance < RADAR_RADIUS && uavAltitude > MIN_SAFE_ALTITUDE;
    
    if (isDetected && !isUavDetected) { // UAV just got detected
        console.log("[AntiDroneSystem] UAV DETECTED at", uavPosition, "Distance:", distance.toFixed(2));
    } else if (!isDetected && isUavDetected) { // UAV just got lost
        console.log("[AntiDroneSystem] UAV LOST. Was at", targetPosition);
    }
    setIsUavDetected(isDetected);
    
    if (isDetected && defenseSystemActive.current) {
      if (!isDefenseActive) {
        console.log("[AntiDroneSystem] Activating defense. Target:", uavPosition);
      }
      setIsDefenseActive(true);
      setTargetPosition([...uavPosition]);
    } else if (!isDetected && isDefenseActive) {
      console.log("[AntiDroneSystem] Deactivating defense due to loss of detection.");
      setIsDefenseActive(false);
      setTargetPosition(null);
    }
  }, [uavPosition, position, droneType]); // REMOVED state that is set inside the effect

  // DISABLED: Automatic projectile firing - only manual firing allowed
  // Generate bombs and projectiles when defense is active
  useEffect(() => {
    if (!isDefenseActive || !targetPosition) {
      // console.log("[AntiDroneSystem] Bomb/Projectile useEffect: SKIPPING - Defense not active or no target.");
      return;
    }
    if (process.env.NODE_ENV === 'development' && targetPosition !== prevTargetRef.current) {
      prevTargetRef.current = targetPosition;
      console.log("[AntiDroneSystem] Target updated:", targetPosition);
    }
  }, [isDefenseActive, targetPosition, position]);

  // Clean up old projectiles and bombs
  useEffect(() => {
    const cleanupIntervalId = setInterval(() => {
      // console.log("[AntiDroneSystem] Cleanup Effect: Current bombs:", bombs.length, "Current projectiles:", projectiles.length);
      
      setProjectiles(prev => prev.filter(p => {
        const projectileTime = parseInt(p.id.split('-').pop());
        return Date.now() - projectileTime < 5000;
      }));
      
      setBombs(prev => prev.filter(b => {
        const bombTime = parseInt(b.id.split('-').pop());
        return Date.now() - bombTime < 10000; // Keep bombs for 10 seconds
      }));
    }, 5000);
    
    return () => {
      console.log("[AntiDroneSystem] Cleanup Effect: Clearing interval.");
      clearInterval(cleanupIntervalId);
    };
  }, []); // This effect should run once on mount and clean up on unmount.
           // Dependencies `bombs` and `projectiles` would cause it to re-run too often.

  // Handle projectile completion
  const handleProjectileComplete = (id) => {
    console.log("[AntiDroneSystem] Projectile completed:", id);
    setProjectiles(prev => prev.filter(p => p.id !== id));
  };
  
  // Handle bomb completion
  const handleBombComplete = (id) => {
    console.log("[AntiDroneSystem] Bomb explosion completed:", id);
    setBombs(prev => prev.filter(b => b.id !== id));
    
    // Check if UAV is still in range and set crashed
    const currentUAVPos = useUAVStore.getState().position;
    if (currentUAVPos && useUAVStore.getState().droneType === 'attack') {
      useUAVStore.getState().setCrashed(true, 'Shot down by anti-drone bomb');
      setDroneDamage({
        type: 'bomb',
        damage: 100,
        duration: 5000
      });
    }
  };
  
  // Replace frequent console.logs with this conditional logging helper
  const conditionalLog = (message, data) => {
    const now = Date.now();
    if (now - logRef.current.lastLog > 5000) { // Log at most every 5 seconds
      logRef.current.lastLog = now;
      logRef.current.count = 0;
      console.log(`[AntiDroneSystem] ${message}`, data);
    } else {
      logRef.current.count++;
      // Only log the count on console every 100 skipped logs
      if (logRef.current.count % 100 === 0) {
        console.log(`[AntiDroneSystem] Skipped ${logRef.current.count} similar logs in last 5s`);
      }
    }
  };

  return (
    <group position={position}>
      {/* Base defense radar visualization */}
      <DefenseRadar 
        radius={RADAR_RADIUS} 
        isActive={defenseSystemActive.current}
        isTargetDetected={isUavDetected}
      />
      
      {/* Anti-aircraft gun - only show when UAV detected */}
      {isDefenseActive && targetPosition && (
        <AntiAircraftGun 
          targetPosition={targetPosition} 
          onFire={() => {}}
        />
      )}
      
      {/* Projectiles in flight - give world coordinates */}
      {projectiles.map(projectile => (
        <DefenseProjectile
          key={projectile.id}
          startPosition={[
            position[0], 
            position[1] + 2,  
            position[2]
          ]}
          targetPosition={projectile.targetPosition}
          onComplete={() => handleProjectileComplete(projectile.id)}
        />
      ))}
      
      {/* Bombs dropping - ensure they're rendered */}
      {bombs.map(bomb => {
        // This console.log will confirm if the map function is being called
        // console.log("[AntiDroneSystem] Rendering DefenseBomb component for bomb ID:", bomb.id); 
        return (
          <DefenseBomb
            key={bomb.id}
            startPosition={bomb.startPosition}
            targetPosition={bomb.targetPosition}
            onComplete={() => handleBombComplete(bomb.id)}
          />
        );
      })}
    </group>
  );
};

export default AntiDroneSystem;