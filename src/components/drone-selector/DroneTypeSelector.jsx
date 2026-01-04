import React from 'react';
import { ToggleButtonGroup, ToggleButton } from '@mui/material';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import VideocamIcon from '@mui/icons-material/Videocam';
import GroupsIcon from '@mui/icons-material/Groups';

const DroneTypeSelector = ({ value, onChange }) => {
  const handleChange = (event, newValue) => {
    if (newValue !== null) {
      onChange(newValue);
    }
  };

  return (
    <ToggleButtonGroup
      value={value}
      exclusive
      onChange={handleChange}
      aria-label="drone type"
      sx={{
        bgcolor: 'rgba(0, 0, 0, 0.6)',
        '& .MuiToggleButtonGroup-grouped': {
          m: 1,
          border: 0,
          '&.Mui-selected': {
            bgcolor: 'primary.main',
            color: 'white',
          },
        },
      }}
    >
      <ToggleButton value="surveillance" aria-label="surveillance drone">
        <VideocamIcon sx={{ mr: 1 }} /> Surveillance
      </ToggleButton>
      <ToggleButton value="attack" aria-label="attack drone">
        <RocketLaunchIcon sx={{ mr: 1 }} /> Attack
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

export default DroneTypeSelector;