import React from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useAttackDroneStore } from '../../store/attackDroneStore';
import { useUAVStore } from '../../store/uavStore';
import LockOnIndicator from './WeaponryEffects/LockOnIndicator';

const TargetLockSystem = () => {
  const { targeting, updateTargetLock } = useAttackDroneStore();
  const { targets, position: uavPosition } = useUAVStore();
  
  useFrame((state, delta) => {
    // Update targeting logic with time delta
    if (typeof updateTargetLock === 'function') {
      updateTargetLock(delta);
    }
  });
  
  // Find the target being locked on
  const targetObject = targeting.lockedTarget ? 
    targets?.find(t => t.id === targeting.lockedTarget) : null;
  
  // Safety check - don't render if we don't have a valid target or position
  if (!targetObject || !Array.isArray(targetObject.position) || 
      targeting.lockStatus === 'inactive' || !uavPosition) {
    return null;
  }
  
  // Check if target is in range
  try {
    const targetPosition = new THREE.Vector3(...targetObject.position);
    const uavPos = new THREE.Vector3(...uavPosition);
    const distanceToTarget = targetPosition.distanceTo(uavPos);
    
    // If target has gone out of range, don't render the lock-on effects
    const maxRange = targeting.maxTargetingRange || 200;
    if (distanceToTarget > maxRange) {
      return null;
    }
    
    // Calculate lock progress as a value between 0 and 1
    const lockProgress = targeting.lockTimer / 
                         (targeting.maxLockTime || 2.0);
    
    return (
      <group position={targetObject.position}>
        {/* Targeting ring that scales with lock progress */}
        <LockOnIndicator 
          status={targeting.lockStatus} 
          progress={lockProgress}
          type={targetObject.type || 'generic'}
        />
        
        {/* Target info text - removed font prop to use system font */}
        <Billboard
          follow={true}
          lockX={false}
          lockY={false}
          lockZ={false}
        >
          <Text
            position={[0, 3.5, 0]}
            color={targeting.lockStatus === 'locked' ? '#4caf50' : '#ffeb3b'}
            fontSize={0.5}
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.05}
            outlineColor="#000000"
          >
            {targeting.lockStatus === 'locked' ? 'LOCKED' : `LOCKING ${Math.floor(lockProgress * 100)}%`}
          </Text>
          
          <Text
            position={[0, 4.3, 0]}
            color="#ffffff"
            fontSize={0.4}
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.03}
            outlineColor="#000000"
          >
            {(targetObject.type || 'TARGET').toUpperCase()} • {Math.floor(distanceToTarget)}m
          </Text>
        </Billboard>
      </group>
    );
  } catch (error) {
    console.error("Error rendering target lock system:", error);
    return null;
  }
};

export default TargetLockSystem;