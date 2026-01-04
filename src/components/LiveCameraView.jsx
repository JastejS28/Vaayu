// import React, { useRef, useEffect } from 'react';
// import * as THREE from 'three';
// import { useGLTF } from '@react-three/drei';
// import { useUAVStore } from '../store/uavStore';
// import { useEnvironmentStore } from '../store/environmentStore';
// import { useCameraStore } from '../store/cameraStore';
// import { useAttackDroneStore } from '../store/attackDroneStore';
// import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
// import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
// import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

// // Define sky colors for the live view
// const DAY_SKY_COLOR = new THREE.Color(0xF2F4F7);
// const NIGHT_SKY_COLOR = new THREE.Color(0x000000);
// const RAIN_SKY_COLOR = new THREE.Color(0x8B7D6B); // Darker beige for rain
// const THERMAL_SKY_COLOR = new THREE.Color(0x001100); // Dark green for thermal background

// // Create materials for different objects in thermal view
// const THERMAL_MATERIALS = {
//   terrain: new THREE.MeshBasicMaterial({ color: 0x004400 }), // Dark green for terrain
//   uav: new THREE.MeshBasicMaterial({ color: 0xFFFF00, emissive: 0xFFFF00, emissiveIntensity: 5.0 }), // Bright yellow for UAV
//   tank: new THREE.MeshBasicMaterial({ color: 0xFFFF00, emissive: 0xFFFF00, emissiveIntensity: 5.0 }), // Bright yellow for tank
//   jeep: new THREE.MeshBasicMaterial({ color: 0xFFFF00, emissive: 0xFFFF00, emissiveIntensity: 5.0 }), // Bright yellow for jeep
//   soldier: new THREE.MeshBasicMaterial({ color: 0xFFFF00, emissive: 0xFFFF00, emissiveIntensity: 5.0 }), // Bright yellow for soldier
//   warehouse: new THREE.MeshBasicMaterial({ color: 0xFFFF00, emissive: 0xFFFF00, emissiveIntensity: 5.0 }), // Bright yellow for warehouse
//   armyBase: new THREE.MeshBasicMaterial({ color: 0xFFFF00, emissive: 0xFFFF00, emissiveIntensity: 5.0 }), // Bright yellow for army base
// };

// // Normal materials
// const NORMAL_MATERIALS = {
//   uav: new THREE.MeshStandardMaterial({ color: 0x333333 }),
//   tank: new THREE.MeshStandardMaterial({ color: 0x2c2c2c }),
//   jeep: new THREE.MeshStandardMaterial({ color: 0x3c3c3c }),
//   soldier: new THREE.MeshStandardMaterial({ color: 0x5a4a3a }),
//   warehouse: new THREE.MeshStandardMaterial({ color: 0x4a4a4a }),
//   armyBase: new THREE.MeshStandardMaterial({ color: 0x555555 }),
// };

// // Enhanced thermal vision shader
// const ThermalShader = {
//   uniforms: {
//     'tDiffuse': { value: null },
//     'time': { value: 0 },
//     'noiseIntensity': { value: 0.05 },
//     'contrast': { value: 2.0 },
//     'brightness': { value: 0.3 },
//     'thermalIntensity': { value: 1.5 }
//   },
//   vertexShader: `
//     varying vec2 vUv;
//     void main() {
//       vUv = uv;
//       gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
//     }
//   `,
//   fragmentShader: `
//     uniform sampler2D tDiffuse;
//     uniform float time;
//     uniform float noiseIntensity;
//     uniform float contrast;
//     uniform float brightness;
//     uniform float thermalIntensity;
//     varying vec2 vUv;
    
//     // Enhanced noise function for terrain variation
//     float noise(vec2 st) {
//       return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
//     }
    
//     // Multi-octave noise for terrain variation
//     float fbm(vec2 st) {
//       float value = 0.0;
//       float amplitude = 0.5;
//       for (int i = 0; i < 4; i++) {
//         value += amplitude * noise(st);
//         st *= 2.0;
//         amplitude *= 0.5;
//       }
//       return value;
//     }
    
//     // Thermal color mapping like your reference image
//     vec3 getThermalColor(float temp) {
//       temp = clamp(temp, 0.0, 1.0);
      
//       // Add terrain variation using noise
//       float terrainNoise = fbm(vUv * 20.0 + time * 0.1) * 0.3;
//       temp += terrainNoise;
//       temp = clamp(temp, 0.0, 1.0);
      
//       // Cold areas (dark green to green)
//       if (temp < 0.2) {
//         return mix(vec3(0.0, 0.2, 0.0), vec3(0.0, 0.5, 0.0), temp * 5.0);
//       }
//       // Cool areas (green to bright green)
//       else if (temp < 0.4) {
//         return mix(vec3(0.0, 0.5, 0.0), vec3(0.2, 0.8, 0.2), (temp - 0.2) * 5.0);
//       }
//       // Medium areas (green to yellow-green)
//       else if (temp < 0.6) {
//         return mix(vec3(0.2, 0.8, 0.2), vec3(0.6, 1.0, 0.0), (temp - 0.4) * 5.0);
//       }
//       // Warm areas (yellow-green to yellow)
//       else if (temp < 0.75) {
//         return mix(vec3(0.6, 1.0, 0.0), vec3(1.0, 1.0, 0.0), (temp - 0.6) * 6.67);
//       }
//       // Hot areas (yellow to orange)
//       else if (temp < 0.9) {
//         return mix(vec3(1.0, 1.0, 0.0), vec3(1.0, 0.5, 0.0), (temp - 0.75) * 6.67);
//       }
//       // Very hot areas (orange to red)
//       else {
//         return mix(vec3(1.0, 0.5, 0.0), vec3(1.0, 0.0, 0.0), (temp - 0.9) * 10.0);
//       }
//     }
    
