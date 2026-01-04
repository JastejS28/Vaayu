import React, { useEffect } from 'react';
import { useMissionStore } from '../store/missionStore';
import { useTargetStore } from '../store/targetStore';
import MissionResultsScreen from './mission/MissionResultsScreen';
import { Box } from '@mui/material';

const MissionMonitor = ({ onRestart, onNewMission }) => {
  const missionStatus = useMissionStore(state => state.missionStatus);
  
  // Debug mission status changes
  useEffect(() => {
    console.log(`Mission status changed: ${missionStatus}`);
  }, [missionStatus]);
  
  const handleRestart = () => {
    // Reset target lists
    const { resetTargets } = useTargetStore.getState();
    resetTargets();
    
    // Call parent handler
    if (onRestart) onRestart();
  };
  
  const handleNewMission = () => {
    // Reset target lists
    const { resetTargets } = useTargetStore.getState();
    resetTargets();
    
    // Call parent handler
    if (onNewMission) onNewMission();
  };
  
  // Show mission results when completed or failed
  if (missionStatus === 'completed' || missionStatus === 'failed') {
    return (
      <Box sx={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 9999
      }}>
        <MissionResultsScreen 
          onRestart={handleRestart} 
          onNewMission={handleNewMission} 
        />
      </Box>
    );
  }
  
  // No UI when mission is planning or active
  return null;
};

export default MissionMonitor;