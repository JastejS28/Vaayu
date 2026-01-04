import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const DestroyedTarget = ({ position, targetType, rotation = [0, 0, 0] }) => {
  const groupRef = useRef();
  
  // Generate debris pieces based on target type
  const generateDebris = () => {
    let debrisCount, debrisSize, debrisColor;
    
    switch(targetType) {
      case 'tank':
        debrisCount = 12;
        debrisSize = [0.8, 1.2];
        debrisColor = '#2c2c2c';
        break;
      case 'jeep':
        debrisCount = 8;
        debrisSize = [0.4, 0.8];
        debrisColor = '#3c3c3c';
        break;
      case 'warehouse':
        debrisCount = 15;
        debrisSize = [0.6, 1.5];
        debrisColor = '#4a4a4a';
        break;
      case 'soldier':
        debrisCount = 4; // Less debris for a soldier
        debrisSize = [0.2, 0.4];
        debrisColor = '#5a4a3a'; // Brownish color
        break;
      default:
        debrisCount = 6;
        debrisSize = [0.3, 0.6];
        debrisColor = '#404040';
    }

    return Array(debrisCount).fill().map((_, i) => {
      const size = debrisSize[0] + Math.random() * (debrisSize[1] - debrisSize[0]);
      return {
        id: i,
        size: [size, size * (0.5 + Math.random() * 0.5), size],
        position: [
          (Math.random() - 0.5) * 8,
          Math.random() * 2,
          (Math.random() - 0.5) * 8
        ],
        rotation: [
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        ],
        color: debrisColor
      };
    });
  };

  const debris = generateDebris();

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {debris.map((piece) => (
        <mesh key={piece.id} position={piece.position} rotation={piece.rotation}>
          <boxGeometry args={piece.size} />
          <meshStandardMaterial color={piece.color} roughness={0.8} />
        </mesh>
      ))}
      
      {/* Scorch mark on ground */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[targetType === 'soldier' ? 3 : 6, targetType === 'soldier' ? 3 : 6]} />
        <meshBasicMaterial color="#1a1a1a" transparent opacity={0.7} />
      </mesh>
    </group>
  );
};

export default DestroyedTarget;