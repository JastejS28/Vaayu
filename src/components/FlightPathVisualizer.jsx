import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useUAVStore } from '../store/uavStore';
import * as THREE from 'three';

const FlightPathVisualizer = () => {
  const lineRef = useRef();
  const { position, targetPosition } = useUAVStore();
  
  useFrame(() => {
    if (!lineRef.current || !targetPosition) {
      if (lineRef.current) {
        lineRef.current.visible = false;
      }
      return;
    }
    
    // Make line visible
    lineRef.current.visible = true;
    
    // Create points for the flight path
    const points = [];
    const currentPos = new THREE.Vector3(...position);
    const targetPos = new THREE.Vector3(...targetPosition);
    
    // Create flight path from current position to target
    points.push(currentPos);
    points.push(targetPos);
    
    // Update line geometry
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    lineRef.current.geometry.dispose();
    lineRef.current.geometry = geometry;
    
    // Animate the line with a pulsing effect
    const time = Date.now() * 0.003;
    const opacity = 0.6 + Math.sin(time) * 0.2;
    lineRef.current.material.opacity = opacity;
  });
  
  return (
    <line ref={lineRef}>
      <bufferGeometry />
      <lineBasicMaterial 
        color="#00ff88" 
        transparent={true} 
        opacity={0.8}
        linewidth={2}
      />
    </line>
  );
};

export default FlightPathVisualizer;