//     void main() {
//       vec4 color = texture2D(tDiffuse, vUv);
      
//       // Calculate brightness
//       float brightness = dot(color.rgb, vec3(0.299, 0.587, 0.114));
      
//       // Boost brightness for thermal effect
//       brightness = brightness * thermalIntensity + brightness;
      
//       // Apply contrast
//       brightness = (brightness - 0.5) * contrast + 0.5 + brightness;
//       brightness = clamp(brightness, 0.0, 1.0);
      
//       // Add subtle noise
//       float noise = noise(vUv * 100.0 + time * 0.1) * noiseIntensity;
//       brightness += noise;
      
//       brightness = clamp(brightness, 0.0, 1.0);
      
//       // Get thermal color
//       vec3 thermalColor = getThermalColor(brightness);
      
//       // Add scan lines for thermal camera effect
//       float scanline = sin(vUv.y * 300.0 + time * 2.0) * 0.05;
//       thermalColor += scanline;
      
//       gl_FragColor = vec4(thermalColor, 1.0);
//     }
//   `
// };

// const LiveCameraView = ({ portalRef }) => {
//   const canvasRef = useRef();
//   const rendererRef = useRef();
//   const composerRef = useRef();
//   const customSceneRef = useRef(new THREE.Scene());
//   const customCameraRef = useRef();
//   const animationFrameIdRef = useRef();
//   const thermalPassRef = useRef();
//   const lastTimeRef = useRef(0);

//   // Model references
//   const modelInstancesRef = useRef({});

//   // Load all models
//   const { scene: terrainModel } = useGLTF('/models/mountain/terrain.glb');
//   const { scene: uavModel } = useGLTF('/models/surveillance-uav/drone.glb');
//   const { scene: tankModel } = useGLTF('/models/tank/tank.glb');
//   const { scene: jeepModel } = useGLTF('/models/jeep/jeep.glb');
//   const { scene: soldierModel } = useGLTF('/models/soldier/soldier.glb');
//   const { scene: warehouseModel } = useGLTF('/models/building/warehouse.glb');
//   const { scene: armyBaseModel } = useGLTF('/models/army_base/army_base.glb');

//   useEffect(() => {
//     // --- FIX: Add a guard clause ---
//     // This ensures that the portalRef is attached to a DOM element before we try to use it.
//     if (!portalRef.current) {
//       console.log("[LiveCameraView] Portal ref not ready. Skipping setup.");
//       return;
//     }

//     console.log("[LiveCameraView] Initializing with portalRef:", portalRef.current);
//     const container = portalRef.current;
    
//     // Check if a renderer already exists to prevent duplicates
//     if (rendererRef.current) {
//       console.warn("[LiveCameraView] Renderer already exists. Skipping initialization.");
//       return;
//     }

//     // --- Setup Canvas & Renderer ---
//     const canvas = document.createElement('canvas');
//     Object.assign(canvas.style, { width: '100%', height: '100%', borderRadius: '8px' });
//     container.innerHTML = '';
//     container.appendChild(canvas);
//     canvasRef.current = canvas;

//     const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
//     rendererRef.current = renderer;
//     const rect = container.getBoundingClientRect();
//     renderer.setSize(rect.width, rect.height);
//     renderer.setPixelRatio(window.devicePixelRatio);
//     renderer.shadowMap.enabled = true;
//     renderer.shadowMap.type = THREE.PCFSoftShadowMap;

//     // --- Setup Scene, Camera, and Lighting ---
//     const scene = customSceneRef.current;
//     const camera = new THREE.PerspectiveCamera(75, rect.width / rect.height, 0.1, 10000);
//     customCameraRef.current = camera;
    
//     // Enhanced lighting for better model visibility
//     scene.add(new THREE.AmbientLight(0xffffff, 1.2));
//     const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
//     dirLight.position.set(10, 20, 5);
//     dirLight.castShadow = true;
//     scene.add(dirLight);

//     // --- Add all models to the scene ---
//     const instances = {};

//     // Add terrain
//     if (terrainModel) {
//       const terrainClone = terrainModel.clone(true);
//       terrainClone.scale.set(100, 100, 100);
//       // Keep original materials with textures
//       terrainClone.traverse(node => {
//         if (node.isMesh) {
//           // Don't override materials - keep original textures
//           node.receiveShadow = true;
//           node.castShadow = true;
//         }
//       });
//       instances.terrain = terrainClone;
//       scene.add(terrainClone);
//     }

//     // Add UAV
//     if (uavModel) {
//       const uavClone = uavModel.clone(true);
//       uavClone.scale.set(3, 3, 3);
//       // Store original materials before any modifications
//       const originalUavMaterials = new Map();
//       uavClone.traverse(node => {
//         if (node.isMesh) {
//           originalUavMaterials.set(node.uuid, node.material.clone());
//           node.castShadow = true;
//         }
//       });
//       instances.uav = uavClone;
//       instances.uav.originalMaterials = originalUavMaterials;
//       scene.add(uavClone);
//     }

//     // Add Tank
//     if (tankModel) {
//       const tankClone = tankModel.clone(true);
//       tankClone.position.set(40, 19, 16);
//       tankClone.scale.set(0.5, 0.5, 0.5);
//       // Store original materials
//       const originalTankMaterials = new Map();
//       tankClone.traverse(node => {
//         if (node.isMesh) {
//           originalTankMaterials.set(node.uuid, node.material.clone());
//           node.castShadow = true;
//         }
//       });
//       instances.tank = tankClone;
//       instances.tank.originalMaterials = originalTankMaterials;
//       scene.add(tankClone);
//     }

