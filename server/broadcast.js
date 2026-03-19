const { WebSocket } = require('ws');

function broadcast(clients, message) {
  const data = JSON.stringify(message);
  for (const ws of clients) {
    if (ws.readyState === WebSocket.OPEN) ws.send(data);
  }
}

module.exports = { broadcast };
