// import React, { useEffect, useRef, useState } from 'react';
// import { useGLTF } from '@react-three/drei';
// import { useUAVStore } from '../store/uavStore';
// import { THERMAL_MATERIALS } from './ThermalVisionEffect';
// import * as THREE from 'three';

// const Terrain = () => {
//   const { scene: loadedGltfScene } = useGLTF('/models/mountain/terrain.glb');
//   const { isThermalVision } = useUAVStore();
  
//   const visualTerrainRef = useRef();
//   const originalMaterialsRef = useRef(new Map());
//   const [isInitialized, setIsInitialized] = useState(false);
//   const [interactionLayer, setInteractionLayer] = useState(null);

//   useEffect(() => {
//     if (loadedGltfScene && !isInitialized) {
//       console.log('[Terrain] Initializing terrain components...');
      
//       // --- 1. Create the VISIBLE terrain ---
//       const visualClone = loadedGltfScene.clone(true);
//       visualClone.name = "visual-terrain";
//       visualClone.traverse(node => {
//         if (node.isMesh) {
//           node.castShadow = true;
//           node.receiveShadow = true;
//           originalMaterialsRef.current.set(node.uuid, node.material);
//         }
//       });
//       visualTerrainRef.current = visualClone;

//       // --- 2. Create the INVISIBLE interaction layer ---
//       const interactionClone = loadedGltfScene.clone(true);
//       interactionClone.name = "interaction-terrain-layer";
      
//       // IMPORTANT: Use a transparent material instead of visible:false
//       // This keeps the mesh raycast-able but visually invisible
//       const interactionMaterial = new THREE.MeshBasicMaterial({ 
//         transparent: true, 
//         opacity: 0.0,     // Completely transparent
//         side: THREE.DoubleSide,
//         depthWrite: false // This is crucial - don't write to depth buffer
//       });
      
//       interactionClone.traverse(node => {
//         if (node.isMesh) {
//           node.userData.isClickableTerrain = true;
//           node.material = interactionMaterial;
//           // For debugging, log how many meshes we're marking as clickable
//           console.log(`[Terrain] Marked mesh "${node.name}" as clickable terrain`);
//         }
//       });
//       setInteractionLayer(interactionClone);

//       setIsInitialized(true);
//       console.log('[Terrain] Terrain initialized with interaction layer');
//     }
//   }, [loadedGltfScene, isInitialized]);

//   // Effect for handling thermal vision on the VISUAL terrain
//   useEffect(() => {
//     if (!visualTerrainRef.current) return;
    
//     console.log('[Terrain] Updating material for thermal vision:', isThermalVision);
    
//     visualTerrainRef.current.traverse((node) => {
//       if (node.isMesh) {
//         try {
//           if (isThermalVision) {
//             // Use simple non-shader material for thermal vision
//             if (node.material !== THERMAL_MATERIALS.terrain) {
//               node.material = THERMAL_MATERIALS.terrain;
//             }
//           } else {
//             // Restore original material
//             const originalMat = originalMaterialsRef.current.get(node.uuid);
//             if (originalMat && node.material !== originalMat) {
//               node.material = originalMat;
//             }
//           }
//         } catch (err) {
//           console.error('[Terrain] Error handling material:', err);
//           // Fallback to a safe material
//           node.material = new THREE.MeshBasicMaterial({ color: 0xcccccc });
//         }
//       }
//     });
//   }, [isThermalVision]);

//   if (!isInitialized) return null;

//   return (
//     <group scale={[100, 100, 100]} position={[0, 0, 0]}>
//       {/* Render interaction layer first so it's "in front" for raycasting */}
//       <primitive object={interactionLayer} />
//       {/* Then render the visual terrain */}
//       <primitive object={visualTerrainRef.current} />
//     </group>
//   );
// };

// // Preload terrain model
// useGLTF.preload('/models/mountain/terrain.glb');

// export default Terrain;
import React from 'react';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const Terrain = () => {
  const gltf = useLoader(GLTFLoader, '/models/mountain/terrain.glb');
  
  // Mark terrain for click interaction
  React.useEffect(() => {
    if (gltf.scene) {
      gltf.scene.traverse((child) => {
        if (child.isMesh) {
          child.userData.isClickableTerrain = true;
        }
      });
    }
  }, [gltf.scene]);
  
  return (
    <primitive 
      object={gltf.scene} 
      position={[0, 0, 0]} 
      scale={[100, 100, 100]} 
    />
  );
};

export default Terrain;