// import React, { useState } from 'react';
// import { Box, Alert, Slider, Typography, Button, Paper, Collapse } from '@mui/material';
// import WarningAmberIcon from '@mui/icons-material/WarningAmber';
// import ErrorIcon from '@mui/icons-material/Error';
// import InfoIcon from '@mui/icons-material/Info';
// import { useUAVStore } from '../store/uavStore';

// const TerrainWarningDisplay = () => {
//   const { 
//     position, 
//     setTargetPosition, 
//     collisionWarning 
//   } = useUAVStore();
  
//   const [altitudeSlider, setAltitudeSlider] = useState(position[1]);
//   const [showDebugInfo, setShowDebugInfo] = useState(true); // Show debug info

//   // Update slider when position changes
//   React.useEffect(() => {
//     setAltitudeSlider(position[1]);
//   }, [position[1]]);

//   const handleAltitudeChange = (event, newValue) => {
//     setAltitudeSlider(newValue);
//   };

//   const applyAltitudeChange = () => {
//     const newPosition = [position[0], altitudeSlider, position[2]];
//     setTargetPosition(newPosition);
//   };

//   const quickFixAltitude = () => {
//     if (collisionWarning.recommendedAltitude) {
//       setAltitudeSlider(collisionWarning.recommendedAltitude);
//       const newPosition = [position[0], collisionWarning.recommendedAltitude, position[2]];
//       setTargetPosition(newPosition);
//     } else {
//       // Emergency altitude increase
//       const safeAltitude = Math.max(position[1] + 20, 50);
//       setAltitudeSlider(safeAltitude);
//       const newPosition = [position[0], safeAltitude, position[2]];
//       setTargetPosition(newPosition);
//     }
//   };

//   const getAlertSeverity = (level) => {
//     switch (level) {
//       case 'critical': return 'error';
//       case 'warning': return 'warning';
//       case 'caution': return 'info';
//       default: return 'info';
//     }
//   };

//   const getAlertIcon = (level) => {
//     switch (level) {
//       case 'critical': return <ErrorIcon />;
//       case 'warning': return <WarningAmberIcon />;
//       case 'caution': return <InfoIcon />;
//       default: return <InfoIcon />;
//     }
//   };

//   return (
//     <Box sx={{ 
//       position: 'fixed', 
//       top: 20, 
//       right: 420, // Position it left of the dashboard
//       width: 350,
//       zIndex: 1000,
//       pointerEvents: 'auto'
//     }}>
//       {collisionWarning.active && (
//         <Collapse in={collisionWarning.active}>
//           <Alert 
//             severity={getAlertSeverity(collisionWarning.level)}
//             icon={getAlertIcon(collisionWarning.level)}
//             sx={{ 
//               mb: 2,
//               '& .MuiAlert-message': { width: '100%' }
//             }}
//           >
//             <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
//               {collisionWarning.message}
//             </Typography>
            
//             <Box sx={{ mt: 1 }}>
//               <Typography variant="caption" display="block">
//                 Current Altitude: {position[1].toFixed(1)}m
//               </Typography>
//               <Typography variant="caption" display="block">
//                 Terrain Height: {collisionWarning.terrainHeight?.toFixed(1) || 'N/A'}m
//               </Typography>
//               <Typography variant="caption" display="block">
//                 Ground Clearance: {collisionWarning.clearance?.toFixed(1) || 'N/A'}m
//               </Typography>
//             </Box>
//           </Alert>
//         </Collapse>
//       )}

//       {/* Always show altitude controls */}
//       <Paper sx={{ p: 2, bgcolor: 'rgba(0, 0, 0, 0.8)' }}>
//         <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
//           ⛰️ Altitude Control
//         </Typography>
        
