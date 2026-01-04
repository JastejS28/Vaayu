import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Slider,
  Chip,
  Alert
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useMissionStore } from '../../store/missionStore';
import { useUAVStore } from '../../store/uavStore';
import DroneTypeSelector from '../drone-selector/DroneTypeSelector';

const MissionPlanningScreen = ({ onStartMission }) => {
  const { startMission, missionStatus, resetMission } = useMissionStore();
  const { setBattery } = useUAVStore();

  const [selectedMode, setSelectedMode] = useState('surveillance');
  const [missionDuration, setMissionDuration] = useState(120);
  const [weaponConfig, setWeaponConfig] = useState({
    missiles: 6,
    bombs: 3
  });

  const handleModeChange = (newMode) => {
    if (newMode !== null) {
      setSelectedMode(newMode);
      console.log('[MissionPlanningScreen] Mode changed to:', newMode);
    }
  };

  const handleStartMission = () => {
    console.log('[MissionPlanningScreen] Starting mission with:', {
      mode: selectedMode,
      duration: missionDuration,
      weaponConfig
    });

    setBattery(100);
    resetMission();
    
    startMission(selectedMode, missionDuration);

    if (onStartMission) {
      onStartMission({
        mode: selectedMode,
        objective: selectedMode,
        duration: missionDuration,
        weaponConfig: weaponConfig
      });
    }
  };

  const handleDurationChange = (event, newValue) => {
    setMissionDuration(newValue);
  };

  const handleWeaponChange = (weapon, value) => {
    setWeaponConfig(prev => ({
      ...prev,
      [weapon]: value
    }));
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4, bgcolor: 'rgba(10, 14, 39, 0.95)', color: 'white' }}>
        <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4, color: '#00d4ff' }}>
           UAV Mission Planning
        </Typography>

        {/* ✅ ONLY ONE Mode Selector */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ color: '#00d4ff' }}>
             Select UAV Mode
          </Typography>
          <DroneTypeSelector 
            value={selectedMode} 
            onChange={handleModeChange}
            isInMissionExecution={false}
          />
          
          {selectedMode === 'surveillance' && (
            <Typography variant="body2" color="rgba(255,255,255,0.7)" sx={{ mt: 2 }}>
              Surveillance mode: Detect and monitor targets without engagement
            </Typography>
          )}
          {selectedMode === 'attack' && (
            <Typography variant="body2" color="rgba(255,255,255,0.7)" sx={{ mt: 2 }}>
              Attack mode: Engage and destroy detected targets
            </Typography>
          )}
        </Box>

        {/* Mission Duration */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ color: '#00d4ff' }}>
            Mission Duration
          </Typography>
          <Box sx={{ px: 2 }}>
            <Slider
              value={missionDuration}
              onChange={handleDurationChange}
              min={60}
              max={300}
              step={30}
              marks={[
                { value: 60, label: '1m' },
                { value: 120, label: '2m' },
                { value: 180, label: '3m' },
                { value: 240, label: '4m' },
                { value: 300, label: '5m' },
              ]}
              valueLabelDisplay="on"
              valueLabelFormat={(value) => `${Math.floor(value / 60)}:${(value % 60).toString().padStart(2, '0')}`}
              sx={{
                color: '#00d4ff',
                '& .MuiSlider-markLabel': {
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: '11px'
                },
                '& .MuiSlider-thumb': {
                  bgcolor: '#00d4ff',
                  boxShadow: '0 0 10px rgba(0, 212, 255, 0.5)'
                }
              }}
            />
          </Box>
          <Typography variant="body2" color="rgba(255,255,255,0.7)" align="center" sx={{ mt: 1 }}>
            Selected duration: {Math.floor(missionDuration / 60)} minutes {missionDuration % 60} seconds
          </Typography>
        </Box>

        {/* Weapon Configuration (Only for Attack mode) */}
        {selectedMode === 'attack' && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#ff5252' }}>
              Weapon Configuration
            </Typography>
            <Paper elevation={1} sx={{ p: 2, bgcolor: 'rgba(232, 189, 189, 0.05)' }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom color="white">
                  Missiles: {weaponConfig.missiles}
                </Typography>
                <Slider
                  value={weaponConfig.missiles}
                  onChange={(e, val) => handleWeaponChange('missiles', val)}
                  min={0}
                  max={10}
                  step={1}
                  marks
                  valueLabelDisplay="auto"
                  sx={{ color: '#ff5252' }}
                />
              </Box>
              <Box>
                <Typography variant="subtitle2" gutterBottom color="white">
                  Bombs: {weaponConfig.bombs}
                </Typography>
                <Slider
                  value={weaponConfig.bombs}
                  onChange={(e, val) => handleWeaponChange('bombs', val)}
                  min={0}
                  max={6}
                  step={1}
                  marks
                  valueLabelDisplay="auto"
                  sx={{ color: '#ff5252' }}
                />
              </Box>
            </Paper>
          </Box>
        )}

        {/* Mission Summary */}
        <Paper elevation={2} sx={{ p: 2, mb: 3, bgcolor: 'rgba(255,255,255,0.05)' }}>
          <Typography variant="h6" gutterBottom color="white">
            Mission Summary
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Chip 
              label={`Mode: ${selectedMode.toUpperCase()}`} 
              sx={{ 
                bgcolor: selectedMode === 'surveillance' ? 'rgba(0, 212, 255, 0.2)' : 'rgba(255, 82, 82, 0.2)',
                color: selectedMode === 'surveillance' ? '#00d4ff' : '#ff5252',
                border: `1px solid ${selectedMode === 'surveillance' ? '#00d4ff' : '#ff5252'}`
              }}
            />
            <Chip 
              label={`Duration: ${Math.floor(missionDuration / 60)}:${(missionDuration % 60).toString().padStart(2, '0')}`}
              sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white' }}
            />
            {selectedMode === 'attack' && (
              <>
                <Chip 
                  label={`Missiles: ${weaponConfig.missiles}`}
                  sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
                />
                <Chip 
                  label={`Bombs: ${weaponConfig.bombs}`}
                  sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
                />
              </>
            )}
          </Box>
        </Paper>

        {/* Start Mission Button */}
        <Button
          variant="contained"
          size="large"
          fullWidth
          startIcon={<PlayArrowIcon />}
          onClick={handleStartMission}
          sx={{ 
            py: 2, 
            fontSize: '1.2rem',
            background: '#00d4ff',
            color: '#0a0e27',
            fontWeight: 'bold',
            boxShadow: '0 8px 24px rgba(0, 212, 255, 0.4)',
            '&:hover': {
              background: '#00b8e6',
              boxShadow: '0 12px 32px rgba(0, 212, 255, 0.6)',
              transform: 'translateY(-2px)'
            },
            transition: 'all 0.3s ease'
          }}
        >
          START MISSION
        </Button>
      </Paper>
    </Container>
  );
};

export default MissionPlanningScreen;