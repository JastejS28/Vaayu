// import React, { useEffect } from 'react';
// import { useThree } from '@react-three/fiber';

// const DebugTerrainInfo = () => {
//   const { scene } = useThree();

//   useEffect(() => {
//     const debugTerrain = () => {
//       console.log('=== DEBUG TERRAIN INFO ===');
//       scene.traverse((object) => {
//         if (object.isMesh) {
//           console.log(`Mesh found: 
//             Name: ${object.name || 'unnamed'}
//             Type: ${object.type}
//             Vertices: ${object.geometry?.attributes?.position?.count || 'unknown'}
//             Material: ${object.material?.name || 'unnamed material'}
//             Parent: ${object.parent?.name || 'no parent'}
//             Position: ${object.position.toArray().map(n => n.toFixed(1)).join(', ')}
//             Scale: ${object.scale.toArray().map(n => n.toFixed(1)).join(', ')}
//           `);
//         }
//       });
//       console.log('=== END DEBUG INFO ===');
//     };

//     setTimeout(debugTerrain, 2000);
//   }, [scene]);

//   return null;
// };

// export default DebugTerrainInfo;



import React, { useEffect } from 'react';
import { useThree } from '@react-three/fiber';

const DebugTerrainInfo = () => {
  const { scene } = useThree();

  useEffect(() => {
    const debugTerrain = () => {
      console.log('=== DEBUG TERRAIN INFO ===');
      scene.traverse((object) => {
        if (object.isMesh) {
          console.log(`Mesh found: 
            Name: ${object.name || 'unnamed'}
            Type: ${object.type}
            Vertices: ${object.geometry?.attributes?.position?.count || 'unknown'}
            Material: ${object.material?.name || 'unnamed material'}
            Parent: ${object.parent?.name || 'no parent'}
            Position: ${object.position.toArray().map(n => n.toFixed(1)).join(', ')}
            Scale: ${object.scale.toArray().map(n => n.toFixed(1)).join(', ')}
          `);
        }
      });
      console.log('=== END DEBUG INFO ===');
    };

    setTimeout(debugTerrain, 2000);
  }, [scene]);

  return null;
};

export default DebugTerrainInfo;