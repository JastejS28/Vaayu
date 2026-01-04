import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Cloud } from '@react-three/drei';

const RainEnvironment = () => {
  const rainCount = 3000; // More raindrops
  const rainRef = useRef();
  const rainDrops = useRef();
  
  // Initialize rain drops if not already done
  if (!rainDrops.current) {
    rainDrops.current = Array(rainCount).fill().map(() => ({
      position: new THREE.Vector3(
        (Math.random() * 200) - 100,
        Math.random() * 100 + 10,
        (Math.random() * 200) - 100
      ),
      velocity: 0.3 + Math.random() * 0.4, // Faster falling rain
      length: 0.5 + Math.random() * 1.0   // Longer raindrops
    }));
  }
  
  // Animate rain drops falling
  useFrame(() => {
    if (!rainRef.current) return;
    
    const positions = rainRef.current.geometry.attributes.position;
    
    // Update each raindrop position
    for (let i = 0; i < rainCount; i++) {
      const drop = rainDrops.current[i];
      
      // Move raindrop down
      drop.position.y -= drop.velocity;
      
      // Reset raindrop if it falls below ground
      if (drop.position.y < 0) {
        drop.position.y = Math.random() * 100 + 50;
        drop.position.x = (Math.random() * 200) - 100;
        drop.position.z = (Math.random() * 200) - 100;
      }
      
      // Update position in buffer - slightly elongated rain drops
      positions.setXYZ(i, 
        drop.position.x, 
        drop.position.y, 
        drop.position.z
      );
    }
    
    positions.needsUpdate = true;
  });
  
  return (
    <>
      {/* Rain atmosphere */}
      <ambientLight intensity={0.2} color="white" />
      <directionalLight intensity={0.3} position={[1, 10, 1]} color="white" />
      
      {/* Realistic dark clouds */}
      <Cloud position={[0, 80, 0]} args={[3, 2]} scale={1} color="#445566" opacity={0.9} />
      <Cloud position={[-50, 75, -20]} args={[3, 2]} scale={2} color="#334455" opacity={0.9} />
      <Cloud position={[70, 85, 10]} args={[3, 2]} scale={3} color="#445566" opacity={0.9} />
      <Cloud position={[40, 80, -60]} args={[3, 2]} scale={5} color="#334455" opacity={0.9} />
      <Cloud position={[-60, 90, 40]} args={[3, 2]} scale={5} color="#445566" opacity={0.9} />
      
      {/* Rain particles */}
      <points ref={rainRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={rainCount}
            array={new Float32Array(rainCount * 3)}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.4}
          color="#aaddff"
          transparent
          opacity={0.7}
          fog={true}
        />
      </points>
    </>
  );
};

export default RainEnvironment;