// import React, { useRef, useEffect, useState } from 'react';
// import { useLoader, useFrame } from '@react-three/fiber';
// import * as THREE from 'three';

// const ScorchMark = ({ position, size = 5, fadeTime = 180 }) => {
//   const markRef = useRef();
//   const startTime = useRef(Date.now());
//   const [finalPosition, setFinalPosition] = useState([...position]);
//   const [normal, setNormal] = useState([0, 1, 0]);
  
//   // Create a better scorch texture
//   const texture = React.useMemo(() => {
//     const canvas = document.createElement('canvas');
//     canvas.width = 512;
//     canvas.height = 512;
//     const ctx = canvas.getContext('2d');
    
//     // Create radial gradient for scorch mark
//     const gradient = ctx.createRadialGradient(
//       256, 256, 50,   // Inner circle
//       256, 256, 200   // Outer circle
//     );
    
//     // Define gradient colors
//     gradient.addColorStop(0, 'rgba(0, 0, 0, 0.95)');    // Center: very dark black
//     gradient.addColorStop(0.6, 'rgba(20, 20, 20, 0.8)'); // Mid: dark gray
//     gradient.addColorStop(0.8, 'rgba(30, 30, 30, 0.4)'); // Outer: lighter gray
//     gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');       // Edge: transparent
    
//     // Apply gradient
//     ctx.fillStyle = gradient;
//     ctx.fillRect(0, 0, 512, 512);
    
//     // Add some noise/irregularity
//     for (let i = 0; i < 200; i++) {
//       const x = Math.random() * 512;
//       const y = Math.random() * 512;
//       const radius = Math.random() * 20 + 5;
//       const distanceFromCenter = Math.sqrt(
//         Math.pow(x - 256, 2) + Math.pow(y - 256, 2)
//       );
      
//       if (distanceFromCenter < 240) {
//         ctx.beginPath();
//         ctx.arc(x, y, radius, 0, Math.PI * 2);
//         ctx.fillStyle = `rgba(10, 10, 10, ${Math.random() * 0.7})`; // Changed to darker color
//         ctx.fill();
//       }
//     }
    
//     // Create some jagged edges
//     ctx.globalCompositeOperation = 'destination-out';
//     for (let i = 0; i < 40; i++) {
//       const angle = Math.random() * Math.PI * 2;
//       const distance = 180 + Math.random() * 60;
//       const x = 256 + Math.cos(angle) * distance;
//       const y = 256 + Math.sin(angle) * distance;
//       const radius = 10 + Math.random() * 60;
      
//       ctx.beginPath();
//       ctx.arc(x, y, radius, 0, Math.PI * 2);
//       ctx.fillStyle = 'rgb(0, 0, 0)';
//       ctx.fill();
//     }
    
//     // Create texture from canvas
//     const texture = new THREE.CanvasTexture(canvas);
//     texture.needsUpdate = true;
//     return texture;
//   }, []);
  
//   // Use raycasting to position scorch mark on the ground
//   useEffect(() => {
//     // Create raycaster to find the ground position
//     const raycaster = new THREE.Raycaster();
//     const startPos = new THREE.Vector3(position[0], position[1] + 10, position[2]);
//     const direction = new THREE.Vector3(0, -1, 0);
//     raycaster.set(startPos, direction);
    
//     // Get the scene objects to check for intersection
//     const scene = markRef.current?.parent;
//     if (!scene) return;
    
//     // Find terrain or ground objects to place the scorch mark on
//     scene.traverseVisible(object => {
//       if (object.isMesh && 
//           object !== markRef.current && 
//           (object.name === 'terrain' || object.name.includes('ground') || object.name.includes('floor'))) {
        
//         // Check for intersection with terrain/ground
//         const intersects = raycaster.intersectObject(object, true);
//         if (intersects.length > 0) {
//           // Position slightly above the ground to prevent z-fighting
//           const groundPos = intersects[0].point;
//           setFinalPosition([groundPos.x, groundPos.y + 0.02, groundPos.z]);
          
//           // Get surface normal for better alignment
//           if (intersects[0].face && intersects[0].face.normal) {
//             setNormal([
//               intersects[0].face.normal.x,
//               intersects[0].face.normal.y,
//               intersects[0].face.normal.z
//             ]);
//           }
//         }
//       }
//     });
//   }, [position]);
  
//   // Fade out effect over time
//   useFrame(() => {
//     if (!markRef.current) return;
    
//     const elapsed = (Date.now() - startTime.current) / 1000;
    
//     // Gradually fade out over fadeTime seconds
//     if (elapsed < fadeTime) {
//       const opacity = 1 - (elapsed / fadeTime);
//       if (markRef.current.material) {
//         markRef.current.material.opacity = opacity;
//       }
//     }
//   });

//   // Calculate rotation based on surface normal
//   const rotation = React.useMemo(() => {
//     const normalVector = new THREE.Vector3(...normal);
//     const defaultUp = new THREE.Vector3(0, 1, 0);
    
//     // If normal is almost the same as default up, no rotation needed
//     if (normalVector.angleTo(defaultUp) < 0.01) {
//       return [-Math.PI / 2, 0, 0]; // Lay flat
//     }
    
