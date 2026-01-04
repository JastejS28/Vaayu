import React, { useState, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAttackDroneStore } from '../../store/attackDroneStore';
import ModelExplosion from './WeaponryEffects/ModelExplosion';
import ScorchMark from './ScorchMark';

const MissileSystem = () => {
  const { activeMissiles } = useAttackDroneStore();
  
  // State to track explosions and scorch marks
  const [explosions, setExplosions] = useState([]);
  const [scorchMarks, setScorchMarks] = useState([]);
  
  // Limit maximum number of scorch marks to prevent performance issues
  const MAX_SCORCH_MARKS = 10;
  
  // Check if a missile has reached its target and handle impact
  const handleMissileImpact = useCallback((missile) => {
    // Add explosion
    setExplosions(prev => [...prev, { id: missile.id, position: missile.targetPosition, timestamp: Date.now() }]);
    
    // Add scorch mark
    setScorchMarks(prev => {
      const newMarks = [...prev, { id: missile.id, position: missile.targetPosition, size: 6 }];
      // Limit the number of scorch marks
      return newMarks.length > MAX_SCORCH_MARKS ? newMarks.slice(newMarks.length - MAX_SCORCH_MARKS) : newMarks;
    });

    // Mark target as destroyed in the store
    useAttackDroneStore.getState().destroyTarget(missile.targetId);

  }, [MAX_SCORCH_MARKS]); // Dependencies for useCallback
  
  // Check for impacts on each frame
  useFrame(() => {
    // Clean up old explosions (after 5 seconds)
    const now = Date.now();
    setExplosions(prev => prev.filter(exp => now - exp.timestamp < 5000));

    // Find missiles that have just reached their target
    activeMissiles.forEach(missile => {
      if (missile.flightProgress >= 1.0 && !explosions.some(e => e.id === missile.id)) {
        handleMissileImpact(missile);
      }
    });
  });

  return (
    <group>
      {/* Active missiles in flight */}
      {activeMissiles.filter(missile => missile.flightProgress < 1.0).map(missile => {
        const start = new THREE.Vector3(...missile.position);
        const end = new THREE.Vector3(...missile.targetPosition);
        const current = new THREE.Vector3().lerpVectors(
          start, end, missile.flightProgress
        );
        
        const direction = new THREE.Vector3().subVectors(end, start).normalize();
        const rotation = new THREE.Euler();
        const upVector = new THREE.Vector3(0, 1, 0);
        const quaternion = new THREE.Quaternion().setFromUnitVectors(
          upVector, direction
        );
        rotation.setFromQuaternion(quaternion);
        rotation.x += Math.PI / 2;
        
        return (
          <mesh 
            key={`missile-${missile.id}`}
            position={[current.x, current.y, current.z]}
            rotation={[rotation.x, rotation.y, rotation.z]}
          >
            <cylinderGeometry args={[0.1, 0.1, 1, 8]} />
            <meshStandardMaterial color="#555555" />
            
            <mesh position={[0, 0.6, 0]}>
              <coneGeometry args={[0.1, 0.5, 8]} />
              <meshBasicMaterial color="#ff3300" emissive="#ff3300" emissiveIntensity={1} />
            </mesh>
          </mesh>
        );
      })}
      
      {/* Render explosions */}
      {explosions.map(explosion => (
        <ModelExplosion
          key={explosion.id}
          id={explosion.id}
          position={explosion.position}
        />
      ))}
      
      {/* Render scorch marks */}
      {scorchMarks.map(mark => (
        <ScorchMark
          key={mark.id}
          position={mark.position}
          size={mark.size}
        />
      ))}
    </group>
  );
};

export default MissileSystem;