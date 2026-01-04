import React, { useState, useEffect, useRef } from 'react';
import { Box, CssBaseline, ThemeProvider, createTheme, Typography, Alert } from '@mui/material';
import CommandDashboard from './components/CommandDashboard';
import AttackDashboard from './components/attack-drone/AttackDashboard';
import DroneTypeSelector from './components/drone-selector/DroneTypeSelector';
import LiveCameraView from './components/LiveCameraView';
import EnvironmentSettings from './components/EnvironmentSettings';
import { useUAVStore } from './store/uavStore';
import { useMissionStore } from './store/missionStore';
import SoundInitializer from './components/SoundInitializer';
import Scene from './components/Scene';
import { useCameraStore } from './store/cameraStore';
import CameraControls from './components/CameraControls';
import MinimalTerrainControls from './components/MinimalTerrainControls';
import MissionMonitor from './components/MissionMonitor';
import TutorialStartScreen from './components/tutorial/TutorialStartScreen';
import TutorialOverlay from './components/tutorial/TutorialOverlay';
import { useTutorialStore } from './store/tutorialStore';
import './App.css';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

// Initialize spawn helper alert
const InitialSpawnAlert = React.memo(() => {
  const [visible, setVisible] = useState(true);
  const initialCheck = useRef(false);
  
  useEffect(() => {
    // Only run this check once after the initial render
    if (initialCheck.current) return;
    initialCheck.current = true;
    
    // Check if UAV has moved from default position
    const checkPosition = () => {
      const { position } = useUAVStore.getState();
      const isAtDefault = 
        Math.abs(position[0]) < 0.1 && 
        Math.abs(position[1] - 50) < 0.1 && 
        Math.abs(position[2]) < 0.1;
        
      if (!isAtDefault) {
        setVisible(false);
      } else {
        // Check again after a short delay
        setTimeout(checkPosition, 500);
      }
    };
    
    // Start checking
    checkPosition();
    
    // Also subscribe to position changes for immediate update
    const unsubscribe = useUAVStore.subscribe(
      state => state.position,
      (position) => {
        const isAtDefault = 
          Math.abs(position[0]) < 0.1 && 
          Math.abs(position[1] - 50) < 0.1 && 
          Math.abs(position[2]) < 0.1;
          
        if (!isAtDefault) {
          setVisible(false);
        }
      }
    );
    
    return () => unsubscribe();
  }, []);
  
  if (!visible) return null;
  
  return (
    <Alert 
      severity="info" 
      variant="filled"
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1000,
        maxWidth: '500px',
        textAlign: 'center',
        padding: '20px 40px',
        boxShadow: '0 0 30px rgba(0,0,0,0.5)'
      }}
      onClose={() => setVisible(false)}
    >
      📍 Click anywhere on the terrain to spawn your UAV
    </Alert>
  );
});

// Fix the handlers
const handleRestartMission = () => {
  const { resetMission } = useMissionStore.getState();
  resetMission();
};

const handleNewMission = () => {
  const { resetMission } = useMissionStore.getState();
  resetMission();
};

