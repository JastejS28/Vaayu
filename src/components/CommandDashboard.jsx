import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Box, Paper, Typography, Button, TextField, Chip, 
  Switch, FormControlLabel, Alert, Slider, Modal
} from '@mui/material';
import { useUAVStore } from '../store/uavStore';
import { useMissionStore } from '../store/missionStore';
import ClickControlPanel from './ClickControlPanel';
import { useClickControlStore } from '../store/clickControlStore';
import MissionHUD from './mission/MissionHUD';
import MissionPlanningScreen from './mission/MissionPlanningScreen';
import MissionResultsScreen from './mission/MissionResultsScreen';
import { useTargetStore } from '../store/targetStore';
import { useHoverState } from '../hooks/useHoverState';
import BatteryIndicator from './BatteryIndicator';
import WindGustIndicator from './WindGustIndicator';

const CommandDashboard = () => {
  // Extract all store values at the component top level
  // This prevents repeated selector calls in the render function
  const { 
    position, rotation, setTargetPosition, isThermalVision, 
    setThermalVision, isCrashed, crashMessage, setPosition, targetPosition,
    droneType, battery // Add battery to extract battery level
  } = useUAVStore();
  
  const { 
    missionStatus, 
    startMission, 
    completeMission,
    resetMission,
    objectives,
    isHovering,
    currentTarget,
    missionFailReason
  } = useMissionStore();
  
  const { clickMode, toggleMoveMode } = useClickControlStore();
  
  // Get hover state from the custom hook once
  const hoverState = useHoverState();
  
  // Get target information from the store once
  const currentlyScanning = useTargetStore(state => state.currentlyScanning);
  const completedTargets = useTargetStore(state => state.completedTargets);
  
  // Calculate total targets completed
  const totalTargetsCompleted = typeof completedTargets === 'object' && completedTargets !== null
    ? Object.values(completedTargets).reduce((sum, count) => sum + (typeof count === 'number' ? count : 0), 0)
    : 0;
  
  // Component state
  const [coordinates, setCoordinates] = useState({ x: '', y: '', z: '' });
  const [altitudeSlider, setAltitudeSlider] = useState(position ? position[1] : 30);
  const isUpdatingFromSlider = useRef(false);
  const lastPositionY = useRef(position ? position[1] : 30);
  const lastUpdateTime = useRef(Date.now());
  
  // Check if UAV is currently moving
  const isMoving = targetPosition && Array.isArray(targetPosition);

  // Update slider when position changes - with throttling to prevent loops
  useEffect(() => {
    if (!position) return; // Safety check

    const now = Date.now();
    // Throttle updates to prevent infinite loops
    if (!isUpdatingFromSlider.current && now - lastUpdateTime.current > 100) {
      const currentY = position[1];
      const positionDiff = Math.abs(currentY - lastPositionY.current);
      
      // Only update if there's a significant change
      if (positionDiff > 0.5) {
        setAltitudeSlider(currentY);
        lastPositionY.current = currentY;
        lastUpdateTime.current = now;
      }
    }
  }, [position]); // Only depend on position

  const handleMovement = useCallback(() => {
    if (isCrashed) {
      alert('UAV is permanently crashed! Mission terminated.');
      return;
    }
    
    if (battery <= 0) {
      alert('Battery depleted! UAV has lost power.');
      return;
    }
    
    const x = parseFloat(coordinates.x) || position[0];
    const y = parseFloat(coordinates.y) || position[1];
    const z = parseFloat(coordinates.z) || position[2];
    
    const limitedY = Math.min(Math.max(y, 10), 50);
    
    const targetPos = [x, limitedY, z];
    console.log('UAV moving to position:', targetPos);
    
    setCoordinates({ x: '', y: '', z: '' });
    setTargetPosition(targetPos);
  }, [coordinates, position, setTargetPosition, isCrashed, battery]);

  const handleCoordinateChange = useCallback((axis, value) => {
    setCoordinates(prev => ({ ...prev, [axis]: value }));
  }, []);

  const handleAltitudeChange = (event, newValue) => {
    isUpdatingFromSlider.current = true;
    setAltitudeSlider(newValue);
    lastPositionY.current = newValue;
    
    const newPosition = [position[0], newValue, position[2]];
    setPosition(newPosition);
    
    if (isMoving && targetPosition) {
      const newTarget = [targetPosition[0], newValue, targetPosition[2]];
      setTargetPosition(newTarget);
    }
    
    // Use RAF instead of setTimeout for smoother updates
    requestAnimationFrame(() => {
      isUpdatingFromSlider.current = false;
    });
  };

  const handleAltitudeChangeCommitted = () => {
    // Additional logic if needed when slider change is committed
    console.log("Altitude change committed:", altitudeSlider);
  };

  // Render mission planning or results as modal overlays instead of early returns
  const renderMissionOverlay = () => {
    if (missionStatus === 'planning') {
      return (
        <Modal 
          open={true} 
          disableEscapeKeyDown
          disableAutoFocus
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Paper sx={{ 
            width: '90%', 
            maxWidth: '600px', 
            maxHeight: '90vh',
            overflow: 'auto',
            p: 3
          }}>
            <MissionPlanningScreen onStartMission={startMission} />
          </Paper>
        </Modal>
      );
    }
    
    if (missionStatus === 'completed' || missionStatus === 'failed') {
      return (
        <Modal 
          open={true}
          disableEscapeKeyDown
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Paper sx={{ 
            width: '90%', 
            maxWidth: '600px',
            p: 3
          }}>
            <MissionResultsScreen 
              onRestart={() => startMission()}
              onNewMission={() => resetMission()}
            />
          </Paper>
        </Modal>
      );
    }
    
    return null;
  };

  // Render the current scanning status section
  const renderScanningStatus = () => {
    if (!currentlyScanning) return null;
    
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ 
            width: 24, 
            height: 24, 
            borderRadius: '50%', 
            bgcolor: 'primary.main',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            animation: 'pulse 1.5s infinite'
          }}>
            <span role="img" aria-label="scanning">🔍</span>
          </Box>
          <Typography>
            Currently scanning: <strong>{currentlyScanning.type.charAt(0).toUpperCase() + currentlyScanning.type.slice(1)}</strong>
          </Typography>
        </Box>
        <Typography variant="caption">
          Hover complete: {Math.min(100, Math.round(hoverState.hoverProgress * 100))}%
        </Typography>
        <Box sx={{ 
          mt: 1, 
          height: 4, 
          bgcolor: 'rgba(255,255,255,0.2)',
          borderRadius: 5,
          overflow: 'hidden'
        }}>
          <Box sx={{ 
            height: '100%', 
            width: `${Math.min(100, Math.round(hoverState.hoverProgress * 100))}%`,
            bgcolor: 'primary.main',
            borderRadius: 5
          }} />
        </Box>
      </Alert>
    );
  };

  // Render the completed targets section
  const renderCompletedTargets = () => {
    if (!completedTargets || Object.keys(completedTargets).filter(key => completedTargets[key] > 0).length === 0) {
      return (
        <Typography variant="body2" color="text.secondary">
          {isCrashed ? 'UAV crashed - mission terminated' : 'No targets surveilled yet. Hover over detected objects to complete surveillance.'}
        </Typography>
      );
    }

    // Use the targetStore directly to get details about detected targets
    const detectedTargets = useTargetStore.getState().detectedTargets || [];
    
    return detectedTargets.map((target, index) => (
      <Paper key={index} sx={{ 
        p: 1, 
        mb: 1, 
        bgcolor: 
          target.type === 'tank' ? '#ffebee' : 
          target.type === 'jeep' ? '#e8f5e9' : 
          target.type === 'warehouse' ? '#fff3e0' : 
          target.type === 'soldier' ? '#f3e5f5' : '#e3f2fd',
        color: '#000'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#000' }}>
            {target.type.charAt(0).toUpperCase() + target.type.slice(1)}
          </Typography>
          <Chip 
            label={target.type === 'tank' || target.type === 'jeep' ? 'Vehicle' : 
                  target.type === 'warehouse' ? 'Structure' : 
                  target.type === 'soldier' ? 'Personnel' : 'Unknown'} 
            size="small" 
            sx={{ color: '#000', borderColor: '#000' }}
            variant="outlined"
          />
        </Box>
        <Typography variant="caption" sx={{ color: '#666' }}>
          Position: ({target.position[0].toFixed(1)}, {target.position[1].toFixed(1)}, {target.position[2].toFixed(1)})
        </Typography>
        <br />
        <Typography variant="caption" sx={{ color: '#666' }}>
          Distance: {position ? Math.sqrt(
            Math.pow(target.position[0] - position[0], 2) +
            Math.pow(target.position[1] - position[1], 2) +
            Math.pow(target.position[2] - position[2], 2)
          ).toFixed(2) : "N/A"} units
        </Typography>
      </Paper>
    ));
  };

  // Fix the title to properly show surveillance or attack:
  const missionType = useMissionStore(state => state.missionParameters?.missionType || 'surveillance');

  return (
    <Box sx={{ p: 2, position: 'relative' }}>
      {/* Show Mission Planning or Results as overlays */}
      {renderMissionOverlay()}
      
      {/* Show Mission HUD for active missions */}
      {missionStatus === 'active' && <MissionHUD />}

      {/* Wind Gust Indicator - Show during active missions */}
      {missionStatus === 'active' && <WindGustIndicator />}
    
      {/* Crash Alert */}
      {isCrashed && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ color: 'red', fontWeight: 'bold' }}>
            🚁💥 UAV CRASHED - MISSION TERMINATED
          </Typography>
          <Typography variant="body2">
            {crashMessage}
          </Typography>
          <Typography variant="caption" display="block" sx={{ mt: 1, color: 'orange' }}>
            UAV is permanently disabled. Mission failed.
          </Typography>
        </Alert>
      )}

      {/* Click Control Panel */}
      <Box sx={{ display: 'none' }}>
        <ClickControlPanel />
      </Box>

      {/* Click-to-Move Toggle Button */}
      <Paper elevation={3} sx={{ p: 2, mb: 2, textAlign: 'center' }}>
        <Button 
          variant="contained" 
          onClick={toggleMoveMode}
          color={clickMode === 'move' ? 'success' : 'primary'}
          size="large"
          sx={{ 
            px: 4, 
            py: 2, 
            fontSize: '1rem', 
            fontWeight: 'bold',
            borderRadius: 2,
            width: '100%'
          }}
        >
          {clickMode === 'move' ? '✅ CLICK-TO-MOVE ENABLED' : '❌ CLICK-TO-MOVE DISABLED'}
        </Button>
      </Paper>

      {/* UAV Status */}
      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          🛸 UAV Status
        </Typography>
        {missionStatus === 'active' && (
          <Typography variant="body2" color="primary" gutterBottom>
            Mission Active - Hover Time: {Math.floor(objectives.hoverTime)}s / {objectives.requiredSurveillanceTime}s
          </Typography>
        )}
        {isHovering && currentTarget && (
          <Typography variant="body2" color="success.main" gutterBottom>
            🎯 Hovering above {currentTarget.type} - Gathering intelligence
          </Typography>
        )}
        <Typography variant="body2" color={isCrashed ? 'error' : 'inherit'}>
          Status: {isCrashed ? '💥 CRASHED - TERMINATED' : 
                   isHovering ? '🔄 Hovering Above Target' :
                   (isMoving ? '🚁 Moving to Target' : '✅ Stationary')}
        </Typography>
        <Typography variant="body2">Position: {position.map(p => p.toFixed(1)).join(', ')}</Typography>
        <Typography variant="body2">Altitude: {position[1].toFixed(1)}m</Typography>
        <Typography variant="body2">Speed: {isCrashed ? '0.0' : (isMoving || isHovering ? '35.0' : '0.0')} km/h</Typography>
        <Typography variant="body2" color={isMoving ? 'warning.main' : 'success.main'}>
          Collision Detection: {isMoving ? '🔴 ACTIVE' : '🟢 STANDBY'}
        </Typography>
      </Paper>

      {/* Battery Indicator - Show when mission is active */}
      {missionStatus === 'active' && (
        <Box sx={{ mb: 2 }}>
          <BatteryIndicator />
        </Box>
      )}

      {/* Real-time Altitude Control Slider */}
      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          ⛰️ Real-time Altitude Control
        </Typography>
        
        <Typography variant="body2" color="white" gutterBottom>
          Current Altitude: {position[1].toFixed(1)}m
        </Typography>
        
        {isMoving && (
          <Typography variant="body2" color="success" gutterBottom sx={{ fontStyle: 'italic' }}>
            🚁 UAV moving - altitude adjusts in real-time
          </Typography>
        )}
        
        <Box sx={{ px: 1, py: 2 }}>
          <Slider
            value={altitudeSlider}
            onChange={handleAltitudeChange}
            onChangeCommitted={handleAltitudeChangeCommitted}
            min={10}
            max={50}
            step={0.5}
            marks={[
              { value: 10, label: '10m' },
              { value: 20, label: '20m' },
              { value: 30, label: '30m' },
              { value: 40, label: '40m' },
              { value: 50, label: '50m' }
            ]}
            valueLabelDisplay="on"
            valueLabelFormat={(value) => `${value}m`}
            sx={{
              color: isCrashed ? 'error.main' : (isMoving ? 'success.main' : 'primary.main'),
              '& .MuiSlider-thumb': {
                backgroundColor: isCrashed ? 'error.main' : (isMoving ? 'success.main' : 'primary.main')
              },
              '& .MuiSlider-track': {
                backgroundColor: isCrashed ? 'error.main' : (isMoving ? 'success.main' : 'primary.main')
              }
            }}
            disabled={isCrashed}
          />
        </Box>
        
        <Typography variant="caption" display="block" sx={{ mt: 1, color: 'grey.400' }}>
          Drag slider to instantly adjust UAV altitude (10-50m)
        </Typography>
      </Paper>

      {/* Movement Controls */}
      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          🎮 UAV Controls
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <TextField
            label="X Coordinate"
            type="number"
            value={coordinates.x}
            onChange={(e) => handleCoordinateChange('x', e.target.value)}
            onBlur={() => handleCoordinateBlur('x')}
            size="small"
            disabled={isCrashed}
            helperText="East/West position"
          />
          <TextField
            label="Y (Altitude)"
            type="number"
            value={coordinates.y}
            onChange={(e) => handleCoordinateChange('y', e.target.value)}
            onBlur={() => handleCoordinateBlur('y')}
            size="small"
            disabled={isCrashed}
            inputProps={{ max: 50, min: 10 }}
            helperText="Height above ground (10-50m)"
          />
          <TextField
            label="Z Coordinate"
            type="number"
            value={coordinates.z}
            onChange={(e) => handleCoordinateChange('z', e.target.value)}
            onBlur={() => handleCoordinateBlur('z')}
            size="small"
            disabled={isCrashed}
            helperText="North/South position"
          />
          <Button 
            variant="contained" 
            onClick={handleMovement}
            sx={{ mt: 1 }}
            disabled={isCrashed}
            color="primary"
          >
            🚁 SET TARGET POSITION
          </Button>
        </Box>

        <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>UAV Current Position:</Typography>
        <Typography variant="body2">X: {position[0].toFixed(2)} Y: {position[1].toFixed(2)} Z: {position[2].toFixed(2)}</Typography>
        
        {isMoving && targetPosition && (
          <>
            <Typography variant="h6" sx={{ mt: 1, mb: 1, color: 'primary.main' }}>📍 Target Position:</Typography>
            <Typography variant="body2" color="primary.main">X: {targetPosition[0].toFixed(2)} Y: {targetPosition[1].toFixed(2)} Z: {targetPosition[2].toFixed(2)}</Typography>
            <Typography variant="caption" color="primary.main" display="block">
              Distance to target: {Math.sqrt(
                Math.pow(targetPosition[0] - position[0], 2) +
                Math.pow(targetPosition[1] - position[1], 2) +
                Math.pow(targetPosition[2] - position[2], 2)
              ).toFixed(1)} units
            </Typography>
          </>
        )}
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" gutterBottom>Ground Speed: {isCrashed ? '0' : (isMoving ? '35' : '0')} km/h</Typography>
          <Typography variant="body2" gutterBottom>Flight Speed: {isCrashed ? '0' : (isMoving ? '15' : '0')} km/h</Typography>
          <Typography variant="body2" gutterBottom color="success.main">
            ✨ Use click-to-move or slider above for control
          </Typography>
        </Box>
      </Paper>

      {/* Vision Controls */}
      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          👁️ Vision Controls
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={isThermalVision}
              onChange={(e) => setThermalVision(e.target.checked)}
              disabled={isCrashed}
            />
          }
          label="Enable Thermal Vision"
        />
      </Paper>

      {/* Detected Targets - with optimized rendering */}
      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          🎯 Detected Targets <Chip label={totalTargetsCompleted} color="error" size="small" />
        </Typography>
        
        {/* Current Scanning Status */}
        {renderScanningStatus()}
        
        <Typography variant="body2" gutterBottom>Surveillance Complete:</Typography>
        
        {/* Display target counts */}
        <Box sx={{ pl: 2 }}>
          {Object.entries(completedTargets).map(([type, count]) => (
            count > 0 ? (
              <Typography key={type} variant="body2">
                {type.charAt(0).toUpperCase() + type.slice(1)}: {count}
              </Typography>
            ) : null
          ))}
        </Box>

        <Box sx={{ mt: 2 }}>
          {renderCompletedTargets()}
        </Box>
      </Paper>

      {/* Target Identification Guide */}