//         {/* Debug info */}
//         {showDebugInfo && (
//           <Box sx={{ mb: 2, p: 1, bgcolor: 'rgba(255, 0, 0, 0.1)', borderRadius: 1 }}>
//             <Typography variant="caption" color="yellow" display="block">
//               DEBUG: Current Altitude: {position[1].toFixed(1)}m
//             </Typography>
//             <Typography variant="caption" color="yellow" display="block">
//               Collision Active: {collisionWarning.active ? 'YES' : 'NO'}
//             </Typography>
//             <Typography variant="caption" color="yellow" display="block">
//               Warning Level: {collisionWarning.level}
//             </Typography>
//             <Typography variant="caption" color="yellow" display="block">
//               Terrain Height: {collisionWarning.terrainHeight?.toFixed(1) || 'Not detected'}m
//             </Typography>
//           </Box>
//         )}
        
//         <Typography variant="body2" color="white" gutterBottom>
//           Adjust UAV altitude to avoid terrain collision:
//         </Typography>
        
//         <Box sx={{ px: 1, py: 2 }}>
//           <Slider
//             value={altitudeSlider}
//             onChange={handleAltitudeChange}
//             min={10}
//             max={100}
//             step={1}
//             marks={[
//               { value: 10, label: '10m' },
//               { value: 25, label: '25m' },
//               { value: 50, label: '50m' },
//               { value: 75, label: '75m' },
//               { value: 100, label: '100m' }
//             ]}
//             valueLabelDisplay="on"
//             valueLabelFormat={(value) => `${value}m`}
//             sx={{
//               color: collisionWarning.level === 'critical' ? 'error.main' : 'primary.main',
//               '& .MuiSlider-thumb': {
//                 backgroundColor: collisionWarning.level === 'critical' ? 'error.main' : 'primary.main'
//               },
//               '& .MuiSlider-track': {
//                 backgroundColor: collisionWarning.level === 'critical' ? 'error.main' : 'primary.main'
//               }
//             }}
//           />
//         </Box>
        
//         <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
//           <Button 
//             variant="contained" 
//             onClick={applyAltitudeChange}
//             size="small"
//             fullWidth
//             color={collisionWarning.level === 'critical' ? 'error' : 'primary'}
//           >
//             Set Altitude
//           </Button>
          
//           <Button 
//             variant="outlined" 
//             onClick={quickFixAltitude}
//             size="small"
//             fullWidth
//             sx={{ color: 'white', borderColor: 'white' }}
//           >
//             Emergency Up
//           </Button>
//         </Box>
        
//         <Typography variant="caption" display="block" sx={{ mt: 1, color: 'grey.400' }}>
//           Recommended minimum clearance: 15m above terrain
//         </Typography>
//       </Paper>
//     </Box>
//   );
// };

// export default TerrainWarningDisplay;


import React, { useState } from 'react';
import { Box, Alert, Slider, Typography, Button, Paper, Collapse } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import { useUAVStore } from '../store/uavStore';

