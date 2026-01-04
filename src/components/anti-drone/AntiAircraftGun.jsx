// components/anti-drone/AntiAircraftGun.jsx
import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import ProjectileEffect from './ProjectileEffect';

const AntiAircraftGun = ({ targetPosition, onFire }) => {
  const gunRef = useRef();
  const barrelRef = useRef();
  const [projectiles, setProjectiles] = useState([]);
  const lastFireTime = useRef(0);
  
  // Aim the gun at the target
  useFrame((state) => {
    if (gunRef.current && targetPosition) {
      // Calculate direction to target
      const targetVec = new THREE.Vector3(...targetPosition);
      const gunPos = new THREE.Vector3();
      gunRef.current.getWorldPosition(gunPos);
      
      // Look at target
      const directionVec = new THREE.Vector3().subVectors(targetVec, gunPos).normalize();
      
      // Set rotation
      gunRef.current.lookAt(targetVec);
      
      // Fire projectile every 2 seconds
      if (state.clock.elapsedTime - lastFireTime.current > 2) {
        lastFireTime.current = state.clock.elapsedTime;
        
        // Create new projectile
        const newProjectile = {
          id: Date.now(),
          position: [0, 3, 0], // Relative to gun
          targetPosition: [...targetPosition],
          startTime: state.clock.elapsedTime
        };
        
        setProjectiles(prev => [...prev, newProjectile]);
        
        // Notify parent component of fire event
        if (onFire) {
          onFire([gunPos.x, gunPos.y + 3, gunPos.z]);
        }
      }
    }
  });
  
  // Clean up old projectiles
  useEffect(() => {
    const interval = setInterval(() => {
      setProjectiles(prev => prev.filter(p => 
        Date.now() - p.id < 3000 // Remove projectiles older than 3 seconds
      ));
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <group>
      {/* Gun base */}
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[1.5, 2, 1, 16]} />
        <meshStandardMaterial color="#555555" />
      </mesh>
      
      {/* Rotating gun platform */}
      <group ref={gunRef} position={[0, 2, 0]}>
        <mesh>
          <sphereGeometry args={[1, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#444444" />
        </mesh>
        
        {/* Gun barrel */}
        <mesh ref={barrelRef} position={[0, 0.5, 0]} rotation={[0, 0, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 3, 16]} />
          <meshStandardMaterial color="#333333" />
          
          {/* Barrel tip */}
          <mesh position={[0, 1.8, 0]}>
            <cylinderGeometry args={[0.4, 0.3, 0.5, 16]} />
            <meshStandardMaterial color="#222222" />
          </mesh>
        </mesh>
      </group>
      
      {/* Projectiles */}
      {projectiles.map(projectile => (
        <ProjectileEffect
          key={projectile.id}
          startPosition={[0, 3, 0]}
          targetPosition={projectile.targetPosition}
          startTime={projectile.startTime}
          gunRef={gunRef}
        />
      ))}
    </group>
  );
};

export default AntiAircraftGun;