//     // Add Jeep
//     if (jeepModel) {
//       const jeepClone = jeepModel.clone(true);
//       jeepClone.position.set(40, 19, 20);
//       jeepClone.scale.set(0.03, 0.03, 0.03);
//       // Store original materials
//       const originalJeepMaterials = new Map();
//       jeepClone.traverse(node => {
//         if (node.isMesh) {
//           originalJeepMaterials.set(node.uuid, node.material.clone());
//           node.castShadow = true;
//         }
//       });
//       instances.jeep = jeepClone;
//       instances.jeep.originalMaterials = originalJeepMaterials;
//       scene.add(jeepClone);
//     }

//     // Add Soldier
//     if (soldierModel) {
//       const soldierClone = soldierModel.clone(true);
//       soldierClone.position.set(40, 21, 32);
//       soldierClone.scale.set(0.2, 0.2, 0.2);
//       // Store original materials
//       const originalSoldierMaterials = new Map();
//       soldierClone.traverse(node => {
//         if (node.isMesh) {
//           originalSoldierMaterials.set(node.uuid, node.material.clone());
//           node.castShadow = true;
//         }
//       });
//       instances.soldier = soldierClone;
//       instances.soldier.originalMaterials = originalSoldierMaterials;
//       scene.add(soldierClone);
//     }

//     // Add Warehouse
//     if (warehouseModel) {
//       const warehouseClone = warehouseModel.clone(true);
//       warehouseClone.position.set(40, 21, 32);
//       warehouseClone.scale.set(0.7, 0.7, 0.7);
//       // Store original materials
//       const originalWarehouseMaterials = new Map();
//       warehouseClone.traverse(node => {
//         if (node.isMesh) {
//           originalWarehouseMaterials.set(node.uuid, node.material.clone());
//           node.castShadow = true;
//           node.receiveShadow = true;
//         }
//       });
//       instances.warehouse = warehouseClone;
//       instances.warehouse.originalMaterials = originalWarehouseMaterials;
//       scene.add(warehouseClone);
//     }

//     // Add Army Base
//     if (armyBaseModel) {
//       const armyBaseClone = armyBaseModel.clone(true);
//       armyBaseClone.position.set(-45, 25, -40);
//       armyBaseClone.scale.set(0.5, 0.5, 0.5);
//       // Store original materials
//       const originalArmyBaseMaterials = new Map();
//       armyBaseClone.traverse(node => {
//         if (node.isMesh) {
//           originalArmyBaseMaterials.set(node.uuid, node.material.clone());
//           node.castShadow = true;
//           node.receiveShadow = true;
//         }
//       });
//       instances.armyBase = armyBaseClone;
//       instances.armyBase.originalMaterials = originalArmyBaseMaterials;
//       scene.add(armyBaseClone);
//     }

//     modelInstancesRef.current = instances;

//     // --- Setup Post-Processing Effects ---
//     const composer = new EffectComposer(renderer);
//     composerRef.current = composer;
    
//     const renderPass = new RenderPass(scene, camera);
//     composer.addPass(renderPass);
    
//     // Add thermal vision shader pass
//     const thermalPass = new ShaderPass(ThermalShader);
//     thermalPass.enabled = false; // Start disabled
//     thermalPassRef.current = thermalPass;
//     composer.addPass(thermalPass);

//     // --- Animation Loop ---
//     const animate = (time) => {
//       animationFrameIdRef.current = requestAnimationFrame(animate);
      
//       // FIXED: Get the CURRENT state every frame
//       const { position, rotation, isThermalVision, isCrashed, droneType } = useUAVStore.getState();
//       const { destroyedTargets } = useAttackDroneStore.getState();
//       const { environmentMode } = useEnvironmentStore.getState();
//       const { getCurrentSettings } = useCameraStore.getState();
//       const settings = getCurrentSettings();

//       // Reset animation on position changes to prevent stale closures
//       if (!position || !Array.isArray(position) || position.length !== 3) {
//         console.warn("[LiveCameraView] Invalid position data:", position);
//         return;
//       }

//       // DEBUG: Log UAV position every 2 seconds to track updates
//       if (Math.floor(time / 1000) % 2 === 0 && time % 100 < 16) {
//         console.log('[LiveCameraView] UAV Position:', position, 'DroneType:', droneType, 'Settings:', settings);
//       }

//       const deltaTime = (time - lastTimeRef.current) / 1000;
//       lastTimeRef.current = time;

//       // Update camera
//       const rotationMatrix = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(...rotation));
//       const offsetVector = new THREE.Vector3(...settings.offset).applyMatrix4(rotationMatrix);
//       const lookAtOffset = new THREE.Vector3(...settings.lookAtOffset).applyMatrix4(rotationMatrix);
//       // CRITICAL FIX: Force camera position update every frame for proper tracking
//       const newCameraPosition = new THREE.Vector3().fromArray(position).add(offsetVector);
//       const newLookAtTarget = new THREE.Vector3().fromArray(position).add(lookAtOffset);

//       camera.position.copy(newCameraPosition);
//       camera.lookAt(newLookAtTarget);
//       camera.fov = settings.fov;
//       camera.updateProjectionMatrix();

//       // Update UAV position and visibility
//       if (instances.uav) {
//         instances.uav.position.fromArray(position);
//         instances.uav.rotation.fromArray(rotation);
        