const TerrainWarningDisplay = () => {
  const { 
    position, 
    setTargetPosition, 
    collisionWarning 
  } = useUAVStore();
  
  const [altitudeSlider, setAltitudeSlider] = useState(position[1]);
  const [showDebugInfo, setShowDebugInfo] = useState(true); // Show debug info

  // Update slider when position changes
  React.useEffect(() => {
    setAltitudeSlider(position[1]);
  }, [position[1]]);

  const handleAltitudeChange = (event, newValue) => {
    setAltitudeSlider(newValue);
  };

  const applyAltitudeChange = () => {
    const newPosition = [position[0], altitudeSlider, position[2]];
    setTargetPosition(newPosition);
  };

  const quickFixAltitude = () => {
    if (collisionWarning.recommendedAltitude) {
      setAltitudeSlider(collisionWarning.recommendedAltitude);
      const newPosition = [position[0], collisionWarning.recommendedAltitude, position[2]];
      setTargetPosition(newPosition);
    } else {
      // Emergency altitude increase
      const safeAltitude = Math.max(position[1] + 20, 50);
      setAltitudeSlider(safeAltitude);
      const newPosition = [position[0], safeAltitude, position[2]];
      setTargetPosition(newPosition);
    }
  };

  const getAlertSeverity = (level) => {
    switch (level) {
      case 'critical': return 'error';
      case 'warning': return 'warning';
      case 'caution': return 'info';
      default: return 'info';
    }
  };

  const getAlertIcon = (level) => {
    switch (level) {
      case 'critical': return <ErrorIcon />;
      case 'warning': return <WarningAmberIcon />;
      case 'caution': return <InfoIcon />;
      default: return <InfoIcon />;
    }
  };

  return (
    <Box sx={{ 
      position: 'fixed', 
      top: 20, 
      right: 420, // Position it left of the dashboard
      width: 350,
      zIndex: 1000,
      pointerEvents: 'auto'
    }}>
      {collisionWarning.active && (
        <Collapse in={collisionWarning.active}>
          <Alert 
            severity={getAlertSeverity(collisionWarning.level)}
            icon={getAlertIcon(collisionWarning.level)}
            sx={{ 
              mb: 2,
              '& .MuiAlert-message': { width: '100%' }
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
              {collisionWarning.message}
            </Typography>
            
            <Box sx={{ mt: 1 }}>
              <Typography variant="caption" display="block">
                Current Altitude: {position[1].toFixed(1)}m
              </Typography>
              <Typography variant="caption" display="block">
                Terrain Height: {collisionWarning.terrainHeight?.toFixed(1) || 'N/A'}m
              </Typography>
              <Typography variant="caption" display="block">
                Ground Clearance: {collisionWarning.clearance?.toFixed(1) || 'N/A'}m
              </Typography>
            </Box>
          </Alert>
        </Collapse>
      )}

      {/* Always show altitude controls */}
      <Paper sx={{ p: 2, bgcolor: 'rgba(0, 0, 0, 0.8)' }}>
        <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
          ⛰️ Altitude Control
        </Typography>
        
        {/* Debug info */}
        {showDebugInfo && (
          <Box sx={{ mb: 2, p: 1, bgcolor: 'rgba(255, 0, 0, 0.1)', borderRadius: 1 }}>
            <Typography variant="caption" color="yellow" display="block">
              DEBUG: Current Altitude: {position[1].toFixed(1)}m
            </Typography>
            <Typography variant="caption" color="yellow" display="block">
              Collision Active: {collisionWarning.active ? 'YES' : 'NO'}
            </Typography>
            <Typography variant="caption" color="yellow" display="block">
              Warning Level: {collisionWarning.level}
            </Typography>
            <Typography variant="caption" color="yellow" display="block">
              Terrain Height: {collisionWarning.terrainHeight?.toFixed(1) || 'Not detected'}m
            </Typography>
          </Box>
        )}
        
        <Typography variant="body2" color="white" gutterBottom>
          Adjust UAV altitude to avoid terrain collision:
        </Typography>
        
        <Box sx={{ px: 1, py: 2 }}>
          <Slider
            value={altitudeSlider}
            onChange={handleAltitudeChange}
            min={10}
            max={100}
            step={1}
            marks={[
              { value: 10, label: '10m' },
              { value: 25, label: '25m' },
              { value: 50, label: '50m' },
              { value: 75, label: '75m' },
              { value: 100, label: '100m' }
            ]}
            valueLabelDisplay="on"
            valueLabelFormat={(value) => `${value}m`}
            sx={{
              color: collisionWarning.level === 'critical' ? 'error.main' : 'primary.main',
              '& .MuiSlider-thumb': {
                backgroundColor: collisionWarning.level === 'critical' ? 'error.main' : 'primary.main'
              },
              '& .MuiSlider-track': {
                backgroundColor: collisionWarning.level === 'critical' ? 'error.main' : 'primary.main'
              }
            }}
          />
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
          <Button 
            variant="contained" 
            onClick={applyAltitudeChange}
            size="small"
            fullWidth
            color={collisionWarning.level === 'critical' ? 'error' : 'primary'}
          >
            Set Altitude
          </Button>
          
          <Button 
            variant="outlined" 
            onClick={quickFixAltitude}
            size="small"
            fullWidth
            sx={{ color: 'white', borderColor: 'white' }}
          >
            Emergency Up
          </Button>
        </Box>
        
        <Typography variant="caption" display="block" sx={{ mt: 1, color: 'grey.400' }}>
          Recommended minimum clearance: 15m above terrain
        </Typography>
      </Paper>
    </Box>
  );
};

export default TerrainWarningDisplay;