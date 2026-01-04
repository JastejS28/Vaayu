import React from 'react';
import { Box, Typography, LinearProgress, Paper } from '@mui/material';
import { useUAVStore } from '../store/uavStore';
import BatteryFullIcon from '@mui/icons-material/BatteryFull';
import Battery60Icon from '@mui/icons-material/Battery60';
import Battery20Icon from '@mui/icons-material/Battery20';
import BatteryAlertIcon from '@mui/icons-material/BatteryAlert';

const BatteryIndicator = ({ compact = false }) => {
  const battery = useUAVStore((state) => state.battery);
  
  // Determine color based on battery level
  const getBatteryColor = () => {
    if (battery > 50) return '#4caf50'; // Green
    if (battery > 20) return '#ff9800'; // Yellow/Orange
    return '#f44336'; // Red
  };

  // Determine icon based on battery level
  const getBatteryIcon = () => {
    if (battery > 75) return <BatteryFullIcon sx={{ fontSize: compact ? 20 : 24 }} />;
    if (battery > 50) return <Battery60Icon sx={{ fontSize: compact ? 20 : 24 }} />;
    if (battery > 20) return <Battery20Icon sx={{ fontSize: compact ? 20 : 24 }} />;
    return <BatteryAlertIcon sx={{ fontSize: compact ? 20 : 24 }} />;
  };

  // Determine status text
  const getStatusText = () => {
    if (battery > 50) return 'Good';
    if (battery > 20) return 'Low';
    if (battery > 10) return 'Critical';
    return 'EMERGENCY';
  };

  const color = getBatteryColor();
  const statusText = getStatusText();

  // Compact version for inline display
  if (compact) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          bgcolor: 'rgba(0,0,0,0.3)',
          borderRadius: 1,
          px: 1.5,
          py: 0.5,
          border: battery <= 20 ? `2px solid ${color}` : 'none',
          animation: battery <= 10 ? 'pulse 1s infinite' : 'none',
          '@keyframes pulse': {
            '0%, 100%': { opacity: 1 },
            '50%': { opacity: 0.6 }
          }
        }}
      >
        <Box sx={{ color, display: 'flex', alignItems: 'center' }}>
          {getBatteryIcon()}
        </Box>
        <Typography 
          variant="body2" 
          sx={{ 
            fontWeight: 'bold',
            color: color,
            minWidth: '45px',
            fontFamily: 'monospace'
          }}
        >
          {Math.round(battery)}%
        </Typography>
      </Box>
    );
  }

  // Full version for dashboard display
  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 2, 
        backgroundColor: 'rgba(0,0,0,0.7)', 
        borderRadius: 2,
        border: battery <= 20 ? `2px solid ${color}` : '1px solid rgba(0,150,255,0.3)',
        animation: battery <= 10 ? 'pulse 1.5s infinite' : 'none',
        '@keyframes pulse': {
          '0%, 100%': { 
            borderColor: color,
            boxShadow: `0 0 0 0 ${color}40`
          },
          '50%': { 
            borderColor: color,
            boxShadow: `0 0 20px 5px ${color}80`
          }
        }
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ color, display: 'flex', alignItems: 'center' }}>
            {getBatteryIcon()}
          </Box>
          <Typography variant="subtitle1" component="div" sx={{ fontWeight: 'bold' }}>
            Battery Power
          </Typography>
        </Box>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 'bold',
            color: color,
            fontFamily: 'monospace'
          }}
        >
          {Math.round(battery)}%
        </Typography>
      </Box>
      
      <Box sx={{ mb: 1 }}>
        <LinearProgress 
          variant="determinate" 
          value={battery} 
          sx={{ 
            height: 12, 
            borderRadius: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            '& .MuiLinearProgress-bar': {
              backgroundColor: color,
              transition: 'background-color 0.3s ease',
              borderRadius: 1,
            }
          }} 
        />
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          Status
        </Typography>
        <Typography 
          variant="caption" 
          sx={{ 
            fontWeight: 'bold',
            color: color,
            px: 1,
            py: 0.5,
            bgcolor: `${color}20`,
            borderRadius: 1
          }}
        >
          {statusText}
        </Typography>
      </Box>

      {battery <= 20 && (
        <Box 
          sx={{ 
            mt: 1.5,
            p: 1,
            bgcolor: `${color}15`,
            borderRadius: 1,
            border: `1px solid ${color}40`
          }}
        >
          <Typography 
            variant="caption" 
            sx={{ 
              color: color,
              fontWeight: 'bold',
              display: 'block'
            }}
          >
            ⚠️ {battery <= 10 ? 'RETURN TO BASE IMMEDIATELY!' : 'Low battery - Consider returning to base'}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default BatteryIndicator;