<Paper elevation={3} sx={{ p: 2, mb: 2 }}>
  <Typography variant="h6" gutterBottom>
    📋 Target Identification Guide
  </Typography>

  <Typography variant="body2" sx={{ mb: 2 }}>
    Use this guide to identify different targets in the field:
  </Typography>

  {/* Tank Description */}
  <Paper sx={{ p: 1.5, mb: 1.5, bgcolor: '#ffebee', color: '#000' }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
        Tank
      </Typography>
      <Chip label="Vehicle" size="small" color="error" />
    </Box>
    <Box sx={{ mt: 1 }}>
      <Typography variant="body2">
        <strong>Appearance:</strong> Large tracked vehicle with a turret and cannon
      </Typography>
      <Typography variant="body2">
        <strong>Movement:</strong> Slow-moving, leaves tracks on terrain
      </Typography>
      <Typography variant="body2">
        <strong>Thermal Signature:</strong> High heat from engine compartment and exhaust
      </Typography>
    </Box>
  </Paper>

  {/* Jeep Description */}
  <Paper sx={{ p: 1.5, mb: 1.5, bgcolor: '#e8f5e9', color: '#000' }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
        Jeep
      </Typography>
      <Chip label="Vehicle" size="small" color="success" />
    </Box>
    <Box sx={{ mt: 1 }}>
      <Typography variant="body2">
        <strong>Appearance:</strong> Small wheeled vehicle with open or closed top
      </Typography>
      <Typography variant="body2">
        <strong>Movement:</strong> Faster than tanks, more agile on terrain
      </Typography>
      <Typography variant="body2">
        <strong>Thermal Signature:</strong> Medium heat from engine compartment
      </Typography>
    </Box>
  </Paper>

  {/* Warehouse Description */}
  <Paper sx={{ p: 1.5, mb: 1.5, bgcolor: '#fff3e0', color: '#000' }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
        Warehouse
      </Typography>
      <Chip label="Structure" size="small" color="warning" />
    </Box>
    <Box sx={{ mt: 1 }}>
      <Typography variant="body2">
        <strong>Appearance:</strong> Rectangular building with large doors and flat roof
      </Typography>
      <Typography variant="body2">
        <strong>Features:</strong> May have loading areas, roads leading to entrance
      </Typography>
      <Typography variant="body2">
        <strong>Thermal Signature:</strong> Variable heat patterns based on contents
      </Typography>
    </Box>
  </Paper>

  {/* Soldier Description */}
  <Paper sx={{ p: 1.5, mb: 1.5, bgcolor: '#f3e5f5', color: '#000' }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
        Soldier
      </Typography>
      <Chip label="Personnel" size="small" color="secondary" />
    </Box>
    <Box sx={{ mt: 1 }}>
      <Typography variant="body2">
        <strong>Appearance:</strong> Small human figure with equipment
      </Typography>
      <Typography variant="body2">
        <strong>Movement:</strong> Can move independently or in groups
      </Typography>
      <Typography variant="body2">
        <strong>Thermal Signature:</strong> Human-shaped heat pattern, distinct from environment
      </Typography>
      <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic', color: 'error.main' }}>
        <strong>Note:</strong> Fly lower (15-20m) for better detection of soldiers
      </Typography>
    </Box>
  </Paper>
  
  <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
    Thermal vision mode can help identify targets obscured by terrain or vegetation.
  </Typography>

  <Box sx={{ mt: 2, p: 1.5, bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 1 }}>
    <Typography variant="subtitle2" gutterBottom>
      Target Detection Tips
    </Typography>
    <Typography variant="body2">
      • Fly at medium altitude (25-35m) for general surveillance
    </Typography>
    <Typography variant="body2">
      • Decrease altitude (15-20m) when searching for soldiers
    </Typography>
    <Typography variant="body2">
      • Switch to thermal mode in forested or shadowy areas
    </Typography>
   
  </Box>
</Paper>

      {/* CSS for animation */}
      <style dangerouslySetInnerHTML={{
  __html: `
    @keyframes pulse {
      0% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.7; transform: scale(1.05); }
      100% { opacity: 1; transform: scale(1); }
    }
  `
}} />
    </Box>
  );
};

export default CommandDashboard;