import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Fade } from '@mui/material';
import { useEnvironmentStore } from '../store/environmentStore';
import AirIcon from '@mui/icons-material/Air';

const WindGustIndicator = () => {
  const isWindGustActive = useEnvironmentStore((state) => state.isWindGustActive);
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    if (isWindGustActive) {
      setShowIndicator(true);
    } else {
      // Delay hiding to allow fade-out animation
      const timeout = setTimeout(() => setShowIndicator(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [isWindGustActive]);

  if (!showIndicator) return null;

  return (
    <Fade in={isWindGustActive} timeout={300}>
      <Paper 
        elevation={6}
        sx={{ 
          position: 'relative',
          p: 2,
          mb: 2,
          backgroundColor: 'rgba(255, 152, 0, 0.95)',
          borderRadius: 2,
          border: '3px solid rgba(255, 193, 7, 0.9)',
          minWidth: 200,
          boxShadow: '0 0 30px rgba(255, 152, 0, 0.6)',
          animation: 'windPulse 0.8s ease-in-out infinite',
          '@keyframes windPulse': {
            '0%, 100%': { 
              transform: 'scale(1)',
              boxShadow: '0 0 30px rgba(255, 152, 0, 0.6)'
            },
            '50%': { 
              transform: 'scale(1.05)',
              boxShadow: '0 0 40px rgba(255, 152, 0, 0.9)'
            }
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <Box 
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'windSpin 2s linear infinite',
              '@keyframes windSpin': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' }
              }
            }}
          >
            <AirIcon 
              sx={{ 
                fontSize: 40,
                color: '#fff',
                filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.8))'
              }} 
            />
          </Box>
          <Box>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 'bold',
                color: '#fff',
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                letterSpacing: '0.05em'
              }}
            >
              ⚠️ WIND GUST
            </Typography>
          </Box>
        </Box>

        <Box sx={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          borderRadius: 1,
          p: 1,
          mt: 1
        }}>
          <Typography 
            variant="caption" 
            sx={{ 
              color: '#fff',
              fontWeight: 500,
              display: 'block',
              textAlign: 'center',
              fontSize: '0.75rem'
            }}
          >
            Environmental Alert
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.9)',
              display: 'block',
              textAlign: 'center',
              fontSize: '0.7rem',
              fontStyle: 'italic'
            }}
          >
            No flight impact
          </Typography>
        </Box>

        {/* Wind lines animation */}
        <Box sx={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'hidden',
          borderRadius: 2,
          pointerEvents: 'none'
        }}>
          {[...Array(5)].map((_, i) => (
            <Box
              key={i}
              sx={{
                position: 'absolute',
                width: '100%',
                height: '2px',
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                top: `${20 + i * 15}%`,
                animation: `windFlow ${1 + i * 0.2}s linear infinite`,
                animationDelay: `${i * 0.1}s`,
                '@keyframes windFlow': {
                  '0%': { 
                    transform: 'translateX(-100%)',
                    opacity: 0
                  },
                  '50%': {
                    opacity: 0.6
                  },
                  '100%': { 
                    transform: 'translateX(100%)',
                    opacity: 0
                  }
                }
              }}
            />
          ))}
        </Box>
      </Paper>
    </Fade>
  );
};

export default WindGustIndicator;
