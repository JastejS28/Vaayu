// import React from 'react';
// import { 
//   Box, Paper, Typography, Button, Switch, 
//   FormControlLabel, Alert, Chip 
// } from '@mui/material';
// import { useClickControlStore } from '../store/clickControlStore';
// import { useUAVStore } from '../store/uavStore';

// const ClickControlPanel = () => {
//   const {
//     isClickToMoveEnabled,
//     isSpawnMode,
//     setClickToMoveEnabled,
//     setSpawnMode,
//     clickIndicator,
//     spawnIndicator,
//     resetClickStates
//   } = useClickControlStore();
  
//   const { isCrashed, position, targetPosition } = useUAVStore();

//   const handleToggleClickToMove = () => {
//     if (isCrashed) {
//       alert('Cannot enable click-to-move: UAV is crashed! Use spawn mode to restart.');
//       return;
//     }
//     setClickToMoveEnabled(!isClickToMoveEnabled);
//   };

//   const handleToggleSpawnMode = () => {
//     if (isSpawnMode) {
//       setSpawnMode(false);
//     } else {
//       // Enable spawn mode
//       setSpawnMode(true);
//       resetClickStates();
//     }
//   };

//   const handleResetControls = () => {
//     resetClickStates();
//   };

//   return (
//     <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
//       <Typography variant="h6" gutterBottom>
//         🖱️ Interactive Terrain Controls
//       </Typography>
      
//       {/* Status Display */}
//       <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
//         <Chip 
//           label={isSpawnMode ? "SPAWN MODE" : "NORMAL MODE"} 
//           color={isSpawnMode ? "warning" : "default"}
//           size="small"
//         />
//         <Chip 
//           label={isClickToMoveEnabled ? "CLICK-TO-MOVE ON" : "CLICK-TO-MOVE OFF"} 
//           color={isClickToMoveEnabled ? "success" : "default"}
//           size="small"
//         />
//         <Chip 
//           label={isCrashed ? "UAV CRASHED" : "UAV OPERATIONAL"} 
//           color={isCrashed ? "error" : "success"}
//           size="small"
//         />
//       </Box>

//       {/* Instructions */}
//       <Alert severity="info" sx={{ mb: 2 }}>
//         <Typography variant="body2">
//           {isSpawnMode ? (
//             <strong>🎯 SPAWN MODE: Click anywhere on the terrain to spawn the UAV at that location.</strong>
//           ) : isClickToMoveEnabled ? (
//             <strong>🚁 CLICK-TO-MOVE: Click anywhere on the terrain and the UAV will fly there.</strong>
//           ) : (
//             <strong>Enable click controls below to interact with the terrain.</strong>
//           )}
//         </Typography>
//       </Alert>

//       {/* Control Switches */}
//       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
//         {/* Spawn Mode Toggle */}
//         <FormControlLabel
//           control={
//             <Switch
//               checked={isSpawnMode}
//               onChange={handleToggleSpawnMode}
//               color="warning"
//             />
//           }
//           label={
//             <Box>
//               <Typography variant="body2" component="span">
//                 🎯 Spawn Mode
//               </Typography>
//               <Typography variant="caption" display="block" color="text.secondary">
//                 Click terrain to place UAV starting position
//               </Typography>
//             </Box>
//           }
//         />

//         {/* Click-to-Move Toggle */}
//         <FormControlLabel
//           control={
//             <Switch
//               checked={isClickToMoveEnabled}
//               onChange={handleToggleClickToMove}
//               disabled={isCrashed}
//               color="success"
//             />
//           }
//           label={
//             <Box>
//               <Typography variant="body2" component="span">
//                 🚁 Click-to-Move
//               </Typography>
//               <Typography variant="caption" display="block" color="text.secondary">
//                 Click terrain to move UAV to that location
//               </Typography>
//             </Box>
//           }
//         />
//       </Box>

//       {/* Status Information */}
//       <Box sx={{ mt: 2 }}>
//         <Typography variant="body2" gutterBottom>
//           <strong>Current Position:</strong> ({position.map(p => p.toFixed(1)).join(', ')})
//         </Typography>
        
//         {targetPosition && (
//           <Typography variant="body2" color="primary" gutterBottom>
//             <strong>Target Position:</strong> ({targetPosition.map(p => p.toFixed(1)).join(', ')})
//           </Typography>
//         )}
        
//         {clickIndicator && (
//           <Typography variant="body2" color="success.main" gutterBottom>
//             <strong>Last Click:</strong> ({Array.isArray(clickIndicator) 
//               ? clickIndicator.map(p => p.toFixed(1)).join(', ')
//               : clickIndicator.position 
//                 ? clickIndicator.position.map(p => p.toFixed(1)).join(', ') 
//                 : 'Invalid format'})
//           </Typography>
//         )}
//       </Box>

