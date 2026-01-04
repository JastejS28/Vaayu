import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Slider,
  Card,
  CardContent,
  RadioGroup,
  FormControlLabel,
  Radio,
  Chip,
  Divider,
  Stack,
  Alert,
  Paper,
  LinearProgress,
  Tooltip,
  IconButton,
  Collapse
} from '@mui/material';
import {
  PlayArrow,
  Info,
  CheckCircle,
  Schedule,
  Visibility,
  Gps,
  Speed,
  FlightTakeoff,
  RadioButtonChecked,
  ExpandMore,
  ExpandLess
} from '@mui/icons-material';
import { useMissionStore } from '../store/missionStore';
import { useUAVStore } from '../store/uavStore';

const MissionPlanning = ({ onStartMission }) => {
  const [missionDuration, setMissionDuration] = useState(120); // 2 minutes default
  const [selectedObjective, setSelectedObjective] = useState('surveillance');
  const [showInstructions, setShowInstructions] = useState(true);
  const { droneType } = useUAVStore();

  const handleStartMission = () => {
    const { startMission } = useMissionStore.getState();
    startMission(missionDuration);
    if (onStartMission) onStartMission();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const objectiveInfo = {
    surveillance: {
      icon: <Visibility />,
      color: '#2196f3',
      title: 'Surveillance Mission',
      description: 'Detect and hover above targets to gather intelligence',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      targets: ['Tank', 'Jeep', 'Warehouse', 'Soldier']
    },
    attack: {
      icon: <RadioButtonChecked />,
      color: '#f44336',
      title: 'Surveillance & Attack',
      description: 'First detect targets, then engage and destroy them',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      targets: ['Tank', 'Jeep', 'Warehouse']
    }
  };

  const currentObjective = objectiveInfo[selectedObjective];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #1e3c72 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 4,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3), transparent 50%), radial-gradient(circle at 80% 80%, rgba(74, 158, 255, 0.2), transparent 50%)',
          pointerEvents: 'none'
        }
      }}
    >
      <Box sx={{ maxWidth: 1200, width: '100%', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <Paper
          elevation={0}
          sx={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 4,
            padding: 4,
            mb: 3,
            textAlign: 'center'
          }}
        >
          <FlightTakeoff sx={{ fontSize: 48, color: '#4a9eff', mb: 2 }} />
          <Typography
            variant="h3"
            fontWeight="700"
            sx={{
              background: 'linear-gradient(135deg, #ffffff 0%, #4a9eff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1
            }}
          >
            Mission Planning & Setup
          </Typography>
          <Typography variant="body1" color="rgba(255,255,255,0.7)" sx={{ maxWidth: 600, mx: 'auto' }}>
            Configure your UAV mission parameters and prepare for deployment
          </Typography>
        </Paper>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
          {/* Left Panel - Mission Configuration */}
          <Box sx={{ flex: 1 }}>
            {/* Mission Objective Card */}
            <Card
              elevation={0}
              sx={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 3,
                mb: 3
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" gap={1} mb={3}>
                  <Gps sx={{ color: '#4a9eff' }} />
                  <Typography variant="h6" fontWeight="600" color="white">
                    Mission Objective
                  </Typography>
                </Box>

                <RadioGroup value={selectedObjective} onChange={(e) => setSelectedObjective(e.target.value)}>
                  <Stack spacing={2}>
                    {/* Surveillance Option */}
                    <Paper
                      elevation={0}
                      sx={{
                        background: selectedObjective === 'surveillance' 
                          ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)'
                          : 'rgba(255, 255, 255, 0.03)',
                        border: selectedObjective === 'surveillance'
                          ? '2px solid #667eea'
                          : '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: 2,
                        p: 2,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)',
                          transform: 'translateY(-2px)'
                        }
                      }}
                      onClick={() => setSelectedObjective('surveillance')}
                    >
                      <FormControlLabel
                        value="surveillance"
                        control={<Radio sx={{ color: '#667eea' }} />}
                        sx={{ m: 0, width: '100%' }}
                        label={
                          <Box sx={{ width: '100%' }}>
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                              <Visibility sx={{ color: '#667eea' }} />
                              <Typography variant="subtitle1" fontWeight="600" color="white">
                                Surveillance Mission
                              </Typography>
                            </Box>
                            <Typography variant="body2" color="rgba(255,255,255,0.7)" sx={{ pl: 4 }}>
                              Detect targets by hovering above them to gather intelligence
                            </Typography>
                          </Box>
                        }
                      />
                    </Paper>

                    {/* Attack Option */}
                    <Paper
                      elevation={0}
                      sx={{
                        background: selectedObjective === 'attack'
                          ? 'linear-gradient(135deg, rgba(240, 147, 251, 0.2) 0%, rgba(245, 87, 108, 0.2) 100%)'
                          : 'rgba(255, 255, 255, 0.03)',
                        border: selectedObjective === 'attack'
                          ? '2px solid #f5576c'
                          : '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: 2,
                        p: 2,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: 'linear-gradient(135deg, rgba(240, 147, 251, 0.15) 0%, rgba(245, 87, 108, 0.15) 100%)',
                          transform: 'translateY(-2px)'
                        }
                      }}
                      onClick={() => setSelectedObjective('attack')}
                    >
                      <FormControlLabel
                        value="attack"
                        control={<Radio sx={{ color: '#f5576c' }} />}
                        sx={{ m: 0, width: '100%' }}
                        label={
                          <Box sx={{ width: '100%' }}>
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                              <RadioButtonChecked sx={{ color: '#f5576c' }} />
                              <Typography variant="subtitle1" fontWeight="600" color="white">
                                Surveillance & Attack
                              </Typography>
                            </Box>
                            <Typography variant="body2" color="rgba(255,255,255,0.7)" sx={{ pl: 4 }}>
                              First detect targets via surveillance, then engage and destroy them
                            </Typography>
                          </Box>
                        }
                      />
                    </Paper>
                  </Stack>
                </RadioGroup>

                <Alert
                  icon={<Info />}
                  severity="info"
                  sx={{
                    mt: 3,
                    background: 'rgba(74, 158, 255, 0.1)',
                    border: '1px solid rgba(74, 158, 255, 0.3)',
                    color: 'white',
                    '& .MuiAlert-icon': { color: '#4a9eff' }
                  }}
                >
                  Fly over targets and hover above them. When above a target, the UAV will automatically hover for surveillance.
                </Alert>
              </CardContent>
            </Card>

            {/* Time Management Card */}
            <Card
              elevation={0}
              sx={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 3
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" gap={1} mb={3}>
                  <Schedule sx={{ color: '#4a9eff' }} />
                  <Typography variant="h6" fontWeight="600" color="white">
                    Time Management
                  </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="body2" color="rgba(255,255,255,0.7)">
                      Mission Duration
                    </Typography>
                    <Chip
                      label={formatTime(missionDuration)}
                      sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '16px',
                        height: 32
                      }}
                    />
                  </Box>

                  <Slider
                    value={missionDuration}
                    onChange={(e, val) => setMissionDuration(val)}
                    min={30}
                    max={300}
                    step={30}
                    marks={[
                      { value: 30, label: '30s' },
                      { value: 120, label: '2m' },
                      { value: 300, label: '5m' }
                    ]}
                    sx={{
                      color: '#4a9eff',
                      '& .MuiSlider-markLabel': {
                        color: 'rgba(255,255,255,0.6)',
                        fontSize: '12px'
                      },
                      '& .MuiSlider-thumb': {
                        width: 20,
                        height: 20,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        boxShadow: '0 0 20px rgba(102, 126, 234, 0.5)'
                      },
                      '& .MuiSlider-track': {
                        background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                        height: 6
                      },
                      '& .MuiSlider-rail': {
                        background: 'rgba(255,255,255,0.1)',
                        height: 6
                      }
                    }}
                  />
                </Box>

                <Alert
                  icon={<Info />}
                  severity="warning"
                  sx={{
                    background: 'rgba(255, 152, 0, 0.1)',
                    border: '1px solid rgba(255, 152, 0, 0.3)',
                    color: 'white',
                    '& .MuiAlert-icon': { color: '#ff9800' }
                  }}
                >
                  Time includes travel to targets, hovering for surveillance, and return to base
                </Alert>
              </CardContent>
            </Card>
          </Box>

          {/* Right Panel - Instructions & Summary */}
          <Box sx={{ flex: 1 }}>
            {/* Mission Instructions Card */}
            <Card
              elevation={0}
              sx={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 3,
                mb: 3
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={2}
                  sx={{ cursor: 'pointer' }}
                  onClick={() => setShowInstructions(!showInstructions)}
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    <Info sx={{ color: '#4a9eff' }} />
                    <Typography variant="h6" fontWeight="600" color="white">
                      Mission Instructions
                    </Typography>
                  </Box>
                  <IconButton size="small" sx={{ color: 'white' }}>
                    {showInstructions ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                </Box>

                <Collapse in={showInstructions}>
                  <Box sx={{ pl: 2 }}>
                    <Typography variant="subtitle2" fontWeight="600" color="white" mb={2}>
                      How to Complete Your Mission:
                    </Typography>

                    <Stack spacing={2}>
                      {[
                        { num: 1, text: 'Spawn UAV: Click on terrain to deploy your drone', icon: <FlightTakeoff /> },
                        { num: 2, text: 'Select Targets: Click on targets you want to investigate', icon: <Gps /> },
                        { num: 3, text: 'Hover: UAV will automatically hover above the selected target', icon: <Speed /> },
                        { num: 4, text: 'Repeat: Click on new targets to move to them for surveillance', icon: <Visibility /> },
                        { num: 5, text: 'Return: Mission ends when time expires or when returning to base', icon: <CheckCircle /> }
                      ].map((step, index) => (
                        <Box key={index} display="flex" gap={2} alignItems="start">
                          <Box
                            sx={{
                              minWidth: 32,
                              height: 32,
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 'bold',
                              color: 'white',
                              fontSize: '14px'
                            }}
                          >
                            {step.num}
                          </Box>
                          <Box flex={1}>
                            <Typography variant="body2" color="white" fontWeight="500">
                              {step.text}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Stack>

                    <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.1)' }} />

                    <Box>
                      <Typography variant="subtitle2" fontWeight="600" color="white" mb={1.5}>
                        Time Management:
                      </Typography>
                      <Stack spacing={1}>
                        <Typography variant="body2" color="rgba(255,255,255,0.7)" display="flex" alignItems="center" gap={1}>
                          <Box component="span" sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#4a9eff' }} />
                          Total time includes travel, hovering, and return to base
                        </Typography>
                        <Typography variant="body2" color="rgba(255,255,255,0.7)" display="flex" alignItems="center" gap={1}>
                          <Box component="span" sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#4a9eff' }} />
                          Base location: [-45, 30, -45]
                        </Typography>
                        <Typography variant="body2" color="rgba(255,255,255,0.7)" display="flex" alignItems="center" gap={1}>
                          <Box component="span" sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#4a9eff' }} />
                          UAV will return to base when time is low
                        </Typography>
                      </Stack>
                    </Box>
                  </Box>
                </Collapse>
              </CardContent>
            </Card>

            {/* Mission Summary Card */}
            <Card
              elevation={0}
              sx={{
                background: currentObjective.gradient,
                backdropFilter: 'blur(20px)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                borderRadius: 3
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="600" color="white" mb={2}>
                  Mission Summary
                </Typography>

                <Stack spacing={2.5}>
                  <Box>
                    <Typography variant="body2" color="rgba(255,255,255,0.8)" mb={1}>
                      Mission Objective:
                    </Typography>
                    <Chip
                      icon={currentObjective.icon}
                      label={currentObjective.title}
                      sx={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        fontWeight: 'bold',
                        border: '1px solid rgba(255,255,255,0.3)'
                      }}
                    />
                  </Box>

                  <Box>
                    <Typography variant="body2" color="rgba(255,255,255,0.8)" mb={1}>
                      Mission Duration:
                    </Typography>
                    <Chip
                      icon={<Schedule />}
                      label={formatTime(missionDuration)}
                      sx={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        fontWeight: 'bold',
                        border: '1px solid rgba(255,255,255,0.3)'
                      }}
                    />
                  </Box>

                  <Box>
                    <Typography variant="body2" color="rgba(255,255,255,0.8)" mb={1}>
                      Target Selection:
                    </Typography>
                    <Chip
                      label="Manual target selection"
                      sx={{
                        background: 'rgba(76, 175, 80, 0.3)',
                        color: 'white',
                        border: '1px solid rgba(76, 175, 80, 0.5)'
                      }}
                    />
                  </Box>

                  <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />

                  <Box>
                    <Typography variant="body2" color="rgba(255,255,255,0.8)" mb={1}>
                      Mission Objectives:
                    </Typography>
                    <Stack direction="row" flexWrap="wrap" gap={1}>
                      {currentObjective.targets.map((target, idx) => (
                        <Chip
                          key={idx}
                          label={`• ${target}`}
                          size="small"
                          sx={{
                            background: 'rgba(255, 255, 255, 0.15)',
                            color: 'white',
                            fontSize: '12px'
                          }}
                        />
                      ))}
                    </Stack>
                  </Box>

                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CheckCircle sx={{ color: '#4caf50', fontSize: 20 }} />
                      <Typography variant="body2" color="white" fontWeight="500">
                        Mission Ready
                      </Typography>
                    </Stack>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Start Mission Button */}
            <Button
              variant="contained"
              fullWidth
              size="large"
              startIcon={<PlayArrow />}
              onClick={handleStartMission}
              sx={{
                mt: 3,
                py: 2,
                fontSize: '18px',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                boxShadow: '0 8px 32px rgba(76, 175, 80, 0.4)',
                borderRadius: 2,
                '&:hover': {
                  background: 'linear-gradient(135deg, #45a049 0%, #3d8b40 100%)',
                  boxShadow: '0 12px 40px rgba(76, 175, 80, 0.6)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              START MISSION
            </Button>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
};

export default MissionPlanning;