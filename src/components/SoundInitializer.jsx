import { useEffect } from 'react';

const SoundInitializer = () => {
  useEffect(() => {
    let audioContext = null;
    
    const enableAudio = () => {
      // Create audio context on user interaction
      if (!audioContext) {
        try {
          audioContext = new (window.AudioContext || window.webkitAudioContext)();
          
          // If in suspended state, resume it
          if (audioContext.state === 'suspended') {
            audioContext.resume();
          }
          
          // Create a silent sound to enable audio
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          gainNode.gain.value = 0; // Silent
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          oscillator.start(0);
          oscillator.stop(0.1);
          
          console.log("Audio system initialized on user interaction");
          
          // Remove event listeners once audio is enabled
          document.removeEventListener('click', enableAudio);
          document.removeEventListener('keydown', enableAudio);
          document.removeEventListener('touchstart', enableAudio);
        } catch (e) {
          console.error("Failed to initialize audio:", e);
        }
      }
    };
    
    // Add listeners for common user interactions
    document.addEventListener('click', enableAudio);
    document.addEventListener('keydown', enableAudio);
    document.addEventListener('touchstart', enableAudio);
    
    return () => {
      // Clean up
      document.removeEventListener('click', enableAudio);
      document.removeEventListener('keydown', enableAudio);
      document.removeEventListener('touchstart', enableAudio);
    };
  }, []);
  
  return null; // This component doesn't render anything
};

export default SoundInitializer;