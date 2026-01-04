import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useUAVStore } from '../../store/uavStore';
import { useMissionStore } from '../../store/missionStore';
import { useTutorialStore } from '../../store/tutorialStore';

const HoverZoneIndicator = () => {
  const { position: uavPosition, droneType } = useUAVStore();
  const { currentTarget, isHovering } = useMissionStore();
  const { isTutorialActive, currentStep } = useTutorialStore();
  const ringRef = useRef();

  // Only show during tutorial hover step and when target is selected
  if (!isTutorialActive || !currentTarget || droneType !== 'surveillance') return null;
  if (currentStep < 6) return null; // Only show from step 6 onwards

  const targetPos = currentTarget.position;
  
  // Animate the ring
  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.z += 0.02;
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      ringRef.current.scale.set(scale, scale, 1);
    }
  });

  const isInHoverZone = () => {
    const distance = Math.sqrt(
      Math.pow(uavPosition[0] - targetPos[0], 2) +
      Math.pow(uavPosition[2] - targetPos[2], 2)
    );
    const altitude = uavPosition[1];
    return distance < 8 && altitude < 15;
  };

  const inZone = isInHoverZone();

  return (
    <group position={[targetPos[0], 5, targetPos[2]]}>
      {/* Hover zone circle on ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]}>
        <ringGeometry args={[7, 9, 32]} />
        <meshBasicMaterial
          color={inZone ? "#4caf50" : "#ffa726"}
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Animated ring */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -4.9, 0]}>
        <ringGeometry args={[8, 8.5, 32]} />
        <meshBasicMaterial
          color={inZone ? "#4caf50" : "#ffa726"}
          transparent
          opacity={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Vertical beam */}
      <mesh position={[0, 10, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 30, 8]} />
        <meshBasicMaterial
          color={inZone ? "#4caf50" : "#ffa726"}
          transparent
          opacity={0.4}
        />
      </mesh>

      {/* Instruction label */}
      <Html center distanceFactor={25} position={[0, 20, 0]}>
        <div style={{
          background: inZone ? 'rgba(76, 175, 80, 0.95)' : 'rgba(255, 167, 38, 0.95)',
          color: 'white',
          padding: '12px 16px',
          borderRadius: '12px',
          fontWeight: 'bold',
          fontSize: '16px',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          border: '3px solid white',
          minWidth: '200px'
        }}>
          {inZone ? (
            <>
              ✅ HOVER ZONE<br/>
              <span style={{ fontSize: '14px' }}>Stay here for 10 seconds</span>
            </>
          ) : (
            <>
              🎯 HOVER HERE<br/>
              <span style={{ fontSize: '14px' }}>Altitude &lt; 15m | Radius &lt; 8m</span>
            </>
          )}
        </div>
      </Html>
    </group>
  );
};

export default HoverZoneIndicator;