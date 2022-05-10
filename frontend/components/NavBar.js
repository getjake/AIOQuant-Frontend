import React, { useEffect, useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Moment from 'react-moment';

const NavBar = ({ strategy, wsConnectionStatus, updatedTimestamp }) => {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {strategy}
          </Typography>
          <Typography variant="p" component="div" sx={{ flexGrow: 0.2 }}>
            {wsConnectionStatus}
          </Typography>
          <Typography variant="p" component="div" sx={{ flexGrow: 0.2 }}>
            Updated at{' '}
            {
              <Moment fromNow>
                {new Date(Math.floor(updatedTimestamp)).toISOString()}
              </Moment>
            }
          </Typography>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default NavBar;
