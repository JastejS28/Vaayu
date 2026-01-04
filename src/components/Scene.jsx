import React, { useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import DayEnvironment from './DayEnvironment';
import NightEnvironment from './NightEnvironment';
import RainEnvironment from './RainEnvironment';
import Terrain from './Terrain';
import UAV from './UAV';
import AttackUAV  from './attack-drone/AttackUAV';
import Tank from './Tank';
import Jeep from './Jeep';
import Warehouse from './Warehouse';
import { useUAVStore } from '../store/uavStore';
import { useEnvironmentStore } from '../store/environmentStore';
import AntiDroneSystem from './anti-drone/AntiDroneSystem';
import ArmyBase from './ArmyBase';
import { useAttackDroneStore } from '../store/attackDroneStore';
import CameraController from './CameraController';
import { useCameraStore } from '../store/cameraStore';
import Soldier from './Soldier';
import TerrainCollisionDetector from './TerrainCollisionDetector';
import TerrainClickHandler from './TerrainClickHandler'; // Add click handler
import ClickIndicators from './ClickIndicators'; // Add visual indicators
import LiveCameraView from './LiveCameraView'; // Import the new LiveCameraView
import UAVController from './UAVController'; // Import the UAV controller
import FlightPathVisualizer from './FlightPathVisualizer'; // Import flight path visualizer
import TargetDirectionIndicators from './tutorial/TargetDirectionIndicators';
import HoverZoneIndicator from './tutorial/HoverZoneIndicator';

// Create a component to handle the scene content inside Canvas
const SceneContent = ({ droneType: propDroneType }) => {
  const { environmentMode } = useEnvironmentStore();
  const { cameraMode } = useCameraStore();
  const { position, setDroneType } = useUAVStore(); // Get position from store
  
  // Update drone type in UAV store when prop changes
  React.useEffect(() => {
    setDroneType(propDroneType);
  }, [propDroneType, setDroneType]);
  
  // Check if UAV has been spawned yet (not at default position)
  const hasSpawned = position[0] !== 0 || position[1] !== 50 || position[2] !== 0;

  return (
    <>
      {/* Add Terrain Click Handler for interactive controls */}
      <TerrainClickHandler />
      
      {/* Add Visual Click Indicators */}
      <ClickIndicators />
      
      {/* Add Terrain Collision Detector */}
      <TerrainCollisionDetector />
      
      <PerspectiveCamera 
        makeDefault 
        position={[0, 100, 80]} 
        fov={60} 
        near={0.1} 
        far={10000} 
      />
      
      {/* Reverted back to OrbitControls */}
      <OrbitControls 
      target={[0, 25, 0]} 
      maxPolarAngle={Math.PI / 2}
      minDistance={5} 
      maxDistance={500}
      enableZoom={true}
      enablePan={true}
      screenSpacePanning={false}
      minPolarAngle={0}
      />
      
      {/* Environment specific lighting and sky */}
      {environmentMode === 'day' && <DayEnvironment />}
      {environmentMode === 'night' && <NightEnvironment />}
      {environmentMode === 'rain' && <RainEnvironment />}
      
      <Terrain />
      
      <Tank position={[40, 19, 16]} id="tank-40-19-16" />
      <Jeep position={[40, 19, 20]} id="jeep-40-19-20" />
      {/* The warehouse ID in your Scene.jsx was slightly different, ensure it matches */}
      <Warehouse position={[40, 21, 32]} id="warehouse-40-20-35" /> 
      <Soldier position={[40, 21, 32]} id="soldier-40-20-34" />
      
      {/* Anti-drone defense systems at key locations */}
      <AntiDroneSystem 
        position={[40, 20, 35]} 
        baseId="warehouse-defense"
      />
      
      {/* New ArmyBase component addition */}
      <ArmyBase position={[-45, 25, -40]} id="army-base-1" />
      
      {/* Only render the UAV if it has been spawned */}
      {hasSpawned && (
        <>
          {propDroneType === 'surveillance' && <UAV />}
          {propDroneType === 'attack' && <AttackUAV />}
        </>
      )}
  
      {/* Add UAV Controller for advanced UAV management */}
      <UAVController />
      
      {/* Add Flight Path Visualizer */}
      <FlightPathVisualizer />
      
      {/* Tutorial helpers */}
      <TargetDirectionIndicators />
      <HoverZoneIndicator />
    </>
  );
};

// Update the Scene component to accept the ref
const Scene = ({ droneType, liveViewPortalRef }) => {
  const { environmentMode } = useEnvironmentStore();
  
  // Remove this effect that sets hardcoded position:
  // useEffect(() => {
  //   if (droneType === 'attack') {
  //     const homeBase = [-50, 30, -40];
  //     useUAVStore.setState({ position: [...homeBase] }); 
  //   }
  // }, [droneType]);
  
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* 3D Canvas */}
      <Canvas 
        shadows 
        gl={{ antialias: true }}
        style={{
          background: environmentMode === 'night' ? '#000000' : (environmentMode === 'rain' ? '#33333D' : '#87CEEB'),
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%'
        }}
      >
        <SceneContent droneType={droneType} />
        {/* The LiveCameraView component is now correctly placed inside the Canvas,
            and since it returns null, it won't cause rendering errors. */}
        {liveViewPortalRef && <LiveCameraView portalRef={liveViewPortalRef} />}
      </Canvas>
      
      {/* HTML Overlay elements can be placed here, outside the Canvas */}
      <div style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', width: '100%', height: '100%' }}>
        {/* Your HTML HUD elements here */}
      </div>
    </div>
  );
};

export default Scene;

// For any component used inside Canvas/R3F:
// Make sure they return proper Three.js elements

// Wrong:
// const MyComponent = () => <div>Something</div>;

// Right:
const MyComponent = () => <group>
  <mesh>
    <boxGeometry />
    <meshStandardMaterial />
  </mesh>
</group>;