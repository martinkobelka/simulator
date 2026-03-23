const { WebSocket } = require('ws');

// Serialise once and send to every open connection
function broadcast(clients, message) {
  const data = JSON.stringify(message);
  for (const ws of clients) {
    if (ws.readyState === WebSocket.OPEN) { // skip clients that are connecting/closing
      ws.send(data);
    }
  }
}

module.exports = { broadcast };