//         // Show UAV only if spawned (not at default position)
//         const isSpawned = position[0] !== 0 || position[1] !== 50 || position[2] !== 0;
//         instances.uav.visible = isSpawned && (droneType === 'surveillance' || droneType === 'attack');
//       }

//       // Hide destroyed targets
//       destroyedTargets.forEach(targetId => {
//         if (targetId.includes('tank') && instances.tank) instances.tank.visible = false;
//         if (targetId.includes('jeep') && instances.jeep) instances.jeep.visible = false;
//         if (targetId.includes('warehouse') && instances.warehouse) instances.warehouse.visible = false;
//         if (targetId.includes('soldier') && instances.soldier) instances.soldier.visible = false;
//       });

//       // Update thermal vision
//       if (isThermalVision) {
//         // FIXED: Enhanced validation to prevent Three.js uniform error
//         if (thermalPassRef.current && 
//             thermalPassRef.current.uniforms && 
//             thermalPassRef.current.material && 
//             thermalPassRef.current.material.uniforms) {
          
//           thermalPassRef.current.enabled = true;
          
//           // Safely access uniforms with existence checks
//           const uniforms = thermalPassRef.current.uniforms;
          
//           if (uniforms.time && uniforms.time.value !== undefined) {
//             uniforms.time.value += deltaTime;
//           }
          
//           // Enhanced thermal parameters for better terrain variation
//           if (uniforms.noiseIntensity && uniforms.noiseIntensity.value !== undefined) {
//             uniforms.noiseIntensity.value = 0.15;
//           }
//           if (uniforms.contrast && uniforms.contrast.value !== undefined) {
//             uniforms.contrast.value = 3.0;
//           }
//           if (uniforms.thermalIntensity && uniforms.thermalIntensity.value !== undefined) {
//             uniforms.thermalIntensity.value = 2.5;
//           }
//         }
        
//         // Apply thermal materials to all objects
//         Object.entries(instances).forEach(([key, instance]) => {
//           if (instance && THERMAL_MATERIALS[key]) {
//             instance.traverse(node => {
//               if (node.isMesh) {
//                 // Use bright thermal materials for models only
//                 // Terrain thermal effect will be handled by the shader
//                 if (key !== 'terrain') {
//                   node.material = THERMAL_MATERIALS[key];
//                 }
//               }
//             });
//           }
//         });
//       } else {
//         thermalPassRef.current.enabled = false;
        
//         // Restore original materials for all objects
//         Object.entries(instances).forEach(([key, instance]) => {
//           if (instance && instance.originalMaterials) {
//             instance.traverse(node => {
//               if (node.isMesh && instance.originalMaterials.has(node.uuid)) {
//                 node.material = instance.originalMaterials.get(node.uuid);
//               }
//             });
//           }
//         });
//       }

//       // Set background color
//       let skyColor = isThermalVision ? THERMAL_SKY_COLOR : 
//                      (environmentMode === 'night' ? NIGHT_SKY_COLOR : 
//                      (environmentMode === 'rain' ? RAIN_SKY_COLOR : DAY_SKY_COLOR));
//       renderer.setClearColor(skyColor);

//       // Handle crash overlay
//       const overlay = portalRef.current.querySelector('.crash-overlay');
//       if (isCrashed && !overlay) {
//         const crashOverlay = document.createElement('div');
//         Object.assign(crashOverlay.style, { 
//           position: 'absolute', 
//           top: '0', 
//           left: '0', 
//           width: '100%', 
//           height: '100%', 
//           background: 'rgba(255,0,0,0.3)', 
//           zIndex: '10', 
//           pointerEvents: 'none' 
//         });
//         crashOverlay.className = 'crash-overlay';
//         portalRef.current.appendChild(crashOverlay);
//       } else if (!isCrashed && overlay) {
//         overlay.remove();
//       }

//       composerRef.current.render();
//     };
    
//     animate(0);

//     // --- Cleanup ---
//     return () => {
//       cancelAnimationFrame(animationFrameIdRef.current);
//       renderer.dispose();
//       composer.dispose();
//       scene.clear();
//     };
//   }, [terrainModel, uavModel, tankModel, jeepModel, soldierModel, warehouseModel, armyBaseModel]);

//   // This component manages its own rendering via a portal and should not return any JSX
//   // into the main R3F tree.
//   return null;
// };

// export default LiveCameraView;

// function animate2() {
//   // First make the function self-calling but safe
//   requestAnimationFrame(animate2);
  
//   try {
//     // Look for the element with class rather than ID to be more resilient
//     const cameraOverlay = document.querySelector('.camera-overlay');
//     if (!cameraOverlay) return;
    
//     // Continue with existing overlay animation code...
//     // ...
    
//   } catch (error) {
//     // Silent catch to prevent errors from breaking the animation loop
//   }
// }

// // Start the animation
// animate2();



import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { useUAVStore } from '../store/uavStore';
import { useEnvironmentStore } from '../store/environmentStore';
import { useCameraStore } from '../store/cameraStore';
import { useAttackDroneStore } from '../store/attackDroneStore';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

// Define sky colors for the live view
const DAY_SKY_COLOR = new THREE.Color(0xF2F4F7);
const NIGHT_SKY_COLOR = new THREE.Color(0x000000);
const RAIN_SKY_COLOR = new THREE.Color(0x8B7D6B); // Darker beige for rain
const THERMAL_SKY_COLOR = new THREE.Color(0x001100); // Dark green for thermal background

