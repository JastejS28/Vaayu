import React from 'react';
import { Box, Button, Tooltip, Typography, Chip } from '@mui/material';
import { useClickControlStore } from '../store/clickControlStore';
import { useUAVStore } from '../store/uavStore';

const MinimalTerrainControls = () => {
  const {
    isSpawnMode,
    clickMode,
    toggleMoveMode,
    toggleSpawnMode,
    resetControls
  } = useClickControlStore();
  
  const { position } = useUAVStore();
  
  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: 16,
        right: 16,
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
      }}
    >
      {/* Position display */}
      <Tooltip title="Current UAV Position">
        <Chip 
          label={`Position: (${position[0].toFixed(1)}, ${position[1].toFixed(1)}, ${position[2].toFixed(1)})`}
          variant="outlined"
          size="small"
          sx={{ 
            bgcolor: 'rgba(0,0,0,0.6)', 
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.2)',
            '& .MuiChip-label': {
              fontSize: '0.7rem'
            }
          }}
        />
      </Tooltip>
      
      {/* Only show spawn mode when needed */}
      {isSpawnMode && (
        <Button 
          variant="contained"
          size="small"
          color="warning"
          sx={{ 
            opacity: 0.9, 
            fontSize: '0.7rem',
            textTransform: 'none',
            py: 0.5
          }}
          onClick={() => toggleSpawnMode()}
        >
          🎯 Spawn Mode Active
        </Button>
      )}
    </Box>
  );
};

export default MinimalTerrainControls;