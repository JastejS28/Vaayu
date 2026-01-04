import React, { useRef, useEffect, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useUAVStore } from '../store/uavStore';
import { useMissionStore } from '../store/missionStore';
import { useClickControlStore } from '../store/clickControlStore';
import { useAttackDroneStore } from '../store/attackDroneStore';
import { useHoverState } from '../hooks/useHoverState';
import { useTargetStore } from '../store/targetStore';
import { useEnvironmentStore } from '../store/environmentStore';
import { useTutorialStore } from '../store/tutorialStore';

const UAVController = () => {
  const hoverState = useRef({
    isHovering: false,
    targetPosition: null,
    hoverStartTime: null,
    hoverRadius: 8,
    hoverHeight: 15,
    currentAngle: 0,
    hoverSpeed: 0.5,
    hoverTimeAccumulated: 0,
    requiredHoverTime: 10,
    returningToBase: false,
    baseReached: false
  });
  
  const completedTargets = useRef(new Set());
  const cooldownTimer = useRef(null);
  const isInCooldown = useRef(false);
  const lastUpdateTime = useRef(0);
  const UPDATE_INTERVAL = 16;
  
  // ✅ NEW: Track crash state and delay mission failed
  const crashTimer = useRef(null);

  const windGustTimer = useRef(0);
  const WIND_GUST_MIN_INTERVAL = 10;
  const WIND_GUST_MAX_INTERVAL = 30;
  const nextWindGustTime = useRef(Math.random() * (WIND_GUST_MAX_INTERVAL - WIND_GUST_MIN_INTERVAL) + WIND_GUST_MIN_INTERVAL);

  const checkStepCompletion = useTutorialStore((state) => state.checkStepCompletion);

  // ✅ TERRAIN COLLISION DETECTION - Enhanced version
  const checkTerrainCollision = useCallback((position, terrainHeightMap) => {
    if (!position || !Array.isArray(position) || position.length < 3) return false;
    
    const [x, y, z] = position;
    
    // Method 1: Use terrainHeightMap if available
    if (terrainHeightMap && typeof terrainHeightMap === 'function') {
      const terrainHeight = terrainHeightMap(x, z);
      const SAFETY_MARGIN = 3;
      const MIN_SAFE_HEIGHT = terrainHeight + SAFETY_MARGIN;
      
      if (y < MIN_SAFE_HEIGHT) {
        console.warn(`⚠️ TERRAIN COLLISION! UAV Height: ${y.toFixed(2)}, Terrain: ${terrainHeight.toFixed(2)}, Required: ${MIN_SAFE_HEIGHT.toFixed(2)}`);
        return true;
      }
    }
    
    // Method 2: Simple altitude check as fallback
    const MIN_ALTITUDE = 12; // Absolute minimum altitude
    if (y < MIN_ALTITUDE) {
      console.warn(`⚠️ ALTITUDE COLLISION! UAV too low: ${y.toFixed(2)}, Minimum: ${MIN_ALTITUDE}`);
      return true;
    }
    
    return false;
  }, []);

  // ✅ ANTI-DRONE SYSTEM COLLISION DETECTION  
  const checkAntiDroneHit = useCallback((position, antiDroneSystems) => {
    if (!position || !Array.isArray(antiDroneSystems) || antiDroneSystems.length === 0) {
      return false;
    }

    const uavPos = new THREE.Vector3(...position);
    
    for (const system of antiDroneSystems) {
      if (!system || !system.isActive) continue;
      
      if (system.projectiles && Array.isArray(system.projectiles)) {
        for (const projectile of system.projectiles) {
          if (!projectile || !projectile.position) continue;
          
          const projPos = new THREE.Vector3(...projectile.position);
          const distance = uavPos.distanceTo(projPos);
          
          const HIT_RADIUS = 2;
          if (distance < HIT_RADIUS) {
            console.warn(`💥 ANTI-DRONE HIT! Distance: ${distance.toFixed(2)}m`);
            return true;
          }
        }
      }
    }
    
    return false;
  }, []);

  const updateHoverParameters = (target) => {
    if (!target) return;
    
    let height = 15;
    let radius = 8;
    let speed = 0.5;
    let requiredTime = 5;
    
    switch(target.type) {
      case 'tank':
        radius = 10;
        speed = 0.5;
        requiredTime = 5;
        break;
      case 'jeep':
        radius = 8;
        speed = 0.6;
        requiredTime = 4;
        break;
      case 'warehouse':
        radius = 12;
        speed = 0.4;
        requiredTime = 6;
        break;
      case 'soldier':
        height = 10;
        radius = 6;
        speed = 0.7;
        requiredTime = 3;
        break;
      default:
        radius = 8;
        speed = 0.5;
        requiredTime = 5;
    }
    
    hoverState.current.hoverHeight = target.type === 'soldier' ? 10 : 15;
    hoverState.current.hoverRadius = isFinite(radius) ? radius : 8;
    hoverState.current.hoverSpeed = isFinite(speed) ? speed : 0.5;
    hoverState.current.requiredHoverTime = isFinite(requiredTime) ? requiredTime : 5;
    hoverState.current.hoverTimeAccumulated = 0;
  };
  
  const handleMovementToTarget = useCallback((posOrDelta, targetPos, setPosFunc, deltaValue) => {
    try {
      const now = Date.now();
      if (now - lastUpdateTime.current < UPDATE_INTERVAL) {
        return;
      }
      lastUpdateTime.current = now;
      
      let position, targetPosition, setPosition, setTargetPosition, delta;
      
      if (Array.isArray(posOrDelta) && Array.isArray(targetPos) && typeof setPosFunc === 'function') {
        position = posOrDelta;
        targetPosition = targetPos;
        setPosition = setPosFunc;
        setTargetPosition = useUAVStore.getState().setTargetPosition;
        delta = deltaValue;
      } else {
        delta = posOrDelta;
        const store = useUAVStore.getState();
        position = store.position;
        targetPosition = store.targetPosition;
        setPosition = store.setPosition;
        setTargetPosition = store.setTargetPosition;
      }
      
      if (!delta || !isFinite(delta)) delta = 1/60;
      if (!position || !targetPosition || !Array.isArray(position) || !Array.isArray(targetPosition)) {
        return;
      }
      
      if (Math.abs(position[0] - targetPosition[0]) < 2.0 && 
          Math.abs(position[1] - targetPosition[1]) < 2.0 && 
          Math.abs(position[2] - targetPosition[2]) < 2.0) {
        setPosition(targetPosition);
        setTargetPosition(null);
        return;
      }

      const direction = [
        targetPosition[0] - position[0],
        targetPosition[1] - position[1],
        targetPosition[2] - position[2]
      ];
      
      const distance = Math.sqrt(
        direction[0] * direction[0] + 
        direction[1] * direction[1] + 
        direction[2] * direction[2]
      );
      
      if (distance < 3.0) {
        setPosition(targetPosition);
        setTargetPosition(null);
        return;
      }
      
      const normalizedDir = [
        distance > 0 ? direction[0] / distance : 0,
        distance > 0 ? direction[1] / distance : 0,
        distance > 0 ? direction[2] / distance : 0
      ];
      
      const speed = 80.0;
      const moveDistance = speed * delta;
      
      const newPosition = [
        position[0] + normalizedDir[0] * moveDistance,
        position[1] + normalizedDir[1] * moveDistance,
        position[2] + normalizedDir[2] * moveDistance
      ];
      
      if (newPosition.some(val => !isFinite(val))) {
        console.error("Invalid position calculated:", newPosition);
        return;
      }
      
      const newDirection = [
        targetPosition[0] - newPosition[0],
        targetPosition[1] - newPosition[1],
        targetPosition[2] - newPosition[2]
      ];
      
      const dotProduct = 
        direction[0] * newDirection[0] + 
        direction[1] * newDirection[1] + 
        direction[2] * newDirection[2];
      
      if (dotProduct < 0) {
        setPosition(targetPosition);
        setTargetPosition(null);
      } else {
        setPosition(newPosition);
      }
    } catch (error) {
      console.error("Error in movement calculations:", error);
    }
  }, []);
  
  useFrame((state, delta) => {
    if (!isFinite(delta) || delta <= 0) delta = 0.016;
    
    const { 
      position, targetPosition, setPosition, setTargetPosition, targets, isCrashed, droneType,
      battery, drainBattery, setUAVStatus, isThermalVision, setCrashed, terrainHeightMap
    } = useUAVStore.getState();
    
    const { 
      isHovering, setIsHovering, currentTarget, setCurrentTarget, 
      objectives, updateHoverTime, missionTimeRemaining,
      missionStatus, updateMissionTime, completeMission 
    } = useMissionStore.getState();
    
    const { 
      missionState: attackMissionState, 
      attackPosition, 
      homeBase, 
      setManualTargetPosition,
      updateTargetLock,
      updateMissiles,
      positionReached
    } = useAttackDroneStore.getState();
    
    const { clickIndicator } = useClickControlStore.getState();
    const { antiDroneSystems } = useEnvironmentStore.getState();
    
    // ✅ CRASH CHECK #1: Already crashed - ALLOW crash physics but stop movement
    if (isCrashed || attackMissionState === 'crashed') {
      // Clear any target position to stop movement
      if (targetPosition) {
        setTargetPosition(null);
      }
      
      // Don't process any movement or mission logic for crashed UAV
      // The crash physics are handled in AttackUAV.jsx and UAV.jsx components
      return;
    }

    // ✅ CRASH CHECK #2: Terrain collision detection - ENHANCED with delayed mission failed
    if (position) {
      const terrainCollision = checkTerrainCollision(position, terrainHeightMap);
      if (terrainCollision) {
        console.error('🔥 UAV CRASHED INTO TERRAIN!');
        setCrashed(true, 'Terrain Collision');
        
        if (droneType === 'attack') {
          useAttackDroneStore.setState({ missionState: 'crashed' });
        }
        
        // ✅ NEW: Delay mission failed screen by 5 seconds to show crash
        if (!crashTimer.current) {
          crashTimer.current = setTimeout(() => {
            useMissionStore.getState().completeMission('failed');
          }, 5000); // 5 second delay
        }
        
        return;
      }
    }

    // ✅ CRASH CHECK #3: Anti-drone system hit detection - with delayed mission failed
    if (position && antiDroneSystems && Array.isArray(antiDroneSystems)) {
      const antiDroneHit = checkAntiDroneHit(position, antiDroneSystems);
      if (antiDroneHit) {
        console.error('💥 UAV HIT BY ANTI-DRONE SYSTEM!');
        setCrashed(true, 'Shot down by anti-drone system');
        
        if (droneType === 'attack') {
          useAttackDroneStore.setState({ missionState: 'crashed' });
        }
        
        // ✅ NEW: Delay mission failed screen by 5 seconds
        if (!crashTimer.current) {
          crashTimer.current = setTimeout(() => {
            useMissionStore.getState().completeMission('failed');
          }, 5000);
        }
        
        return;
      }
    }

    // ✅ CRASH CHECK #4: Battery depletion - with delayed mission failed
    if (battery <= 0 && !isCrashed) {
      console.error('🔋 UAV BATTERY DEPLETED!');
      setCrashed(true, 'Battery Depleted');
      
      if (droneType === 'attack') {
        useAttackDroneStore.setState({ missionState: 'crashed' });
      }
      
      // ✅ NEW: Delay mission failed screen by 5 seconds
      if (!crashTimer.current) {
        crashTimer.current = setTimeout(() => {
          useMissionStore.getState().completeMission('failed');
        }, 5000);
      }
      
      return;
    }

    // Battery depletion
    if (missionStatus === 'active' && !isCrashed && battery > 0) {
      const DRAIN_RATES = {
        idle: 0.5,
        transit: 1.0,
        hovering: 2.0,
        attack: 3.5,
        thermalExtra: 1.5
      };

      let drainRate = DRAIN_RATES.idle;

      if (droneType === 'attack') {
        if (attackMissionState === 'engaging' || attackMissionState === 'firing') {
          drainRate = DRAIN_RATES.attack;
          setUAVStatus('attack');
        } else if (attackMissionState === 'moving' || attackMissionState === 'returning') {
          drainRate = DRAIN_RATES.transit;
          setUAVStatus('transit');
        } else {
          drainRate = DRAIN_RATES.idle;
          setUAVStatus('idle');
        }
      } else {
        if (isHovering) {
          drainRate = DRAIN_RATES.hovering;
          setUAVStatus('hovering');
        } else if (targetPosition) {
          drainRate = DRAIN_RATES.transit;
          setUAVStatus('transit');
        } else {
          drainRate = DRAIN_RATES.idle;
          setUAVStatus('idle');
        }
      }

      if (isThermalVision) {
        drainRate += DRAIN_RATES.thermalExtra;
      }

      const drainAmount = drainRate * delta;
      drainBattery(drainAmount);
    }

    // Wind gust trigger
    if (missionStatus === 'active' && !isCrashed) {
      windGustTimer.current += delta;

      if (windGustTimer.current >= nextWindGustTime.current) {
        const { triggerWindGust } = useEnvironmentStore.getState();
        const triggered = triggerWindGust();
        
        if (triggered) {
          windGustTimer.current = 0;
          nextWindGustTime.current = Math.random() * (WIND_GUST_MAX_INTERVAL - WIND_GUST_MIN_INTERVAL) + WIND_GUST_MIN_INTERVAL;
        }
      }
    }

    // Attack drone updates
    if (droneType === 'attack') {
      updateTargetLock(delta);
      updateMissiles(delta);
    }

    // Attack mode movement - ONLY if not crashed
    if (droneType === 'attack' && (attackMissionState === 'moving' || attackMissionState === 'returning')) {
      const missionTarget = attackMissionState === 'moving' ? attackPosition : homeBase;
      if (missionTarget) {
        handleMovementToTarget(position, missionTarget, setPosition, delta);

        const uavPos = new THREE.Vector3(...position);
        const targetPos = new THREE.Vector3(...missionTarget);
        if (uavPos.distanceTo(targetPos) < 2) {
          if (attackMissionState === 'moving') {
            positionReached();
          } else if (attackMissionState === 'returning') {
            useAttackDroneStore.setState({ missionState: 'idle' });
          }
        }
      }
      return;
    }
    
    // Mission timer
    if (missionStatus === 'active') {
      updateMissionTime(delta);
      
      if (missionTimeRemaining <= 5 && !hoverState.current.returningToBase) {
        console.log("Returning to base...");
        hoverState.current.returningToBase = true;
        
        if (isHovering) {
          if (typeof setIsHovering === 'function') {
            setIsHovering(false);
          }
          setCurrentTarget(null);
          hoverState.current.isHovering = false;
          hoverState.current.targetPosition = null;
        }
        
        const baseLocation = [-45, 30, -45];
        setTargetPosition(baseLocation);
        return;
      }
      
      if (hoverState.current.returningToBase && position) {
        const uavPos = new THREE.Vector3(...position);
        const basePos = new THREE.Vector3(-45, 30, -45);
        const distanceToBase = uavPos.distanceTo(basePos);
        
        if (distanceToBase < 5 && !hoverState.current.baseReached) {
          hoverState.current.baseReached = true;
          
          const { completedTargets } = useTargetStore.getState();
          const requiredTargets = ['tank', 'jeep', 'warehouse', 'soldier'];
          const allTargetsDetected = requiredTargets.every(target => 
            completedTargets[target] && completedTargets[target] > 0
          );
          
          setTimeout(() => {
            completeMission(allTargetsDetected ? 'completed' : 'failed');
          }, 1000);
        }
      }
    }
    
    if (!position || position.some(val => !isFinite(val))) {
      return;
    }
    
    if (hoverState.current.returningToBase) {
      handleMovementToTarget(position, targetPosition, setPosition, delta);
      return;
    }
    
    // Tutorial tracking: Detect targets
    if (droneType === 'surveillance' && targets && Array.isArray(targets)) {
      const uavPos = new THREE.Vector3(...position);
      let detectedAny = false;
      
      targets.forEach(target => {
        if (!target || !Array.isArray(target.position)) return;
        const targetPos = new THREE.Vector3(...target.position);
        const distance = uavPos.distanceTo(targetPos);
        
        if (distance < 20) {
          detectedAny = true;
        }
      });
      
      if (detectedAny) {
        checkStepCompletion('detect-target');
      }
    }
    
    // Hover logic for surveillance
    if (droneType === 'surveillance') {
      if (clickIndicator && clickIndicator.position && Array.isArray(clickIndicator.position) && !isHovering && !isInCooldown.current) {
        const clickPos = clickIndicator.position;
        const clickedTarget = findTargetAtPosition(targets, clickPos);
        
        if (clickedTarget) {
          console.log(`Starting hover above clicked target: ${clickedTarget.type}`);
          setCurrentTarget(clickedTarget);
          const { setCurrentlyScanning } = useTargetStore.getState();
          setCurrentlyScanning(clickedTarget);
          
          if (typeof setIsHovering === 'function') {
            setIsHovering(true);
          }
          
          hoverState.current.isHovering = true;
          hoverState.current.targetPosition = [...clickedTarget.position];
          hoverState.current.hoverStartTime = Date.now();
          hoverState.current.currentAngle = Math.random() * Math.PI * 2;
          hoverState.current.hoverTimeAccumulated = 0;
          
          updateHoverParameters(clickedTarget);
          checkStepCompletion('hover-at-target');
        }
      }
      
      if (!isHovering && !hoverState.current.isHovering && position && Array.isArray(targets) && !isInCooldown.current) {
        const uavPos = new THREE.Vector3(...position);
        
        for (const target of targets) {
          if (!target || !Array.isArray(target.position)) continue;
          
          const targetKey = `${target.type}-${target.position.join(',')}`;
          if (completedTargets.current.has(targetKey)) continue;
          
          const targetPos = new THREE.Vector3(...target.position);
          const horizontalDist = Math.sqrt(
            Math.pow(targetPos.x - uavPos.x, 2) + 
            Math.pow(targetPos.z - uavPos.z, 2)
          );
          const verticalDist = uavPos.y - targetPos.y;
          
          if (horizontalDist < (target.type === 'soldier' ? 12 : 8) && verticalDist > (target.type === 'soldier' ? 2 : 5) && verticalDist < 30) {
            const idealHoverY = targetPos.y + 15;
            
            if (Math.abs(uavPos.y - idealHoverY) < 5) {
              setCurrentTarget(target);
              const { setCurrentlyScanning } = useTargetStore.getState();
              setCurrentlyScanning(target);
              
              if (typeof setIsHovering === 'function') {
                setIsHovering(true);
              }
              
              hoverState.current.isHovering = true;
              hoverState.current.targetPosition = [...target.position];
              hoverState.current.hoverStartTime = Date.now();
              hoverState.current.currentAngle = Math.random() * Math.PI * 2;
              hoverState.current.hoverTimeAccumulated = 0;
              
              updateHoverParameters(target);
              checkStepCompletion('hover-at-target');
              break;
            }
          }
        }
      }
    }
    
    // Continue hovering
    if (isHovering && hoverState.current.isHovering && hoverState.current.targetPosition) {
      if (objectives && typeof updateHoverTime === 'function') {
        updateHoverTime(delta);
      }
      
      hoverState.current.hoverTimeAccumulated += delta;
      
      useHoverState.getState().updateHoverState({
        isHovering: true,
        targetType: currentTarget?.type || null,
        hoverTimeAccumulated: hoverState.current.hoverTimeAccumulated,
        requiredHoverTime: hoverState.current.requiredHoverTime,
        hoverProgress: hoverState.current.hoverTimeAccumulated / hoverState.current.requiredHoverTime
      });
      
      const hoverComplete = hoverState.current.hoverTimeAccumulated >= hoverState.current.requiredHoverTime;
      
      if (hoverComplete) {
        console.log(`Hover complete for ${currentTarget?.type}!`);
        
        const { markTargetComplete } = useTargetStore.getState();
        if (currentTarget) {
          const targetKey = `${currentTarget.type}-${currentTarget.position.join(',')}`;
          completedTargets.current.add(targetKey);
          
          // ✅ FIX #2: Pass only the target type string, not the full object
          markTargetComplete(currentTarget.type);
        }
        
        if (typeof setIsHovering === 'function') {
          setIsHovering(false);
        }
        setCurrentTarget(null);
        
        hoverState.current.isHovering = false;
        hoverState.current.targetPosition = null;
        hoverState.current.hoverTimeAccumulated = 0;
        
        useHoverState.getState().resetHoverState();
        useClickControlStore.getState().setClickIndicator(null);
        
        isInCooldown.current = true;
        if (cooldownTimer.current) {
          clearTimeout(cooldownTimer.current);
        }
        cooldownTimer.current = setTimeout(() => {
          isInCooldown.current = false;
        }, 2000);
        
        return;
      }
      
      try {
        const targetPos = new THREE.Vector3(...hoverState.current.targetPosition);
        const radius = hoverState.current.hoverRadius;
        const height = hoverState.current.hoverHeight;
        
        hoverState.current.currentAngle += hoverState.current.hoverSpeed * delta;
        
        const angleVal = hoverState.current.currentAngle;
        const cosVal = Math.cos(angleVal);
        const sinVal = Math.sin(angleVal);
        
        const hoverX = targetPos.x + (cosVal * radius);
        const hoverY = targetPos.y + height;
        const hoverZ = targetPos.z + (sinVal * radius);
        
        const currentPos = position || [0, 0, 0];
        const newPos = [hoverX, hoverY, hoverZ];
        const positionChanged = Math.abs(currentPos[0] - newPos[0]) > 0.1 || 
                               Math.abs(currentPos[1] - newPos[1]) > 0.1 || 
                               Math.abs(currentPos[2] - newPos[2]) > 0.1;
        
        if (positionChanged) {
          setPosition(newPos);
        }
      } catch (err) {
        console.error("Error in hover calculations:", err);
      }
    } else if (!isHovering) {
      useHoverState.getState().resetHoverState();
      handleMovementToTarget(position, targetPosition, setPosition, delta);
    }
  });

  const findTargetAtPosition = (targets, clickPosition) => {
    if (!targets || !Array.isArray(targets) || !clickPosition) return null;
    
    const clickPos = new THREE.Vector3(...clickPosition);
    let closestTarget = null;
    let closestDistance = Infinity;
    
    for (const target of targets) {
      if (!target || !Array.isArray(target.position)) continue;
      
      const targetKey = `${target.type}-${target.position.join(',')}`;
      if (completedTargets.current.has(targetKey)) continue;
      
      const targetPos = new THREE.Vector3(...target.position);
      const distance = clickPos.distanceTo(targetPos);
      
      const threshold = target.type === 'soldier' ? 15 : 10;
      
      if (distance < threshold && (distance < closestDistance || target.type === 'soldier')) {
        if (target.type === 'soldier' || !closestTarget || closestTarget.type !== 'soldier') {
          closestTarget = target;
          closestDistance = distance;
        }
      }
    }
    
    return closestTarget;
  };

  useEffect(() => {
    return () => {
      hoverState.current = {
        isHovering: false,
        targetPosition: null,
        hoverStartTime: null,
        currentAngle: 0,
        hoverHeight: 15,
        hoverRadius: 8,
        hoverSpeed: 0.5,
        hoverTimeAccumulated: 0,
        requiredHoverTime: 5,
        returningToBase: false,
        baseReached: false
      };
      
      completedTargets.current.clear();
      
      if (useHoverState && useHoverState.getState) {
        useHoverState.getState().resetHoverState();
      }
      
      if (cooldownTimer.current) {
        clearTimeout(cooldownTimer.current);
      }
      isInCooldown.current = false;
      
      // ✅ NEW: Clear crash timer on cleanup
      if (crashTimer.current) {
        clearTimeout(crashTimer.current);
        crashTimer.current = null;
      }

      windGustTimer.current = 0;
      const { resetWindGust } = useEnvironmentStore.getState();
      resetWindGust();
    };
  }, []);

  return null;
};

export default UAVController;