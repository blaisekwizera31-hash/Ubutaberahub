import jwt from "jsonwebtoken";
import { WebSocketServer } from "ws";

const clientsByUser = new Map();

function sendJson(socket, payload) {
  if (socket.readyState === 1) {
    socket.send(JSON.stringify(payload));
  }
}

export function setupRealtime(server) {
  const wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (socket, req) => {
    try {
      const url = new URL(req.url, "http://localhost");
      const token = url.searchParams.get("token");
      if (!token) {
        socket.close(1008, "Missing token");
        return;
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
      const userId = decoded.id || decoded.userId;
      if (!userId) {
        socket.close(1008, "Invalid token");
        return;
      }

      if (!clientsByUser.has(userId)) clientsByUser.set(userId, new Set());
      clientsByUser.get(userId).add(socket);
      sendJson(socket, { type: "connected" });

      socket.on("close", () => {
        const sockets = clientsByUser.get(userId);
        if (!sockets) return;
        sockets.delete(socket);
        if (sockets.size === 0) clientsByUser.delete(userId);
      });
    } catch {
      socket.close(1008, "Unauthorized");
    }
  });
}

export function sendRealtimeToUser(userId, payload) {
  const sockets = clientsByUser.get(userId);
  if (!sockets) return;
  for (const socket of sockets) sendJson(socket, payload);
}
