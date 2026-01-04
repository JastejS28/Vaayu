// import React, { useRef, useEffect } from 'react';
// import { useFrame } from '@react-three/fiber';
// import * as THREE from 'three';

// const DetectionEffect = ({ position, duration = 1.5 }) => {
//   const ringRef = useRef();
//   const clock = useRef(new THREE.Clock());
  
//   useEffect(() => {
//     clock.current.start();
//     return () => {
//       clock.current.stop();
//     };
//   }, []);
  
//   useFrame(() => {
//     if (ringRef.current) {
//       const elapsedTime = clock.current.getElapsedTime();
//       const progress = Math.min(elapsedTime / duration, 1);
      
//       // Scale up over time
//       const scale = progress * 2;
//       ringRef.current.scale.set(scale, scale, scale);
      
//       // Fade out over time
//       const opacity = 1 - progress;
//       if (ringRef.current.material) {
//         ringRef.current.material.opacity = opacity;
//       }
//     }
//   });
  
//   return (
//     <mesh ref={ringRef} position={position}>
//       <ringGeometry args={[1.5, 2, 32]} />
//       <meshBasicMaterial color="red" transparent opacity={1} side={THREE.DoubleSide} />
//     </mesh>
//   );
// };

// export default DetectionEffect;



import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const DetectionEffect = ({ position, duration = 1.5 }) => {
  const ringRef = useRef();
  const clock = useRef(new THREE.Clock());
  
  useEffect(() => {
    clock.current.start();
    return () => {
      clock.current.stop();
    };
  }, []);
  
  useFrame(() => {
    if (ringRef.current) {
      const elapsedTime = clock.current.getElapsedTime();
      const progress = Math.min(elapsedTime / duration, 1);
      
      // Scale up over time
      const scale = progress * 2;
      ringRef.current.scale.set(scale, scale, scale);
      
      // Fade out over time
      const opacity = 1 - progress;
      if (ringRef.current.material) {
        ringRef.current.material.opacity = opacity;
      }
    }
  });
  
  return (
    <mesh ref={ringRef} position={position}>
      <ringGeometry args={[1.5, 2, 32]} />
      <meshBasicMaterial color="red" transparent opacity={1} side={THREE.DoubleSide} />
    </mesh>
  );
};

export default DetectionEffect;