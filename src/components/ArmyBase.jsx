import React, { useRef } from 'react';
import { useGLTF } from '@react-three/drei';

const ArmyBase = ({ position = [-45, 25, -40] }) => {
  const { scene } = useGLTF('/models/army_base/army_base.glb');
  const model = useRef();
  
  // Clone the model to prevent sharing materials
  const clonedScene = scene.clone();
  
  return (
    <group ref={model} position={position} receiveShadow castShadow>
      <primitive object={clonedScene} scale={0.5} />
    </group>
  );
};

useGLTF.preload('/models/army_base/army_base.glb');

export default ArmyBase;