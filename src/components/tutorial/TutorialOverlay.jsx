import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  Chip
} from '@mui/material';
import {
  NavigateNext,
  NavigateBefore,
  Close,
  LightbulbOutlined,
  CheckCircle
} from '@mui/icons-material';
import { useTutorialStore } from '../../store/tutorialStore';

const TutorialOverlay = () => {
  const {
    isTutorialActive,
    currentStep,
    droneType,
    getCurrentStep,
    nextStep,
    previousStep,
    skipTutorial,
    surveillanceSteps,
    attackSteps
  } = useTutorialStore();

  if (!isTutorialActive) return null;

  const steps = droneType === 'attack' ? attackSteps : surveillanceSteps;
  const stepData = getCurrentStep();

  return (
    <>
      {/* Semi-transparent backdrop */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 9998,
          pointerEvents: stepData?.highlight ? 'auto' : 'none'
        }}
      />

      {/* Tutorial Panel */}
      <Paper
        elevation={24}
        sx={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: '600px' },
          maxWidth: '600px',
          zIndex: 9999,
          p: 3,
          background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
          color: 'white',
          border: '2px solid #4a9eff'
        }}
      >
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <LightbulbOutlined sx={{ color: '#ffd700' }} />
            <Typography variant="h6" fontWeight="bold">
              Tutorial Mode
            </Typography>
          </Box>
          <IconButton onClick={skipTutorial} size="small" sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        </Box>

        {/* Progress */}
        <Box mb={3}>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="body2">
              Step {currentStep + 1} of {steps.length}
            </Typography>
            <Typography variant="body2">
              {Math.round(((currentStep + 1) / steps.length) * 100)}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={((currentStep + 1) / steps.length) * 100}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: 'rgba(255,255,255,0.2)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#4caf50'
              }
            }}
          />
        </Box>

        {/* Step Content */}
        <Box mb={3}>
          <Typography variant="h5" fontWeight="bold" mb={2}>
            {stepData?.title}
          </Typography>
          <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
            {stepData?.description}
          </Typography>

          {/* Action Indicator */}
          {stepData?.indicator && (
            <Chip
              icon={<CheckCircle />}
              label={stepData.indicator}
              color="success"
              sx={{
                mt: 2,
                fontWeight: 'bold',
                animation: 'pulse 2s infinite'
              }}
            />
          )}
        </Box>

        {/* Navigation Buttons */}
        <Box display="flex" justifyContent="space-between" gap={2}>
          <Button
            variant="outlined"
            startIcon={<NavigateBefore />}
            onClick={previousStep}
            disabled={currentStep === 0}
            sx={{
              color: 'white',
              borderColor: 'white',
              '&:hover': {
                borderColor: '#4a9eff',
                backgroundColor: 'rgba(255,255,255,0.1)'
              }
            }}
          >
            Previous
          </Button>

          <Button
            variant="outlined"
            onClick={skipTutorial}
            sx={{
              color: '#ff6b6b',
              borderColor: '#ff6b6b',
              '&:hover': {
                borderColor: '#ff5252',
                backgroundColor: 'rgba(255,107,107,0.1)'
              }
            }}
          >
            Skip Tutorial
          </Button>

          <Button
            variant="contained"
            endIcon={<NavigateNext />}
            onClick={nextStep}
            sx={{
              backgroundColor: '#4caf50',
              '&:hover': {
                backgroundColor: '#45a049'
              }
            }}
          >
            {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
          </Button>
        </Box>

        {/* Mini Stepper */}
        <Box mt={3}>
          <Stepper activeStep={currentStep} alternativeLabel>
            {steps.slice(0, 10).map((step, index) => (
              <Step key={step.id}>
                <StepLabel
                  sx={{
                    '& .MuiStepLabel-label': {
                      color: 'rgba(255,255,255,0.7)',
                      fontSize: '0.7rem'
                    },
                    '& .MuiStepLabel-label.Mui-active': {
                      color: 'white',
                      fontWeight: 'bold'
                    },
                    '& .MuiStepIcon-root': {
                      color: 'rgba(255,255,255,0.3)'
                    },
                    '& .MuiStepIcon-root.Mui-active': {
                      color: '#4caf50'
                    },
                    '& .MuiStepIcon-root.Mui-completed': {
                      color: '#4caf50'
                    }
                  }}
                />
              </Step>
            ))}
          </Stepper>
        </Box>
      </Paper>

      {/* CSS for pulse animation */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.6;
            }
          }
        `}
      </style>
    </>
  );
};

export default TutorialOverlay;