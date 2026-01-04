// import * as THREE from 'three';

// // Create simple materials for thermal vision
// // Using basic materials instead of complex shader materials
// const createThermalMaterials = () => {
//   // Create a simple color gradient for thermal vision
//   const thermalTerrain = new THREE.MeshBasicMaterial({
//     color: 0x00ff00, // Green base color
//     wireframe: false
//   });
  
//   // Color constants
//   const redColor = new THREE.Color(0xff0000);
//   const yellowColor = new THREE.Color(0xffff00);
//   const blueColor = new THREE.Color(0x0000ff);
  
//   // Create basic colored materials
//   const hot = new THREE.MeshBasicMaterial({ color: redColor });
//   const medium = new THREE.MeshBasicMaterial({ color: yellowColor });
//   const cool = new THREE.MeshBasicMaterial({ color: blueColor });
  
//   // Log the created materials for debugging
//   console.log('[ThermalEffect] Created simple thermal materials');
  
//   return {
//     terrain: thermalTerrain,
//     hot,
//     medium,
//     cool
//   };
// };

// // Create and export materials used in thermal vision
// export const THERMAL_MATERIALS = createThermalMaterials();

// // Component that just defines materials
// const ThermalVisionEffect = () => {
//   // No UI component is rendered
//   return null;
// };

// export default ThermalVisionEffect;


import * as THREE from 'three';

// Create simple materials for thermal vision
// Using basic materials instead of complex shader materials
const createThermalMaterials = () => {
  // Create a simple color gradient for thermal vision
  const thermalTerrain = new THREE.MeshBasicMaterial({
    color: 0x00ff00, // Green base color
    wireframe: false
  });
  
  // Color constants
  const redColor = new THREE.Color(0xff0000);
  const yellowColor = new THREE.Color(0xffff00);
  const blueColor = new THREE.Color(0x0000ff);
  
  // Create basic colored materials
  const hot = new THREE.MeshBasicMaterial({ color: redColor });
  const medium = new THREE.MeshBasicMaterial({ color: yellowColor });
  const cool = new THREE.MeshBasicMaterial({ color: blueColor });
  
  // Log the created materials for debugging
  console.log('[ThermalEffect] Created simple thermal materials');
  
  return {
    terrain: thermalTerrain,
    hot,
    medium,
    cool
  };
};

// Create and export materials used in thermal vision
export const THERMAL_MATERIALS = createThermalMaterials();

// Component that just defines materials
const ThermalVisionEffect = () => {
  // No UI component is rendered
  return null;
};

export default ThermalVisionEffect;
