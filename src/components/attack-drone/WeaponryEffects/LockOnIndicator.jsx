import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const LockOnIndicator = ({ status, progress, type = 'generic' }) => {
  const ringRef = useRef();
  const crosshairsRef = useRef();
  const startTime = useRef(Date.now());
  
  // Colors based on status
  const colors = useMemo(() => ({
    seeking: new THREE.Color(0xffeb3b), // Yellow
    locked: new THREE.Color(0x4caf50),  // Green
  }), []);
  
  // Set up ring geometry
  const ringGeometry = useMemo(() => {
    return new THREE.RingGeometry(2.2, 2.5, 32);
  }, []);
  
  useFrame(() => {
    const elapsed = (Date.now() - startTime.current) / 1000;
    
    if (ringRef.current) {
      // Rotate the ring for seeking effect
      if (status === 'seeking') {
        ringRef.current.rotation.z = elapsed * -2;
      }
      
      // Set color based on status
      const color = colors[status] || colors.seeking;
      ringRef.current.material.color = color;
      
      // Scale based on lock progress
      const scale = status === 'locked' ? 1.0 : 0.8 + Math.sin(elapsed * 5) * 0.1;
      ringRef.current.scale.set(scale, scale, scale);
      
      // Set opacity based on progress
      const opacity = status === 'locked' ? 0.9 : 0.5 + progress * 0.4;
      ringRef.current.material.opacity = opacity;
    }
    
    if (crosshairsRef.current && crosshairsRef.current.children) {
      // Update all crosshair lines
      for (const child of crosshairsRef.current.children) {
        // Set color based on status
        const color = colors[status] || colors.seeking;
        child.material.color = color;
        
        // Set opacity based on progress
        const opacity = status === 'locked' ? 0.9 : 0.5 + progress * 0.4;
        child.material.opacity = opacity;
      }
      
      // Rotate slightly for visual effect
      const rotation = status === 'locked' ? 0 : Math.sin(elapsed * 3) * 0.1;
      crosshairsRef.current.rotation.z = rotation;
    }
  });
  
  return (
    <group>
      {/* Ring indicator */}
      <mesh ref={ringRef} rotation={[Math.PI/2, 0, 0]}>
        <ringGeometry args={[2.2, 2.5, 32]} />
        <meshBasicMaterial 
          color={colors[status]} 
          transparent={true} 
          opacity={0.7}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Crosshair indicator - Use separate lines instead of ShapeGeometry */}
      <group ref={crosshairsRef} rotation={[Math.PI/2, 0, 0]}>
        {/* Horizontal line */}
        <mesh>
          <boxGeometry args={[4, 0.2, 0.01]} />
          <meshBasicMaterial 
            color={colors[status]} 
            transparent={true} 
            opacity={0.7}
          />
        </mesh>
        
        {/* Vertical line */}
        <mesh>
          <boxGeometry args={[0.2, 4, 0.01]} />
          <meshBasicMaterial 
            color={colors[status]} 
            transparent={true} 
            opacity={0.7}
          />
        </mesh>
        
        {/* Center dot */}
        <mesh>
          <circleGeometry args={[0.3, 16]} />
          <meshBasicMaterial 
            color={colors[status]} 
            transparent={true} 
            opacity={0.7}
          />
        </mesh>
      </group>
    </group>
  );
};

export default LockOnIndicator;