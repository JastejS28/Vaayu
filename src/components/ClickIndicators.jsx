// import React, { useRef, useEffect } from 'react';
// import { useFrame } from '@react-three/fiber';
// import * as THREE from 'three';
// import { useClickControlStore } from '../store/clickControlStore';

// // Create SIMPLE materials that don't use complex shaders
// const spawnMaterial = new THREE.MeshBasicMaterial({ 
//   color: 0x00ff00,
//   transparent: true,
//   opacity: 0.7
// });

// const clickMaterial = new THREE.MeshBasicMaterial({ 
//   color: 0x0088ff,
//   transparent: true,
//   opacity: 0.7
// });

// const ClickIndicators = () => {
//   const spawnRef = useRef();
//   const clickRef = useRef();
//   const { spawnIndicator, clickIndicator } = useClickControlStore();
  
//   useEffect(() => {
//     console.log('[ClickIndicators] Creating indicator meshes');
    
//     // Create spawn indicator geometry
//     const spawnGeometry = new THREE.CylinderGeometry(0.5, 0.5, 30, 16, 1);
//     const spawnMesh = new THREE.Mesh(spawnGeometry, spawnMaterial);
//     spawnMesh.visible = false;
//     spawnRef.current = spawnMesh;
    
//     // Create click indicator geometry
//     const clickGeometry = new THREE.CylinderGeometry(0.5, 0.5, 30, 16, 1);
//     const clickMesh = new THREE.Mesh(clickGeometry, clickMaterial);
//     clickMesh.visible = false;
//     clickRef.current = clickMesh;
    
//     return () => {
//       spawnGeometry.dispose();
//       clickGeometry.dispose();
//       // Do not dispose materials - they're shared
//     };
//   }, []);
  
//   useFrame(() => {
//     // Update spawn indicator
//     if (spawnRef.current && spawnIndicator) {
//       spawnRef.current.visible = true;
//       spawnRef.current.position.set(
//         spawnIndicator.position[0],
//         spawnIndicator.position[1] - 15, // Center the cylinder
//         spawnIndicator.position[2]
//       );
//     } else if (spawnRef.current) {
//       spawnRef.current.visible = false;
//     }
    
//     // Update click indicator
//     if (clickRef.current && clickIndicator) {
//       clickRef.current.visible = true;
//       clickRef.current.position.set(
//         clickIndicator.position[0],
//         clickIndicator.position[1] - 15, // Center the cylinder
//         clickIndicator.position[2]
//       );
//     } else if (clickRef.current) {
//       clickRef.current.visible = false;
//     }
//   });
  
//   return (
//     <>
//       {spawnRef.current && <primitive object={spawnRef.current} />}
//       {clickRef.current && <primitive object={clickRef.current} />}
//     </>
//   );
// };

// export default ClickIndicators;


import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useClickControlStore } from '../store/clickControlStore';

// Create SIMPLE materials that don't use complex shaders
const spawnMaterial = new THREE.MeshBasicMaterial({ 
  color: 0x00ff00,
  transparent: true,
  opacity: 0.7
});

const clickMaterial = new THREE.MeshBasicMaterial({ 
  color: 0x0088ff,
  transparent: true,
  opacity: 0.7
});

const ClickIndicators = () => {
  const spawnRef = useRef();
  const clickRef = useRef();
  const { spawnIndicator, clickIndicator } = useClickControlStore();
  
  useEffect(() => {
    console.log('[ClickIndicators] Creating indicator meshes');
    
    // Create spawn indicator geometry
    const spawnGeometry = new THREE.CylinderGeometry(0.5, 0.5, 30, 16, 1);
    const spawnMesh = new THREE.Mesh(spawnGeometry, spawnMaterial);
    spawnMesh.visible = false;
    spawnRef.current = spawnMesh;
    
    // Create click indicator geometry
    const clickGeometry = new THREE.CylinderGeometry(0.5, 0.5, 30, 16, 1);
    const clickMesh = new THREE.Mesh(clickGeometry, clickMaterial);
    clickMesh.visible = false;
    clickRef.current = clickMesh;
    
    return () => {
      spawnGeometry.dispose();
      clickGeometry.dispose();
      // Do not dispose materials - they're shared
    };
  }, []);
  
  useFrame(() => {
    // Update spawn indicator
    if (spawnRef.current && spawnIndicator) {
      spawnRef.current.visible = true;
      spawnRef.current.position.set(
        spawnIndicator.position[0],
        spawnIndicator.position[1] - 15, // Center the cylinder
        spawnIndicator.position[2]
      );
    } else if (spawnRef.current) {
      spawnRef.current.visible = false;
    }
    
    // Update click indicator
    if (clickRef.current && clickIndicator) {
      clickRef.current.visible = true;
      clickRef.current.position.set(
        clickIndicator.position[0],
        clickIndicator.position[1] - 15, // Center the cylinder
        clickIndicator.position[2]
      );
    } else if (clickRef.current) {
      clickRef.current.visible = false;
    }
  });
  
  return (
    <>
      {spawnRef.current && <primitive object={spawnRef.current} />}
      {clickRef.current && <primitive object={clickRef.current} />}
    </>
  );
};

export default ClickIndicators;