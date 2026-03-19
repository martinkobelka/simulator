const { WebSocketServer } = require('ws');
const SimulationEngine = require('./SimulationEngine');
const { broadcast } = require('./broadcast');
const logger = require('./logger');

const { PORT: DEFAULT_PORT } = require('./constants');
const argv = require('minimist')(process.argv.slice(2), { alias: { p: 'port' }, default: { port: DEFAULT_PORT } });
const PORT = argv.port;
const wss = new WebSocketServer({ port: PORT });

const engine = new SimulationEngine((event) => {
  const clientCount = wss.clients.size;
  logger.broadcast(event.type, `→ ${clientCount} client(s)` + (event.id ? ` | id=${event.id}` : ''));
  broadcast(wss.clients, event);
});

wss.on('connection', (ws, req) => {
  const ip = req.socket.remoteAddress;
  logger.connect(`ip=${ip} | total=${wss.clients.size}`);

  const snapshot = engine.getSnapshot();
  ws.send(JSON.stringify({ type: 'INIT', ...snapshot }));
  logger.send('INIT', `entities=${snapshot.entities.length} | simState=${snapshot.simState}`);

  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw);
      logger.recv(msg.type, msg.entityId ? `entityId=${msg.entityId}` : '');
      engine.handleCommand(msg);
    } catch (e) {
      logger.error(`Invalid message: ${e.message}`);
    }
  });

  ws.on('close', () => {
    logger.disconnect(`total=${wss.clients.size}`);
  });
});

logger.engine(`WebSocket server running on ws://localhost:${PORT}`);
