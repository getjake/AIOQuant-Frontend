import React, { useEffect, useState } from 'react';
import {
  Button,
  Card,
  CardHeader,
  CardContent,
  Grid,
  Typography,
  TextareaAutosize,
} from '@mui/material';

const Logging = ({ loggingHistory, setLoggingHistory }) => {
  const [loggingText, setLoggingText] = useState('');

  useEffect(() => {
    if (loggingHistory.length < 1) return;
    const _loggingText = loggingHistory.map(
      (log) => `${log.logTime}:${log.logLevel}:: ${log.logMsg}\n\n`
    );
    setLoggingText(_loggingText);
  }, [loggingHistory]);

  return (
    <Card>
      <Grid container spacing={2}>
        <Grid item xs={4}>
          <CardHeader title="LOGGING" />
        </Grid>
        <Grid item xs={4}>
          <Button
            variant="contained"
            style={{ marginTop: '1rem' }}
            onClick={() => {
              setLoggingHistory([]);
            }}
          >
            CLEAR LOGS
          </Button>
        </Grid>
      </Grid>

      <CardContent>
        <TextareaAutosize
          aria-label="minimum height"
          minRows={5}
          placeholder="Logging"
          aria-multiline
          maxRows={30}
          style={{ minWidth: 450, maxLines: 20 }}
          value={loggingText}
        />
      </CardContent>
    </Card>
  );
};

export default Logging;
