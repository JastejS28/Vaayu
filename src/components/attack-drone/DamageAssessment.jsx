import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, List, ListItem, ListItemText, Collapse, Chip, Badge, Divider } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
// Replace DirectionsTank with more common icons
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech'; // For tanks
import ApartmentIcon from '@mui/icons-material/Apartment'; // For warehouses
import PersonIcon from '@mui/icons-material/Person'; // For soldiers
import { useAttackDroneStore } from '../../store/attackDroneStore';
import { useUAVStore } from '../../store/uavStore'; // FIXED: Import useUAVStore to get targets

const DamageAssessment = () => {
  const { destroyedTargets } = useAttackDroneStore();
  const { targets } = useUAVStore(); // FIXED: Get targets from UAVStore instead of AttackDroneStore
  const [assessmentData, setAssessmentData] = useState({
    totalTargets: 0,
    destroyedCount: 0,
    percentage: 0,
    targetBreakdown: {},
    recentStrikes: []
  });

  // Compute damage assessment whenever destroyedTargets changes
  useEffect(() => {
    if (!targets || !destroyedTargets) return;
    
    console.log("DamageAssessment - targets:", targets); // DEBUG: Check what targets we have
    console.log("DamageAssessment - destroyedTargets:", destroyedTargets); // DEBUG: Check destroyed targets
    
    // FIXED: Dynamically create targetBreakdown based on actual targets
    const targetBreakdown = {};
    
    // Initialize breakdown only for target types that actually exist
    targets.forEach(target => {
      if (!targetBreakdown[target.type]) {
        targetBreakdown[target.type] = { total: 0, destroyed: 0 };
      }
    });
    
    console.log("DamageAssessment - targetBreakdown after init:", targetBreakdown); // DEBUG: Check breakdown
    
    // Count targets
    targets.forEach(target => {
      if (targetBreakdown[target.type]) {
        targetBreakdown[target.type].total++;
      }
    });
    
    // Count destroyed targets by finding their types
    destroyedTargets.forEach(targetId => {
      const target = targets.find(t => t.id === targetId);
      if (target && targetBreakdown[target.type]) {
        targetBreakdown[target.type].destroyed++;
      }
    });
    
    console.log("DamageAssessment - final targetBreakdown:", targetBreakdown); // DEBUG: Check final breakdown
    
    // Calculate overall stats
    const totalTargets = targets.length;
    const destroyedCount = destroyedTargets.length;
    const percentage = totalTargets > 0 ? Math.round((destroyedCount / totalTargets) * 100) : 0;
    
    // Create list of recent strikes (last 5)
    const recentStrikes = destroyedTargets.slice(-5).map(targetId => {
      const target = targets.find(t => t.id === targetId);
      return {
        id: targetId,
        type: target?.type || 'unknown',
        position: target?.position || [0, 0, 0],
        timestamp: Date.now() // Ideally we'd store timestamps with destroyed targets
      };
    }).reverse(); // Most recent first
    
    setAssessmentData({
      totalTargets,
      destroyedCount,
      percentage,
      targetBreakdown,
      recentStrikes
    });
    
  }, [destroyedTargets, targets]);

  // Get status level based on percentage destroyed
  const getStatusLevel = (percentage) => {
    if (percentage >= 80) return { label: 'Excellent', color: 'success', icon: <CheckCircleOutlineIcon /> };
    if (percentage >= 50) return { label: 'Good', color: 'warning', icon: <WarningAmberIcon /> };
    return { label: 'Poor', color: 'error', icon: <ErrorOutlineIcon /> };
  };

  const status = getStatusLevel(assessmentData.percentage);
  
  // Get icon for target type
  const getTargetIcon = (type) => {
    switch (type) {
      case 'tank': return <MilitaryTechIcon fontSize="small" />;
      case 'jeep': return <DirectionsCarIcon fontSize="small" />;
      case 'warehouse': return <ApartmentIcon fontSize="small" />;
      case 'soldier': return <PersonIcon fontSize="small" />;
      default: return <ErrorOutlineIcon fontSize="small" />;
    }
  };

  return (
    <Paper sx={{ p: 2, mb: 2, bgcolor: '#000000' }}>
      <Typography variant="h6" gutterBottom>
        Damage Assessment
      </Typography>
      
      {/* Overall Statistics */}
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="body2" color="text.secondary">
            Target Destruction Rate:
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h4" sx={{ mr: 1 }}>
              {assessmentData.percentage}%
            </Typography>
            <Chip 
              icon={status.icon} 
              label={status.label} 
              color={status.color} 
              size="small" 
              sx={{ height: '20px' }}
            />
          </Box>
        </Box>
        <Box textAlign="center">
          <Badge 
            badgeContent={assessmentData.destroyedCount} 
            color="error"
            max={99}
            sx={{ '.MuiBadge-badge': { fontSize: '0.8rem', height: '22px', minWidth: '22px' } }}
          >
            <Typography variant="body1" fontWeight="bold">
              {assessmentData.totalTargets}
            </Typography>
          </Badge>
          <Typography variant="caption" display="block" color="text.secondary">
            Targets
          </Typography>
        </Box>
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      {/* Target Type Breakdown */}
      <Typography variant="subtitle2" gutterBottom>
        Target Breakdown:
      </Typography>
      
      <List dense disablePadding sx={{ mb: 2 }}>
        {Object.entries(assessmentData.targetBreakdown)
          .map(([type, data]) => ( // FIXED: Remove filter since targetBreakdown now only contains existing target types
            <ListItem key={type} disableGutters sx={{ py: 0.5 }}>
              <Box sx={{ display: 'flex', width: '100%', alignItems: 'center' }}>
                <Box sx={{ pr: 1 }}>
                  {getTargetIcon(type)}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" component="span" sx={{ textTransform: 'capitalize' }}>
                    {type}s
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" fontWeight="bold">
                    {data.destroyed}/{data.total}
                  </Typography>
                </Box>
                <Box sx={{ width: 80, pl: 1 }}>
                  <Box sx={{ 
                    width: '100%', 
                    height: 6, 
                    bgcolor: '#e0e0e0', 
                    borderRadius: 1,
                    overflow: 'hidden'
                  }}>
                    <Box sx={{ 
                      height: '100%', 
                      width: `${data.total > 0 ? (data.destroyed / data.total) * 100 : 0}%`,
                      bgcolor: data.destroyed > 0 ? 
                        (data.destroyed === data.total ? 'success.main' : 'warning.main') 
                        : 'error.main',
                      borderRadius: 1
                    }} />
                  </Box>
                </Box>
              </Box>
            </ListItem>
          ))}
      </List>

      {/* Recent Strikes */}
      <Typography variant="subtitle2" gutterBottom>
        Recent Strikes:
      </Typography>
      
      {assessmentData.recentStrikes.length > 0 ? (
        <List dense disablePadding>
          {assessmentData.recentStrikes.map((strike, index) => (
            <ListItem 
              key={strike.id} 
              disableGutters 
              sx={{ 
                py: 0.5, 
                bgcolor: index === 0 ? 'rgba(255, 235, 59, 0.1)' : 'transparent',
                borderRadius: 1
              }}
            >
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {getTargetIcon(strike.type)}
                    <Typography variant="body2" component="span" sx={{ ml: 1, textTransform: 'capitalize' }}>
                      {strike.type} destroyed
                    </Typography>
                    {index === 0 && (
                      <Chip 
                        label="NEW" 
                        size="small" 
                        color="warning" 
                        sx={{ ml: 1, height: '16px', fontSize: '0.6rem' }} 
                      />
                    )}
                  </Box>
                }
                secondary={
                  <Typography variant="caption" color="text.secondary">
                    Loc: [{strike.position.map(n => Math.floor(n)).join(', ')}]
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography variant="body2" color="text.secondary">
          No strikes recorded yet.
        </Typography>
      )}
    </Paper>
  );
};

export default DamageAssessment;