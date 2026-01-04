import { create } from 'zustand';
import * as THREE from 'three';
import { useUAVStore } from './uavStore';
import { useTargetStore } from './targetStore';
import { useMissionStore } from './missionStore';

export const useAttackDroneStore = create((set, get) => ({
  // Basic targeting data
  targets: [],
  selectedWeapon: 'missile',
  ammoCount: {
    missile: 6,
    bomb: 3,
  },
  targeting: {
    lockedTarget: null,
    lockStatus: 'inactive', // 'inactive', 'seeking', 'locked'
    lockTimer: 0,
    maxLockTime: 2.0, // seconds to achieve full lock
    maxTargetingRange: 200, // maximum range in world units
  },
  activeMissiles: [],
  
  // Attack mission properties
  missionState: 'idle', // 'idle', 'moving', 'attacking', 'returning', 'crashed'
  homeBase: [-50, 30, -40], // Starting position
  attackPosition: null,
  attackAltitude: 40,
  attackDistance: 30,
  attackSpeed: 0.5,
  moveProgress: 0,
  
  // Track which targets have been destroyed
  destroyedTargets: [],
  explosions: [],
  
  // Initialize and fetch targets from environment
  initTargets: () => {
    const targets = useUAVStore.getState().targets || [];
    console.log("Initializing attack drone targets:", targets);
    set({ targets });
  },
  
  // Weapon selection
  selectWeapon: (weapon) => {
    console.log("Weapon selected:", weapon);
    set({ selectedWeapon: weapon });
  },
  
  // Begin attack mission after target lock
  beginMission: (targetId) => {
    const { targets } = get();
    const target = targets.find(t => t.id === targetId);
    
    if (!target) {
      console.error("Target not found for attack mission");
      return;
    }
    
    const targetPos = new THREE.Vector3(...target.position);
    const currentPos = new THREE.Vector3(...useUAVStore.getState().position);
    const direction = new THREE.Vector3().subVectors(currentPos, targetPos).normalize();
    const attackPos = new THREE.Vector3().copy(targetPos).add(
      direction.multiplyScalar(get().attackDistance)
    );
    attackPos.y = get().attackAltitude;
    
    console.log("Beginning attack mission to:", attackPos);
    
    set({ 
      missionState: 'moving',
      attackPosition: [attackPos.x, attackPos.y, attackPos.z],
      moveProgress: 0
    });
  },
  
  moveToPosition: (targetPos) => {
    console.log("Attack drone moving to position:", targetPos);
    
    set({ 
      manualTargetPosition: targetPos,
      missionState: 'manual'
    });
    
    useUAVStore.setState({ 
      targetPosition: targetPos,
      position: targetPos
    });
  },
  
  // Called when UAV reaches its destination
  positionReached: () => {
    set({ missionState: 'attacking' });
    console.log("Attack position reached. Ready to engage targets.");
  },
  
  // ✅ FIX: Allow target lock in ANY state except crashed
  beginTargetLock: (targetId) => {
    const state = get();
    
    // Check if crashed
    if (state.missionState === 'crashed') {
      console.log("Cannot begin target lock - drone crashed");
      return;
    }
    
    const target = state.targets.find(t => t.id === targetId);
    if (!target) {
      console.log("Target not found:", targetId);
      return;
    }
    
    // Check BOTH detectedTargets and completedTargets
    const { detectedTargets, completedTargets } = useTargetStore.getState();
    const isDetected = detectedTargets.some(detected => 
      detected.id === targetId || 
      (detected.position[0] === target.position[0] && 
        detected.position[2] === target.position[2])
    );
    
    const isCompleted = completedTargets[target.type] && completedTargets[target.type] > 0;
    
    if (!isDetected && !isCompleted) {
      console.log("Cannot target undetected/uncompleted object:", targetId);
      return;
    }
    
    console.log('✅ [attackDroneStore] Beginning target lock for:', targetId);
    
    // If not in attacking state, switch to it
    if (state.missionState === 'idle' || state.missionState === 'manual') {
      console.log('✅ Switching to attacking state');
      set({ missionState: 'attacking' });
    }
    
    // Begin lock-on
    set({ 
      targeting: {
        ...state.targeting,
        lockedTarget: targetId,
        lockStatus: 'seeking',
        lockTimer: 0,
        maxLockTime: 3.0
      }
    });
  },
  
  // Update target lock with time
  updateTargetLock: (delta) => {
    const { targeting, missionState } = get();
    
    // Skip if not in seeking mode
    if (targeting.lockStatus !== 'seeking') return;
    
    // Increment lock timer
    let newTimer = targeting.lockTimer + delta;
    let newStatus = targeting.lockStatus;
    
    // Check if lock is complete
    if (newTimer >= targeting.maxLockTime) {
      newTimer = targeting.maxLockTime;
      newStatus = 'locked';
      
      console.log('🔒 Target lock achieved!');
    }
    
    // Update state
    set({
      targeting: {
        ...targeting,
        lockTimer: newTimer,
        lockStatus: newStatus,
      }
    });
  },
  
  // Update UAV position during mission
  updateMissionMovement: (delta) => {
    return;
  },
  
  // Fire missile
  fireMissile: () => {
    const { selectedWeapon, ammoCount, targeting, activeMissiles, missionState } = get();
    
    // Allow firing from 'attacking' OR 'idle' state (after lock achieved)
    if (missionState === 'crashed') {
      console.warn("Cannot fire: drone is crashed");
      return { success: false, error: "Drone is crashed" };
    }
    
    // Check if we have lock and ammo
    if (targeting.lockStatus !== 'locked') {
      console.warn("Cannot fire: no target locked");
      return { success: false, error: "No target locked - select a target first" };
    }
    
    if (ammoCount[selectedWeapon] <= 0) {
      console.warn("Cannot fire: no ammo");
      return { success: false, error: `No ${selectedWeapon}s remaining` };
    }
    
    // Get target and UAV positions
    const targets = get().targets;
    const target = targets.find(t => t.id === targeting.lockedTarget);
    if (!target) {
      console.error("Target not found");
      return { success: false, error: "Target not found" };
    }
    
    const uavPosition = useUAVStore.getState().position;
    
    // Weapon-specific firing conditions
    const distanceToTarget = Math.sqrt(
      Math.pow(uavPosition[0] - target.position[0], 2) +
      Math.pow(uavPosition[2] - target.position[2], 2)
    );
    
    if (selectedWeapon === 'bomb') {
      if (distanceToTarget > 10) {
        console.warn("Cannot drop bomb: UAV must be directly above target");
        return { 
          success: false, 
          error: "Position UAV directly above target to drop bombs",
          requiredDistance: 10,
          currentDistance: distanceToTarget.toFixed(1)
        };
      }
      
      const altitudeDifference = Math.abs(uavPosition[1] - target.position[1]);
      if (altitudeDifference < 15) {
        console.warn("Cannot drop bomb: UAV must be higher above target");
        return { 
          success: false, 
          error: "Gain altitude above target for safe bomb deployment",
          requiredAltitude: "15m above target",
          currentAltitude: altitudeDifference.toFixed(1) + "m"
        };
      }
    } else if (selectedWeapon === 'missile') {
      if (distanceToTarget > 20) {
        console.warn("Cannot fire missile: Target too far for engagement");
        return { 
          success: false, 
          error: "Move within 20 meters of target for missile engagement",
          requiredDistance: 20,
          currentDistance: distanceToTarget.toFixed(1)
        };
      }
    }
    
    // Create unique ID for missile
    const uniqueId = `missile-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    
    // Validate target position is within terrain bounds
    const validatePosition = (pos) => {
      return [
        Math.max(-50, Math.min(50, pos[0])),
        Math.max(10, Math.min(100, pos[1])),
        Math.max(-50, Math.min(50, pos[2]))
      ];
    };
    
    const validTargetPosition = validatePosition(target.position);
    
    // Create new missile
    const newMissile = {
      id: uniqueId,
      weaponType: selectedWeapon,
      targetId: targeting.lockedTarget,
      position: [...uavPosition],
      targetPosition: validTargetPosition,
      flightProgress: 0,
      speed: selectedWeapon === 'missile' ? 0.5 : 0.3,
    };
    
    // Update state
    set({
      ammoCount: {
        ...ammoCount,
        [selectedWeapon]: ammoCount[selectedWeapon] - 1
      },
      activeMissiles: [...activeMissiles, newMissile]
    });
    
    console.log("🚀 Missile fired:", newMissile);
    
    // After firing all ammo, return to base
    if (ammoCount[selectedWeapon] - 1 <= 0) {
      setTimeout(() => {
        set({ 
          missionState: 'returning',
          targeting: {
            ...get().targeting,
            lockStatus: 'inactive',
            lockTimer: 0,
          }
        });
        console.log("All ammo expended, returning to base");
      }, 3000);
    }
    
    return { success: true };
  },
  
  destroyTarget: (targetId) => {
    const { targets, destroyedTargets } = get();
    
    if (destroyedTargets.includes(targetId)) return;
    
    const targetToDestroy = targets.find(t => t.id === targetId);
    if (!targetToDestroy) return;
    
    const updatedDestroyedTargets = [...destroyedTargets, targetId];
    set({ destroyedTargets: updatedDestroyedTargets });
    
    console.log(`Target destroyed: ${targetId} (${targetToDestroy.type})`);
    
    // ✅ NEW: Check if all targets are destroyed after each kill
    const remainingTargets = targets.filter(t => !updatedDestroyedTargets.includes(t.id));
    console.log(`📊 Targets remaining: ${remainingTargets.length}/${targets.length}`);
    
    // If all targets destroyed, mission success
    if (remainingTargets.length === 0) {
      console.log('🎉 All targets eliminated! Mission success!');
      setTimeout(() => {
        useMissionStore.getState().completeMission('success', {
          message: 'All targets eliminated',
          targetsDestroyed: updatedDestroyedTargets.length,
          totalTargets: targets.length
        });
      }, 2000);
    }
  },
  
  // Update missiles in flight
  updateMissiles: (delta) => {
    const { activeMissiles, destroyTarget } = get();
    if (activeMissiles.length === 0) return;
    
    const updatedMissiles = activeMissiles.map(missile => {
      const newProgress = missile.flightProgress + delta * missile.speed;
      
      if (missile.flightProgress < 1.0 && newProgress >= 1.0) {
        console.log("Missile hit target:", missile.targetId);
        destroyTarget(missile.targetId);
      }
      
      return {
        ...missile,
        flightProgress: newProgress
      };
    });
    
    const currentMissiles = updatedMissiles.filter(missile => 
      missile.flightProgress <= 1.0 || 
      (missile.flightProgress > 1.0 && missile.flightProgress < 1.0 + missile.speed * 0.2)
    );
    
    if (currentMissiles.length !== activeMissiles.length || 
        currentMissiles.some((m, i) => m.flightProgress !== activeMissiles[i].flightProgress)) {
      set({ activeMissiles: currentMissiles });
    }
  },
  
  // Return to base command
  returnToBase: () => {
    set({ 
      missionState: 'returning',
      moveProgress: 0,
      targeting: {
        ...get().targeting,
        lockStatus: 'inactive',
        lockTimer: 0,
      }
    });
    console.log("Returning to base");
  },
  
  // Drone damage properties
  droneHealth: 100,
  damageEffects: {
    smoke: false,
    communications: false,
    targeting: false
  },
  communicationsJammed: false,
  targetingJammed: false,
  
  // ✅ NEW: Helper function to check mission failure
  checkMissionFailure: () => {
    const { targets, destroyedTargets } = get();
    const remainingTargets = targets.filter(t => !destroyedTargets.includes(t.id));
    
    if (remainingTargets.length > 0) {
      console.log(`❌ Mission Failed: ${remainingTargets.length} targets remaining`);
      console.log('Remaining targets:', remainingTargets.map(t => ({ id: t.id, type: t.type })));
      
      // Fail the mission
      setTimeout(() => {
        useMissionStore.getState().completeMission('failed', {
          message: 'Attack UAV destroyed before eliminating all targets',
          targetsDestroyed: destroyedTargets.length,
          targetsRemaining: remainingTargets.length,
          totalTargets: targets.length,
          reason: 'UAV shot down by defense system'
        });
      }, 3000); // Wait 3 seconds after crash before showing failure
      
      return true; // Mission failed
    }
    
    return false; // No failure
  },
  
  setDroneDamage: ({ type, damage, duration }) => {
    const currentState = get();
    
    switch (type) {
      case 'defense_system':
      case 'hit':
        if (damage > 0) {
          const newHealth = Math.max(0, currentState.droneHealth - damage);
          
          set({
            droneHealth: newHealth,
            damageEffects: {
              ...currentState.damageEffects,
              smoke: newHealth < 70
            }
          });
          
          if (newHealth <= 0) {
            console.log("💥 Drone destroyed by anti-aircraft fire!");
            
            const currentPosition = [...useUAVStore.getState().position];
            
            set({ 
              missionState: 'crashed',
              damageEffects: {
                ...currentState.damageEffects,
                smoke: true,
                fire: true
              },
              crashData: {
                isFalling: true,
                crashStartPosition: [...currentPosition],
                groundLevel: 10,
                fallSpeed: 0.5 + Math.random() * 1.5,
                rotationSpeed: [
                  (Math.random() - 0.5) * 0.1,
                  (Math.random() - 0.5) * 0.05,
                  (Math.random() - 0.5) * 0.15
                ]
              }
            });
            
            // Set UAV store crash state
            useUAVStore.getState().setCrashed(true, 'Shot down by defense system');
            
            // ✅ NEW: Check if mission should fail after crash
            setTimeout(() => {
              get().checkMissionFailure();
            }, 3000); // Check after falling animation completes
          }
        }
        break;
        
      case 'communications':
        set({
          communicationsJammed: true,
          damageEffects: {
            ...currentState.damageEffects,
            communications: true
          }
        });
        
        setTimeout(() => {
          set({
            communicationsJammed: false,
            damageEffects: {
              ...get().damageEffects,
              communications: false
            }
          });
        }, duration * 1000);
        break;
        
      case 'targeting':
        set({
          targetingJammed: true,
          damageEffects: {
            ...currentState.damageEffects,
            targeting: true
          },
          targeting: {
            ...currentState.targeting,
            lockStatus: 'inactive',
            lockTimer: 0
          }
        });
        
        setTimeout(() => {
          set({
            targetingJammed: false,
            damageEffects: {
              ...get().damageEffects,
              targeting: false
            }
          });
        }, duration * 1000);
        break;
    }
  },
  
  manualTargetPosition: null,
  manualMovementSpeed: 0.5,

  crashData: {
    isFalling: false,
    crashStartPosition: null,
    groundLevel: 0,
    fallSpeed: 0,
    rotationSpeed: [0, 0, 0]
  },

  setManualTargetPosition: (targetPos) => {
    set({ 
      manualTargetPosition: targetPos,
      missionState: get().missionState === 'idle' ? 'manual' : get().missionState
    });
  },

  updateCrashAnimation: (delta) => {
    return;
  },

  setTargeting: (targeting) => {
    set({ targeting });
  },
  
  setWeaponConfig: (config) => set(state => ({
    weaponConfig: {
      ...config
    },
    selectedWeapon: config.selectedWeapon || 'missile',
    ammoCount: {
      missile: config.missileCount || state.ammoCount.missile,
      bomb: config.bombCount || state.ammoCount.bomb
    }
  })),
}));