//       {/* Action Buttons */}
//       <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
//         <Button 
//           variant="outlined" 
//           size="small" 
//           onClick={handleResetControls}
//           color="secondary"
//         >
//           Reset Controls
//         </Button>
        
//         {isCrashed && (
//           <Button 
//             variant="contained" 
//             size="small" 
//             onClick={() => setSpawnMode(true)}
//             color="warning"
//           >
//             Spawn New UAV
//           </Button>
//         )}
//       </Box>
//     </Paper>
//   );
// };

// export default ClickControlPanel;


import React from 'react';
import { 
  Box, Paper, Typography, Button, Switch, 
  FormControlLabel, Alert, Chip 
} from '@mui/material';
import { useClickControlStore } from '../store/clickControlStore';
import { useUAVStore } from '../store/uavStore';

const ClickControlPanel = () => {
  const {
    isClickToMoveEnabled,
    isSpawnMode,
    setClickToMoveEnabled,
    setSpawnMode,
    clickIndicator,
    spawnIndicator,
    resetClickStates
  } = useClickControlStore();
  
  const { isCrashed, position, targetPosition } = useUAVStore();

  const handleToggleClickToMove = () => {
    if (isCrashed) {
      alert('Cannot enable click-to-move: UAV is crashed! Use spawn mode to restart.');
      return;
    }
    setClickToMoveEnabled(!isClickToMoveEnabled);
  };

  const handleToggleSpawnMode = () => {
    if (isSpawnMode) {
      setSpawnMode(false);
    } else {
      // Enable spawn mode
      setSpawnMode(true);
      resetClickStates();
    }
  };

  const handleResetControls = () => {
    resetClickStates();
  };

  return (
    <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        🖱️ Interactive Terrain Controls
      </Typography>
      
      {/* Status Display */}
      <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Chip 
          label={isSpawnMode ? "SPAWN MODE" : "NORMAL MODE"} 
          color={isSpawnMode ? "warning" : "default"}
          size="small"
        />
        <Chip 
          label={isClickToMoveEnabled ? "CLICK-TO-MOVE ON" : "CLICK-TO-MOVE OFF"} 
          color={isClickToMoveEnabled ? "success" : "default"}
          size="small"
        />
        <Chip 
          label={isCrashed ? "UAV CRASHED" : "UAV OPERATIONAL"} 
          color={isCrashed ? "error" : "success"}
          size="small"
        />
      </Box>

      {/* Instructions */}
      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
          {isSpawnMode ? (
            <strong>🎯 SPAWN MODE: Click anywhere on the terrain to spawn the UAV at that location.</strong>
          ) : isClickToMoveEnabled ? (
            <strong>🚁 CLICK-TO-MOVE: Click anywhere on the terrain and the UAV will fly there.</strong>
          ) : (
            <strong>Enable click controls below to interact with the terrain.</strong>
          )}
        </Typography>
      </Alert>

      {/* Control Switches */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Spawn Mode Toggle */}
        <FormControlLabel
          control={
            <Switch
              checked={isSpawnMode}
              onChange={handleToggleSpawnMode}
              color="warning"
            />
          }
          label={
            <Box>
              <Typography variant="body2" component="span">
                🎯 Spawn Mode
              </Typography>
              <Typography variant="caption" display="block" color="text.secondary">
                Click terrain to place UAV starting position
              </Typography>
            </Box>
          }
        />

        {/* Click-to-Move Toggle */}
        <FormControlLabel
          control={
            <Switch
              checked={isClickToMoveEnabled}
              onChange={handleToggleClickToMove}
              disabled={isCrashed}
              color="success"
            />
          }
          label={
            <Box>
              <Typography variant="body2" component="span">
                🚁 Click-to-Move
              </Typography>
              <Typography variant="caption" display="block" color="text.secondary">
                Click terrain to move UAV to that location
              </Typography>
            </Box>
          }
        />
      </Box>

      {/* Status Information */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" gutterBottom>
          <strong>Current Position:</strong> ({position.map(p => p.toFixed(1)).join(', ')})
        </Typography>
        
        {targetPosition && (
          <Typography variant="body2" color="primary" gutterBottom>
            <strong>Target Position:</strong> ({targetPosition.map(p => p.toFixed(1)).join(', ')})
          </Typography>
        )}
        
        {clickIndicator && clickIndicator.position && Array.isArray(clickIndicator.position) && (
          <Box>
            <Typography variant="caption">
              Click Position: {clickIndicator.position.map(v => v.toFixed(1)).join(', ')}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Action Buttons */}
      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
        <Button 
          variant="outlined" 
          size="small" 
          onClick={handleResetControls}
          color="secondary"
        >
          Reset Controls
        </Button>
        
        {isCrashed && (
          <Button 
            variant="contained" 
            size="small" 
            onClick={() => setSpawnMode(true)}
            color="warning"
          >
            Spawn New UAV
          </Button>
        )}
      </Box>
    </Paper>
  );
};

export default ClickControlPanel;