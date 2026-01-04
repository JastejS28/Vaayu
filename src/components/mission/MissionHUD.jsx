import React from 'react';
import { Box, Typography, LinearProgress, Paper, Chip } from '@mui/material';
import { useMissionStore } from '../../store/missionStore';
import BatteryIndicator from '../BatteryIndicator';

const MissionHUD = () => {
  const {
    missionType,
    missionStatus,
    missionTimeRemaining,
    objectives,
    isHovering,
    currentTarget,
    missionDuration
  } = useMissionStore();

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getHoverProgress = () => {
    if (!objectives || !objectives.hoverTime) return 0;
    return Math.min(objectives.hoverTime / objectives.requiredSurveillanceTime, 1);
  };

  if (missionStatus !== 'active') {
    return null;
  }

  const timePercentage = (missionTimeRemaining / missionDuration) * 100;

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        mb: 2, 
        p: 2, 
        backgroundColor: 'rgba(0,0,0,0.7)', 
        borderRadius: 2,
        border: '1px solid rgba(0,150,255,0.3)',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="subtitle1" component="div" sx={{ fontWeight: 'bold' }}>
            <Box component="span" sx={{ color: '#00a0ff', mr: 1 }}>⟡</Box>
            {missionType === 'surveillance' ? 'Surveillance Mission' : 'Surveillance & Attack'}
          </Typography>
        </Box>
        <Chip 
          label="ACTIVE" 
          size="small" 
          sx={{ 
            bgcolor: 'success.main',
            color: 'white',
            fontWeight: 'bold'
          }} 
        />
      </Box>
      
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="body2" color="text.secondary">Mission Time</Typography>
          <Typography variant="body2" color={missionTimeRemaining < 20 ? 'error.main' : 'primary.main'}>
            {formatTime(missionTimeRemaining)} remaining
          </Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={timePercentage} 
          sx={{ 
            height: 8, 
            borderRadius: 1,
            backgroundColor: 'rgba(0,0,0,0.3)',
            '& .MuiLinearProgress-bar': {
              backgroundColor: missionTimeRemaining < 20 ? '#ff3d00' : '#4caf50'
            }
          }} 
        />
      </Box>
      
      <Typography variant="subtitle2" sx={{ mb: 1 }}>Current Status</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, backgroundColor: 'rgba(0,0,0,0.2)', p: 1, borderRadius: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <Box sx={{ 
            width: 10, 
            height: 10, 
            borderRadius: '50%', 
            bgcolor: isHovering ? 'success.main' : 'info.main',
            mr: 1
          }}/>
          <Typography variant="body2">
            {isHovering && currentTarget 
              ? `🔄 Hovering above ${currentTarget.type} - Gathering intelligence`
              : '🔎 Exploring terrain - Fly over objects to discover targets'}
          </Typography>
        </Box>
      </Box>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Mission Objectives
        </Typography>
        <Typography variant="body2" component="div">
          • Click on targets to investigate them<br />
          • Hover to complete surveillance<br />
          • Avoid detection<br />
          • Return to base before time expires
        </Typography>
      </Box>

      {/* Battery Indicator - Compact Version */}
      <Box sx={{ mt: 2 }}>
        <BatteryIndicator />
      </Box>
    </Paper>
  );
};

export default MissionHUD;
