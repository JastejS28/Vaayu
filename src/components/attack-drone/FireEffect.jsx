import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const FireEffect = ({ position, duration = 120, intensity = 1.0 }) => {
  const groupRef = useRef();
  const startTime = useRef(Date.now());
  const [finished, setFinished] = useState(false);
  
  // Fire particle references
  const fireParticles = useRef([]);
  const particleCount = Math.floor(50 * intensity);
  
  // Create fire particles
  useEffect(() => {
    // Generate particles with improved properties
    fireParticles.current = Array(particleCount).fill().map(() => ({
      position: new THREE.Vector3(
        (Math.random() - 0.5) * 1.2,  // Narrower spread for x
        Math.random() * 1.2,          // Height of flames
        (Math.random() - 0.5) * 1.2   // Narrower spread for z
      ),
      size: Math.random() * 0.5 + 0.2,  // Smaller particles
      // More realistic fire colors (red-orange-yellow variation)
      color: new THREE.Color(
        Math.random() * 0.2 + 0.8,    // Red (0.8-1.0)
        Math.random() * 0.4 + 0.2,    // Green (0.2-0.6)
        Math.random() * 0.05          // Blue (0-0.05) - very little blue
      ),
      speed: Math.random() * 1.2 + 0.8,  // Upward movement
      lifetime: Math.random() * 1.0 + 0.5, // Lifecycle
      age: Math.random() * 0.4, // Start at various ages for immediate flame
      flickerSpeed: Math.random() * 8 + 4, // For flickering effect
      flickerIntensity: Math.random() * 0.15 + 0.05 // How much it flickers
    }));
    
    // Set timeout to eventually stop this effect
    const timer = setTimeout(() => {
      setFinished(true);
    }, duration * 1000); // Convert seconds to ms
    
    return () => clearTimeout(timer);
  }, [particleCount, duration, intensity]);
  
  // Update fire particles
  useFrame((_, delta) => {
    if (finished) return;
    
    const elapsed = (Date.now() - startTime.current) / 1000;
    const time = Date.now() / 1000; // For flickering effect
    
    // Update each particle
    fireParticles.current.forEach((particle) => {
      // Age the particle
      particle.age += delta;
      
      // Reset if lifetime exceeded
      if (particle.age >= particle.lifetime) {
        // Reset particle at the base with some horizontal variation
        particle.position.set(
          (Math.random() - 0.5) * 1.2,
          Math.random() * 0.3,
          (Math.random() - 0.5) * 1.2
        );
        particle.age = 0;
        particle.lifetime = Math.random() * 1.0 + 0.5;
        // Vary the size slightly on regeneration
        particle.size = Math.random() * 0.5 + 0.2;
      }
      
      // Move particle upward
      particle.position.y += particle.speed * delta;
      
      // Create realistic flickering effect
      const flicker = Math.sin(time * particle.flickerSpeed) * particle.flickerIntensity;
      particle.position.x += flicker;
      particle.position.z += flicker * 0.8;
    });
    
    // Gradually reduce intensity over time after 70% of duration
    if (elapsed > duration * 0.7) {
      const remainingFraction = 1 - ((elapsed - duration * 0.7) / (duration * 0.3));
      if (groupRef.current) {
        groupRef.current.scale.set(remainingFraction, remainingFraction, remainingFraction);
      }
    }
  });
  
  if (finished) return null;

  // Important: For proper positioning, move group to position and particles offset from 0,0,0
  return (
    <group ref={groupRef} position={position}>
      {/* Flickering point light */}
      <pointLight 
        color={new THREE.Color(1, 0.6, 0.2)} 
        intensity={2 * intensity * (0.9 + Math.random() * 0.2)}
        distance={8 + Math.random()}
        decay={2}
        position={[0, 0.5, 0]} // Light is slightly above fire center
      />
      
      {/* Fire particles */}
      {fireParticles.current.map((particle, i) => (
        <mesh 
          key={`fire-${i}`} 
          position={particle.position}
        >
          <sphereGeometry args={[particle.size * (1 - particle.age/particle.lifetime * 0.7), 8, 8]} />
          <meshBasicMaterial 
            color={particle.color} 
            transparent={true} 
            opacity={Math.max(0, 1 - (particle.age / particle.lifetime))}
          />
        </mesh>
      ))}
      
      {/* Smoke */}
      {fireParticles.current
        .filter((_, i) => i % 4 === 0) // Use some particles for smoke
        .map((particle, i) => (
          <mesh 
            key={`smoke-${i}`} 
            position={[
              particle.position.x * 1.5, 
              particle.position.y + 1.5, 
              particle.position.z * 1.5
            ]}
          >
            <sphereGeometry args={[particle.size * 1.8, 8, 8]} />
            <meshStandardMaterial 
              color="#222222" 
              transparent={true} 
              opacity={Math.max(0, 0.4 - (particle.age / particle.lifetime) * 0.3)}
            />
          </mesh>
        ))}
    </group>
  );
};

export default FireEffect;