function App() {
  const [droneType, setDroneType] = useState('surveillance');
  const liveViewPortalRef = useRef();
  const [isInitialSpawn, setIsInitialSpawn] = useState(true);
  const [showTutorialStart, setShowTutorialStart] = useState(true);
  const { startTutorial, skipTutorial, setDroneType: setTutorialDroneType } = useTutorialStore();

  // ✅ Get missionType and missionStatus from store
  const missionType = useMissionStore(state => state.missionType);
  const missionStatus = useMissionStore(state => state.missionStatus);

  // ✅ Sync droneType with missionType when mission becomes active
  // Only sync if missionType is a valid string
  useEffect(() => {
    if (missionStatus === 'active' && missionType && typeof missionType === 'string') {
      console.log('[App.jsx] Syncing droneType with missionType:', missionType);
      setDroneType(missionType);
    }
  }, [missionStatus, missionType]);

  // Use the position directly from the store
  const uavPosition = useUAVStore(state => state.position);

  // Update this effect to use the imported state directly
  useEffect(() => {
    // Check if UAV position is different from default
    if (uavPosition[0] !== 0 || uavPosition[1] !== 50 || uavPosition[2] !== 0) {
      setIsInitialSpawn(false);
    }
  }, [uavPosition]);

  const initialSetThermalVision = useUAVStore.getState().setThermalVision;
  const initialIsThermalVision = useUAVStore.getState().isThermalVision;
  
  // Monitor for initial UAV position set
  useEffect(() => {
    const unsubscribe = useUAVStore.subscribe(
      (state) => state.position,
      (position) => {
        const isAtDefault = Math.abs(position[0]) < 0.1 && 
                         Math.abs(position[1] - 50) < 0.1 && 
                         Math.abs(position[2]) < 0.1;
        if (!isAtDefault) {
          setIsInitialSpawn(false);
        }
      }
    );
    
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    console.log("[App.jsx] Initial mount check. Current isThermalVision:", initialIsThermalVision);
    if (initialIsThermalVision) {
      console.log("[App.jsx] Forcing thermal vision off on initial load.");
      initialSetThermalVision(false);
    }
  }, []);

  useEffect(() => {
    const enableAudio = () => {
      const unblockAudio = new Audio();
      unblockAudio.play().catch(() => {});
      unblockAudio.pause();
      
      document.removeEventListener('click', enableAudio);
      document.removeEventListener('keydown', enableAudio);
    };
    
    document.addEventListener('click', enableAudio);
    document.addEventListener('keydown', enableAudio);
    
    return () => {
      document.removeEventListener('click', enableAudio);
      document.removeEventListener('keydown', enableAudio);
    };
  }, []);

  const { droneType: storeDroneType, setDroneType: setStoreDroneType } = useUAVStore();
  const { cameraMode } = useCameraStore();

  // Update tutorial drone type when selection changes
  useEffect(() => {
    setTutorialDroneType(droneType);
  }, [droneType, setTutorialDroneType]);

  const handleStartTutorial = () => {
    setShowTutorialStart(false);
    startTutorial(droneType);
  };

  const handleSkipTutorial = () => {
    setShowTutorialStart(false);
    skipTutorial();
  };

  // ✅ Debug log to check droneType
  useEffect(() => {
    console.log('[App.jsx] Current droneType:', droneType);
  }, [droneType]);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      
      {/* Tutorial Start Screen */}
      {showTutorialStart && (
        <TutorialStartScreen
          droneType={droneType}
          onStart={handleStartTutorial}
          onSkip={handleSkipTutorial}
        />
      )}

      {/* Tutorial Overlay */}
      <TutorialOverlay />

      <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        
        {/* Left section: 3D Scene */}
        <Box sx={{ position: 'relative', width: '70%', height: '100%' }}>
          <Scene droneType={droneType} liveViewPortalRef={liveViewPortalRef} />
          
          {/* Initial spawn alert */}
          {isInitialSpawn && <InitialSpawnAlert />}
          
          {/* Environment controls */}
          <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}>
            <EnvironmentSettings />
          </Box>
          
          {/* Drone Type Selector */}
          <Box sx={{ position: 'absolute', top: 16, left: 16, zIndex: 10 }}>
            <DroneTypeSelector 
              value={droneType} 
              onChange={setDroneType} 
              isInMissionExecution={true} 
            />
          </Box>
          
          {/* Live camera view */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 16,
              left: 16,
              zIndex: 10,
              width: '300px',
              backgroundColor: 'rgba(0,0,0,0.7)',
              padding: '8px',
              borderRadius: '8px',
            }}
          >
            <Typography variant="subtitle2" sx={{ mb: 1, color: 'white' }}>
              📹 Live UAV Camera Feed
            </Typography>
            <Box 
              ref={liveViewPortalRef} 
              sx={{ 
                width: '100%',
                height: '180px',
                borderRadius: '4px',
                overflow: 'hidden',
                backgroundColor: '#111',
                position: 'relative'
              }}
            />
            <Box sx={{ mt: 1 }}>
              <CameraControls />
            </Box>
          </Box>
          
          {/* Add the minimal controls */}
          <MinimalTerrainControls />
        </Box>
        
        {/* Right section: Dashboard */}
        <Box 
          sx={{ 
            width: '30%', 
            height: '100%', 
            bgcolor: '#111',
            borderLeft: '1px solid #333',
            overflow: 'auto',
            color: 'white'
          }}
        >
          {/* Dashboard content - Always render based on droneType */}
          <Box sx={{ p: 2 }}>
            {droneType === 'surveillance' ? (
              <CommandDashboard />
            ) : droneType === 'attack' ? (
              <AttackDashboard />
            ) : (
              <CommandDashboard /> // Fallback to surveillance dashboard
            )}
          </Box>
        </Box>

        <SoundInitializer />
        
        {/* Add mission monitor */}
        <MissionMonitor 
          onRestart={handleRestartMission}
          onNewMission={handleNewMission}
        />
      </Box>
    </ThemeProvider>
  );
}

export default App;