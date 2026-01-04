import React from 'react';
import { Box, LinearProgress, Typography } from '@mui/material';

const LockOnProgress = ({ status, progress }) => {
  const getStatusColor = () => {
    switch(status) {
      case 'seeking': return '#ffeb3b'; // Yellow for seeking
      case 'locked': return '#4caf50';  // Green for locked
      default: return '#f44336';        // Red for errors or inactive
    }
  };

  const getStatusText = () => {
    switch(status) {
      case 'seeking': return 'ACQUIRING TARGET';
      case 'locked': return 'TARGET LOCKED';
      default: return 'STANDBY';
    }
  };

  return (
    <Box sx={{ width: '100%', mb: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="caption" fontWeight="bold" color={getStatusColor()}>
          {getStatusText()}
        </Typography>
        {status === 'seeking' && (
          <Typography variant="caption">
            {Math.floor(progress * 100)}%
          </Typography>
        )}
      </Box>
      <LinearProgress 
        variant={status === 'seeking' ? 'determinate' : 'indeterminate'} 
        value={status === 'seeking' ? progress * 100 : undefined}
        color={status === 'locked' ? 'success' : 'warning'}
        sx={{ 
          height: 8, 
          borderRadius: 1,
          '& .MuiLinearProgress-bar': {
            backgroundColor: getStatusColor(),
          }
        }}
      />
    </Box>
  );
};

export default LockOnProgress;