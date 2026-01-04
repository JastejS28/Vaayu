// components/anti-drone/DefenseRadar.jsx
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import RadarSweepEffect from './RadarSweepEffect';

const DefenseRadar = ({ radius, isActive, isTargetDetected }) => {
  const radarRef = useRef();
  
  // Animate the radar base
  useFrame(() => {
    if (radarRef.current && isActive) {
      radarRef.current.rotation.y += 0.005;
    }
  });
  
  return (
    <group>
      {/* Radar base */}
      <mesh position={[0, 1, 0]} ref={radarRef}>
        <cylinderGeometry args={[2, 2.5, 1, 16]} />
        <meshStandardMaterial color="#444444" />
        
        {/* Radar dish */}
        <mesh position={[0, 1, 0]} rotation={[Math.PI/6, 0, 0]}>
          <cylinderGeometry args={[1.8, 1.2, 0.5, 32]} />
          <meshStandardMaterial color="#777777" />
        </mesh>
      </mesh>
      
      {/* Radar detection range indicator */}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0.1, 0]}>
        <ringGeometry args={[radius-1, radius, 20]} />
        <meshBasicMaterial 
          color={isTargetDetected ? "#ff3333" : "#33ff33"} 
          opacity={0.2} 
          transparent={true} 
        />
      </mesh>
      
      {/* Active radar sweep */}
      {isActive && (
        <RadarSweepEffect radius={radius} isTargetDetected={isTargetDetected} />
      )}
    </group>
  );
};

export default DefenseRadar;