// Create materials for different objects in thermal view
const THERMAL_MATERIALS = {
  terrain: new THREE.MeshBasicMaterial({ color: 0x004400 }), // Dark green for terrain
  uav: new THREE.MeshBasicMaterial({ color: 0xFFFF00, emissive: 0xFFFF00, emissiveIntensity: 5.0 }), // Bright yellow for UAV
  tank: new THREE.MeshBasicMaterial({ color: 0xFFFF00, emissive: 0xFFFF00, emissiveIntensity: 5.0 }), // Bright yellow for tank
  jeep: new THREE.MeshBasicMaterial({ color: 0xFFFF00, emissive: 0xFFFF00, emissiveIntensity: 5.0 }), // Bright yellow for jeep
  soldier: new THREE.MeshBasicMaterial({ color: 0xFFFF00, emissive: 0xFFFF00, emissiveIntensity: 5.0 }), // Bright yellow for soldier
  warehouse: new THREE.MeshBasicMaterial({ color: 0xFFFF00, emissive: 0xFFFF00, emissiveIntensity: 5.0 }), // Bright yellow for warehouse
  armyBase: new THREE.MeshBasicMaterial({ color: 0xFFFF00, emissive: 0xFFFF00, emissiveIntensity: 5.0 }), // Bright yellow for army base
};

// Normal materials
const NORMAL_MATERIALS = {
  uav: new THREE.MeshStandardMaterial({ color: 0x333333 }),
  tank: new THREE.MeshStandardMaterial({ color: 0x2c2c2c }),
  jeep: new THREE.MeshStandardMaterial({ color: 0x3c3c3c }),
  soldier: new THREE.MeshStandardMaterial({ color: 0x5a4a3a }),
  warehouse: new THREE.MeshStandardMaterial({ color: 0x4a4a4a }),
  armyBase: new THREE.MeshStandardMaterial({ color: 0x555555 }),
};

