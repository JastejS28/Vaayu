import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

const ModelExplosion = ({ position, id, skipSound = false }) => {
  const explosionRef = useRef();
  const startTime = useRef(Date.now());
  const [finished, setFinished] = useState(false);
  
  // Try to load explosion model - use true for the second parameter to suppress errors
  const { scene } = useGLTF('/models/effects/explosion.glb', true);

  // Create and play explosion sound
  useEffect(() => {
    // Set a timeout to remove the explosion
    const timer = setTimeout(() => {
      setFinished(true);
    }, 3000);
    
    // FIXED: Only play sound if skipSound is false (prevent duplicate sounds)
    if (!skipSound) {
      // Play explosion sound immediately when component mounts
      const playSound = async () => {
        const soundPaths = [
          '/sounds/explosion.mp3',
          '/assets/sounds/explosion.mp3',
          '/public/sounds/explosion.mp3',
          '/models/sounds/explosion.mp3',
          '/explosion.mp3',
          '/sounds/explosion.wav',
          '/assets/sounds/explosion.wav'
        ];
        
        // Try each path until one works
        let played = false;
        
        for (const path of soundPaths) {
          if (played) break;
          
          try {
            const audio = new Audio(path);
            audio.volume = 0.7;
            
            // Use promise-based approach for better error handling
            await audio.play();
            console.log(`Successfully played explosion sound from: ${path}`);
            played = true;
          } catch (error) {
            console.log(`Error with sound at ${path}: ${error.message}`);
          }
        }
      };
      
      playSound();
    }
    
    return () => {
      clearTimeout(timer);
    };
  }, [skipSound]);

  // Animate the explosion
  useFrame(() => {
    if (finished || !explosionRef.current) return;
    
    const elapsed = (Date.now() - startTime.current) / 1000;
    
    // Scale animation
    const baseScale = 0.2; // Smaller starting scale
    const maxScale = 1.2;  // Smaller maximum scale
    const scale = Math.min(maxScale, baseScale + (elapsed < 0.5 ? elapsed * 2 : 0.5 * 2 + (elapsed - 0.5) * 0.8));
    
    if (explosionRef.current) {
      explosionRef.current.position.set(...position);
      explosionRef.current.scale.set(scale, scale, scale);
      
      // Fade out near the end
      if (elapsed > 2.0) {
        const fadeOut = 1 - ((elapsed - 2.0) / 1.0);
        explosionRef.current.traverse(child => {
          if (child.material) {
            child.material.opacity = fadeOut;
            child.material.transparent = true;
          }
        });
      }
    }
  });

  if (finished) return null;

  // If no model is available, use a simple sphere as fallback
  if (!scene) {
    return (
      <mesh position={position}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial color="#FF6600" />
      </mesh>
    );
  }

  // Return the 3D model
  return (
    <group>
      <primitive 
        ref={explosionRef}
        object={scene.clone()}
        position={position}
        scale={[0.08, 0.08, 0.08]}
        key={id || `expl-${startTime.current}`}
      />
    </group>
  );
};

export default ModelExplosion;

// Preload the model to avoid glitches during first explosion
useGLTF.preload('/models/effects/explosion.glb', true);