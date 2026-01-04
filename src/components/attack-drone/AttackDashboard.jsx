import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Button, Badge, Chip, Stack, LinearProgress, Divider, Alert, TextField, Grid, Slider } from '@mui/material';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import FlightLandIcon from '@mui/icons-material/FlightLand';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import MissileIcon from '@mui/icons-material/RocketLaunch';
import HomeIcon from '@mui/icons-material/Home';
import WarningIcon from '@mui/icons-material/Warning';
import SecurityIcon from '@mui/icons-material/Security';
import BlockIcon from '@mui/icons-material/Block';
import { useUAVStore } from '../../store/uavStore';
import { useAttackDroneStore } from '../../store/attackDroneStore';
import { useTargetStore } from '../../store/targetStore';
import { useMissionStore } from '../../store/missionStore';
import DamageAssessment from './DamageAssessment';
import LockOnProgress from './LockOnProgress';

// Constants for defense system
const RADAR_RADIUS = 50;
const MIN_SAFE_ALTITUDE = 20;

const AttackDashboard = () => {
  const { position, setPosition, setTargetPosition, targets } = useUAVStore();
  const { 
    missionState, beginMission, returnToBase, fireMissile, 
    targeting, beginTargetLock, targetingJammed, selectedWeapon, 
    ammoCount, setDroneDamage, droneHealth, communicationsJammed,
    attackPosition, homeBase, setWeaponConfig
  } = useAttackDroneStore();

  const { 
    missionStatus: currentMissionStatus,
    missionTimeRemaining, 
    missionDuration,
    missionType 
  } = useMissionStore();

  const [coordinates, setCoordinates] = useState({ x: '', y: '', z: '' });
  const [isDefenseSystemDetected, setIsDefenseSystemDetected] = useState(false);
  const [altitudeSlider, setAltitudeSlider] = useState(position ? position[1] : 35);
  const [firingError, setFiringError] = useState(null);

  useEffect(() => {
    if (position && position[1] !== altitudeSlider) {
      setAltitudeSlider(position[1]);
    }
  }, [position]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!position) return;
    const warehousePos = [40, 20, 35];
    const distance = Math.sqrt(
      Math.pow(warehousePos[0] - position[0], 2) +
      Math.pow(warehousePos[2] - position[2], 2)
    );
    const uavAltitude = position[1];
    const detected = distance < RADAR_RADIUS && uavAltitude > MIN_SAFE_ALTITUDE;
    setIsDefenseSystemDetected(detected);
  }, [position]);

  const handleCoordinateSubmit = () => {
    const rawX = parseFloat(coordinates.x);
    const rawY = parseFloat(coordinates.y);
    const rawZ = parseFloat(coordinates.z);

    if (isNaN(rawX) || isNaN(rawY) || isNaN(rawZ)) {
      console.warn("Invalid coordinate values. Please enter numbers.");
      return;
    }

    const x = Math.min(Math.max(rawX, -50), 50);
    const y = Math.min(Math.max(rawY, 10), 100);
    const z = Math.min(Math.max(rawZ, -50), 50);

    setCoordinates({
      x: x.toString(),
      y: y.toString(),
      z: z.toString()
    });

    useAttackDroneStore.getState().moveToPosition([x, y, z]);
    console.log("UAV moving to position:", [x, y, z]);
  };

  const handleSelectTarget = (targetId) => {
    console.log("Attempting to lock on target:", targetId, {
      missionState,
      targetingJammed,
      currentLock: targeting.lockedTarget
    });
    
    if (targetingJammed) {
      console.log("Cannot select target - targeting systems jammed");
      return;
    }

    // Begin target lock process
    beginTargetLock(targetId);
  };

  const calculateDistance = (targetPosition) => {
    if (!targetPosition || !position || targetPosition.length < 3 || position.length < 3) {
      return 0;
    }
    return Math.sqrt(
      Math.pow(targetPosition[0] - position[0], 2) +
      Math.pow(targetPosition[1] - position[1], 2) +
      Math.pow(targetPosition[2] - position[2], 2)
    ).toFixed(2);
  };
  
  const handleCoordinateChange = (axis, value) => {
    setCoordinates({
      ...coordinates,
      [axis]: value
    });
  };
  
  const handleCoordinateBlur = (axis) => {
    const value = coordinates[axis];
    if (value === '' || value === '-') return;
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;
    
    let validatedValue;
    switch(axis) {
      case 'x':
      case 'z':
        validatedValue = Math.min(Math.max(numValue, -50), 50);
        break;
      case 'y':
        validatedValue = Math.min(Math.max(numValue, 10), 100);
        break;
      default:
        validatedValue = numValue;
    }
    
    if (validatedValue !== numValue) {
      setCoordinates(prev => ({
        ...prev,
        [axis]: validatedValue.toString()
      }));
    }
  };
  
  const getMissionStatusInfo = () => {
    switch(missionState) {
      case 'moving':
        return {
          label: 'MOVING TO ATTACK POSITION',
          color: '#ff9800',
          icon: <FlightTakeoffIcon />,
          description: 'Flying to optimal attack position'
        };
      case 'attacking':
        return {
          label: 'ATTACK POSITION REACHED',
          color: '#f44336',
          icon: <MissileIcon />,
          description: 'Ready to engage target'
        };
      case 'returning':
        return {
          label: 'RETURNING TO BASE',
          color: '#2196f3',
          icon: <FlightLandIcon />,
          description: 'Mission complete, returning home'
        };
      case 'crashed':
        return {
          label: 'DRONE CRASHED',
          color: '#d32f2f',
          icon: <WarningIcon />,
          description: 'UAV destroyed by defense systems'
        };
      default:
        return {
          label: 'STANDBY',
          color: '#757575',
          icon: <HomeIcon />,
          description: 'Ready for mission assignment'
        };
    }
  };
  
  const missionStatus = getMissionStatusInfo();
  
  const handleAntiDroneAttack = () => {
    console.log('[AttackDashboard] Defense button pressed!');
    
    if (isDefenseSystemDetected) {
      console.log("[AttackDashboard] Defense system activated - UAV shot down!");
      
      // Set crashed state in attack drone store
      useAttackDroneStore.setState({ missionState: 'crashed' });
      
      // Set crashed state in UAV store
      useUAVStore.getState().setCrashed(true, 'Shot down by anti-drone defense system');
      
      // Set drone damage for visual effects
      useAttackDroneStore.getState().setDroneDamage({
        type: 'defense_system',
        damage: 100,
        duration: 5000
      });
      
      console.log("[AttackDashboard] UAV crashed successfully!");
    } else {
      console.log("[AttackDashboard] Cannot activate defense system - UAV not detected or below safe altitude");
    }
  };
  
  // ✅ FIX #2: Get both detectedTargets AND completedTargets
  const detectedTargets = useTargetStore(state => state.detectedTargets || []);
  const completedTargets = useTargetStore(state => state.completedTargets || {});
  
  // ✅ FIX #2: Show targets that are either detected OR completed in surveillance
  const availableTargets = targets.filter(target => {
    // Check if in detected targets list
    const isDetected = detectedTargets.some(detected => 
      detected.id === target.id || 
      (Math.abs(detected.position[0] - target.position[0]) < 2 && 
       Math.abs(detected.position[2] - target.position[2]) < 2)
    );
    
    // Check if completed in surveillance (means it was scanned)
    const isCompleted = completedTargets[target.type] && completedTargets[target.type] > 0;
    
    // Show target if either detected or completed
    return isDetected || isCompleted;
  });
  
  console.log('[AttackDashboard] Available targets:', {
    totalTargets: targets.length,
    detectedTargets: detectedTargets.length,
    completedTargets,
    availableTargets: availableTargets.length,
    targetsList: availableTargets.map(t => ({ id: t.id, type: t.type }))
  });
  
  const handleAltitudeChange = (event, newValue) => {
    setAltitudeSlider(newValue);
    setPosition([position[0], newValue, position[2]]);
    setTargetPosition(null);
  };

  const handleAltitudeChangeCommitted = (event, newValue) => {
    setPosition([position[0], newValue, position[2]]);
    setAltitudeSlider(newValue);
  };
  
  const targetingData = {
    selectedTarget: targeting?.lockedTarget 
      ? targets.find(t => t.id === targeting.lockedTarget)
      : null,
    lockStatus: targeting?.lockStatus || 'inactive',
    lockProgress: targeting?.lockTimer / (targeting?.maxLockTime || 1)
  };

  const checkFiringConditions = () => {
    if (!targeting.lockedTarget || !availableTargets.length) return null;
    
    const target = availableTargets.find(t => t.id === targeting.lockedTarget);
    if (!target) return null;
    
    const distanceToTarget = Math.sqrt(
      Math.pow(position[0] - target.position[0], 2) +
      Math.pow(position[2] - target.position[2], 2)
    );
    
    if (selectedWeapon === 'bomb') {
      if (distanceToTarget > 10) {
        return {
          canFire: false,
          error: "Position UAV directly above target to drop bombs",
          requiredDistance: 10,
          currentDistance: distanceToTarget.toFixed(1)
        };
      }
      
      const altitudeDifference = Math.abs(position[1] - target.position[1]);
      if (altitudeDifference < 15) {
        return {
          canFire: false,
          error: "Gain altitude above target for safe bomb deployment",
          requiredAltitude: "15m above target",
          currentAltitude: altitudeDifference.toFixed(1) + "m"
        };
      }
    } else if (selectedWeapon === 'missile') {
      if (distanceToTarget > 20) {
        return {
          canFire: false,
          error: "Move within 20 meters of target for missile engagement",
          requiredDistance: 20,
          currentDistance: distanceToTarget.toFixed(1)
        };
      }
    }
    
    return { canFire: true };
  };

  const firingCondition = checkFiringConditions();

  return (
    <Paper sx={{ p: 2, m: 2, maxWidth: 400 }}>
      <Typography variant="h6" gutterBottom>
        Attack Drone Command
      </Typography>
      
      {(currentMissionStatus === 'active' || missionTimeRemaining > 0) && (
        <Paper 
          elevation={2} 
          sx={{ 
            mb: 2, 
            p: 2, 
            backgroundColor: 'rgba(0,0,0,0.8)', 
            borderRadius: 2,
            border: '1px solid rgba(255,69,0,0.3)',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="subtitle1" component="div" sx={{ fontWeight: 'bold', color: 'white' }}>
                <Box component="span" sx={{ color: '#ff4500', mr: 1 }}>⚡</Box>
                {missionType === 'surveillance' ? 'Surveillance & Attack' : 'Attack Mission'}
              </Typography>
            </Box>
            <Chip 
              label={currentMissionStatus === 'active' ? 'ACTIVE' : 'STANDBY'} 
              size="small" 
              sx={{ 
                bgcolor: currentMissionStatus === 'active' ? 'error.main' : 'warning.main',
                color: 'white',
                fontWeight: 'bold'
              }} 
            />
          </Box>
          
          <Box sx={{ mb: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2" sx={{ color: '#ccc' }}>Mission Time</Typography>
              <Typography variant="body2" sx={{ color: missionTimeRemaining < 20 ? '#ff3d00' : '#ff4500', fontWeight: 'bold' }}>
                {formatTime(missionTimeRemaining)} remaining
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={missionDuration > 0 ? (missionTimeRemaining / missionDuration) * 100 : 0}
              sx={{ 
                height: 8, 
                borderRadius: 1,
                backgroundColor: 'rgba(0,0,0,0.3)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: missionTimeRemaining < 20 ? '#ff3d00' : '#ff4500'
                }
              }} 
            />
          </Box>
        </Paper>
      )}
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          UAV Position Controls
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <TextField
              label="X"
              type="number"
              value={coordinates.x}
              onChange={(e) => handleCoordinateChange('x', e.target.value)}
              onBlur={() => handleCoordinateBlur('x')}
              size="small"
              fullWidth
              placeholder="X (-50 to 50)"
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              label="Y"
              type="number"
              value={coordinates.y}
              onChange={(e) => handleCoordinateChange('y', e.target.value)}
              onBlur={() => handleCoordinateBlur('y')}
              size="small"
              fullWidth
              placeholder="Y (10 to 100)"
              helperText={parseFloat(coordinates.y) < MIN_SAFE_ALTITUDE ? "Stealth" : ""}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              label="Z"
              type="number"
              value={coordinates.z}
              onChange={(e) => handleCoordinateChange('z', e.target.value)}
              onBlur={() => handleCoordinateBlur('z')}
              size="small"
              fullWidth
              placeholder="Z (-50 to 50)"
            />
          </Grid>
          <Grid item xs={12}>
            <Button 
              variant="contained" 
              onClick={handleCoordinateSubmit} 
              fullWidth
              disabled={missionState !== 'idle'}
            >
              Set Position
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="caption" color="text.secondary">
              Current: {position ? `[${position.map(n => Math.floor(n)).join(', ')}]` : 'Unknown'}
              {position && position[1] < MIN_SAFE_ALTITUDE && (
                <Chip
                  label="STEALTH MODE"
                  size="small"
                  color="success"
                  sx={{ ml: 1, height: 20 }}
                />
              )}
            </Typography>
          </Grid>
        </Grid>
      </Box>
      
      <Box sx={{ mb: 3, p: 1, bgcolor: 'rgba(0,0,0,0.1)', borderRadius: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box sx={{ mr: 1, color: missionStatus.color }}>{missionStatus.icon}</Box>
          <Typography variant="subtitle1" color={missionStatus.color} fontWeight="bold">
            {missionStatus.label}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {missionStatus.description}
        </Typography>
        
        <Box sx={{ mt: 1, fontSize: '0.75rem', color: 'text.secondary' }}>
          <div>Current: {position ? `[${position.map(n => Math.floor(n)).join(', ')}]` : 'Unknown'}</div>
          {missionState === 'moving' && attackPosition && (
            <div>Target: [{attackPosition.map(n => Math.floor(n)).join(', ')}]</div>
          )}
          {missionState === 'returning' && homeBase && (
            <div>Base: [{homeBase.map(n => Math.floor(n)).join(', ')}]</div>
          )}
        </Box>
        
        {(missionState === 'attacking' || missionState === 'moving') && (
          <Button 
            variant="outlined" 
            size="small"
            startIcon={<HomeIcon />}
            onClick={returnToBase}
            sx={{ mt: 1 }}
          >
            Return To Base
          </Button>
        )}
      </Box>

      {/* ✅ RESTORED: Target Selection Section */}
      <Paper elevation={3} sx={{ p: 2, mb: 2, bgcolor: 'rgba(0,0,0,0.8)', border: '1px solid #444' }}>
        <Typography variant="h6" gutterBottom sx={{ color: '#ff9800' }}>
          🎯 Target Selection
        </Typography>
        
        {targeting.lockStatus !== 'inactive' && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ color: 'white' }}>Lock Status:</Typography>
            <LockOnProgress 
              status={targeting.lockStatus} 
              progress={targeting.lockTimer / targeting.maxLockTime} 
            />
          </Box>
        )}
        
        <Typography variant="subtitle2" gutterBottom sx={{ color: 'white' }}>
          Available Targets: ({availableTargets.length})
        </Typography>
        
        {Array.isArray(availableTargets) && availableTargets.length > 0 ? (
          <Stack spacing={1}>
            {availableTargets.map((target) => (
              <Paper
                key={target.id}
                elevation={2}
                sx={{
                  p: 1.5,
                  backgroundColor: targeting.lockedTarget === target.id ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255,255,255,0.05)',
                  border: targeting.lockedTarget === target.id ? '2px solid #4caf50' : '1px solid rgba(255,255,255,0.1)',
                  cursor: !targetingJammed ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s',
                  '&:hover': {
                    backgroundColor: !targetingJammed ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
                    borderColor: !targetingJammed ? '#ff9800' : 'rgba(255,255,255,0.1)'
                  }
                }}
                onClick={() => !targetingJammed && handleSelectTarget(target.id)}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'white' }}>
                    {target.type && typeof target.type === 'string' 
                      ? target.type.charAt(0).toUpperCase() + target.type.slice(1) 
                      : 'Unknown'}
                  </Typography>
                  <Chip
                    label={targeting.lockedTarget === target.id ? '🔒 LOCKED' : '🎯 SELECT'}
                    size="small"
                    color={targeting.lockedTarget === target.id ? 'success' : 'warning'}
                    sx={{
                      fontWeight: 'bold',
                      cursor: !targetingJammed ? 'pointer' : 'not-allowed'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!targetingJammed) {
                        handleSelectTarget(target.id);
                      }
                    }}
                  />
                </Box>
                <Typography variant="caption" sx={{ color: '#ccc' }}>
                  Distance: {calculateDistance(target.position)} m
                </Typography>
              </Paper>
            ))}
          </Stack>
        ) : (
          <Alert severity="info" sx={{ mt: 1 }}>
            No targets detected in range. Complete surveillance first.
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              Detected: {detectedTargets.length} | Completed: {Object.keys(completedTargets).length}
            </Typography>
          </Alert>
        )}
      </Paper>

      {/* Weapons System */}
      <Paper elevation={3} sx={{ p: 2, mb: 2, bgcolor: 'rgba(0,0,0,0.8)', border: '1px solid #444' }}>
        <Typography variant="h6" gutterBottom sx={{ color: '#f44336' }}>
          🚀 Weapon Systems
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ color: 'white', mb: 1 }}>Selected Weapon:</Typography>
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <Button
                fullWidth
                variant={selectedWeapon === 'missile' ? 'contained' : 'outlined'}
                color={selectedWeapon === 'missile' ? 'error' : 'inherit'}
                size="small"
                onClick={() => setWeaponConfig({ selectedWeapon: 'missile' })}
                disabled={ammoCount.missile <= 0}
              >
                Missile ({ammoCount.missile})
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                fullWidth
                variant={selectedWeapon === 'bomb' ? 'contained' : 'outlined'}
                color={selectedWeapon === 'bomb' ? 'error' : 'inherit'}
                size="small"
                onClick={() => setWeaponConfig({ selectedWeapon: 'bomb' })}
                disabled={ammoCount.bomb <= 0}
              >
                Bomb ({ammoCount.bomb})
              </Button>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Button
            fullWidth
            variant="contained"
            color="error"
            size="large"
            startIcon={<MissileIcon />}
            onClick={() => {
              const result = fireMissile();
              if (result && !result.success) {
                setFiringError(result.error);
                setTimeout(() => setFiringError(null), 5000);
              } else {
                setFiringError(null);
              }
            }}
            disabled={
              missionState !== 'attacking' ||
              targeting.lockStatus !== 'locked' ||
              ammoCount[selectedWeapon] <= 0 ||
              targetingJammed ||
              (firingCondition && !firingCondition.canFire)
            }
            sx={{
              fontSize: '1.2rem',
              fontWeight: 'bold',
              py: 2
            }}
          >
            🚀 FIRE {selectedWeapon.toUpperCase()}
          </Button>
          
          {firingCondition && !firingCondition.canFire && (
            <Alert severity="warning" sx={{ mt: 1 }}>
              <Typography variant="body2">
                <strong>{selectedWeapon === 'bomb' ? '💣 Bomb Deployment:' : '🚀 Missile Engagement:'}</strong>
              </Typography>
              <Typography variant="body2">
                {firingCondition.error}
              </Typography>
              <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                Required distance: ≤{firingCondition.requiredDistance}m | Current: {firingCondition.currentDistance}m
              </Typography>
            </Alert>
          )}
          
          {firingError && (
            <Alert severity="error" sx={{ mt: 1 }}>
              <Typography variant="body2">
                {firingError}
              </Typography>
            </Alert>
          )}
        </Box>
        
        <Paper sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.1)', border: '1px solid #555' }}>
          <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 'bold', mb: 1 }}>
            🎯 FIRING STATUS:
          </Typography>
          <Stack spacing={0.5}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" sx={{ color: '#ccc' }}>Mission State:</Typography>
              <Chip 
                label={missionState.toUpperCase()} 
                size="small" 
                color={missionState === 'attacking' ? 'success' : 'default'}
              />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" sx={{ color: '#ccc' }}>Target Lock:</Typography>
              <Chip 
                label={targeting.lockStatus.toUpperCase()} 
                size="small" 
                color={targeting.lockStatus === 'locked' ? 'success' : targeting.lockStatus === 'locking' ? 'warning' : 'default'}
              />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" sx={{ color: '#ccc' }}>Ammo ({selectedWeapon}):</Typography>
              <Chip 
                label={`${ammoCount[selectedWeapon]} remaining`} 
                size="small" 
                color={ammoCount[selectedWeapon] > 0 ? 'success' : 'error'}
              />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" sx={{ color: '#ccc' }}>Systems:</Typography>
              <Chip 
                label={targetingJammed ? 'JAMMED' : 'ONLINE'} 
                size="small" 
                color={targetingJammed ? 'error' : 'success'}
              />
            </Box>
          </Stack>
        </Paper>
      </Paper>

      <DamageAssessment />

      {isDefenseSystemDetected && (
        <Box sx={{
          mb: 2,
          p: 1,
          bgcolor: 'rgba(255,0,0,0.15)',
          borderRadius: 1,
          border: '1px solid #f44336'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <WarningIcon color="error" sx={{ mr: 1 }} />
            <Typography variant="subtitle1" color="error" fontWeight="bold">
              DEFENSE SYSTEM DETECTED
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Anti-aircraft defenses operational. Fly below {MIN_SAFE_ALTITUDE}m altitude to avoid detection.
          </Typography>
          {droneHealth < 100 && (
            <LinearProgress
              variant="determinate"
              value={droneHealth}
              sx={{
                mt: 1,
                height: 10,
                borderRadius: 1,
                backgroundColor: 'rgba(255,255,255,0.2)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: droneHealth > 70 ? '#4caf50' :
                    droneHealth > 30 ? '#ff9800' : '#f44336'
                }
              }}
            />
          )}

          <Button
            variant="contained"
            color="error"
            fullWidth
            sx={{ mt: 1 }}
            onClick={handleAntiDroneAttack}
          >
            ACTIVATE DEFENSE SYSTEM
          </Button>
        </Box>
      )}

      {communicationsJammed && (
        <Alert
          severity="error"
          icon={<BlockIcon />}
          sx={{ mb: 2 }}
        >
          COMMUNICATIONS JAMMED - Control systems impaired
        </Alert>
      )}

      {targetingJammed && (
        <Alert
          severity="error"
          icon={<BlockIcon />}
          sx={{ mb: 2 }}
        >
          TARGETING SYSTEMS JAMMED - Weapons systems offline
        </Alert>
      )}

      <Paper elevation={3} sx={{ p: 2, mb: 2, bgcolor: 'rgba(0,0,0,0.8)', border: '1px solid #444' }}>
        <Typography variant="h6" gutterBottom sx={{ color: '#ff9800' }}>
          ⛰️ Attack Altitude Control
        </Typography>
        
        <Typography variant="body2" sx={{ color: 'white' }} gutterBottom>
          Current Altitude: {Math.floor(position[1])}m
        </Typography>
        
        <Box sx={{ px: 1, py: 2 }}>
          <Slider
            value={altitudeSlider}
            onChange={handleAltitudeChange}
            onChangeCommitted={handleAltitudeChangeCommitted}
            min={10}
            max={100}
            step={1}
            marks={[
              { value: 10, label: '10m' },
              { value: 20, label: 'th' },
              { value: 50, label: '50m' },
              { value: 100, label: '100m' }
            ]}
            valueLabelDisplay="on"
            valueLabelFormat={(value) => `${value}m`}
            sx={{
              color: droneHealth < 50 ? 'error.main' : '#ff9800',
              '& .MuiSlider-thumb': {
                backgroundColor: droneHealth < 50 ? 'error.main' : '#ff9800'
              },
              '& .MuiSlider-track': {
                backgroundColor: droneHealth < 50 ? 'error.main' : '#ff9800'
              },
              '& .MuiSlider-markLabel': {
                color: '#ccc',
                fontSize: '0.7rem',
                whiteSpace: 'nowrap'
              }
            }}
          />
        </Box>
        
        <Typography variant="caption" display="block" sx={{ mt: 1, color: '#aaa' }}>
          Higher altitude (35-50m) reduces detection by defenses but decreases weapon accuracy
        </Typography>
        <Typography variant="caption" display="block" sx={{ color: '#aaa' }}>
          Lower altitude (15-25m) increases weapon accuracy but increases detection risk
        </Typography>
      </Paper>
    </Paper>
  );
};

export default AttackDashboard;