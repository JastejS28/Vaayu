import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

const NightEnvironment = () => {
  const moonRef = useRef();
  
  // Moonlight
  useFrame(() => {
    if (moonRef.current) {
      moonRef.current.position.x = 100 * Math.sin(Date.now() * 0.0001);
      moonRef.current.position.z = 100 * Math.cos(Date.now() * 0.0001);
    }
  });
  
  return (
    <>
      {/* Stars background */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      {/* Moon */}
      <mesh position={[100, 100, 0]}>
        <sphereGeometry args={[5, 16, 16]} />
        <meshBasicMaterial color="#FFFDE7" />
      </mesh>
      
      {/* Moonlight */}
      <directionalLight 
        ref={moonRef} 
        position={[100, 100, 0]} 
        intensity={1} 
        color="#E0F7FA" 
      />
      
      {/* Subtle ambient light */}
      <ambientLight intensity={0.1} color="#263238" />
    </>
  );
};

export default NightEnvironment;