// components/attack-drone/UavDamageSystem.jsx
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAttackDroneStore } from '../../store/attackDroneStore';

const UavDamageSystem = ({ position }) => {
  const { droneHealth, damageEffects } = useAttackDroneStore();
  const smokeRef = useRef();
  
  useFrame((state) => {
    if (smokeRef.current && damageEffects.smoke) {
      // Animate smoke particles
      smokeRef.current.rotation.y += 0.01;
      
      // Smoke intensity based on damage
      const smokeIntensity = 1 - (droneHealth / 100);
      smokeRef.current.material.opacity = 0.3 + smokeIntensity * 0.5;
      
      // Pulsing smoke size
      const pulseScale = 0.8 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
      const baseScale = 0.5 + (1 - droneHealth / 100) * 1.5;
      smokeRef.current.scale.set(
        baseScale * pulseScale,
        baseScale * pulseScale, 
        baseScale * pulseScale
      );
    }
  });
  
  if (!damageEffects.smoke) return null;
  
  return (
    <group position={position}>
      {/* Smoke effect */}
      <mesh ref={smokeRef} position={[0, 0, 0]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial 
          color="#333333" 
          transparent={true} 
          opacity={0.6} 
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};

export default UavDamageSystem;