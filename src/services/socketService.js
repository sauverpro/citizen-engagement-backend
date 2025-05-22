// server/services/socketService.js
import { WebSocketServer } from 'ws';

let wss;
const clients = new Set();

export const initWebSocket = (server) => {
  wss = new WebSocketServer({ server });
  wss.on('connection', (ws) => {
    clients.add(ws);
    ws.on('close', () => clients.delete(ws));
    ws.on('message', (message) => {
      // Optionally handle incoming messages (e.g., subscribe to complaintId)
      // For now, just echo or ignore
    });
  });
};

export const broadcastUpdate = (complaintId, status, extra = {}) => {
  const message = JSON.stringify({
    type: 'STATUS_UPDATE',
    complaintId,
    status,
    timestamp: new Date(),
    ...extra
  });
  broadcast(message);
};

export const broadcast = (message) => {
  if (!wss) return;
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
};

export const sendToClient = (ws, data) => {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  }
};

