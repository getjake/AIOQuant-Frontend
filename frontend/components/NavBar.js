import React, { useEffect, useState } from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  TextField,
  Button,
} from '@mui/material';
import Moment from 'react-moment';
import { useSnackbar } from 'notistack';

const NavBar = ({
  strategy,
  setStrategy,
  wsConnectionStatus,
  updatedTimestamp,
}) => {

  const { enqueueSnackbar } = useSnackbar();
  const [strategyNameInput, setStrategyNameInput] = useState('');
  const updateStrategyName = () => {
    if (strategyNameInput.length === 0) {
      enqueueSnackbar('Please enter strategy name!', {variant: 'error'})
      return
    }
    setStrategy(strategyNameInput)
    enqueueSnackbar('Strategy Set Successfully!', {variant: 'success'})
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {strategy}
          </Typography>
          <TextField
            id="standard-basic"
            label="Strategy Name..."
            variant="standard"
            onChange={(e) => {
              setStrategyNameInput(e.target.value);
            }}
          />
          <Button
            variant="contained"
            style={{ marginLeft: '2rem', marginRight: '4rem' }}
            onClick={updateStrategyName}
          >
            SET STRATEGY
          </Button>
          <Typography variant="p" component="div" sx={{ flexGrow: 0.2 }}>
            {wsConnectionStatus}
          </Typography>
          <Typography variant="p" component="div" sx={{ flexGrow: 0.2 }}>
            {updatedTimestamp === 0 ? (
              ''
            ) : (
              <>
                Updated at
                <Moment fromNow>
                  {new Date(Math.floor(updatedTimestamp)).toISOString()}
                </Moment>
              </>
            )}
          </Typography>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default NavBar;
