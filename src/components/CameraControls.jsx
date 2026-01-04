import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useCameraStore } from '../store/cameraStore';

const CameraControls = () => {
  const { cameraMode, setCameraMode } = useCameraStore();

  return (
    <Box sx={{ 
      mt: 1, 
      p: 1, 
      backgroundColor: 'rgba(0, 0, 0, 0.7)', 
      borderRadius: 1,
      border: '1px solid #555'
    }}>
      <Typography variant="caption" sx={{ color: 'white', display: 'block', mb: 1 }}>
        📹 Camera Controls
      </Typography>
      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
        <Button
          variant={cameraMode === 'third-person' ? 'contained' : 'outlined'}
          onClick={() => setCameraMode('third-person')}
          size="small"
          sx={{ fontSize: '0.7rem', minWidth: 'auto', px: 1 }}
        >
          First Person
        </Button>
        <Button
          variant={cameraMode === 'first-person' ? 'contained' : 'outlined'}
          onClick={() => setCameraMode('first-person')}
          size="small"
          sx={{ fontSize: '0.7rem', minWidth: 'auto', px: 1 }}
        >
          Cockpit View
        </Button>
        <Button
          variant={cameraMode === 'down-facing' ? 'contained' : 'outlined'}
          onClick={() => setCameraMode('down-facing')}
          size="small"
          sx={{ fontSize: '0.7rem', minWidth: 'auto', px: 1 }}
        >
          Payload Cam
        </Button>
      </Box>
      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5, fontSize: '0.65rem' }}>
        Current: {cameraMode === 'third-person' ? 'Third Person View' : 
                 cameraMode === 'first-person' ? 'Cockpit View' : 'Payload Camera'}
      </Typography>
    </Box>
  );
};

export default CameraControls;