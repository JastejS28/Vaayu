// import React, { useRef } from 'react';
// import { useFrame } from '@react-three/fiber';
// import { Cloud, Sky } from '@react-three/drei';
// import * as THREE from 'three';

// const DayEnvironment = () => {
//   const sunRef = useRef();
//   // The sunPosition for the Sky component also influences its lighting direction.
//   const sunPosition = [100, 100, 50]; // Adjusted for potentially better lighting angle

//   useFrame(() => {
//     if (sunRef.current) {
//       const pulse = Math.sin(Date.now() * 0.0005) * 0.1 + 1;
//       sunRef.current.scale.set(pulse, pulse, pulse);
//     }
//   });

//   return (
//     <>
//       {/* Set a clear blue background color */}
//       <color attach="background" args={["#87CEEB"]} />
      
//       {/* Sky component for atmospheric effects and sun rendering */}
//       <Sky 
//         distance={450000} 
//         sunPosition={sunPosition} 
//         inclination={0.35} // Adjusted inclination for a higher sun
//         azimuth={0.25} 
//         mieCoefficient={0.005}
//         rayleigh={2} // Increased Rayleigh for a potentially brighter sky
//         turbidity={10} // Standard day turbidity
//       />
      
//       {/* Visual representation of the sun (does not emit light itself) */}
//       <mesh position={sunPosition} ref={sunRef}>
//         <sphereGeometry args={[10, 32, 32]} /> {/* Slightly larger sun */}
//         <meshBasicMaterial color="#FDB813" transparent opacity={0.9} fog={false} />
//       </mesh>
      
//       {/* Explicit lighting to ensure terrain is illuminated */}
//       {/* Ambient light provides overall background illumination */}
//       <ambientLight intensity={1.0} color="#FFFFFF" /> {/* Increased intensity */}
      
//       {/* Directional light simulates direct sunlight */}
//       {/* Pointing from the sun's general direction */}
//       <directionalLight 
//         position={sunPosition} // Light comes from the sun's position
//         intensity={2.5} // Increased intensity
//         color="#FFFFFF" 
//         castShadow 
//         shadow-mapSize-width={2048} // Higher shadow map resolution
//         shadow-mapSize-height={2048}
//         shadow-camera-far={500}
//         shadow-camera-left={-150}
//         shadow-camera-right={150}
//         shadow-camera-top={150}
//         shadow-camera-bottom={-150}
//       />
      
//       {/* Clouds for visual appeal */}
//       <Cloud position={[0, 70, -50]} args={[3, 2]} scale={5} color="white" opacity={0.7} />
//       <Cloud position={[80, 60, -20]} args={[3, 2]} scale={6} color="white" opacity={0.6}/>
//       <Cloud position={[-80, 75, 0]} args={[3, 2]} scale={7} color="white" opacity={0.8}/>
//     </>
//   );
// };

// export default DayEnvironment;



import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Cloud, Sky } from '@react-three/drei';
import * as THREE from 'three';

const DayEnvironment = () => {
  const sunRef = useRef();
  // The sunPosition for the Sky component also influences its lighting direction.
  const sunPosition = [100, 100, 50]; // Adjusted for potentially better lighting angle

  useFrame(() => {
    if (sunRef.current) {
      const pulse = Math.sin(Date.now() * 0.0005) * 0.1 + 1;
      sunRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  return (
    <>
      {/* Set a clear blue background color */}
      <color attach="background" args={["#87CEEB"]} />
      
      {/* Sky component for atmospheric effects and sun rendering */}
      <Sky 
        distance={450000} 
        sunPosition={sunPosition} 
        inclination={0.35} // Adjusted inclination for a higher sun
        azimuth={0.25} 
        mieCoefficient={0.005}
        rayleigh={2} // Increased Rayleigh for a potentially brighter sky
        turbidity={10} // Standard day turbidity
      />
      
      {/* Visual representation of the sun (does not emit light itself) */}
      <mesh position={sunPosition} ref={sunRef}>
        <sphereGeometry args={[10, 32, 32]} /> {/* Slightly larger sun */}
        <meshBasicMaterial color="#FDB813" transparent opacity={0.9} fog={false} />
      </mesh>
      
      {/* Explicit lighting to ensure terrain is illuminated */}
      {/* Ambient light provides overall background illumination */}
      <ambientLight intensity={1.0} color="#FFFFFF" /> {/* Increased intensity */}
      
      {/* Directional light simulates direct sunlight */}
      {/* Pointing from the sun's general direction */}
      <directionalLight 
        position={sunPosition} // Light comes from the sun's position
        intensity={2.5} // Increased intensity
        color="#FFFFFF" 
        castShadow 
        shadow-mapSize-width={2048} // Higher shadow map resolution
        shadow-mapSize-height={2048}
        shadow-camera-far={500}
        shadow-camera-left={-150}
        shadow-camera-right={150}
        shadow-camera-top={150}
        shadow-camera-bottom={-150}
      />
      
      {/* Clouds for visual appeal */}
      <Cloud position={[0, 70, -50]} args={[3, 2]} scale={5} color="white" opacity={0.7} />
      <Cloud position={[80, 60, -20]} args={[3, 2]} scale={6} color="white" opacity={0.6}/>
      <Cloud position={[-80, 75, 0]} args={[3, 2]} scale={7} color="white" opacity={0.8}/>
    </>
  );
};

export default DayEnvironment;