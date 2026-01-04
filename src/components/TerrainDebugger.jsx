// import React, { useRef, useEffect } from 'react';
// import { useFrame, useThree } from '@react-three/fiber';
// import { useUAVStore } from '../store/uavStore';
// import * as THREE from 'three';

// const TerrainDebugger = () => {
//   const { scene } = useThree();
//   const { position: uavPosition } = useUAVStore();
  
//   const debugSphere = useRef();
//   const raycaster = useRef(new THREE.Raycaster());
//   const downVector = new THREE.Vector3(0, -1, 0);
  
//   useEffect(() => {
//     // Log all meshes in the scene
//     setTimeout(() => {
//       console.log('=== TERRAIN DEBUG INFO ===');
//       scene.traverse((object) => {
//         if (object.isMesh) {
//           console.log(`Mesh: "${object.name}" | Vertices: ${object.geometry?.attributes?.position?.count} | Material: ${object.material?.name}`);
//           console.log(`  Position: [${object.position.toArray().map(n => n.toFixed(1)).join(', ')}]`);
//           console.log(`  Scale: [${object.scale.toArray().map(n => n.toFixed(1)).join(', ')}]`);
//           console.log(`  Parent: "${object.parent?.name || 'Scene'}"`);
//         }
//       });
//       console.log('=== END TERRAIN DEBUG ===');
//     }, 3000);
//   }, [scene]);

//   useFrame(() => {
//     if (!debugSphere.current) return;

//     // Position debug sphere at UAV location
//     debugSphere.current.position.set(...uavPosition);
    
//     // Test raycast from UAV position
//     const uavPos = new THREE.Vector3(...uavPosition);
//     raycaster.current.set(uavPos, downVector);
//     raycaster.current.far = 200;
    
//     // Find all meshes that could be terrain
//     const allMeshes = [];
//     scene.traverse((obj) => {
//       if (obj.isMesh) allMeshes.push(obj);
//     });
    
//     const intersections = raycaster.current.intersectObjects(allMeshes, true);
    
//     if (intersections.length > 0) {
//       const hit = intersections[0];
//       const clearance = uavPos.y - hit.point.y;
      
//       // Change sphere color based on clearance
//       if (clearance < 5) {
//         debugSphere.current.material.color.setHex(0xff0000); // Red - danger
//       } else if (clearance < 10) {
//         debugSphere.current.material.color.setHex(0xffff00); // Yellow - caution
//       } else {
//         debugSphere.current.material.color.setHex(0x00ff00); // Green - safe
//       }
//     } else {
//       debugSphere.current.material.color.setHex(0x0000ff); // Blue - no terrain detected
//     }
//   });

//   return (
//     <mesh ref={debugSphere} position={uavPosition}>
//       <sphereGeometry args={[1, 8, 8]} />
//       <meshBasicMaterial color={0x00ff00} wireframe />
//     </mesh>
//   );
// };

// export default TerrainDebugger;


import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useUAVStore } from '../store/uavStore';
import * as THREE from 'three';

const TerrainDebugger = () => {
  const { scene } = useThree();
  const { position: uavPosition } = useUAVStore();
  
  const debugSphere = useRef();
  const raycaster = useRef(new THREE.Raycaster());
  const downVector = new THREE.Vector3(0, -1, 0);
  
  useEffect(() => {
    // Log all meshes in the scene
    setTimeout(() => {
      console.log('=== TERRAIN DEBUG INFO ===');
      scene.traverse((object) => {
        if (object.isMesh) {
          console.log(`Mesh: "${object.name}" | Vertices: ${object.geometry?.attributes?.position?.count} | Material: ${object.material?.name}`);
          console.log(`  Position: [${object.position.toArray().map(n => n.toFixed(1)).join(', ')}]`);
          console.log(`  Scale: [${object.scale.toArray().map(n => n.toFixed(1)).join(', ')}]`);
          console.log(`  Parent: "${object.parent?.name || 'Scene'}"`);
        }
      });
      console.log('=== END TERRAIN DEBUG ===');
    }, 3000);
  }, [scene]);

  useFrame(() => {
    if (!debugSphere.current) return;

    // Position debug sphere at UAV location
    debugSphere.current.position.set(...uavPosition);
    
    // Test raycast from UAV position
    const uavPos = new THREE.Vector3(...uavPosition);
    raycaster.current.set(uavPos, downVector);
    raycaster.current.far = 200;
    
    // Find all meshes that could be terrain
    const allMeshes = [];
    scene.traverse((obj) => {
      if (obj.isMesh) allMeshes.push(obj);
    });
    
    const intersections = raycaster.current.intersectObjects(allMeshes, true);
    
    if (intersections.length > 0) {
      const hit = intersections[0];
      const clearance = uavPos.y - hit.point.y;
      
      // Change sphere color based on clearance
      if (clearance < 5) {
        debugSphere.current.material.color.setHex(0xff0000); // Red - danger
      } else if (clearance < 10) {
        debugSphere.current.material.color.setHex(0xffff00); // Yellow - caution
      } else {
        debugSphere.current.material.color.setHex(0x00ff00); // Green - safe
      }
    } else {
      debugSphere.current.material.color.setHex(0x0000ff); // Blue - no terrain detected
    }
  });

  return (
    <mesh ref={debugSphere} position={uavPosition}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color={0x00ff00} wireframe />
    </mesh>
  );
};

export default TerrainDebugger;