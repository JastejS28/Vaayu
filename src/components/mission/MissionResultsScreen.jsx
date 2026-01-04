import React from 'react';
import { Box, Paper, Typography, Button, Chip, Grid, LinearProgress, Divider } from '@mui/material';
import { useMissionStore } from '../../store/missionStore';
import { useTargetStore } from '../../store/targetStore';
import { useAttackDroneStore } from '../../store/attackDroneStore';
import { useUAVStore } from '../../store/uavStore';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import ApartmentIcon from '@mui/icons-material/Apartment';
import PersonIcon from '@mui/icons-material/Person';

const MissionResultsScreen = ({ onRestart, onNewMission }) => {
  const { missionStatus, objectives, missionFailReason } = useMissionStore();
  const completedTargets = useTargetStore(state => state.completedTargets);
  const detectedTargets = useTargetStore(state => state.detectedTargets);
  const { destroyedTargets } = useAttackDroneStore();
  const { targets, battery } = useUAVStore();

  const totalTargetsCompleted = typeof completedTargets === 'object' && completedTargets !== null
    ? Object.values(completedTargets).reduce((sum, count) => sum + (typeof count === 'number' ? count : 0), 0)
    : 0;

  const isSuccessful = missionStatus === 'completed';

  const getTargetIcon = (type) => {
    switch(type) {
      case 'tank': return <MilitaryTechIcon fontSize="small" />;
      case 'jeep': return <DirectionsCarIcon fontSize="small" />;
      case 'warehouse': return <ApartmentIcon fontSize="small" />;
      case 'soldier': return <PersonIcon fontSize="small" />;
      default: return '🎯';
    }
  };

  const calculateAttackStats = () => {
    if (!targets || !destroyedTargets) return { breakdown: {}, totalDestroyed: 0, totalTargets: 0, percentage: 0 };

    const breakdown = {};

    targets.forEach(target => {
      if (!breakdown[target.type]) {
        breakdown[target.type] = { total: 0, destroyed: 0 };
      }
    });

    targets.forEach(target => {
      if (breakdown[target.type]) {
        breakdown[target.type].total++;
      }
    });

    destroyedTargets.forEach(targetId => {
      const target = targets.find(t => t.id === targetId);
      if (target && breakdown[target.type]) {
        breakdown[target.type].destroyed++;
      }
    });

    const totalTargets = targets.length;
    const totalDestroyed = destroyedTargets.length;
    const percentage = totalTargets > 0 ? Math.round((totalDestroyed / totalTargets) * 100) : 0;

    return { breakdown, totalDestroyed, totalTargets, percentage };
  };

  const attackStats = calculateAttackStats();

  const requiredTargets = ['tank', 'jeep', 'warehouse', 'soldier'];
  const missingTargets = requiredTargets.filter(target => 
    !completedTargets[target] || completedTargets[target] === 0
  );

  const allTargetsDetected = missingTargets.length === 0;

  return (
    <Box sx={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100%', 
      height: '100%', 
      display: 'flex', 
      justifyContent: 'center',
      alignItems: 'center',
      bgcolor: 'rgba(0,0,0,0.85)',
      zIndex: 9999,
      p: 2
    }}>
      <Paper sx={{ 
        maxWidth: 800, 
        width: '100%', 
        maxHeight: '90vh',
        overflowY: 'auto',
        p: 4,
        bgcolor: 'background.paper',
        borderRadius: 2
      }}>
        <Typography variant="h4" align="center" gutterBottom color={isSuccessful ? "success.main" : "error.main"}>
          {isSuccessful ? '✅ Mission Successful' : '❌ Mission Failed'}
        </Typography>
        
        {/* Show failure reason if mission failed */}
        {!isSuccessful && missionFailReason && (
          <Box sx={{ 
            mb: 3, 
            p: 2, 
            bgcolor: 'rgba(244, 67, 54, 0.1)',
            borderRadius: 2,
            border: '2px solid rgba(244, 67, 54, 0.5)'
          }}>
            <Typography variant="h6" color="error.main" gutterBottom>
              Failure Reason:
            </Typography>
            <Typography variant="body1" color="error.main">
              {missionFailReason}
            </Typography>
          </Box>
        )}
        
        <Box sx={{ my: 3 }}>
          <Typography variant="h6" gutterBottom>
            Mission Statistics:
          </Typography>
          <Typography variant="body1">
            Total Surveillance Time: {objectives?.hoverTime.toFixed(1) || 0}s
          </Typography>
          <Typography variant="body1" gutterBottom>
            Targets Surveilled: {totalTargetsCompleted}
          </Typography>
          <Typography variant="body1" gutterBottom>
            Final Battery Level: {Math.round(battery)}%
          </Typography>
          
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom color="error.main">
            🚀 Attack Phase Results:
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body1">
                Target Destruction Rate:
              </Typography>
              <Typography variant="h5" color={attackStats.percentage >= 50 ? "success.main" : "error.main"}>
                {attackStats.percentage}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={attackStats.percentage}
              sx={{ 
                height: 8, 
                borderRadius: 1,
                backgroundColor: 'rgba(0,0,0,0.1)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: attackStats.percentage >= 80 ? '#4caf50' : 
                                 attackStats.percentage >= 50 ? '#ff9800' : '#f44336'
                }
              }} 
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {attackStats.totalDestroyed} of {attackStats.totalTargets} targets destroyed
            </Typography>
          </Box>
          
          {Object.keys(attackStats.breakdown).length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Target Destruction Breakdown:
              </Typography>
              <Grid container spacing={1}>
                {Object.entries(attackStats.breakdown).map(([type, data]) => (
                  <Grid item xs={6} sm={3} key={type}>
                    <Paper elevation={1} sx={{ 
                      p: 1.5, 
                      textAlign: 'center',
                      bgcolor: data.destroyed > 0 ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                      border: '1px solid',
                      borderColor: data.destroyed > 0 ? 'rgba(76, 175, 80, 0.3)' : 'rgba(244, 67, 54, 0.3)'
                    }}>
                      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 0.5 }}>
                        {getTargetIcon(type)}
                      </Box>
                      <Typography variant="subtitle2" sx={{ textTransform: 'capitalize' }}>
                        {type}s
                      </Typography>
                      <Typography variant="h6" color={data.destroyed > 0 ? "success.main" : "text.secondary"}>
                        {data.destroyed}/{data.total}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {data.total > 0 ? Math.round((data.destroyed / data.total) * 100) : 0}% destroyed
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
          
          <Divider sx={{ my: 2 }} />
          
          {/* TARGET SUMMARY SECTION - FIXED */}
          <Box sx={{ mt: 3, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Targets Detected:
            </Typography>
            
            {totalTargetsCompleted > 0 ? (
              <>
                <Box sx={{ mb: 2 }}>
                  {Object.entries(completedTargets).map(([type, count]) => (
                    count > 0 ? (
                      <Chip 
                        key={type}
                        icon={<span>{getTargetIcon(type)}</span>}
                        label={`${type.charAt(0).toUpperCase() + type.slice(1)}: ${count}`} 
                        color="primary" 
                        variant="outlined"
                        sx={{ mr: 1, mb: 1 }}
                      />
                    ) : null
                  ))}
                </Box>
                
                <Grid container spacing={1}>
                  {detectedTargets.map((target, idx) => (
                    <Grid item xs={12} sm={6} md={4} key={idx}>
                      <Paper elevation={1} sx={{ 
                        p: 1, 
                        bgcolor: 
                          target.type === 'tank' ? 'rgba(244, 67, 54, 0.1)' : 
                          target.type === 'jeep' ? 'rgba(76, 175, 80, 0.1)' : 
                          target.type === 'warehouse' ? 'rgba(255, 152, 0, 0.1)' : 
                          'rgba(156, 39, 176, 0.1)',
                        border: '1px solid',
                        borderColor: 
                          target.type === 'tank' ? 'rgba(244, 67, 54, 0.3)' : 
                          target.type === 'jeep' ? 'rgba(76, 175, 80, 0.3)' : 
                          target.type === 'warehouse' ? 'rgba(255, 152, 0, 0.3)' : 
                          'rgba(156, 39, 176, 0.3)',
                      }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                          <Typography variant="subtitle2">
                            {getTargetIcon(target.type)} {target.type.charAt(0).toUpperCase() + target.type.slice(1)}
                          </Typography>
                          <Chip 
                            label={target.type === 'tank' || target.type === 'jeep' ? 'Vehicle' : 
                                  target.type === 'warehouse' ? 'Structure' : 
                                  'Personnel'} 
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                        <Typography variant="caption" display="block" color="text.secondary">
                          Position: ({target.position[0].toFixed(1)}, {target.position[1].toFixed(1)}, {target.position[2].toFixed(1)})
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No targets were successfully surveilled during this mission.
              </Typography>
            )}
          </Box>
        </Box>
        
        {!isSuccessful && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(220, 53, 69, 0.1)', borderRadius: 1 }}>
            <Typography variant="h6" color="error.main" gutterBottom>
              Mission Failure Reason:
            </Typography>
            
            {missingTargets.length > 0 ? (
              <>
                <Typography variant="body1" gutterBottom>
                  Not all targets were detected before returning to base.
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Missing targets:
                </Typography>
                <ul>
                  {missingTargets.map(target => (
                    <li key={target}>
                      <Typography variant="body2">
                        {target.charAt(0).toUpperCase() + target.slice(1)}
                      </Typography>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <Typography variant="body1">
                {missionStatus === 'timeout' ? 'Mission time expired.' : 
                 missionStatus === 'crashed' ? 'UAV crashed.' : 
                 'Mission aborted.'}
              </Typography>
            )}
          </Box>
        )}
        
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
          <Button 
            variant="contained" 
            onClick={onRestart} 
            sx={{ 
              bgcolor: 'primary.main', 
              color: 'white', 
              '&:hover': {
                bgcolor: 'primary.dark',
              },
              flex: 1,
              mr: 1
            }}
          >
            Restart Mission
          </Button>
          <Button 
            variant="outlined" 
            onClick={onNewMission} 
            sx={{ 
              flex: 1,
              borderColor: 'primary.main',
              color: 'primary.main',
              '&:hover': {
                borderColor: 'primary.dark',
                color: 'primary.dark',
              },
            }}
          >
            New Mission
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default MissionResultsScreen;