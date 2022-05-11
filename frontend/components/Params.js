import React, { useEffect, useState } from 'react';
import {
  Button,
  Switch,
  Grid,
  Item,
  Card,
  CardHeader,
  CardContent,
  Typography,
  List,
  ListItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import validator from 'validator';

const Params = ({ params, newParams, setNewParams, publishMessage }) => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const onParamChangeHandler = (e) => {
    const title = e.target.id;
    const param = params.filter((item) => item[0] === title);
    const type = param[0].at(2);
    let value;
    if (type == 'bool') {
      value = e.target.checked;
    } else if (type === 'str' || type === 'int' || type === 'float') {
      value = e.target.value;
    }
    setNewParams({ ...newParams, [title]: value });
  };

  const generateNewValueField = (paramItem) => {
    // Generate a correct type of selecting field for new values.
    // Input: [ title, value, type ]. Example: ['binance_on', true, 'bool']
    // Types: `bool`, `int`, `float`, `str`.
    const title = paramItem[0];
    const value = paramItem[1];
    const type = paramItem[2];

    if (type === 'bool') {
      return (
        <Switch
          id={title}
          defaultChecked={value}
          onClick={onParamChangeHandler}
        />
      );
    }

    if (type === 'str') {
      return (
        <TextField
          hiddenLabel
          id={title}
          defaultValue={value}
          margin="dense"
          variant="filled"
          size="small"
          onChange={onParamChangeHandler}
        />
      );
    }

    if (type === 'int') {
      return (
        <TextField
          hiddenLabel
          id={title}
          defaultValue={value}
          margin="dense"
          variant="filled"
          size="small"
          onChange={onParamChangeHandler}
        />
      );
    }

    if (type === 'float') {
      return (
        <TextField
          hiddenLabel
          id={title}
          defaultValue={value}
          margin="dense"
          variant="filled"
          size="small"
          onChange={onParamChangeHandler}
        />
      );
    }
  };

  const validateAndTranslateData = (param) => {
    // Validate
    const value = newParams[param].toString();
    const correctType = params.filter((item) => item[0] === param)[0].at(2);
    let isValid = false;
    let newValue;
    if (correctType === 'float') {
      isValid = validator.isFloat(value);
      newValue = parseFloat(value);
    } else if (correctType === 'int') {
      isValid = validator.isInt(value);
      newValue = parseInt(value);
    } else if (correctType === 'str') {
      isValid = true;
    } else if (correctType === 'bool') {
      isValid = true;
    }

    // Not valid
    if (!isValid) {
      enqueueSnackbar(
        `Param ${param} should be '${correctType}'. Check Input!`,
        { variant: 'error' }
      );
      return isValid;
    }
    // Valid, and update new value
    if (newValue) {
      setNewParams({ ...newParams, [param]: newValue });
    } 
    return isValid;
  };

  const updateParamsHandler = () => {
    // Check Empty
    if (Object.keys(newParams).length === 0) {
      enqueueSnackbar('No Params Changed', { variant: 'info' });
      return;
    }

    // 1. Validate all updated field
    let allPassed = true;
    for (const param in newParams) {
      allPassed = allPassed && validateAndTranslateData(param);
    }
    if(!allPassed) return

    // 2. Submit Request via Websocket
    const data = {
      request: {...newParams}
    };
    console.log("Data Submitted::", data)
    publishMessage(data)
    enqueueSnackbar('Requested', { variant: 'info' });
    setNewParams({})
  };

  // CHECK NEW PARAMS
  useEffect(() => {
  }, [newParams]);

  return (
    <>
      {params.length === 0 ? (
        <Typography>Loading Params...</Typography>
      ) : (
        <Card>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <CardHeader title="PARAMS" />
            </Grid>
            <Grid item xs={4}>
              <Button
                variant="contained"
                style={{ marginTop: '1rem' }}
                onClick={updateParamsHandler}
              >
                UPDATE PARAMS
              </Button>
            </Grid>
          </Grid>

          <CardContent>
            <TableContainer component={Paper}>
              <Table
                sx={{ minWidth: 300, maxWidth: 600 }}
                aria-label="simple table"
              >
                <TableHead>
                  <TableRow>
                    <TableCell align="center">Title</TableCell>
                    <TableCell align="center">Value</TableCell>
                    <TableCell align="center">Type</TableCell>
                    <TableCell align="center">New Value</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {params.map((item) => (
                    <TableRow
                      key={item[0]}
                      sx={{
                        '&:last-child td, &:last-child th': { border: 0 },
                      }}
                    >
                      <TableCell component="th" scope="row" align="right">
                        {item[0]}
                      </TableCell>
                      <TableCell component="th" scope="row" align="right">
                        {item[1].toString()}
                      </TableCell>
                      <TableCell component="th" scope="row" align="right">
                        {item[2]}
                      </TableCell>
                      <TableCell component="th" scope="row" align="right">
                        {generateNewValueField(item)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default Params;
