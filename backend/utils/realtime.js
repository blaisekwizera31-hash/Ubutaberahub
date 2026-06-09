import jwt from "jsonwebtoken";
import { WebSocketServer } from "ws";
import pool from "../config/db.js";

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

      socket.on("message", async (raw) => {
        try {
          const payload = JSON.parse(raw.toString());
          if (payload.type !== "typing" || !payload.conversationId) return;

          const { rows } = await pool.query(
            "SELECT user_id FROM conversation_participants WHERE conversation_id = $1",
            [payload.conversationId],
          );

          const isParticipant = rows.some((row) => row.user_id === userId);
          if (!isParticipant) return;

          for (const row of rows) {
            if (row.user_id === userId) continue;
            sendRealtimeToUser(row.user_id, {
              type: "typing",
              conversationId: payload.conversationId,
              userId,
              isTyping: payload.isTyping === true,
            });
          }
        } catch {}
      });

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
