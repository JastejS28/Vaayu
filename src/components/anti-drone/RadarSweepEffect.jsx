// components/anti-drone/RadarSweepEffect.jsx
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const RadarSweepEffect = ({ radius, isTargetDetected }) => {
  const sweepRef = useRef();
  const timeRef = useRef(0);
  
  useFrame((state, delta) => {
    if (sweepRef.current) {
      // Complete a sweep every 4 seconds
      timeRef.current = (timeRef.current + delta) % 4;
      const angle = (timeRef.current / 4) * Math.PI * 2;
      
      sweepRef.current.rotation.z = angle;
      
      // Pulse the sweep color when target detected
      if (isTargetDetected) {
        const pulseIntensity = Math.sin(state.clock.elapsedTime * 5) * 0.5 + 0.5;
        const color = sweepRef.current.material.color;
        color.setRGB(1, 0.3 + pulseIntensity * 0.7, 0.3);
      }
    }
  });
  
  return (
    <mesh 
      ref={sweepRef} 
      rotation={[-Math.PI/2, 0, 0]} 
      position={[0, 0.15, 0]}
    >
      <ringGeometry args={[0, radius, 20, 1, 0, Math.PI/8]} />
      <meshBasicMaterial 
        color={isTargetDetected ? "#ff3333" : "#33ff33"} 
        opacity={0.6} 
        transparent={true} 
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

export default RadarSweepEffect;