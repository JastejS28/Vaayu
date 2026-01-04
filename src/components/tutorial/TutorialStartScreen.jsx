import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import {
  School,
  FlightTakeoff,
  MyLocation,
  LocalFireDepartment,
  PlayArrow,
  Close
} from '@mui/icons-material';
import { useTutorialStore } from '../../store/tutorialStore';

const TutorialStartScreen = ({ droneType, onStart, onSkip }) => {
  const features = droneType === 'surveillance' 
    ? [
        { icon: <FlightTakeoff />, text: 'Spawn & fly your drone' },
        { icon: <MyLocation />, text: 'Detect targets with radar' },
        { icon: <School />, text: 'Perform surveillance missions' }
      ]
    : [
        { icon: <FlightTakeoff />, text: 'Control armed UAV' },
        { icon: <MyLocation />, text: 'Lock onto targets' },
        { icon: <LocalFireDepartment />, text: 'Fire missiles & bombs' }
      ];

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        zIndex: 10000
      }}
    >
      <Card
        sx={{
          maxWidth: 600,
          width: '90%',
          background: 'linear-gradient( #807c85ff 100%)',
          color: 'white'
        }}
        elevation={24}
      >
        <CardContent sx={{ p: 4 }}>
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <School sx={{ fontSize: 48, color: '#ffd700' }} />
            <Typography variant="h4" fontWeight="bold">
              Tutorial Mode
            </Typography>
          </Box>

          <Typography variant="h6" mb={2}>
            {droneType === 'surveillance' 
              ? 'Learn Surveillance Operations' 
              : 'Learn Attack Drone Operations'}
          </Typography>

          <Typography variant="body1" mb={3} sx={{ opacity: 0.9 }}>
            This interactive tutorial will guide you step-by-step through{' '}
            {droneType === 'surveillance' ? 'reconnaissance' : 'combat'} missions.
          </Typography>

          <Grid container spacing={2} mb={3}>
            {features.map((feature, index) => (
              <Grid item xs={12} key={index}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255,255,255,0.2)'
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography variant="body1">{feature.text}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>

          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              backgroundColor: 'rgba(255,255,255,0.1)',
              mb: 2
            }}
          >
            <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
              💡 Tip: Follow the on-screen instructions and indicators. You can skip
              the tutorial anytime.
            </Typography>
          </Box>
        </CardContent>

        <CardActions sx={{ p: 3, pt: 0, gap: 2 }}>
          <Button
            fullWidth
            variant="contained"
            size="large"
            startIcon={<PlayArrow />}
            onClick={onStart}
            sx={{
              backgroundColor: '#4caf50',
              '&:hover': { backgroundColor: '#45a049' },
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 'bold'
            }}
          >
            Start Tutorial
          </Button>
          <Button
            fullWidth
            variant="outlined"
            size="large"
            startIcon={<Close />}
            onClick={onSkip}
            sx={{
              color: 'white',
              borderColor: 'white',
              '&:hover': {
                borderColor: '#ff6b6b',
                backgroundColor: 'rgba(255,255,255,0.1)'
              },
              py: 1.5
            }}
          >
            Skip Tutorial
          </Button>
        </CardActions>
      </Card>
    </Box>
  );
};

export default TutorialStartScreen;