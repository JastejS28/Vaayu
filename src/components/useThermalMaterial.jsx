// import { useEffect, useRef } from 'react';
// import { useUAVStore } from '../store/uavStore';
// import { THERMAL_MATERIALS } from './ThermalVisionEffect';

// const useThermalMaterial = (object, objectType) => {
//   const { isThermalVision } = useUAVStore();
//   const originalMaterials = useRef(new Map());
//   const objectName = object?.name || object?.uuid || 'UnknownObject';

//   useEffect(() => {
//     if (!object) {
//       console.log(`[useThermalMaterial] Object is null/undefined for type: ${objectType}`);
//       return;
//     }
    
//     console.log(`[useThermalMaterial] Effect run for ${objectName} (type: ${objectType}). Thermal vision: ${isThermalVision}`);

//     // Store original materials on first run or if object changes
//     // Using a simple marker based on object's direct UUID to re-initialize if the object instance itself changes.
//     if (originalMaterials.current.size === 0 || !originalMaterials.current.has(object.uuid + "_initialized_marker")) {
//       console.log(`[useThermalMaterial] Storing original materials for ${objectName}`);
//       originalMaterials.current.clear(); 
//       object.traverse((child) => {
//         if (child.isMesh && child.material) {
//           originalMaterials.current.set(child.uuid, child.material.clone());
//         }
//       });
//       originalMaterials.current.set(object.uuid + "_initialized_marker", true); 
//     }
    
//     object.traverse((child) => {
//       if (child.isMesh && child.material) {
//         if (isThermalVision) {
//           let thermalMaterialToApply;
//           switch(objectType) {
//             case 'tank': thermalMaterialToApply = THERMAL_MATERIALS.hot; break;
//             case 'jeep': thermalMaterialToApply = THERMAL_MATERIALS.medium; break;
//             case 'warehouse': thermalMaterialToApply = THERMAL_MATERIALS.medium; break;
//             default: thermalMaterialToApply = THERMAL_MATERIALS.medium;
//           }
//           if (child.material !== thermalMaterialToApply) {
//             console.log(`[useThermalMaterial] Applying thermal material (${objectType}, color: ${thermalMaterialToApply.color.getHexString()}) to mesh in ${objectName}`);
//             child.material = thermalMaterialToApply;
//           }
//         } else {
//           const originalMat = originalMaterials.current.get(child.uuid);
//           if (originalMat && child.material !== originalMat) {
//             console.log(`[useThermalMaterial] Restoring original material to mesh in ${objectName}`);
//             child.material = originalMat;
//           }
//         }
//       }
//     });
    
//   }, [object, objectType, isThermalVision, objectName]);

// };

// export default useThermalMaterial;

import { useEffect, useRef } from 'react';
import { useUAVStore } from '../store/uavStore';
import { THERMAL_MATERIALS } from './ThermalVisionEffect';

const useThermalMaterial = (object, objectType) => {
  const { isThermalVision } = useUAVStore();
  const originalMaterials = useRef(new Map());
  const objectName = object?.name || object?.uuid || 'UnknownObject';

  useEffect(() => {
    if (!object) {
      console.log(`[useThermalMaterial] Object is null/undefined for type: ${objectType}`);
      return;
    }
    
    console.log(`[useThermalMaterial] Effect run for ${objectName} (type: ${objectType}). Thermal vision: ${isThermalVision}`);

    // Store original materials on first run or if object changes
    // Using a simple marker based on object's direct UUID to re-initialize if the object instance itself changes.
    if (originalMaterials.current.size === 0 || !originalMaterials.current.has(object.uuid + "_initialized_marker")) {
      console.log(`[useThermalMaterial] Storing original materials for ${objectName}`);
      originalMaterials.current.clear(); 
      object.traverse((child) => {
        if (child.isMesh && child.material) {
          originalMaterials.current.set(child.uuid, child.material.clone());
        }
      });
      originalMaterials.current.set(object.uuid + "_initialized_marker", true); 
    }
    
    object.traverse((child) => {
      if (child.isMesh && child.material) {
        if (isThermalVision) {
          let thermalMaterialToApply;
          switch(objectType) {
            case 'tank': thermalMaterialToApply = THERMAL_MATERIALS.hot; break;
            case 'jeep': thermalMaterialToApply = THERMAL_MATERIALS.medium; break;
            case 'warehouse': thermalMaterialToApply = THERMAL_MATERIALS.medium; break;
            default: thermalMaterialToApply = THERMAL_MATERIALS.medium;
          }
          if (child.material !== thermalMaterialToApply) {
            console.log(`[useThermalMaterial] Applying thermal material (${objectType}, color: ${thermalMaterialToApply.color.getHexString()}) to mesh in ${objectName}`);
            child.material = thermalMaterialToApply;
          }
        } else {
          const originalMat = originalMaterials.current.get(child.uuid);
          if (originalMat && child.material !== originalMat) {
            console.log(`[useThermalMaterial] Restoring original material to mesh in ${objectName}`);
            child.material = originalMat;
          }
        }
      }
    });
    
  }, [object, objectType, isThermalVision, objectName]);

};

export default useThermalMaterial;