//     // Calculate rotation to align with surface normal
//     const quaternion = new THREE.Quaternion().setFromUnitVectors(defaultUp, normalVector);
//     const euler = new THREE.Euler().setFromQuaternion(quaternion);
//     return [euler.x - Math.PI/2, euler.y, euler.z];
//   }, [normal]);
  
//   return (
//     <group>
//       <mesh 
//         ref={markRef} 
//         position={finalPosition}
//         rotation={rotation}
//         renderOrder={1} // Ensure it renders above the ground
//       >
//         <planeGeometry args={[size, size]} />
//         <meshBasicMaterial 
//           transparent={true}
//           opacity={1}
//           map={texture}
//           depthWrite={false} // Important to prevent z-fighting
//           blending={THREE.MultiplyBlending} // Makes black blend better
//         />
//       </mesh>
      
//       {/* Add some small debris pieces for more realism */}
//       {[...Array(8)].map((_, i) => {
//         const scale = Math.random() * 0.4 + 0.1;
//         const offset = [
//           (Math.random() - 0.5) * size * 0.7,
//           0.05 + Math.random() * 0.1,
//           (Math.random() - 0.5) * size * 0.7
//         ];
        
//         return (
//           <mesh 
//             key={`debris-${i}`}
//             position={[
//               finalPosition[0] + offset[0],
//               finalPosition[1] + offset[1],
//               finalPosition[2] + offset[2]
//             ]}
//             rotation={[
//               Math.random() * Math.PI,
//               Math.random() * Math.PI,
//               Math.random() * Math.PI
//             ]}
//           >
//             <boxGeometry args={[scale, scale, scale]} />
//             <meshStandardMaterial 
//               color={i % 2 === 0 ? '#101010' : '#202020'} // Changed to darker grays
//               roughness={0.9}
//             />
//           </mesh>
//         );
//       })}
//     </group>
//   );
// };

// export default ScorchMark;

import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const ScorchMark = ({ position, size = 5, fadeTime = 180 }) => {
  const markRef = useRef();
  const startTime = useRef(Date.now());
  const [finalPosition, setFinalPosition] = useState([...position]);
  const [normal, setNormal] = useState([0, 1, 0]);

  useEffect(() => {
    const raycaster = new THREE.Raycaster();
    const startPos = new THREE.Vector3(position[0], position[1] + 10, position[2]);
    const direction = new THREE.Vector3(0, -1, 0);
    raycaster.set(startPos, direction);

    const scene = markRef.current?.parent;
    if (!scene) return;

    scene.traverseVisible((object) => {
      if (
        object.isMesh &&
        object !== markRef.current &&
        (object.name === 'terrain' || object.name.includes('ground') || object.name.includes('floor'))
      ) {
        const intersects = raycaster.intersectObject(object, true);
        if (intersects.length > 0) {
          const groundPos = intersects[0].point;
          setFinalPosition([groundPos.x, groundPos.y + 0.02, groundPos.z]);

          if (intersects[0].face && intersects[0].face.normal) {
            setNormal([
              intersects[0].face.normal.x,
              intersects[0].face.normal.y,
              intersects[0].face.normal.z
            ]);
          }
        }
      }
    });
  }, [position]);

  useFrame(() => {
    if (!markRef.current) return;
    const elapsed = (Date.now() - startTime.current) / 1000;
    if (elapsed < fadeTime) {
      const opacity = 1 - elapsed / fadeTime;
      if (markRef.current.material) {
        markRef.current.material.opacity = opacity;
      }
    }
  });

  const rotation = React.useMemo(() => {
    const normalVector = new THREE.Vector3(...normal);
    const defaultUp = new THREE.Vector3(0, 1, 0);
    if (normalVector.angleTo(defaultUp) < 0.01) {
      return [-Math.PI / 2, 0, 0];
    }
    const quaternion = new THREE.Quaternion().setFromUnitVectors(defaultUp, normalVector);
    const euler = new THREE.Euler().setFromQuaternion(quaternion);
    return [euler.x - Math.PI / 2, euler.y, euler.z];
  }, [normal]);

  return (
    <group>
      <mesh
        ref={markRef}
        position={finalPosition}
        rotation={rotation}
        renderOrder={1}
      >
        <planeGeometry args={[size, size]} />
        {/* <meshBasicMaterial
          transparent
          opacity={0}  // <-- Invisible    to remove blue scorch mark
          depthWrite={false}
        /> */}
        <meshBasicMaterial visible={false} />

      </mesh>

      {[...Array(8)].map((_, i) => {
        const scale = Math.random() * 0.4 + 0.1;
        const offset = [
          (Math.random() - 0.5) * size * 0.7,
          0.05 + Math.random() * 0.1,
          (Math.random() - 0.5) * size * 0.7
        ];
        return (
          <mesh
            key={`debris-${i}`}
            position={[
              finalPosition[0] + offset[0],
              finalPosition[1] + offset[1],
              finalPosition[2] + offset[2]
            ]}
            rotation={[
              Math.random() * Math.PI,
              Math.random() * Math.PI,
              Math.random() * Math.PI
            ]}
          >
            <boxGeometry args={[scale, scale, scale]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? '#101010' : '#202020'}
              roughness={0.9}
            />
          </mesh>
        );
      })}
    </group>
  );
};

export default ScorchMark;
