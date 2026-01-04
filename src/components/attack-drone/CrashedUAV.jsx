import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useUAVStore } from '../../store/uavStore';

const CrashedUAV = ({ position: initialPosition }) => {
  const crashRef = useRef();
  const { scene } = useGLTF('/models/surveillance-uav/drone.glb');
  
  // ✅ FIX #1: Add falling physics state
  const fallingState = useRef({
    position: initialPosition ? [...initialPosition] : [0, 50, 0],
    velocity: [0, 0, 0], // [x, y, z] velocity
    angularVelocity: [
      (Math.random() - 0.5) * 0.1,  // Random spin on X axis
      (Math.random() - 0.5) * 0.1,  // Random spin on Y axis
      (Math.random() - 0.5) * 0.1   // Random spin on Z axis
    ],
    rotation: [0, 0, 0],
    hasLanded: false,
    groundLevel: 5 // Stop falling at this height
  });

  console.log('[CrashedUAV] Initialized with position:', initialPosition);

  useEffect(() => {
    if (initialPosition) {
      fallingState.current.position = [...initialPosition];
      console.log('[CrashedUAV] Set initial position:', fallingState.current.position);
    }
  }, [initialPosition]);

  // ✅ FIX #1: Add falling physics in useFrame
  useFrame((state, delta) => {
    if (!crashRef.current || fallingState.current.hasLanded) return;

    const GRAVITY = -9.8; // m/s²
    const AIR_RESISTANCE = 0.98; // Drag coefficient
    const GROUND_LEVEL = fallingState.current.groundLevel;

    // Apply gravity to Y velocity
    fallingState.current.velocity[1] += GRAVITY * delta;

    // Apply air resistance
    fallingState.current.velocity[0] *= AIR_RESISTANCE;
    fallingState.current.velocity[1] *= AIR_RESISTANCE;
    fallingState.current.velocity[2] *= AIR_RESISTANCE;

    // Update position based on velocity
    fallingState.current.position[0] += fallingState.current.velocity[0] * delta;
    fallingState.current.position[1] += fallingState.current.velocity[1] * delta;
    fallingState.current.position[2] += fallingState.current.velocity[2] * delta;

    // Update rotation for spinning effect
    fallingState.current.rotation[0] += fallingState.current.angularVelocity[0];
    fallingState.current.rotation[1] += fallingState.current.angularVelocity[1];
    fallingState.current.rotation[2] += fallingState.current.angularVelocity[2];

    // Check if hit ground
    if (fallingState.current.position[1] <= GROUND_LEVEL) {
      fallingState.current.position[1] = GROUND_LEVEL;
      fallingState.current.velocity = [0, 0, 0];
      fallingState.current.hasLanded = true;
      console.log('[CrashedUAV] 💥 Landed at ground level');
    }

    // Apply position and rotation to mesh
    crashRef.current.position.set(...fallingState.current.position);
    crashRef.current.rotation.set(...fallingState.current.rotation);

    // Update UAV store position to match falling position
    useUAVStore.getState().setPosition(fallingState.current.position);
  });

  return (
    <group>
      {/* Crashed UAV Model */}
      <primitive 
        ref={crashRef}
        object={scene.clone()}
        scale={[0.08, 0.08, 0.08]}
        castShadow
      />
      
      {/* ✅ Smoke/Fire Effect */}
      {!fallingState.current.hasLanded && (
        <mesh position={[0, -0.5, 0]}>
          <sphereGeometry args={[0.8, 16, 16]} />
          <meshBasicMaterial color="#ff6600" transparent opacity={0.6} />
        </mesh>
      )}
      
      {/* ✅ Smoke trail */}
      <mesh position={[0, 2, 0]}>
        <cylinderGeometry args={[0.5, 1, 4, 16]} />
        <meshBasicMaterial color="#555555" transparent opacity={0.4} />
      </mesh>
    </group>
  );
};

useGLTF.preload('/models/surveillance-uav/drone.glb');

export default CrashedUAV;