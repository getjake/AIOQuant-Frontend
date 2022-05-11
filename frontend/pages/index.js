import dynamic from 'next/dynamic';
import React, { useState, useCallback, useEffect } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import Header from 'components/Header';
import NavBar from 'components/NavBar';
import Status from 'components/Status';
import Params from 'components/Params';
import Logging from 'components/Logging'
import {
  Grid,
} from '@mui/material';
import { useSnackbar } from 'notistack';

const Home = () => {
  //@DEBUG
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  // Websocket Endpoint
  const socketUrl = 'ws://localhost:8080/';
  const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl, {
    onOpen: () => {
      // do something when Websocket Connected!
    },
    shouldReconnect: (closeEvent) => true,
    onReconnectStop: 10000,
    reconnectAttempts: 10000,
    reconnectInterval: 1000, // 1 SEC
  });

  // ****** States *******

  // Message Structure from Backend - Info received from backend
  const [strategy, setStrategy] = useState('DEMO_STRATEGY')
  const [loggingHistory, setLoggingHistory] = useState([])
  const [updatedTimestamp, setUpdatedTimestamp] = useState(0);
  const [wsConnectionStatus, setWsConnectionStatus] = useState('DISCONNECTED');
  const [status, setStatus] = useState([]);
  const [params, setParams] = useState([]);
  const [response, setResponse] = useState({});
  const [logging, setLogging] = useState({});
  const [newParams, setNewParams] = useState({});  // Command to be sent to backend

  // Update Connection Status
  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }[readyState];

  useEffect(() => {
    if (connectionStatus === 'Open') setWsConnectionStatus('CONNECTED');
    if (connectionStatus === 'Closed') setWsConnectionStatus('DISCONNECTED');
    if (connectionStatus === 'Connectiong')
      setWsConnectionStatus('CONNECTING...');
  }, [connectionStatus]);

  // ****** Functions *******
  const publishMessage = (content) => {
    // Publish Message to Backend via Websocket - Low-level function
    const message = {
      n: 'CommandExchange',
      d: {
        t: 'backend',
        m: {
          ...content,
        },
        ts: Math.floor(Date.now() / 1000),
      },
    };
    sendMessage(JSON.stringify(message));
  };

  useEffect(() => {
    // Deal with the message from backend.
    if (lastMessage !== null) {
      const data = JSON.parse(lastMessage.data);
      const target = data.d.t;
      if (target !== 'frontend') return; // Not the message to frontend.
      const currTimestamp = Math.floor(Date.now() / 1000);
      const receivedTimestamp = data.d.ts;
      setUpdatedTimestamp(receivedTimestamp);
      if (currTimestamp - receivedTimestamp > 5) {
        console.warn(
          'Msg Received From Backend is outside the Recv Window, ABANDON the data!'
        );
        return;
      }
      const message = data.d.m;
      const msgProperties = Object.getOwnPropertyNames(message);
      if (msgProperties.includes('status')) {
        const _status = Object.keys(message.status).map((key) => [
          key,
          message.status[key].toString(),
        ]);
        setStatus(_status);
      }
      if (msgProperties.includes('params')) {
        setParams(message.params);
      }
      if (msgProperties.includes('response')) {
        setResponse(message.response);
      }
      if (msgProperties.includes('logging')) {
        const logLevel = message.logging.level.toUpperCase()
        const logMsg = message.logging.msg
        const logTime = new Date(message.logging.ts*1000).toLocaleTimeString('zh-CN')
        setLogging({logLevel, logMsg, logTime});
      }

    }
  }, [lastMessage]);

  useEffect(()=>{
    const _newLoggingHistory = [logging].concat(loggingHistory).slice(0, 100)
    setLoggingHistory(_newLoggingHistory)
  },[logging])

  useEffect(() => {
    if (response === 'success') {
      enqueueSnackbar('Update Params successfully', { variant: 'success' });
    }
  }, [response]);

  return (
    <>
      <Header title="aioqauntTitle" />
      <NavBar
        strategy={strategy}
        setStrategy={setStrategy}
        wsConnectionStatus={wsConnectionStatus}
        updatedTimestamp={updatedTimestamp}
      />
      {/* Main Content */}
      <Grid container spacing={2} style={{ marginTop: '0.5rem' }}>
        <Grid item xs={12} md={6} lg={4}>
          <Status status={status} />
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <Params
            params={params}
            newParams={newParams}
            setNewParams={setNewParams}
            publishMessage={publishMessage}
          />
        </Grid>
        <Grid item  xs={12} md={12} lg={4}>
          <Logging loggingHistory={loggingHistory} setLoggingHistory={setLoggingHistory}/>
        </Grid>
      </Grid>
    </>
  );
};

// export default Home;

export default dynamic(() => Promise.resolve(Home), { ssr: false });
