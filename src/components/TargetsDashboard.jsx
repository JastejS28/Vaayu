import React from 'react';
import { Box, Typography, Paper, Chip } from '@mui/material';
import { useTargetStore } from '../store/targetStore';
import RadarIcon from '@mui/icons-material/Radar';
import TargetCard from './TargetCard';

const TargetsDashboard = () => {
  const { detectedTargets, completedTargets } = useTargetStore();
  
  return (
    <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box
          component="span"
          sx={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            bgcolor: 'primary.main',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'white',
            mr: 1
          }}
        >
          🎯
        </Box>
        <Typography variant="h6" component="h2">
          Detected Targets <Chip size="small" label={detectedTargets.length} color="primary" />
        </Typography>
      </Box>
      
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Target Summary:
      </Typography>
      
      {Object.entries(completedTargets).map(([type, count]) => (
        count > 0 ? (
          <Typography key={type} variant="body2" sx={{ mb: 0.5 }}>
            {type.charAt(0).toUpperCase() + type.slice(1)}: {count}
          </Typography>
        ) : null
      ))}
      
      {detectedTargets.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          No targets with completed surveillance yet.
        </Typography>
      )}
      
      {detectedTargets.map((target, index) => (
        <TargetCard key={index} target={target} />
      ))}
    </Paper>
  );
};

export default TargetsDashboard;