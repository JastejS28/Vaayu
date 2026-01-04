import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useUAVStore } from '../../store/uavStore';
import { useTargetStore } from '../../store/targetStore';

const TargetDirectionIndicator = ({ targetPosition, targetName, isCompleted }) => {
  const arrowRef = useRef();
  const bobbingRef = useRef(); // Separate ref for bobbing animation
  const { position: uavPosition } = useUAVStore();
  
  // Calculate distance for display only
  const distance = Math.sqrt(
    Math.pow(targetPosition[0] - uavPosition[0], 2) +
    Math.pow(targetPosition[2] - uavPosition[2], 2)
  );

  // ✅ FIXED: Use separate mesh for bobbing, keep group position STATIC
  useFrame((state) => {
    if (bobbingRef.current) {
      // Only animate the bobbing mesh, NOT the parent group
      bobbingRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 1.5;
      bobbingRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  if (isCompleted) return null;

  // ✅ STATIC position - NEVER changes
  const staticPosition = [
    targetPosition[0],      // Exact X from Scene.jsx
    targetPosition[1] + 25, // 25 units above target
    targetPosition[2]       // Exact Z from Scene.jsx
  ];

  return (
    // ✅ Parent group has STATIC position - never updated
    <group position={staticPosition}>
      {/* Child group handles ONLY bobbing animation */}
      <group ref={bobbingRef}>
        {/* Arrow pointing down */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <coneGeometry args={[2, 5, 8]} />
          <meshStandardMaterial 
            color="#ff3333" 
            emissive="#ff0000"
            emissiveIntensity={0.8}
            transparent
            opacity={0.95}
          />
        </mesh>
        
        {/* Arrow shaft */}
        <mesh position={[0, 4, 0]}>
          <cylinderGeometry args={[0.4, 0.4, 6, 8]} />
          <meshStandardMaterial 
            color="#ff3333"
            emissive="#ff0000"
            emissiveIntensity={0.5}
          />
        </mesh>

        {/* Pulsing ring at arrow base */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]}>
          <ringGeometry args={[2.5, 3.5, 32]} />
          <meshBasicMaterial 
            color="#ff0000"
            transparent
            opacity={0.6}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Distance label */}
        <Html center distanceFactor={15} position={[0, 8, 0]}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(255, 51, 51, 0.95), rgba(220, 20, 20, 0.95))',
            color: 'white',
            padding: '10px 16px',
            borderRadius: '12px',
            fontWeight: 'bold',
            fontSize: '16px',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 20px rgba(255, 0, 0, 0.5)',
            border: '3px solid white',
            textAlign: 'center',
            minWidth: '120px',
            pointerEvents: 'none'
          }}>
            <div style={{ fontSize: '20px', marginBottom: '4px' }}>📍</div>
            <div>{targetName}</div>
            <div style={{ 
              fontSize: '14px', 
              marginTop: '4px',
              color: '#ffcccc' 
            }}>
              {Math.round(distance)}m away
            </div>
          </div>
        </Html>
      </group>

      {/* Vertical beam - OUTSIDE bobbing group so it stays fixed */}
      <mesh position={[0, -14, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 20, 8]} />
        <meshBasicMaterial 
          color="#ff3333"
          transparent
          opacity={0.4}
        />
      </mesh>
    </group>
  );
};

const TargetDirectionIndicators = () => {
  const { position: uavPosition, droneType } = useUAVStore();
  const completedTargets = useTargetStore((state) => state.completedTargets || {});

  // Show arrows for surveillance drones once spawned
  const hasSpawned = uavPosition[0] !== 0 || uavPosition[1] !== 50 || uavPosition[2] !== 0;
  if (!hasSpawned || droneType !== 'surveillance') return null;

  // ✅ EXACT coordinates from Scene.jsx
  const targetLocations = [
    { position: [40, 19, 16], name: 'Tank', type: 'tank' },
    { position: [40, 19, 20], name: 'Jeep', type: 'jeep' },
    { position: [40, 21, 32], name: 'Warehouse', type: 'warehouse' },
    // Uncomment if you want soldier indicator too:
    // { position: [40, 21, 32], name: 'Soldier', type: 'soldier' }
  ];

  return (
    <>
      {targetLocations.map((target, index) => (
        <TargetDirectionIndicator
          key={index}
          targetPosition={target.position}
          targetName={target.name}
          isCompleted={completedTargets[target.type] > 0}
        />
      ))}
    </>
  );
};

export default TargetDirectionIndicators;