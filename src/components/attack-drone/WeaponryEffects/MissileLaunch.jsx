import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import ModelExplosion from './ModelExplosion';
import { useAttackDroneStore } from '../../../store/attackDroneStore';

const MissileLaunch = ({ startPosition, targetPosition, onComplete }) => {
  const missileRef = useRef();
  const startTime = useRef(Date.now());
  const [exploding, setExploding] = useState(false);
  const explosionPosition = useRef(targetPosition);
  const [soundPlayed, setSoundPlayed] = useState(false);
  const flightDuration = 2.5; // seconds
  const explosionDelay = 0; // seconds - visual explosion happens 4 seconds AFTER sound

  // ADDED: Validation for required parameters
  if (!startPosition || !targetPosition || !Array.isArray(startPosition) || !Array.isArray(targetPosition)) {
    console.warn('MissileLaunch: Invalid startPosition or targetPosition', { startPosition, targetPosition });
    return null; // Don't render if parameters are invalid
  }

  useEffect(() => {
    // Play launch sound
    try {
      const audio = new Audio('/sounds/explo.mp3');
      audio.volume = 0.5;
      audio.play().catch(e => console.log('Failed to play launch sound:', e));
    } catch (error) {
      console.log("Error playing launch sound:", error);
    }
  }, []);

  useFrame(() => {
    const elapsed = (Date.now() - startTime.current) / 1000;
    
    // If we're in flight and not exploding yet
    if (missileRef.current && !exploding) {
      // Calculate flight progress (0 to 1)
      const progress = Math.min(elapsed / flightDuration, 1);
      
      // FIXED: Added validation before accessing array indices
      if (startPosition && targetPosition && startPosition.length >= 3 && targetPosition.length >= 3) {
        // Bezier curve flight path
        const controlPoint = [
          startPosition[0] + (targetPosition[0] - startPosition[0]) * 0.5,
          startPosition[1] + 10, // Rise higher in the middle
          startPosition[2] + (targetPosition[2] - startPosition[2]) * 0.5
        ];
        
        // Interpolate position along curve
        const t = progress;
        const mt = 1 - t;
        
        const x = mt*mt * startPosition[0] + 2*mt*t * controlPoint[0] + t*t * targetPosition[0];
        const y = mt*mt * startPosition[1] + 2*mt*t * controlPoint[1] + t*t * targetPosition[1];
        const z = mt*mt * startPosition[2] + 2*mt*t * controlPoint[2] + t*t * targetPosition[2];
        
        // Set missile position
        missileRef.current.position.set(x, y, z);
        
        // Orient missile towards target
        const direction = new THREE.Vector3(
          targetPosition[0] - x,
          targetPosition[1] - y,
          targetPosition[2] - z
        ).normalize();
        
        missileRef.current.lookAt(
          missileRef.current.position.x + direction.x,
          missileRef.current.position.y + direction.y,
          missileRef.current.position.z + direction.z
        );
        
        // Add some randomized wobble for realism
        missileRef.current.rotation.x += Math.sin(elapsed * 10) * 0.01;
        missileRef.current.rotation.z += Math.sin(elapsed * 8) * 0.01;
        
        // FIXED: Play explosion sound and trigger explosion at exactly the same time
        if (progress >= 1.0 && !exploding) {
          // Play explosion sound immediately when missile hits
          if (!soundPlayed) {
            try {
              const audio = new Audio('/sounds/explosion.mp3');
              audio.volume = 0.7;
              audio.play().catch(e => console.log('Failed to play explosion sound:', e));
              setSoundPlayed(true);
            } catch (error) {
              console.log("Error playing explosion sound:", error);
              setSoundPlayed(true);
            }
          }
          
          // Trigger explosion visual at the same time
          setExploding(true);
          explosionPosition.current = [x, y, z];
        }
      }
    }
    
    // If explosion is done
    if (exploding && elapsed > flightDuration + 3) {
      if (onComplete) onComplete();
    }
  });
  
  return (
    <>
      {!exploding && (
        <mesh ref={missileRef} position={startPosition}>
          <capsuleGeometry args={[0.1, 0.6, 2, 16]} />
          <meshStandardMaterial color="darkgrey" />
        </mesh>
      )}
      {exploding && <ModelExplosion position={explosionPosition.current} skipSound={true} />}
    </>
  );
};

export default MissileLaunch;
