const amqp = require('amqplib');
const WebSocketServer = require('ws');
const zlib = require('zlib');

const wss = new WebSocketServer.Server({ port: 8080 });

// RabbitMQ config
const RABBITMQ_URL = 'amqp://localhost:5672/';
const exchange = 'Command';
const queuePublish = 'USDT_ARBITRAGE_SERVER.Command.WEBSOCKET2AIOQ';
const queueSubscribe = 'USDT_ARBITRAGE_SERVER.Command.AIOQ2WEBSOCKET';

const demoMessage = {
  n: 'CommandExchange',
  d: {
    t: 'frontend',
    m: {
      main: 'this message is sent from nodejs',
    },
    ts: 11,
  },
};





let channelPublish;
let channelSubscribe;

// init RabbitMQ
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
  await channelSubscribe.bindQueue(queueSubscribe, exchange, '');
};
init();

wss.on('connection', (ws) => {
  console.log("Websocket client connected!")
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
          console.log("Websocket server received message from backend, Will sent it to frontend");
          console.log(_message);
          ws.send(JSON.stringify(_message)); 
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
      console.log(`Client has sent us:`, msg);
      // const msg = demoMessage
      const _message = Buffer.from(JSON.stringify(msg));
      zlib.deflate(_message, (err, compressedData) => {
        if (err) {
          console.error('Error in zlib.deflate');
          console.error(err);
          return;
        }
        channelPublish.publish(exchange, '', compressedData);
        console.log('Msg sent to Backend via Websocket Server!!');
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
