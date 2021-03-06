// require('console-stamp')(console, '[HH:MM:ss.l]');
// import nc from 'next-connect';
const nc = require('next-connect')
const findFreePort = require('find-free-port')
const amqp = require('amqplib');
const WebSocketServer = require('ws');
const zlib = require('zlib');

const handler = nc();

handler.get(async (req, res) => {
  // API Param -> `SERVER_ID` in Aioquant config.
  const id = req.query.id;

  // Find a free port
  let freePort; //
  let wsEndpoint;
  findFreePort(30000, 33000, (err, _freeport) => {
    if (err) {
      console.error('FATAL: Find Free Port Failed: ', err);
      res.send({ isSuccess: false, wsEndpoint: '' }); // Fail to get to Websocket Endpoint.
      return;
    }
    freePort = _freeport;

    wsEndpoint = `ws://127.0.0.1:${freePort}/`;
    const wss = new WebSocketServer.Server({ port: freePort });
  
    // RabbitMQ config
    const RABBITMQ_URL = 'amqp://localhost:5672/';
    const exchange = 'Command';
    const queuePublish = `${id}.Command.WEBSOCKET2AIOQ`;
    const queueSubscribe = `${id}.Command.AIOQ2WEBSOCKET`;
    const routingKey = id;
    let channelPublish;
    let channelSubscribe;
  
    const init = async () => {
      // TCP connection
      const connection = await amqp.connect(RABBITMQ_URL);
  
      // Channel Publish
      channelPublish = await connection.createChannel();
      await channelPublish.assertQueue(queuePublish, {
        durable: false,
        autoDelete: true,
      });
      await channelPublish.assertExchange(exchange, 'topic', { durable: true });
  
      // Channel Subscribe
      channelSubscribe = await connection.createChannel();
      await channelSubscribe.assertQueue(queueSubscribe, {
        durable: false,
        autoDelete: true,
      });
      await channelSubscribe.assertExchange(exchange, 'topic', { durable: true });
      await channelSubscribe.bindQueue(queueSubscribe, exchange, routingKey);
      console.log('Websocket API Ready, waiting for client connection');
  
      wss.on('connection', (ws) => {
        console.log('Websocket client connected!');
  
        try {
          // Receive Message from backend, send it to frontend
          channelSubscribe.consume(
            '',
            (buffer) => {
              zlib.inflate(buffer.content, (err, decompressedData) => {
                if (err) {
                  console.error(err);
                  return;
                }
                const _message = JSON.parse(decompressedData.toString('utf8'));
                if (_message.d.t === 'frontend') {
                  // Send to all connected clients
                  const data = JSON.stringify(_message);
                  wss.clients.forEach((client) => {
                    if (
                      client !== ws &&
                      client.readyState === WebSocketServer.OPEN
                    ) {
                      client.send(data);
                    }
                  });
                }
              });
            },
            { noAck: true }
          );
        } catch (err) {
          console.error(err);
        }
  
        // Receive Message from frontend, send it to backend via RabbitMQ.
        ws.on('message', (rawData) => {
          try {
            // rawData is String; msg is an Object
            const msg = JSON.parse(rawData);
            // make sure the msg's target is backend.
            if (msg.d.t !== 'backend') return;
            // console.log(`Client has sent us AND will be forwarded to the backend:`, msg);
            // const msg = demoMessage
            const _message = Buffer.from(JSON.stringify(msg));
            zlib.deflate(_message, (err, compressedData) => {
              if (err) {
                console.error('Error in zlib.deflate');
                console.error(err);
                return;
              }
              channelPublish.publish(exchange, routingKey, compressedData);
              // console.log('Msg sent to Backend via Websocket Server!!');
            });
          } catch (error) {
            console.error('Error on ws-message');
            console.error(error);
          }
        });
  
        // handling what to do when clients disconnects from server
        ws.on('close', () => {
          console.log('Websocket client disconnected');
        });
  
        // handling client connection error
        ws.onerror = function () {
          console.log('Websocket Error occured!');
        };
      });
  
    };
  
    init();
    res.send({ isSuccess: true, wsEndpoint: wsEndpoint });
  });

});

export default handler;