// Enhanced thermal vision shader
const ThermalShader = {
  uniforms: {
    'tDiffuse': { value: null },
    'time': { value: 0 },
    'noiseIntensity': { value: 0.05 },
    'contrast': { value: 2.0 },
    'brightness': { value: 0.3 },
    'thermalIntensity': { value: 1.5 }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float time;
    uniform float noiseIntensity;
    uniform float contrast;
    uniform float brightness;
    uniform float thermalIntensity;
    varying vec2 vUv;
    
    // Enhanced noise function for terrain variation
    float noise(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
    }
    
    // Multi-octave noise for terrain variation
    float fbm(vec2 st) {
      float value = 0.0;
      float amplitude = 0.5;
      for (int i = 0; i < 4; i++) {
        value += amplitude * noise(st);
        st *= 2.0;
        amplitude *= 0.5;
      }
      return value;
    }
    
    // Thermal color mapping like your reference image
    vec3 getThermalColor(float temp) {
      temp = clamp(temp, 0.0, 1.0);
      
      // Add terrain variation using noise
      float terrainNoise = fbm(vUv * 20.0 + time * 0.1) * 0.3;
      temp += terrainNoise;
      temp = clamp(temp, 0.0, 1.0);
      
      // Cold areas (dark green to green)
      if (temp < 0.2) {
        return mix(vec3(0.0, 0.2, 0.0), vec3(0.0, 0.5, 0.0), temp * 5.0);
      }
      // Cool areas (green to bright green)
      else if (temp < 0.4) {
        return mix(vec3(0.0, 0.5, 0.0), vec3(0.2, 0.8, 0.2), (temp - 0.2) * 5.0);
      }
      // Medium areas (green to yellow-green)
      else if (temp < 0.6) {
        return mix(vec3(0.2, 0.8, 0.2), vec3(0.6, 1.0, 0.0), (temp - 0.4) * 5.0);
      }
      // Warm areas (yellow-green to yellow)
      else if (temp < 0.75) {
        return mix(vec3(0.6, 1.0, 0.0), vec3(1.0, 1.0, 0.0), (temp - 0.6) * 6.67);
      }
      // Hot areas (yellow to orange)
      else if (temp < 0.9) {
        return mix(vec3(1.0, 1.0, 0.0), vec3(1.0, 0.5, 0.0), (temp - 0.75) * 6.67);
      }
      // Very hot areas (orange to red)
      else {
        return mix(vec3(1.0, 0.5, 0.0), vec3(1.0, 0.0, 0.0), (temp - 0.9) * 10.0);
      }
    }
    
    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      
      // Calculate brightness
      float brightness = dot(color.rgb, vec3(0.299, 0.587, 0.114));
      
      // Boost brightness for thermal effect
      brightness = brightness * thermalIntensity + brightness;
      
      // Apply contrast
      brightness = (brightness - 0.5) * contrast + 0.5 + brightness;
      brightness = clamp(brightness, 0.0, 1.0);
      
      // Add subtle noise
      float noise = noise(vUv * 100.0 + time * 0.1) * noiseIntensity;
      brightness += noise;
      
      brightness = clamp(brightness, 0.0, 1.0);
      
      // Get thermal color
      vec3 thermalColor = getThermalColor(brightness);
      
      // Add scan lines for thermal camera effect
      float scanline = sin(vUv.y * 300.0 + time * 2.0) * 0.05;
      thermalColor += scanline;
      
      gl_FragColor = vec4(thermalColor, 1.0);
    }
  `
};

const LiveCameraView = ({ portalRef }) => {
  const canvasRef = useRef();
  const rendererRef = useRef();
  const composerRef = useRef();
  const customSceneRef = useRef(new THREE.Scene());
  const customCameraRef = useRef();
  const animationFrameIdRef = useRef();
  const thermalPassRef = useRef();
  const lastTimeRef = useRef(0);
  const staleDataCountRef = useRef(0); // Track how many frames with stale data
  const previousPositionRef = useRef([0, 50, 0]); // Track previous position

  // Model references
  const modelInstancesRef = useRef({});

  // Load all models
  const { scene: terrainModel } = useGLTF('/models/mountain/terrain.glb');
  const { scene: uavModel } = useGLTF('/models/surveillance-uav/drone.glb');
  const { scene: tankModel } = useGLTF('/models/tank/tank.glb');
  const { scene: jeepModel } = useGLTF('/models/jeep/jeep.glb');
  const { scene: soldierModel } = useGLTF('/models/soldier/soldier.glb');
  const { scene: warehouseModel } = useGLTF('/models/building/warehouse.glb');
  const { scene: armyBaseModel } = useGLTF('/models/army_base/army_base.glb');

  useEffect(() => {
    // --- FIX: Add a guard clause ---
    if (!portalRef.current) {
      console.warn("[LiveCameraView] Portal ref not ready. Skipping setup.");
      return;
    }

    console.log("[LiveCameraView] Initializing with portalRef:", portalRef.current);
    const container = portalRef.current;
    
    // Check if a renderer already exists to prevent duplicates
    if (rendererRef.current) {
      console.warn("[LiveCameraView] Renderer already exists. Cleaning up old renderer first.");
      cancelAnimationFrame(animationFrameIdRef.current);
      rendererRef.current.dispose();
      if (composerRef.current) composerRef.current.dispose();
    }

    // --- Setup Canvas & Renderer ---
    const canvas = document.createElement('canvas');
    Object.assign(canvas.style, { width: '100%', height: '100%', borderRadius: '8px' });
    container.innerHTML = '';
    container.appendChild(canvas);
    canvasRef.current = canvas;

    const renderer = new THREE.WebGLRenderer({ 
      canvas, 
      antialias: true, 
      alpha: true,
      powerPreference: 'high-performance' // FIX: Request high performance mode
    });
    rendererRef.current = renderer;
    const rect = container.getBoundingClientRect();
    renderer.setSize(rect.width, rect.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // FIX: Limit pixel ratio
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // --- Setup Scene, Camera, and Lighting ---
    const scene = customSceneRef.current;
    scene.clear(); // FIX: Clear any previous objects
    
    const camera = new THREE.PerspectiveCamera(75, rect.width / rect.height, 0.1, 10000);
    customCameraRef.current = camera;
    
    // Enhanced lighting for better model visibility
    scene.add(new THREE.AmbientLight(0xffffff, 1.2));
    const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
    dirLight.position.set(10, 20, 5);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // --- Add all models to the scene ---
    const instances = {};
    
    // Add terrain
    if (terrainModel) {
      const terrainClone = terrainModel.clone(true);
      terrainClone.scale.set(100, 100, 100);
      // Keep original materials with textures
      terrainClone.traverse(node => {
        if (node.isMesh) {
          // Don't override materials - keep original textures
          node.receiveShadow = true;
          node.castShadow = true;
        }
      });
      instances.terrain = terrainClone;
      scene.add(terrainClone);
    }

    // Add UAV
    if (uavModel) {
      const uavClone = uavModel.clone(true);
      uavClone.scale.set(3, 3, 3);
      // Store original materials before any modifications
      const originalUavMaterials = new Map();
      uavClone.traverse(node => {
        if (node.isMesh) {
          originalUavMaterials.set(node.uuid, node.material.clone());
          node.castShadow = true;
        }
      });
      instances.uav = uavClone;
      instances.uav.originalMaterials = originalUavMaterials;
      scene.add(uavClone);
    }

    // Add Tank
    if (tankModel) {
      const tankClone = tankModel.clone(true);
      tankClone.position.set(40, 19, 16);
      tankClone.scale.set(0.5, 0.5, 0.5);
      // Store original materials
      const originalTankMaterials = new Map();
      tankClone.traverse(node => {
        if (node.isMesh) {
          originalTankMaterials.set(node.uuid, node.material.clone());
          node.castShadow = true;
        }
      });
      instances.tank = tankClone;
      instances.tank.originalMaterials = originalTankMaterials;
      scene.add(tankClone);
    }

    // Add Jeep
    if (jeepModel) {
      const jeepClone = jeepModel.clone(true);
      jeepClone.position.set(40, 19, 20);
      jeepClone.scale.set(0.03, 0.03, 0.03);
      // Store original materials
      const originalJeepMaterials = new Map();
      jeepClone.traverse(node => {
        if (node.isMesh) {
          originalJeepMaterials.set(node.uuid, node.material.clone());
          node.castShadow = true;
        }
      });
      instances.jeep = jeepClone;
      instances.jeep.originalMaterials = originalJeepMaterials;
      scene.add(jeepClone);
    }

    // Add Soldier
    if (soldierModel) {
      const soldierClone = soldierModel.clone(true);
      soldierClone.position.set(40, 21, 32);
      soldierClone.scale.set(0.2, 0.2, 0.2);
      // Store original materials
      const originalSoldierMaterials = new Map();
      soldierClone.traverse(node => {
        if (node.isMesh) {
          originalSoldierMaterials.set(node.uuid, node.material.clone());
          node.castShadow = true;
        }
      });
      instances.soldier = soldierClone;
      instances.soldier.originalMaterials = originalSoldierMaterials;
      scene.add(soldierClone);
    }

    // Add Warehouse
    if (warehouseModel) {
      const warehouseClone = warehouseModel.clone(true);
      warehouseClone.position.set(40, 21, 32);
      warehouseClone.scale.set(0.7, 0.7, 0.7);
      // Store original materials
      const originalWarehouseMaterials = new Map();
      warehouseClone.traverse(node => {
        if (node.isMesh) {
          originalWarehouseMaterials.set(node.uuid, node.material.clone());
          node.castShadow = true;
          node.receiveShadow = true;
        }
      });
      instances.warehouse = warehouseClone;
      instances.warehouse.originalMaterials = originalWarehouseMaterials;
      scene.add(warehouseClone);
    }

    // Add Army Base
    if (armyBaseModel) {
      const armyBaseClone = armyBaseModel.clone(true);
      armyBaseClone.position.set(-45, 25, -40);
      armyBaseClone.scale.set(0.5, 0.5, 0.5);
      // Store original materials
      const originalArmyBaseMaterials = new Map();
      armyBaseClone.traverse(node => {
        if (node.isMesh) {
          originalArmyBaseMaterials.set(node.uuid, node.material.clone());
          node.castShadow = true;
          node.receiveShadow = true;
        }
      });
      instances.armyBase = armyBaseClone;
      instances.armyBase.originalMaterials = originalArmyBaseMaterials;
      scene.add(armyBaseClone);
    }

    modelInstancesRef.current = instances;

    // --- Setup Post-Processing Effects ---
    const composer = new EffectComposer(renderer);
    composerRef.current = composer;
    
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);
    
    // Add thermal vision shader pass
    const thermalPass = new ShaderPass(ThermalShader);
    thermalPass.enabled = false; // Start disabled
    thermalPassRef.current = thermalPass;
    composer.addPass(thermalPass);

    // FIX: Add a resize handler
    const handleResize = () => {
      const newRect = container.getBoundingClientRect();
      renderer.setSize(newRect.width, newRect.height);
      camera.aspect = newRect.width / newRect.height;
      camera.updateProjectionMatrix();
      composer.setSize(newRect.width, newRect.height);
      console.log("[LiveCameraView] Resized to", newRect.width, "x", newRect.height);
    };
    
    window.addEventListener('resize', handleResize);
    
    // FIX: Add direct subscriptions to store updates to force camera refreshes
    const unsubscribePosition = useUAVStore.subscribe(
      (state) => state.position,
      (position) => {
        if (!camera || !position) return;
        
        // When position changes, force an immediate camera update
        const { rotation } = useUAVStore.getState();
        const { getCurrentSettings } = useCameraStore.getState();
        const settings = getCurrentSettings();
        
        const rotationMatrix = new THREE.Matrix4().makeRotationFromEuler(
          new THREE.Euler(...rotation)
        );
        const offsetVector = new THREE.Vector3(...settings.offset).applyMatrix4(rotationMatrix);
        const lookAtOffset = new THREE.Vector3(...settings.lookAtOffset).applyMatrix4(rotationMatrix);
        
        const newCameraPosition = new THREE.Vector3().fromArray(position).add(offsetVector);
        const newLookAtTarget = new THREE.Vector3().fromArray(position).add(lookAtOffset);
        
        camera.position.copy(newCameraPosition);
        camera.lookAt(newLookAtTarget);
        camera.updateProjectionMatrix();
        
        // Force a render
        if (composerRef.current) {
          composerRef.current.render();
        }
        
        console.log("[LiveCameraView] Force updated camera to position:", position);
      }
    );

    // --- Animation Loop ---
    const animate = (time) => {
      animationFrameIdRef.current = requestAnimationFrame(animate);
      
      // FIXED: Get the CURRENT state every frame
      const { position, rotation, isThermalVision, isCrashed, droneType } = useUAVStore.getState();
      const { destroyedTargets } = useAttackDroneStore.getState();
      const { environmentMode } = useEnvironmentStore.getState();
      const { getCurrentSettings } = useCameraStore.getState();
      const settings = getCurrentSettings();

      // Reset animation on position changes to prevent stale closures
      if (!position || !Array.isArray(position) || position.length !== 3) {
        console.warn("[LiveCameraView] Invalid position data:", position);
        return;
      }
      
      // FIX: Detect stale data by comparing with previous position
      const isSamePosition = position.every(
        (val, idx) => Math.abs(val - previousPositionRef.current[idx]) < 0.0001
      );
      
      if (isSamePosition) {
        staleDataCountRef.current++;
        if (staleDataCountRef.current > 120) { // After 2 seconds (60fps * 2)
          console.warn("[LiveCameraView] Stale position data detected for 2 seconds:", position);
          staleDataCountRef.current = 0; // Reset counter
        }
      } else {
        staleDataCountRef.current = 0;
        previousPositionRef.current = [...position];
      }

      // DEBUG: Log UAV position every 2 seconds to track updates
      if (Math.floor(time / 1000) % 2 === 0 && time % 100 < 16) {
        console.log('[LiveCameraView] UAV Position:', position, 'DroneType:', droneType, 'Settings:', settings);
      }

      const deltaTime = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      // Update camera - FIX: More explicit about vector creation and methods
      try {
        const rotationMatrix = new THREE.Matrix4().makeRotationFromEuler(
          new THREE.Euler(rotation[0], rotation[1], rotation[2])
        );
        
        const offsetVector = new THREE.Vector3(settings.offset[0], settings.offset[1], settings.offset[2]);
        offsetVector.applyMatrix4(rotationMatrix);
        
        const lookAtOffset = new THREE.Vector3(settings.lookAtOffset[0], settings.lookAtOffset[1], settings.lookAtOffset[2]);
        lookAtOffset.applyMatrix4(rotationMatrix);
        
        // CRITICAL FIX: Force camera position update every frame for proper tracking
        const newCameraPosition = new THREE.Vector3(position[0], position[1], position[2]).add(offsetVector);
        const newLookAtTarget = new THREE.Vector3(position[0], position[1], position[2]).add(lookAtOffset);

        camera.position.copy(newCameraPosition);
        camera.lookAt(newLookAtTarget);
        camera.fov = settings.fov;
        camera.updateProjectionMatrix();
        
        // FIX: Debug sphere to visualize camera target
        const debugTarget = scene.getObjectByName('debugTarget');
        if (debugTarget) {
          debugTarget.position.copy(newLookAtTarget);
        } else if (isCrashed) { // Only add in crash scenarios for debugging
          const debugSphere = new THREE.Mesh(
            new THREE.SphereGeometry(0.5, 16, 16),
            new THREE.MeshBasicMaterial({ color: 0xff0000 })
          );
          debugSphere.name = 'debugTarget';
          debugSphere.position.copy(newLookAtTarget);
          scene.add(debugSphere);
        }
      } catch (error) {
        console.error("[LiveCameraView] Error updating camera:", error);
      }

      // Update UAV position and visibility
      if (instances.uav) {
        instances.uav.position.fromArray(position);
        instances.uav.rotation.fromArray(rotation);
        
        // Show UAV only if spawned (not at default position)
        const isSpawned = position[0] !== 0 || position[1] !== 50 || position[2] !== 0;
        instances.uav.visible = isSpawned && (droneType === 'surveillance' || droneType === 'attack');
      }

      // Hide destroyed targets
      destroyedTargets.forEach(targetId => {
        if (targetId.includes('tank') && instances.tank) instances.tank.visible = false;
        if (targetId.includes('jeep') && instances.jeep) instances.jeep.visible = false;
        if (targetId.includes('warehouse') && instances.warehouse) instances.warehouse.visible = false;
        if (targetId.includes('soldier') && instances.soldier) instances.soldier.visible = false;
      });

      // Update thermal vision
      if (isThermalVision) {
        // FIXED: Enhanced validation to prevent Three.js uniform error
        if (thermalPassRef.current && 
            thermalPassRef.current.uniforms && 
            thermalPassRef.current.material && 
            thermalPassRef.current.material.uniforms) {
          
          thermalPassRef.current.enabled = true;
          
          // Safely access uniforms with existence checks
          const uniforms = thermalPassRef.current.uniforms;
          
          if (uniforms.time && uniforms.time.value !== undefined) {
            uniforms.time.value += deltaTime;
          }
          
          // Enhanced thermal parameters for better terrain variation
          if (uniforms.noiseIntensity && uniforms.noiseIntensity.value !== undefined) {
            uniforms.noiseIntensity.value = 0.15;
          }
          if (uniforms.contrast && uniforms.contrast.value !== undefined) {
            uniforms.contrast.value = 3.0;
          }
          if (uniforms.thermalIntensity && uniforms.thermalIntensity.value !== undefined) {
            uniforms.thermalIntensity.value = 2.5;
          }
        }
        
        // Apply thermal materials to all objects
        Object.entries(instances).forEach(([key, instance]) => {
          if (instance && THERMAL_MATERIALS[key]) {
            instance.traverse(node => {
              if (node.isMesh) {
                // Use bright thermal materials for models only
                // Terrain thermal effect will be handled by the shader
                if (key !== 'terrain') {
                  node.material = THERMAL_MATERIALS[key];
                }
              }
            });
          }
        });
      } else {
        thermalPassRef.current.enabled = false;
        
        // Restore original materials for all objects
        Object.entries(instances).forEach(([key, instance]) => {
          if (instance && instance.originalMaterials) {
            instance.traverse(node => {
              if (node.isMesh && instance.originalMaterials.has(node.uuid)) {
                node.material = instance.originalMaterials.get(node.uuid);
              }
            });
          }
        });
      }

      // Set background color
      let skyColor = isThermalVision ? THERMAL_SKY_COLOR : 
                     (environmentMode === 'night' ? NIGHT_SKY_COLOR : 
                     (environmentMode === 'rain' ? RAIN_SKY_COLOR : DAY_SKY_COLOR));
      renderer.setClearColor(skyColor);

      // Handle crash overlay
      const overlay = portalRef.current.querySelector('.crash-overlay');
      if (isCrashed && !overlay) {
        const crashOverlay = document.createElement('div');
        Object.assign(crashOverlay.style, { 
          position: 'absolute', 
          top: '0', 
          left: '0', 
          width: '100%', 
          height: '100%', 
          background: 'rgba(255,0,0,0.3)', 
          zIndex: '10', 
          pointerEvents: 'none' 
        });
        crashOverlay.className = 'crash-overlay';
        portalRef.current.appendChild(crashOverlay);
      } else if (!isCrashed && overlay) {
        overlay.remove();
      }

      try {
        composerRef.current.render();
      } catch (error) {
        console.error("[LiveCameraView] Error in render:", error);
      }
    };
    
    // Start the animation loop
    animate(0);

    // --- Cleanup ---
    return () => {
      console.log("[LiveCameraView] Cleaning up resources");
      cancelAnimationFrame(animationFrameIdRef.current);
      window.removeEventListener('resize', handleResize);
      unsubscribePosition();
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      
      if (composerRef.current) {
        composerRef.current.dispose();
      }
      
      if (customSceneRef.current) {
        customSceneRef.current.clear();
      }
      
      // Remove the canvas from DOM
      if (canvasRef.current && canvasRef.current.parentNode) {
        canvasRef.current.parentNode.removeChild(canvasRef.current);
      }
    };
  }, [terrainModel, uavModel, tankModel, jeepModel, soldierModel, warehouseModel, armyBaseModel]);

  return null;
};

export default LiveCameraView;