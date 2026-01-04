import React, { useEffect, useCallback, useState, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { useUAVStore } from '../store/uavStore';
import { useClickControlStore } from '../store/clickControlStore';
import { useAttackDroneStore } from '../store/attackDroneStore';
import * as THREE from 'three';

const TerrainClickHandler = () => {
  const { scene, camera, raycaster, gl } = useThree();
  const clickProcessed = useRef(false);
  
  // Get state and actions from stores
  const { position, droneType } = useUAVStore();
  const setPosition = useUAVStore(state => state.setPosition);
  const setTargetPosition = useUAVStore(state => state.setTargetPosition);
  const setRotation = useUAVStore(state => state.setRotation);
  const setCrashed = useUAVStore(state => state.setCrashed);
  
  const { clickMode, setSpawnMode, setSpawnIndicator, setClickIndicator } = useClickControlStore();
  const { moveToPosition } = useAttackDroneStore();

  // Main click handler
  const handleClick = useCallback((event) => {
    // Normal debounce logic
    if (clickProcessed.current) return;
    clickProcessed.current = true;
    setTimeout(() => {
      clickProcessed.current = false;
    }, 300);
    
    const storeState = useUAVStore.getState();
    
    // Check if this is the first spawn (UAV at default position)
    const isAtDefaultPosition = 
      Math.abs(storeState.position[0]) < 0.1 && 
      Math.abs(storeState.position[1] - 50) < 0.1 && 
      Math.abs(storeState.position[2]) < 0.1;
    
    // Debug info
    console.log('🔍 [ClickHandler] Debug Info:', {
      clickMode,
      currentUAVPosition: storeState.position,
      isAtDefaultPosition,
      isCrashed: storeState.isCrashed,
      targetPosition: storeState.targetPosition,
    });

    // Create normalized mouse coordinates
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / gl.domElement.clientWidth) * 2 - 1;
    mouse.y = -(event.clientY / gl.domElement.clientHeight) * 2 + 1;

    // Update the raycaster
    raycaster.setFromCamera(mouse, camera);
    
    // Force clickMode to 'spawn' on first click when at default position
    const forceSpawnMode = isAtDefaultPosition;
    const effectiveClickMode = forceSpawnMode ? 'spawn' : clickMode;
    
    // Perform the raycast
    const intersects = raycaster.intersectObjects(scene.children, true);
    console.log(`🎯 [TerrainClickHandler] Found ${intersects.length} intersections`);

    // Find terrain intersection
    const terrainIntersect = intersects.find(i =>
      i.object.userData.isClickableTerrain === true ||
      i.object.name?.toLowerCase().includes('terrain') ||
      i.object.parent?.name?.toLowerCase().includes('terrain')
    );

    if (!terrainIntersect) {
      console.warn('⚠️ [TerrainClickHandler] No terrain found in intersections');
      return;
    }

    const point = terrainIntersect.point;
    console.log('📍 [TerrainClickHandler] Terrain intersection point:', point);

    // When a click happens, update clickIndicator which UAVController will use
    // to determine if the click was on a target
    setClickIndicator({
      position: [point.x, point.y, point.z],
      type: 'click'
    });
    
    // === SPAWN MODE LOGIC ===
    if (effectiveClickMode === 'spawn') {
      // Safe altitude to 25 units above terrain
      const spawnPos = [point.x, point.y + 25, point.z];
      console.log('🚁 [SPAWN MODE] Spawning UAV at:', spawnPos);

      console.log('🔄 Resetting crash state...');
      setCrashed(false, '');

      console.log('📦 Setting UAV position...');
      setPosition(spawnPos);

      console.log('🧭 Setting default rotation...');
      setRotation([0, 0, 0]);

      console.log('🎯 Setting spawn indicator...');
      setSpawnIndicator(spawnPos);

      console.log('🔁 Switching to move mode...');
      setSpawnMode(false);

      console.log('✅ UAV spawned successfully!');
      return;
    }

    // === MOVE MODE LOGIC ===
    if (effectiveClickMode === 'move') {
      const targetPos = [point.x, point.y + 30, point.z];
      console.log('🚩 [MOVE MODE] Move target set:', targetPos);

      // FIXED: Check if this is an attack drone and use proper workflow
      if (droneType === 'attack') {
        // Use attack drone store's moveToPosition for proper workflow
        console.log('🎯 [ATTACK DRONE] Using attack drone workflow for terrain click');
        moveToPosition(targetPos);
      } else {
        // Use regular UAV store for surveillance drones
        console.log('📡 Updating target position...');
        setTargetPosition(targetPos);
      }

      console.log('📍 Setting click indicator...');
      setClickIndicator(targetPos);
    }
  }, [
    scene, camera, raycaster, gl, clickMode,
    setPosition, setTargetPosition, setRotation,
    setCrashed, setSpawnMode, setSpawnIndicator, setClickIndicator,
    droneType, moveToPosition
  ]);

  // Event binding for click handling
  useEffect(() => {
    const domElement = gl.domElement;
    console.log('🧲 [TerrainClickHandler] Adding click listener');
    domElement.addEventListener('click', handleClick);

    return () => {
      console.log('❌ [TerrainClickHandler] Removing click listener');
      domElement.removeEventListener('click', handleClick);
    };
  }, [gl, handleClick]);

  return null;
};

export default TerrainClickHandler;