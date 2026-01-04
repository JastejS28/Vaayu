 import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useCameraStore } from '../store/cameraStore';
import { useUAVStore } from '../store/uavStore';
import * as THREE from 'three';

const CameraController = () => {
  const { camera } = useThree();
  const { cameraMode, getCurrentSettings } = useCameraStore();
  const { position: uavPosition, rotation: uavRotation, isCrashed } = useUAVStore();
  
  const targetPosition = useRef(new THREE.Vector3());
  const currentPosition = useRef(new THREE.Vector3());
  const lookAtTarget = useRef(new THREE.Vector3());
  const crashShakeIntensity = useRef(0);
  const crashStartTime = useRef(null);
  
  useFrame((state, delta) => {
    const settings = getCurrentSettings();
    
    // Handle crash state
    if (isCrashed) {
      if (crashStartTime.current === null) {
        crashStartTime.current = state.clock.elapsedTime;
        crashShakeIntensity.current = 2.0; // Initial shake intensity
      }
      
      // Decrease shake intensity over time
      const timeSinceCrash = state.clock.elapsedTime - crashStartTime.current;
      crashShakeIntensity.current = Math.max(0, 2.0 - timeSinceCrash * 0.5);
      
      // Apply crash shake to camera
      const shakeX = (Math.random() - 0.5) * crashShakeIntensity.current;
      const shakeY = (Math.random() - 0.5) * crashShakeIntensity.current;
      const shakeZ = (Math.random() - 0.5) * crashShakeIntensity.current;
      
      // Create modified rotation for crashed UAV (more erratic)
      const crashRotation = [
        uavRotation[0] + Math.sin(state.clock.elapsedTime * 3) * 0.3,
        uavRotation[1] + Math.cos(state.clock.elapsedTime * 2.5) * 0.2,
        uavRotation[2] + Math.sin(state.clock.elapsedTime * 4) * 0.4
      ];
      
      // Create rotation matrix from crashed UAV rotation
      const rotationMatrix = new THREE.Matrix4();
      rotationMatrix.makeRotationFromEuler(new THREE.Euler(
        crashRotation[0], 
        crashRotation[1], 
        crashRotation[2]
      ));
      
      // Calculate camera offset in world space with shake
      const offsetVector = new THREE.Vector3(...settings.offset);
      offsetVector.applyMatrix4(rotationMatrix);
      
      // Calculate target camera position with shake
      targetPosition.current.set(
        uavPosition[0] + offsetVector.x + shakeX,
        uavPosition[1] + offsetVector.y + shakeY,
        uavPosition[2] + offsetVector.z + shakeZ
      );
      
      // Calculate look-at target with shake
      const lookAtOffset = new THREE.Vector3(...settings.lookAtOffset);
      lookAtOffset.applyMatrix4(rotationMatrix);
      lookAtTarget.current.set(
        uavPosition[0] + lookAtOffset.x + shakeX * 0.5,
        uavPosition[1] + lookAtOffset.y + shakeY * 0.5,
        uavPosition[2] + lookAtOffset.z + shakeZ * 0.5
      );
      
      // Faster, more erratic movement for crashed state
      const crashLerpFactor = Math.min(delta * 15, 1);
      currentPosition.current.lerp(targetPosition.current, crashLerpFactor);
      camera.position.copy(currentPosition.current);
      
      // Add slight FOV shake for crash effect
      const fovShake = Math.sin(state.clock.elapsedTime * 8) * crashShakeIntensity.current * 2;
      camera.fov = settings.fov + fovShake;
      camera.updateProjectionMatrix();
      
      // Make camera look at target with shake
      camera.lookAt(lookAtTarget.current);
      
      return; // Exit early for crash handling
    } else {
      // Reset crash state when not crashed
      crashStartTime.current = null;
      crashShakeIntensity.current = 0;
    }
    
    // Normal operation (not crashed)
    // Create rotation matrix from UAV rotation
    const rotationMatrix = new THREE.Matrix4();
    rotationMatrix.makeRotationFromEuler(new THREE.Euler(
      uavRotation[0], 
      uavRotation[1], 
      uavRotation[2]
    ));
    
    // Calculate camera offset in world space
    const offsetVector = new THREE.Vector3(...settings.offset);
    offsetVector.applyMatrix4(rotationMatrix);
    
    // Calculate target camera position
    targetPosition.current.set(
      uavPosition[0] + offsetVector.x,
      uavPosition[1] + offsetVector.y,
      uavPosition[2] + offsetVector.z
    );
    
    // Calculate look-at target
    const lookAtOffset = new THREE.Vector3(...settings.lookAtOffset);
    lookAtOffset.applyMatrix4(rotationMatrix);
    lookAtTarget.current.set(
      uavPosition[0] + lookAtOffset.x,
      uavPosition[1] + lookAtOffset.y,
      uavPosition[2] + lookAtOffset.z
    );
    
    // Smooth camera movement for normal operation
    const lerpFactor = Math.min(delta * 5, 1);
    
    currentPosition.current.lerp(targetPosition.current, lerpFactor);
    camera.position.copy(currentPosition.current);
    
    // Update camera FOV if needed
    if (camera.fov !== settings.fov) {
      camera.fov = settings.fov;
      camera.updateProjectionMatrix();
    }
    
    // Make camera look at target
    camera.lookAt(lookAtTarget.current);
  });
  
  // Initialize camera position
  useEffect(() => {
    currentPosition.current.copy(camera.position);
  }, [camera]);
  
  return null;
};

export default CameraController;